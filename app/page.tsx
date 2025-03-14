"use client";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Header } from "@/components/header/page"; // Importa el Header desde la carpeta correcta
import { Product } from "@/types/user"; // Importa el tipo Product desde el archivo correcto

const products: Product[] = [
  { id: 1, name: "Product 1", price: 29.99, image: "/path/to/image1.jpg" },
  { id: 2, name: "Product 2", price: 49.99, image: "/path/to/image2.jpg" },
  { id: 3, name: "Product 3", price: 19.99, image: "/path/to/image3.jpg" },
];

export default function Home() {
  const [cart, setCart] = useState<Product[]>([]);
  const [cookies, setCookie, removeCookie] = useCookies(["cart"]);

  useEffect(() => {
    try {
      if (cookies.cart && typeof cookies.cart === "string") {
        const parsedCart = JSON.parse(cookies.cart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          setCart([]);
        }
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
      setCart([]);
    }
  }, [cookies.cart]);

  const addToCart = (product: Product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    setCookie("cart", JSON.stringify(updatedCart), { path: "/" });
  };

  const clearCart = () => {
    setCart([]);
    removeCookie("cart", { path: "/" });
  };

  const totalPrice = cart.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cart={cart} clearCart={clearCart} addToCart={addToCart} totalPrice={totalPrice} />
      <header className="flex justify-between items-center p-4 bg-gray-100">
        <h1 className="text-2xl font-bold">YourStore</h1>
      </header>

      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold">Welcome to YourStore</h1>
        <p className="mt-4">Your e-commerce store with authentication</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg shadow-lg">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
              <h3 className="text-xl font-semibold mt-4">{product.name}</h3>
              <p className="text-gray-500 mt-2">${product.price.toFixed(2)}</p>
              <button
                onClick={() => addToCart(product)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
