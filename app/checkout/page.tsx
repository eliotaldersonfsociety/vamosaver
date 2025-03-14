"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CheckoutPage() {
  const [hasAccount, setHasAccount] = useState<boolean>(true)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [lastname, setLastname] = useState<string>("")
  const [direction, setDirection] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [postalcode, setPostalcode] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const router = useRouter() 

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const selectOption = (option: boolean) => {
    setHasAccount(option)
    setIsMenuOpen(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        // Aquí podrías redirigir al usuario a la página deseada
        router.push("/payments/")
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          lastname,
          email,
          password,
          direction,
          phone,
          postalcode,
        }),
      })
      const data = await response.json()

      if (response.ok) {
        // Aquí podrías redirigir al usuario a la página deseada
        router.push("/payments/")
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Checkout</CardTitle>
          <CardDescription>Complete your purchase by logging in or creating an account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Button variant="outline" className="w-full justify-between" onClick={toggleMenu}>
                {hasAccount ? "I have an account" : "I need to create an account"}
                {isMenuOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>

              {isMenuOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                  <div className="py-1">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-muted"
                      onClick={() => selectOption(true)}
                    >
                      I have an account
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-muted"
                      onClick={() => selectOption(false)}
                    >
                      I need to create an account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasAccount ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login & Continue"}
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="text-center text-sm">
                <Link href="#" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    placeholder="Doe"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction">Address</Label>
                <Input
                  id="direction"
                  placeholder="123 Main St"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    placeholder="12345"
                    value={postalcode}
                    onChange={(e) => setPostalcode(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleRegister} disabled={loading}>
                {loading ? "Creating account..." : "Create Account & Continue"}
              </Button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
