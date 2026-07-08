import React, { useState, useMemo } from "react";
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
    const monthlyStockRate = stockMarketReturn / 100 / 12;

    // Track Liquid Cash value month by month (Buy Side)
    let buyLiquidCash = STARTING_CASH - totalInitialSunkUser;

    let totalHouseCashBurned = 0;
    let totalRentCashBurned = 0;
    let finalMonthlyHouseCost = 0;
    let finalMonthlyRentCost = 0;

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

      // Deduct living expenses
      stockPortfolio -= currentEquivalentRent;
      buyLiquidCash -= userNetCostThisMonth;

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
    const buyNetWorth = buyLiquidCash + userNetProceeds;
    const pathAWins = buyNetWorth > stockPortfolio;
    const delta = Math.abs(buyNetWorth - stockPortfolio);

    return {
      STARTING_CASH,
      totalInitialSunkUser,
      finalPropertyVal,
      userHomeEquity,
      userNetProceeds,
      buyLiquidCash,
      buyNetWorth,
      stockPortfolio,
      totalHouseCashBurned,
      totalRentCashBurned,
      pathAWins,
      delta,
      remainingLoanTotal,
      finalMonthlyHouseCost,
      finalMonthlyRentCost,
      initialDownPaymentUser,
      initialClosingCostsUser,
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
            <div className="row">
              <span>Starting Cash (Day 1):</span>{" "}
              <span className="positive">
                {formatCurrency(data.STARTING_CASH)}
              </span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
              }}
            >
              <span>
                ├─ Minus 20% Down ({data.userEquityShare * 100}% share):
              </span>{" "}
              <span className="negative">
                -{formatCurrency(data.initialDownPaymentUser)}
              </span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
                marginBottom: "8px",
              }}
            >
              <span>
                └─ Minus 2% Closing ({data.userEquityShare * 100}% share):
              </span>{" "}
              <span className="negative">
                -{formatCurrency(data.initialClosingCostsUser)}
              </span>
            </div>

            <hr
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }}
            />
            <div className="row">
              <span>Your Liquid Cash (Invested at {stockMarketReturn}%):</span>{" "}
              <span
                className={data.buyLiquidCash >= 0 ? "positive" : "negative"}
              >
                {formatCurrency(data.buyLiquidCash)}
              </span>
            </div>
            <div className="row">
              <span>Your Home Equity ({data.userEquityShare * 100}%):</span>{" "}
              <span className="positive">
                +{formatCurrency(data.userHomeEquity)}
              </span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
              }}
            >
              <span>└─ Net Proceeds if Sold Today:</span>{" "}
              <span>+{formatCurrency(data.userNetProceeds)}</span>
            </div>

            <hr
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }}
            />

            <div className="row total">
              <span style={{ fontSize: "1.1rem" }}>
                Total Liquid (If Sold Today):
              </span>{" "}
              <span className="positive" style={{ fontSize: "1.5rem" }}>
                {formatCurrency(data.buyNetWorth)}
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
            <div className="row">
              <span>Starting Cash (Day 1):</span>{" "}
              <span className="positive">
                {formatCurrency(data.STARTING_CASH)}
              </span>
            </div>

            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
              }}
            >
              <span>├─ Minus Down Payment:</span> <span>$0</span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
                marginBottom: "8px",
              }}
            >
              <span>└─ Minus Closing Costs:</span> <span>$0</span>
            </div>

            <hr
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }}
            />

            <div className="row">
              <span>Your Liquid Cash (Invested at {stockMarketReturn}%):</span>{" "}
              <span
                className={data.stockPortfolio >= 0 ? "positive" : "negative"}
              >
                {formatCurrency(data.stockPortfolio)}
              </span>
            </div>

            <div className="row">
              <span>Your Home Equity:</span>{" "}
              <span style={{ color: "#94a3b8" }}>$0</span>
            </div>

            <hr
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }}
            />

            <div className="row total">
              <span style={{ fontSize: "1.1rem" }}>
                Total Liquid (If Sold Today):
              </span>{" "}
              <span className="positive" style={{ fontSize: "1.5rem" }}>
                {formatCurrency(data.stockPortfolio)}
              </span>
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
