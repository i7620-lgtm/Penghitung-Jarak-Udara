import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, Circle, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin, Navigation, Loader2, Layers, Map as MapIcon, Route, Radar } from 'lucide-react';
import { cn } from './lib/utils';

// Custom Icons
const redIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-8 h-8 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5))">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const emeraldIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-8 h-8 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5))">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface Coordinate {
  lat: number;
  lon: number;
  display_name: string;
}

interface PlaceNode {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  distanceKm?: number;
}

const placeTypeMap: Record<string, string> = {
  city: 'Kota',
  town: 'Kecamatan / Kota',
  village: 'Desa / Kelurahan',
  suburb: 'Area / Distrik',
  neighbourhood: 'Lingkungan',
  hamlet: 'Dusun / Banjar'
};

const INTERNAL_LOCATIONS: Coordinate[] = [
  { lat: -8.656554, lon: 115.219518, display_name: "SMP Negeri 1 Denpasar" },
  { lat: -8.651708, lon: 115.199247, display_name: "SMP Negeri 2 Denpasar" },
  { lat: -8.652135, lon: 115.225518, display_name: "SMP Negeri 3 Denpasar" },
  { lat: -8.652477, lon: 115.203827, display_name: "SMP Negeri 4 Denpasar" },
  { lat: -8.632867, lon: 115.200401, display_name: "SMP Negeri 5 Denpasar" },
  { lat: -8.702476, lon: 115.217289, display_name: "SMP Negeri 6 Denpasar" },
  { lat: -8.665190, lon: 115.199253, display_name: "SMP Negeri 7 Denpasar" },
  { lat: -8.644567, lon: 115.234768, display_name: "SMP Negeri 8 Denpasar" },
  { lat: -8.689595, lon: 115.259148, display_name: "SMP Negeri 9 Denpasar" },
  { lat: -8.638020, lon: 115.213707, display_name: "SMP Negeri 10 Denpasar" },
  { lat: -8.724407, lon: 115.230831, display_name: "SMP Negeri 11 Denpasar" },
  { lat: -8.598061, lon: 115.221893, display_name: "SMP Negeri 12 Denpasar" },
  { lat: -8.680102, lon: 115.176030, display_name: "SMP Negeri 13 Denpasar" },
  { lat: -8.644951, lon: 115.248045, display_name: "SMP Negeri 14 Denpasar" },
  { lat: -8.620475, lon: 115.185327, display_name: "SMP Negeri 15 Denpasar" },
  { lat: -8.702735, lon: 115.235702, display_name: "SMP Negeri 16 Denpasar" },
  { lat: -8.612007, lon: 115.243493, display_name: "SMP Negeri 17 Denpasar" }
];

// Advanced string similarity recognizing partial matches, typo tolerance, and word reordering
function calculateSimilarity(query: string, target: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim().replace(/\s+/g, ' ');
  const qStr = normalize(query);
  const tStr = normalize(target);

  if (qStr === tStr) return 1;
  const qWords = qStr.split(' ').filter(w => w.length > 0);
  const tWords = tStr.split(' ').filter(w => w.length > 0);

  if (qWords.length === 0 || tWords.length === 0) return 0;

  const levenshtein = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    let curr = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
        curr[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
        }
        [prev, curr] = [curr, prev];
    }
    return prev[b.length];
  };

  // 1. Word-level similarity (handles reordering and inner-word typos well)
  let queryWordScore = 0;
  for (const qw of qWords) {
      let maxSim = 0;
      for (const tw of tWords) {
          const maxLen = Math.max(qw.length, tw.length);
          const dist = levenshtein(qw, tw);
          const sim = maxLen === 0 ? 1 : (maxLen - dist) / maxLen;
          if (sim > maxSim) maxSim = sim;
      }
      queryWordScore += maxSim;
  }
  queryWordScore /= qWords.length;
  
  // 2. Bigram subset similarity (handles combined/split words without strictly caring about boundaries)
  const qConcat = qStr.replace(/\s+/g, '');
  const tConcat = tStr.replace(/\s+/g, '');
  
  const getBigrams = (s: string) => {
    const bg = [];
    for (let i = 0; i < s.length - 1; i++) bg.push(s.slice(i, i + 2));
    return bg;
  };
  
  const b1 = getBigrams(qConcat);
  const b2 = getBigrams(tConcat);
  
  let match = 0;
  const b2Map = new Map<string, number>();
  for (const bg of b2) b2Map.set(bg, (b2Map.get(bg) || 0) + 1);
  for (const bg of b1) {
    if ((b2Map.get(bg) || 0) > 0) {
      match++;
      b2Map.set(bg, b2Map.get(bg)! - 1);
    }
  }
  const diceQ = b1.length === 0 ? 1 : match / b1.length;
  
  return Math.max(queryWordScore, diceQ);
}


// Map Bounds Updater Component
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function LocationInput({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange, 
  onSelect, 
  dotColor,
  isDark,
  onMapClickRequest,
  isSelectingMapLocation
}: { 
  id: string, 
  label: string, 
  placeholder: string, 
  value: string, 
  onChange: (val: string) => void,
  onSelect: (coord: Coordinate | null) => void,
  dotColor: string,
  isDark: boolean;
  onMapClickRequest?: () => void;
  isSelectingMapLocation?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const coordMatch = debouncedValue.trim().match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      setSuggestions([{
        lat: parseFloat(coordMatch[1]),
        lon: parseFloat(coordMatch[2]),
        display_name: `Koordinat Kustom: ${coordMatch[1]}, ${coordMatch[2]}`
      }]);
      setIsOpen(true);
      return;
    }

    let isMounted = true;
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const queryLower = debouncedValue.toLowerCase();
        
        // internal Exact
        const internalExact = INTERNAL_LOCATIONS.filter(l => l.display_name.toLowerCase().includes(queryLower));
        
        // internal fuzzy
        const internalFuzzy = INTERNAL_LOCATIONS.map(l => ({
          ...l,
          score: calculateSimilarity(debouncedValue, l.display_name)
        }))
        .filter(l => l.score >= 0.65 && !internalExact.some(e => e.display_name === l.display_name))
        .sort((a, b) => b.score - (a.score as number))
        .map(l => ({ lat: l.lat, lon: l.lon, display_name: l.display_name }));

        const internalResults = [...internalExact, ...internalFuzzy];

        let nominatimResults: Coordinate[] = [];
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedValue)}&limit=5&addressdetails=1`);
          const data = await res.json();
          if (data && data.length > 0) {
            nominatimResults = data.map((item: any) => ({
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              display_name: item.display_name
            }));
          } else {
            // fallback: permutasi kata untuk menangani typo spasi menggunakan Nominatim
            const words = debouncedValue.split(/[\s,]+/).filter(w => w.length > 0);
            if (words.length > 1) {
              const alternatives = [];
              
              // 1. Coba gabungkan 2 kata berdekatan yang paling pendek (handle spasi yang tidak perlu seperti "padang sambian" -> "padangsambian")
              const pairs = [];
              for (let i = 0; i < words.length - 1; i++) {
                pairs.push({ idx: i, sum: words[i].length + words[i+1].length });
              }
              pairs.sort((a, b) => a.sum - b.sum);
              for (const p of pairs.slice(0, 2)) {
                const temp = [...words];
                temp[p.idx] = temp[p.idx] + temp[p.idx+1];
                temp.splice(p.idx+1, 1);
                alternatives.push(temp.join(" "));
              }
              // 2. Coba balik urutan kata
              alternatives.push([...words].reverse().join(" "));
              // 3. Hanya ambil 3 kata terpanjang
              const longest = [...words].sort((a,b) => b.length - a.length).slice(0, 3);
              alternatives.push(longest.join(" "));

              // Hapus duplikat
              const uniqueAlternatives = Array.from(new Set(alternatives)).slice(0, 3); // max 3 request fallback

              for (const altQuery of uniqueAlternatives) {
                try {
                  const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(altQuery)}&limit=5&addressdetails=1`);
                  if (fallbackRes.ok) {
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData && fallbackData.length > 0) {
                      const fuzzyMatched = fallbackData.map((item: any) => ({
                        lat: parseFloat(item.lat),
                        lon: parseFloat(item.lon),
                        display_name: item.display_name,
                        score: calculateSimilarity(debouncedValue, item.display_name)
                      })).filter((item: any) => item.score >= 0.55).sort((a: any, b: any) => b.score - a.score);

                      if (fuzzyMatched.length > 0) {
                        nominatimResults = fuzzyMatched.map((item: any) => ({
                          lat: item.lat, // preserve precise coordinate mapping
                          lon: item.lon,
                          display_name: item.display_name
                        }));
                        break; // Stop if we found a match
                      }
                    }
                  }
                } catch (e) {
                  console.warn("Fallback failed for", altQuery, e);
                }
              }
            }
          }
        } catch (err) {
          console.warn("Nominatim search issue:", err);
        }
        
        if (isMounted) {
          const combined = [...internalResults, ...nominatimResults];
          // deduplicate
          const unique = combined.filter((v, i, a) => a.findIndex(t => (t.display_name === v.display_name)) === i);
          setSuggestions(unique);
          if (unique.length > 0) setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuggestions();
    return () => { isMounted = false; };
  }, [debouncedValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className={cn("text-[10px] uppercase font-bold mb-2 flex justify-between items-center", isDark ? "text-slate-500" : "text-slate-500")}>
        <span>{label}</span>
        {onMapClickRequest && (
          <button 
            type="button" 
            title="Pilih Titik di Peta"
            onClick={onMapClickRequest} 
            className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors", isSelectingMapLocation ? "bg-blue-500 text-white" : (isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"))}
          >
            <MapPin className="w-3 h-3" />
            <span className="text-[9px]">{isSelectingMapLocation ? "Pilih di Peta..." : "Pilih Peta"}</span>
          </button>
        )}
      </label>
      <div className="relative group">
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onSelect(null);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl py-3 px-4 text-sm focus:border-blue-500 outline-none transition-colors border",
            isDark ? "bg-black/40 border-white/10 text-slate-200" : "bg-white border-slate-300 text-slate-900 shadow-sm",
            isSelectingMapLocation && "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)] bg-blue-500/5"
          )}
          required
          autoComplete="off"
        />
        <div className={cn("absolute right-3 top-3.5 w-2 h-2 rounded-full", dotColor)}></div>
        {loading && <Loader2 className="absolute right-8 top-3.5 w-4 h-4 text-slate-400 animate-spin" />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className={cn(
          "absolute z-[100] w-full mt-2 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto border",
          isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
        )}>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                "w-full text-left px-4 py-3 border-b last:border-0 text-sm transition-colors",
                isDark ? "hover:bg-slate-700 border-white/5 text-slate-300" : "hover:bg-slate-100 border-slate-100 text-slate-700 rounded-none"
              )}
              onClick={() => {
                onChange(sug.display_name);
                onSelect(sug);
                setIsOpen(false);
              }}
            >
              <div className="line-clamp-2">{sug.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapUpdater({ points }: { points: Coordinate[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (points.length === 2) {
      const bounds = L.latLngBounds(
        [points[0].lat, points[0].lon],
        [points[1].lat, points[1].lon]
      );
      // Wait slightly to ensure map container has sized correctly
      setTimeout(() => {
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }, 100);
    } else if (points.length === 1) {
      map.flyTo([points[0].lat, points[0].lon], 13);
    }
  }, [points, map]);

  return null;
}

function MapClickHandler({ isActive, onLocationSelected }: { isActive: boolean, onLocationSelected: (coord: Coordinate) => void }) {
  useMapEvents({
    click(e) {
      if (!isActive) return;
      onLocationSelected({
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        display_name: `Titik Pilihan Peta (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
      });
    }
  });
  return null;
}

type HistoryItem = {
  id: string;
  timestamp: number;
  type: 'distance' | 'radius';
  summary: string;
  details: string;
  places?: { name: string; dist: string }[];
};

export default function App() {
  const [loc1, setLoc1] = useState('');
  const [loc2, setLoc2] = useState('');
  
  const [selectedLoc1, setSelectedLoc1] = useState<Coordinate | null>(null);
  const [selectedLoc2, setSelectedLoc2] = useState<Coordinate | null>(null);
  
  const [selectingTarget, setSelectingTarget] = useState<'loc1' | 'loc2' | null>(null);

  const [points, setPoints] = useState<Coordinate[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');
  
  const [radiusValue, setRadiusValue] = useState<number>(10);
  const [showRadius, setShowRadius] = useState<boolean>(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceNode[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'distance' | 'radius'>('distance');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [isDark, setIsDark] = useState(true);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'm'>('km');

  useEffect(() => {
    setPoints([]);
    setDistanceKm(null);
    setNearbyPlaces([]);
    setShowRadius(false);
  }, [activeTab]);

  const geocode = async (query: string): Promise<Coordinate> => {
    const coordMatch = query.trim().match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lon: parseFloat(coordMatch[2]),
        display_name: `Koordinat Kustom: ${coordMatch[1]}, ${coordMatch[2]}`
      };
    }

    const queryLower = query.trim().toLowerCase();
    let exactInternal = INTERNAL_LOCATIONS.find(l => l.display_name.toLowerCase() === queryLower);
    if (!exactInternal) {
      const fuzzyMatch = INTERNAL_LOCATIONS.map(l => ({ ...l, score: calculateSimilarity(query, l.display_name) }))
        .filter(l => l.score >= 0.65).sort((a,b) => b.score - a.score)[0];
      if (fuzzyMatch) {
         exactInternal = { lat: fuzzyMatch.lat, lon: fuzzyMatch.lon, display_name: fuzzyMatch.display_name };
      }
    }
    if (exactInternal) {
      return exactInternal;
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    if (!res.ok) throw new Error(`Gagal menghubungi server geocoding.`);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    
    // Fuzzy fallback on Nominatim API
    const words = query.split(/[\s,]+/).filter(w => w.length > 0);
    if (words.length > 1) {
      const alternatives = [];
      
      const pairs = [];
      for (let i = 0; i < words.length - 1; i++) {
        pairs.push({ idx: i, sum: words[i].length + words[i+1].length });
      }
      pairs.sort((a, b) => a.sum - b.sum);
      for (const p of pairs.slice(0, 2)) {
        const temp = [...words];
        temp[p.idx] = temp[p.idx] + temp[p.idx+1];
        temp.splice(p.idx+1, 1);
        alternatives.push(temp.join(" "));
      }
      alternatives.push([...words].reverse().join(" "));
      const longest = [...words].sort((a,b) => b.length - a.length).slice(0, 3);
      alternatives.push(longest.join(" "));

      const uniqueAlternatives = Array.from(new Set(alternatives)).slice(0, 3);

      for (const altQuery of uniqueAlternatives) {
        try {
          const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(altQuery)}&limit=5&addressdetails=1`);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData && fallbackData.length > 0) {
              const fuzzyMatched = fallbackData.map((item: any) => ({
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                display_name: item.display_name,
                score: calculateSimilarity(query, item.display_name)
              })).filter((item: any) => item.score >= 0.55).sort((a: any, b: any) => b.score - a.score);

              if (fuzzyMatched.length > 0) {
                return {
                  lat: fuzzyMatched[0].lat,
                  lon: fuzzyMatched[0].lon,
                  display_name: fuzzyMatched[0].display_name
                };
              }
            }
          }
        } catch (e) {
          console.warn("Geocode fallback failed", e);
        }
      }
    }
    
    throw new Error(`Lokasi "${query}" tidak ditemukan.`);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearchRadius = async () => {
    if (!points[0] && !loc1) return;
    
    setLoadingPlaces(true);
    setShowRadius(true);
    setNearbyPlaces([]);
    let origin = points[0];

    try {
      if (!origin && loc1) {
        origin = selectedLoc1?.display_name === loc1 ? selectedLoc1 : await geocode(loc1);
        setPoints([origin]);
      }

      if (!origin) throw new Error("Titik Acuan tidak ditemukan");

      const radMeters = distanceUnit === 'km' ? radiusValue * 1000 : radiusValue;
      const query = `[out:json][timeout:25];nwr(around:${radMeters},${origin.lat},${origin.lon})["place"];out center;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`
      });
      const data = await res.json();

      const places = data.elements
        .filter((e: any) => e.tags && e.tags.name)
        .map((e: any) => {
          const lat = parseFloat(e.center ? e.center.lat : e.lat);
          const lon = parseFloat(e.center ? e.center.lon : e.lon);
          const dist = calculateDistance(origin.lat, origin.lon, lat, lon);
          return {
            id: e.id,
            lat: lat,
            lon: lon,
            name: e.tags.name,
            type: e.tags.place || 'place',
            distanceKm: dist
          };
        });
      
      const sortedPlaces = places.sort((a: any, b: any) => (a.distanceKm || 0) - (b.distanceKm || 0));
      setNearbyPlaces(sortedPlaces);
      
      setHistory(prev => [{
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        type: 'radius',
        summary: `Radius ${radiusValue} ${distanceUnit.toUpperCase()} dari ${origin.display_name.split(',')[0]}`,
        details: `Ditemukan ${sortedPlaces.length} wilayah:`,
        places: sortedPlaces.map((p: any) => ({
          name: p.name,
          dist: `${(distanceUnit === 'km' ? p.distanceKm : p.distanceKm * 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${distanceUnit.toUpperCase()}`
        }))
      }, ...prev]);
    } catch (err) {
      console.error("Gagal mendapatkan data area:", err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loc1.trim() || !loc2.trim()) {
      setError("Silakan masukkan kedua lokasi.");
      return;
    }

    setLoading(true);
    setError(null);
    setDistanceKm(null);
    setPoints([]);
    setNearbyPlaces([]);
    setShowRadius(false);

    try {
      const coord1 = selectedLoc1?.display_name === loc1 ? selectedLoc1 : await geocode(loc1);
      const coord2 = selectedLoc2?.display_name === loc2 ? selectedLoc2 : await geocode(loc2);

      setPoints([coord1, coord2]);
      const dist = calculateDistance(coord1.lat, coord1.lon, coord2.lat, coord2.lon);
      setDistanceKm(dist);

      setHistory(prev => [{
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        type: 'distance',
        summary: `${coord1.display_name.split(',')[0]} - ${coord2.display_name.split(',')[0]}`,
        details: `Jarak: ${(distanceUnit === 'km' ? dist : dist * 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${distanceUnit.toUpperCase()}`
      }, ...prev]);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari lokasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full min-h-screen font-sans relative flex flex-col scroll-smooth transition-colors", isDark ? "bg-[#0A0C10] text-slate-100" : "bg-slate-50 text-slate-900")}>
      {/* Simulated Map Background */}
      {isDark ? (
        <div className="absolute inset-0 opacity-40 pointer-events-none fixed">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
      ) : (
        <div className="absolute inset-0 opacity-20 pointer-events-none fixed">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
      )}

      <div className="relative z-10 w-full flex flex-col min-h-screen">
        {/* Header */}
        <header className={cn("flex flex-wrap items-center justify-between px-6 lg:px-8 py-4 lg:py-6 border-b backdrop-blur-md z-20 sticky top-0 transition-colors", isDark ? "border-white/10 bg-[#0A0C10]/80" : "border-slate-200 bg-white/90")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
            </div>
            <div>
              <h1 className={cn("text-xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>SkyDist <span className="text-blue-500 font-normal">Pro</span></h1>
              <p className={cn("text-[10px] uppercase tracking-[0.2em]", isDark ? "text-slate-400" : "text-slate-500")}>Pengukuran Jarak Udara Presisi</p>
            </div>
          </div>
          
          <nav className="flex gap-4 sm:gap-6 text-sm font-medium mt-4 sm:mt-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <button 
              type="button" 
              onClick={() => setIsDark(!isDark)}
              className={cn("transition-colors whitespace-nowrap", isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}
            >
              Tema: {isDark ? 'Gelap' : 'Terang'}
            </button>
            <button 
              type="button" 
              onClick={() => setDistanceUnit(prev => prev === 'km' ? 'm' : 'km')}
              className={cn("transition-colors whitespace-nowrap", isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}
            >
              Satuan Jarak: {distanceUnit === 'km' ? 'KM' : 'Meter'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowHistory(true)}
              className={cn("transition-colors whitespace-nowrap", isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}
            >
              Riwayat
            </button>
          </nav>
        </header>

        <main className="flex-1 flex flex-col p-4 lg:p-8 gap-6 relative z-10 max-w-7xl mx-auto w-full">
          
          {/* Top Control Panel */}
          <div className="w-full flex flex-col lg:flex-row lg:flex-wrap items-stretch lg:items-start gap-6 shrink-0">
            <div className={cn("flex-1 min-w-[320px] rounded-2xl p-6 backdrop-blur-xl shrink-0 flex flex-col border transition-colors", isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200 shadow-sm")}>
              
              {/* Custom Tabs Navigation */}
              <div className={cn("flex w-full mb-6 p-1 rounded-xl border transition-colors", isDark ? "bg-black/40 border-white/5" : "bg-slate-100 border-slate-200")}>
                <button
                  type="button"
                  onClick={() => setActiveTab('distance')}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                    activeTab === 'distance' ? "bg-blue-600 text-white shadow-md" : (isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-white/50")
                  )}
                >
                  Hitung Jarak
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('radius')}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                    activeTab === 'radius' ? "bg-blue-600 text-white shadow-md" : (isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-white/50")
                  )}
                >
                  Analisis Radius
                </button>
              </div>

              {activeTab === 'distance' ? (
                <>
                  <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-4", isDark ? "text-slate-400" : "text-slate-500")}>Mencari Jarak 2 Titik</h2>
                  <form onSubmit={handleCalculate} className="space-y-0">
                    <div className="space-y-4">
                      <LocationInput
                        id="loc1"
                        label="Titik Keberangkatan (A)"
                        placeholder="Misal: Monas, Jakarta"
                        value={loc1}
                        onChange={setLoc1}
                        onSelect={setSelectedLoc1}
                        dotColor="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        isDark={isDark}
                        onMapClickRequest={() => setSelectingTarget(selectingTarget === 'loc1' ? null : 'loc1')}
                        isSelectingMapLocation={selectingTarget === 'loc1'}
                      />

                      <div className="flex justify-center py-2">
                        <div className={cn("h-8 w-[1px] relative", isDark ? "bg-white/10" : "bg-slate-200")}>
                          <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 rounded-full border", isDark ? "bg-slate-900 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-500")}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                          </div>
                        </div>
                      </div>

                      <LocationInput
                        id="loc2"
                        label="Titik Tujuan (B)"
                        placeholder="Misal: Gedung Sate, Bandung"
                        value={loc2}
                        onChange={setLoc2}
                        onSelect={setSelectedLoc2}
                        dotColor="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        isDark={isDark}
                        onMapClickRequest={() => setSelectingTarget(selectingTarget === 'loc2' ? null : 'loc2')}
                        isSelectingMapLocation={selectingTarget === 'loc2'}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Mencari...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                          Hitung Jarak
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-4", isDark ? "text-slate-400" : "text-slate-500")}>Pemindaian Area</h2>
                  <div className="space-y-5 flex-1 flex flex-col">
                    <LocationInput
                      id="loc1-radius"
                      label="Titik Acuan Area (A)"
                      placeholder="Misal: Monas, Jakarta"
                      value={loc1}
                      onChange={setLoc1}
                      onSelect={setSelectedLoc1}
                      dotColor="bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      isDark={isDark}
                      onMapClickRequest={() => setSelectingTarget(selectingTarget === 'loc1' ? null : 'loc1')}
                      isSelectingMapLocation={selectingTarget === 'loc1'}
                    />

                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-3 font-semibold items-center">
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Radius Pengamatan</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            max={distanceUnit === 'km' ? 50 : 50000} 
                            value={radiusValue}
                            onChange={(e) => setRadiusValue(Number(e.target.value))}
                            className={cn(
                              "w-20 px-2 py-1 text-right text-sm rounded border outline-none font-bold text-blue-500 focus:border-blue-500 transition-colors",
                              isDark ? "bg-black/40 border-white/10" : "bg-white border-slate-300"
                            )}
                          />
                          <span className="text-blue-500 font-bold uppercase">{distanceUnit}</span>
                        </div>
                      </div>
                      <input 
                        type="range" min="1" max={distanceUnit === 'km' ? 50 : 50000} step={distanceUnit === 'km' ? "1" : "100"} 
                        value={radiusValue} 
                        onChange={(e) => {
                          setRadiusValue(Number(e.target.value));
                        }} 
                        className={cn("w-full accent-blue-500 cursor-pointer h-2 rounded-lg appearance-none transition-colors", isDark ? "bg-slate-800" : "bg-slate-200")} 
                      />
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        type="button"
                        onClick={handleSearchRadius}
                        disabled={loadingPlaces}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {loadingPlaces ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radar className="w-5 h-5" />}
                        {loadingPlaces ? "Memindai Area..." : "Pindai Wilayah"}
                      </button>
                    </div>

                    {nearbyPlaces.length > 0 && (
                      <div className={cn("text-[11px] p-2.5 rounded-lg text-center font-medium border", isDark ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/60" : "text-emerald-700 bg-emerald-50 border-emerald-200")}>
                         Ditemukan {nearbyPlaces.length} wilayah dalam radius {radiusValue} {distanceUnit.toUpperCase()}.
                      </div>
                    )}
                  </div>
                </>
              )}

              {error && (
                <div className={cn("mt-4 p-3 text-xs rounded-lg border", isDark ? "text-red-400 bg-red-950/50 border-red-900/50" : "text-red-700 bg-red-50 border-red-200")}>
                  {error}
                </div>
              )}
            </div>

            {points.length === 2 && activeTab === 'distance' && (
              <div className={cn("flex-1 min-w-[280px] rounded-2xl p-6 shrink-0 flex flex-col justify-center border transition-colors", isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-slate-200 shadow-sm")}>
                <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-4", isDark ? "text-slate-400" : "text-slate-500")}>Data Koordinat & Lokasi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] font-mono">
                  <div>
                    <p className="text-red-500 font-bold mb-1">POINT A</p>
                    <p className={cn("font-sans font-semibold line-clamp-1 mb-1", isDark ? "text-white" : "text-slate-900")} title={points[0].display_name}>{points[0].display_name.split(',')[0]}</p>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>Lat: {points[0].lat.toFixed(4)}°</p>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>Lon: {points[0].lon.toFixed(4)}°</p>
                  </div>
                  <div>
                    <p className="text-emerald-500 font-bold mb-1">POINT B</p>
                    <p className={cn("font-sans font-semibold line-clamp-1 mb-1", isDark ? "text-white" : "text-slate-900")} title={points[1].display_name}>{points[1].display_name.split(',')[0]}</p>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>Lat: {points[1].lat.toFixed(4)}°</p>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>Lon: {points[1].lon.toFixed(4)}°</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Visualization Area */}
          <div className={cn("w-full rounded-3xl relative overflow-hidden h-[75vh] md:h-[85vh] shrink-0 shadow-2xl flex flex-col group border", isDark ? "bg-black/40 border-white/10" : "bg-slate-200 border-slate-300")}>
            
            {/* Map Controls overlays */}
            <div className={cn("absolute bottom-6 right-6 z-[400] flex flex-col gap-2 shadow-lg rounded-xl overflow-hidden backdrop-blur-md border", isDark ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-slate-200")}>
              <button 
                type="button"
                onClick={() => setMapType('satellite')}
                className={cn(
                   "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                   mapType === 'satellite' ? "bg-blue-600/50 text-white font-semibold" : (isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                )}
              >
                <Layers className="w-4 h-4" /> Satelit
              </button>
              <div className={cn("h-px w-full", isDark ? "bg-white/10" : "bg-slate-200")} />
              <button 
                type="button"
                onClick={() => setMapType('street')}
                className={cn(
                   "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                   mapType === 'street' ? "bg-blue-600/50 text-white font-semibold" : (isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                )}
              >
                <MapIcon className="w-4 h-4" /> Peta Jalan
              </button>
            </div>

            {/* Large Result Display on Map */}
            {distanceKm !== null && (
              <div className="absolute top-6 left-6 z-[400] pointer-events-none">
                <div className="flex justify-start">
                  <div className={cn("backdrop-blur-md border px-6 py-4 rounded-2xl flex flex-col shadow-2xl pointer-events-auto transition-all duration-500 ease-out animate-in slide-in-from-top-4 fade-in", isDark ? "bg-black/60 border-blue-500/30" : "bg-white/90 border-blue-500/30")}>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-blue-500 font-bold mb-1">Jarak Garis Lurus</p>
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-4xl sm:text-5xl font-black tracking-tighter", isDark ? "text-white" : "text-slate-900")}>{(distanceUnit === 'km' ? distanceKm : distanceKm * 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                      <span className={cn("text-lg sm:text-xl font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>{distanceUnit}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectingTarget !== null && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg border border-blue-400 font-semibold flex items-center gap-2 items-center text-sm">
                  <MapPin className="w-4 h-4 animate-pulse" />
                  Klik pada peta untuk memilih lokasi...
                </div>
              </div>
            )}

            <MapContainer 
              center={[-2.5489, 118.0149]} // Center of Indonesia
              zoom={5} 
              scrollWheelZoom={true} 
              className={cn("w-full h-full z-0!", selectingTarget !== null ? "cursor-crosshair" : "")}
              zoomControl={false}
              style={{ background: 'transparent' }}
            >
              {mapType === 'satellite' ? (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={18}
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
              )}

              {/* Connect points with a line */}
              {points.length === 2 && (
                <Polyline 
                  positions={[[points[0].lat, points[0].lon], [points[1].lat, points[1].lon]]} 
                  color="#3b82f6" 
                  weight={4}
                  dashArray="10, 10"
                  opacity={0.8}
                />
              )}

              {/* Render markers */}
              {points.map((pt, idx) => (
                <Marker key={idx} position={[pt.lat, pt.lon]} icon={idx === 0 ? redIcon : emeraldIcon}>
                  <Tooltip permanent direction="top" offset={[0, -36]} className="bg-white/95 backdrop-blur-sm px-3 py-1.5 border-none shadow-lg rounded-lg text-slate-800 font-semibold text-sm whitespace-nowrap z-50">
                    {pt.display_name.split(',')[0]}
                  </Tooltip>
                  <Popup className="custom-popup">
                    <div className="text-sm w-48 font-sans">
                      <p className="font-semibold mb-1 text-neutral-800">{idx === 0 ? 'Titik Asal' : 'Titik Tujuan'}</p>
                      <p className="text-neutral-600 line-clamp-3 leading-tight">{pt.display_name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Radius Tracking */}
              {showRadius && points.length > 0 && (
                <Circle 
                  center={[points[0].lat, points[0].lon]} 
                  radius={distanceUnit === 'km' ? radiusValue * 1000 : radiusValue} 
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2, dashArray: '6, 6' }} 
                />
              )}

              {/* Highlighted Regional Places */}
              {showRadius && nearbyPlaces.map(place => (
                <CircleMarker 
                  key={place.id} 
                  center={[place.lat, place.lon]} 
                  radius={5} 
                  pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: '#8b5cf6', fillOpacity: 0.9 }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="font-sans text-xs">
                      <span className="font-bold text-slate-800">{place.name}</span>
                      <br/>
                      <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider hover:text-slate-700">
                        {placeTypeMap[place.type] || place.type}
                        {place.distanceKm !== undefined && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/10 border border-slate-300/20 text-slate-700 font-bold self-center">
                            {(distanceUnit === 'km' ? place.distanceKm : place.distanceKm * 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} {distanceUnit.toUpperCase()}
                          </span>
                        )}
                      </span>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

              <MapUpdater points={points} />
              <MapClickHandler 
                isActive={selectingTarget !== null} 
                onLocationSelected={(coord) => {
                  if (selectingTarget === 'loc1') {
                    setSelectedLoc1(coord);
                    setLoc1(coord.display_name);
                  } else if (selectingTarget === 'loc2') {
                    setSelectedLoc2(coord);
                    setLoc2(coord.display_name);
                  }
                  setSelectingTarget(null);
                }} 
              />
            </MapContainer>
          </div>
        </main>

        {/* Footer Info */}
        <footer className={cn("px-6 lg:px-8 py-4 border-t flex flex-col sm:flex-row justify-between items-center z-10 shrink-0 gap-3 sm:gap-0 mt-auto transition-colors", isDark ? "bg-black/40 border-white/5" : "bg-slate-100/50 border-slate-200")}>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Sistem Geocoding Aktif
            </div>
            <div className={cn("hidden sm:block", isDark ? "text-white/20" : "text-slate-300")}>|</div>
            <div>Provider: Nominatim OSM</div>
            <div className={cn("hidden sm:block", isDark ? "text-white/20" : "text-slate-300")}>|</div>
            <div>Datum: WGS84</div>
          </div>
          <div className={cn("text-[10px] italic text-center sm:text-right max-w-sm", isDark ? "text-slate-400/70" : "text-slate-500")}>
            *Jarak dihitung menggunakan formula Haversine untuk akurasi kelengkungan bumi.
          </div>
        </footer>
        {/* Modals */}
        {showHistory && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={cn("border p-6 rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]", isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")}>
              <h2 className={cn("text-xl font-bold mb-4 shrink-0", isDark ? "text-white" : "text-slate-900")}>Riwayat Analisis</h2>
              
              <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-3 hide-scrollbar">
                {history.length === 0 ? (
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Belum ada riwayat tersimpan untuk sesi ini.</p>
                ) : (
                  history.map(item => (
                    <div key={item.id} className={cn("p-3 rounded-xl border text-sm", isDark ? "bg-black/20 border-white/5" : "bg-slate-50 border-slate-200")}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn("font-bold", item.type === 'distance' ? "text-blue-500" : "text-emerald-500")}>
                          {item.type === 'distance' ? 'Hitung Jarak' : 'Area Radius'}
                        </span>
                        <span className={cn("text-[10px]", isDark ? "text-slate-500" : "text-slate-400")}>
                          {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={cn("font-medium mb-1", isDark ? "text-slate-200" : "text-slate-700")}>{item.summary}</p>
                      <p className={isDark ? "text-slate-400" : "text-slate-500"}>{item.details}</p>
                      {item.places && item.places.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                          <div className={cn("text-[10px] uppercase font-bold mb-1", isDark ? "text-slate-500" : "text-slate-400")}>Daftar Wilayah:</div>
                          <div className="max-h-32 overflow-y-auto pr-1 hide-scrollbar space-y-1 text-xs">
                            {item.places.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-black/10 px-2 py-1.5 rounded">
                                <span className={cn("truncate mr-2", isDark ? "text-slate-300" : "text-slate-600")}>{p.name}</span>
                                <span className={cn("font-mono text-[10px] whitespace-nowrap", isDark ? "text-blue-400" : "text-blue-600")}>{p.dist}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setShowHistory(false)}
                className="w-full shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
