import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, annualAccrual, contributionSplit, pensionableSalary, projectPension } from '../src/domain/pension.ts';
import { SCHEME_2026 } from '../src/domain/scheme.ts';

test('pensionable salary subtracts the franchise', () => {
  assert.equal(pensionableSalary(52_000, 1), 34_455);
});

test('pensionable salary applies the part-time factor', () => {
  assert.equal(pensionableSalary(46_000, 0.6), 17_073);
});

test('pensionable salary is capped at the salary cap', () => {
  assert.equal(pensionableSalary(150_000, 1), 120_255);
});

test('pensionable salary is never negative (salary below franchise)', () => {
  assert.equal(pensionableSalary(16_000, 0.9), 0);
});

test('pensionable salary rejects invalid part-time factors', () => {
  assert.throws(() => pensionableSalary(40_000, 0), RangeError);
  assert.throws(() => pensionableSalary(40_000, 1.2), RangeError);
});

test('annual accrual is 1.75% of pensionable salary', () => {
  assert.equal(annualAccrual(34_455), 602.96);
});

test('contribution split is 60% employer / 40% employee', () => {
  assert.deepEqual(contributionSplit(10_000), { total: 2_700, employer: 1_620, employee: 1_080 });
});

test('age is calculated in whole years', () => {
  assert.equal(ageOn('1972-04-15', '2026-11-18'), 54);
  assert.equal(ageOn('1979-12-20', '2026-11-18'), 46);
});

test('projection at the standard retirement age adds future accrual', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18',
  });
  assert.equal(result.yearsToRetirement, 14);
  assert.equal(result.futureAccrual, 8_441.44);
  assert.equal(result.projectedAnnualPension, 13_441.44);
  assert.equal(result.retirementAge, 68);
  assert.equal(result.unreducedAnnualPension, 13_441.44);
  assert.equal(result.earlyRetirementReduction, 0);
  assert.equal(result.retirementDate, '2040-04-15');
});

test('projection at 63 stops accrual at the selected age and reduces the total pension', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18', retirementAge: 63,
  });
  assert.equal(result.yearsToRetirement, 9);
  assert.equal(result.retirementDate, '2035-04-15');
  assert.equal(result.futureAccrual, 5_426.64);
  assert.equal(result.unreducedAnnualPension, 10_426.64);
  assert.equal(result.earlyRetirementReduction, 0.325);
  assert.equal(result.projectedAnnualPension, 7_037.98);
});

test('projection accepts the earliest retirement age of 60', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18', retirementAge: 60,
  });
  assert.equal(result.yearsToRetirement, 6);
  assert.equal(result.futureAccrual, 3_617.76);
  assert.equal(result.unreducedAnnualPension, 8_617.76);
  assert.equal(result.earlyRetirementReduction, 0.52);
  assert.equal(result.projectedAnnualPension, 4_136.52);
});

test('projection at the current age has no future accrual', () => {
  const result = projectPension({
    birthDate: '1966-06-30', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18', retirementAge: 60,
  });
  assert.equal(result.yearsToRetirement, 0);
  assert.equal(result.futureAccrual, 0);
  assert.equal(result.unreducedAnnualPension, 5_000);
  assert.equal(result.projectedAnnualPension, 2_400);
});

test('projection rejects retirement below the current age or outside scheme limits', () => {
  const input = {
    birthDate: '1959-11-05', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18',
  };
  for (const retirementAge of [59, 66, 69]) {
    assert.throws(() => projectPension({ ...input, retirementAge }), RangeError);
  }
});

test('early retirement projection preserves salary growth and whole-year accrual', () => {
  const result = projectPension({
    birthDate: '1965-12-20', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000,
    asOf: '2026-11-18', retirementAge: 63, salaryGrowthRate: 0.02,
  });
  assert.equal(result.yearsToRetirement, 3);
  assert.equal(result.futureAccrual, 1_863.85);
  assert.equal(result.unreducedAnnualPension, 6_863.85);
  assert.equal(result.projectedAnnualPension, 4_633.1);
});

test('projection uses scheme-configured retirement limits and reduction factor', () => {
  const scheme = { ...SCHEME_2026, earlyRetirementMinAge: 61, retirementAge: 67, earlyRetirementReductionPerYear: 0.05 };
  const input = {
    birthDate: '1966-06-30', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18',
  };
  const result = projectPension({ ...input, retirementAge: 61 }, scheme);
  assert.equal(result.earlyRetirementReduction, 0.05 * 6);
  assert.equal(result.unreducedAnnualPension, 5_602.96);
  assert.equal(result.projectedAnnualPension, 3_922.07);
  assert.equal(projectPension(input, scheme).retirementAge, 67);
  for (const retirementAge of [60, 68]) {
    assert.throws(() => projectPension({ ...input, retirementAge }, scheme), RangeError);
  }
});
