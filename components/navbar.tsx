"use client"

import Link from "next/link"
import { ShoppingCart, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          ModernShop
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn("gap-1", pathname === "/cart" && "bg-accent text-accent-foreground")}
          >
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn("gap-1", pathname === "/admin" && "bg-accent text-accent-foreground")}
          >
            <Link href="/admin">
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
