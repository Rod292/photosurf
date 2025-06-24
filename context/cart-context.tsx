"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

type Photo = {
  id: string
  title: string
  price: number
  surfer?: string
  src: string
}

type CartContextType = {
  cart: Photo[]
  addToCart: (photo: Photo) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  discount: number
  isInCart: (id: string) => boolean
  getPhotoPrice: (photo: Photo) => number
  applyDiscount: (code: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const DISCOUNT_CODES: { [key: string]: (item: Photo) => number } = {
  ALEX: (item) => (item.surfer === "Alex" ? item.price : 0),
  NATHAN: (item) => (item.surfer === "Nathan" ? item.price : 0),
  "TITOUAN-S": (item) => (item.surfer === "Titouan S" ? item.price : 0),
  YANN: (item) => (item.surfer === "Yann" ? item.price : 0),
  "LEO-S": (item) => (item.surfer === "Léo S" ? item.price : 0),
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Photo[]>([])
  const [discount, setDiscount] = useState(0)
  const [activePromoCode, setActivePromoCode] = useState<string | null>(null)

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  // Helper function to get the price per photo based on quantity
  const getPricePerPhoto = useCallback((quantity: number): number => {
    if (quantity <= 2) return 10
    if (quantity <= 4) return 8
    if (quantity <= 9) return 6
    // For 10+ photos, the total is capped at €40
    return 0 // We'll handle the €40 cap in the total price calculation
  }, [])

  // Update all photo prices for a given surfer based on the total quantity
  const updatePricesForSurfer = useCallback(
    (photos: Photo[], surfer: string): Photo[] => {
      const surferPhotos = photos.filter((p) => p.surfer === surfer)
      const quantity = surferPhotos.length

      if (quantity >= 10) {
        // For 10+ photos, we need to distribute the €40 cap among the photos
        const pricePerPhoto = Math.round((40 / quantity) * 100) / 100 // Round to 2 decimal places
        return photos.map((photo) => {
          if (photo.surfer === surfer) {
            return { ...photo, price: pricePerPhoto }
          }
          return photo
        })
      } else {
        const pricePerPhoto = getPricePerPhoto(quantity)
        return photos.map((photo) => {
          if (photo.surfer === surfer) {
            return { ...photo, price: pricePerPhoto }
          }
          return photo
        })
      }
    },
    [getPricePerPhoto],
  )

  const addToCart = useCallback(
    (photo: Photo) => {
      setCart((prevCart) => {
        if (prevCart.some((item) => item.id === photo.id)) {
          toast({
            title: "Photo déjà dans le panier",
            description: `${photo.title} est déjà dans votre panier.`,
            variant: "destructive",
          })
          return prevCart
        }

        // Add the new photo
        const newCart = [...prevCart, photo]
        // Update prices for all photos of the same surfer
        const updatedCart = updatePricesForSurfer(newCart, photo.surfer || "unknown")

        toast({
          title: "Photo ajoutée au panier",
          description: `${photo.title} a été ajouté à votre panier.`,
        })
        return updatedCart
      })
    },
    [updatePricesForSurfer],
  )

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((prevCart) => {
        const photoToRemove = prevCart.find((item) => item.id === id)
        if (!photoToRemove) return prevCart

        // Remove the photo
        const newCart = prevCart.filter((item) => item.id !== id)
        // Update prices for all photos of the same surfer
        const updatedCart = updatePricesForSurfer(newCart, photoToRemove.surfer || "unknown")

        // Recalculate discount after removing the item
        if (activePromoCode) {
          const discountFunction = DISCOUNT_CODES[activePromoCode]
          if (discountFunction) {
            const newDiscount = updatedCart.reduce((total, item) => total + discountFunction(item), 0)
            setDiscount(Math.round(newDiscount * 100) / 100) // Round to 2 decimal places
          }
        }

        return updatedCart
      })
    },
    [updatePricesForSurfer, activePromoCode],
  )

  const clearCart = useCallback(() => {
    setCart([])
    setDiscount(0)
    setActivePromoCode(null)
    localStorage.removeItem("cart")
  }, [])

  const isInCart = useCallback(
    (id: string) => {
      return cart.some((item) => item.id === id)
    },
    [cart],
  )

  const getPhotoPrice = useCallback(
    (photo: Photo): number => {
      const surferPhotos = cart.filter((p) => p.surfer === photo.surfer)
      const quantity = surferPhotos.length + 1 // Include the potential new photo

      if (quantity >= 10) {
        // For 10+ photos, calculate the price as part of the €40 cap
        return Math.round((40 / quantity) * 100) / 100 // Round to 2 decimal places
      }
      return getPricePerPhoto(quantity)
    },
    [cart, getPricePerPhoto],
  )

  const totalItems = cart.length

  const calculateTotalPrice = useCallback(
    (items: Photo[]): number => {
      // Group photos by surfer
      const surferGroups = items.reduce(
        (groups, photo) => {
          const surfer = photo.surfer || "unknown"
          if (!groups[surfer]) groups[surfer] = []
          groups[surfer].push(photo)
          return groups
        },
        {} as Record<string, Photo[]>,
      )

      // Calculate total price for each surfer's group
      const total = Object.values(surferGroups).reduce((sum, photos) => {
        const quantity = photos.length
        if (quantity >= 10) {
          return sum + 40 // Cap at €40 for 10+ photos
        }
        return sum + quantity * getPricePerPhoto(quantity)
      }, 0)

      return Math.round(total * 100) / 100 // Round to 2 decimal places
    },
    [getPricePerPhoto],
  )

  const totalPrice = calculateTotalPrice(cart)

  const applyDiscount = useCallback(
    (code: string): boolean => {
      const discountFunction = DISCOUNT_CODES[code.toUpperCase()]
      if (discountFunction) {
        const newDiscount = cart.reduce((total, item) => total + discountFunction(item), 0)
        setDiscount(Math.round(newDiscount * 100) / 100) // Round to 2 decimal places
        setActivePromoCode(code.toUpperCase())
        return true
      }
      return false
    },
    [cart],
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        discount,
        isInCart,
        getPhotoPrice,
        applyDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

