import React from 'react';
import { DollarSign, Info } from 'lucide-react';
import { formatCurrency } from './utils';

function CashFlowTab({
  isRental, setIsRental,
  userRent, setUserRent,
  brotherRent, setBrotherRent,
  tenantRent, setTenantRent,
  includeTaxSavings, setIncludeTaxSavings,
  totalRent,
  dadExpenses, dadRentIncome, dadNet,
  userExpenses, userRentIncome, userNet, userTaxShield,
  brotherExpenses, brotherRentIncome, brotherNet,
  propertyCosts,
  selectedYear,
}) {
  // Gift tax check: Dad's net annual gift
  const dadNetAnnualGift = (dadExpenses - dadRentIncome) * 12;
  const marriedGiftLimit = 76000;

  return (
    <div className="tab-fade-in">
      <div className="card controls-card" style={{paddingBottom: '16px'}}>
        <div className="split-info">
          <div className="split-item total-pot">Total Rent Pot: {formatCurrency(totalRent)}</div>
        </div>
      </div>

      {/* Gift Tax Warning */}
      {dadNetAnnualGift > marriedGiftLimit && (
        <div style={{
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.4)',
          padding: '16px 20px',
          borderRadius: '8px',
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <Info color="#fb923c" size={24} style={{flexShrink: 0, marginTop: '2px'}} />
          <div>
            <h3 style={{color: '#fb923c', margin: '0 0 6px 0', fontSize: '1rem'}}>⚠️ Gift Tax Alert</h3>
            <p style={{margin: 0, color: '#e2e8f0', lineHeight: 1.5, fontSize: '0.95rem'}}>
              Dad's net annual contribution is <strong>{formatCurrency(dadNetAnnualGift)}</strong>, which exceeds the
              {' '}<strong>{formatCurrency(marriedGiftLimit)}</strong> married gift-splitting limit.
              Dad & Mom will need to file <strong>IRS Form 709</strong> for this year. No tax is owed — it just reduces their lifetime exemption (~$25M).
            </p>
          </div>
        </div>
      )}

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
  );
}

export default CashFlowTab;
