# SF Condo Financial Model 🏢

Welcome to the financial model for SF condo purchases

This interactive React application was built to simulate the complex financial breakdown of a 50/50 family co-investment in San Francisco real estate. It helps clarify exactly how the cash flow, tax deductions, and property math shake out.

## What's Inside?

The application is broken down into three main sections:

### 1. Cash Flow & Rent 💵
A dynamic calculator that breaks down the "Total Rent Pot." It maps out exactly what our Dad receives, what we pay, and our net monthly cash flow. 
- **Features:** Sliders to adjust our individual rent contributions, plus an **Owner Occupied vs. Rental Property** toggle to simulate what happens in Years 5-7 when we move out and a tenant moves in.

### 2. Property & Loan Math 📈
The raw numbers behind the mortgage. 
- **Features:** A fully interactive 30-year amortization schedule. You can adjust the purchase price and interest rate to see exactly how much goes toward principal versus interest every month.

### 3. Tax Savings Explained ⚖️
A step-by-step, plain-English breakdown of our tax shield. 
- **Features:** It takes our 24% marginal tax rate, the new 2026 OBBBA tax laws, the SALT cap, and the TCJA mortgage interest cap into account to calculate our exact monthly savings.

## Getting Started

To run this project locally on your machine:

1. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the localhost URL provided in the terminal (usually `http://localhost:5173`).
