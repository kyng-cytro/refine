import * as Haptics from "expo-haptics"

export const withHaptics =
  <T extends unknown[]>(
    fn: (...args: T) => void,
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ) =>
  (...args: T) => {
    Haptics.impactAsync(style)
    fn(...args)
  }
