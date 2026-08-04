import {
  cycleRangeFor,
  formatBR,
  fromCalendarDate,
  isCalendarDate,
  referenceMonth,
  toCalendarDate,
  today,
  withDayOfMonth,
} from '../calendarDate';

describe('validação', () => {
  it.each(['2026-01-01', '2026-02-28', '2024-02-29', '2026-12-31'])(
    'aceita a data válida %s',
    (value) => {
      expect(isCalendarDate(value)).toBe(true);
    },
  );

  // Sem a conferência de ida e volta, o date-fns normalizaria 31 de fevereiro
  // para 3 de março em vez de rejeitar.
  it.each([
    '2026-02-30',
    // 2026 não é bissexto: 29 de fevereiro não existe nesse ano.
    '2026-02-29',
    '2026-13-01',
    '2026-00-10',
    '2026-1-1',
    '01/01/2026',
    'ontem',
    '',
  ])('rejeita a data inválida %p', (value) => {
    expect(isCalendarDate(value)).toBe(false);
  });

  it('falha ao converter uma data inválida', () => {
    expect(() => fromCalendarDate('2026-02-30')).toThrow(/inválida/);
  });
});

describe('conversão e formatação', () => {
  it('converte para o padrão brasileiro', () => {
    expect(formatBR('2026-03-05')).toBe('05/03/2026');
  });

  it('mantém o dia ao converter de ida e volta', () => {
    expect(toCalendarDate(fromCalendarDate('2026-03-05'))).toBe('2026-03-05');
  });

  // O horário local não pode empurrar a data para o dia anterior.
  it('usa a data local, não o fuso universal', () => {
    const lateNight = new Date(2026, 2, 5, 23, 30);
    expect(toCalendarDate(lateNight)).toBe('2026-03-05');
  });

  it('devolve a data de hoje', () => {
    expect(today(new Date(2026, 7, 4))).toBe('2026-08-04');
  });

  it('extrai o mês de referência', () => {
    expect(referenceMonth('2026-03-05')).toBe('2026-03');
  });
});

describe('withDayOfMonth', () => {
  it('mantém o dia quando o mês comporta', () => {
    expect(toCalendarDate(withDayOfMonth(new Date(2026, 2, 1), 15))).toBe(
      '2026-03-15',
    );
  });

  // Um vencimento no dia 31 não pode pular fevereiro.
  it('encurta para o último dia em meses curtos', () => {
    expect(toCalendarDate(withDayOfMonth(new Date(2026, 1, 1), 31))).toBe(
      '2026-02-28',
    );
    expect(toCalendarDate(withDayOfMonth(new Date(2024, 1, 1), 31))).toBe(
      '2024-02-29',
    );
    expect(toCalendarDate(withDayOfMonth(new Date(2026, 3, 1), 31))).toBe(
      '2026-04-30',
    );
  });

  it('rejeita dia fora da faixa', () => {
    expect(() => withDayOfMonth(new Date(), 0)).toThrow(/Dia do mês inválido/);
    expect(() => withDayOfMonth(new Date(), 32)).toThrow(/Dia do mês inválido/);
  });
});

describe('cycleRangeFor', () => {
  it('usa o mês civil quando o ciclo começa no dia 1', () => {
    expect(cycleRangeFor('2026-03-15', 1)).toEqual({
      start: '2026-03-01',
      end: '2026-03-31',
    });
  });

  it('atravessa o mês quando a referência está antes do início', () => {
    expect(cycleRangeFor('2026-03-03', 5)).toEqual({
      start: '2026-02-05',
      end: '2026-03-04',
    });
  });

  it('começa no próprio dia de início', () => {
    expect(cycleRangeFor('2026-03-05', 5)).toEqual({
      start: '2026-03-05',
      end: '2026-04-04',
    });
  });

  it('trata o ciclo que passa pela virada do ano', () => {
    expect(cycleRangeFor('2026-01-03', 10)).toEqual({
      start: '2025-12-10',
      end: '2026-01-09',
    });
  });

  it('encurta o início em meses curtos', () => {
    expect(cycleRangeFor('2026-03-01', 31)).toEqual({
      start: '2026-02-28',
      end: '2026-03-30',
    });
  });

  // Propriedade que sustenta os relatórios: os ciclos não podem deixar buraco
  // nem se sobrepor, qualquer que seja o dia de início.
  it.each([1, 5, 10, 15, 28, 29, 30, 31])(
    'produz ciclos contíguos com início no dia %i',
    (startDay) => {
      let cursor = cycleRangeFor('2026-01-15', startDay);

      for (let month = 0; month < 14; month += 1) {
        const nextDay = fromCalendarDate(cursor.end);
        nextDay.setDate(nextDay.getDate() + 1);
        const next = cycleRangeFor(toCalendarDate(nextDay), startDay);

        expect(next.start).toBe(toCalendarDate(nextDay));
        expect(next.start > cursor.end).toBe(true);
        cursor = next;
      }
    },
  );

  it('rejeita dia de início inválido', () => {
    expect(() => cycleRangeFor('2026-03-01', 0)).toThrow(/ciclo inválido/);
  });
});
