import type { CartItem } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface CartItemProps {
  item: CartItem
}

export default function CartItemComponent({ item }: CartItemProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.price)} × {item.quantity}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
        </div>
      </div>
    </Card>
  )
}
