import { useState } from 'react';
import { View } from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';

import { formatCents, type Cents } from '@/lib/money';
import { useTheme } from '@/theme';

import { AppText } from '../AppText';

export type BarGroup = {
  label: string;
  income: Cents;
  expense: Cents;
};

export type BarChartProps = {
  groups: readonly BarGroup[];
  height?: number;
};

/**
 * Receitas e despesas lado a lado, por período.
 *
 * As duas barras dividem a mesma escala. Escalas independentes fariam uma
 * despesa pequena parecer do tamanho de uma receita grande, que é justamente a
 * comparação que o gráfico existe para permitir.
 */
export function BarChart({ groups, height = 160 }: BarChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const max = Math.max(
    1,
    ...groups.map((group) => Math.max(group.income, group.expense)),
  );

  const slot = groups.length > 0 && width > 0 ? width / groups.length : 0;
  const barWidth = slot > 0 ? Math.min(18, slot / 3) : 0;
  const plot = height - 24;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={groups
        .map(
          (group) =>
            `${group.label}: receitas ${formatCents(group.income)}, despesas ${formatCents(group.expense)}`,
        )
        .join('. ')}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ gap: theme.spacing.xs }}
    >
      {width > 0 && (
        <Svg width={width} height={plot}>
          {groups.map((group, index) => {
            const center = slot * index + slot / 2;
            const incomeHeight = (group.income / max) * plot;
            const expenseHeight = (group.expense / max) * plot;

            return (
              <G key={group.label}>
                <Rect
                  x={center - barWidth - 2}
                  y={plot - incomeHeight}
                  width={barWidth}
                  height={incomeHeight}
                  rx={3}
                  fill={theme.colors.income}
                />
                <Rect
                  x={center + 2}
                  y={plot - expenseHeight}
                  width={barWidth}
                  height={expenseHeight}
                  rx={3}
                  fill={theme.colors.expense}
                />
              </G>
            );
          })}
        </Svg>
      )}

      <View style={{ flexDirection: 'row' }}>
        {groups.map((group) => (
          <AppText
            key={group.label}
            variant="caption"
            tone="subtle"
            style={{ flex: 1, textAlign: 'center' }}
            numberOfLines={1}
          >
            {group.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}
