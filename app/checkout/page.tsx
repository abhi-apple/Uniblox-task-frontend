"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCart, checkout, type CartItem, type CheckoutResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import CartSummary from "@/components/cart-summary"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [discountCode, setDiscountCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderDetails, setOrderDetails] = useState<CheckoutResponse["order"] | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true)
        const data = await getCart()
        setCartItems(data.cart || [])
      } catch (error) {
        toast({ title: "Error", description: "Failed to load cart. Please try again.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({ title: "Error", description: "Your cart is empty", variant: "destructive" })
      return
    }

    try {
      setCheckoutLoading(true)
      const response = await checkout(discountCode || undefined)
      setOrderDetails(response.order)
      setOrderComplete(true)
      toast({ title: "Success", description: "Checkout successful!" })
    } catch (error) {
      toast({ title: "Error", description: "Checkout failed. Please try again.", variant: "destructive" })
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Cart is Empty</CardTitle>
          <CardDescription>Add items to your cart before checkout</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/cart")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Cart
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {orderComplete ? (
        <motion.div
          key="order-complete"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Order Complete!</CardTitle>
              <CardDescription>Thank you for your purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Order Summary</h3>
                <div className="border rounded-lg divide-y">
                  {orderDetails?.items.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderDetails?.total || 0)}</span>
                </div>

                {orderDetails?.discountApplied ? (
                  <div className="flex justify-between mb-2">
                    <span>
                      Discount{" "}
                      {orderDetails.discountCodeUsed && (
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {orderDetails.discountCodeUsed}
                        </span>
                      )}
                    </span>
                    <span className="text-green-600">-{formatCurrency(orderDetails.discountApplied)}</span>
                  </div>
                ) : null}

                <Separator className="my-2" />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency((orderDetails?.total || 0) - (orderDetails?.discountApplied || 0))}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/cart")} className="w-full">
                Return to Shop
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="checkout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid gap-8 md:grid-cols-2"
        >
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Complete your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Code (Optional)</Label>
                  <Input
                    id="discount"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter discount code"
                  />
                </div>

                <div className="pt-4">
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="border rounded-lg divide-y">
                    {cartItems.map((item, index) => (
                      <div key={index} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <CartSummary subtotal={calculateSubtotal()} itemCount={cartItems.length} />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button onClick={handleCheckout} className="w-full" disabled={checkoutLoading}>
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Order"
                  )}
                </Button>
                <Button variant="outline" onClick={() => router.push("/cart")} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Cart
                </Button>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
