
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Receipt, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

const expenseCategories = [
  "Rent",
  "Utilities",
  "Staff Salaries",
  "Transportation",
  "Marketing",
  "Equipment",
  "Supplies",
  "Insurance",
  "Taxes",
  "Maintenance",
  "Other"
];

export function OperationalExpenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    frequency: "monthly" as 'daily' | 'weekly' | 'monthly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      recurring: formData.recurring,
      frequency: formData.recurring ? formData.frequency : undefined
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      frequency: "monthly"
    });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Expense added successfully"
    });
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
    toast({
      title: "Deleted",
      description: "Expense has been removed"
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  const todayExpenses = expenses.filter(expense => expense.date === today);
  const monthlyExpenses = expenses.filter(expense => expense.date.startsWith(thisMonth));
  
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Operational Expenses</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
            <Receipt className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵{todayTotal.toFixed(2)}</div>
            <p className="text-xs text-red-100">
              {todayExpenses.length} expense{todayExpenses.length !== 1 ? 's' : ''} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵{monthlyTotal.toFixed(2)}</div>
            <p className="text-xs text-orange-100">
              {monthlyExpenses.length} expense{monthlyExpenses.length !== 1 ? 's' : ''} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <Receipt className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              GH₵{monthlyExpenses.length > 0 ? (monthlyTotal / new Date().getDate()).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-purple-100">
              Based on month-to-date
            </p>
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (GH₵) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter expense description"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="recurring">Recurring Expense</Label>
                <Select 
                  value={formData.recurring ? "yes" : "no"} 
                  onValueChange={(value) => setFormData({...formData, recurring: value === "yes"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurring && (
                <div className="md:col-span-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFormData({...formData, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Add Expense
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.slice(0, 20).map((expense) => (
                <div key={expense.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{expense.category}</span>
                        {expense.recurring && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {expense.frequency}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-red-600">-GH₵{expense.amount.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expenses recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
