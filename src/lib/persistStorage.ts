import { toast } from 'sonner';
import type { StateStorage } from 'zustand/middleware';
import { tRaw } from '@/i18n';

// zustand/persist's default storage lets localStorage errors (quota exceeded, disabled in
// private browsing, etc.) throw silently inside its internal subscriber — the user believes
// their change saved when it didn't. This wrapper catches those errors and surfaces one toast
// per session so the failure is at least visible.
let warned = false;

export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch (err) {
      console.error('localStorage read failed', name, err);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      console.error('localStorage write failed', name, err);
      if (!warned) {
        warned = true;
        toast.error(tRaw('toast.storageWriteFailed'));
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (err) {
      console.error('localStorage remove failed', name, err);
    }
  },
};
