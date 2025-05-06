"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  getAdminStats,
  generateDiscountCode,
  type Order,
  type DiscountCode,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDiscount, setGeneratingDiscount] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState<DiscountCode | null>(
    null
  );
  const [adminToken, setAdminToken] = useState("");
  const [inputToken, setInputToken] = useState("");

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedToken = inputToken.trim();
    localStorage.setItem("admin-token", trimmedToken); // Store in localStorage
    setAdminToken(trimmedToken); // Also set in local state (optional)
    toast({ title: "Token Set", description: "Admin token saved successfully." });
  };
  

  const { toast } = useToast();

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const data = await getAdminStats()
        setOrders(data.orders || [])
        setDiscountCodes(data.discountCodes || [])
      } catch (error) {
        toast({ title: "Error", description: "Failed to load admin stats", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    loadStats();
  }, [adminToken]);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (token) {
      setAdminToken(token);
    }
  }, [adminToken]);
  
  const handleGenerateDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setGeneratingDiscount(true)
      const code = await generateDiscountCode()
      setNewDiscountCode(code)
      setDiscountCodes([...discountCodes, code])
      toast({ title: "Success", description: "Discount code generated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate discount code", variant: "destructive" })
    } finally {
      setGeneratingDiscount(false)
    }
  }
  

  const copyDiscountCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Success",
      description: "Discount code copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Token</CardTitle>
          <CardDescription>
            Enter the admin token to authenticate admin actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleTokenSubmit}
            className="flex items-center gap-4"
          >
            <input
              type="text"
              placeholder="Enter admin token"
              className="input input-bordered flex-1 px-4 py-2 rounded-md border border-gray-300"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
            />
            <Button type="submit">Set Token</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage orders and discount codes</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Discount Code</CardTitle>
            <CardDescription>
              Create a new discount code for customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateDiscount} className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={generatingDiscount}
              >
                {generatingDiscount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Discount Code"
                )}
              </Button>
            </form>

            {newDiscountCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 border rounded-lg bg-muted"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">New Discount Code:</p>
                    <p className="text-lg font-bold">{newDiscountCode.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {newDiscountCode.discountPercent}% off
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyDiscountCode(newDiscountCode.code)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy code</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground">No orders found</p>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {orders.map((order) => (
                        <div key={order.id} className="p-3">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">
                              Order #{order.id}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            User: {order.userId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Items: {order.items.length}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discounts" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Discount Codes</h3>
                  {discountCodes.length === 0 ? (
                    <p className="text-muted-foreground">
                      No discount codes found
                    </p>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {discountCodes.map((code, index) => (
                        <div
                          key={index}
                          className="p-3 flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{code.code}</span>
                              {code.used && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                  Used
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {code.discountPercent}% off
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyDiscountCode(code.code)}
                            disabled={code.used}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy code</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
