import type { StyleProp, ViewStyle } from 'react-native';

export type ShakeSoundModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type OnTapEventPayload = Record<string, never>;

export type ShakeSoundViewProps = {
  style?: StyleProp<ViewStyle>;
};
