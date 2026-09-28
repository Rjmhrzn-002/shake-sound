import ExpoModulesCore

public class ShakeSoundModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ShakeSound")

    Events("onChange")

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    View(ShakeSoundView.self) {
    }
  }
}
