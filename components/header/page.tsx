"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { Product } from "@/types/user";

interface HeaderProps {
  cart: Product[];
  clearCart: () => void;
  addToCart: (item: Product) => void;
  totalPrice: number;
}

export function Header({ clearCart, addToCart }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["cart", "user"]);
  const [cart, setCart] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cargar y validar el carrito desde las cookies
  useEffect(() => {
    const loadCart = () => {
      try {
        const cookieCart = cookies.cart;
        
        if (!cookieCart) return;

        // Verificar si ya es un array
        if (Array.isArray(cookieCart)) {
          const validatedCart = cookieCart.map((item) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity) || 1,
            image: item.image || "/placeholder.svg"
          }));
          setCart(validatedCart);
          return;
        }

        // Si es string, parsear
        if (typeof cookieCart === "string") {
          const parsedCart = JSON.parse(cookieCart);
          if (Array.isArray(parsedCart)) {
            const validatedCart = parsedCart.map((item) => ({
              id: item.id,
              name: item.name,
              price: Number(item.price),
              quantity: Number(item.quantity) || 1,
              image: item.image || "/placeholder.svg"
            }));
            setCart(validatedCart);
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        removeCookie("cart", { path: "/" });
      }
    };

    loadCart();
  }, [cookies.cart, removeCookie]);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user", { method: "GET" });
        setIsLoggedIn(res.ok);
        console.error("Auth check failed:", res.ok);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Manejar agregar al carrito
  const addToCartHandler = (item: Product) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    const updatedCart = existingItem
      ? cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      : [...cart, { ...item, quantity: 1, image: item.image || "/placeholder.svg" }];

    setCart(updatedCart);
    setCookie("cart", JSON.stringify(updatedCart), { 
      path: "/", 
      maxAge: 604800,
      sameSite: "lax"
    });
  };

  // Vaciar carrito
  const clearCartHandler = () => {
    if (confirm("¿Estás seguro de vaciar el carrito?")) {
      setCart([]);
      removeCookie("cart", { path: "/" });
      clearCart();
    }
  };

  // Calcular total
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">YourStore</span>
        </Link>

        <div className="hidden flex-1 max-w-md mx-4 md:flex">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
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
          </Button>

          {isCartOpen && (
            <div className="fixed right-0 top-0 w-80 bg-white shadow-lg p-4 h-full overflow-y-auto z-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Carrito</h2>
                <button
                  className="text-xl font-bold text-gray-500"
                  onClick={() => setIsCartOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-gray-500">El carrito está vacío</p>
              ) : (
                <div>
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.quantity}`} className="flex items-center justify-between p-2 border-b">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <div>
                          <p className="text-lg">{item.name}</p>
                          <p className="text-gray-500">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <h3 className="text-lg font-bold mt-4">
                    Total: ${totalPrice.toFixed(2)}
                  </h3>
                  
                  <Button
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={clearCartHandler}
                  >
                    Vaciar Carrito
                  </Button>
                  
                  <Button
                    variant="default"
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      if (isLoggedIn) {
                        window.location.href = "/payments";
                      } else {
                        window.location.href = "/checkout";
                      }
                    }}
                  >
                    Finalizar Compra
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="relative">
            <button
              className="flex items-center justify-center rounded-full h-9 w-9 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="h-5 w-5" />
            </button>
            {isUserMenuOpen && <UserMenu onClose={() => setIsUserMenuOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}