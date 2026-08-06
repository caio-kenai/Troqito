import {
  occurrencesUntil,
  pendingOccurrences,
  RecurrenceError,
  type Recurrence,
} from '../schedule';

function rule(partial: Partial<Recurrence> = {}): Recurrence {
  return {
    frequency: 'monthly',
    interval: 1,
    startDate: '2026-01-10',
    ...partial,
  };
}

describe('occurrencesUntil', () => {
  it('inclui a data inicial como primeira ocorrência', () => {
    const dates = occurrencesUntil(rule(), '2026-01-10');

    expect(dates).toEqual(['2026-01-10']);
  });

  it('avança mês a mês', () => {
    const dates = occurrencesUntil(rule(), '2026-04-30');

    expect(dates).toEqual([
      '2026-01-10',
      '2026-02-10',
      '2026-03-10',
      '2026-04-10',
    ]);
  });

  it('mantém o dia original depois de passar por um mês curto', () => {
    // Somar um mês à ocorrência anterior faria 31 virar 28 em fevereiro e
    // nunca mais voltar. A âncora é sempre a data inicial.
    const dates = occurrencesUntil(
      rule({ startDate: '2026-01-31' }),
      '2026-05-31',
    );

    expect(dates).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
      '2026-05-31',
    ]);
  });

  it('respeita o intervalo entre passos', () => {
    const dates = occurrencesUntil(rule({ interval: 3 }), '2026-08-01');

    expect(dates).toEqual(['2026-01-10', '2026-04-10', '2026-07-10']);
  });

  it('avança de sete em sete dias na frequência semanal', () => {
    const dates = occurrencesUntil(
      rule({ frequency: 'weekly', startDate: '2026-03-02' }),
      '2026-03-23',
    );

    expect(dates).toEqual([
      '2026-03-02',
      '2026-03-09',
      '2026-03-16',
      '2026-03-23',
    ]);
  });

  it('avança de quinze em quinze dias na quinzenal', () => {
    const dates = occurrencesUntil(
      rule({ frequency: 'biweekly', startDate: '2026-03-02' }),
      '2026-04-01',
    );

    expect(dates).toEqual(['2026-03-02', '2026-03-16', '2026-03-30']);
  });

  it('avança um ano na frequência anual', () => {
    const dates = occurrencesUntil(
      rule({ frequency: 'annual', startDate: '2026-05-20' }),
      '2029-01-01',
    );

    expect(dates).toEqual(['2026-05-20', '2027-05-20', '2028-05-20']);
  });

  it('para na data de término', () => {
    const dates = occurrencesUntil(
      rule({ endDate: '2026-03-01' }),
      '2026-12-31',
    );

    expect(dates).toEqual(['2026-01-10', '2026-02-10']);
  });

  it('para na quantidade máxima de ocorrências', () => {
    const dates = occurrencesUntil(rule({ occurrenceLimit: 2 }), '2026-12-31');

    expect(dates).toHaveLength(2);
  });

  it('não devolve nada quando o horizonte é anterior ao início', () => {
    expect(occurrencesUntil(rule(), '2025-12-31')).toEqual([]);
  });

  it('recusa intervalo zero, que geraria série infinita', () => {
    expect(() => occurrencesUntil(rule({ interval: 0 }), '2026-12-31')).toThrow(
      RecurrenceError,
    );
  });

  it('recusa intervalo fracionário', () => {
    expect(() =>
      occurrencesUntil(rule({ interval: 1.5 }), '2026-12-31'),
    ).toThrow(RecurrenceError);
  });

  it('recusa quantidade de ocorrências inválida', () => {
    expect(() =>
      occurrencesUntil(rule({ occurrenceLimit: 0 }), '2026-12-31'),
    ).toThrow(RecurrenceError);
  });

  it('cobre 29 de fevereiro em ano bissexto', () => {
    const dates = occurrencesUntil(
      rule({ frequency: 'annual', startDate: '2028-02-29' }),
      '2030-01-01',
    );

    // 2029 não é bissexto: a data encolhe para o último dia do mês.
    expect(dates).toEqual(['2028-02-29', '2029-02-28']);
  });
});

describe('pendingOccurrences', () => {
  it('devolve tudo quando nada foi gerado ainda', () => {
    expect(pendingOccurrences(rule(), null, '2026-03-31')).toHaveLength(3);
  });

  it('omite o que já virou lançamento', () => {
    // Sem isso, abrir o aplicativo duas vezes no mesmo dia criaria a mesma
    // conta duas vezes.
    const pending = pendingOccurrences(rule(), '2026-02-10', '2026-04-30');

    expect(pending).toEqual(['2026-03-10', '2026-04-10']);
  });

  it('não devolve nada quando a série já foi gerada até o horizonte', () => {
    expect(pendingOccurrences(rule(), '2026-04-10', '2026-04-30')).toEqual([]);
  });
});
