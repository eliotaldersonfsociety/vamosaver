"use client"

import { useState } from "react"
import { Check, ChevronRight, Package, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Product {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function PaymentConfirmation() {
  const [order] = useState({
    id: "ORD-12345-ABCDE",
    date: new Date(),
    products: [
      {
        id: "prod-1",
        name: "Premium Wireless Headphones",
        price: 129.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: "prod-2",
        name: "Smart Watch Series 5",
        price: 249.99,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    subtotal: 379.98,
    tax: 30.4,
    shipping: 0,
    total: 410.38,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Pago completado con éxito!</h1>
        <p className="text-muted-foreground">Gracias por tu compra. Tu pedido #{order.id} ha sido confirmado.</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Detalles del pedido</h2>
            </div>
            <p className="text-sm text-muted-foreground">{order.date.toLocaleDateString("es-ES")}</p>
          </div>

          <div className="space-y-6">
            {order.products.map((product: Product) => (
              <div key={product.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-md border object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">Cantidad: {product.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(product.price * product.quantity)}</p>
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
              <p className="text-muted-foreground">Impuestos</p>
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
          <div className="bg-muted/50 p-4 rounded-lg text-sm">
            <p className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Tu pedido será enviado en 2-3 días hábiles</span>
            </p>
          </div>
        </CardFooter>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/orders" className="flex items-center gap-2">
            Ver mis pedidos
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products" className="flex items-center gap-2">
            Continuar comprando
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

