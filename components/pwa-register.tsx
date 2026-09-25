'use client'

import { useEffect } from 'react'

/**
 * Rejestracja service workera (offline shell).
 *
 * Świadomie tylko w produkcji: w trybie deweloperskim cache SW walczyłby
 * z HMR i podawał nieaktualne chunki.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Brak rejestracji nie może psuć aplikacji — offline to dodatek.
      })
    }

    if (document.readyState === 'complete') {
      register()
      return
    }
    window.addEventListener('load', register)
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
