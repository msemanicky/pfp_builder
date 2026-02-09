Personal finance planner

- user provides input data:
	- incomes, expenses, debts
- system shows analytics
- system show saving strategies
- system show investments planning

## Export/Import Format

The app exports all your financial data in JSON format, including:

### Exported Data Structure:
```json
{
  "incomes": [
    {
      "id": "unique-id",
      "name": "Salary",
      "amount": 5000,
      "frequency": "monthly"
    }
  ],
  "expenses": [
    {
      "id": "unique-id",
      "name": "Rent",
      "amount": 1200,
      "category": "housing",
      "frequency": "monthly",
      "type": "need"  // "need" or "want" - categorizes expense for savings strategies
    }
  ],
  "debts": [
    {
      "id": "unique-id",
      "name": "Student Loan",
      "principal": 10000,
      "interestRate": 5.5,
      "monthlyPayment": 200,
      "remainingMonths": 50
    }
  ],
  "selectedStrategy": "50_30_20",  // ID of selected savings strategy
  "customStrategy": {  // Custom strategy percentages
    "needs": 50,
    "wants": 30,
    "savings": 20
  },
  "language": "en"  // Selected language (en, es, fr, de, sk)
}
```

### Backward Compatibility:
- Old exports without the `type` field on expenses will automatically default to "need"
- Old exports without `selectedStrategy` or `customStrategy` will use default values
- All expense types are preserved during export/import

