package expo.modules.shakesound

import android.content.Context
import android.graphics.Color
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.MediaPlayer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.sqrt

class ShakeSoundModule : Module() {
  // Held in a field so it isn't garbage-collected mid-playback. (Invariant.)
  private var player: MediaPlayer? = null

  // Session 2 — shake detection state.
  private var lastShake = 0L

  // The only tuning knobs. Don't restructure detection around them.
  private val shakeThreshold = 2.5   // in g
  private val cooldownMs = 500L      // 500 ms between shakes

  private val sensorManager: SensorManager?
    get() = appContext.reactContext
      ?.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

  private val listener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent) {
      // SensorManager reports m/s². Divide by GRAVITY_EARTH to normalise to g,
      // so the > 2.5 threshold means the same thing as it does on iOS.
      // DO NOT REMOVE this division — it's load-bearing cross-platform.
      val g = SensorManager.GRAVITY_EARTH
      val x = event.values[0] / g
      val y = event.values[1] / g
      val z = event.values[2] / g
      val magnitude = sqrt(x * x + y * y + z * z)
      val now = System.currentTimeMillis()
      if (magnitude > shakeThreshold && now - lastShake > cooldownMs) {
        lastShake = now
        // Native only senses. It reports how hard; JS decides what to play.
        sendEvent("onShake", mapOf("intensity" to magnitude))
      }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  }

  override fun definition() = ModuleDefinition {
    Name("ShakeSound")

    // ─────────────────── SESSION 1 — Functions & AsyncFunctions ───────────────────

    // JS → native, synchronous. Fire-and-forget: play a bundled clip by name.
    Function("playSound") { name: String ->
      val resId = rawResId(name)
      if (resId != 0) {
        player?.release()
        player = MediaPlayer.create(appContext.reactContext, resId)?.apply {
          setOnCompletionListener { it.release() }
          start()
        }
      }
    }

    // JS → native, returns a Promise. Native reports which of the requested
    // names are actually bundled here; JS owns the choice of what to play.
    AsyncFunction("filterAvailable") { names: List<String> ->
      names.filter { rawResId(it) != 0 }
    }

    // ─────────────────── SESSION 2 — Events (native → JS) ───────────────────

    Events("onShake")

    // Sensor lifecycle: the accelerometer runs only while JS has a listener.
    OnStartObserving {
      val sm = sensorManager ?: return@OnStartObserving
      val accelerometer = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        ?: return@OnStartObserving
      sm.registerListener(listener, accelerometer, SensorManager.SENSOR_DELAY_GAME)
    }
    OnStopObserving {
      sensorManager?.unregisterListener(listener)
    }

    // ─────────────────── SESSION 2 — Native view ───────────────────

    View(ShakeMeterView::class) {
      Prop("level") { view: ShakeMeterView, level: Float ->
        view.setLevel(level)
      }
      // JS sends a color string (e.g. "#ff3b30"); parse it here. (iOS's UIColor
      // prop parses strings natively; Android's Int does not, so we do it.)
      Prop("barColor") { view: ShakeMeterView, color: String ->
        view.setBarColor(Color.parseColor(color))
      }
    }
  }

  // Clips live in android/src/main/res/raw (lowercase names). Module resources
  // merge into the host app, so we resolve them under the app's package.
  private fun rawResId(name: String): Int {
    val context = appContext.reactContext ?: return 0
    return context.resources.getIdentifier(name, "raw", context.packageName)
  }
}
