package expo.modules.shakesound

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

// SESSION 2 — Native view.
// A bar whose fill height tracks `level` (0–1), painted in `barColor`.
// Pure presentation, driven from JS.
class ShakeMeterView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var level = 0f
  private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.parseColor("#33000000")
  }
  private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.RED
  }

  init {
    // ExpoView is a ViewGroup, which skips onDraw by default. Opt back in so
    // our custom drawing runs. (Invariant — keep this.)
    setWillNotDraw(false)
  }

  fun setLevel(value: Float) {
    level = value.coerceIn(0f, 1f)
    invalidate()
  }

  fun setBarColor(color: Int) {
    fillPaint.color = color
    invalidate()
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val w = width.toFloat()
    val h = height.toFloat()
    val radius = 16f
    // Track.
    canvas.drawRoundRect(RectF(0f, 0f, w, h), radius, radius, trackPaint)
    // Fill, growing up from the bottom.
    val filledHeight = h * level
    canvas.drawRoundRect(RectF(0f, h - filledHeight, w, h), radius, radius, fillPaint)
  }
}
