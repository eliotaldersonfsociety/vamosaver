"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, ShoppingCart, User as UserIcon } from "lucide-react";
import { Header } from "@/components/header/page";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserData, Purchase } from "@/types/user";

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [purchaseCount, setPurchaseCount] = useState<number | null>(null);
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch("/api/user", { credentials: "include" });
        if (!userResponse.ok) throw new Error("Error al obtener usuario");
        const userData = await userResponse.json();
        setUser(userData);

        const balanceResponse = await fetch("/api/balance", { credentials: "include" });
        if (!balanceResponse.ok) throw new Error("Error al obtener saldo");
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.balance);
        setPurchaseCount(balanceData.purchaseCount);

        const purchaseCountResponse = await fetch("/api/purchases/count", {
          method: 'GET',
          credentials: "include"
        });
        if (!purchaseCountResponse.ok) throw new Error("Error al obtener el número de compras");
        const purchaseCountData = await purchaseCountResponse.json();
        setPurchaseCount(purchaseCountData.purchaseCount);

        const purchasesResponse = await fetch("/api/purchases", { credentials: "include" });
        if (!purchasesResponse.ok) throw new Error("Error al obtener compras");
        const purchasesData = await purchasesResponse.json();
        console.log("Purchases Data:", purchasesData);

        if (Array.isArray(purchasesData.purchases)) {
          // Sort purchases by created_at in descending order
            const sortedPurchases: Purchase[] = purchasesData.purchases.sort((a: Purchase, b: Purchase) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          setPurchases(sortedPurchases);
        } else {
          setPurchases([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleRowClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const currentPurchases = purchases?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = purchases ? Math.ceil(purchases.length / itemsPerPage) : 0;

  return (
    <div className="space-y-4">
      <Header cart={[]} clearCart={() => {}} addToCart={() => {}} totalPrice={0} />
      {isLoading ? (
        <>
          <h1 className="text-2xl font-bold">
            <Skeleton className="h-8 w-48" />
          </h1>
          <div className="text-muted-foreground">
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr>
                      {["Date", "Amount", "Status"].map((_, i) => (
                        <th key={i} className="border p-2">
                          <Skeleton className="h-5 w-24" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="border p-2">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="border p-2">
                          <Skeleton className="h-5 w-16" />
                        </td>
                        <td className="border p-2">
                          <Skeleton className="h-5 w-20" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-muted-foreground">
            Welcome back, {user?.name}! Here&apos;s an overview of your account.
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Account</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user?.name} {user?.lastname}
                </div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {user?.isAdmin === 1 ? "Administrator Account" : "User Account"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${balance !== null ? balance.toFixed(2) : "0.00"}
                </div>
                <div className="text-xs text-muted-foreground">Available funds</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Purchases</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchaseCount || 0}</div>
                <div className="text-xs text-muted-foreground">Total purchases</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Item</th>
                      <th className="border p-2">Amount</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPurchases && currentPurchases.length > 0 ? (
                      currentPurchases.map((purchase) => {
                        const statusClass =
                          purchase.status === "por enviar"
                            ? "text-red-500"
                            : purchase.status === "enviado"
                            ? "text-green-500"
                            : "text-gray-500";

                        return (
                          <tr
                            key={purchase.id}
                            onClick={() => handleRowClick(purchase)}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <td className="border p-2">
                              {new Date(purchase.created_at).toLocaleDateString()}{" "}
                              {new Date(purchase.created_at).toLocaleTimeString()}
                            </td>
                            <td className="border p-2">{purchase.item_name}</td>
                            <td className="border p-2">${purchase.price.toFixed(2)}</td>
                            <td className={`border p-2 ${statusClass}`}>{purchase.status}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center p-2">
                          No purchases found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded"
                >
                  Next
                </button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            {selectedPurchase && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Purchase Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-2">
                    <h3 className="font-medium">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span>
                        {selectedPurchase.name} {selectedPurchase.lastname}
                      </span>

                      <span className="text-muted-foreground">Address:</span>
                      <span>{selectedPurchase.direction}</span>

                      <span className="text-muted-foreground">Postal Code:</span>
                      <span>{selectedPurchase.postalcode}</span>

                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedPurchase.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <h3 className="font-medium">Product Information</h3>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Item:</span>
                      <span>{selectedPurchase.item_name}</span>

                      <span className="text-muted-foreground">Price:</span>
                      <span>${selectedPurchase.price.toFixed(2)}</span>

                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={
                          selectedPurchase.status === "por enviar"
                            ? "text-red-500"
                            : selectedPurchase.status === "enviado"
                            ? "text-green-500"
                            : "text-gray-500"
                        }
                      >
                        {selectedPurchase.status}
                      </span>

                      <span className="text-muted-foreground">Date:</span>
                      <span>
                        {new Date(selectedPurchase.created_at).toLocaleDateString()}{" "}
                        {new Date(selectedPurchase.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </>
      )}
    </div>
  );
}
