import React, { useState, useMemo } from "react";
import {
  Home,
  DollarSign,
  Building,
  Calculator,
  TrendingUp,
  Clock,
  Scale,
  Info,
} from "lucide-react";
import { EditableSlider } from "./EditableSlider";
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
  const [operatingExpenseRate, setOperatingExpenseRate] = useState(0.5);

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

  // --- Rental (LLC Partnership — 25% cash flow, 50% tax benefits, REPS active losses) ---
  const llcCashFlowShare = 0.25;
  const llcTaxShare = 0.50;
  
  const buildingRatio = 0.8;
  const depreciationBasis = purchasePrice * buildingRatio;
  const annualDepreciation = depreciationBasis / 27.5;
  const userShareOfDepreciation = annualDepreciation * llcTaxShare;

  const rentalInterest = totalInterestForYear * llcTaxShare;
  const rentalPropertyTax = propertyTaxAnnual * llcTaxShare;
  const rentalHOA = currentHOAAnnual * llcTaxShare;

  // Operating expenses as a % of property value (covers cleaning, repairs, travel, insurance)
  const totalOperatingExpenses = purchasePrice * (operatingExpenseRate / 100);
  const userShareOfOperatingExpenses = totalOperatingExpenses * llcTaxShare;

  const totalRentalDeductions =
    rentalInterest +
    rentalPropertyTax +
    rentalHOA +
    userShareOfDepreciation +
    userShareOfOperatingExpenses;

  // IRS sees brothers receiving 100% of rent (50% each) because Dad is under the table
  const userShareOfRentIncomeTax = llcTaxShare; 
  const rentalIncomeTax = totalRent * 12 * userShareOfRentIncomeTax;
  const netRentalIncomeTax = rentalIncomeTax - totalRentalDeductions;

  // LLC + REPS: losses are NON-PASSIVE and offset W-2 income
  // If profit, we owe tax. If loss, we GET a tax refund (reduces W-2 taxes).
  const rentalTaxImpact = netRentalIncomeTax * marginalRate; // positive = owe, negative = savings
  const monthlyRentalTaxCost = rentalTaxImpact / 12; // positive = cost, negative = savings

  // Calculate cumulative tax savings from LLC losses up to selectedYear
  const cumulativeTaxSavings = useMemo(() => {
    let cumulative = 0;
    const startYear = moveOutYear + 1;
    for (let i = startYear; i <= selectedYear; i++) {
      const yearData = amortizationSchedule[i - 1] || { interest: 0 };
      const yInterest = yearData.interest * llcTaxShare;

      const yPropTaxAnnual =
        basePropertyTaxAnnual * Math.pow(1.02, i > 1 ? i - 1 : 0);
      const yPropTax = yPropTaxAnnual * llcTaxShare;

      const yHOAAnnual =
        baseHOA * 12 * Math.pow(1 + hoaInflation / 100, i > 1 ? i - 1 : 0);
      const yHOA = yHOAAnnual * llcTaxShare;

      const yDeductions =
        yInterest +
        yPropTax +
        yHOA +
        userShareOfDepreciation +
        userShareOfOperatingExpenses;
      const yIncome = totalRent * 12 * userShareOfRentIncomeTax;
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
    userShareOfRentIncomeTax,
    moveOutYear,
    llcTaxShare,
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
  // Cash flow is permanently 50% Dad, 25% User, 25% Brother
  const dadRentIncome = totalRent * 0.5;
  const dadExpenses = isRental
    ? (propertyCosts + totalOperatingExpenses / 12) * 0.5
    : propertyCosts * 0.5;
  const dadNet = dadRentIncome - dadExpenses;

  const userRentIncome = totalRent * 0.25;
  const userExpenses = isRental
    ? (propertyCosts + totalOperatingExpenses / 12) * llcCashFlowShare
    : propertyCosts * 0.25;
  const userNet = isRental
    ? userRentIncome - userExpenses + appliedTaxShield
    : userRentIncome - userRent - userExpenses + appliedTaxShield;

  const brotherRentIncome = totalRent * 0.25;
  const brotherExpenses = isRental
    ? (propertyCosts + totalOperatingExpenses / 12) * llcCashFlowShare
    : propertyCosts * 0.25;
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
                  Projection Year Showdown
                </span>
              </div>
              <EditableSlider
                label=""
                value={selectedYear}
                setValue={setSelectedYear}
                min={1}
                max={30}
                step={1}
                format="years"
                className="slider blue-slider"
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
          <EditableSlider
            label="Purchase Price"
            value={purchasePrice}
            setValue={setPurchasePrice}
            min={100000}
            max={1500000}
            step={10000}
            format="currency"
          />
          <EditableSlider
            label="Interest Rate"
            value={interestRate}
            setValue={setInterestRate}
            min={0.0}
            max={10.0}
            step={0.125}
            format="percentage"
          />
          <EditableSlider
            label="HOA Inflation"
            value={hoaInflation}
            setValue={setHoaInflation}
            min={2}
            max={10}
            step={0.5}
            format="percentage"
            className="slider purple-slider"
          />
          <EditableSlider
            label="Appreciation"
            value={appreciation}
            setValue={setAppreciation}
            min={-5}
            max={15}
            step={0.5}
            format="percentage"
            className="slider blue-slider"
          />
          {isRental && (
            <EditableSlider
              label="OpEx (% of Value/Yr)"
              value={operatingExpenseRate}
              setValue={setOperatingExpenseRate}
              min={0.1}
              max={3.0}
              step={0.05}
              format="percentage"
              className="slider red-slider"
            />
          )}
          <EditableSlider
            label="Move-Out Year"
            value={moveOutYear}
            setValue={setMoveOutYear}
            min={2}
            max={10}
            step={1}
            format="years"
          />
          {isRental ? (
            <EditableSlider
              label="Tenant Rent (Monthly)"
              value={tenantRent}
              setValue={setTenantRent}
              min={0}
              max={15000}
              step={100}
              format="currency/mo"
            />
          ) : (
            <>
              <EditableSlider
                label="Your Rent"
                value={userRent}
                setValue={setUserRent}
                min={0}
                max={10000}
                step={100}
                format="currency/mo"
                className="slider blue-slider"
              />
              <EditableSlider
                label="Brother's Rent"
                value={brotherRent}
                setValue={setBrotherRent}
                min={0}
                max={10000}
                step={100}
                format="currency/mo"
                className="slider purple-slider"
              />
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
            totalOperatingExpenses={totalOperatingExpenses}
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
            rentalIncome={rentalIncomeTax}
            netRentalIncome={netRentalIncomeTax}
            rentalTaxImpact={rentalTaxImpact}
            monthlyRentalTaxCost={monthlyRentalTaxCost}
            cumulativeTaxSavings={cumulativeTaxSavings}
            llcShare={llcTaxShare}
            userShareOfRentIncome={userShareOfRentIncomeTax}
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
            brotherRent={brotherRent}
            tenantRent={tenantRent}
            operatingExpenseRate={operatingExpenseRate}
            moveOutYear={moveOutYear}
            selectedYear={selectedYear}
            amortizationSchedule={amortizationSchedule}
          />
        )}
      </main>
    </div>
  );
}

export default App;
