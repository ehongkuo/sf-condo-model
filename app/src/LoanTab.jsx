import React from 'react';
import { Building, CalendarDays } from 'lucide-react';
import { formatCurrency } from './utils';

function LoanTab({
  purchasePrice, setPurchasePrice,
  interestRate, setInterestRate,
  loanAmount, mortgage, propertyTax, hoa, propertyCosts,
  amortizationSchedule, selectedYear,
}) {
  return (
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
  );
}

export default LoanTab;
