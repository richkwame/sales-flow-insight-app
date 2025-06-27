
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  category: string;
  imageUrl?: string;
}

export function ProductManagement() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
    minStock: "",
    category: "",
    imageUrl: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.costPrice || !formData.sellingPrice || !formData.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock || "5"),
      category: formData.category || "General",
      imageUrl: formData.imageUrl || undefined
    };

    setProducts([...products, newProduct]);
    setFormData({
      name: "",
      costPrice: "",
      sellingPrice: "",
      quantity: "",
      minStock: "",
      category: "",
      imageUrl: ""
    });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Product added successfully"
    });
  };

  const updateStock = (productId: string, newQuantity: number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, quantity: Math.max(0, newQuantity) }
        : product
    ));
    
    toast({
      title: "Stock Updated",
      description: "Product quantity has been updated"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Product category"
                />
              </div>
              
              <div>
                <Label htmlFor="costPrice">Cost Price (GH₵) *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="sellingPrice">Selling Price (GH₵) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Initial Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="minStock">Minimum Stock Alert</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  placeholder="5"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="imageUrl">Product Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: For file uploads, connect to Supabase for image storage
                </p>
              </div>
              
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Product
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className={`${product.quantity <= product.minStock ? 'border-red-300 bg-red-50' : ''}`}>
            <CardHeader className="pb-3">
              {product.imageUrl && (
                <div className="w-full h-32 mb-2 overflow-hidden rounded-lg">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.quantity <= product.minStock && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">{product.category}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Cost:</span>
                  <p className="font-medium">GH₵{product.costPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <p className="font-medium">GH₵{product.sellingPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className={`font-medium ${product.quantity <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                    {product.quantity}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStock(product.id, product.quantity - 1)}
                    disabled={product.quantity <= 0}
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStock(product.id, product.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Profit margin: GH₵{(product.sellingPrice - product.costPrice).toFixed(2)} 
                  ({(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Products Added</h3>
            <p className="text-gray-500 mb-4">Start by adding your first product to track inventory and sales.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
