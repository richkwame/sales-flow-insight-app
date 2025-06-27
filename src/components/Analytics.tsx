
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export function Analytics() {
  const [sales] = useLocalStorage("sales", []);
  const [products] = useLocalStorage("products", []);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      daily: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      }),
      weekly: Array.from({ length: 4 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (3 - i) * 7);
        return `W${date.getDate()}`;
      }),
      monthly: Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (5 - i));
        return date.toISOString().substring(0, 7);
      })
    };
    return ranges[period];
  };

  const getChartData = () => {
    const dateRange = getDateRange();
    
    return dateRange.map(dateKey => {
      let periodSales = [];
      
      if (period === "daily") {
        periodSales = sales.filter((sale: any) => sale.date === dateKey);
      } else if (period === "monthly") {
        periodSales = sales.filter((sale: any) => sale.date.startsWith(dateKey));
      } else {
        // For weekly, this is simplified - in reality you'd need more complex date logic
        periodSales = sales.filter((sale: any) => sale.date.includes(dateKey.replace('W', '')));
      }
      
      const revenue = periodSales.reduce((sum: number, sale: any) => sum + (sale.quantity * sale.price), 0);
      const profit = periodSales.reduce((sum: number, sale: any) => sum + sale.profit, 0);
      
      return {
        period: period === "daily" ? new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : dateKey,
        revenue: revenue,
        profit: profit,
        sales: periodSales.length
      };
    });
  };

  const getTopProducts = () => {
    const productSales = sales.reduce((acc: any, sale: any) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          name: sale.productName,
          revenue: 0,
          quantity: 0,
          profit: 0
        };
      }
      acc[sale.productId].revenue += sale.quantity * sale.price;
      acc[sale.productId].quantity += sale.quantity;
      acc[sale.productId].profit += sale.profit;
      return acc;
    }, {});

    return Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const chartData = getChartData();
  const topProducts = getTopProducts();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, ""]} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">+${product.profit.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
