import argparse

def calculate_mortgage_payment(principal, annual_rate, years):
    monthly_rate = annual_rate / 12
    num_payments = years * 12
    if monthly_rate == 0:
        return principal / num_payments
    return principal * (monthly_rate * (1 + monthly_rate)**num_payments) / ((1 + monthly_rate)**num_payments - 1)

def run_projections(purchase_price, down_payment_percent, interest_rate, hoa_initial, property_tax_rate, marginal_tax_rate, rent_to_parents=0):
    down_payment = purchase_price * down_payment_percent
    loan_amount = purchase_price - down_payment
    
    monthly_mortgage = calculate_mortgage_payment(loan_amount, interest_rate, 30)
    monthly_property_tax = (purchase_price * property_tax_rate) / 12
    
    # Dad's contribution
    dad_down_payment = down_payment / 2
    dad_monthly_mortgage_contribution = monthly_mortgage / 2
    
    # User and Brother's share
    your_down_payment = down_payment / 4
    brother_down_payment = down_payment / 4
    
    your_monthly_mortgage = monthly_mortgage / 4
    brother_monthly_mortgage = monthly_mortgage / 4
    
    # Year 1 Estimates
    first_year_interest = loan_amount * interest_rate # Rough estimate for first year
    first_year_property_tax = purchase_price * property_tax_rate
    
    # Tax Shield (assuming itemized deductions and keeping the $10k SALT cap in mind)
    # The property tax deduction is capped at $10k for SALT (State And Local Taxes)
    # California state income tax will likely eat up the full $10k, so property tax might not yield extra federal deduction, but let's show the max mortgage interest deduction.
    deductible_interest = min(first_year_interest, 750000 * interest_rate) # TCJA limits mortgage interest deduction to first $750k of debt
    tax_savings_annual = deductible_interest * marginal_tax_rate
    tax_savings_monthly = tax_savings_annual / 12
    
    total_monthly_payment = monthly_mortgage + monthly_property_tax + hoa_initial
    your_total_monthly_payment = (monthly_mortgage / 4) + (monthly_property_tax / 4) + (hoa_initial / 4)
    # Adjust for tax savings (split between you and brother)
    your_net_monthly = your_total_monthly_payment - (tax_savings_monthly / 2)
    
    print(f"=== Property Assumptions ===")
    print(f"Purchase Price: ${purchase_price:,.2f}")
    print(f"Down Payment ({down_payment_percent*100}%): ${down_payment:,.2f}")
    print(f"Loan Amount: ${loan_amount:,.2f} at {interest_rate*100}% interest")
    print(f"Initial Monthly HOA: ${hoa_initial:,.2f}")
    print(f"\n=== Down Payment Breakdown ===")
    print(f"Dad pays 50%: ${dad_down_payment:,.2f}")
    print(f"You pay 25%: ${your_down_payment:,.2f}")
    print(f"Brother pays 25%: ${brother_down_payment:,.2f}")
    
    print(f"\n=== Monthly Cash Flow (Year 1) ===")
    print(f"Total Mortgage Payment: ${monthly_mortgage:,.2f}")
    print(f"Total Property Tax: ${monthly_property_tax:,.2f}")
    print(f"Total HOA: ${hoa_initial:,.2f}")
    print(f"Total Monthly Cost (Gross): ${total_monthly_payment:,.2f}")
    
    print(f"\n=== Your Personal Monthly Obligation (Year 1) ===")
    print(f"Your Mortgage Share (25%): ${your_monthly_mortgage:,.2f}")
    print(f"Your Property Tax Share (25%): ${(monthly_property_tax/4):,.2f}")
    print(f"Your HOA Share (25%): ${(hoa_initial/4):,.2f}")
    print(f"Your Gross Monthly Cost: ${your_total_monthly_payment:,.2f}")
    print(f"Estimated Monthly Tax Shield (Your half): -${(tax_savings_monthly/2):,.2f}")
    print(f"Your NET Monthly Cost (Property Only): ${your_net_monthly:,.2f}")
    
    print(f"\n=== Dad's Contribution & Support ===")
    print(f"Dad's Monthly Mortgage Share (50%): ${dad_monthly_mortgage_contribution:,.2f}")
    print(f"Dad's Property Tax Share (50%): ${(monthly_property_tax/2):,.2f}")
    print(f"Dad's HOA Share (50%): ${(hoa_initial/2):,.2f}")
    print(f"Your 'Rent' Payment to Parents: ${rent_to_parents:,.2f}")
    print(f"Your True Total Monthly Outflow: ${(your_net_monthly + rent_to_parents):,.2f}")

if __name__ == "__main__":
    run_projections(
        purchase_price=1050000,
        down_payment_percent=0.20,
        interest_rate=0.065,
        hoa_initial=1556, # Exact HOA for Unit 307
        property_tax_rate=0.0118,
        marginal_tax_rate=0.24,
        rent_to_parents=0 # Wait to get actual amount from user
    )
