
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Dashboard() {
  const [products] = useLocalStorage("products", []);
  const [sales] = useLocalStorage("sales", []);

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((sale: any) => sale.date === today);
  
  const todayRevenue = todaySales.reduce((sum: number, sale: any) => 
    sum + (sale.quantity * sale.price), 0
  );
  
  const todayProfit = todaySales.reduce((sum: number, sale: any) => {
    const product = products.find((p: any) => p.id === sale.productId);
    const profit = product ? (sale.price - product.costPrice) * sale.quantity : 0;
    return sum + profit;
  }, 0);

  const lowStockProducts = products.filter((product: any) => 
    product.quantity <= product.minStock
  );

  const topSellingProducts = todaySales.reduce((acc: any, sale: any) => {
    const existing = acc.find((item: any) => item.productId === sale.productId);
    if (existing) {
      existing.quantity += sale.quantity;
    } else {
      const product = products.find((p: any) => p.id === sale.productId);
      acc.push({
        productId: sale.productId,
        name: product?.name || 'Unknown',
        quantity: sale.quantity
      });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.quantity - a.quantity).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Stock Alert:</strong> {lowStockProducts.length} product(s) are running low on stock.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-blue-100">
              From {todaySales.length} sales today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayProfit.toFixed(2)}</div>
            <p className="text-xs text-green-100">
              Net profit margin: {todayRevenue > 0 ? ((todayProfit/todayRevenue) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-purple-100">
              {lowStockProducts.length} low stock
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySales.length}</div>
            <p className="text-xs text-orange-100">
              Transactions completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products Today</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellingProducts.length > 0 ? (
              <div className="space-y-3">
                {topSellingProducts.map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{product.quantity} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No sales recorded today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-sm text-red-600">{product.quantity} left</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
