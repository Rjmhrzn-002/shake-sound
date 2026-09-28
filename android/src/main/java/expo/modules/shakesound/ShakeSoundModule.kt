package expo.modules.shakesound

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ShakeSoundModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ShakeSound")

    Events("onChange")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    View(ShakeSoundView::class) {
    }
  }
}
