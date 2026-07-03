import React from 'react';
import { CheckCircle, XCircle, ArrowDown, Info } from 'lucide-react';
import { formatCurrency } from './utils';

function TaxTab({
  isRental,
  selectedYear,
  // Owner-occupied props
  monthlyInterest, monthlyPrincipal, propertyTax, hoa, mortgage,
  userShareOfInterest, userShareOfPropertyTax, userShareOfLoan,
  deductibleInterest, deductiblePropertyTax,
  saltTotal, totalItemized, incrementalDeduction,
  annualTaxSavings, userTaxShield,
  // Rental props
  purchasePrice, totalInterestForYear, propertyTaxAnnual,
  totalRent,
}) {
  // Schedule E rental tax calculations
  const buildingRatio = 0.80;
  const depreciationBasis = purchasePrice * buildingRatio;
  const annualDepreciation = depreciationBasis / 27.5;
  const userShareOfDepreciation = annualDepreciation / 2;

  // Rental Schedule E deductions (50% share, no SALT/TCJA caps)
  const rentalInterest = totalInterestForYear / 2;
  const rentalPropertyTax = propertyTaxAnnual / 2;
  const rentalHOA = hoa * 12 / 2;
  const totalRentalDeductions = rentalInterest + rentalPropertyTax + rentalHOA + userShareOfDepreciation;

  // Rental income (50% share)
  const rentalIncome = (totalRent * 12) / 2;
  const netRentalIncome = rentalIncome - totalRentalDeductions;

  if (isRental) {
    return (
      <div className="tab-fade-in">
        {/* RENTAL MODE: Schedule E */}
        <div className="card" style={{marginBottom: '24px'}}>
          <div className="card-header" style={{fontSize: '1.3rem'}}>
            Schedule E: Rental Property Tax Breakdown (Year {selectedYear})
          </div>
          <div className="card-body">
            <p style={{color: '#94a3b8', marginBottom: '20px'}}>
              When the property is rented out, all expenses move from Schedule A to <strong>Schedule E</strong>.
              This means the SALT cap ($40,400) and TCJA mortgage limit ($750k) <strong>no longer apply</strong>.
              HOA and depreciation also become fully deductible.
            </p>

            {/* Income */}
            <div style={{background: 'rgba(74, 222, 128, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.3)', marginBottom: '16px'}}>
              <div style={{color: '#4ade80', fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem'}}>Your 50% Rental Income</div>
              <div className="row"><span>50% of Tenant Rent ({formatCurrency(totalRent)}/mo × 12):</span> <span className="positive">{formatCurrency(rentalIncome)} / yr</span></div>
            </div>

            {/* Deductions */}
            <div style={{background: 'rgba(248, 113, 113, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(248, 113, 113, 0.3)', marginBottom: '16px'}}>
              <div style={{color: '#f87171', fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem'}}>Your 50% Deductible Expenses</div>
              <div className="row"><span>Mortgage Interest:</span> <span className="negative">-{formatCurrency(rentalInterest)} / yr</span></div>
              <div className="row"><span>Property Tax (bypasses SALT cap):</span> <span className="negative">-{formatCurrency(rentalPropertyTax)} / yr</span></div>
              <div className="row"><span>HOA Dues (now deductible!):</span> <span className="negative">-{formatCurrency(rentalHOA)} / yr</span></div>
              <div className="row"><span>Depreciation ({formatCurrency(purchasePrice)} × 80% ÷ 27.5 yrs ÷ 2):</span> <span className="negative">-{formatCurrency(userShareOfDepreciation)} / yr</span></div>
              <hr style={{opacity: 0.2}} />
              <div className="row total"><span>Total Deductions:</span> <span className="negative">-{formatCurrency(totalRentalDeductions)} / yr</span></div>
            </div>

            {/* Net */}
            <div style={{background: netRentalIncome >= 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(168, 85, 247, 0.1)', padding: '20px', borderRadius: '12px', border: `1px solid ${netRentalIncome >= 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`, marginBottom: '16px'}}>
              <div style={{color: netRentalIncome >= 0 ? '#4ade80' : '#a855f7', fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem'}}>
                {netRentalIncome >= 0 ? 'Net Taxable Rental Income' : 'Net Rental Loss (Paper Loss)'}
              </div>
              <div className="row"><span>Rental Income:</span> <span>{formatCurrency(rentalIncome)}</span></div>
              <div className="row"><span>Total Deductions:</span> <span>-{formatCurrency(totalRentalDeductions)}</span></div>
              <hr style={{opacity: 0.2}} />
              <div className="row total" style={{fontSize: '1.2rem'}}>
                <span>Net:</span>
                <span className={netRentalIncome >= 0 ? 'positive' : 'negative'}>{formatCurrency(netRentalIncome)} / yr</span>
              </div>
              {netRentalIncome >= 0 && (
                <div className="row" style={{marginTop: '8px'}}>
                  <span>Tax owed at 24%:</span>
                  <span className="negative">{formatCurrency(netRentalIncome * 0.24)} / yr</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info box for losses */}
        {netRentalIncome < 0 && (
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            padding: '16px 20px',
            borderRadius: '8px',
            display: 'flex',
            gap: '12px',
          }}>
            <Info color="#a855f7" size={28} style={{flexShrink: 0, marginTop: '2px'}} />
            <div>
              <h3 style={{color: '#a855f7', margin: '0 0 8px 0'}}>Why can't I use this loss against my W2 income?</h3>
              <p style={{margin: 0, color: '#e2e8f0', lineHeight: 1.5}}>
                Because your income exceeds $150,000, the IRS <strong>passive activity loss rules</strong> prevent you from
                deducting rental losses against your W2 salary. This <strong>{formatCurrency(Math.abs(netRentalIncome))}/yr loss is suspended</strong> and
                carries forward. It will reduce your capital gains taxes when you eventually sell the property.
              </p>
            </div>
          </div>
        )}

        {/* Info box for depreciation recapture */}
        <div style={{
          background: 'rgba(96, 165, 250, 0.1)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          padding: '16px 20px',
          borderRadius: '8px',
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
        }}>
          <Info color="#60a5fa" size={28} style={{flexShrink: 0, marginTop: '2px'}} />
          <div>
            <h3 style={{color: '#60a5fa', margin: '0 0 8px 0'}}>Depreciation Recapture Warning</h3>
            <p style={{margin: 0, color: '#e2e8f0', lineHeight: 1.5}}>
              When you sell, the IRS will "recapture" all depreciation you claimed and tax it at 25%.
              For each year you rent, that's <strong>{formatCurrency(userShareOfDepreciation)}</strong> added to your recapture liability.
              The Section 121 capital gains exclusion does <strong>not</strong> protect you from this tax.
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
  );
}

export default TaxTab;
