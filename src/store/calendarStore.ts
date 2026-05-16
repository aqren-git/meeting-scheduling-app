import { create } from 'zustand'
import type { Slot } from '@/types/slot'

interface CalendarState {
  selectedSlot: Slot | null
  isModalOpen: boolean
  currentYear: number
  currentMonth: number
  openModal: (slot: Slot) => void
  closeModal: () => void
  goToNextMonth: () => void
  goToPrevMonth: () => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedSlot: null,
  isModalOpen: false,
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),

  openModal: (slot) => set({ selectedSlot: slot, isModalOpen: true }),
  closeModal: () => set({ selectedSlot: null, isModalOpen: false }),
  goToNextMonth: () => set((state) => {
    const next = new Date(state.currentYear, state.currentMonth + 1)
    return { currentYear: next.getFullYear(), currentMonth: next.getMonth() }
  }),
  goToPrevMonth: () => set((state) => {
    const prev = new Date(state.currentYear, state.currentMonth - 1)
    return { currentYear: prev.getFullYear(), currentMonth: prev.getMonth() }
  }),
}))
