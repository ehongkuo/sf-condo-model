export const valueInYear = (baseValue, annualPercent, year) =>
  baseValue * Math.pow(1 + annualPercent / 100, Math.max(0, year - 1));

export function calculateMortgagePayment(principal, annualRatePercent, years) {
  if (principal <= 0 || years <= 0) return 0;

  const numberOfPayments = years * 12;
  if (annualRatePercent === 0) return principal / numberOfPayments;

  const monthlyRate = annualRatePercent / 100 / 12;
  const growth = Math.pow(1 + monthlyRate, numberOfPayments);
  return principal * ((monthlyRate * growth) / (growth - 1));
}

export function buildAmortizationSchedule(
  principal,
  annualRatePercent,
  years,
  monthlyPayment = calculateMortgagePayment(principal, annualRatePercent, years),
) {
  const schedule = [];
  const monthlyRate = annualRatePercent / 100 / 12;
  let balance = Math.max(0, principal);

  for (let year = 1; year <= years; year += 1) {
    let principalPaid = 0;
    let interestPaid = 0;

    for (let month = 0; month < 12 && balance > 0; month += 1) {
      const interest = balance * monthlyRate;
      const payment = Math.min(monthlyPayment, balance + interest);
      const principalPortion = Math.max(0, payment - interest);

      interestPaid += interest;
      principalPaid += principalPortion;
      balance = Math.max(0, balance - principalPortion);
    }

    schedule.push({
      year,
      principal: principalPaid,
      interest: interestPaid,
      balance,
    });
  }

  return schedule;
}

export function calculateCumulativeRentalTaxSavings({
  throughYear,
  moveOutYear,
  amortizationSchedule,
  basePropertyTaxAnnual,
  baseHOAMonthly,
  hoaInflationPercent,
  tenantRentMonthly,
  rentInflationPercent,
  annualDepreciationShare,
  annualOperatingExpenseShare,
  taxShare,
  marginalRate,
}) {
  const yearly = [];
  let totalSavings = 0;

  for (let year = moveOutYear + 1; year <= throughYear; year += 1) {
    const interest =
      (amortizationSchedule[year - 1]?.interest ?? 0) * taxShare;
    const propertyTax = valueInYear(basePropertyTaxAnnual, 2, year) * taxShare;
    const hoa =
      valueInYear(baseHOAMonthly, hoaInflationPercent, year) * 12 * taxShare;
    const rentalIncome =
      valueInYear(tenantRentMonthly, rentInflationPercent, year) * 12 * taxShare;
    const deductions =
      interest +
      propertyTax +
      hoa +
      annualDepreciationShare +
      annualOperatingExpenseShare;
    const netRentalIncome = rentalIncome - deductions;
    const savings = Math.max(0, -netRentalIncome * marginalRate);

    totalSavings += savings;
    yearly.push({ year, rentalIncome, deductions, netRentalIncome, savings });
  }

  return { totalSavings, yearly };
}

export function calculateNetWorthComparison({
  buyBrokerage,
  userNetProceeds,
  rentBrokerage,
}) {
  const buyLiquidNetWorth = buyBrokerage + userNetProceeds;
  const rentNetWorth = rentBrokerage;

  return {
    buyLiquidNetWorth,
    rentNetWorth,
    pathAWins: buyLiquidNetWorth > rentNetWorth,
    delta: Math.abs(buyLiquidNetWorth - rentNetWorth),
  };
}
