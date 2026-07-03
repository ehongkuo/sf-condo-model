import React, { useState, useMemo } from 'react';
import { TrendingUp, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { formatCurrency } from './utils';

function LongTermTab({ purchasePrice, loanAmount, amortizationSchedule, hoa, propertyTaxAnnual }) {
  const [hoaInflation, setHoaInflation] = useState(4.0);
  const [appreciation, setAppreciation] = useState(3.0);
  const [moveOutYear, setMoveOutYear] = useState(5);

  const projectionData = useMemo(() => {
    const rows = [];
    let currentHOA = hoa * 12; // annual HOA
    let currentPropertyTax = propertyTaxAnnual;

    for (let year = 1; year <= 15; year++) {
      const marketValue = purchasePrice * Math.pow(1 + appreciation / 100, year);
      const amortRow = amortizationSchedule[year - 1] || { balance: 0 };
      const loanBalance = amortRow.balance;
      const equity = marketValue - loanBalance;

      // HOA compounds from year 2 onward
      if (year > 1) {
        currentHOA = currentHOA * (1 + hoaInflation / 100);
      }

      // Prop 13: property tax grows max 2%/yr from year 2 onward
      if (year > 1) {
        currentPropertyTax = currentPropertyTax * 1.02;
      }

      // Section 121 eligibility
      let section121Status;
      if (year <= moveOutYear) {
        section121Status = 'living';
      } else if (year <= moveOutYear + 3) {
        section121Status = 'eligible';
      } else {
        section121Status = 'expired';
      }

      const capitalGain = marketValue - purchasePrice;
      const exclusionPerPerson = 250000;
      const totalExclusion = exclusionPerPerson * 2; // both brothers
      const taxableGain = section121Status === 'expired'
        ? Math.max(0, capitalGain)
        : Math.max(0, capitalGain - totalExclusion);

      rows.push({
        year,
        marketValue,
        loanBalance,
        equity,
        annualHOA: currentHOA,
        annualPropertyTax: currentPropertyTax,
        section121Status,
        capitalGain,
        taxableGain,
      });
    }
    return rows;
  }, [purchasePrice, loanAmount, amortizationSchedule, hoa, propertyTaxAnnual, hoaInflation, appreciation, moveOutYear]);

  return (
    <div className="tab-fade-in">
      {/* Sliders */}
      <div className="card controls-card" style={{marginBottom: '24px'}}>
        <h2><TrendingUp className="icon" /> Long-Term Forecasting</h2>
        <div className="sliders-wrapper" style={{flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap'}}>
          <div className="slider-group" style={{width: '30%', minWidth: '200px'}}>
            <label>Annual HOA Inflation</label>
            <input type="range" min="2" max="10" step="0.5" value={hoaInflation} onChange={(e) => setHoaInflation(Number(e.target.value))} className="slider purple-slider" style={{width: '100%'}} />
            <div className="rent-value">{hoaInflation.toFixed(1)}%</div>
          </div>
          <div className="slider-group" style={{width: '30%', minWidth: '200px'}}>
            <label>Annual Home Appreciation</label>
            <input type="range" min="1" max="8" step="0.5" value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value))} className="slider blue-slider" style={{width: '100%'}} />
            <div className="rent-value">{appreciation.toFixed(1)}%</div>
          </div>
          <div className="slider-group" style={{width: '30%', minWidth: '200px'}}>
            <label>Move-Out Year</label>
            <input type="range" min="2" max="10" step="1" value={moveOutYear} onChange={(e) => setMoveOutYear(Number(e.target.value))} className="slider" style={{width: '100%', background: 'linear-gradient(90deg, #4ade80, #f87171)'}} />
            <div className="rent-value">Year {moveOutYear}</div>
          </div>
        </div>
      </div>

      {/* Section 121 Explainer */}
      <div style={{
        background: 'rgba(96, 165, 250, 0.1)',
        border: '1px solid rgba(96, 165, 250, 0.3)',
        padding: '16px 20px',
        borderRadius: '8px',
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <Info color="#60a5fa" size={28} style={{flexShrink: 0, marginTop: '2px'}} />
        <div>
          <h3 style={{color: '#60a5fa', margin: '0 0 8px 0'}}>Section 121 Capital Gains Exclusion</h3>
          <p style={{margin: 0, color: '#e2e8f0', lineHeight: 1.5}}>
            If you live in the home for at least 2 of the last 5 years before selling, the first <strong>$250,000 of profit per person</strong> ($500k combined) is tax-free.
            After you move out in Year {moveOutYear}, the clock starts — you have until <strong>Year {moveOutYear + 3}</strong> to sell and still qualify.
            After that, you owe capital gains tax on the full profit.
          </p>
        </div>
      </div>

      {/* Projection Table */}
      <div className="card" style={{marginBottom: '24px'}}>
        <h2><TrendingUp className="icon" /> 15-Year Projection</h2>
        <div className="table-wrapper">
          <table className="amort-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Market Value</th>
                <th>Loan Balance</th>
                <th>Equity</th>
                <th>Annual HOA</th>
                <th>Annual Prop Tax</th>
                <th>Section 121</th>
                <th>Taxable Gain if Sold</th>
              </tr>
            </thead>
            <tbody>
              {projectionData.map((row) => {
                const isCurrentMoveOut = row.year === moveOutYear;
                const isDeadline = row.year === moveOutYear + 3;
                const isExpired = row.section121Status === 'expired';

                let rowBg = 'transparent';
                if (isCurrentMoveOut) rowBg = 'rgba(251, 191, 36, 0.15)';
                else if (isDeadline) rowBg = 'rgba(248, 113, 113, 0.15)';
                else if (row.section121Status === 'eligible') rowBg = 'rgba(74, 222, 128, 0.08)';
                else if (isExpired) rowBg = 'rgba(248, 113, 113, 0.05)';

                return (
                  <tr key={row.year} style={{background: rowBg}}>
                    <td>
                      Year {row.year}
                      {isCurrentMoveOut && ' 🚚'}
                      {isDeadline && ' ⏰'}
                    </td>
                    <td>{formatCurrency(row.marketValue)}</td>
                    <td>{formatCurrency(row.loanBalance)}</td>
                    <td className="positive">{formatCurrency(row.equity)}</td>
                    <td>{formatCurrency(row.annualHOA)}</td>
                    <td>{formatCurrency(row.annualPropertyTax)}</td>
                    <td>
                      {row.section121Status === 'living' && <span style={{color: '#60a5fa'}}>🏠 Living Here</span>}
                      {row.section121Status === 'eligible' && <span style={{color: '#4ade80'}}><CheckCircle size={14} style={{verticalAlign: 'middle'}} /> Eligible</span>}
                      {row.section121Status === 'expired' && <span style={{color: '#f87171'}}><XCircle size={14} style={{verticalAlign: 'middle'}} /> Expired</span>}
                    </td>
                    <td>
                      {row.capitalGain <= 0 ? (
                        <span style={{color: '#94a3b8'}}>—</span>
                      ) : row.taxableGain === 0 ? (
                        <span className="positive">{formatCurrency(0)} (excluded!)</span>
                      ) : (
                        <span className={isExpired ? 'negative' : 'positive'}>{formatCurrency(row.taxableGain)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="grid" style={{marginBottom: '24px'}}>
        <div className="card">
          <div className="card-header">HOA Growth Impact</div>
          <div className="card-body">
            <div className="row">
              <span>Year 1 HOA:</span>
              <span>{formatCurrency(hoa * 12)} / yr</span>
            </div>
            <div className="row">
              <span>Year 15 HOA ({hoaInflation}%/yr):</span>
              <span className="negative">{formatCurrency(projectionData[14]?.annualHOA || 0)} / yr</span>
            </div>
            <hr style={{opacity: 0.2}} />
            <div className="row total">
              <span>Increase:</span>
              <span className="negative">+{formatCurrency((projectionData[14]?.annualHOA || 0) - hoa * 12)} / yr</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Equity at Year 15</div>
          <div className="card-body">
            <div className="row">
              <span>Market Value ({appreciation}%/yr):</span>
              <span>{formatCurrency(projectionData[14]?.marketValue || 0)}</span>
            </div>
            <div className="row">
              <span>Remaining Loan:</span>
              <span>{formatCurrency(projectionData[14]?.loanBalance || 0)}</span>
            </div>
            <hr style={{opacity: 0.2}} />
            <div className="row total">
              <span>Your Equity:</span>
              <span className="positive">{formatCurrency(projectionData[14]?.equity || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LongTermTab;
