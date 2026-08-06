import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { formatCents, ZERO, type Cents } from '@/lib/money';
import { useTheme } from '@/theme';

import { AppText } from '../AppText';
import { areaPath, linePath, scalePoints } from './geometry';

export type TrendChartProps = {
  values: readonly Cents[];
  height?: number;
  /** Descrição lida por leitor de tela no lugar do desenho. */
  label: string;
};

/**
 * Evolução ao longo do período.
 *
 * O gráfico é um resumo visual, não a fonte da informação: o valor final
 * aparece escrito ao lado, e a descrição textual completa vai para o leitor de
 * tela. Quem não enxerga o traçado não perde nada essencial.
 */
export function TrendChart({ values, height = 120, label }: TrendChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const last = values[values.length - 1] ?? ZERO;
  const negative = last < 0;
  const stroke = negative ? theme.colors.expense : theme.colors.income;

  // A altura útil é menor que a caixa para o traço não ser cortado na borda.
  const padding = 6;
  const inner = height - padding * 2;
  const points = width > 0 ? scalePoints([...values], width, inner) : [];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}. Valor final ${formatCents(last)}.`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ height }}
    >
      {width > 0 && points.length > 1 && (
        <Svg width={width} height={height}>
          <Line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={theme.colors.border}
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          <Path
            d={areaPath(
              points.map((point) => ({ x: point.x, y: point.y + padding })),
              height,
            )}
            fill={stroke}
            fillOpacity={0.12}
          />

          <Path
            d={linePath(
              points.map((point) => ({ x: point.x, y: point.y + padding })),
            )}
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {points.length > 0 && (
            <Circle
              cx={points[points.length - 1]?.x ?? 0}
              cy={(points[points.length - 1]?.y ?? 0) + padding}
              r={4}
              fill={stroke}
            />
          )}
        </Svg>
      )}

      {points.length <= 1 && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <AppText variant="caption" tone="subtle">
            Ainda não há movimento suficiente para desenhar a evolução.
          </AppText>
        </View>
      )}
    </View>
  );
}
