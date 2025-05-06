"use client"

import type React from "react"

import { useState } from "react"
import { addToCart, type CartItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AddItemFormProps {
  onItemAdded: (cart: CartItem[]) => void
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    const priceValue = Number.parseFloat(price)
    const quantityValue = Number.parseInt(quantity)

    if (isNaN(priceValue) || priceValue <= 0) {
      toast({ title: "Error", description: "Price must be a positive number", variant: "destructive" })
      return
    }

    if (isNaN(quantityValue) || quantityValue <= 0) {
      toast({ title: "Error", description: "Quantity must be a positive number", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const item: CartItem = {
        name,
        price: priceValue,
        quantity: quantityValue,
      }

      const response = await addToCart(item)
      onItemAdded(response.cart)

      // Reset form
      setName("")
      setPrice("")
      setQuantity("1")
    } catch (error) {
      toast({ title: "Error", description: "Failed to add item to cart", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add to Cart"
        )}
      </Button>
    </form>
  )
}
