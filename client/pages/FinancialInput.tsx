import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFinance } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit2, Plus, Info } from "lucide-react";
import { Income, Expense, Debt } from "@/types/finance";

const FinancialInput: React.FC = () => {
  const { t } = useTranslation();
  const { data, addIncome, updateIncome, removeIncome, addExpense, updateExpense, removeExpense, addDebt, updateDebt, removeDebt } = useFinance();

  // Income Form State
  const [incomeForm, setIncomeForm] = useState<{ name: string; amount: string | number; frequency: string }>({ name: "", amount: "", frequency: "monthly" });
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState<{ name: string; amount: string | number; category: string; frequency: string; type: string }>({ name: "", amount: "", category: "other", frequency: "monthly", type: "need" });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Debt Form State
  const [debtForm, setDebtForm] = useState<{ name: string; principal: string | number; interestRate: string | number; monthlyPayment: string | number; remainingMonths: string | number }>({
    name: "", principal: "", interestRate: "", monthlyPayment: "", remainingMonths: ""
  });
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const frequency_options = ["monthly", "annual", "weekly", "biweekly"];
  const category_options = ["housing", "food", "transportation", "utilities", "entertainment", "healthcare", "education", "insurance", "debt", "other"];

  // Income Handlers
  const handleAddIncome = () => {
    const amount = typeof incomeForm.amount === 'string' ? parseFloat(incomeForm.amount) : incomeForm.amount;
    if (!incomeForm.name || !amount || amount <= 0) return;
    if (editingIncomeId) {
      updateIncome(editingIncomeId, {
        name: incomeForm.name,
        amount: amount,
        frequency: incomeForm.frequency as any,
      });
      setEditingIncomeId(null);
    } else {
      addIncome({
        name: incomeForm.name,
        amount: amount,
        frequency: incomeForm.frequency as any,
      });
    }
    setIncomeForm({ name: "", amount: "", frequency: "monthly" });
  };

  const handleEditIncome = (income: Income) => {
    setIncomeForm({
      name: income.name,
      amount: income.amount,
      frequency: income.frequency,
    });
    setEditingIncomeId(income.id);
  };

  // Expense Handlers
  const handleAddExpense = () => {
    const amount = typeof expenseForm.amount === 'string' ? parseFloat(expenseForm.amount) : expenseForm.amount;
    if (!expenseForm.name || !amount || amount <= 0) return;
    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        name: expenseForm.name,
        amount: amount,
        category: expenseForm.category as any,
        frequency: expenseForm.frequency as any,
        type: expenseForm.type as any,
      });
      setEditingExpenseId(null);
    } else {
      addExpense({
        name: expenseForm.name,
        amount: amount,
        category: expenseForm.category as any,
        frequency: expenseForm.frequency as any,
        type: expenseForm.type as any,
      });
    }
    setExpenseForm({ name: "", amount: "", category: "other", frequency: "monthly", type: "need" });
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseForm({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency,
      type: expense.type,
    });
    setEditingExpenseId(expense.id);
  };

  // Debt Handlers
  const handleAddDebt = () => {
    const principal = typeof debtForm.principal === 'string' ? parseFloat(debtForm.principal) : debtForm.principal;
    const interestRate = typeof debtForm.interestRate === 'string' ? parseFloat(debtForm.interestRate) : debtForm.interestRate;
    const monthlyPayment = typeof debtForm.monthlyPayment === 'string' ? parseFloat(debtForm.monthlyPayment) : debtForm.monthlyPayment;
    const remainingMonths = typeof debtForm.remainingMonths === 'string' ? parseInt(debtForm.remainingMonths) : debtForm.remainingMonths;

    if (!debtForm.name || !principal || principal <= 0) return;
    if (editingDebtId) {
      updateDebt(editingDebtId, {
        name: debtForm.name,
        principal: principal,
        interestRate: interestRate || 0,
        monthlyPayment: monthlyPayment || 0,
        remainingMonths: remainingMonths || 0,
      });
      setEditingDebtId(null);
    } else {
      addDebt({
        name: debtForm.name,
        principal: principal,
        interestRate: interestRate || 0,
        monthlyPayment: monthlyPayment || 0,
        remainingMonths: remainingMonths || 0,
      });
    }
    setDebtForm({ name: "", principal: "", interestRate: "", monthlyPayment: "", remainingMonths: "" });
  };

  const handleEditDebt = (debt: Debt) => {
    setDebtForm({
      name: debt.name,
      principal: debt.principal,
      interestRate: debt.interestRate,
      monthlyPayment: debt.monthlyPayment,
      remainingMonths: debt.remainingMonths,
    });
    setEditingDebtId(debt.id);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('financial_input.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('financial_input.subtitle')}</p>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="income">{t('financial_input.incomes')}</TabsTrigger>
          <TabsTrigger value="expense">{t('financial_input.expenses')}</TabsTrigger>
          <TabsTrigger value="debt">{t('financial_input.debts')}</TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{editingIncomeId ? t('financial_input.edit') + ' ' + t('financial_input.incomes') : t('financial_input.add_income')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('financial_input.name')}</Label>
                  <Input
                    value={incomeForm.name}
                    onChange={(e) => setIncomeForm({ ...incomeForm, name: e.target.value })}
                    placeholder={t('financial_input.placeholder_income')}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.amount')}</Label>
                  <Input
                    type="number"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.frequency')}</Label>
                  <Select value={incomeForm.frequency} onValueChange={(value) => setIncomeForm({ ...incomeForm, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequency_options.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {t(`frequency.${freq}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddIncome} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingIncomeId ? t('button.update') : t('button.add')}
                  </Button>
                  {editingIncomeId && (
                    <Button
                      onClick={() => {
                        setEditingIncomeId(null);
                        setIncomeForm({ name: "", amount: 0, frequency: "monthly" });
                      }}
                      variant="outline"
                    >
                      {t('button.cancel')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('financial_input.incomes')}</CardTitle>
                <CardDescription>{t('financial_input.total_income_sources', { count: data.incomes.length })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.incomes.map((income) => (
                    <div key={income.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{income.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${income.amount.toFixed(2)} {t(`frequency.${income.frequency}`)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditIncome(income)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeIncome(income.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {data.incomes.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">{t('financial_input.no_incomes')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expense Tab */}
        <TabsContent value="expense">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{editingExpenseId ? t('financial_input.edit') + ' ' + t('financial_input.expenses') : t('financial_input.add_expense')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('financial_input.name')}</Label>
                  <Input
                    value={expenseForm.name}
                    onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                    placeholder={t('financial_input.placeholder_expense')}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.amount')}</Label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.category')}</Label>
                  <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {category_options.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {t(`category.${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label>{t('financial_input.type')}</Label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border z-10">
                        {t('financial_input.type_help')}
                      </div>
                    </div>
                  </div>
                  <Select value={expenseForm.type} onValueChange={(value) => setExpenseForm({ ...expenseForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="need">
                        <div>
                          <div className="font-medium">{t('expense_type.need')}</div>
                          <div className="text-xs text-muted-foreground">{t('expense_type.need_short')}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="want">
                        <div>
                          <div className="font-medium">{t('expense_type.want')}</div>
                          <div className="text-xs text-muted-foreground">{t('expense_type.want_short')}</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="savings">
                        <div>
                          <div className="font-medium">{t('expense_type.savings')}</div>
                          <div className="text-xs text-muted-foreground">{t('expense_type.savings_short')}</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('financial_input.frequency')}</Label>
                  <Select value={expenseForm.frequency} onValueChange={(value) => setExpenseForm({ ...expenseForm, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequency_options.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {t(`frequency.${freq}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddExpense} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingExpenseId ? t('button.update') : t('button.add')}
                  </Button>
                  {editingExpenseId && (
                    <Button
                      onClick={() => {
                        setEditingExpenseId(null);
                        setExpenseForm({ name: "", amount: 0, category: "other", frequency: "monthly", type: "need" });
                      }}
                      variant="outline"
                    >
                      {t('button.cancel')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('financial_input.expenses')}</CardTitle>
                <CardDescription>{t('financial_input.total_expenses_count', { count: data.expenses.length })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{expense.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            expense.type === 'need'
                              ? 'bg-primary/10 text-primary'
                              : expense.type === 'want'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}>
                            {t(`expense_type.${expense.type}`)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${expense.amount.toFixed(2)} {t(`frequency.${expense.frequency}`)} • {t(`category.${expense.category}`)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {data.expenses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">{t('financial_input.no_expenses')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Debt Tab */}
        <TabsContent value="debt">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{editingDebtId ? t('financial_input.edit') + ' ' + t('financial_input.debts') : t('financial_input.add_debt')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('financial_input.name')}</Label>
                  <Input
                    value={debtForm.name}
                    onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                    placeholder={t('financial_input.placeholder_debt')}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.principal_amount')}</Label>
                  <Input
                    type="number"
                    value={debtForm.principal}
                    onChange={(e) => setDebtForm({ ...debtForm, principal: e.target.value })}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.interest_rate')}</Label>
                  <Input
                    type="number"
                    value={debtForm.interestRate}
                    onChange={(e) => setDebtForm({ ...debtForm, interestRate: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.monthly_payment')}</Label>
                  <Input
                    type="number"
                    value={debtForm.monthlyPayment}
                    onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: e.target.value })}
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <Label>{t('financial_input.remaining_months')}</Label>
                  <Input
                    type="number"
                    value={debtForm.remainingMonths}
                    onChange={(e) => setDebtForm({ ...debtForm, remainingMonths: e.target.value })}
                    placeholder="0"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddDebt} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingDebtId ? t('button.update') : t('button.add')}
                  </Button>
                  {editingDebtId && (
                    <Button
                      onClick={() => {
                        setEditingDebtId(null);
                        setDebtForm({ name: "", principal: 0, interestRate: 0, monthlyPayment: 0, remainingMonths: 0 });
                      }}
                      variant="outline"
                    >
                      {t('button.cancel')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('financial_input.debts')}</CardTitle>
                <CardDescription>{t('financial_input.total_debts_count', { count: data.debts.length })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.debts.map((debt) => (
                    <div key={debt.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{debt.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('financial_input.debt_principal')} ${debt.principal.toFixed(2)} • {t('financial_input.debt_payment')} ${debt.monthlyPayment.toFixed(2)}{t('financial_input.per_month_short')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditDebt(debt)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDebt(debt.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {data.debts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">{t('financial_input.no_debts')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialInput;
