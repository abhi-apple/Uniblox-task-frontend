// API client for interacting with the backend

// For demo purposes, we'll use a fixed userId
export const DEMO_USER_ID = "user123"

const API_BASE_URL = "https://uniblox-task-backend.vercel.app"

// Types
export interface CartItem {
  name: string
  price: number
  quantity: number
}

export interface Cart {
  cart: CartItem[]
}

export interface CheckoutResponse {
  message: string
  order: {
    items: CartItem[]
    total: number
    discountApplied: number
    discountCodeUsed: string | null
  }
}

export interface DiscountCode {
  code: string
  discountPercent: number
  used?: boolean
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
}

export interface AdminStats {
  orders: Order[]
  discountCodes: DiscountCode[]
}

// API functions
export async function addToCart(item: CartItem): Promise<Cart> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        item,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to add item to cart")
    }

    return response.json()
  } catch (error) {
    console.error("Error adding item to cart:", error)
    throw error
  }
}

export async function getCart(): Promise<Cart> {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: DEMO_USER_ID,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}


export async function checkout(discountCode?: string): Promise<CheckoutResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: DEMO_USER_ID,
        ...(discountCode && { discountCode }),
      }),
    })

    if (!response.ok) {
      throw new Error("Checkout failed")
    }

    return response.json()
  } catch (error) {
    console.error("Error during checkout:", error)
    throw error
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const token = localStorage.getItem("admin-token"); // Fetch from localStorage
    console.log(token,'token')
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        "x-admin-otp": token ?? "",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch admin stats");
    return response.json();
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
}

export async function generateDiscountCode(): Promise<DiscountCode> {
  try {
    const token = localStorage.getItem("admin-token"); // Fetch from localStorage
    const response = await fetch(`${API_BASE_URL}/admin/discount`, {
      method: "POST",
      headers: {
        "x-admin-otp": token ?? "",
      },
    });

    if (!response.ok) throw new Error("Failed to generate discount code");
    return await response.json();
  } catch (error) {
    console.error("Error generating discount code:", error);
    throw error;
  }
}
