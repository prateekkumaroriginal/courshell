import { create } from "zustand";

export const useLoader = create((set) => ({
  isMainLoading: false,
  setMainLoading: (value) => set({ isMainLoading: value })
}));