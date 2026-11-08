import { TextStyle } from 'react-native';

export const fonts = {
  display: 'Amiri_700Bold',
  displayRegular: 'Amiri_400Regular',
  body: 'Cairo_500Medium',
  bodyBold: 'Cairo_700Bold',
  bodyExtra: 'Cairo_800ExtraBold',
  bodyLight: 'Cairo_400Regular',
};

export const type = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 56,
    textAlign: 'center',
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.bodyExtra,
    fontSize: 26,
    lineHeight: 36,
    textAlign: 'center',
  } satisfies TextStyle,
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
  } satisfies TextStyle,
  button: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.bodyLight,
    fontSize: 12,
    lineHeight: 18,
  } satisfies TextStyle,
};
