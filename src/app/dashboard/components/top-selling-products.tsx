import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { orders } from "@/app/orders/data";
import { products } from "@/app/products/data";

// Utility function to calculate top selling products
const calculateTopSellingProducts = () => {
  // Group orders by product and sum quantities (excluding canceled orders)
  const productSales = orders
    .filter((order) => order.status !== "Canceled")
    .reduce((acc, order) => {
      const productCode = order.item;
      const productName = order.product;

      if (!acc[productCode]) {
        acc[productCode] = {
          code: productCode,
          name: productName,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }

      acc[productCode].totalQuantity += order.quantity;
      acc[productCode].totalRevenue += order.total;

      return acc;
    }, {} as Record<string, { code: string; name: string; totalQuantity: number; totalRevenue: number }>);

  // Convert to array and sort by total quantity sold
  const sortedProducts = Object.values(productSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 3); // Top 3 products

  // Get product details including images
  return sortedProducts.map((sale) => {
    const product = products.find((p) => p.code === sale.code);
    return {
      ...sale,
      image: product?.image || "/products/product-1.webp",
      price: product?.price || 0,
    };
  });
};

export function TopSellingProducts() {
  const topSellingProducts = calculateTopSellingProducts();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg lg:text-base">
          Top Selling Products
        </CardTitle>
        <CardDescription className="text-sm lg:text-xs">
          Based on total quantities sold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 lg:space-y-3">
        {topSellingProducts.map((product, index) => (
          <div
            key={product.code}
            className="flex items-center space-x-4 lg:space-x-3 p-3 lg:p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="relative w-12 h-12 lg:w-10 lg:h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 40px, 48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 lg:w-4 lg:h-4 rounded-full bg-primary text-primary-foreground text-xs lg:text-[10px] font-bold">
                  {index + 1}
                </span>
                <h4 className="text-sm lg:text-xs font-medium truncate">
                  {product.name}
                </h4>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs lg:text-[11px] text-muted-foreground">
                  {product.totalQuantity} units sold
                </p>
                <p className="text-xs lg:text-[11px] font-medium">
                  ${product.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {topSellingProducts.length === 0 && (
          <div className="text-center text-muted-foreground text-sm lg:text-xs py-4">
            No sales data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
