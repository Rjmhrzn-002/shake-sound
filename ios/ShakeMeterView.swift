import ExpoModulesCore
import UIKit

// SESSION 2 — Native view.
// A bar whose fill height tracks `level` (0–1) and whose colour comes from JS
// via `barColor`. It senses nothing; JS drives it from the shake intensity.
class ShakeMeterView: ExpoView {
  private let track = UIView()
  private let fill = UIView()

  var level: CGFloat = 0 {
    didSet { setNeedsLayout() }
  }

  var barColor: UIColor = .systemRed {
    didSet { fill.backgroundColor = barColor }
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    track.backgroundColor = .secondarySystemFill
    track.layer.cornerRadius = 8
    fill.backgroundColor = barColor
    fill.layer.cornerRadius = 8
    addSubview(track)
    addSubview(fill)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    track.frame = bounds
    let clamped = max(0, min(1, level))
    let filledHeight = bounds.height * clamped
    // Grow the fill up from the bottom.
    fill.frame = CGRect(
      x: 0,
      y: bounds.height - filledHeight,
      width: bounds.width,
      height: filledHeight
    )
  }
}
