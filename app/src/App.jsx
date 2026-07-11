import React, { useState, useMemo } from "react";
import {
  Home,
  DollarSign,
  Building,
  Calculator,
  TrendingUp,
  Scale,
  Clock,
  ChevronDown,
  ChevronUp,
  Sliders,
  Users,
  User,
  Wrench,
  Percent,
  Activity
} from "lucide-react";
import { EditableSlider } from "./EditableSlider";
import CashFlowTab from "./CashFlowTab";
import LoanTab from "./LoanTab";
import TaxTab from "./TaxTab";
import LongTermTab from "./LongTermTab";
import OpportunityCostTab from "./OpportunityCostTab";
import { formatCurrency } from "./utils";

const TAB_CONFIG = [
  { id: "cashflow", icon: DollarSign, label: "Cash Flow" },
  { id: "loan", icon: Building, label: "Loan" },
  { id: "taxes", icon: Calculator, label: "Taxes" },
  { id: "longterm", icon: TrendingUp, label: "Long-Term" },
  { id: "opportunity", icon: Scale, label: "Buy vs Rent" },
];

const ContextualSlider = ({ icon: Icon, label, value, setValue, min, max, step, format = "currency" }) => {
  let displayValue = value;
  if (format.startsWith("currency")) {
    displayValue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  } else if (format.startsWith("percentage")) {
    displayValue = `${value}%`;
  }
  if (format === "currency/mo") displayValue += "/mo";
  if (format === "years") displayValue += " yrs";

  return (
    <div className="year-badge-container">
      <div className="year-text">
        <Icon size={13} />
        {label}: {displayValue}
      </div>
      <div className="year-slider-inline">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="slider blue-slider"
          style={{ width: "140px", margin: 0, flexShrink: 0 }}
        />
      </div>
    </div>
  );
};

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
  const [baseHOA, setBaseHOA] = useState(1556.0);
  const [hoaInflation, setHoaInflation] = useState(4.0);
  const [appreciation, setAppreciation] = useState(3.0);
  const [rentInflation, setRentInflation] = useState(3.0);
  const [moveOutYear, setMoveOutYear] = useState(5);
  const [operatingExpenseRate, setOperatingExpenseRate] = useState(0.5);

  const totalRent = isRental 
    ? tenantRent * Math.pow(1 + rentInflation / 100, selectedYear > 1 ? selectedYear - 1 : 0) 
    : userRent + brotherRent;

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
    <div className="app-layout">
      {/* ─── SIDEBAR ─── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <Home size={22} />
        </div>
        {TAB_CONFIG.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`sidebar-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
            title={label}
          >
            <Icon size={20} />
            <span className="sidebar-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* ─── TOP BAR ─── */}
      <header className="topbar">
        <div className="topbar-left" style={{ gap: "16px" }}>
          <h1 className="topbar-title">SF Condo Financial Model</h1>
          
          <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
            <ContextualSlider icon={Home} label="Price" value={purchasePrice} setValue={setPurchasePrice} min={900000} max={1500000} step={10000} format="currency" />
            
            {activeTab === "cashflow" && (
              <>
                <ContextualSlider icon={Building} label="HOA" value={baseHOA} setValue={setBaseHOA} min={500} max={2500} step={10} format="currency/mo" />
                {isRental ? (
                  <>
                    <ContextualSlider icon={Users} label="Tenant Rent" value={tenantRent} setValue={setTenantRent} min={5500} max={9000} step={100} format="currency/mo" />
                    <ContextualSlider icon={Wrench} label="OpEx" value={operatingExpenseRate} setValue={setOperatingExpenseRate} min={0} max={5} step={0.1} format="percentage" />
                  </>
                ) : (
                  <>
                    <ContextualSlider icon={User} label="You" value={userRent} setValue={setUserRent} min={2500} max={4000} step={50} format="currency/mo" />
                    <ContextualSlider icon={User} label="Brother" value={brotherRent} setValue={setBrotherRent} min={2500} max={4000} step={50} format="currency/mo" />
                  </>
                )}
              </>
            )}
            
            {activeTab === "loan" && (
              <ContextualSlider icon={Percent} label="Rate" value={interestRate} setValue={setInterestRate} min={5.5} max={7.5} step={0.125} format="percentage" />
            )}
            
            {activeTab === "longterm" && (
              <>
                <ContextualSlider icon={TrendingUp} label="Appreciation" value={appreciation} setValue={setAppreciation} min={0} max={10} step={0.5} format="percentage" />
                <ContextualSlider icon={Clock} label="Move Out" value={moveOutYear} setValue={setMoveOutYear} min={2} max={10} step={1} format="years" />
                <ContextualSlider icon={Activity} label="HOA Infl." value={hoaInflation} setValue={setHoaInflation} min={1} max={10} step={0.5} format="percentage" />
              </>
            )}
            
            {activeTab === "opportunity" && (
              <>
                <ContextualSlider icon={TrendingUp} label="Appreciation" value={appreciation} setValue={setAppreciation} min={0} max={10} step={0.5} format="percentage" />
                <ContextualSlider icon={TrendingUp} label="Rent Infl." value={rentInflation} setValue={setRentInflation} min={0} max={10} step={0.5} format="percentage" />
              </>
            )}
          </div>
        </div>
        <div className="topbar-right">
          <div className="topbar-badges">
            <div className="year-badge-container">
              <div className="year-text">
                <Clock size={13} />
                Year {selectedYear}
              </div>
              <div className="year-slider-inline">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="slider blue-slider"
                  style={{ width: "140px", margin: 0, flexShrink: 0 }}
                />
              </div>
            </div>
            <label 
              className="topbar-badge" 
              style={{ 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                background: includeTaxSavings ? "rgba(52, 211, 153, 0.1)" : "rgba(255, 255, 255, 0.05)",
                borderColor: includeTaxSavings ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.08)",
                color: includeTaxSavings ? "var(--positive)" : "var(--text-secondary)"
              }}
            >
              <input 
                type="checkbox" 
                checked={includeTaxSavings} 
                onChange={(e) => setIncludeTaxSavings(e.target.checked)} 
                style={{ margin: 0, cursor: "pointer" }} 
              />
              Tax Savings
            </label>
            <span 
              className={`topbar-badge ${isRental ? "badge-purple" : "badge-blue"}`}
              style={{ cursor: "pointer" }}
              onClick={() => setIsRental(!isRental)}
              title="Click to toggle between Owner and Rental mode"
            >
              {isRental ? "Rental" : "Owner"}
            </span>
            <span className={`topbar-badge ${userNet >= 0 ? "badge-green" : "badge-red"}`}>
              Net: {formatCurrency(userNet)}/mo
            </span>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="main-content">
        <h2 className="tab-page-title">
          {activeTab === "cashflow" && "Monthly Cash Flow"}
          {activeTab === "loan" && "Loan Details"}
          {activeTab === "taxes" && "Tax Implications"}
          {activeTab === "longterm" && "Long-Term Equity"}
          {activeTab === "opportunity" && "Opportunity Cost"}
        </h2>
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
            rentInflation={rentInflation}
            setRentInflation={setRentInflation}
          />
        )}
      </main>
    </div>
  );
}

export default App;
