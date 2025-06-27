
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Printer, Calendar, TrendingUp, Package, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function DailySummary() {
  const [sales] = useLocalStorage("sales", []);
  const [products] = useLocalStorage("products", []);

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((sale: any) => sale.date === today);

  const totalRevenue = todaySales.reduce((sum: number, sale: any) => sum + (sale.quantity * sale.price), 0);
  const totalProfit = todaySales.reduce((sum: number, sale: any) => sum + sale.profit, 0);
  const totalCost = totalRevenue - totalProfit;

  const productSummary = todaySales.reduce((acc: any, sale: any) => {
    if (!acc[sale.productId]) {
      acc[sale.productId] = {
        name: sale.productName,
        quantity: 0,
        revenue: 0,
        profit: 0
      };
    }
    acc[sale.productId].quantity += sale.quantity;
    acc[sale.productId].revenue += sale.quantity * sale.price;
    acc[sale.productId].profit += sale.profit;
    return acc;
  }, {});

  const topSellingProduct = Object.values(productSummary).sort((a: any, b: any) => b.quantity - a.quantity)[0] as any;
  const mostProfitableProduct = Object.values(productSummary).sort((a: any, b: any) => b.profit - a.profit)[0] as any;

  const handlePrint = () => {
    const printContent = `
      DAILY SALES SUMMARY
      Date: ${new Date().toLocaleDateString()}
      
      OVERVIEW
      Total Sales: ${todaySales.length}
      Total Revenue: $${totalRevenue.toFixed(2)}
      Total Cost: $${totalCost.toFixed(2)}
      Total Profit: $${totalProfit.toFixed(2)}
      Profit Margin: ${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
      
      TOP PERFORMERS
      Best Selling: ${topSellingProduct?.name || 'N/A'} (${topSellingProduct?.quantity || 0} units)
      Most Profitable: ${mostProfitableProduct?.name || 'N/A'} ($${mostProfitableProduct?.profit?.toFixed(2) || '0.00'})
      
      PRODUCT BREAKDOWN
      ${Object.values(productSummary).map((product: any) => 
        `${product.name}: ${product.quantity} units, $${product.revenue.toFixed(2)} revenue, $${product.profit.toFixed(2)} profit`
      ).join('\n')}
      
      SALES DETAILS
      ${todaySales.map((sale: any) => 
        `${sale.time} - ${sale.productName} x${sale.quantity} @ $${sale.price.toFixed(2)} = $${(sale.quantity * sale.price).toFixed(2)}`
      ).join('\n')}
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Daily Sales Summary - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Summary Generated",
      description: "Daily summary is ready for printing"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Daily Summary</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            Print Summary
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100">Total Sales</p>
              <p className="text-2xl font-bold">{todaySales.length}</p>
            </div>
            <div>
              <p className="text-blue-100">Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-100">Profit</p>
              <p className="text-2xl font-bold">${totalProfit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-100">Margin</p>
              <p className="text-2xl font-bold">
                {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Best Selling Product</h4>
              <p className="text-lg font-bold text-green-600">
                {topSellingProduct?.name || 'No sales today'}
              </p>
              {topSellingProduct && (
                <p className="text-sm text-green-600">{topSellingProduct.quantity} units sold</p>
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Most Profitable Product</h4>
              <p className="text-lg font-bold text-blue-600">
                {mostProfitableProduct?.name || 'No sales today'}
              </p>
              {mostProfitableProduct && (
                <p className="text-sm text-blue-600">${mostProfitableProduct.profit.toFixed(2)} profit</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(productSummary).length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.values(productSummary).map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} units</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">+${product.profit.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No sales recorded today</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sales Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySales.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {todaySales.map((sale: any) => (
                <div key={sale.id} className="flex justify-between items-center p-3 border-l-4 border-blue-400 bg-blue-50">
                  <div>
                    <p className="font-medium">{sale.time}</p>
                    <p className="text-sm text-gray-600">
                      {sale.productName} × {sale.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(sale.quantity * sale.price).toFixed(2)}</p>
                    <p className="text-sm text-green-600">Profit: ${sale.profit.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales recorded today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
