# Personal Finance Planner - Development Guide

## Project Overview

A full-stack Personal Finance Planner application built with React, TypeScript, and Express. Users can track income, expenses, and debts, visualize analytics, explore savings strategies, and plan investments.

**Key Features:**
- Income, expense, and debt tracking with categorization
- Expense classification (Needs vs Wants) for budget analysis
- Multiple savings strategies (50/30/20, Pay Yourself First, etc.)
- Real-time comparison of actual vs recommended spending allocation
- Financial analytics with charts (Recharts)
- Investment planning with compound interest calculator
- Debt analytics (avalanche vs snowball strategies)
- Multi-language support (EN, ES, FR, DE, SK)
- Export/Import functionality with backward compatibility
- Session-based data persistence

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **React Router 6** (SPA mode)
- **TailwindCSS 3** for styling
- **Radix UI** for accessible components
- **i18next** + **react-i18next** for internationalization
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Express 5** server (minimal usage - client-side focus)
- Session storage for data persistence (no database yet)

### Build & Tools
- **pnpm** (preferred package manager)
- **Vitest** for testing
- **SWC** for fast compilation

## Project Structure

```
client/
├── pages/              # Route components (main views)
│   ├── Index.tsx       # Dashboard/home page
│   ├── FinancialInput.tsx  # Income/expense/debt entry
│   ├── SavingsStrategies.tsx  # Strategy selection & comparison
│   ├── ChartsAnalytics.tsx    # Data visualization
│   └── Investment.tsx         # Investment planning
├── components/
│   ├── ui/             # Radix UI components (shadcn-style)
│   └── Layout.tsx      # App layout with navigation
├── context/
│   └── FinanceContext.tsx  # Global state management
├── types/
│   └── finance.ts      # TypeScript interfaces
├── locales/            # Translation files
│   ├── en.json         # English
│   ├── es.json         # Spanish
│   ├── fr.json         # French
│   ├── de.json         # German
│   └── sk.json         # Slovak
├── hooks/              # Custom React hooks
├── lib/                # Utilities (cn, etc.)
├── i18n.ts             # i18next configuration
└── App.tsx             # Routing setup

server/
└── index.ts            # Express server (minimal)

shared/
└── api.ts              # Shared type definitions
```

## Data Model

### Core Types (`client/types/finance.ts`)

```typescript
interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "annual" | "weekly" | "biweekly";
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: "housing" | "food" | "transportation" | ...;
  frequency: "monthly" | "annual" | "weekly" | "biweekly";
  type: "need" | "want" | "savings";  // ⚠️ IMPORTANT: Classification for budget allocation
}

interface Debt {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  monthlyPayment: number;
  remainingMonths: number;
}

interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  selectedStrategy: string | null;  // ID of selected strategy
  customStrategy: {
    needs: number;    // Percentage (0-100)
    wants: number;
    savings: number;
  };
  language: "en" | "es" | "fr" | "de" | "sk";
}
```

## State Management

**FinanceContext** (`client/context/FinanceContext.tsx`)
- Centralized state using React Context API
- Session storage persistence
- Automatic migration for backward compatibility
- CRUD operations for incomes, expenses, debts
- Strategy selection and customization
- Export/Import with JSON

### Important Context Functions:
- `addExpense(expense)` - ⚠️ Must include `type: "need" | "want"`
- `updateExpense(id, expense)` - Always include all fields
- `exportData()` - Returns JSON string of all data
- `importData(jsonString)` - Handles old formats (auto-migration)

## Key Conventions

### 1. Translations (i18n)

**CRITICAL:** All user-facing text MUST use translations.

```typescript
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

// Usage
<p>{t('savings_strategies.title')}</p>
<p>{t('savings_strategies.amount_label', {
  label: t('savings_strategies.needs'),
  percent: 50
})}</p>
```

**Translation Key Naming:**
- Format: `section.subsection.key`
- Examples:
  - `financial_input.add_expense`
  - `savings_strategies.needs_desc`
  - `expense_type.need`

**Adding New Translations:**
1. Add key to ALL 5 locale files: `en.json`, `es.json`, `fr.json`, `de.json`, `sk.json`
2. Use descriptive keys that indicate context
3. Support interpolation with `{{variable}}` syntax

### 2. Expense Type Classification

**CRITICAL:** Every expense MUST have a `type` field.

- **"need"** - Essential expenses (housing, utilities, groceries, healthcare, minimum debt payments)
- **"want"** - Non-essential expenses (entertainment, dining out, hobbies, subscriptions)
- **"savings"** - Money already allocated to savings, investments, or planned savings (retirement contributions, investment accounts, savings transfers)

This classification is used in the Savings Strategies page to compare actual spending vs recommended allocation. The "savings" type allows users to track existing savings commitments and see how they align with their chosen strategy.

### 3. Currency Conversion

Use the `convertToMonthly()` helper for consistent calculations:

```typescript
const convertToMonthly = (amount: number, frequency: string): number => {
  switch (frequency) {
    case "annual": return amount / 12;
    case "weekly": return amount * 52 / 12;
    case "biweekly": return amount * 26 / 12;
    default: return amount;  // monthly
  }
};
```

### 4. Styling Patterns

- **TailwindCSS** utility-first approach
- **Color Scheme:**
  - Primary (blue) - Needs
  - Warning (orange/yellow) - Wants
  - Success (green) - Savings
  - Destructive (red) - Errors/deletions
- **Component Variants:** Use `class-variance-authority` (cva)
- **Conditional Classes:** Use `cn()` utility from `lib/utils.ts`

```typescript
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  expense.type === 'need' && 'bg-primary/10 text-primary',
  expense.type === 'want' && 'bg-warning/10 text-warning',
  expense.type === 'savings' && 'bg-success/10 text-success'
)}
```

### 5. Form Patterns

**Expense Form Example:**
- Use controlled components with `useState`
- Reset form after successful submission
- Include all required fields (including `type`)
- Validate before submission

```typescript
const [expenseForm, setExpenseForm] = useState<{
  name: string;
  amount: string | number;
  category: string;
  frequency: string;
  type: string;  // ⚠️ Don't forget!
}>({
  name: "",
  amount: "",
  category: "other",
  frequency: "monthly",
  type: "need"  // Default to "need"
});
```

## Common Development Tasks

### Adding a New Translation

1. Open all 5 locale files in `client/locales/`
2. Add the same key to each file with appropriate translation
3. Use in components: `t('your.new.key')`

### Adding a New Expense Category

1. Update `Expense` interface in `client/types/finance.ts`
2. Add to `category_options` array in `FinancialInput.tsx`
3. Add translations for the category in all locale files:
   ```json
   "category.your_category": "Your Category Name"
   ```

### Adding a New Savings Strategy

1. Add strategy to `strategies` array in `SavingsStrategies.tsx`:
   ```typescript
   {
     id: "your_strategy",
     nameKey: "strategy.your_strategy.name",
     descriptionKey: "strategy.your_strategy.description",
     breakdown: { needs: 40, wants: 30, savings: 30 }
   }
   ```
2. Add translations to all locale files:
   ```json
   "strategy.your_strategy.name": "Strategy Name",
   "strategy.your_strategy.description": "Brief description"
   ```

### Adding a New Page/Route

1. Create component in `client/pages/YourPage.tsx`
2. Add route in `client/App.tsx`:
   ```typescript
   <Route path="/your-page" element={<YourPage />} />
   ```
3. Add navigation link in `Layout.tsx` `navItems` array
4. Add translations for navigation label

## Important Notes & Gotchas

### ⚠️ Backward Compatibility

**ALWAYS** maintain backward compatibility for data imports:
- Old exports may not have the `type` field on expenses
- Migration logic in `FinanceContext.tsx` handles this
- When adding new required fields, always provide defaults

### ⚠️ Number Input Handling

Numbers from inputs come as strings. Always parse:

```typescript
const amount = typeof expenseForm.amount === 'string'
  ? parseFloat(expenseForm.amount)
  : expenseForm.amount;
```

### ⚠️ Session Storage

Data is stored in `sessionStorage`, not `localStorage`:
- Data persists within the same tab/window
- Data is lost when browser/tab closes
- Use Export/Import for long-term storage

### ⚠️ Translation Namespace

All translations use the default namespace. No need to specify namespace in `t()` function.

### ⚠️ Expense Type is Required

When adding or updating expenses, ALWAYS include the `type` field. The UI enforces this, but be careful in tests or direct context calls.

### ⚠️ Strategy Comparison Only Shows with Data

The comparison card (actual vs recommended) only appears when:
- User has income data
- User has selected a strategy
- User has at least one expense

## Testing Checklist

When making changes:

- [ ] Test with all 5 languages
- [ ] Test export/import functionality
- [ ] Test with empty state (no data)
- [ ] Test with legacy data (old export format)
- [ ] Test mobile responsiveness
- [ ] Test all expense types (need/want) are handled
- [ ] Verify calculations are correct (monthly conversions)
- [ ] Check that all user-facing text is translated

## Development Workflow

```bash
# Install dependencies
pnpm install

# Start dev server (port 8080)
pnpm dev

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## Path Aliases

- `@/*` - References `client/` directory
- `@shared/*` - References `shared/` directory

## Color Theming

Theme configuration in `client/global.css`:
- Uses CSS variables for colors
- Supports dark mode via `next-themes`
- Color categories: primary, secondary, accent, destructive, muted, success, warning

## API Endpoints

Currently minimal backend usage:
- Most logic is client-side
- Data persistence via session storage
- No authentication yet
- No database yet

## Future Considerations

- Database integration for persistent storage
- User authentication
- Cloud sync
- Budget goals and alerts
- Recurring transactions
- Bill reminders
- Multiple account support
- CSV import/export
- Mobile app

## Getting Help

- Check AGENTS.md for framework-specific patterns
- Review existing pages for implementation examples
- Check locale files for translation key patterns
- Use TypeScript types as documentation

---

**Last Updated:** 2026-02-09
**Version:** 1.0.0
