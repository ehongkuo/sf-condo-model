import React from "react";
import { Info } from "lucide-react";
import { formatCurrency } from "./utils";

function CashFlowTab({
  isRental,
  setIsRental,
  userRent,
  setUserRent,
  brotherRent,
  setBrotherRent,
  tenantRent,
  setTenantRent,
  includeTaxSavings,
  setIncludeTaxSavings,
  totalRent,
  dadExpenses,
  dadRentIncome,
  dadNet,
  userExpenses,
  userRentIncome,
  userNet,
  userTaxShield,
  brotherExpenses,
  brotherRentIncome,
  brotherNet,
  propertyCosts,
  mortgage,
  propertyTax,
  hoa,
  totalOperatingExpenses,
  selectedYear,
}) {
  const dadShare = 0.5;
  const userShare = 0.25;
  const brotherShare = 0.25;

  const dadLabel = "50%";
  const userLabel = "25%";
  const brotherLabel = "25%";

  const opExMonthly = (totalOperatingExpenses || 0) / 12;

  // Gift tax check: Dad's net annual gift
  const dadNetAnnualGift = (dadExpenses - dadRentIncome) * 12;
  const marriedGiftLimit = 76000;

  return (
    <div className="tab-fade-in">
      <div className="card controls-card" style={{ paddingBottom: "16px" }}>
        <div className="split-info">
          <div className="split-item total-pot">
            Total Rent Pot: {formatCurrency(totalRent)}
          </div>
        </div>
      </div>

      {/* Gift Tax Warning */}
      {dadNetAnnualGift > marriedGiftLimit && (
        <div
          style={{
            background: "rgba(251, 146, 60, 0.1)",
            border: "1px solid rgba(251, 146, 60, 0.4)",
            padding: "16px 20px",
            borderRadius: "8px",
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <Info
            color="#fb923c"
            size={28}
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div>
            <h3 style={{ color: "#fb923c", margin: "0 0 8px 0" }}>
              Gift Tax Warning
            </h3>
            <p
              style={{
                margin: 0,
                color: "#e2e8f0",
                lineHeight: 1.5,
                fontSize: "0.95rem",
              }}
            >
              Dad's net annual contribution is{" "}
              <strong>{formatCurrency(dadNetAnnualGift)}</strong>, which exceeds
              the <strong>{formatCurrency(marriedGiftLimit)}</strong> married
              gift-splitting limit. Dad & Mom will need to file{" "}
              <strong>IRS Form 709</strong> for this year. No tax is owed — it
              just reduces their lifetime exemption (~$25M).
            </p>
          </div>
        </div>
      )}

      <div className="grid-3">
        <div className="card dad-card hover-card">
          <div className="card-header">
            Dad's Net Monthly Flow (Year {selectedYear})
          </div>
          <div className="card-body">
            <div
              className="row"
              style={{ marginBottom: "4px", fontWeight: "bold" }}
            >
              <span>
                {dadLabel} Property Costs{isRental ? " + OpEx" : ""}:
              </span>{" "}
              <span className="negative">-{formatCurrency(dadExpenses)}</span>
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
                ├─ Mortgage ({formatCurrency(mortgage)} × {dadLabel}):
              </span>{" "}
              <span>-{formatCurrency(mortgage * dadShare)}</span>
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
                ├─ Tax ({formatCurrency(propertyTax)} × {dadLabel}):
              </span>{" "}
              <span>-{formatCurrency(propertyTax * dadShare)}</span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
                marginBottom: isRental ? "0px" : "8px",
              }}
            >
              <span>
                {isRental ? "├" : "└"}─ HOA ({formatCurrency(hoa)} × {dadLabel}
                ):
              </span>{" "}
              <span>-{formatCurrency(hoa * dadShare)}</span>
            </div>
            {isRental && (
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
                  └─ OpEx ({formatCurrency(opExMonthly)} × {dadLabel}):
                </span>{" "}
                <span>-{formatCurrency(opExMonthly * dadShare)}</span>
              </div>
            )}
            <div className="row">
              <span>{dadLabel} Rent Pot:</span>{" "}
              <span className="positive">+{formatCurrency(dadRentIncome)}</span>
            </div>
            <hr />
            <div className="row total">
              <span>Net Flow:</span>{" "}
              <span className={dadNet >= 0 ? "positive" : "negative"}>
                {formatCurrency(dadNet)}
              </span>
            </div>
          </div>
        </div>
        <div className="card user-card hover-card">
          <div className="card-header">
            Your Net Monthly Flow (Year {selectedYear})
          </div>
          <div className="card-body">
            <div
              className="row"
              style={{ marginBottom: "4px", fontWeight: "bold" }}
            >
              <span>
                {userLabel} Property Costs{isRental ? " + OpEx" : ""}:
              </span>{" "}
              <span className="negative">-{formatCurrency(userExpenses)}</span>
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
                ├─ Mortgage ({formatCurrency(mortgage)} × {userLabel}):
              </span>{" "}
              <span>-{formatCurrency(mortgage * userShare)}</span>
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
                ├─ Tax ({formatCurrency(propertyTax)} × {userLabel}):
              </span>{" "}
              <span>-{formatCurrency(propertyTax * userShare)}</span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
                marginBottom: isRental ? "0px" : "8px",
              }}
            >
              <span>
                {isRental ? "├" : "└"}─ HOA ({formatCurrency(hoa)} × {userLabel}
                ):
              </span>{" "}
              <span>-{formatCurrency(hoa * userShare)}</span>
            </div>
            {isRental && (
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
                  └─ OpEx ({formatCurrency(opExMonthly)} × {userLabel}):
                </span>{" "}
                <span>-{formatCurrency(opExMonthly * userShare)}</span>
              </div>
            )}
            {!isRental && (
              <div className="row">
                <span>Rent Paid Out:</span>{" "}
                <span className="negative">-{formatCurrency(userRent)}</span>
              </div>
            )}
            <div className="row">
              <span>{userLabel} Rent Pot:</span>{" "}
              <span className="positive">
                +{formatCurrency(userRentIncome)}
              </span>
            </div>
            {includeTaxSavings && (
              <div className="row">
                <span>Tax Savings (LLC/REPS):</span>{" "}
                <span className={userTaxShield >= 0 ? "positive" : "negative"}>
                  {userTaxShield > 0 ? "+" : ""}
                  {formatCurrency(userTaxShield)}
                </span>
              </div>
            )}
            <hr />
            <div className="row total">
              <span>Net Flow:</span>{" "}
              <span className={userNet >= 0 ? "positive" : "negative"}>
                {formatCurrency(userNet)}
              </span>
            </div>
          </div>
        </div>
        <div className="card user-card hover-card">
          <div className="card-header">
            Brother's Net Monthly Flow (Year {selectedYear})
          </div>
          <div className="card-body">
            <div
              className="row"
              style={{ marginBottom: "4px", fontWeight: "bold" }}
            >
              <span>
                {brotherLabel} Property Costs{isRental ? " + OpEx" : ""}:
              </span>{" "}
              <span className="negative">
                -{formatCurrency(brotherExpenses)}
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
                ├─ Mortgage ({formatCurrency(mortgage)} × {brotherLabel}):
              </span>{" "}
              <span>-{formatCurrency(mortgage * brotherShare)}</span>
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
                ├─ Tax ({formatCurrency(propertyTax)} × {brotherLabel}):
              </span>{" "}
              <span>-{formatCurrency(propertyTax * brotherShare)}</span>
            </div>
            <div
              className="row"
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                paddingLeft: "16px",
                marginBottom: isRental ? "0px" : "8px",
              }}
            >
              <span>
                {isRental ? "├" : "└"}─ HOA ({formatCurrency(hoa)} ×{" "}
                {brotherLabel}):
              </span>{" "}
              <span>-{formatCurrency(hoa * brotherShare)}</span>
            </div>
            {isRental && (
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
                  └─ OpEx ({formatCurrency(opExMonthly)} × {brotherLabel}):
                </span>{" "}
                <span>-{formatCurrency(opExMonthly * brotherShare)}</span>
              </div>
            )}
            {!isRental && (
              <div className="row">
                <span>Rent Paid Out:</span>{" "}
                <span className="negative">-{formatCurrency(brotherRent)}</span>
              </div>
            )}
            <div className="row">
              <span>{brotherLabel} Rent Pot:</span>{" "}
              <span className="positive">
                +{formatCurrency(brotherRentIncome)}
              </span>
            </div>
            {includeTaxSavings && (
              <div className="row">
                <span>Tax Savings (LLC/REPS):</span>{" "}
                <span className={userTaxShield >= 0 ? "positive" : "negative"}>
                  {userTaxShield > 0 ? "+" : ""}
                  {formatCurrency(userTaxShield)}
                </span>
              </div>
            )}
            <hr />
            <div className="row total">
              <span>Net Flow:</span>{" "}
              <span className={brotherNet >= 0 ? "positive" : "negative"}>
                {formatCurrency(brotherNet)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashFlowTab;
