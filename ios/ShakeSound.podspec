Pod::Spec.new do |s|
  s.name           = 'ShakeSound'
  s.version        = '1.0.0'
  s.summary        = 'Shake the phone to play a random meme sound.'
  s.description    = 'Teaching-demo Expo module: accelerometer + audio + a native meter view.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"

  # Meme clips are copied into the app bundle so `Bundle.main` finds them by name.
  # Drop <name>.mp3 files (matching MEME_SOUNDS) into ios/Resources/.
  s.resources = "Resources/*.mp3"
end
