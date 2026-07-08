import React, { useState, useMemo } from "react";
import MathTooltip from "./MathTooltip";
import { formatCurrency } from "./utils";
import { EditableSlider } from "./EditableSlider";

function OpportunityCostTab({
  purchasePrice,
  loanAmount,
  mortgage, // monthly
  baseHOA, // monthly
  basePropertyTaxAnnual, // annual
  hoaInflation, // percentage
  appreciation, // percentage
  userRent, // user's monthly rent contribution during owner-occupied
  brotherRent, // brother's rent during owner-occupied
  tenantRent, // total monthly tenant rent when rented out
  operatingExpenseRate,
  moveOutYear,
  selectedYear,
  amortizationSchedule,
}) {
  const [stockMarketReturn, setStockMarketReturn] = useState(7.0);
  const [equivalentRent, setEquivalentRent] = useState(3300);
  const [rentInflation, setRentInflation] = useState(3.0);

  // Constants
  const STARTING_CASH = 100000;
  const downPaymentTotal = purchasePrice - loanAmount;
  const buyerClosingCostsPercent = 0.02;
  const sellerClosingCostsPercent = 0.06;

  // Ownership shares
  const userEquityShare = 0.25;
  const userCashFlowShareOwner = 0.25;
  const userCashFlowShareRental = 1 / 3;

  // Tax constants
  const tcjaLimit = 750000;
  const caStateTax = 16000;
  const saltCap = 40400;
  const standardDeduction = 16100;
  const marginalRate = 0.24;
  const buildingRatio = 0.8;
  const depreciationBasis = purchasePrice * buildingRatio;
  const annualDepreciation = depreciationBasis / 27.5;

  const data = useMemo(() => {
    // 1. Initial Investment
    const initialDownPaymentUser = downPaymentTotal * userEquityShare;
    const initialClosingCostsUser =
      purchasePrice * buyerClosingCostsPercent * userEquityShare;
    const totalInitialSunkUser =
      initialDownPaymentUser + initialClosingCostsUser;

    // Track Stock Market Portfolio value month by month (Rent Side)
    let stockPortfolio = STARTING_CASH;
    const monthlyHouseAppreciation = Math.pow(1 + appreciation / 100, 1 / 12) - 1;
    // Use true APY (CAGR) for stock market, which is more accurate to reality than dividing APR by 12.
    const monthlyStockRate = Math.pow(1 + stockMarketReturn / 100, 1 / 12) - 1;

    // Track Liquid Cash value month by month (Buy Side)
    let buyLiquidCash = STARTING_CASH - totalInitialSunkUser;

    let totalHouseCashBurned = 0;
    let totalRentCashBurned = 0;
    let finalMonthlyHouseCost = 0;
    let finalMonthlyRentCost = 0;
    
    let buyCumulativeSavings = 0;
    let rentCumulativeSavings = 0;

    let prevYearStockPortfolio = STARTING_CASH;
    let prevYearBuyLiquidCash = STARTING_CASH - initialDownPaymentUser - initialClosingCostsUser;
    let prevYearCumulativeSavingsBuy = 0;
    let prevYearCumulativeSavingsRent = 0;
    
    let prevYearNetWorthBuy = STARTING_CASH;
    let prevYearNetWorthRent = STARTING_CASH;
    
    const prevYearRemainingLoan = selectedYear > 1 
      ? (amortizationSchedule[selectedYear - 2]?.balance || 0)
      : loanAmount;

    // Loop through every month up to selectedYear
    for (let m = 1; m <= selectedYear * 12; m++) {
      const yearIndex = Math.floor((m - 1) / 12); // 0-indexed year
      const currentYear = yearIndex + 1; // 1-indexed year
      const isRental = currentYear > moveOutYear;

      // --- HOUSE COSTS FOR THIS MONTH ---
      const currentHOA = baseHOA * Math.pow(1 + hoaInflation / 100, yearIndex);
      const currentTaxAnnual =
        basePropertyTaxAnnual * Math.pow(1.02, yearIndex);
      const currentTaxMonthly = currentTaxAnnual / 12;

      const totalPropertyCosts = mortgage + currentHOA + currentTaxMonthly;

      const yearData = amortizationSchedule[yearIndex] || {
        interest: 0,
        principal: 0,
      };
      const totalInterestForYear = yearData.interest;

      let userNetCostThisMonth = 0;

      if (!isRental) {
        // Owner Occupied Math
        const userShareOfCosts = totalPropertyCosts * userCashFlowShareOwner;
        const totalRentPot = userRent + brotherRent;
        const userRentIncome = totalRentPot * 0.25;

        // Schedule A Tax Shield
        const userShareOfInterest = totalInterestForYear / 2; // User and brother split mortgage 50/50
        const userShareOfPropertyTax = currentTaxAnnual / 2;
        const userShareOfLoan = loanAmount / 2;
        const deductibleInterest =
          userShareOfLoan <= tcjaLimit
            ? userShareOfInterest
            : userShareOfInterest * (tcjaLimit / userShareOfLoan);
        const saltTotal = caStateTax + userShareOfPropertyTax;
        const deductiblePropertyTax =
          saltTotal <= saltCap
            ? userShareOfPropertyTax
            : Math.max(0, saltCap - caStateTax);
        const totalItemized =
          caStateTax + deductiblePropertyTax + deductibleInterest;
        const incrementalDeduction = Math.max(
          0,
          totalItemized - standardDeduction,
        );
        const userTaxShieldScheduleA =
          (incrementalDeduction * marginalRate) / 12;

        userNetCostThisMonth =
          userShareOfCosts + userRent - userRentIncome - userTaxShieldScheduleA;
      } else {
        // Rental Math (LLC REPS)
        const inflatedTenantRent =
          tenantRent * Math.pow(1 + rentInflation / 100, yearIndex);
        const currentOpExAnnual = purchasePrice * (operatingExpenseRate / 100);
        const currentOpExMonthly = currentOpExAnnual / 12;

        const userShareOfCosts =
          (totalPropertyCosts + currentOpExMonthly) * userCashFlowShareRental;
        const userRentIncome = inflatedTenantRent * userCashFlowShareRental;

        // LLC Tax Shield
        const rentalInterest = totalInterestForYear * userCashFlowShareRental;
        const rentalPropertyTax = currentTaxAnnual * userCashFlowShareRental;
        const rentalHOA = currentHOA * 12 * userCashFlowShareRental;
        const userShareOfDepreciation =
          annualDepreciation * userCashFlowShareRental;
        const userShareOfOperatingExpenses =
          currentOpExAnnual * userCashFlowShareRental;
        const totalRentalDeductions =
          rentalInterest +
          rentalPropertyTax +
          rentalHOA +
          userShareOfDepreciation +
          userShareOfOperatingExpenses;

        const annualRentalIncome =
          inflatedTenantRent * 12 * userCashFlowShareRental;
        const netRentalIncome = annualRentalIncome - totalRentalDeductions;
        const monthlyRentalTaxCost = (netRentalIncome * marginalRate) / 12; // negative = savings, positive = cost

        userNetCostThisMonth =
          userShareOfCosts - userRentIncome + monthlyRentalTaxCost;
      }

      totalHouseCashBurned += userNetCostThisMonth;

      // --- RENTING COSTS FOR THIS MONTH ---
      const currentEquivalentRent = isRental
        ? 0
        : equivalentRent * Math.pow(1 + rentInflation / 100, yearIndex);
      totalRentCashBurned += currentEquivalentRent;

      // Compound the portfolios
      stockPortfolio = stockPortfolio * (1 + monthlyStockRate);
      buyLiquidCash = buyLiquidCash * (1 + monthlyStockRate);

      // --- PAYCHECK ABSTRACTION (Max Budget) ---
      const maxBudgetThisMonth = Math.max(userNetCostThisMonth, currentEquivalentRent);
      
      // Calculate savings for each path
      const buySavingsThisMonth = maxBudgetThisMonth - userNetCostThisMonth;
      const rentSavingsThisMonth = maxBudgetThisMonth - currentEquivalentRent;

      // Add savings to liquid portfolios
      buyLiquidCash += buySavingsThisMonth;
      stockPortfolio += rentSavingsThisMonth;
      
      buyCumulativeSavings += buySavingsThisMonth;
      rentCumulativeSavings += rentSavingsThisMonth;

      if (m === (selectedYear - 1) * 12) {
        prevYearStockPortfolio = stockPortfolio;
        prevYearBuyLiquidCash = buyLiquidCash;
        prevYearCumulativeSavingsBuy = buyCumulativeSavings;
        prevYearCumulativeSavingsRent = rentCumulativeSavings;
        
        // Calculate previous year net worths
        const prevYearPropertyVal = purchasePrice * Math.pow(1 + appreciation / 100, selectedYear - 1);
        const prevYearIndex = (selectedYear - 1) - 1; 
        const prevYearRemainingBalance = prevYearIndex >= 0 && amortizationSchedule.length > 0
          ? amortizationSchedule[prevYearIndex].balance 
          : loanAmount;
        const prevYearGrossEquityTotal = prevYearPropertyVal - prevYearRemainingBalance;
        prevYearNetWorthBuy = buyLiquidCash + (prevYearGrossEquityTotal * userEquityShare);
        prevYearNetWorthRent = stockPortfolio;
      }

      if (m === selectedYear * 12) {
        finalMonthlyHouseCost = userNetCostThisMonth;
        finalMonthlyRentCost = currentEquivalentRent;
      }
    }

    // --- FINAL PAYDAY FOR BUYING ---
    const finalPropertyVal =
      purchasePrice * Math.pow(1 + appreciation / 100, selectedYear);
    const yearIndex = Math.min(selectedYear - 1, 29);
    const remainingLoanTotal =
      amortizationSchedule.length > 0 && amortizationSchedule[yearIndex]
        ? amortizationSchedule[yearIndex].balance
        : loanAmount;

    const grossEquityTotal = finalPropertyVal - remainingLoanTotal;
    const sellerClosingCostsTotal =
      finalPropertyVal * sellerClosingCostsPercent;

    // User's illiquid home equity BEFORE sale
    const userHomeEquity = grossEquityTotal * userEquityShare;

    // User's proceeds IF sold today
    const userNetProceeds =
      (grossEquityTotal - sellerClosingCostsTotal) * userEquityShare;

    // Total Net Worth Calculation
    const buyNetWorth = buyLiquidCash + userHomeEquity;
    const buyTotalLiquid = buyLiquidCash + userNetProceeds;
    const pathAWins = buyTotalLiquid > stockPortfolio;
    const delta = Math.abs(buyTotalLiquid - stockPortfolio);
    
    // --- THIS YEAR'S IMPACT ---
    const buySavingsThisYear = buyCumulativeSavings - prevYearCumulativeSavingsBuy;
    const rentSavingsThisYear = rentCumulativeSavings - prevYearCumulativeSavingsRent;
    
    const buyMarketReturnsThisYear = (buyLiquidCash - prevYearBuyLiquidCash) - buySavingsThisYear;
    const rentMarketReturnsThisYear = (stockPortfolio - prevYearStockPortfolio) - rentSavingsThisYear;
    
    const currentHomeValueTotal = purchasePrice * Math.pow(1 + appreciation / 100, selectedYear);
    const prevHomeValueTotal = purchasePrice * Math.pow(1 + appreciation / 100, selectedYear - 1);
    
    const appreciationThisYearTotal = currentHomeValueTotal - prevHomeValueTotal;
    const principalPaydownThisYearTotal = prevYearRemainingLoan - remainingLoanTotal;
    
    return {
      STARTING_CASH,
      stockPortfolio,
      buyNetWorth,
      userHomeEquity,
      userNetProceeds,
      buyLiquidCash,
      buyTotalLiquid,
      buyCumulativeSavings,
      rentCumulativeSavings,
      buySavingsThisYear,
      rentSavingsThisYear,
      buyMarketReturnsThisYear,
      rentMarketReturnsThisYear,
      appreciationThisYearUser: appreciationThisYearTotal * userEquityShare,
      principalPaydownThisYearUser: principalPaydownThisYearTotal * userEquityShare,
      cumulativeAppreciationUser: (currentHomeValueTotal - purchasePrice) * userEquityShare,
      cumulativePrincipalPaydownUser: (loanAmount - remainingLoanTotal) * userEquityShare,
      prevYearNetWorthBuy,
      prevYearNetWorthRent,
      currentHomeValueUser: currentHomeValueTotal * userEquityShare,
      remainingLoanUser: remainingLoanTotal * userEquityShare,
      sellerClosingCostsUser: currentHomeValueTotal * 0.06 * userEquityShare,
      prevYearBuyLiquidCash,
      prevYearStockPortfolio,
      buyCumulativeMarketReturns: buyLiquidCash - (STARTING_CASH - initialDownPaymentUser - initialClosingCostsUser + buyCumulativeSavings),
      rentCumulativeMarketReturns: stockPortfolio - (STARTING_CASH + rentCumulativeSavings),
      buyDay1Cash: STARTING_CASH - initialDownPaymentUser - initialClosingCostsUser,
      buyCumulativeProfitOnDay1: (STARTING_CASH - initialDownPaymentUser - initialClosingCostsUser) * (Math.pow(1 + stockMarketReturn / 100, selectedYear) - 1),
      buyCumulativeProfitOnDeposits: (buyLiquidCash - (STARTING_CASH - initialDownPaymentUser - initialClosingCostsUser + buyCumulativeSavings)) - ((STARTING_CASH - initialDownPaymentUser - initialClosingCostsUser) * (Math.pow(1 + stockMarketReturn / 100, selectedYear) - 1)),
      rentDay1Cash: STARTING_CASH,
      rentCumulativeProfitOnDay1: STARTING_CASH * (Math.pow(1 + stockMarketReturn / 100, selectedYear) - 1),
      rentCumulativeProfitOnDeposits: (stockPortfolio - (STARTING_CASH + rentCumulativeSavings)) - (STARTING_CASH * (Math.pow(1 + stockMarketReturn / 100, selectedYear) - 1)),
      totalHouseCashBurned,
      totalRentCashBurned,
      pathAWins,
      delta,
      remainingLoanTotal,
      finalMonthlyHouseCost,
      finalMonthlyRentCost,
      finalMaxBudget: Math.max(finalMonthlyHouseCost, finalMonthlyRentCost),
      initialDownPaymentUser,
      initialClosingCostsUser,
      purchasePrice,
      appreciation,
      userEquityShare,
    };
  }, [
    purchasePrice,
    loanAmount,
    mortgage,
    baseHOA,
    basePropertyTaxAnnual,
    hoaInflation,
    appreciation,
    userRent,
    brotherRent,
    tenantRent,
    operatingExpenseRate,
    moveOutYear,
    selectedYear,
    stockMarketReturn,
    equivalentRent,
    rentInflation,
    amortizationSchedule,
  ]);

  return (
    <div className="tab-fade-in">
      <div className="card controls-card" style={{ paddingBottom: "16px" }}>
        <h2>⚖️ Buy vs. Rent (Opportunity Cost)</h2>
        <p className="subtitle">
          This simulates what happens if you started with{" "}
          <strong>{formatCurrency(data.STARTING_CASH)}</strong> liquid cash
          today.
        </p>

        <div
          className="sliders-wrapper"
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "32px",
            gap: "20px",
          }}
        >
          <EditableSlider
            label="Market Return (S&P 500)"
            value={stockMarketReturn}
            setValue={setStockMarketReturn}
            min={0}
            max={15}
            step={0.5}
            format="percentage"
          />
          <EditableSlider
            label="Equivalent Rent"
            value={equivalentRent}
            setValue={setEquivalentRent}
            min={500}
            max={5000}
            step={50}
            format="currency/mo"
          />
          <EditableSlider
            label="Rent Inflation"
            value={rentInflation}
            setValue={setRentInflation}
            min={0}
            max={10}
            step={0.5}
            format="percentage"
          />
        </div>
      </div>

      <div
        className="header"
        style={{ marginTop: "32px", marginBottom: "16px" }}
      >
        <h2 style={{ fontSize: "1.8rem", margin: 0 }}>
          Year {selectedYear} Showdown
        </h2>
      </div>

      <div className="grid">
        <div
          className={`card hover-card ${data.pathAWins ? "" : "disabled-card"}`}
          style={{
            border: data.pathAWins
              ? "2px solid #4ade80"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="card-header"
            style={{ color: data.pathAWins ? "#4ade80" : "inherit" }}
          >
            Path A: Buy the Condo
          </div>
          <div className="card-body">
            {/* TOP: Current Snapshot */}
            <div className="row total" style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "1.1rem" }}>Total Net Worth:</span>
              <span className="positive" style={{ fontSize: "1.3rem" }}>
                <MathTooltip ledger={`  Liquid Cash:        ${formatCurrency(data.buyLiquidCash)}\n+ Gross Home Equity:  ${formatCurrency(data.userHomeEquity)}\n------------------------------\n= Total Net Worth:    ${formatCurrency(data.buyNetWorth)}`}>
                  {formatCurrency(data.buyNetWorth)}
                </MathTooltip>
              </span>
            </div>
            <div className="row total">
              <span style={{ fontSize: "1.1rem" }}>Total Liquid (If Sold Today):</span>
              <span className="positive" style={{ fontSize: "1.3rem" }}>
                <MathTooltip ledger={`  Liquid Cash:          ${formatCurrency(data.buyLiquidCash)}\n+ Net Proceeds if Sold: ${formatCurrency(data.userNetProceeds)}\n--------------------------------\n= Total Liquid:         ${formatCurrency(data.buyTotalLiquid)}`}>
                  {formatCurrency(data.buyTotalLiquid)}
                </MathTooltip>
              </span>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }} />

            {/* MIDDLE 1: Cumulative Net Worth Waterfall */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: "bold", marginBottom: "12px", color: "#60a5fa" }}>Cumulative Net Worth Waterfall (Day 1 ➔ Year {selectedYear}):</div>
              <div className="row">
                <span>Starting Net Worth (Day 1):</span>
                <span className="positive">
                  {formatCurrency(data.STARTING_CASH)}
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px" }}>
                <span>Minus Initial Closing Costs:</span>
                <span className="negative">
                  <MathTooltip ledger={`  Purchase Price:    ${formatCurrency(data.purchasePrice)}\n* Closing Cost %:    2%\n* Your Equity Share: ${data.userEquityShare * 100}%\n------------------------------\n= Initial Closing Costs: ${formatCurrency(data.initialClosingCostsUser)}`}>
                    -{formatCurrency(data.initialClosingCostsUser)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px" }}>
                <span>Cumulative Market Returns:</span>
                <span className={data.buyCumulativeMarketReturns >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Interest on Day 1 Liquid Cash:\n    ${formatCurrency(data.buyDay1Cash)} compounding at ${stockMarketReturn}% APY for ${selectedYear} years\n  = ${formatCurrency(data.buyCumulativeProfitOnDay1)}\n\n  Interest on Housing Savings Deposits:\n    ${formatCurrency(data.buyCumulativeSavings)} deposited over ${selectedYear * 12} months\n  = ${formatCurrency(data.buyCumulativeProfitOnDeposits)}\n----------------------------------------\n= Cumulative Market Returns: ${formatCurrency(data.buyCumulativeMarketReturns)}`}>
                    {data.buyCumulativeMarketReturns >= 0 ? "+" : ""}{formatCurrency(data.buyCumulativeMarketReturns)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px" }}>
                <span>Cumulative Housing Savings:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Sum of (Max Monthly Budget - Actual Buy Cost)\n  deposited over ${selectedYear * 12} months.\n\n  Example from final month of Year ${selectedYear}:\n    Max Budget: ${formatCurrency(data.finalMaxBudget)}\n  - Buy Cost:  -${formatCurrency(data.finalMonthlyHouseCost)}\n  = Savings:    ${formatCurrency(data.finalMaxBudget - data.finalMonthlyHouseCost)}\n\n  Average Monthly Savings (All Years): ${formatCurrency(data.buyCumulativeSavings / (selectedYear * 12))}\n* Total Months Elapsed:                ${selectedYear * 12}\n----------------------------------------\n= Cumulative Housing Savings:          ${formatCurrency(data.buyCumulativeSavings)}`}>
                    +{formatCurrency(data.buyCumulativeSavings)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px" }}>
                <span>Cumulative Appreciation:</span>
                <span className={data.cumulativeAppreciationUser >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Current Property Value:    ${formatCurrency(data.currentHomeValueUser / data.userEquityShare)}\n- Original Purchase Price: -${formatCurrency(data.purchasePrice)}\n= Total Appreciation:        ${formatCurrency((data.currentHomeValueUser / data.userEquityShare) - data.purchasePrice)}\n* Your Equity Share:         ${data.userEquityShare * 100}%\n----------------------------------------\n= Cumulative Appreciation:   ${formatCurrency(data.cumulativeAppreciationUser)}`}>
                    {data.cumulativeAppreciationUser >= 0 ? "+" : ""}{formatCurrency(data.cumulativeAppreciationUser)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px", marginBottom: "8px" }}>
                <span>Cumulative Principal Paydown:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Original Loan Balance:     ${formatCurrency(data.remainingLoanTotal + (data.cumulativePrincipalPaydownUser / data.userEquityShare))}\n- Current Loan Balance:    -${formatCurrency(data.remainingLoanTotal)}\n= Total Principal Paydown:   ${formatCurrency(data.cumulativePrincipalPaydownUser / data.userEquityShare)}\n* Your Equity Share:         ${data.userEquityShare * 100}%\n----------------------------------------\n= Cumulative Principal Paydown: ${formatCurrency(data.cumulativePrincipalPaydownUser)}`}>
                    +{formatCurrency(data.cumulativePrincipalPaydownUser)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ marginBottom: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                <span style={{ fontWeight: "bold" }}>Resulting Net Worth (Year {selectedYear}):</span>
                <span className="positive" style={{ fontWeight: "bold" }}>
                  <MathTooltip ledger={`  Starting Net Worth:        ${formatCurrency(data.STARTING_CASH)}\n- Initial Closing Costs:   -${formatCurrency(data.initialClosingCostsUser)}\n+ Market Returns:          +${formatCurrency(data.buyCumulativeMarketReturns)}\n+ Housing Savings:         +${formatCurrency(data.buyCumulativeSavings)}\n+ Property Appreciation:   +${formatCurrency(data.cumulativeAppreciationUser)}\n+ Principal Paydown:       +${formatCurrency(data.cumulativePrincipalPaydownUser)}\n----------------------------------------\n= Resulting Net Worth:       ${formatCurrency(data.buyNetWorth)}`}>
                    {formatCurrency(data.buyNetWorth)}
                  </MathTooltip>
                </span>
              </div>
            </div>

            {/* MIDDLE 2: Balances */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: "bold", marginBottom: "12px", color: "#2dd4bf" }}>Where is this wealth stored today?</div>
              <div className="row">
                <span>Current Liquid Cash:</span>
                <span className={data.buyLiquidCash >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Starting Cash:             ${formatCurrency(data.STARTING_CASH)}\n- Down Payment:            -${formatCurrency(data.initialDownPaymentUser)}\n- Closing Costs:           -${formatCurrency(data.initialClosingCostsUser)}\n----------------------------------------\n= Day 1 Liquid Cash:         ${formatCurrency(data.STARTING_CASH - data.initialDownPaymentUser - data.initialClosingCostsUser)}\n\n+ Housing Savings:         +${formatCurrency(data.buyCumulativeSavings)}\n+ Market Returns:          +${formatCurrency(data.buyCumulativeMarketReturns)}\n----------------------------------------\n= Current Liquid Cash:       ${formatCurrency(data.buyLiquidCash)}`}>
                    {formatCurrency(data.buyLiquidCash)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ marginTop: "8px" }}>
                <span>Current Gross Equity:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Initial Down Payment:      ${formatCurrency(data.initialDownPaymentUser)}\n+ Property Appreciation:   +${formatCurrency(data.cumulativeAppreciationUser)}\n+ Principal Paydown:       +${formatCurrency(data.cumulativePrincipalPaydownUser)}\n----------------------------------------\n= Current Gross Equity:      ${formatCurrency(data.userHomeEquity)}`}>
                    {formatCurrency(data.userHomeEquity)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px", marginTop: "8px" }}>
                <span>└─ Net Proceeds If Sold:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Current Gross Equity:      ${formatCurrency(data.userHomeEquity)}\n- Seller Closing Costs (6%):-${formatCurrency(data.sellerClosingCostsUser)}\n----------------------------------------\n= Net Proceeds If Sold:      ${formatCurrency(data.userNetProceeds)}`}>
                    {formatCurrency(data.userNetProceeds)}
                  </MathTooltip>
                </span>
              </div>
            </div>
            
            {/* MIDDLE 3: This Year's Impact */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: "bold", marginBottom: "12px", color: "#a855f7" }}>This Year's Impact (Year {selectedYear} Only):</div>
              <div className="row" style={{ fontSize: "0.9rem" }}>
                <span>Starting Net Worth (Year {selectedYear - 1}):</span>
                <span className="positive">
                  <MathTooltip ledger={`Net Worth at the end of Year ${selectedYear - 1}.\n(Or Adjusted Day-1 Net Worth if Year 1)`}>
                    {formatCurrency(data.prevYearNetWorthBuy)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.9rem", color: "#94a3b8", paddingLeft: "16px", marginTop: "8px" }}>
                <span>+ Market Returns this year:</span>
                <span className={data.buyMarketReturnsThisYear >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Interest on Start of Year Balance:\n    ${formatCurrency(data.prevYearBuyLiquidCash)} × ${stockMarketReturn}% APY = ${formatCurrency(data.prevYearBuyLiquidCash * (stockMarketReturn / 100))}\n\n  Interest on New Monthly Deposits:\n    ${formatCurrency(data.buySavingsThisYear)} deposited over 12 months = ${formatCurrency(data.buyMarketReturnsThisYear - (data.prevYearBuyLiquidCash * (stockMarketReturn / 100)))}\n----------------------------------------\n= Market Returns this year: ${formatCurrency(data.buyMarketReturnsThisYear)}`}>
                    {data.buyMarketReturnsThisYear >= 0 ? "+" : ""}{formatCurrency(data.buyMarketReturnsThisYear)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.9rem", color: "#94a3b8", paddingLeft: "16px" }}>
                <span>+ Housing Savings this year:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Example from final month of Year ${selectedYear}:\n    Max Budget: ${formatCurrency(data.finalMaxBudget)}\n  - Buy Cost:  -${formatCurrency(data.finalMonthlyHouseCost)}\n  = Savings:    ${formatCurrency(data.finalMaxBudget - data.finalMonthlyHouseCost)}\n\n  Average Monthly Savings (This Year): ${formatCurrency(data.buySavingsThisYear / 12)}\n* Months Elapsed This Year:            12\n----------------------------------------\n= Housing Savings this year:           ${formatCurrency(data.buySavingsThisYear)}`}>
                    +{formatCurrency(data.buySavingsThisYear)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.9rem", color: "#94a3b8", paddingLeft: "16px" }}>
                <span>+ Property Appreciation this year:</span>
                <span className={data.appreciationThisYearUser >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Year ${selectedYear} Property Value:    ${formatCurrency(data.currentHomeValueUser / data.userEquityShare)}\n- Year ${selectedYear - 1} Property Value:    -${formatCurrency((data.currentHomeValueUser - data.appreciationThisYearUser) / data.userEquityShare)}\n= Total Appreciation:        ${formatCurrency(data.appreciationThisYearUser / data.userEquityShare)}\n* Your Equity Share:         ${data.userEquityShare * 100}%\n----------------------------------------\n= Appreciation this year:    ${formatCurrency(data.appreciationThisYearUser)}`}>
                    {data.appreciationThisYearUser >= 0 ? "+" : ""}{formatCurrency(data.appreciationThisYearUser)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.9rem", color: "#94a3b8", paddingLeft: "16px", marginBottom: "8px" }}>
                <span>+ Principal Paydown this year:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Year ${selectedYear - 1} Loan Balance:    ${formatCurrency(data.remainingLoanTotal + (data.principalPaydownThisYearUser / data.userEquityShare))}\n- Year ${selectedYear} Loan Balance:    -${formatCurrency(data.remainingLoanTotal)}\n= Total Paydown this year:   ${formatCurrency(data.principalPaydownThisYearUser / data.userEquityShare)}\n* Your Equity Share:         ${data.userEquityShare * 100}%\n----------------------------------------\n= Paydown this year:         ${formatCurrency(data.principalPaydownThisYearUser)}`}>
                    +{formatCurrency(data.principalPaydownThisYearUser)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                <span style={{ fontWeight: "bold" }}>Resulting Net Worth (Year {selectedYear}):</span>
                <span className="positive" style={{ fontWeight: "bold" }}>
                  <MathTooltip ledger={`Matches Total Net Worth.`}>
                    {formatCurrency(data.buyNetWorth)}
                  </MathTooltip>
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Monthly Reality (Year {selectedYear}):
            </div>
            <div className="row">
              <span>Phase:</span>{" "}
              <span style={{ color: "#e2e8f0" }}>
                {selectedYear > moveOutYear ? "Rental (LLC)" : "Owner-Occupied"}
              </span>
            </div>
            <div className="row">
              <span>Current Monthly Net Cost:</span>{" "}
              <span
                className={
                  data.finalMonthlyHouseCost <= 0 ? "positive" : "negative"
                }
              >
                {data.finalMonthlyHouseCost <= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(data.finalMonthlyHouseCost))}/mo
              </span>
            </div>
            <div className="row">
              <span>Cumulative House Cash Burned:</span>{" "}
              <span className="negative">
                -{formatCurrency(data.totalHouseCashBurned)}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`card hover-card ${!data.pathAWins ? "" : "disabled-card"}`}
          style={{
            border: !data.pathAWins
              ? "2px solid #4ade80"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="card-header"
            style={{ color: !data.pathAWins ? "#4ade80" : "inherit" }}
          >
            Path B: Rent & Invest
          </div>
          <div className="card-body">
            {/* TOP: Current Snapshot */}
            <div className="row total" style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "1.1rem" }}>Total Net Worth:</span>
              <span className="positive" style={{ fontSize: "1.3rem" }}>
                <MathTooltip ledger={`  Current Liquid Cash:  ${formatCurrency(data.stockPortfolio)}\n------------------------------\n= Total Net Worth:    ${formatCurrency(data.stockPortfolio)}`}>
                  {formatCurrency(data.stockPortfolio)}
                </MathTooltip>
              </span>
            </div>
            <div className="row total">
              <span style={{ fontSize: "1.1rem" }}>Total Liquid (If Sold Today):</span>
              <span className="positive" style={{ fontSize: "1.3rem" }}>
                <MathTooltip ledger={`  Current Liquid Cash:  ${formatCurrency(data.stockPortfolio)}\n------------------------------\n= Total Liquid:       ${formatCurrency(data.stockPortfolio)}`}>
                  {formatCurrency(data.stockPortfolio)}
                </MathTooltip>
              </span>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }} />

            {/* MIDDLE 1: Cumulative Net Worth Waterfall */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: "bold", marginBottom: "12px", color: "#60a5fa" }}>Cumulative Net Worth Waterfall (Day 1 ➔ Year {selectedYear}):</div>
              <div className="row">
                <span>Starting Net Worth (Day 1):</span>
                <span className="positive">
                  {formatCurrency(data.STARTING_CASH)}
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px", marginBottom: "8px" }}>
                <span>Cumulative Market Returns:</span>
                <span className={data.rentCumulativeMarketReturns >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Interest on Day 1 Liquid Cash:\n    ${formatCurrency(data.rentDay1Cash)} compounding at ${stockMarketReturn}% APY for ${selectedYear} years\n  = ${formatCurrency(data.rentCumulativeProfitOnDay1)}\n\n  Interest on Housing Savings Deposits:\n    ${formatCurrency(data.rentCumulativeSavings)} deposited over ${selectedYear * 12} months\n  = ${formatCurrency(data.rentCumulativeProfitOnDeposits)}\n----------------------------------------\n= Cumulative Market Returns: ${formatCurrency(data.rentCumulativeMarketReturns)}`}>
                    {data.rentCumulativeMarketReturns >= 0 ? "+" : ""}{formatCurrency(data.rentCumulativeMarketReturns)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.85rem", color: "#94a3b8", paddingLeft: "16px", marginBottom: "8px" }}>
                <span>Cumulative Housing Savings:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Sum of (Max Monthly Budget - Actual Rent Cost)\n  deposited over ${selectedYear * 12} months.\n\n  Example from final month of Year ${selectedYear}:\n    Max Budget: ${formatCurrency(data.finalMaxBudget)}\n  - Rent Cost: -${formatCurrency(data.finalMonthlyRentCost)}\n  = Savings:    ${formatCurrency(data.finalMaxBudget - data.finalMonthlyRentCost)}\n\n  Average Monthly Savings (All Years): ${formatCurrency(data.rentCumulativeSavings / (selectedYear * 12))}\n* Total Months Elapsed:                ${selectedYear * 12}\n----------------------------------------\n= Cumulative Housing Savings:          ${formatCurrency(data.rentCumulativeSavings)}`}>
                    +{formatCurrency(data.rentCumulativeSavings)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ marginBottom: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                <span style={{ fontWeight: "bold" }}>Resulting Net Worth (Year {selectedYear}):</span>
                <span className="positive" style={{ fontWeight: "bold" }}>
                  <MathTooltip ledger={`  Starting Net Worth:        ${formatCurrency(data.STARTING_CASH)}\n+ Market Returns:          +${formatCurrency(data.rentCumulativeMarketReturns)}\n+ Housing Savings:         +${formatCurrency(data.rentCumulativeSavings)}\n----------------------------------------\n= Resulting Net Worth:       ${formatCurrency(data.stockPortfolio)}`}>
                    {formatCurrency(data.stockPortfolio)}
                  </MathTooltip>
                </span>
              </div>
            </div>

            {/* MIDDLE 2: Balances */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: "bold", marginBottom: "12px", color: "#2dd4bf" }}>Where is this wealth stored today?</div>
              <div className="row">
                <span>Current Liquid Cash:</span>
                <span className={data.stockPortfolio >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Starting Cash:             ${formatCurrency(data.STARTING_CASH)}\n  (No Down Payment or Closing Costs)\n----------------------------------------\n= Day 1 Liquid Cash:         ${formatCurrency(data.STARTING_CASH)}\n\n+ Housing Savings:         +${formatCurrency(data.rentCumulativeSavings)}\n+ Market Returns:          +${formatCurrency(data.rentCumulativeMarketReturns)}\n----------------------------------------\n= Current Liquid Cash:       ${formatCurrency(data.stockPortfolio)}`}>
                    {formatCurrency(data.stockPortfolio)}
                  </MathTooltip>
                </span>
              </div>
            </div>
            
            {/* MIDDLE 3: This Year's Impact */}
            <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontWeight: "bold", marginBottom: "12px", color: "#a855f7" }}>This Year's Impact (Year {selectedYear} Only):</div>
              <div className="row" style={{ fontSize: "0.9rem" }}>
                <span>Starting Net Worth (Year {selectedYear - 1}):</span>
                <span className="positive">
                  <MathTooltip ledger={`Net Worth at the end of Year ${selectedYear - 1}.`}>
                    {formatCurrency(data.prevYearNetWorthRent)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.9rem", color: "#94a3b8", paddingLeft: "16px", marginTop: "8px" }}>
                <span>+ Market Returns this year:</span>
                <span className={data.rentMarketReturnsThisYear >= 0 ? "positive" : "negative"}>
                  <MathTooltip ledger={`  Interest on Start of Year Balance:\n    ${formatCurrency(data.prevYearStockPortfolio)} × ${stockMarketReturn}% APY = ${formatCurrency(data.prevYearStockPortfolio * (stockMarketReturn / 100))}\n\n  Interest on New Monthly Deposits:\n    ${formatCurrency(data.rentSavingsThisYear)} deposited over 12 months = ${formatCurrency(data.rentMarketReturnsThisYear - (data.prevYearStockPortfolio * (stockMarketReturn / 100)))}\n----------------------------------------\n= Market Returns this year: ${formatCurrency(data.rentMarketReturnsThisYear)}`}>
                    {data.rentMarketReturnsThisYear >= 0 ? "+" : ""}{formatCurrency(data.rentMarketReturnsThisYear)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ fontSize: "0.9rem", color: "#94a3b8", paddingLeft: "16px", marginBottom: "8px" }}>
                <span>+ Housing Savings this year:</span>
                <span className="positive">
                  <MathTooltip ledger={`  Example from final month of Year ${selectedYear}:\n    Max Budget: ${formatCurrency(data.finalMaxBudget)}\n  - Rent Cost: -${formatCurrency(data.finalMonthlyRentCost)}\n  = Savings:    ${formatCurrency(data.finalMaxBudget - data.finalMonthlyRentCost)}\n\n  Average Monthly Savings (This Year): ${formatCurrency(data.rentSavingsThisYear / 12)}\n* Months Elapsed This Year:            12\n----------------------------------------\n= Housing Savings this year:           ${formatCurrency(data.rentSavingsThisYear)}`}>
                    +{formatCurrency(data.rentSavingsThisYear)}
                  </MathTooltip>
                </span>
              </div>
              <div className="row" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                <span style={{ fontWeight: "bold" }}>Resulting Net Worth (Year {selectedYear}):</span>
                <span className="positive" style={{ fontWeight: "bold" }}>
                  <MathTooltip ledger={`Matches Total Net Worth.`}>
                    {formatCurrency(data.stockPortfolio)}
                  </MathTooltip>
                </span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.2)",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                Monthly Reality (Year {selectedYear}):
              </div>
              <div className="row">
                <span>Phase:</span>{" "}
                <span style={{ color: "#e2e8f0" }}>Renting</span>
              </div>
              <div className="row">
                <span>Current Monthly Rent:</span>{" "}
                <span className="negative">
                  -{formatCurrency(data.finalMonthlyRentCost)}/mo
                </span>
              </div>
              <div className="row">
                <span>Cumulative Rent Burned:</span>{" "}
                <span className="negative">
                  -{formatCurrency(data.totalRentCashBurned)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: "24px",
          textAlign: "center",
          background: "rgba(15, 23, 42, 0.8)",
        }}
      >
        <h3 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>
          {data.pathAWins ? "🏠 Buying Wins!" : "📈 Renting Wins!"}
        </h3>
        <p style={{ fontSize: "1.1rem", color: "#cbd5e1" }}>
          In Year {selectedYear},{" "}
          {data.pathAWins ? "buying the condo" : "renting and investing"} puts
          you ahead by{" "}
          <strong style={{ color: "#4ade80", fontSize: "1.3rem" }}>
            {formatCurrency(data.delta)}
          </strong>
          .
        </p>
      </div>
    </div>
  );
}

export default OpportunityCostTab;
