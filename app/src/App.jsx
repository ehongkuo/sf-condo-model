import React, { useState, useMemo } from "react";
import {
  Home,
  DollarSign,
  Building,
  Calculator,
  TrendingUp,
  Clock,
  Scale,
} from "lucide-react";
import CashFlowTab from "./CashFlowTab";
import LoanTab from "./LoanTab";
import TaxTab from "./TaxTab";
import LongTermTab from "./LongTermTab";
import OpportunityCostTab from "./OpportunityCostTab";
import { formatCurrency } from "./utils";

function App() {
  const [activeTab, setActiveTab] = useState("cashflow");

  // Shared state
  const [userRent, setUserRent] = useState(3200);
  const [brotherRent, setBrotherRent] = useState(3000);
  const [isRental, setIsRental] = useState(false);
  const [tenantRent, setTenantRent] = useState(6500);
  const [includeTaxSavings, setIncludeTaxSavings] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1);

  // Global Controls State
  const [purchasePrice, setPurchasePrice] = useState(1050000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [hoaInflation, setHoaInflation] = useState(4.0);
  const [appreciation, setAppreciation] = useState(3.0);
  const [moveOutYear, setMoveOutYear] = useState(5);

  const totalRent = isRental ? tenantRent : userRent + brotherRent;

  // 1. Property Calculations (Base values)
  const downPayment = purchasePrice * 0.2;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = 360;

  const mortgage =
    loanAmount > 0
      ? interestRate > 0
        ? (loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)
        : loanAmount / numPayments
      : 0;

  // Dynamic Property Costs based on selectedYear
  const basePropertyTaxAnnual = purchasePrice * 0.0118;
  const propertyTaxAnnual =
    basePropertyTaxAnnual *
    Math.pow(1.02, selectedYear > 1 ? selectedYear - 1 : 0); // Prop 13 cap
  const propertyTax = propertyTaxAnnual / 12;

  const baseHOA = 1556.0;
  const currentHOAAnnual =
    baseHOA *
    12 *
    Math.pow(1 + hoaInflation / 100, selectedYear > 1 ? selectedYear - 1 : 0);
  const hoa = currentHOAAnnual / 12;

  const propertyCosts = mortgage + propertyTax + hoa;

  // 2. Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    const schedule = [];
    let balance = loanAmount;
    for (let year = 1; year <= 30; year++) {
      let principalThisYear = 0;
      let interestThisYear = 0;
      for (let month = 1; month <= 12; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = mortgage - interestPayment;
        interestThisYear += interestPayment;
        principalThisYear += principalPayment;
        balance -= principalPayment;
      }
      schedule.push({
        year,
        principal: principalThisYear,
        interest: interestThisYear,
        balance: balance > 0 ? balance : 0,
      });
    }
    return schedule;
  }, [loanAmount, monthlyRate, mortgage]);

  // 3. Tax Calculations
  const currentYearData = amortizationSchedule[selectedYear - 1] || {
    interest: 0,
    principal: 0,
  };
  const totalInterestForYear = currentYearData.interest;
  const totalPrincipalForYear = currentYearData.principal;
  const monthlyInterest = totalInterestForYear / 12;
  const monthlyPrincipal = totalPrincipalForYear / 12;

  // --- Owner Occupied (Schedule A) ---
  const userShareOfInterest = totalInterestForYear / 2;
  const userShareOfPropertyTax = propertyTaxAnnual / 2;
  const userShareOfLoan = loanAmount / 2;

  const tcjaLimit = 750000;
  const interestFullyDeductible = userShareOfLoan <= tcjaLimit;
  const deductibleInterest = interestFullyDeductible
    ? userShareOfInterest
    : userShareOfInterest * (tcjaLimit / userShareOfLoan);

  const caStateTax = 16000;
  const saltTotal = caStateTax + userShareOfPropertyTax;
  const saltCap = 40400;
  const saltUnderCap = saltTotal <= saltCap;
  const deductiblePropertyTax = saltUnderCap
    ? userShareOfPropertyTax
    : Math.max(0, saltCap - caStateTax);

  const totalItemized = caStateTax + deductiblePropertyTax + deductibleInterest;
  const standardDeduction = 16100;
  const incrementalDeduction = totalItemized - standardDeduction;

  const marginalRate = 0.24;
  const annualTaxSavings = incrementalDeduction * marginalRate;
  const userTaxShieldScheduleA = annualTaxSavings / 12;

  // --- Rental (LLC Partnership — 1/3 split, REPS active losses) ---
  const llcShare = 1 / 3;
  const buildingRatio = 0.8;
  const depreciationBasis = purchasePrice * buildingRatio;
  const annualDepreciation = depreciationBasis / 27.5;
  const userShareOfDepreciation = annualDepreciation * llcShare;

  const rentalInterest = totalInterestForYear * llcShare;
  const rentalPropertyTax = propertyTaxAnnual * llcShare;
  const rentalHOA = currentHOAAnnual * llcShare;

  // Operating expenses as a % of property value (covers cleaning, repairs, travel, insurance)
  const operatingExpenseRate = 0.0075; // 0.75% of property value per year
  const totalOperatingExpenses = purchasePrice * operatingExpenseRate;
  const userShareOfOperatingExpenses = totalOperatingExpenses * llcShare;

  const totalRentalDeductions =
    rentalInterest +
    rentalPropertyTax +
    rentalHOA +
    userShareOfDepreciation +
    userShareOfOperatingExpenses;

  const rentalIncome = totalRent * 12 * llcShare;
  const netRentalIncome = rentalIncome - totalRentalDeductions;

  // LLC + REPS: losses are NON-PASSIVE and offset W-2 income
  // If profit, we owe tax. If loss, we GET a tax refund (reduces W-2 taxes).
  const rentalTaxImpact = netRentalIncome * marginalRate; // positive = owe, negative = savings
  const monthlyRentalTaxCost = rentalTaxImpact / 12; // positive = cost, negative = savings

  // Calculate cumulative tax savings from LLC losses up to selectedYear
  const cumulativeTaxSavings = useMemo(() => {
    let cumulative = 0;
    for (let i = 1; i <= selectedYear; i++) {
      const yearData = amortizationSchedule[i - 1] || { interest: 0 };
      const yInterest = yearData.interest * llcShare;

      const yPropTaxAnnual =
        basePropertyTaxAnnual * Math.pow(1.02, i > 1 ? i - 1 : 0);
      const yPropTax = yPropTaxAnnual * llcShare;

      const yHOAAnnual =
        baseHOA * 12 * Math.pow(1 + hoaInflation / 100, i > 1 ? i - 1 : 0);
      const yHOA = yHOAAnnual * llcShare;

      const yDeductions =
        yInterest +
        yPropTax +
        yHOA +
        userShareOfDepreciation +
        userShareOfOperatingExpenses;
      const yIncome = totalRent * 12 * llcShare;
      const yNet = yIncome - yDeductions;

      if (yNet < 0) {
        cumulative += Math.abs(yNet) * marginalRate;
      }
    }
    return cumulative;
  }, [
    selectedYear,
    amortizationSchedule,
    basePropertyTaxAnnual,
    baseHOA,
    hoaInflation,
    userShareOfDepreciation,
    userShareOfOperatingExpenses,
    totalRent,
  ]);

  // The actual applied tax shield (added to net cash flow)
  // Owner: positive savings from Schedule A.
  // Rental LLC: if loss → positive savings (reduces W-2 tax). If profit → negative cost.
  const appliedTaxShield = includeTaxSavings
    ? isRental
      ? -monthlyRentalTaxCost // negative * negative = positive savings; or negative cost if profit
      : userTaxShieldScheduleA
    : 0;

  // 4. Distributions
  const dadRentIncome = totalRent * 0.5;
  const dadExpenses = propertyCosts * 0.5;
  const dadNet = dadRentIncome - dadExpenses;

  const userRentIncome = totalRent * 0.25;
  const userExpenses = propertyCosts * 0.25;
  const userNet = isRental
    ? userRentIncome - userExpenses + appliedTaxShield
    : userRentIncome - userRent - userExpenses + appliedTaxShield;

  const brotherRentIncome = totalRent * 0.25;
  const brotherExpenses = propertyCosts * 0.25;
  const brotherNet = isRental
    ? brotherRentIncome - brotherExpenses + appliedTaxShield
    : brotherRentIncome - brotherRent - brotherExpenses + appliedTaxShield;

  return (
    <div className="container">
      <header className="header">
        <h1>
          <Home className="icon" /> SF Condo Financial Model
        </h1>
        <p>1111 Bay Street, Unit 307</p>
      </header>

      {/* GLOBAL CONTROL PANEL */}
      <div
        className="card"
        style={{
          position: "sticky",
          top: "20px",
          zIndex: 100,
          marginBottom: "24px",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "rgba(30, 41, 59, 0.98)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(96, 165, 250, 0.5)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        }}
      >
        {/* Top Row: Year Slider & Toggles */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: 1,
            }}
          >
            <Clock color="#60a5fa" size={28} />
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#f8fafc" }}>
                  Projection Year: {selectedYear}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="slider blue-slider"
                style={{ width: "100%", margin: 0 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: "0.9rem",
              }}
            >
              <input
                type="checkbox"
                checked={includeTaxSavings}
                onChange={(e) => setIncludeTaxSavings(e.target.checked)}
                style={{
                  accentColor: "#4ade80",
                  width: "16px",
                  height: "16px",
                }}
              />
              Tax Savings
            </label>
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "rgba(0,0,0,0.3)",
                padding: "3px",
                borderRadius: "8px",
              }}
            >
              <button
                onClick={() => setIsRental(false)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.85rem",
                  background: !isRental ? "#60a5fa" : "transparent",
                  color: !isRental ? "#fff" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
              >
                Owner Occupied
              </button>
              <button
                onClick={() => setIsRental(true)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.85rem",
                  background: isRental ? "#a855f7" : "transparent",
                  color: isRental ? "#fff" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
              >
                Rental Property
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Global Sliders */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>Purchase Price</label>
            <input
              type="range"
              min="800000"
              max="3000000"
              step="10000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {formatCurrency(purchasePrice)}
            </div>
          </div>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>Interest Rate</label>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.125"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {interestRate.toFixed(3)}%
            </div>
          </div>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>HOA Inflation</label>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={hoaInflation}
              onChange={(e) => setHoaInflation(Number(e.target.value))}
              className="slider purple-slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {hoaInflation.toFixed(1)}%
            </div>
          </div>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>Appreciation</label>
            <input
              type="range"
              min="-5"
              max="15"
              step="0.5"
              value={appreciation}
              onChange={(e) => setAppreciation(Number(e.target.value))}
              className="slider blue-slider"
              style={{ width: "100%" }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              {appreciation.toFixed(1)}%
            </div>
          </div>
          <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
            <label style={{ fontSize: "0.8rem" }}>Move-Out Year</label>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={moveOutYear}
              onChange={(e) => setMoveOutYear(Number(e.target.value))}
              className="slider"
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #4ade80, #f87171)",
              }}
            />
            <div className="rent-value" style={{ fontSize: "0.9rem" }}>
              Year {moveOutYear}
            </div>
          </div>
          {isRental ? (
            <div
              className="slider-group"
              style={{ flex: 1, minWidth: "150px" }}
            >
              <label style={{ fontSize: "0.8rem" }}>
                Tenant Rent (Monthly)
              </label>
              <input
                type="range"
                min="0"
                max="15000"
                step="100"
                value={tenantRent}
                onChange={(e) => setTenantRent(Number(e.target.value))}
                className="slider"
                style={{
                  width: "100%",
                  background: "linear-gradient(90deg, #60a5fa, #a855f7)",
                }}
              />
              <div className="rent-value" style={{ fontSize: "0.9rem" }}>
                {formatCurrency(tenantRent)}
              </div>
            </div>
          ) : (
            <>
              <div
                className="slider-group"
                style={{ flex: 1, minWidth: "150px" }}
              >
                <label style={{ fontSize: "0.8rem" }}>Your Rent</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={userRent}
                  onChange={(e) => setUserRent(Number(e.target.value))}
                  className="slider blue-slider"
                  style={{ width: "100%" }}
                />
                <div className="rent-value" style={{ fontSize: "0.9rem" }}>
                  {formatCurrency(userRent)}
                </div>
              </div>
              <div
                className="slider-group"
                style={{ flex: 1, minWidth: "150px" }}
              >
                <label style={{ fontSize: "0.8rem" }}>Brother's Rent</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={brotherRent}
                  onChange={(e) => setBrotherRent(Number(e.target.value))}
                  className="slider purple-slider"
                  style={{ width: "100%" }}
                />
                <div className="rent-value" style={{ fontSize: "0.9rem" }}>
                  {formatCurrency(brotherRent)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === "cashflow" ? "active" : ""}`}
          onClick={() => setActiveTab("cashflow")}
        >
          <DollarSign size={18} /> Cash Flow & Rent
        </button>
        <button
          className={`nav-btn ${activeTab === "loan" ? "active" : ""}`}
          onClick={() => setActiveTab("loan")}
        >
          <Building size={18} /> Property & Loan Math
        </button>
        <button
          className={`nav-btn ${activeTab === "taxes" ? "active" : ""}`}
          onClick={() => setActiveTab("taxes")}
        >
          <Calculator size={18} /> Tax Savings Explained
        </button>
        <button
          className={`nav-btn ${activeTab === "longterm" ? "active" : ""}`}
          onClick={() => setActiveTab("longterm")}
        >
          <TrendingUp size={18} /> Long-Term ROI
        </button>
        <button
          className={`nav-btn ${activeTab === "oppcost" ? "active" : ""}`}
          onClick={() => setActiveTab("oppcost")}
        >
          <Scale size={18} /> Buy vs Rent
        </button>
      </div>

      <main className="main-content">
        {activeTab === "cashflow" && (
          <CashFlowTab
            isRental={isRental}
            userRent={userRent}
            setUserRent={setUserRent}
            brotherRent={brotherRent}
            setBrotherRent={setBrotherRent}
            tenantRent={tenantRent}
            setTenantRent={setTenantRent}
            includeTaxSavings={includeTaxSavings}
            totalRent={totalRent}
            dadExpenses={dadExpenses}
            dadRentIncome={dadRentIncome}
            dadNet={dadNet}
            userExpenses={userExpenses}
            userRentIncome={userRentIncome}
            userNet={userNet}
            userTaxShield={appliedTaxShield}
            brotherExpenses={brotherExpenses}
            brotherRentIncome={brotherRentIncome}
            brotherNet={brotherNet}
            propertyCosts={propertyCosts}
            mortgage={mortgage}
            propertyTax={propertyTax}
            hoa={hoa}
            selectedYear={selectedYear}
          />
        )}

        {activeTab === "loan" && (
          <LoanTab
            purchasePrice={purchasePrice}
            loanAmount={loanAmount}
            mortgage={mortgage}
            propertyTax={propertyTax}
            hoa={hoa}
            propertyCosts={propertyCosts}
            amortizationSchedule={amortizationSchedule}
            selectedYear={selectedYear}
          />
        )}

        {activeTab === "taxes" && (
          <TaxTab
            isRental={isRental}
            selectedYear={selectedYear}
            monthlyInterest={monthlyInterest}
            monthlyPrincipal={monthlyPrincipal}
            propertyTax={propertyTax}
            hoa={hoa}
            mortgage={mortgage}
            userShareOfInterest={userShareOfInterest}
            userShareOfPropertyTax={userShareOfPropertyTax}
            userShareOfLoan={userShareOfLoan}
            deductibleInterest={deductibleInterest}
            deductiblePropertyTax={deductiblePropertyTax}
            saltTotal={saltTotal}
            totalItemized={totalItemized}
            incrementalDeduction={incrementalDeduction}
            annualTaxSavings={annualTaxSavings}
            userTaxShield={userTaxShieldScheduleA}

            // Rental LLC props passed down from App
            purchasePrice={purchasePrice}
            rentalInterest={rentalInterest}
            rentalPropertyTax={rentalPropertyTax}
            rentalHOA={rentalHOA}
            userShareOfDepreciation={userShareOfDepreciation}
            userShareOfOperatingExpenses={userShareOfOperatingExpenses}
            totalOperatingExpenses={totalOperatingExpenses}
            operatingExpenseRate={operatingExpenseRate}
            totalRentalDeductions={totalRentalDeductions}
            rentalIncome={rentalIncome}
            netRentalIncome={netRentalIncome}
            rentalTaxImpact={rentalTaxImpact}
            monthlyRentalTaxCost={monthlyRentalTaxCost}
            cumulativeTaxSavings={cumulativeTaxSavings}
            llcShare={llcShare}
          />
        )}

        {activeTab === "longterm" && (
          <LongTermTab
            purchasePrice={purchasePrice}
            loanAmount={loanAmount}
            amortizationSchedule={amortizationSchedule}
            baseHOA={baseHOA}
            basePropertyTaxAnnual={basePropertyTaxAnnual}
            hoaInflation={hoaInflation}
            appreciation={appreciation}
            moveOutYear={moveOutYear}
          />
        )}

        {activeTab === "oppcost" && (
          <OpportunityCostTab
            purchasePrice={purchasePrice}
            loanAmount={loanAmount}
            mortgage={mortgage}
            baseHOA={baseHOA}
            basePropertyTaxAnnual={basePropertyTaxAnnual}
            hoaInflation={hoaInflation}
            appreciation={appreciation}
            userRent={userRent}
            totalRent={totalRent}
            selectedYear={selectedYear}
            amortizationSchedule={amortizationSchedule}
            userTaxShield={appliedTaxShield}
          />
        )}
      </main>
    </div>
  );
}

export default App;
