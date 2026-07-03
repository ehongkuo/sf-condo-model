import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, DollarSign, PieChart as PieChartIcon, Building, CalendarDays, Calculator, Clock, CheckCircle, XCircle, ArrowDown, Info } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

function App() {
  const [activeTab, setActiveTab] = useState('taxes'); 

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

  // Helper for the monthly interest/principal split display
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
      </div>
      
      <main className="main-content">
        
        {/* TAB 1: CASH FLOW */}
        {activeTab === 'cashflow' && (
          <div className="tab-fade-in">
            <div className="card controls-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h2>Adjust Rent Payments</h2>
                <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.95rem'}}>
                    <input 
                      type="checkbox" 
                      checked={includeTaxSavings} 
                      onChange={(e) => setIncludeTaxSavings(e.target.checked)} 
                      style={{accentColor: '#4ade80', width: '16px', height: '16px'}}
                    />
                    Include Tax Savings
                  </label>
                  <div style={{display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px'}}>
                    <button 
                      onClick={() => setIsRental(false)}
                      style={{padding: '6px 12px', borderRadius: '6px', border: 'none', background: !isRental ? '#60a5fa' : 'transparent', color: !isRental ? '#fff' : '#94a3b8', cursor: 'pointer', fontWeight: 'bold'}}
                    >Owner Occupied</button>
                    <button 
                      onClick={() => setIsRental(true)}
                      style={{padding: '6px 12px', borderRadius: '6px', border: 'none', background: isRental ? '#a855f7' : 'transparent', color: isRental ? '#fff' : '#94a3b8', cursor: 'pointer', fontWeight: 'bold'}}
                    >Rental Property</button>
                  </div>
                </div>
              </div>
              
              {!isRental ? (
                <div className="sliders-wrapper">
                  <div className="slider-group">
                    <label>Your Rent Contribution</label>
                    <input type="range" min="0" max="5000" step="100" value={userRent} onChange={(e) => setUserRent(Number(e.target.value))} className="slider blue-slider" />
                    <div className="rent-value">{formatCurrency(userRent)}</div>
                  </div>
                  <div className="slider-group">
                    <label>Brother's Rent Contribution</label>
                    <input type="range" min="0" max="5000" step="100" value={brotherRent} onChange={(e) => setBrotherRent(Number(e.target.value))} className="slider purple-slider" />
                    <div className="rent-value">{formatCurrency(brotherRent)}</div>
                  </div>
                </div>
              ) : (
                <div className="sliders-wrapper">
                  <div className="slider-group" style={{width: '100%'}}>
                    <label>Tenant Rent Income</label>
                    <input type="range" min="0" max="8000" step="100" value={tenantRent} onChange={(e) => setTenantRent(Number(e.target.value))} className="slider" style={{background: 'linear-gradient(90deg, #60a5fa, #a855f7)'}} />
                    <div className="rent-value">{formatCurrency(tenantRent)}</div>
                  </div>
                </div>
              )}
              
              <div className="split-info">
                <div className="split-item total-pot">Total Rent Pot: {formatCurrency(totalRent)}</div>
              </div>
            </div>
            <div className="grid">
              <div className="card dad-card">
                <div className="card-header">Dad's Net Monthly Flow (Year {selectedYear})</div>
                <div className="card-body">
                  <div className="row"><span>50% Property Costs:</span> <span className="negative">-{formatCurrency(dadExpenses)}</span></div>
                  <div className="row"><span>50% Rent Pot:</span> <span className="positive">+{formatCurrency(dadRentIncome)}</span></div>
                  <hr />
                  <div className="row total"><span>Net Flow:</span> <span className={dadNet >= 0 ? "positive" : "negative"}>{formatCurrency(dadNet)}</span></div>
                </div>
              </div>
              <div className="card user-card">
                <div className="card-header">Your Net Monthly Flow (Year {selectedYear})</div>
                <div className="card-body">
                  <div className="row"><span>25% Property Costs:</span> <span className="negative">-{formatCurrency(userExpenses)}</span></div>
                  {!isRental && <div className="row"><span>Rent Paid Out:</span> <span className="negative">-{formatCurrency(userRent)}</span></div>}
                  <div className="row"><span>25% Rent Pot:</span> <span className="positive">+{formatCurrency(userRentIncome)}</span></div>
                  {includeTaxSavings && <div className="row"><span>Tax Savings:</span> <span className="positive">+{formatCurrency(userTaxShield)}</span></div>}
                  <hr />
                  <div className="row total"><span>Net Flow:</span> <span className={userNet >= 0 ? "positive" : "negative"}>{formatCurrency(userNet)}</span></div>
                </div>
              </div>
              <div className="card user-card">
                <div className="card-header">Brother's Net Monthly Flow (Year {selectedYear})</div>
                <div className="card-body">
                  <div className="row"><span>25% Property Costs:</span> <span className="negative">-{formatCurrency(brotherExpenses)}</span></div>
                  {!isRental && <div className="row"><span>Rent Paid Out:</span> <span className="negative">-{formatCurrency(brotherRent)}</span></div>}
                  <div className="row"><span>25% Rent Pot:</span> <span className="positive">+{formatCurrency(brotherRentIncome)}</span></div>
                  {includeTaxSavings && <div className="row"><span>Tax Savings:</span> <span className="positive">+{formatCurrency(userTaxShield)}</span></div>}
                  <hr />
                  <div className="row total"><span>Net Flow:</span> <span className={brotherNet >= 0 ? "positive" : "negative"}>{formatCurrency(brotherNet)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOAN */}
        {activeTab === 'loan' && (
          <div className="tab-fade-in">
            <div className="card controls-card" style={{marginBottom: '24px'}}>
              <h2><Building className="icon" /> Property & Loan Sliders</h2>
              <div className="sliders-wrapper" style={{flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap'}}>
                <div className="slider-group" style={{width: '45%'}}>
                  <label>Purchase Price</label>
                  <input type="range" min="800000" max="1500000" step="10000" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} className="slider blue-slider" style={{width: '100%'}}/>
                  <div className="rent-value">{formatCurrency(purchasePrice)}</div>
                </div>
                <div className="slider-group" style={{width: '45%'}}>
                  <label>Interest Rate (30-Year Fixed)</label>
                  <input type="range" min="4.0" max="8.0" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="slider purple-slider" style={{width: '100%'}}/>
                  <div className="rent-value">{interestRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <div className="grid">
              <div className="card">
                <h2>How Payments Are Derived</h2>
                <div className="math-breakdown">
                  <div className="math-step"><span className="math-label">1. Loan Amount:</span><span className="math-value">{formatCurrency(purchasePrice)} - 20% = {formatCurrency(loanAmount)}</span></div>
                  <div className="math-step"><span className="math-label">2. Monthly Mortgage:</span><span className="math-value highlight">{formatCurrency(mortgage)}</span></div>
                  <hr/>
                  <div className="math-step"><span className="math-label">Property Tax (1.18% / 12):</span><span className="math-value">{formatCurrency(propertyTax)}</span></div>
                  <div className="math-step"><span className="math-label">HOA (Zillow Unit 307):</span><span className="math-value">{formatCurrency(hoa)}</span></div>
                  <div className="math-step total-math"><span className="math-label">Total Monthly Cost:</span><span className="math-value highlight-large">{formatCurrency(propertyCosts)}</span></div>
                </div>
              </div>
              <div className="card amortization-card" style={{marginTop: 0}}>
                <h2><CalendarDays className="icon" /> 30-Year Amortization</h2>
                <div className="table-wrapper">
                  <table className="amort-table">
                    <thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
                    <tbody>
                      {amortizationSchedule.map((row) => (
                        <tr key={row.year} style={{ background: row.year === selectedYear ? 'rgba(96, 165, 250, 0.2)' : 'transparent' }}>
                          <td>Year {row.year} {row.year === selectedYear && "👈"}</td>
                          <td className="positive">{formatCurrency(row.principal)}</td>
                          <td className="negative">{formatCurrency(row.interest)}</td>
                          <td>{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TAX SAVINGS EXPLAINED */}
        {activeTab === 'taxes' && (
          <div className="tab-fade-in">

            {/* STEP 1 */}
            <div className="card" style={{marginBottom: '24px'}}>
              <div className="card-header" style={{fontSize: '1.3rem'}}>
                Step 1: What do we pay every month?
              </div>
              <div className="card-body">
                <p style={{color: '#94a3b8', marginBottom: '20px'}}>Every month, we pay 4 things for this house. But the government only gives tax breaks on 2 of them.</p>
                <div className="tax-item-grid">
                  <div className="tax-item yes">
                    <div className="tax-item-header"><CheckCircle color="#4ade80" size={20} /> Mortgage Interest</div>
                    <div className="tax-item-amount">{formatCurrency(monthlyInterest)} / mo</div>
                    <div className="tax-item-note">This is the fee the bank charges you for borrowing. The IRS lets you write this off.</div>
                  </div>
                  <div className="tax-item no">
                    <div className="tax-item-header"><XCircle color="#f87171" size={20} /> Mortgage Principal</div>
                    <div className="tax-item-amount">{formatCurrency(monthlyPrincipal)} / mo</div>
                    <div className="tax-item-note">This is money going into your own home equity. It's not an expense — it's like putting money in a savings account.</div>
                  </div>
                  <div className="tax-item yes">
                    <div className="tax-item-header"><CheckCircle color="#4ade80" size={20} /> Property Tax</div>
                    <div className="tax-item-amount">{formatCurrency(propertyTax)} / mo</div>
                    <div className="tax-item-note">The tax you pay to the city of San Francisco. The IRS lets you write this off too.</div>
                  </div>
                  <div className="tax-item no">
                    <div className="tax-item-header"><XCircle color="#f87171" size={20} /> HOA Dues</div>
                    <div className="tax-item-amount">{formatCurrency(hoa)} / mo</div>
                    <div className="tax-item-note">The fee for building maintenance, gym, etc. Not tax deductible on a home you live in.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="card" style={{marginBottom: '24px'}}>
              <div className="card-header" style={{fontSize: '1.3rem'}}>
                Step 2: Since we split the mortgage 50/50, we each get half
              </div>
              <div className="card-body">
                <p style={{color: '#94a3b8', marginBottom: '20px'}}>The IRS only lets you deduct YOUR share of what you pay. Since the mortgage is in both brothers' names equally:</p>
                <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                  <div style={{flex: 1, minWidth: '250px', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '12px', padding: '20px'}}>
                    <div style={{color: '#60a5fa', fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem'}}>Your 50% Share (Year {selectedYear})</div>
                    <div className="row"><span>Mortgage Interest:</span> <span>{formatCurrency(userShareOfInterest)} / yr</span></div>
                    <div className="row"><span>Property Tax:</span> <span>{formatCurrency(userShareOfPropertyTax)} / yr</span></div>
                    <hr style={{opacity: 0.2}} />
                    <div className="row total"><span>Your Deductible Total:</span> <span style={{color: '#4ade80'}}>{formatCurrency(deductibleInterest + deductiblePropertyTax)} / yr</span></div>
                  </div>
                  <div style={{flex: 1, minWidth: '250px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '20px'}}>
                    <div style={{color: '#a855f7', fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem'}}>Brother's 50% Share (Year {selectedYear})</div>
                    <div className="row"><span>Mortgage Interest:</span> <span>{formatCurrency(userShareOfInterest)} / yr</span></div>
                    <div className="row"><span>Property Tax:</span> <span>{formatCurrency(userShareOfPropertyTax)} / yr</span></div>
                    <hr style={{opacity: 0.2}} />
                    <div className="row total"><span>His Deductible Total:</span> <span style={{color: '#4ade80'}}>{formatCurrency(deductibleInterest + deductiblePropertyTax)} / yr</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="card" style={{marginBottom: '24px'}}>
              <div className="card-header" style={{fontSize: '1.3rem'}}>
                Step 3: Are there any IRS limits that reduce this?
              </div>
              <div className="card-body">
                <p style={{color: '#94a3b8', marginBottom: '20px'}}>The government puts caps on how much you can deduct. Let's check both:</p>
                <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                  <div style={{flex: 1, minWidth: '280px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                      <CheckCircle color="#4ade80" size={24} />
                      <span style={{color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem'}}>Mortgage Interest Cap: CLEAR</span>
                    </div>
                    <div className="row"><span>IRS Limit:</span> <span>$750,000 of debt per person</span></div>
                    <div className="row"><span>Your share of loan:</span> <span>{formatCurrency(userShareOfLoan)}</span></div>
                    <div className="row" style={{marginTop: '8px'}}><span></span> <span style={{color: '#4ade80'}}>{formatCurrency(userShareOfLoan)} &lt; $750,000 ✓</span></div>
                  </div>
                  <div style={{flex: 1, minWidth: '280px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '12px', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                      <CheckCircle color="#4ade80" size={24} />
                      <span style={{color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem'}}>SALT Cap: CLEAR</span>
                    </div>
                    <div className="row"><span>IRS Limit (2026):</span> <span>$40,400 total</span></div>
                    <div className="row"><span>CA State Tax:</span> <span>$16,000</span></div>
                    <div className="row"><span>+ Your Property Tax:</span> <span>{formatCurrency(userShareOfPropertyTax)}</span></div>
                    <div className="row"><span>Your SALT Total:</span> <span>{formatCurrency(saltTotal)}</span></div>
                    <div className="row" style={{marginTop: '8px'}}><span></span> <span style={{color: '#4ade80'}}>{formatCurrency(saltTotal)} &lt; $40,400 ✓</span></div>
                  </div>
                </div>
                <p style={{color: '#94a3b8', marginTop: '16px', fontSize: '0.95rem'}}>Both caps cleared. 100% of your housing deductions are usable.</p>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="card" style={{marginBottom: '24px'}}>
              <div className="card-header" style={{fontSize: '1.3rem'}}>
                Step 4: How much money does this actually save you?
              </div>
              <div className="card-body">
                <p style={{color: '#94a3b8', marginBottom: '20px'}}>A "deduction" doesn't mean free money — it means you tell the IRS "don't tax me on this amount of my income." The savings depend on your tax bracket.</p>
                
                <div style={{background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px', marginBottom: '20px'}}>
                  <div style={{color: '#cbd5e1', marginBottom: '16px', fontWeight: 'bold'}}>Without the house:</div>
                  <div className="row"><span>Your income:</span> <span>$213,000</span></div>
                  <div className="row"><span>Standard deduction (everyone gets this):</span> <span>- $16,100</span></div>
                  <div className="row total"><span>Taxable income:</span> <span>$196,900</span></div>
                  <div className="row" style={{marginTop: '8px'}}><span>Tax bracket:</span> <span style={{color: '#60a5fa'}}>24% (covers $105,701 - $201,775)</span></div>
                </div>

                <div style={{textAlign: 'center', margin: '16px 0'}}>
                  <ArrowDown color="#a855f7" size={32} />
                </div>

                <div style={{background: 'rgba(168, 85, 247, 0.1)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '20px'}}>
                  <div style={{color: '#a855f7', marginBottom: '16px', fontWeight: 'bold'}}>With the house (Year {selectedYear}):</div>
                  <div className="row"><span>Your income:</span> <span>$213,000</span></div>
                  <div className="row"><span>CA State Tax (SALT):</span> <span>- $16,000</span></div>
                  <div className="row"><span>Your Property Tax (SALT):</span> <span>- {formatCurrency(deductiblePropertyTax)}</span></div>
                  <div className="row"><span>Your Mortgage Interest:</span> <span>- {formatCurrency(deductibleInterest)}</span></div>
                  <div className="row total"><span>Taxable income:</span> <span>{formatCurrency(213000 - totalItemized)}</span></div>
                </div>

                <div style={{background: 'rgba(74, 222, 128, 0.1)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.3)'}}>
                  <div style={{color: '#4ade80', marginBottom: '16px', fontWeight: 'bold', fontSize: '1.1rem'}}>The Savings:</div>
                  <div className="row"><span>Income you no longer pay tax on:</span> <span>{formatCurrency(incrementalDeduction)}</span></div>
                  <div className="row"><span>Your tax rate on that income:</span> <span>24%</span></div>
                  <hr style={{opacity: 0.2, margin: '12px 0'}} />
                  <div className="row"><span>Annual tax savings:</span> <span className="positive">{formatCurrency(annualTaxSavings)} / year</span></div>
                  <div className="row total" style={{fontSize: '1.3rem', marginTop: '8px'}}>
                    <span>Monthly tax savings:</span> 
                    <span className="positive">{formatCurrency(userTaxShield)} / month</span>
                  </div>
                  <p style={{color: '#94a3b8', fontSize: '0.9rem', marginTop: '16px', marginBottom: 0}}>This is per person. Both brothers get this amount individually.</p>
                </div>
              </div>
            </div>

            {/* WHY IT DECREASES */}
            <div style={{
              background: 'rgba(96, 165, 250, 0.1)', 
              border: '1px solid rgba(96, 165, 250, 0.3)', 
              padding: '16px 20px', 
              borderRadius: '8px',
              display: 'flex',
              gap: '12px'
            }}>
              <Info color="#60a5fa" size={28} style={{flexShrink: 0, marginTop: '2px'}} />
              <div>
                <h3 style={{color: '#60a5fa', margin: '0 0 8px 0'}}>Why does this number shrink over time?</h3>
                <p style={{margin: 0, color: '#e2e8f0', lineHeight: 1.5}}>
                  Your mortgage payment stays the same every month ({formatCurrency(mortgage)}), but over time more of it goes toward paying off the loan (principal) and less goes to the bank as a fee (interest). Since only the interest is deductible, your tax savings naturally decrease each year. Try dragging the year slider to see this in action.
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
