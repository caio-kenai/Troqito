import { useEffect, useState } from 'react';
import { Animated, Easing, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export type SkeletonProps = {
  width?: ViewStyle['width'];
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({
  width = '100%',
  height = 16,
  radius,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  // Inicializador preguiçoso do useState: mantém o mesmo Animated.Value entre
  // renderizações sem ler uma ref durante a renderização.
  const [pulse] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.skeleton,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

/** Bloco de placeholder no formato de um item de lista de movimentações. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          style={{ flexDirection: 'row', gap: theme.spacing.md }}
        >
          <Skeleton width={40} height={40} radius={theme.radius.full} />
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}
