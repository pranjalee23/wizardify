'use client'

import { useSyncExternalStore } from 'react'
import type { HouseId } from './houses'

// What a visitor has told us while reserving. Held in this browser tab only
// until the reservation is sent to a backend.
export type Reservation = {
  email?: string
  name?: string
  whatsapp?: string
  city?: string
  house?: HouseId
  knownFor?: string
  setting?: string
  wish?: string
  photos?: number
}

const KEY = 'wz-reservation'
const EMPTY: Reservation = {}
const listeners = new Set<() => void>()
let cache: Reservation | undefined

function read(): Reservation {
  if (cache) return cache
  try {
    cache = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Reservation
  } catch {
    cache = {}
  }
  return cache
}

export function saveReservation(patch: Partial<Reservation>) {
  cache = { ...read(), ...patch }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // Storage can be unavailable (private mode); the flow still works for this page view.
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useReservation(): Reservation {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

const noop = () => () => {}

// False during server render and hydration, true after. Use as a `key` so forms
// remount with the saved values once they can be read.
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
