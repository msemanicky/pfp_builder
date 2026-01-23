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
import { Trash2, Edit2, Plus } from "lucide-react";
import { Income, Expense, Debt } from "@/types/finance";

const FinancialInput: React.FC = () => {
  const { data, addIncome, updateIncome, removeIncome, addExpense, updateExpense, removeExpense, addDebt, updateDebt, removeDebt } = useFinance();

  // Income Form State
  const [incomeForm, setIncomeForm] = useState({ name: "", amount: 0, frequency: "monthly" });
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({ name: "", amount: 0, category: "other", frequency: "monthly" });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Debt Form State
  const [debtForm, setDebtForm] = useState({ name: "", principal: 0, interestRate: 0, monthlyPayment: 0, remainingMonths: 0 });
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const frequency_options = ["monthly", "annual", "weekly", "biweekly"];
  const category_options = ["housing", "food", "transportation", "utilities", "entertainment", "healthcare", "education", "insurance", "debt", "other"];

  // Income Handlers
  const handleAddIncome = () => {
    if (!incomeForm.name || incomeForm.amount <= 0) return;
    if (editingIncomeId) {
      updateIncome(editingIncomeId, {
        name: incomeForm.name,
        amount: incomeForm.amount,
        frequency: incomeForm.frequency as any,
      });
      setEditingIncomeId(null);
    } else {
      addIncome({
        name: incomeForm.name,
        amount: incomeForm.amount,
        frequency: incomeForm.frequency as any,
      });
    }
    setIncomeForm({ name: "", amount: 0, frequency: "monthly" });
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
    if (!expenseForm.name || expenseForm.amount <= 0) return;
    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        name: expenseForm.name,
        amount: expenseForm.amount,
        category: expenseForm.category as any,
        frequency: expenseForm.frequency as any,
      });
      setEditingExpenseId(null);
    } else {
      addExpense({
        name: expenseForm.name,
        amount: expenseForm.amount,
        category: expenseForm.category as any,
        frequency: expenseForm.frequency as any,
      });
    }
    setExpenseForm({ name: "", amount: 0, category: "other", frequency: "monthly" });
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseForm({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      frequency: expense.frequency,
    });
    setEditingExpenseId(expense.id);
  };

  // Debt Handlers
  const handleAddDebt = () => {
    if (!debtForm.name || debtForm.principal <= 0) return;
    if (editingDebtId) {
      updateDebt(editingDebtId, {
        name: debtForm.name,
        principal: debtForm.principal,
        interestRate: debtForm.interestRate,
        monthlyPayment: debtForm.monthlyPayment,
        remainingMonths: debtForm.remainingMonths,
      });
      setEditingDebtId(null);
    } else {
      addDebt({
        name: debtForm.name,
        principal: debtForm.principal,
        interestRate: debtForm.interestRate,
        monthlyPayment: debtForm.monthlyPayment,
        remainingMonths: debtForm.remainingMonths,
      });
    }
    setDebtForm({ name: "", principal: 0, interestRate: 0, monthlyPayment: 0, remainingMonths: 0 });
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Financial Input</h1>
        <p className="text-lg text-muted-foreground">Manage your incomes, expenses, and debts</p>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="income">Incomes</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="debt">Debts</TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{editingIncomeId ? "Edit Income" : "Add Income"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={incomeForm.name}
                    onChange={(e) => setIncomeForm({ ...incomeForm, name: e.target.value })}
                    placeholder="e.g. Salary"
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={incomeForm.frequency} onValueChange={(value) => setIncomeForm({ ...incomeForm, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequency_options.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddIncome} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingIncomeId ? "Update" : "Add"}
                  </Button>
                  {editingIncomeId && (
                    <Button
                      onClick={() => {
                        setEditingIncomeId(null);
                        setIncomeForm({ name: "", amount: 0, frequency: "monthly" });
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Incomes</CardTitle>
                <CardDescription>Total: {data.incomes.length} income source(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.incomes.map((income) => (
                    <div key={income.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{income.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${income.amount.toFixed(2)} {income.frequency.charAt(0).toUpperCase() + income.frequency.slice(1)}
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
                    <p className="text-center text-muted-foreground py-8">No incomes added yet</p>
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
                <CardTitle>{editingExpenseId ? "Edit Expense" : "Add Expense"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={expenseForm.name}
                    onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                    placeholder="e.g. Rent"
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {category_options.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={expenseForm.frequency} onValueChange={(value) => setExpenseForm({ ...expenseForm, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequency_options.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddExpense} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingExpenseId ? "Update" : "Add"}
                  </Button>
                  {editingExpenseId && (
                    <Button
                      onClick={() => {
                        setEditingExpenseId(null);
                        setExpenseForm({ name: "", amount: 0, category: "other", frequency: "monthly" });
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Total: {data.expenses.length} expense(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{expense.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${expense.amount.toFixed(2)} {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)} • {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
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
                    <p className="text-center text-muted-foreground py-8">No expenses added yet</p>
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
                <CardTitle>{editingDebtId ? "Edit Debt" : "Add Debt"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={debtForm.name}
                    onChange={(e) => setDebtForm({ ...debtForm, name: e.target.value })}
                    placeholder="e.g. Student Loan"
                  />
                </div>
                <div>
                  <Label>Principal Amount</Label>
                  <Input
                    type="number"
                    value={debtForm.principal}
                    onChange={(e) => setDebtForm({ ...debtForm, principal: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    value={debtForm.interestRate}
                    onChange={(e) => setDebtForm({ ...debtForm, interestRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Monthly Payment</Label>
                  <Input
                    type="number"
                    value={debtForm.monthlyPayment}
                    onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Remaining Months</Label>
                  <Input
                    type="number"
                    value={debtForm.remainingMonths}
                    onChange={(e) => setDebtForm({ ...debtForm, remainingMonths: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddDebt} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingDebtId ? "Update" : "Add"}
                  </Button>
                  {editingDebtId && (
                    <Button
                      onClick={() => {
                        setEditingDebtId(null);
                        setDebtForm({ name: "", principal: 0, interestRate: 0, monthlyPayment: 0, remainingMonths: 0 });
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Debts</CardTitle>
                <CardDescription>Total: {data.debts.length} debt(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.debts.map((debt) => (
                    <div key={debt.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{debt.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Principal: ${debt.principal.toFixed(2)} • Payment: ${debt.monthlyPayment.toFixed(2)}/mo
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
                    <p className="text-center text-muted-foreground py-8">No debts added yet</p>
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
