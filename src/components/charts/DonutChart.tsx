import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { formatCents, type Cents } from '@/lib/money';
import { useTheme } from '@/theme';

import { AppText } from '../AppText';
import { donutSegments } from './geometry';
import { seriesColor } from './palette';

export type DonutSlice = {
  label: string;
  total: Cents;
  /** Fração de 0 a 1. */
  share: number;
};

export type DonutChartProps = {
  slices: readonly DonutSlice[];
  size?: number;
  /** Texto no centro da rosca. */
  centerLabel?: string;
  centerValue?: string;
};

/**
 * Distribuição em rosca, com legenda ao lado.
 *
 * A legenda traz o nome, o valor e a participação de cada fatia: a cor é o
 * atalho visual, não o portador da informação. Uma rosca sem legenda obriga
 * quem não distingue as cores a adivinhar qual fatia é qual.
 */
export function DonutChart({
  slices,
  size = 140,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const theme = useTheme();

  const center = size / 2;
  const radius = center;
  const thickness = size * 0.22;

  const paths = donutSegments(
    slices.map((slice) => slice.share),
    radius,
    thickness,
    center,
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xl,
      }}
    >
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={slices
          .map(
            (slice) =>
              `${slice.label}: ${formatCents(slice.total)}, ${Math.round(slice.share * 100)} por cento`,
          )
          .join('. ')}
        style={{ width: size, height: size }}
      >
        <Svg width={size} height={size}>
          <G>
            {paths.map((path, index) => (
              <Path
                key={slices[index]?.label ?? index}
                d={path}
                fill={seriesColor(theme, index)}
              />
            ))}
          </G>
        </Svg>

        {(centerLabel ?? centerValue) && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {centerValue && (
              <AppText variant="body" weight="bold" numeric>
                {centerValue}
              </AppText>
            )}
            {centerLabel && (
              <AppText variant="caption" tone="muted">
                {centerLabel}
              </AppText>
            )}
          </View>
        )}
      </View>

      <View style={{ flex: 1, gap: theme.spacing.sm }}>
        {slices.map((slice, index) => (
          <View
            key={`${slice.label}-${index}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: theme.radius.full,
                backgroundColor: seriesColor(theme, index),
              }}
            />
            <AppText variant="caption" style={{ flex: 1 }} numberOfLines={1}>
              {slice.label}
            </AppText>
            <AppText variant="caption" tone="muted" numeric>
              {Math.round(slice.share * 100)}%
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
