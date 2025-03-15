//payments.tsx
"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, Wallet, Bitcoin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCookies } from "react-cookie";
import { Header } from "@/components/header/page"; 



// Define the Product type
type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function PaymentsPage() {
  const router = useRouter();
  const [cookies, , removeCookie] = useCookies(["cart"]);
  const [cart, setCart] = useState<Product[]>([]);
  const [saldo, setSaldo] = useState<number | null>(null); // Estado para el saldo
  const [paymentMethod, setPaymentMethod] = useState<string>("balance"); // Método de pago seleccionado
  const [isProcessing, setIsProcessing] = useState(false); // Estado para controlar el proceso de pago

  useEffect(() => {
    if (!cookies.cart) return; // Si no hay carrito en cookies, salir
  
    try {
      console.log("Cart cookie value:", cookies.cart);
  
      // Intentar parsear el carrito
      const parsedCart = typeof cookies.cart === "string" ? JSON.parse(cookies.cart) : cookies.cart;
  
      if (Array.isArray(parsedCart)) {
        // Comprobar los valores de price
        parsedCart.forEach(item => {
          console.log(`Price of item ${item.name}:`, item.price);
        });
  
        // Asegurar que price sea numérico
        const validatedCart = parsedCart.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          quantity: item.quantity ? parseInt(item.quantity) : 1,
        }));
  
        setCart(validatedCart);
      } else {
        console.warn("El carrito en cookies no es un array válido.");
        removeCookie("cart", { path: "/" }); // Aquí removeCookie está bien definido
      }
    } catch (error) {
      console.error("Error al cargar el carrito desde cookies:", error);
      removeCookie("cart", { path: "/" });
    }
  }, [cookies.cart, removeCookie]); // Asegurar que useEffect reaccione a cookies.cart
  
  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await fetch("/api/balance", {
          method: "GET",
          credentials: "include", // Envía las cookies automáticamente
        });

        if (!response.ok) {
          console.error("Error fetching balance:", response.statusText);
          return;
        }

        const data = await response.json();
        console.log("Fetched balance data:", data); // Log the response

      
      if (data.balance !== undefined) {
        setSaldo(data.balance);
      } else {
        console.error("Error fetching balance:", data.message);
      }
    } catch (error) {
      console.error("Error while fetching balance:", error);
    }
  };
  
    fetchSaldo();
  }, []);
  

  // Calcular el subtotal y el total
  const subtotal: number = cart.reduce((sum: number, item: Product) => sum + (item.price * item.quantity || 0), 0);
  const shipping = 5.99;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    if (isProcessing) return; // Evitar múltiples solicitudes

    setIsProcessing(true);

    try {
      const response = await fetch("/api/purchases/buy/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          status: "pending", // Asumimos que el estado de la compra es pendiente
          payment_method: paymentMethod,
          name: "John", // Deberías obtener estos valores de un formulario de usuario
          lastname: "Doe",
          email: "john.doe@example.com",
          phone: "1234567890",
          postalcode: "12345",
          direction: "123 Street Name",
        }),
        credentials: 'include',  // Asegúrate de que las cookies se envíen
      });

      const data = await response.json();

      if (response.ok) {
        alert("Compra realizada con éxito");
          router.push("/shopping");
      } else {
        console.error("Error al procesar el pago:", data.message);
        alert("Error al realizar el pago.");
      }
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      alert("Error al procesar la compra.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (     
  <>  
  <Header cart={[]} clearCart={() => {}} addToCart={() => {}} totalPrice={0} />
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Finalizar Compra</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Resumen del carrito */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Carrito</CardTitle>
                <CardDescription>
                  {cart.length} {cart.length === 1 ? "producto" : "productos"} en tu carrito
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-gray-500">Tu carrito está vacío</p>
                  ) : (
                    cart.map((item: any, index: number) => (
                      <div key={`${item.id}-${index}`} className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col gap-4 pt-6">
                <div className="flex justify-between w-full">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-full">
                  <span>Envío</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between w-full font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Métodos de pago */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
                <CardDescription>Selecciona cómo quieres pagar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-2 rounded-md border p-4">
                    <RadioGroupItem value="balance" id="balance" />
                    <Label htmlFor="balance" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-5 w-5 text-primary" />
                      <div className="flex flex-col">
                      <span className="font-medium">Saldo: ${saldo !== null ? saldo.toFixed(2) : "Cargando..."}</span>
                        <span className="text-sm text-muted-foreground">Pagar con tu saldo disponible</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-4">
                    <RadioGroupItem value="zelle" id="zelle" />
                    <Label htmlFor="zelle" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">Zelle</span>
                        <span className="text-sm text-muted-foreground">Pagar con Zelle</span>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-4">
                    <RadioGroupItem value="crypto" id="crypto" />
                    <Label htmlFor="crypto" className="flex items-center gap-2 cursor-pointer">
                      <Bitcoin className="h-5 w-5 text-orange-500" />
                      <div className="flex flex-col">
                        <span className="font-medium">Criptomonedas</span>
                        <span className="text-sm text-muted-foreground">Pagar con Bitcoin, Ethereum, etc.</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? "Procesando..." : "Completar Pago"}
                </Button>
                <Link href="/cart" className="text-center text-sm text-muted-foreground hover:underline">
                  Volver al carrito
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
