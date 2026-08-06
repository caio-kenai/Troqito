import { cents } from '@/lib/money';

import {
  availableLimit,
  invoiceFor,
  InvoiceError,
  limitUsage,
  nextInvoice,
} from '../invoice';

// Cartão que fecha dia 20 e vence dia 28 do mesmo mês.
const CYCLE = { closingDay: 20, dueDay: 28 };
// Cartão que fecha dia 28 e vence dia 5 do mês seguinte.
const CROSSES_MONTH = { closingDay: 28, dueDay: 5 };

describe('invoiceFor', () => {
  it('compra antes do fechamento entra na fatura do mês', () => {
    const invoice = invoiceFor('2026-03-10', CYCLE);

    expect(invoice).toEqual({
      referenceMonth: '2026-03',
      closingDate: '2026-03-20',
      dueDate: '2026-03-28',
    });
  });

  it('compra no dia do fechamento ainda entra na fatura do mês', () => {
    expect(invoiceFor('2026-03-20', CYCLE).referenceMonth).toBe('2026-03');
  });

  it('compra depois do fechamento cai na fatura seguinte', () => {
    // É a regra que mais confunde quem acompanha cartão.
    const invoice = invoiceFor('2026-03-21', CYCLE);

    expect(invoice).toEqual({
      referenceMonth: '2026-04',
      closingDate: '2026-04-20',
      dueDate: '2026-04-28',
    });
  });

  it('vencimento anterior ao fechamento cai no mês seguinte', () => {
    const invoice = invoiceFor('2026-03-10', CROSSES_MONTH);

    expect(invoice).toEqual({
      referenceMonth: '2026-03',
      closingDate: '2026-03-28',
      dueDate: '2026-04-05',
    });
  });

  it('encurta o fechamento em mês curto', () => {
    const invoice = invoiceFor('2026-02-10', { closingDay: 31, dueDay: 10 });

    expect(invoice.closingDate).toBe('2026-02-28');
  });

  it('vira o ano corretamente', () => {
    const invoice = invoiceFor('2026-12-25', CYCLE);

    expect(invoice).toEqual({
      referenceMonth: '2027-01',
      closingDate: '2027-01-20',
      dueDate: '2027-01-28',
    });
  });

  it('recusa dia de fechamento inválido', () => {
    expect(() =>
      invoiceFor('2026-03-10', { closingDay: 0, dueDay: 10 }),
    ).toThrow(InvoiceError);
    expect(() =>
      invoiceFor('2026-03-10', { closingDay: 32, dueDay: 10 }),
    ).toThrow(InvoiceError);
  });

  it('recusa dia de vencimento inválido', () => {
    expect(() =>
      invoiceFor('2026-03-10', { closingDay: 10, dueDay: 0 }),
    ).toThrow(InvoiceError);
  });
});

describe('nextInvoice', () => {
  it('avança para a fatura seguinte', () => {
    const march = invoiceFor('2026-03-10', CYCLE);

    expect(nextInvoice(march, CYCLE)).toEqual({
      referenceMonth: '2026-04',
      closingDate: '2026-04-20',
      dueDate: '2026-04-28',
    });
  });

  it('avança corretamente na virada do ano', () => {
    const december = invoiceFor('2026-12-01', CYCLE);

    expect(nextInvoice(december, CYCLE).referenceMonth).toBe('2027-01');
  });
});

describe('availableLimit', () => {
  it('subtrai o usado do limite', () => {
    expect(availableLimit(cents(1_000_00), cents(300_00))).toBe(700_00);
  });

  it('não devolve negativo quando o limite estoura', () => {
    // "Disponível −R$ 200,00" não informa nada útil a quem lê.
    expect(availableLimit(cents(1_000_00), cents(1_200_00))).toBe(0);
  });
});

describe('limitUsage', () => {
  it('calcula a fração usada', () => {
    expect(limitUsage(cents(1_000_00), cents(250_00))).toBeCloseTo(0.25, 5);
  });

  it('passa de um quando estoura', () => {
    expect(limitUsage(cents(100_00), cents(120_00))).toBeCloseTo(1.2, 5);
  });

  it('devolve zero para cartão sem limite definido, em vez de dividir por zero', () => {
    expect(limitUsage(cents(0), cents(50_00))).toBe(0);
  });
});
