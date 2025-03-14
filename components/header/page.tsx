"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { Product } from "@/types/user"; // Importa el tipo Product desde el archivo correcto

interface HeaderProps {
  cart: Product[];
  clearCart: () => void;
  addToCart: (item: Product) => void;
  totalPrice: number;
}

export function Header({ clearCart, addToCart }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["cart"]);
  const [cart, setCart] = useState<Product[]>([]);

  // Cargar el carrito desde las cookies al montar el componente
  useEffect(() => {
    if (cookies.cart) {
      try {
        console.log("Cart cookie value:", cookies.cart);
        if (Array.isArray(cookies.cart)) {
          setCart(cookies.cart);
        } else {
          console.warn("El carrito en cookies no es un array válido.");
          removeCookie("cart", { path: "/" });
        }
      } catch (error) {
        console.error("Error al cargar el carrito desde cookies:", error);
        removeCookie("cart", { path: "/" });
      }
    }
  }, [cookies.cart]);

  // Función para agregar productos al carrito
  const addToCartHandler = (item: Product) => {
    const newItem = { ...item, quantity: 1 }; // Asigna 1 por defecto
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    const cartString = JSON.stringify(updatedCart);
    console.log("Setting cart cookie:", cartString);
    setCookie("cart", cartString, { path: "/", maxAge: 7 * 24 * 60 * 60 });
    addToCart(newItem);
  };

  // Función para vaciar el carrito con confirmación
  const clearCartHandler = () => {
    if (confirm("¿Estás seguro de vaciar el carrito?")) {
      setCart([]);
      removeCookie("cart", { path: "/" });
      clearCart();
    }
  };

  // Calcular el precio total del carrito
  const totalPrice = useMemo(() => {
    return cart.reduce((sum, product) => sum + product.price, 0);
  }, [cart]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">YourStore</span>
        </Link>

        {/* Barra de búsqueda */}
        <div className="hidden flex-1 max-w-md mx-4 md:flex">
          <SearchBar />
        </div>

        {/* Carrito y Menú de Usuario */}
        <div className="flex items-center gap-4">
          {/* Botón del carrito con Badge */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(!isCartOpen)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cart.length}
              </Badge>
            )}
            <span className="sr-only">Shopping cart</span>
          </Button>

          {/* Modal del carrito */}
          {isCartOpen && (
            <div className="fixed right-0 top-0 w-80 bg-white shadow-lg p-4 h-full overflow-y-auto z-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button
                  className="text-xl font-bold text-gray-500"
                  onClick={() => setIsCartOpen(false)}
                >
                  &times;
                </button>
              </div>
              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
              ) : (
                <div>
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <p className="text-lg">{item.name}</p>
                        <p className="text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <h3 className="text-lg font-bold mt-4">
                    Total: ${totalPrice.toFixed(2)}
                  </h3>
                  {/* Botón para vaciar el carrito */}
                  <Button
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={clearCartHandler}
                  >
                    Vaciar Carrito
                  </Button>
                  {/* Botón para proceder a la compra */}
                  <Button
                    variant="checkout"
                    className="w-full mt-2 !bg-green-600 hover:!bg-green-700 text-white"
                    onClick={() => window.location.href = "/checkout/"}
                  >
                    Finalizar Compra
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Menú de Usuario */}
          <div className="relative">
            <button
              className="flex items-center justify-center rounded-full h-9 w-9 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </button>

            {isUserMenuOpen && <UserMenu onClose={() => setIsUserMenuOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}
