import { formatCurrency } from "@/lib/utils"

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  discount?: number
  discountCode?: string
}

export default function CartSummary({ subtotal, itemCount, discount = 0, discountCode }: CartSummaryProps) {
  const total = subtotal - discount

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Items ({itemCount})</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span>
            Discount{" "}
            {discountCode && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {discountCode}
              </span>
            )}
          </span>
          <span className="text-green-600">-{formatCurrency(discount)}</span>
        </div>
      )}

      <div className="border-t pt-4 flex justify-between font-medium">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
