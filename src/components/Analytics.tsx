import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

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

  // Custom tooltip formatters
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatNumber = (value: number) => value.toString();

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
        <Card className="shadow-lg border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardTitle className="text-xl font-bold text-gray-800">Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" strokeWidth={1} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 2 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  label={{ value: `Time Period (${period})`, position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 2 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [formatCurrency(value), name]}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  name="Revenue"
                  dot={{ fill: '#3B82F6', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                  filter="drop-shadow(2px 2px 4px rgba(59, 130, 246, 0.3))"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  name="Profit"
                  dot={{ fill: '#10B981', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
                  filter="drop-shadow(2px 2px 4px rgba(16, 185, 129, 0.3))"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardTitle className="text-xl font-bold text-gray-800">Sales Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" strokeWidth={1} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 2 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  label={{ value: `Time Period (${period})`, position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 2 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  label={{ value: 'Number of Sales', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#374151' } }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatNumber(value), "Sales"]}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fffbeb', 
                    border: '2px solid #fbbf24', 
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="url(#barGradient)"
                  stroke="#d97706"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-xl font-bold text-gray-800">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {topProducts.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          filter: `drop-shadow(2px 2px 4px ${COLORS[index % COLORS.length]}40)`
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: '#fdf4ff', 
                      border: '2px solid #a855f7', 
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="text-xl font-bold text-gray-800">Product Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full shadow-inner border-2 border-white" 
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length],
                          boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 4px ${COLORS[index % COLORS.length]}40`
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-600 font-medium">{product.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600 font-semibold">+${product.profit.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
