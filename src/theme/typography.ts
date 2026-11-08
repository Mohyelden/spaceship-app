import { TextStyle } from 'react-native';

export const fonts = {
  regular: 'Cairo_500Medium',
  bold: 'Cairo_700Bold',
  black: 'Cairo_800ExtraBold',
  light: 'Cairo_400Regular',
};

export const text = {
  hero: { fontFamily: fonts.black, fontSize: 40, lineHeight: 58, textAlign: 'center' } satisfies TextStyle,
  title: { fontFamily: fonts.black, fontSize: 24, lineHeight: 38, textAlign: 'center' } satisfies TextStyle,
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 30, textAlign: 'center' } satisfies TextStyle,
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26 } satisfies TextStyle,
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 } satisfies TextStyle,
  button: { fontFamily: fonts.black, fontSize: 18, lineHeight: 28 } satisfies TextStyle,
  number: { fontFamily: fonts.black, fontSize: 26, lineHeight: 36 } satisfies TextStyle,
};
