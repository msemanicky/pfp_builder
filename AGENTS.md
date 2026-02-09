# Personal Finance Planner

> **Note:** This app is built on the Fusion Starter template. See sections below for both app-specific and framework-specific information.

A production-ready Personal Finance Planner application built with React, TypeScript, and Express. Helps users manage income, expenses, debts, and plan their financial future with interactive strategies and analytics.

**👉 For detailed development guidelines, see [CLAUDE.md](./CLAUDE.md)**

## App-Specific Quick Reference

### Finance Data Model
- **Incomes** - Track income sources with frequency (monthly, annual, weekly, biweekly)
- **Expenses** - Categorized expenses with **type classification** (need vs want)
- **Debts** - Track debts with interest rates and payment schedules
- **Strategies** - Savings strategies (50/30/20, custom, etc.)

### Critical Features
1. **Expense Type Classification** - Every expense must be marked as "need" or "want"
2. **Multi-language Support** - All text must use i18n translations (5 languages: EN, ES, FR, DE, SK)
3. **Session Storage** - Data persists in session, not localStorage
4. **Export/Import** - Full data export with backward compatibility
5. **Savings Strategy Comparison** - Shows actual vs recommended spending allocation

### Key Pages
- `/` - Dashboard with financial overview
- `/financial-input` - Add/edit incomes, expenses, debts
- `/savings-strategies` - Select strategy and view comparison
- `/charts` - Analytics and visualizations
- `/investment` - Investment planning calculator

---

# Framework Documentation (Fusion Starter)

While the starter comes with an Express server, only create endpoints when strictly necessary, for example to encapsulate logic that must live on the server, such as private keys handling, or certain DB operations...

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (spa) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css` 
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**: Single port (8080) for both frontend/backend
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Example API Routes
- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint  

### Shared Types
Import consistent types in both client and server:
```typescript
import { DemoResponse } from '@shared/api';
```

Path aliases:
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev        # Start dev server (client + server)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript validation
pnpm test          # Run Vitest tests
```

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route
1. **Optional**: Create a shared interface in `shared/api.ts`:
```typescript
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Create a new route handler in `server/routes/my-route.ts`:
```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: 'Hello from my endpoint!'
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:
```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:
```typescript
import { MyRouteResponse } from '@shared/api'; // Optional: for type safety

const response = await fetch('/api/my-endpoint');
const data: MyRouteResponse = await response.json();
```

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces

---

# Finance App Patterns & Workflows

## Translation Workflow

**REQUIRED:** All user-facing text must use i18n.

```typescript
// ✅ Correct
const { t } = useTranslation();
<h1>{t('savings_strategies.title')}</h1>

// ❌ Wrong
<h1>Savings Strategies</h1>
```

**Adding New Translations:**
1. Add to all 5 files: `en.json`, `es.json`, `fr.json`, `de.json`, `sk.json`
2. Use dot notation: `section.subsection.key`
3. Support interpolation: `{{variable}}`

## Data Persistence Pattern

```typescript
// Data flows:
// 1. User action → Context function → State update
// 2. State update → useEffect → sessionStorage
// 3. Page load → useEffect → sessionStorage → State

// Example: Adding expense
const { addExpense } = useFinance();

addExpense({
  name: "Groceries",
  amount: 150,
  category: "food",
  frequency: "monthly",
  type: "need"  // ⚠️ REQUIRED
});
```

## Expense Type Classification

**Every expense MUST have a type:**
- **"need"** - Essential (housing, utilities, food, healthcare, min debt payments)
- **"want"** - Non-essential (entertainment, dining out, hobbies)

This powers the strategy comparison feature.

## Currency Conversion Pattern

Always convert to monthly for calculations:

```typescript
const convertToMonthly = (amount: number, frequency: string): number => {
  switch (frequency) {
    case "annual": return amount / 12;
    case "weekly": return amount * 52 / 12;
    case "biweekly": return amount * 26 / 12;
    default: return amount;
  }
};

// Usage
const totalMonthlyExpenses = expenses.reduce(
  (sum, expense) => sum + convertToMonthly(expense.amount, expense.frequency),
  0
);
```

## Strategy Comparison Logic

```typescript
// 1. Calculate actual spending by type
const actualNeeds = expenses
  .filter(e => e.type === "need")
  .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);

const actualWants = expenses
  .filter(e => e.type === "want")
  .reduce((sum, e) => sum + convertToMonthly(e.amount, e.frequency), 0);

const actualSavings = totalIncome - totalExpenses;

// 2. Calculate percentages
const actualNeedsPercent = (actualNeeds / totalIncome) * 100;
const actualWantsPercent = (actualWants / totalIncome) * 100;
const actualSavingsPercent = (actualSavings / totalIncome) * 100;

// 3. Compare with recommended strategy
const difference = actualNeedsPercent - strategy.breakdown.needs;
```

## Form State Pattern

```typescript
// Expense form state with all required fields
const [expenseForm, setExpenseForm] = useState({
  name: "",
  amount: "",
  category: "other",
  frequency: "monthly",
  type: "need"  // Default value
});

// Handle submission
const handleAddExpense = () => {
  const amount = parseFloat(expenseForm.amount);
  if (!expenseForm.name || !amount || amount <= 0) return;

  addExpense({
    name: expenseForm.name,
    amount: amount,
    category: expenseForm.category as any,
    frequency: expenseForm.frequency as any,
    type: expenseForm.type as any  // ⚠️ Include type
  });

  // Reset form
  setExpenseForm({
    name: "",
    amount: "",
    category: "other",
    frequency: "monthly",
    type: "need"
  });
};
```

## Export/Import Pattern

**Export includes:**
- All incomes, expenses (with type), debts
- Selected strategy and custom strategy settings
- Language preference

**Import handles backward compatibility:**
- Old exports without `type` field default to "need"
- Missing strategy settings use defaults

```typescript
// Export
const jsonData = exportData();  // Returns JSON string
// Download or save

// Import
const success = importData(jsonString);
if (success) {
  // Data loaded, auto-migrated if old format
} else {
  // Invalid format
}
```

## Styling Patterns

```typescript
// Color coding by category
<span className={cn(
  "badge",
  expense.type === 'need' && 'bg-primary/10 text-primary',
  expense.type === 'want' && 'bg-warning/10 text-warning'
)}>
  {t(`expense_type.${expense.type}`)}
</span>

// Strategy colors
// Primary (blue) = Needs
// Warning (orange) = Wants
// Success (green) = Savings
```

## Common Gotchas

1. **Missing expense type** - Always include `type: "need" | "want"`
2. **String to number** - Input values are strings, always parse
3. **Translation keys** - Must exist in ALL 5 locale files
4. **Session storage** - Data lost on tab close, use export for persistence
5. **Frequency conversion** - Always convert to monthly for comparison
6. **Backward compatibility** - Old imports may lack new fields

## Quick Command Reference

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm typecheck    # Check TypeScript
pnpm test         # Run tests
```

## File Locations Quick Reference

- **Translations:** `client/locales/*.json`
- **Types:** `client/types/finance.ts`
- **Context:** `client/context/FinanceContext.tsx`
- **Pages:** `client/pages/*.tsx`
- **UI Components:** `client/components/ui/*.tsx`
