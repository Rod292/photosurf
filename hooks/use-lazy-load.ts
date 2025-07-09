import { useEffect, useRef, useState } from 'react'

interface UseLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  loadAhead?: number
}

export function useLazyLoad<T>(
  items: T[],
  options: UseLazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    loadAhead = 10
  } = options

  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const [loadedCount, setLoadedCount] = useState(loadAhead)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Charger initialement les premiers éléments
    const initialItems = new Set<number>()
    for (let i = 0; i < Math.min(loadAhead, items.length); i++) {
      initialItems.add(i)
    }
    setVisibleItems(initialItems)
  }, [items.length, loadAhead])

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Charger plus d'éléments
            setLoadedCount((prev) => {
              const newCount = Math.min(prev + loadAhead, items.length)
              const newVisibleItems = new Set(visibleItems)
              
              for (let i = prev; i < newCount; i++) {
                newVisibleItems.add(i)
              }
              
              setVisibleItems(newVisibleItems)
              return newCount
            })
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current = observer
    observer.observe(sentinelRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [items.length, threshold, rootMargin, loadAhead, visibleItems])

  const visibleItemsList = items.filter((_, index) => visibleItems.has(index))

  return {
    visibleItems: visibleItemsList,
    sentinelRef,
    loadedCount,
    totalCount: items.length,
    hasMore: loadedCount < items.length
  }
}