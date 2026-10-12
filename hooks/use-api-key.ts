'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { API_KEY_STORAGE_KEY } from '@/lib/gemini'

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === API_KEY_STORAGE_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot() {
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? ''
}

function getServerSnapshot() {
  return ''
}

export function useApiKey() {
  const apiKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setApiKey = useCallback((value: string) => {
    const trimmed = value.trim()
    if (trimmed) {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, trimmed)
    } else {
      window.localStorage.removeItem(API_KEY_STORAGE_KEY)
    }
    emit()
  }, [])

  const clearApiKey = useCallback(() => setApiKey(''), [setApiKey])

  return { apiKey, setApiKey, clearApiKey, hasKey: apiKey.length > 0 }
}
