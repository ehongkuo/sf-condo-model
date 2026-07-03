import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, XCircle, Info } from 'lucide-react';
import { formatCurrency } from './utils';

function LongTermTab({ 
  purchasePrice, 
  loanAmount, 
  amortizationSchedule, 
  baseHOA, 
  basePropertyTaxAnnual,
  hoaInflation,
  appreciation,
  moveOutYear
}) {

  const projectionData = useMemo(() => {
    const rows = [];
    let currentHOAAnnual = baseHOA * 12;
    let currentPropertyTax = basePropertyTaxAnnual;

    for (let year = 1; year <= 30; year++) {
      const marketValue = purchasePrice * Math.pow(1 + appreciation / 100, year);
      const amortRow = amortizationSchedule[year - 1] || { balance: 0 };
      const loanBalance = amortRow.balance;
      const equity = marketValue - loanBalance;

      // HOA compounds from year 2 onward
      if (year > 1) {
        currentHOAAnnual = currentHOAAnnual * (1 + hoaInflation / 100);
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
        annualHOA: currentHOAAnnual,
        monthlyHOA: currentHOAAnnual / 12,
        annualPropertyTax: currentPropertyTax,
        section121Status,
        capitalGain,
        taxableGain,
      });
    }
    return rows;
  }, [purchasePrice, loanAmount, amortizationSchedule, baseHOA, basePropertyTaxAnnual, hoaInflation, appreciation, moveOutYear]);

  // Quick-access rows for the summary cards
  const year5 = projectionData[4];
  const year10 = projectionData[9];
  const year15 = projectionData[14];
  const year30 = projectionData[29];

  return (
    <div className="tab-fade-in">

      {/* Immediate feedback panels */}
      <div className="card controls-card" style={{marginBottom: '24px'}}>
        <h2><TrendingUp className="icon" /> Long-Term Forecasting</h2>
        
        <p style={{color: '#94a3b8', marginBottom: '24px'}}>
          The values below reflect the global settings in your control panel (Appreciation: {appreciation}%, HOA Inflation: {hoaInflation}%, Move-Out: Year {moveOutYear}).
        </p>

        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px'}}>
          <div style={{flex: 1, minWidth: '200px'}}>
            <h3 style={{color: '#e2e8f0', marginBottom: '12px', fontSize: '1.1rem'}}>HOA Growth ({hoaInflation}%/yr)</h3>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <div style={{background: 'rgba(168, 85, 247, 0.1)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)', flex: 1, textAlign: 'center'}}>
                <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>HOA Today</div>
                <div style={{color: '#e2e8f0', fontWeight: 'bold'}}>{formatCurrency(baseHOA)}/mo</div>
              </div>
              <div style={{background: 'rgba(168, 85, 247, 0.1)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)', flex: 1, textAlign: 'center'}}>
                <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>Year 10</div>
                <div style={{color: '#e2e8f0', fontWeight: 'bold'}}>{formatCurrency(year10?.monthlyHOA || 0)}/mo</div>
              </div>
              <div style={{background: 'rgba(168, 85, 247, 0.15)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)', flex: 1, textAlign: 'center'}}>
                <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>Year 30</div>
                <div style={{color: '#a855f7', fontWeight: 'bold'}}>{formatCurrency(year30?.monthlyHOA || 0)}/mo</div>
              </div>
            </div>
          </div>
          
          <div style={{flex: 1, minWidth: '200px'}}>
            <h3 style={{color: '#e2e8f0', marginBottom: '12px', fontSize: '1.1rem'}}>Property Value ({appreciation}%/yr)</h3>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <div style={{background: 'rgba(96, 165, 250, 0.1)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(96, 165, 250, 0.2)', flex: 1, textAlign: 'center'}}>
                <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>Today</div>
                <div style={{color: '#e2e8f0', fontWeight: 'bold'}}>{formatCurrency(purchasePrice)}</div>
              </div>
              <div style={{background: 'rgba(96, 165, 250, 0.1)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(96, 165, 250, 0.2)', flex: 1, textAlign: 'center'}}>
                <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>Year 10</div>
                <div style={{color: '#e2e8f0', fontWeight: 'bold'}}>{formatCurrency(year10?.marketValue || 0)}</div>
              </div>
              <div style={{background: 'rgba(96, 165, 250, 0.15)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(96, 165, 250, 0.3)', flex: 1, textAlign: 'center'}}>
                <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>Year 30</div>
                <div style={{color: '#60a5fa', fontWeight: 'bold'}}>{formatCurrency(year30?.marketValue || 0)}</div>
              </div>
            </div>
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
        <h2><TrendingUp className="icon" /> 30-Year Projection</h2>
        <div className="table-wrapper">
          <table className="amort-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Market Value</th>
                <th>Loan Balance</th>
                <th>Equity</th>
                <th>Monthly HOA</th>
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
                    <td>{formatCurrency(row.monthlyHOA)}</td>
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
            <div className="row"><span>Year 1 HOA:</span> <span>{formatCurrency(baseHOA)}/mo</span></div>
            <div className="row"><span>Year 15 HOA:</span> <span>{formatCurrency(year15?.monthlyHOA || 0)}/mo</span></div>
            <div className="row"><span>Year 30 HOA:</span> <span className="negative">{formatCurrency(year30?.monthlyHOA || 0)}/mo</span></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Equity Milestones</div>
          <div className="card-body">
            <div className="row"><span>Year 5 Equity:</span> <span className="positive">{formatCurrency(year5?.equity || 0)}</span></div>
            <div className="row"><span>Year 15 Equity:</span> <span className="positive">{formatCurrency(year15?.equity || 0)}</span></div>
            <div className="row"><span>Year 30 Equity:</span> <span className="positive">{formatCurrency(year30?.equity || 0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LongTermTab;
