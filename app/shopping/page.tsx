// PaymentConfirmation.tsx
"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Package, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Header } from "@/components/header/page"; 
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";


type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

interface OrderItem {
  item_name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  created_at: string;
  status: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export default function PaymentConfirmation() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCartFromCookie = (): Product[] | null => {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('cart='));
    if (!cookie) return null;
    try {
      const cookieValue = decodeURIComponent(cookie.split('=')[1]);
      console.log('Cookie del carrito:', JSON.parse(cookieValue));
      return JSON.parse(cookieValue);
    } catch (error) {
      console.error('Error parsing cart cookie:', error);
      return null;
    }
  };

  const calculateOrderTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.21;
    const shipping = subtotal > 50 ? 0 : 5.99;
    return { subtotal, tax, shipping, total: subtotal + tax + shipping };
  };

  const extractPurchasesArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    const nestedArrays = ['purchases', 'data', 'results', 'items'];
    for (const key of nestedArrays) {
      if (data?.[key] && Array.isArray(data[key])) return data[key];
    }
    if (typeof data === 'object' && data !== null) return [data];
    return [];
  };

  const getLatestOrder = (purchases: any[]): Order => {
    const sortedPurchases = [...purchases].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const latestPurchaseDate = sortedPurchases[0]?.created_at;
    const latestOrderItems = sortedPurchases.filter(item => item.created_at === latestPurchaseDate);

    const normalizedItems = latestOrderItems.map((item: any) => ({
      item_name: item.item_name || "Producto sin nombre",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: item.image || item.product_image || "/f4.gif",
    }));

    return {
      created_at: latestPurchaseDate || new Date().toISOString(),
      status: sortedPurchases[0]?.status || "completado",
      payment_method: sortedPurchases[0].payment_method || "tarjeta",
      items: normalizedItems,
      ...calculateOrderTotals(normalizedItems)
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/purchases/shop");
        const data = await response.json();

        const purchasesArray = extractPurchasesArray(data.purchases);
        let latestOrder: Order;

        if (purchasesArray.length > 0) {
          latestOrder = getLatestOrder(purchasesArray);
        } else {
          const cartItems = getCartFromCookie();
          if (!cartItems) throw new Error("No hay compras recientes");
          
          // Mapeo directo desde el carrito
          const normalizedItems = cartItems.map((item: Product) => ({
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image.startsWith('/') 
              ? item.image 
              : `/${item.image.replace(/^\//, '')}`, // Asegurar ruta absoluta
          }));

          latestOrder = {
            created_at: new Date().toISOString(),
            status: "pendiente",
            payment_method: "tarjeta",
            items: normalizedItems,
            ...calculateOrderTotals(normalizedItems)
          };
        }

        setOrder(latestOrder);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };

  if (loading) { 
    return (
      <div className="text-center p-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!order) return <div className="text-center p-8">No se encontraron compras recientes</div>;

  return (
    <>
    <Header cart={[]} clearCart={() => {}} addToCart={() => {}} totalPrice={0} />
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Última compra confirmada!</h1>
        <p className="text-muted-foreground">
          Compra realizada el {new Date(order.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Detalles de la compra</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Estado: {order.status}
            </p>
          </div>

          <div className="space-y-6">
            {order.items.map((item, index) => (
              <div key={`${index}`} className="flex gap-4">
                <div className="flex-shrink-0 relative h-20 w-20">
                  <Image
                    src={item.image}
                    alt={item.item_name}
                    fill
                    className="rounded-md border object-cover"
                    sizes="(max-width: 640px) 80px, 100px"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{item.item_name}</h3>
                  <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <Separator />

        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal</p>
              <p>{formatCurrency(order.subtotal)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Impuestos (21%)</p>
              <p>{formatCurrency(order.tax)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Envío</p>
              <p>{order.shipping === 0 ? "Gratis" : formatCurrency(order.shipping)}</p>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <p>Total</p>
              <p>{formatCurrency(order.total)}</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 flex flex-col gap-4">
          <div className="bg-muted/50 p-4 rounded-lg text-sm w-full">
            <p className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Método de pago: {order.payment_method}</span>
            </p>
          </div>
        </CardFooter>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="flex-1">
          <Link href="/dashboard" className="flex items-center justify-center gap-2">
            Historial de compras
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/" className="flex items-center justify-center gap-2">
            Seguir comprando
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
    </>
  );
}
