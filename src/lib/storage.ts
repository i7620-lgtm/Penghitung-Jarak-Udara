// Caching layer dan LocalStorage store untuk pencarian & riwayat SPMB

export interface SavedCandidate {
  id: string;
  studentName: string;
  candidateNumber?: string;
  schoolName: string;
  schoolCoords: [number, number];
  homeAddress: string;
  homeCoords: [number, number];
  distanceMeters: number;
  distanceKm: number;
  zoningTier: string;
  createdAt: number;
}

const CACHE_KEY_PREFIX = 'skydist_geo_cache_';
const HISTORY_KEY = 'skydist_spmb_history';

// In-Memory cache for lightning-fast repeated queries
const memoryCache = new Map<string, any>();

export const GeocodeCache = {
  get(query: string) {
    const key = query.trim().toLowerCase();
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    try {
      const stored = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // LocalStorage might be full or restricted
    }
    return null;
  },

  set(query: string, data: any) {
    const key = query.trim().toLowerCase();
    memoryCache.set(key, data);
    try {
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(data));
    } catch {
      // Clear oldest cache items if localStorage is full
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_KEY_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        // Remove 10 oldest cached keys
        keysToRemove.slice(0, 10).forEach(k => localStorage.removeItem(k));
      } catch {}
    }
  }
};

export const HistoryStorage = {
  getAll(): SavedCandidate[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read history from localStorage', e);
      return [];
    }
  },

  save(candidate: SavedCandidate) {
    try {
      const all = HistoryStorage.getAll();
      const updated = [candidate, ...all.filter(c => c.id !== candidate.id)].slice(0, 50); // Simpan hingga 50 entri terbaru
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save candidate to localStorage', e);
      return [];
    }
  },

  delete(id: string) {
    try {
      const all = HistoryStorage.getAll();
      const updated = all.filter(c => c.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to remove history item', e);
      return [];
    }
  },

  clearAll() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  }
};
