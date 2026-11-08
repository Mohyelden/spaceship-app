import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/** Game logo: friendly rocket */
export function RocketLogo({ size = 120, flame = true }: { size?: number; flame?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {flame ? (
        <G>
          <Path d="M48 92 Q60 122 72 92 Z" fill="#FF8A3D" />
          <Path d="M53 92 Q60 112 67 92 Z" fill="#FFD84D" />
        </G>
      ) : null}
      <Path d="M38 70 L24 92 L44 88 Z" fill="#F25F5C" />
      <Path d="M82 70 L96 92 L76 88 Z" fill="#F25F5C" />
      <Path d="M60 8 C84 26 88 60 80 92 L40 92 C32 60 36 26 60 8 Z" fill="#FFFFFF" />
      <Path d="M60 8 C70 16 76 26 79 36 L41 36 C44 26 50 16 60 8 Z" fill="#F25F5C" />
      <Circle cx="60" cy="56" r="13" fill="#38BDF8" stroke="#1E1A4D" strokeWidth="4" />
      <Circle cx="55" cy="51" r="4" fill="#FFFFFF" opacity={0.85} />
      <Rect x="52" y="80" width="16" height="12" rx="3" fill="#8B5CF6" />
    </Svg>
  );
}

/** Mascot: the ship's robot co-pilot who talks to the child */
export function Robot({ size = 56, mood = 'happy' }: { size?: number; mood?: 'happy' | 'think' | 'oops' }) {
  const mouth =
    mood === 'happy' ? 'M22 40 Q32 48 42 40' : mood === 'oops' ? 'M24 44 Q32 38 40 44' : 'M24 42 L40 42';
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x="30" y="2" width="4" height="10" rx="2" fill="#C9C3F5" />
      <Circle cx="32" cy="4" r="4" fill="#FFC83D" />
      <Rect x="6" y="12" width="52" height="44" rx="16" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="3" />
      <Rect x="12" y="20" width="40" height="28" rx="10" fill="#1E1A4D" />
      <Ellipse cx="24" cy="31" rx="5" ry={mood === 'think' ? 3 : 5} fill="#38BDF8" />
      <Ellipse cx="40" cy="31" rx="5" ry={mood === 'think' ? 3 : 5} fill="#38BDF8" />
      <Path d={mouth} stroke="#FFC83D" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Rect x="0" y="28" width="6" height="14" rx="3" fill="#8B5CF6" />
      <Rect x="58" y="28" width="6" height="14" rx="3" fill="#8B5CF6" />
    </Svg>
  );
}

/** Planet used on the map (locked / open / done) */
export function Planet({
  size = 96,
  color,
  ring,
}: {
  size?: number;
  color: string;
  ring?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {ring ? (
        <Ellipse cx="50" cy="56" rx="48" ry="14" fill="none" stroke="#FFE9A8" strokeWidth="5" opacity={0.85} />
      ) : null}
      <Circle cx="50" cy="50" r="34" fill={color} />
      <Circle cx="38" cy="38" r="9" fill="#FFFFFF" opacity={0.18} />
      <Circle cx="62" cy="62" r="6" fill="#000000" opacity={0.12} />
      <Circle cx="66" cy="40" r="4" fill="#000000" opacity={0.1} />
      {ring ? (
        <Path d="M2 56 Q50 80 98 56" fill="none" stroke="#FFE9A8" strokeWidth="5" opacity={0.95} />
      ) : null}
    </Svg>
  );
}
