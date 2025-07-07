'use client'

import { useState, useEffect } from 'react'
import { SurfSchool } from '@/lib/database.types'

export function useSurfSchools() {
  const [schools, setSchools] = useState<SurfSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSchools() {
      try {
        setLoading(true)
        const response = await fetch('/api/surf-schools')
        
        if (!response.ok) {
          throw new Error('Failed to fetch surf schools')
        }
        
        const data = await response.json()
        setSchools(data.schools || [])
      } catch (err) {
        console.error('Error fetching surf schools:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fallback vers les écoles par défaut en cas d'erreur
        setSchools([
          { id: 1, name: 'La Torche Surf School', slug: 'la-torche-surf-school' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return { schools, loading, error }
}