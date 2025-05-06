"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCart, type CartItem } from "@/lib/api"
import CartItemComponent from "@/components/cart-item"
import AddItemForm from "@/components/add-item-form"
import CartSummary from "@/components/cart-summary"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
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

  const handleItemAdded = (newCart: CartItem[]) => {
    setCartItems(newCart)
    toast({ title: "Success", description: "Item added to cart" })
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({ title: "Error", description: "Your cart is empty", variant: "destructive" })
      return
    }
    router.push("/checkout")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Cart</CardTitle>
            <CardDescription>
              {cartItems.length === 0
                ? "Your cart is empty"
                : `You have ${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} in your cart`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {cartItems.map((item, index) => (
                  <motion.div key={`${item.name}-${index}`} variants={item}>
                    <CartItemComponent item={item} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Item to Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <AddItemForm onItemAdded={handleItemAdded} />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Cart Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CartSummary subtotal={calculateSubtotal()} itemCount={cartItems.length} />
            <Button onClick={handleCheckout} className="w-full" disabled={cartItems.length === 0}>
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
