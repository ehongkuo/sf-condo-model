import React, { useState, useMemo } from "react";
import { formatCurrency } from "./utils";

function OpportunityCostTab({
  purchasePrice,
  loanAmount,
  mortgage, // monthly
  baseHOA, // monthly
  basePropertyTaxAnnual, // annual
  hoaInflation, // percentage
  appreciation, // percentage
  userRent, // user's monthly rent contribution to pot
  totalRent, // total monthly rent pot
  selectedYear,
  amortizationSchedule,
  userTaxShield,
}) {
  const [stockMarketReturn, setStockMarketReturn] = useState(7.0);
  const [equivalentRent, setEquivalentRent] = useState(1500);
  const [rentInflation, setRentInflation] = useState(3.0);

  // Constants
  const downPaymentTotal = purchasePrice - loanAmount;
  const buyerClosingCostsPercent = 0.02;
  const sellerClosingCostsPercent = 0.06;
  const userShare = 0.25;

  const data = useMemo(() => {
    // 1. Initial Investment (Sunk Day 1)
    const initialDownPaymentUser = downPaymentTotal * userShare;
    const initialClosingCostsUser =
      purchasePrice * buyerClosingCostsPercent * userShare;
    const totalInitialSunkUser =
      initialDownPaymentUser + initialClosingCostsUser;

    // We will track the Stock Market Portfolio value month by month
    let stockPortfolio = totalInitialSunkUser;
    const monthlyStockRate = stockMarketReturn / 100 / 12;

    // We also track how much cash the user burned on the house vs renting
    let totalHouseCashBurned = 0;
    let totalRentCashBurned = 0;

    let finalMonthlyHouseCost = 0;
    let finalMonthlyRentCost = 0;
    let totalPortfolioContributions = 0;

    // Loop through every month up to selectedYear
    for (let m = 1; m <= selectedYear * 12; m++) {
      const yearIndex = Math.floor((m - 1) / 12);

      // --- HOUSE COSTS FOR THIS MONTH ---
      const currentHOA = baseHOA * Math.pow(1 + hoaInflation / 100, yearIndex);
      const currentTaxAnnual =
        basePropertyTaxAnnual * Math.pow(1.02, yearIndex);
      const currentTaxMonthly = currentTaxAnnual / 12;

      const totalPropertyCosts = mortgage + currentHOA + currentTaxMonthly;
      const userShareOfCosts = totalPropertyCosts * userShare;

      // User's net cash flow for buying (cash out of pocket)
      // They pay userShareOfCosts + their userRent, but they get back 25% of the totalRent pot
      // They also get a tax shield which reduces their out of pocket cost
      const userRentIncome = totalRent * userShare;
      const userNetCostThisMonth =
        userShareOfCosts + userRent - userRentIncome - userTaxShield;

      totalHouseCashBurned += userNetCostThisMonth;

      // --- RENTING COSTS FOR THIS MONTH ---
      const currentEquivalentRent =
        equivalentRent * Math.pow(1 + rentInflation / 100, yearIndex);
      totalRentCashBurned += currentEquivalentRent;

      // --- THE DELTA (Opportunity Cost) ---
      // If buying costs $2000 and renting costs $1500, buying is $500 more expensive.
      // In the rent scenario, you KEEP that $500 and invest it.
      // If renting costs $2000 and buying costs $1500, renting is $500 more expensive.
      // In the rent scenario, you must withdraw $500 from your portfolio.
      const cashDifference = userNetCostThisMonth - currentEquivalentRent;

      // Compound the portfolio
      stockPortfolio = stockPortfolio * (1 + monthlyStockRate);

      // Add/Subtract the difference
      stockPortfolio += cashDifference;
      totalPortfolioContributions += cashDifference;

      if (m === selectedYear * 12) {
        finalMonthlyHouseCost = userNetCostThisMonth;
        finalMonthlyRentCost = currentEquivalentRent;
      }
    }

    const totalMarketGains =
      stockPortfolio - totalInitialSunkUser - totalPortfolioContributions;

    // --- FINAL PAYDAY FOR BUYING ---
    const finalPropertyVal =
      purchasePrice * Math.pow(1 + appreciation / 100, selectedYear);

    // Find remaining loan balance (amortizationSchedule is an array of 30 years)
    const yearIndex = Math.min(selectedYear - 1, 29);
    const remainingLoanTotal =
      amortizationSchedule.length > 0 && amortizationSchedule[yearIndex]
        ? amortizationSchedule[yearIndex].balance
        : loanAmount;

    const grossEquityTotal = finalPropertyVal - remainingLoanTotal;
    const sellerClosingCostsTotal =
      finalPropertyVal * sellerClosingCostsPercent;

    const userFinalEquity =
      (grossEquityTotal - sellerClosingCostsTotal) * userShare;

    // Net Worth Calculation
    const pathAWins = userFinalEquity > stockPortfolio;
    const delta = Math.abs(userFinalEquity - stockPortfolio);

    return {
      totalInitialSunkUser,
      finalPropertyVal,
      userFinalEquity,
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
      totalPortfolioContributions,
      totalMarketGains,
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
    totalRent,
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
          This models YOUR specific 25% financial situation. What if you
          invested your down payment in the stock market instead, and just
          rented a room?
        </p>

        <div
          className="sliders-wrapper"
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "32px",
          }}
        >
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>
              Market Return (S&P 500)
            </label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={stockMarketReturn}
              onChange={(e) => setStockMarketReturn(Number(e.target.value))}
              className="slider purple-slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {stockMarketReturn.toFixed(1)}%
            </div>
          </div>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>Equivalent Rent</label>
            <input
              type="range"
              min="500"
              max="5000"
              step="50"
              value={equivalentRent}
              onChange={(e) => setEquivalentRent(Number(e.target.value))}
              className="slider purple-slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {formatCurrency(equivalentRent)}/mo
            </div>
          </div>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>Rent Inflation</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={rentInflation}
              onChange={(e) => setRentInflation(Number(e.target.value))}
              className="slider purple-slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {rentInflation.toFixed(1)}%
            </div>
          </div>
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
                +{formatCurrency(data.totalInitialSunkUser)}
              </span>
            </div>
            <div className="row">
              <span>Minus Buyer Closing Costs:</span>{" "}
              <span className="negative">
                -{formatCurrency(data.initialClosingCostsUser)}
              </span>
            </div>
            <div className="row">
              <span>Plus Principal Paid Down:</span>{" "}
              <span className="positive">
                +
                {formatCurrency(
                  loanAmount * userShare - data.remainingLoanTotal * userShare,
                )}
              </span>
            </div>
            <div className="row">
              <span>Plus Property Appreciation:</span>{" "}
              <span className="positive">
                +
                {formatCurrency(
                  data.finalPropertyVal * userShare - purchasePrice * userShare,
                )}
              </span>
            </div>
            <div className="row">
              <span>Minus Seller Fees (6%):</span>{" "}
              <span className="negative">
                -
                {formatCurrency(
                  data.finalPropertyVal * sellerClosingCostsPercent * userShare,
                )}
              </span>
            </div>
            <hr
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }}
            />
            <div className="row total">
              <span style={{ fontSize: "1.2rem" }}>Liquid Net Worth:</span>{" "}
              <span className="positive" style={{ fontSize: "1.5rem" }}>
                {formatCurrency(data.userFinalEquity)}
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
                Monthly Cash Flow Reality:
              </div>
              <div className="row">
                <span>Current Monthly Cost:</span>{" "}
                <span className="negative">
                  -{formatCurrency(data.finalMonthlyHouseCost)}/mo
                </span>
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  paddingLeft: "12px",
                  marginBottom: "8px",
                  fontStyle: "italic",
                }}
              >
                * This perfectly matches your "Net Flow" in the Cash Flow tab
                (factoring in your rent, 25% costs, and Tax Savings).
              </div>
              <div className="row">
                <span>Total Cumulative Costs Burned:</span>{" "}
                <span className="negative">
                  -{formatCurrency(data.totalHouseCashBurned)}
                </span>
              </div>
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
                +{formatCurrency(data.totalInitialSunkUser)}
              </span>
            </div>
            <div className="row">
              <span>
                {data.totalPortfolioContributions >= 0 ? "Plus" : "Minus"} Net
                Monthly Deposits:
              </span>
              <span
                className={
                  data.totalPortfolioContributions >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {data.totalPortfolioContributions >= 0 ? "+" : ""}
                {formatCurrency(data.totalPortfolioContributions)}
              </span>
            </div>
            <div className="row">
              <span>Plus Stock Market Gains:</span>{" "}
              <span className="positive">
                +{formatCurrency(data.totalMarketGains)}
              </span>
            </div>
            <hr
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }}
            />
            <div className="row total">
              <span style={{ fontSize: "1.2rem" }}>Liquid Net Worth:</span>{" "}
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
                Monthly Cash Flow Reality:
              </div>
              <div className="row">
                <span>Current Monthly Rent:</span>{" "}
                <span className="negative">
                  -{formatCurrency(data.finalMonthlyRentCost)}/mo
                </span>
              </div>
              <div className="row">
                <span>Total Cumulative Rent Burned:</span>{" "}
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
