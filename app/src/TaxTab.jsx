import React from "react";
import { CheckCircle, XCircle, ArrowDown, Info } from "lucide-react";
import { formatCurrency } from "./utils";

function TaxTab({
  isRental,
  selectedYear,
  // Owner-occupied props
  monthlyInterest,
  monthlyPrincipal,
  propertyTax,
  hoa,
  mortgage,
  userShareOfInterest,
  userShareOfPropertyTax,
  userShareOfLoan,
  deductibleInterest,
  deductiblePropertyTax,
  saltTotal,
  totalItemized,
  incrementalDeduction,
  annualTaxSavings,
  userTaxShield,
  // Rental LLC props
  purchasePrice,
  rentalInterest,
  rentalPropertyTax,
  rentalHOA,
  userShareOfDepreciation,
  userShareOfOperatingExpenses,
  totalOperatingExpenses,
  operatingExpenseRate,
  totalRentalDeductions,
  rentalIncome,
  netRentalIncome,
  rentalTaxImpact,
  monthlyRentalTaxCost,
  cumulativeTaxSavings,
  llcShare,
  userShareOfRentIncome,
}) {
  if (isRental) {
    const annualTaxSavingsFromLoss =
      netRentalIncome < 0 ? Math.abs(netRentalIncome) * 0.24 : 0;
    const monthlyTaxSavingsFromLoss = annualTaxSavingsFromLoss / 12;

    return (
      <div className="tab-fade-in">
        {/* LLC HEADER */}
        <div
          className="card"
          style={{
            marginBottom: "24px",
            background: "rgba(168, 85, 247, 0.08)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
        >
          <div
            className="card-header"
            style={{ fontSize: "1.3rem", color: "#a855f7" }}
          >
            🏢 LLC Partnership + Real Estate Professional Status (REPS)
          </div>
          <div className="card-body">
            <p style={{ color: "#e2e8f0", marginBottom: "16px" }}>
              Your family LLC has <strong>3 equal members (33.3% each)</strong>:
              You, your Brother, and your Dad. Because Dad is retired and
              qualifies as a <strong>Real Estate Professional</strong>, rental
              losses flow through your K-1 as{" "}
              <strong style={{ color: "#4ade80" }}>non-passive income</strong> —
              meaning they can offset your W-2 wages.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "rgba(96, 165, 250, 0.15)",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  fontSize: "0.9rem",
                }}
              >
                👤 You — 33.3% Member (W-2)
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "rgba(96, 165, 250, 0.15)",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  fontSize: "0.9rem",
                }}
              >
                👤 Brother — 33.3% Member (W-2)
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "rgba(74, 222, 128, 0.15)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  fontSize: "0.9rem",
                }}
              >
                👴 Dad — 33.3% Member (REPS ✓)
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Deductible Expenses */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header" style={{ fontSize: "1.3rem" }}>
            Step 1: What can the LLC deduct?
          </div>
          <div className="card-body">
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
              As a business, the LLC can deduct <strong>all</strong> ordinary
              and necessary expenses — including items that were NOT deductible
              when you lived there (HOA, depreciation, and operating costs).
            </p>
            <div className="tax-item-grid">
              <div className="tax-item yes">
                <div className="tax-item-header">
                  <CheckCircle color="#4ade80" size={20} /> Mortgage Interest
                </div>
                <div className="tax-item-amount">
                  {formatCurrency(rentalInterest / 12)} / mo (your 33.3%)
                </div>
                <div className="tax-item-note">
                  No $750k TCJA cap — it's a business expense now.
                </div>
              </div>
              <div className="tax-item yes">
                <div className="tax-item-header">
                  <CheckCircle color="#4ade80" size={20} /> Property Tax
                </div>
                <div className="tax-item-amount">
                  {formatCurrency(rentalPropertyTax / 12)} / mo (your 33.3%)
                </div>
                <div className="tax-item-note">
                  Bypasses the SALT cap entirely as a rental expense.
                </div>
              </div>
              <div
                className="tax-item yes"
                style={{ border: "1px solid rgba(74, 222, 128, 0.4)" }}
              >
                <div className="tax-item-header">
                  <CheckCircle color="#4ade80" size={20} /> HOA Dues ✨
                </div>
                <div className="tax-item-amount">
                  {formatCurrency(rentalHOA / 12)} / mo (your 33.3%)
                </div>
                <div className="tax-item-note">
                  <strong>Newly deductible!</strong> Not deductible as a
                  homeowner, but fully deductible as a business.
                </div>
              </div>
              <div
                className="tax-item yes"
                style={{ border: "1px solid rgba(74, 222, 128, 0.4)" }}
              >
                <div className="tax-item-header">
                  <CheckCircle color="#4ade80" size={20} /> Depreciation ✨
                </div>
                <div className="tax-item-amount">
                  {formatCurrency(userShareOfDepreciation / 12)} / mo (your
                  33.3%)
                </div>
                <div className="tax-item-note">
                  <strong>Phantom deduction!</strong>{" "}
                  {formatCurrency(purchasePrice)} × 80% building ÷ 27.5 years ÷
                  3 members = {formatCurrency(userShareOfDepreciation)}/yr.
                </div>
              </div>
            </div>

            {/* Operating Expenses Breakdown */}
            <div style={{ marginTop: "24px" }}>
              <h3
                style={{
                  color: "#60a5fa",
                  marginBottom: "16px",
                  fontSize: "1.1rem",
                }}
              >
                📋 Operating Expenses (Your 33.3% Share)
              </h3>
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "16px",
                  borderRadius: "10px",
                }}
              >
                <div className="row" style={{ marginBottom: "8px" }}>
                  <span>
                    Estimated at {operatingExpenseRate.toFixed(2)}% of property
                    value:
                  </span>
                  <span style={{ color: "#e2e8f0", fontWeight: "bold" }}>
                    {formatCurrency(userShareOfOperatingExpenses)}/yr
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  Covers cleaning, repairs &amp; maintenance, travel/mileage,
                  and landlord insurance. LLC total:{" "}
                  {formatCurrency(totalOperatingExpenses)}/yr (
                  {formatCurrency(totalOperatingExpenses / 12)}/mo).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Annual P&L */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header" style={{ fontSize: "1.3rem" }}>
            Step 2: Your 33.3% K-1 — Annual Rental P&L (Year {selectedYear})
          </div>
          <div className="card-body">
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
              The LLC files Form 1065 and issues each member a K-1. Here's your
              1/3 share:
            </p>

            <div
              style={{
                background: "rgba(74, 222, 128, 0.1)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  color: "#4ade80",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Income (your {(userShareOfRentIncome * 100).toFixed(1)}% of
                rent)
              </div>
              <div className="row">
                <span>
                  {(userShareOfRentIncome * 100).toFixed(1)}% of Tenant Rent:
                </span>{" "}
                <span className="positive">
                  {formatCurrency(rentalIncome)} / yr
                </span>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                margin: "12px 0",
                color: "#94a3b8",
                fontSize: "1.2rem",
              }}
            >
              minus
            </div>

            <div
              style={{
                background: "rgba(248, 113, 113, 0.1)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(248, 113, 113, 0.3)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  color: "#f87171",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Deductible Expenses (your 33.3%)
              </div>
              <div className="row">
                <span>Mortgage Interest:</span>{" "}
                <span>-{formatCurrency(rentalInterest)}</span>
              </div>
              <div className="row">
                <span>Property Tax:</span>{" "}
                <span>-{formatCurrency(rentalPropertyTax)}</span>
              </div>
              <div className="row">
                <span>HOA Dues:</span> <span>-{formatCurrency(rentalHOA)}</span>
              </div>
              <div className="row">
                <span>
                  Depreciation ({formatCurrency(purchasePrice)} × 80% ÷ 27.5 ÷
                  3):
                </span>{" "}
                <span>-{formatCurrency(userShareOfDepreciation)}</span>
              </div>
              <div className="row">
                <span>Operating Expenses:</span>{" "}
                <span>-{formatCurrency(userShareOfOperatingExpenses)}</span>
              </div>
              <hr style={{ opacity: 0.2 }} />
              <div className="row total">
                <span>Total Deductions:</span>{" "}
                <span className="negative">
                  -{formatCurrency(totalRentalDeductions)}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center", margin: "12px 0" }}>
              <ArrowDown color="#a855f7" size={32} />
            </div>

            <div
              style={{
                background:
                  netRentalIncome >= 0
                    ? "rgba(74, 222, 128, 0.1)"
                    : "rgba(168, 85, 247, 0.1)",
                padding: "20px",
                borderRadius: "12px",
                border: `1px solid ${netRentalIncome >= 0 ? "rgba(74, 222, 128, 0.3)" : "rgba(168, 85, 247, 0.3)"}`,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  color: netRentalIncome >= 0 ? "#4ade80" : "#a855f7",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  fontSize: "1.1rem",
                }}
              >
                {netRentalIncome >= 0
                  ? "Net Taxable Rental Income"
                  : "Net Rental Loss (Paper Loss)"}
              </div>
              <div className="row total" style={{ fontSize: "1.2rem" }}>
                <span>Net:</span>
                <span
                  className={netRentalIncome >= 0 ? "positive" : "negative"}
                >
                  {formatCurrency(netRentalIncome)} / yr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: What this means for your taxes */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header" style={{ fontSize: "1.3rem" }}>
            Step 3: How does this affect your W-2 taxes?
          </div>
          <div className="card-body">
            {netRentalIncome >= 0 ? (
              <>
                <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
                  Your rental made {formatCurrency(netRentalIncome)} of taxable
                  income. You'll owe taxes on this at your 24% marginal rate.
                </p>
                <div
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "24px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div className="row">
                    <span>Net Rental Income:</span>{" "}
                    <span>{formatCurrency(netRentalIncome)}</span>
                  </div>
                  <div className="row">
                    <span>Your tax rate:</span> <span>24%</span>
                  </div>
                  <hr style={{ opacity: 0.2 }} />
                  <div className="row total">
                    <span>Additional tax owed:</span>{" "}
                    <span className="negative">
                      {formatCurrency(rentalTaxImpact)} / yr (
                      {formatCurrency(monthlyRentalTaxCost)} / mo)
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
                  Your rental shows a <strong>"paper loss"</strong> of{" "}
                  {formatCurrency(Math.abs(netRentalIncome))} — mostly thanks to
                  depreciation and operating expense deductions.
                </p>
                <div
                  style={{
                    background: "rgba(74, 222, 128, 0.1)",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid rgba(74, 222, 128, 0.3)",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      color: "#4ade80",
                      fontWeight: "bold",
                      marginBottom: "12px",
                      fontSize: "1.1rem",
                    }}
                  >
                    ✅ LLC + REPS: This loss REDUCES your W-2 taxes!
                  </div>
                  <p style={{ color: "#e2e8f0", margin: "0 0 16px 0" }}>
                    Unlike a standard Schedule E rental where this loss would be{" "}
                    <strong>suspended</strong> (wasted) because your MAGI
                    exceeds $150k, the LLC + REPS structure makes this loss{" "}
                    <strong>non-passive</strong>. It directly reduces the income
                    the IRS taxes you on.
                  </p>
                  <div className="row">
                    <span>Your W-2 Income:</span> <span>$213,000</span>
                  </div>
                  <div className="row">
                    <span>K-1 Rental Loss:</span>{" "}
                    <span className="positive">
                      -{formatCurrency(Math.abs(netRentalIncome))}
                    </span>
                  </div>
                  <div className="row total">
                    <span>New Taxable Income:</span>{" "}
                    <span>{formatCurrency(213000 + netRentalIncome)}</span>
                  </div>
                  <hr style={{ opacity: 0.2, margin: "16px 0" }} />
                  <div className="row">
                    <span>Tax savings at 24%:</span>{" "}
                    <span className="positive">
                      {formatCurrency(annualTaxSavingsFromLoss)} / yr
                    </span>
                  </div>
                  <div
                    className="row total"
                    style={{ fontSize: "1.3rem", marginTop: "8px" }}
                  >
                    <span>Monthly tax savings:</span>{" "}
                    <span className="positive">
                      +{formatCurrency(monthlyTaxSavingsFromLoss)} / mo
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(96, 165, 250, 0.1)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(96, 165, 250, 0.3)",
                  }}
                >
                  <div
                    style={{
                      color: "#60a5fa",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    📊 Cumulative Tax Savings Through Year {selectedYear}
                  </div>
                  <div className="row total">
                    <span>Total saved off W-2 taxes:</span>{" "}
                    <span className="positive">
                      {formatCurrency(cumulativeTaxSavings)}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      marginTop: "8px",
                      marginBottom: 0,
                    }}
                  >
                    This is real money that stays in your pocket every year
                    instead of going to the IRS.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* STEP 4: Compared to not buying */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header" style={{ fontSize: "1.3rem" }}>
            Step 4: Compared to NOT buying this property
          </div>
          <div className="card-body">
            <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
              Side-by-side: your tax situation with and without the LLC rental.
            </p>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div
                style={{
                  flex: 1,
                  minWidth: "280px",
                  background: "rgba(0,0,0,0.3)",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    color: "#cbd5e1",
                    fontWeight: "bold",
                    marginBottom: "12px",
                  }}
                >
                  Without the house:
                </div>
                <div className="row">
                  <span>W2 Income:</span> <span>$213,000</span>
                </div>
                <div className="row">
                  <span>Standard Deduction:</span> <span>-$16,100</span>
                </div>
                <div className="row total">
                  <span>Taxable Income:</span> <span>$196,900</span>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: "280px",
                  background: "rgba(168, 85, 247, 0.1)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
              >
                <div
                  style={{
                    color: "#a855f7",
                    fontWeight: "bold",
                    marginBottom: "12px",
                  }}
                >
                  With the LLC rental (Year {selectedYear}):
                </div>
                <div className="row">
                  <span>W2 Income:</span> <span>$213,000</span>
                </div>
                <div className="row">
                  <span>Standard Deduction:</span> <span>-$16,100</span>
                </div>
                <div className="row">
                  <span>K-1 Rental Net:</span>{" "}
                  <span className={netRentalIncome >= 0 ? "" : "positive"}>
                    {formatCurrency(netRentalIncome)}
                    {netRentalIncome < 0 ? " (offsets W-2!)" : ""}
                  </span>
                </div>
                <div className="row total">
                  <span>Taxable Income:</span>{" "}
                  <span>
                    {formatCurrency(
                      213000 - 16100 + Math.min(netRentalIncome, 0),
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "16px",
                color: "#94a3b8",
                fontSize: "0.95rem",
              }}
            >
              <p>
                <strong>Bottom line:</strong>{" "}
                {netRentalIncome >= 0
                  ? `The rental generates ${formatCurrency(rentalIncome)}/yr of income. After deductions, you owe ${formatCurrency(Math.abs(rentalTaxImpact))}/yr in extra taxes. But you're still cash-flow positive from the rent.`
                  : `The LLC shows a ${formatCurrency(Math.abs(netRentalIncome))}/yr paper loss that directly reduces your W-2 taxes by ${formatCurrency(annualTaxSavingsFromLoss)}/yr — that's ${formatCurrency(monthlyTaxSavingsFromLoss)}/mo back in your pocket.`}
              </p>
            </div>
          </div>
        </div>

        {/* Depreciation recapture warning */}
        <div
          style={{
            background: "rgba(251, 146, 60, 0.1)",
            border: "1px solid rgba(251, 146, 60, 0.3)",
            padding: "16px 20px",
            borderRadius: "8px",
            display: "flex",
            gap: "12px",
          }}
        >
          <Info
            color="#fb923c"
            size={28}
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div>
            <h3 style={{ color: "#fb923c", margin: "0 0 8px 0" }}>
              Depreciation Recapture Warning
            </h3>
            <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.5 }}>
              When you sell, the IRS will "recapture" all depreciation claimed
              and tax it at 25%. For each year you rent, that's{" "}
              <strong>{formatCurrency(userShareOfDepreciation)}</strong> per
              member added to your recapture liability. The Section 121 capital
              gains exclusion does <strong>not</strong> protect you from this
              tax.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // OWNER-OCCUPIED MODE: Schedule A (existing logic)
  return (
    <div className="tab-fade-in">
      {/* STEP 1 */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header" style={{ fontSize: "1.3rem" }}>
          Step 1: What do we pay every month (Year {selectedYear})?
        </div>
        <div className="card-body">
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            Every month, we pay 4 things for this house. But the government only
            gives tax breaks on 2 of them.
          </p>
          <div className="tax-item-grid">
            <div className="tax-item yes">
              <div className="tax-item-header">
                <CheckCircle color="#4ade80" size={20} /> Mortgage Interest
              </div>
              <div className="tax-item-amount">
                {formatCurrency(monthlyInterest)} / mo
              </div>
              <div className="tax-item-note">
                This is the fee the bank charges you for borrowing. The IRS lets
                you write this off.
              </div>
            </div>
            <div className="tax-item no">
              <div className="tax-item-header">
                <XCircle color="#f87171" size={20} /> Mortgage Principal
              </div>
              <div className="tax-item-amount">
                {formatCurrency(monthlyPrincipal)} / mo
              </div>
              <div className="tax-item-note">
                This is money going into your own home equity. It's not an
                expense — it's like putting money in a savings account.
              </div>
            </div>
            <div className="tax-item yes">
              <div className="tax-item-header">
                <CheckCircle color="#4ade80" size={20} /> Property Tax
              </div>
              <div className="tax-item-amount">
                {formatCurrency(propertyTax)} / mo
              </div>
              <div className="tax-item-note">
                The tax you pay to the city of San Francisco. The IRS lets you
                write this off too.
              </div>
            </div>
            <div className="tax-item no">
              <div className="tax-item-header">
                <XCircle color="#f87171" size={20} /> HOA Dues
              </div>
              <div className="tax-item-amount">{formatCurrency(hoa)} / mo</div>
              <div className="tax-item-note">
                The fee for building maintenance, gym, etc. Not tax deductible
                on a home you live in.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2 */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header" style={{ fontSize: "1.3rem" }}>
          Step 2: Since we split the mortgage 50/50, we each get half
        </div>
        <div className="card-body">
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            The IRS only lets you deduct YOUR share of what you pay. Since the
            mortgage is in both brothers' names equally:
          </p>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: "250px",
                background: "rgba(96, 165, 250, 0.1)",
                border: "1px solid rgba(96, 165, 250, 0.3)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#60a5fa",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  fontSize: "1.1rem",
                }}
              >
                Your 50% Share (Year {selectedYear})
              </div>
              <div className="row">
                <span>Mortgage Interest:</span>{" "}
                <span>{formatCurrency(userShareOfInterest)} / yr</span>
              </div>
              <div className="row">
                <span>Property Tax:</span>{" "}
                <span>{formatCurrency(userShareOfPropertyTax)} / yr</span>
              </div>
              <hr style={{ opacity: 0.2 }} />
              <div className="row total">
                <span>Your Deductible Total:</span>{" "}
                <span style={{ color: "#4ade80" }}>
                  {formatCurrency(deductibleInterest + deductiblePropertyTax)} /
                  yr
                </span>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: "250px",
                background: "rgba(168, 85, 247, 0.1)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#a855f7",
                  fontWeight: "bold",
                  marginBottom: "12px",
                  fontSize: "1.1rem",
                }}
              >
                Brother's 50% Share (Year {selectedYear})
              </div>
              <div className="row">
                <span>Mortgage Interest:</span>{" "}
                <span>{formatCurrency(userShareOfInterest)} / yr</span>
              </div>
              <div className="row">
                <span>Property Tax:</span>{" "}
                <span>{formatCurrency(userShareOfPropertyTax)} / yr</span>
              </div>
              <hr style={{ opacity: 0.2 }} />
              <div className="row total">
                <span>His Deductible Total:</span>{" "}
                <span style={{ color: "#4ade80" }}>
                  {formatCurrency(deductibleInterest + deductiblePropertyTax)} /
                  yr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3 */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header" style={{ fontSize: "1.3rem" }}>
          Step 3: Are there any IRS limits that reduce this?
        </div>
        <div className="card-body">
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            The government puts caps on how much you can deduct. Let's check
            both:
          </p>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div
              style={{
                flex: 1,
                minWidth: "280px",
                background: "rgba(74, 222, 128, 0.05)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <CheckCircle color="#4ade80" size={24} />
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  Mortgage Interest Cap: CLEAR
                </span>
              </div>
              <div className="row">
                <span>IRS Limit:</span> <span>$750,000 of debt per person</span>
              </div>
              <div className="row">
                <span>Your share of loan:</span>{" "}
                <span>{formatCurrency(userShareOfLoan)}</span>
              </div>
              <div className="row" style={{ marginTop: "8px" }}>
                <span></span>{" "}
                <span style={{ color: "#4ade80" }}>
                  {formatCurrency(userShareOfLoan)} &lt; $750,000 ✓
                </span>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: "280px",
                background: "rgba(74, 222, 128, 0.05)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <CheckCircle color="#4ade80" size={24} />
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  SALT Cap: CLEAR
                </span>
              </div>
              <div className="row">
                <span>IRS Limit (2026):</span> <span>$40,400 total</span>
              </div>
              <div className="row">
                <span>CA State Tax:</span> <span>$16,000</span>
              </div>
              <div className="row">
                <span>+ Your Property Tax:</span>{" "}
                <span>{formatCurrency(userShareOfPropertyTax)}</span>
              </div>
              <div className="row">
                <span>Your SALT Total:</span>{" "}
                <span>{formatCurrency(saltTotal)}</span>
              </div>
              <div className="row" style={{ marginTop: "8px" }}>
                <span></span>{" "}
                <span style={{ color: "#4ade80" }}>
                  {formatCurrency(saltTotal)} &lt; $40,400 ✓
                </span>
              </div>
            </div>
          </div>
          <p
            style={{ color: "#94a3b8", marginTop: "16px", fontSize: "0.95rem" }}
          >
            Both caps cleared. 100% of your housing deductions are usable.
          </p>
        </div>
      </div>

      {/* STEP 4 */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header" style={{ fontSize: "1.3rem" }}>
          Step 4: How much money does this actually save you?
        </div>
        <div className="card-body">
          <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
            A "deduction" doesn't mean free money — it means you tell the IRS
            "don't tax me on this amount of my income." The savings depend on
            your tax bracket.
          </p>

          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              padding: "24px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                color: "#cbd5e1",
                marginBottom: "16px",
                fontWeight: "bold",
              }}
            >
              Without the house:
            </div>
            <div className="row">
              <span>Your income:</span> <span>$213,000</span>
            </div>
            <div className="row">
              <span>Standard deduction (everyone gets this):</span>{" "}
              <span>- $16,100</span>
            </div>
            <div className="row total">
              <span>Taxable income:</span> <span>$196,900</span>
            </div>
            <div className="row" style={{ marginTop: "8px" }}>
              <span>Tax bracket:</span>{" "}
              <span style={{ color: "#60a5fa" }}>
                24% (covers $105,701 - $201,775)
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <ArrowDown color="#a855f7" size={32} />
          </div>

          <div
            style={{
              background: "rgba(168, 85, 247, 0.1)",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                color: "#a855f7",
                marginBottom: "16px",
                fontWeight: "bold",
              }}
            >
              With the house (Year {selectedYear}):
            </div>
            <div className="row">
              <span>Your income:</span> <span>$213,000</span>
            </div>
            <div className="row">
              <span>CA State Tax (SALT):</span> <span>- $16,000</span>
            </div>
            <div className="row">
              <span>Your Property Tax (SALT):</span>{" "}
              <span>- {formatCurrency(deductiblePropertyTax)}</span>
            </div>
            <div className="row">
              <span>Your Mortgage Interest:</span>{" "}
              <span>- {formatCurrency(deductibleInterest)}</span>
            </div>
            <div className="row total">
              <span>Taxable income:</span>{" "}
              <span>{formatCurrency(213000 - totalItemized)}</span>
            </div>
          </div>

          <div
            style={{
              background: "rgba(74, 222, 128, 0.1)",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(74, 222, 128, 0.3)",
            }}
          >
            <div
              style={{
                color: "#4ade80",
                marginBottom: "16px",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              The Savings:
            </div>
            <div className="row">
              <span>Income you no longer pay tax on:</span>{" "}
              <span>{formatCurrency(incrementalDeduction)}</span>
            </div>
            <div className="row">
              <span>Your tax rate on that income:</span> <span>24%</span>
            </div>
            <hr style={{ opacity: 0.2, margin: "12px 0" }} />
            <div className="row">
              <span>Annual tax savings:</span>{" "}
              <span className="positive">
                {formatCurrency(annualTaxSavings)} / year
              </span>
            </div>
            <div
              className="row total"
              style={{ fontSize: "1.3rem", marginTop: "8px" }}
            >
              <span>Monthly tax savings:</span>
              <span className="positive">
                {formatCurrency(userTaxShield)} / month
              </span>
            </div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.9rem",
                marginTop: "16px",
                marginBottom: 0,
              }}
            >
              This is per person. Both brothers get this amount individually.
            </p>
          </div>
        </div>
      </div>

      {/* WHY IT DECREASES */}
      <div
        style={{
          background: "rgba(96, 165, 250, 0.1)",
          border: "1px solid rgba(96, 165, 250, 0.3)",
          padding: "16px 20px",
          borderRadius: "8px",
          display: "flex",
          gap: "12px",
        }}
      >
        <Info
          color="#60a5fa"
          size={28}
          style={{ flexShrink: 0, marginTop: "2px" }}
        />
        <div>
          <h3 style={{ color: "#60a5fa", margin: "0 0 8px 0" }}>
            Why does this number shrink over time?
          </h3>
          <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.5 }}>
            Your mortgage payment stays the same every month (
            {formatCurrency(mortgage)}), but over time more of it goes toward
            paying off the loan (principal) and less goes to the bank as a fee
            (interest). Since only the interest is deductible, your tax savings
            naturally decrease each year. Try dragging the year slider to see
            this in action.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TaxTab;
