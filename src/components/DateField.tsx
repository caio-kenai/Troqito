import { useState } from 'react';
import { View } from 'react-native';

import {
  type CalendarDate,
  formatBR,
  fromCalendarDate,
  isCalendarDate,
  toCalendarDate,
  today,
} from '@/lib/date';
import { useTheme } from '@/theme';

import { Button } from './Button';
import { TextField } from './TextField';

export type DateFieldProps = {
  label: string;
  /** Sempre no formato `AAAA-MM-DD`, mesmo que a exibição seja brasileira. */
  value: CalendarDate;
  onChange: (value: CalendarDate) => void;
  error?: string | undefined;
};

function shiftDays(from: CalendarDate, days: number): CalendarDate {
  const date = fromCalendarDate(from);
  date.setDate(date.getDate() + days);
  return toCalendarDate(date);
}

/** Converte `05/03/2026` para `2026-03-05`; devolve nulo se não for uma data. */
function parseBR(input: string): CalendarDate | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!match) return null;

  const candidate = `${match[3]}-${match[2]}-${match[1]}`;
  return isCalendarDate(candidate) ? candidate : null;
}

/**
 * Data no formato brasileiro na tela, ISO no estado.
 *
 * Os atalhos existem porque a esmagadora maioria dos lançamentos é registrada
 * no mesmo dia ou no seguinte — digitar a data inteira seria atrito à toa.
 */
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const theme = useTheme();
  const [text, setText] = useState(() => formatBR(value));

  const apply = (next: CalendarDate) => {
    setText(formatBR(next));
    onChange(next);
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <TextField
        label={label}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        value={text}
        onChangeText={setText}
        onBlur={() => {
          const parsed = parseBR(text);
          if (parsed) {
            apply(parsed);
          } else {
            // Entrada inválida volta ao último valor bom, em vez de deixar o
            // formulário em um estado que não dá para salvar.
            setText(formatBR(value));
          }
        }}
        error={error}
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Button label="Hoje" variant="ghost" onPress={() => apply(today())} />
        <Button
          label="Ontem"
          variant="ghost"
          onPress={() => apply(shiftDays(today(), -1))}
        />
      </View>
    </View>
  );
}
