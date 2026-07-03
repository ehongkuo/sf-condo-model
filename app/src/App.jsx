import React, { useState, useMemo } from 'react';
import { Home, DollarSign, Building, Calculator, Clock, TrendingUp } from 'lucide-react';
import CashFlowTab from './CashFlowTab';
import LoanTab from './LoanTab';
import TaxTab from './TaxTab';
import LongTermTab from './LongTermTab';
import { formatCurrency } from './utils';

function App() {
  const [activeTab, setActiveTab] = useState('cashflow');

  // Shared state
  const [userRent, setUserRent] = useState(2500);
  const [brotherRent, setBrotherRent] = useState(1500);
  const [isRental, setIsRental] = useState(false);
  const [tenantRent, setTenantRent] = useState(4000);
  const [includeTaxSavings, setIncludeTaxSavings] = useState(true);
  const [purchasePrice, setPurchasePrice] = useState(1050000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [selectedYear, setSelectedYear] = useState(1);

  const totalRent = isRental ? tenantRent : userRent + brotherRent;

  // 1. Property Calculations
  const downPayment = purchasePrice * 0.20;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = (interestRate / 100) / 12;
  const numPayments = 360;

  const mortgage = loanAmount > 0 && interestRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;

  const propertyTaxAnnual = purchasePrice * 0.0118;
  const propertyTax = propertyTaxAnnual / 12;
  const hoa = 1556.00;
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
      schedule.push({ year, principal: principalThisYear, interest: interestThisYear, balance: balance > 0 ? balance : 0 });
    }
    return schedule;
  }, [loanAmount, monthlyRate, mortgage]);

  // 3. Tax Calculations (Verified against 2026 IRS / OBBBA rules)
  const currentYearData = amortizationSchedule[selectedYear - 1] || { interest: 0 };
  const totalInterestForYear = currentYearData.interest;
  const totalPrincipalForYear = currentYearData.principal;

  // Each brother's 50% share
  const userShareOfInterest = totalInterestForYear / 2;
  const userShareOfPropertyTax = propertyTaxAnnual / 2;

  // IRS Caps Check
  const userShareOfLoan = loanAmount / 2;
  const tcjaLimit = 750000;
  const interestFullyDeductible = userShareOfLoan <= tcjaLimit;
  const deductibleInterest = interestFullyDeductible ? userShareOfInterest : userShareOfInterest * (tcjaLimit / userShareOfLoan);

  const caStateTax = 16000;
  const saltTotal = caStateTax + userShareOfPropertyTax;
  const saltCap = 40400;
  const saltUnderCap = saltTotal <= saltCap;
  const deductiblePropertyTax = saltUnderCap ? userShareOfPropertyTax : Math.max(0, saltCap - caStateTax);

  // Total itemized vs standard deduction
  const totalItemized = caStateTax + deductiblePropertyTax + deductibleInterest;
  const standardDeduction = 16100;
  const incrementalDeduction = totalItemized - standardDeduction;

  // Tax savings at 24% marginal rate
  const marginalRate = 0.24;
  const annualTaxSavings = incrementalDeduction * marginalRate;
  const userTaxShield = annualTaxSavings / 12;
  const appliedTaxShield = includeTaxSavings ? userTaxShield : 0;

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

  // Helpers
  const monthlyInterest = totalInterestForYear / 12;
  const monthlyPrincipal = totalPrincipalForYear / 12;

  return (
    <div className="container">
      <header className="header">
        <h1><Home className="icon" /> SF Condo Financial Model</h1>
        <p>1111 Bay Street, Unit 307</p>
      </header>

      <div className="sticky-control card" style={{
        position: 'sticky', top: '20px', zIndex: 100, marginBottom: '24px',
        padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(96, 165, 250, 0.5)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <Clock color="#60a5fa" size={24} />
          <div>
            <div style={{fontWeight: 'bold', fontSize: '1.1rem', color: '#f8fafc'}}>Projection Year: {selectedYear}</div>
            <div style={{fontSize: '0.9rem', color: '#94a3b8'}}>Drag to see how tax savings change over time.</div>
          </div>
        </div>
        <input type="range" min="1" max="30" step="1" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="slider blue-slider" style={{width: '300px', margin: 0}} />
      </div>

      <div className="nav-tabs">
        <button className={`nav-btn ${activeTab === 'cashflow' ? 'active' : ''}`} onClick={() => setActiveTab('cashflow')}>
          <DollarSign size={18} /> Cash Flow & Rent
        </button>
        <button className={`nav-btn ${activeTab === 'loan' ? 'active' : ''}`} onClick={() => setActiveTab('loan')}>
          <Building size={18} /> Property & Loan Math
        </button>
        <button className={`nav-btn ${activeTab === 'taxes' ? 'active' : ''}`} onClick={() => setActiveTab('taxes')}>
          <Calculator size={18} /> Tax Savings Explained
        </button>
        <button className={`nav-btn ${activeTab === 'longterm' ? 'active' : ''}`} onClick={() => setActiveTab('longterm')}>
          <TrendingUp size={18} /> Long-Term ROI
        </button>
      </div>

      <main className="main-content">

        {activeTab === 'cashflow' && (
          <CashFlowTab
            isRental={isRental} setIsRental={setIsRental}
            userRent={userRent} setUserRent={setUserRent}
            brotherRent={brotherRent} setBrotherRent={setBrotherRent}
            tenantRent={tenantRent} setTenantRent={setTenantRent}
            includeTaxSavings={includeTaxSavings} setIncludeTaxSavings={setIncludeTaxSavings}
            totalRent={totalRent}
            dadExpenses={dadExpenses} dadRentIncome={dadRentIncome} dadNet={dadNet}
            userExpenses={userExpenses} userRentIncome={userRentIncome} userNet={userNet} userTaxShield={userTaxShield}
            brotherExpenses={brotherExpenses} brotherRentIncome={brotherRentIncome} brotherNet={brotherNet}
            propertyCosts={propertyCosts}
            selectedYear={selectedYear}
          />
        )}

        {activeTab === 'loan' && (
          <LoanTab
            purchasePrice={purchasePrice} setPurchasePrice={setPurchasePrice}
            interestRate={interestRate} setInterestRate={setInterestRate}
            loanAmount={loanAmount} mortgage={mortgage} propertyTax={propertyTax} hoa={hoa} propertyCosts={propertyCosts}
            amortizationSchedule={amortizationSchedule} selectedYear={selectedYear}
          />
        )}

        {activeTab === 'taxes' && (
          <TaxTab
            isRental={isRental}
            selectedYear={selectedYear}
            monthlyInterest={monthlyInterest} monthlyPrincipal={monthlyPrincipal}
            propertyTax={propertyTax} hoa={hoa} mortgage={mortgage}
            userShareOfInterest={userShareOfInterest} userShareOfPropertyTax={userShareOfPropertyTax} userShareOfLoan={userShareOfLoan}
            deductibleInterest={deductibleInterest} deductiblePropertyTax={deductiblePropertyTax}
            saltTotal={saltTotal} totalItemized={totalItemized} incrementalDeduction={incrementalDeduction}
            annualTaxSavings={annualTaxSavings} userTaxShield={userTaxShield}
            purchasePrice={purchasePrice} totalInterestForYear={totalInterestForYear} propertyTaxAnnual={propertyTaxAnnual}
            totalRent={totalRent}
          />
        )}

        {activeTab === 'longterm' && (
          <LongTermTab
            purchasePrice={purchasePrice} loanAmount={loanAmount}
            amortizationSchedule={amortizationSchedule}
            hoa={hoa} propertyTaxAnnual={propertyTaxAnnual}
          />
        )}

      </main>
    </div>
  );
}

export default App;
