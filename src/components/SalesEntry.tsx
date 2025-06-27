
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  date: string;
  time: string;
  profit: number;
}

export function SalesEntry() {
  const [products, setProducts] = useLocalStorage("products", []);
  const [sales, setSales] = useLocalStorage<Sale[]>("sales", []);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    customPrice: ""
  });

  const selectedProduct = products.find((p: any) => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.quantity) {
      toast({
        title: "Error",
        description: "Please select a product and enter quantity",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    const product = products.find((p: any) => p.id === formData.productId);

    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return;
    }

    if (product.quantity < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.quantity} units available`,
        variant: "destructive"
      });
      return;
    }

    const salePrice = formData.customPrice ? parseFloat(formData.customPrice) : product.sellingPrice;
    const profit = (salePrice - product.costPrice) * quantity;

    const newSale: Sale = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity,
      price: salePrice,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      profit
    };

    // Update product stock
    setProducts(products.map((p: any) => 
      p.id === product.id 
        ? { ...p, quantity: p.quantity - quantity }
        : p
    ));

    // Add sale
    setSales([newSale, ...sales]);

    // Reset form
    setFormData({
      productId: "",
      quantity: "",
      customPrice: ""
    });

    toast({
      title: "Sale Recorded",
      description: `Sale of ${quantity} ${product.name}${quantity > 1 ? 's' : ''} recorded successfully`,
    });
  };

  const todaySales = sales.filter(sale => sale.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Sales Entry</h1>
        <div className="text-sm text-gray-600">
          Today: {todaySales.length} sales
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">Select Product</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({...formData, productId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter((p: any) => p.quantity > 0).map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Selling Price:</span>
                      <p className="font-medium">${selectedProduct.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available Stock:</span>
                      <p className="font-medium">{selectedProduct.quantity}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct?.quantity || 1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <Label htmlFor="customPrice">Custom Price (Optional)</Label>
                <Input
                  id="customPrice"
                  type="number"
                  step="0.01"
                  value={formData.customPrice}
                  onChange={(e) => setFormData({...formData, customPrice: e.target.value})}
                  placeholder={selectedProduct ? `Default: $${selectedProduct.sellingPrice.toFixed(2)}` : "Enter custom price"}
                />
              </div>

              {selectedProduct && formData.quantity && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        ${((formData.customPrice ? parseFloat(formData.customPrice) : selectedProduct.sellingPrice) * parseInt(formData.quantity || "0")).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className="font-medium text-green-600">
                        ${(((formData.customPrice ? parseFloat(formData.customPrice) : selectedProduct.sellingPrice) - selectedProduct.costPrice) * parseInt(formData.quantity || "0")).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!selectedProduct || !formData.quantity}
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Today</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySales.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todaySales.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{sale.productName}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {sale.quantity} × ${sale.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{sale.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(sale.quantity * sale.price).toFixed(2)}</p>
                        <p className="text-sm text-green-600">+${sale.profit.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sales recorded today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
