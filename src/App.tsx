import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
  Circle,
  CircleMarker,
  Tooltip
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Search,
  MapPin,
  Loader2,
  Layers,
  Map as MapIcon,
  Printer,
  History,
  Trash2,
  School,
  Home,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  Info,
  X,
  Plus,
  ExternalLink,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { cn } from './lib/utils';
import {
  PRESET_SCHOOLS,
  SMP_NEGERI_DENPASAR,
  SMA_SMK_DENPASAR,
  BANJAR_DENPASAR_DATA,
  SchoolData,
  BanjarNode,
  calculatePreciseDistanceMeters,
  evaluateZoningStatus,
  ZoningZoneStatus
} from './lib/spmbData';
import { GeocodeCache, HistoryStorage, SavedCandidate } from './lib/storage';

// Leaflet DivIcons
const schoolIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-10 h-10 flex items-center justify-center relative group">
      <div class="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
      <div class="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/50 border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m4 6 8-4 8 4"/>
          <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/>
          <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
          <path d="M18 5v17"/>
          <path d="M6 5v17"/>
          <circle cx="12" cy="9" r="2"/>
        </svg>
      </div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const homeIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-10 h-10 flex items-center justify-center relative">
      <div class="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse"></div>
      <div class="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/50 border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      </div>
    </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

interface Coordinate {
  lat: number;
  lon: number;
  display_name: string;
}

// Algoritma pencarian fuzzy yang dioptimasi
function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (t.includes(q)) return true;

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return words.every(w => target.toLowerCase().includes(w));
}

// Map Controller for bounds & smooth pan dengan transisi stabil
function MapViewController({ schoolPoint, homePoint }: { schoolPoint: Coordinate | null; homePoint: Coordinate | null }) {
  const map = useMap();

  useEffect(() => {
    if (schoolPoint && homePoint) {
      const bounds = L.latLngBounds(
        [schoolPoint.lat, schoolPoint.lon],
        [homePoint.lat, homePoint.lon]
      );
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 17, animate: true, duration: 0.6 });
    } else if (schoolPoint) {
      map.flyTo([schoolPoint.lat, schoolPoint.lon], 15, { animate: true, duration: 0.6 });
    } else if (homePoint) {
      map.flyTo([homePoint.lat, homePoint.lon], 15, { animate: true, duration: 0.6 });
    }
  }, [schoolPoint, homePoint, map]);

  return null;
}

// Map Click Picker & Proximity Snap Detector
function MapClickHandler({
  isActive,
  onPick,
  banjars,
  onSelectBanjar
}: {
  isActive: boolean;
  onPick: (lat: number, lon: number) => void;
  banjars?: BanjarNode[];
  onSelectBanjar?: (b: BanjarNode) => void;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (isActive) {
        onPick(e.latlng.lat, e.latlng.lng);
        return;
      }

      // Deteksi Kedekatan Piksel Layar (Snap Proximity)
      // Jika pengguna menekan di dekat titik banjar (toleransi s.d. 20 piksel layar)
      if (banjars && banjars.length > 0 && onSelectBanjar) {
        const clickPt = map.latLngToContainerPoint(e.latlng);
        let nearest: BanjarNode | null = null;
        let minDistancePx = Infinity;

        for (const b of banjars) {
          const bPt = map.latLngToContainerPoint([b.lat, b.lon]);
          const dPx = Math.hypot(clickPt.x - bPt.x, clickPt.y - bPt.y);
          if (dPx < minDistancePx) {
            minDistancePx = dPx;
            nearest = b;
          }
        }

        // Toleransi responsif: jika klik dalam 20px dari titik (mencakup 3px s.d. 20px)
        if (nearest && minDistancePx <= 20) {
          onSelectBanjar(nearest);
        }
      }
    }
  });
  return null;
}

// Palet warna estetik untuk membedakan tiap lingkaran radius
const RADIUS_COLORS = [
  { stroke: '#10b981', fill: '#10b981' }, // 1st - Emerald
  { stroke: '#3b82f6', fill: '#3b82f6' }, // 2nd - Blue
  { stroke: '#8b5cf6', fill: '#8b5cf6' }, // 3rd - Purple
  { stroke: '#f59e0b', fill: '#f59e0b' }, // 4th - Amber
  { stroke: '#ec4899', fill: '#ec4899' }, // 5th - Pink
  { stroke: '#06b6d4', fill: '#06b6d4' }  // 6th - Cyan
];

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('skydist_theme');
    return saved ? saved === 'dark' : true;
  });

  const [mapType, setMapType] = useState<'satellite' | 'street'>('satellite');

  // Input states
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(SMP_NEGERI_DENPASAR[0]);
  const [schoolQuery, setSchoolQuery] = useState(SMP_NEGERI_DENPASAR[0].name);
  const [schoolSuggestions, setSchoolSuggestions] = useState<SchoolData[]>([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  // Status Sinkronisasi Asinkron (Jeda 300ms untuk transisi kamera map & rekalkulasi presisi)
  const [isSyncingSchool, setIsSyncingSchool] = useState<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const lastSchoolIdRef = useRef<string | null>(SMP_NEGERI_DENPASAR[0].id);

  const [studentName, setStudentName] = useState('');
  const [candidateNumber, setCandidateNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [homePoint, setHomePoint] = useState<Coordinate | null>(null);
  const [homeSuggestions, setHomeSuggestions] = useState<Coordinate[]>([]);
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [searchingHome, setSearchingHome] = useState(false);

  // Map picking mode
  const [pickingTarget, setPickingTarget] = useState<'school' | 'home' | null>(null);

  // Multi-Radius States
  const [activeRadiusList, setActiveRadiusList] = useState<number[]>([1000, 2500]); // 1 km & 2.5 km
  const [customRadiusInput, setCustomRadiusInput] = useState<string>('');
  const [customRadiusUnit, setCustomRadiusUnit] = useState<'m' | 'km'>('m');
  const [showRadiusRings, setShowRadiusRings] = useState<boolean>(true);

  // Banjar nodes in max radius
  const [banjarNodes, setBanjarNodes] = useState<BanjarNode[]>([]);
  const [loadingBanjars, setLoadingBanjars] = useState(false);
  const [selectedBanjarPopup, setSelectedBanjarPopup] = useState<BanjarNode | null>(null);

  // Calculation results
  const [distanceData, setDistanceData] = useState<{
    meters: number;
    kilometers: number;
    formattedMeters: string;
    formattedKm: string;
  } | null>(null);

  const [zoningStatus, setZoningStatus] = useState<ZoningZoneStatus | null>(null);

  // History & Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<SavedCandidate[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Sync dark class with document
  useEffect(() => {
    localStorage.setItem('skydist_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load history on mount
  useEffect(() => {
    setHistoryList(HistoryStorage.getAll());
  }, []);

  // School auto-search filter
  useEffect(() => {
    if (!schoolQuery) {
      setSchoolSuggestions(PRESET_SCHOOLS.slice(0, 15));
      return;
    }
    const filtered = PRESET_SCHOOLS.filter(s =>
      fuzzyMatch(schoolQuery, `${s.name} ${s.city} ${s.province} ${s.level}`)
    ).slice(0, 15);
    setSchoolSuggestions(filtered);
  }, [schoolQuery]);

  // Home geocoding with debounce & instant cache lookup
  useEffect(() => {
    if (!homeAddress || homeAddress.length < 3) {
      setHomeSuggestions([]);
      return;
    }

    const coordMatch = homeAddress.trim().match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      setHomeSuggestions([{
        lat,
        lon,
        display_name: `Koordinat GPS: ${lat.toFixed(6)}, ${lon.toFixed(6)}`
      }]);
      setShowHomeDropdown(true);
      return;
    }

    const cached = GeocodeCache.get(homeAddress);
    if (cached) {
      setHomeSuggestions(cached);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingHome(true);
      try {
        const queryParams = new URLSearchParams({
          format: 'json',
          q: homeAddress,
          countrycodes: 'id',
          limit: '6',
          addressdetails: '1'
        });

        const res = await fetch(`https://nominatim.openstreetmap.org/search?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const parsed = data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name
          }));
          setHomeSuggestions(parsed);
          GeocodeCache.set(homeAddress, parsed);
        }
      } catch (err) {
        console.warn('Geocode query failed:', err);
      } finally {
        setSearchingHome(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [homeAddress]);

  // School Coordinate
  const schoolCoordinate = useMemo<Coordinate | null>(() => {
    if (!selectedSchool) return null;
    return {
      lat: selectedSchool.lat,
      lon: selectedSchool.lon,
      display_name: selectedSchool.name
    };
  }, [selectedSchool]);

  // Max radius aktif saat ini (untuk memuat semua banjar yang masuk jangkauan terluar)
  const maxActiveRadius = useMemo(() => {
    if (activeRadiusList.length === 0) return 0;
    return Math.max(...activeRadiusList);
  }, [activeRadiusList]);

  // Titik Banjar yang dijamin secara matematis lolos filter radius aktif terluar saat ini
  const visibleBanjars = useMemo<BanjarNode[]>(() => {
    if (!schoolCoordinate || !showRadiusRings || activeRadiusList.length === 0 || maxActiveRadius <= 0) {
      return [];
    }
    return banjarNodes
      .map(b => {
        const dist = calculatePreciseDistanceMeters(schoolCoordinate.lat, schoolCoordinate.lon, b.lat, b.lon);
        return {
          ...b,
          distanceMeters: dist.meters,
          distanceKm: dist.kilometers
        };
      })
      .filter(b => (b.distanceMeters || 0) <= maxActiveRadius)
      .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
  }, [banjarNodes, schoolCoordinate, showRadiusRings, activeRadiusList, maxActiveRadius]);

  // SINKRONISASI ASINKRON (JEDA 300ms) SAAT GANTI SEKOLAH / RADIUS:
  // Menunggu kamera map bergerak ke titik baru, lalu menghitung ulang:
  // 1. Jarak & Status Kelayakan Zonasi Rumah Calon Siswa
  // 2. Pemindaian Titik Seluruh Banjar di dalam Multi-Radius
  useEffect(() => {
    const currentReqId = ++activeRequestIdRef.current;

    // Batalkan request fetch Overpass yang sedang berjalan jika ada
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (!schoolCoordinate) {
      setDistanceData(null);
      setZoningStatus(null);
      setBanjarNodes([]);
      setSelectedBanjarPopup(null);
      setIsSyncingSchool(false);
      return;
    }

    // Jika id sekolah berubah, bersihkan titik banjar seketika agar marker lama tidak tertinggal di peta
    if (selectedSchool?.id !== lastSchoolIdRef.current) {
      lastSchoolIdRef.current = selectedSchool?.id || null;
      setBanjarNodes([]);
      setSelectedBanjarPopup(null);
    }

    // Aktifkan indikator loading sinkronisasi
    setIsSyncingSchool(true);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    syncTimeoutRef.current = setTimeout(() => {
      if (activeRequestIdRef.current !== currentReqId) return;

      // 1. Hitung ulang jarak rumah calon siswa ke sekolah baru
      if (homePoint) {
        const calc = calculatePreciseDistanceMeters(
          schoolCoordinate.lat,
          schoolCoordinate.lon,
          homePoint.lat,
          homePoint.lon
        );
        setDistanceData(calc);
        setZoningStatus(evaluateZoningStatus(calc.meters));

        // Auto save kandidat ke riwayat
        const newEntry: SavedCandidate = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          studentName: studentName.trim() || 'Calon Siswa',
          candidateNumber: candidateNumber.trim() || undefined,
          schoolName: schoolCoordinate.display_name,
          schoolCoords: [schoolCoordinate.lat, schoolCoordinate.lon],
          homeAddress: homePoint.display_name,
          homeCoords: [homePoint.lat, homePoint.lon],
          distanceMeters: calc.meters,
          distanceKm: calc.kilometers,
          zoningTier: evaluateZoningStatus(calc.meters).tier,
          createdAt: Date.now()
        };
        const updated = HistoryStorage.save(newEntry);
        setHistoryList(updated);
      } else {
        setDistanceData(null);
        setZoningStatus(null);
      }

      // 2. Pindai ulang seluruh banjar dalam radius maksimal dari sekolah baru
      if (showRadiusRings && activeRadiusList.length > 0) {
        const radM = maxActiveRadius;
        setLoadingBanjars(true);

        // a. Pindai dataset offline lengkap Kota Denpasar (0 ms respons, langsung muncul)
        const localMatches: BanjarNode[] = BANJAR_DENPASAR_DATA.map((b) => {
          const dist = calculatePreciseDistanceMeters(schoolCoordinate.lat, schoolCoordinate.lon, b.lat, b.lon);
          return {
            ...b,
            distanceMeters: dist.meters,
            distanceKm: dist.kilometers
          };
        }).filter(b => (b.distanceMeters || 0) <= radM);

        if (activeRequestIdRef.current === currentReqId) {
          setBanjarNodes(localMatches);
        }

        // b. Query peladen Overpass OSM multi-tag dengan pembatalan request (AbortController)
        const fetchOsmBanjars = async () => {
          try {
            const query = `[out:json][timeout:30];(
              node(around:${radM},${schoolCoordinate.lat},${schoolCoordinate.lon})["place"~"hamlet|village|suburb|neighbourhood|quarter|locality"];
              node(around:${radM},${schoolCoordinate.lat},${schoolCoordinate.lon})["amenity"="community_centre"]["name"~"Banjar|Bale|Balai",i];
              node(around:${radM},${schoolCoordinate.lat},${schoolCoordinate.lon})["name"~"Banjar|Dusun",i];
            );out center;`;
            
            const endpoints = [
              'https://overpass-api.de/api/interpreter',
              'https://overpass.kumi.systems/api/interpreter',
              'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
            ];

            let osmNodes: BanjarNode[] = [];
            for (const ep of endpoints) {
              if (activeRequestIdRef.current !== currentReqId || controller.signal.aborted) {
                return;
              }
              try {
                const res = await fetch(ep, {
                  method: 'POST',
                  body: `data=${encodeURIComponent(query)}`,
                  signal: controller.signal
                });
                if (res.ok) {
                  const data = await res.json();
                  if (activeRequestIdRef.current !== currentReqId || controller.signal.aborted) {
                    return;
                  }
                  if (data && data.elements && data.elements.length > 0) {
                    osmNodes = data.elements
                      .filter((e: any) => e.tags && e.tags.name)
                      .map((e: any) => {
                        const lat = e.center ? e.center.lat : e.lat;
                        const lon = e.center ? e.center.lon : e.lon;
                        const dist = calculatePreciseDistanceMeters(schoolCoordinate.lat, schoolCoordinate.lon, lat, lon);
                        return {
                          id: e.id,
                          name: e.tags.name,
                          subdistrict: e.tags['addr:subdistrict'] || e.tags.is_in || 'Wilayah Teridentifikasi',
                          village: e.tags['addr:village'] || e.tags['addr:suburb'],
                          lat,
                          lon,
                          type: e.tags.place || 'banjar',
                          distanceMeters: dist.meters,
                          distanceKm: dist.kilometers
                        };
                      })
                      .filter((e: BanjarNode) => (e.distanceMeters || 0) <= radM);
                    break;
                  }
                }
              } catch (e: any) {
                if (e.name === 'AbortError') {
                  return;
                }
                console.warn(`Endpoint ${ep} gagal`, e);
              }
            }

            if (activeRequestIdRef.current !== currentReqId || controller.signal.aborted) {
              return;
            }

            const combined = [...localMatches];
            osmNodes.forEach(item => {
              const normName = item.name.toLowerCase().replace(/^(banjar|bale banjar|balai banjar|dusun|kelurahan|desa)\s+/, '').trim();
              const exists = combined.some(c => {
                const cNorm = c.name.toLowerCase().replace(/^(banjar|bale banjar|balai banjar|dusun|kelurahan|desa)\s+/, '').trim();
                return cNorm === normName || c.name.toLowerCase() === item.name.toLowerCase();
              });
              if (!exists) {
                combined.push(item);
              }
            });

            // Filter ketat dan pastikan jarak dihitung presisi terhadap koordinat sekolah aktif
            const strictlyFiltered = combined
              .map(item => {
                const dist = calculatePreciseDistanceMeters(schoolCoordinate.lat, schoolCoordinate.lon, item.lat, item.lon);
                return {
                  ...item,
                  distanceMeters: dist.meters,
                  distanceKm: dist.kilometers
                };
              })
              .filter(item => (item.distanceMeters || 0) <= radM)
              .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

            if (activeRequestIdRef.current === currentReqId) {
              setBanjarNodes(strictlyFiltered);
            }
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              console.warn('Overpass OSM query issue:', err);
            }
          } finally {
            if (activeRequestIdRef.current === currentReqId) {
              setLoadingBanjars(false);
            }
          }
        };

        fetchOsmBanjars();
      } else {
        setBanjarNodes([]);
      }

      // Transisi selesai, hilangkan indikator loading
      if (activeRequestIdRef.current === currentReqId) {
        setIsSyncingSchool(false);
      }
    }, 300); // Jeda 300ms tepat sesuai konfirmasi pengguna

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [selectedSchool, homePoint, activeRadiusList, showRadiusRings, schoolCoordinate, maxActiveRadius]);

  // Toggle multi-select radius preset
  const toggleRadiusSelection = (meters: number) => {
    setActiveRadiusList(prev => {
      if (prev.includes(meters)) {
        return prev.filter(m => m !== meters);
      } else {
        return [...prev, meters].sort((a, b) => a - b);
      }
    });
  };

  // Tambah radius kustom
  const handleAddCustomRadius = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseFloat(customRadiusInput.replace(',', '.'));
    if (!num || isNaN(num) || num <= 0) return;

    const meters = customRadiusUnit === 'km' ? Math.round(num * 1000) : Math.round(num);
    if (!activeRadiusList.includes(meters)) {
      setActiveRadiusList(prev => [...prev, meters].sort((a, b) => a - b));
    }
    setCustomRadiusInput('');
    setShowRadiusRings(true);
  };

  // Hapus radius tertentu dari list
  const removeRadius = (meters: number) => {
    setActiveRadiusList(prev => prev.filter(m => m !== meters));
  };

  // Reverse geocode when picking on map
  const handleMapPick = async (lat: number, lon: number) => {
    const formattedCoord = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    
    if (pickingTarget === 'home') {
      const fallbackName = `Titik Rumah (${formattedCoord})`;
      setHomePoint({ lat, lon, display_name: fallbackName });
      setHomeAddress(fallbackName);
      setPickingTarget(null);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            setHomePoint({ lat, lon, display_name: data.display_name });
            setHomeAddress(data.display_name);
          }
        }
      } catch (err) {
        console.warn('Reverse geocode error:', err);
      }
    } else if (pickingTarget === 'school') {
      const customSchool: SchoolData = {
        id: `custom-${Date.now()}`,
        name: `Lokasi Sekolah (${formattedCoord})`,
        level: 'SMP',
        city: 'Kustom',
        province: 'Indonesia',
        lat,
        lon,
        address: formattedCoord
      };
      setBanjarNodes([]);
      setSelectedSchool(customSchool);
      setSchoolQuery(customSchool.name);
      setPickingTarget(null);

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            const updatedSchool = {
              ...customSchool,
              name: data.name || data.display_name.split(',')[0] || customSchool.name,
              address: data.display_name
            };
            setSelectedSchool(updatedSchool);
            setSchoolQuery(updatedSchool.name);
          }
        }
      } catch {}
    }
  };

  // Restore item from history
  const loadHistoryItem = (item: SavedCandidate) => {
    setStudentName(item.studentName);
    setCandidateNumber(item.candidateNumber || '');
    
    const matched = PRESET_SCHOOLS.find(s => s.name === item.schoolName);
    const restoredSchool: SchoolData = matched || {
      id: `restored-${item.id}`,
      name: item.schoolName,
      level: 'SMP',
      city: '',
      province: '',
      lat: item.schoolCoords[0],
      lon: item.schoolCoords[1],
      address: item.schoolName
    };
    setBanjarNodes([]);
    setSelectedSchool(restoredSchool);
    setSchoolQuery(item.schoolName);

    setHomePoint({
      lat: item.homeCoords[0],
      lon: item.homeCoords[1],
      display_name: item.homeAddress
    });
    setHomeAddress(item.homeAddress);
    setShowHistoryModal(false);
  };

  return (
    <div className={cn("w-full min-h-screen flex flex-col font-sans transition-colors duration-200", isDark ? "bg-[#0A0C10] text-slate-100" : "bg-slate-50 text-slate-900")}>
      
      {/* Top Bar Contract (1 row, 3 distinct zones, whitespace-nowrap) */}
      <header className={cn("sticky top-0 z-40 px-6 py-3.5 border-b backdrop-blur-md flex items-center justify-between gap-8 transition-colors", isDark ? "bg-[#0A0C10]/90 border-slate-800" : "bg-white/95 border-slate-200")}>
        
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <School className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">
            SkyDist <span className="text-blue-500 font-semibold">SPMB Zonasi</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links & Actions */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            SMP & SMA/SMK Negeri Kota Denpasar &bull; Geodesik WGS84 Jalur Zonasi
          </span>
        </nav>

        {/* Zone 3: Primary Control Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0", isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700")}
          >
            <History className="w-3.5 h-3.5 text-blue-500" />
            <span>Riwayat ({historyList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0", isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700")}
            title="Ganti Tema Warna"
          >
            {isDark ? 'Mode Terang' : 'Mode Gelap'}
          </button>

          {distanceData && (
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Bukti Verifikasi</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1650px] mx-auto p-4 lg:p-6 gap-6 relative">
        
        {/* Left Side: SPMB Input & Verification Control Panel */}
        <div className="w-full lg:w-[490px] xl:w-[510px] shrink-0 flex flex-col gap-5">
          
          {/* Card: Pemilihan Sekolah Lengkap (Dropdown Langsung + Input Pencarian) */}
          <div className={cn("p-5 rounded-2xl border transition-colors shadow-sm flex flex-col gap-4 relative overflow-hidden", isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200")}>
            
            {/* Indikator Sinkronisasi Halus (Muncul saat ganti sekolah selama 300ms) */}
            {isSyncingSchool && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30 overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse w-full"></div>
              </div>
            )}

            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider">1. Sekolah Tujuan (Titik A)</h2>
              </div>
              <button
                type="button"
                onClick={() => setPickingTarget(pickingTarget === 'school' ? null : 'school')}
                className={cn("text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-all", pickingTarget === 'school' ? "bg-red-500 text-white border-red-500 shadow-sm" : (isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"))}
              >
                <MapPin className="w-3 h-3 text-red-400" />
                {pickingTarget === 'school' ? 'Klik Peta...' : 'Pilih di Peta'}
              </button>
            </div>

            {/* Dropdown Pemilih Langsung (SMP Negeri 1-17 & SMA/SMK Negeri Kota Denpasar) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Pilih Sekolah Negeri Kota Denpasar (SMP 1-17 & SMA/SMK Lengkap)
              </label>
              <div className="relative">
                <select
                  value={selectedSchool?.id || ''}
                  onChange={(e) => {
                    const match = PRESET_SCHOOLS.find(s => s.id === e.target.value);
                    if (match) {
                      setBanjarNodes([]);
                      setSelectedSchool(match);
                      setSchoolQuery(match.name);
                    }
                  }}
                  className={cn("w-full px-3 py-2.5 rounded-xl text-sm border outline-none font-medium appearance-none cursor-pointer transition-colors pr-9", isDark ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500")}
                >
                  <optgroup label="📍 SMP NEGERI KOTA DENPASAR (1 s.d. 17 LENGKAP)">
                    {SMP_NEGERI_DENPASAR.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} - {sch.address.split(',')[0]}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📍 SMA & SMK NEGERI SE-KOTA DENPASAR (SMAN 1-11 & SMKN 1-5)">
                    {SMA_SMK_DENPASAR.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} - {sch.address.split(',')[0]}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* School Search Input with Autocomplete */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Atau Cari Manual Sekolah Negeri Kota Denpasar</span>
                <span className="text-[10px] text-blue-500 cursor-pointer" onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}>
                  {showSchoolDropdown ? 'Tutup Daftar' : 'Tampilkan Semua'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={schoolQuery}
                  onChange={(e) => {
                    setSchoolQuery(e.target.value);
                    setShowSchoolDropdown(true);
                  }}
                  onFocus={() => setShowSchoolDropdown(true)}
                  placeholder="Ketik nama SMP / SMA / SMK Negeri Denpasar..."
                  className={cn("w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition-colors", isDark ? "bg-black/40 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500")}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {showSchoolDropdown && schoolSuggestions.length > 0 && (
                <div className={cn("absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 max-h-60 overflow-y-auto", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                  {schoolSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setBanjarNodes([]);
                        setSelectedSchool(s);
                        setSchoolQuery(s.name);
                        setShowSchoolDropdown(false);
                      }}
                      className={cn("w-full text-left px-3.5 py-2.5 border-b last:border-none flex items-start justify-between gap-2 text-xs transition-colors", isDark ? "hover:bg-slate-800 border-slate-800/60" : "hover:bg-slate-50 border-slate-100")}
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                        <p className="text-[11px] text-slate-500">{s.address}</p>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold shrink-0">
                        {s.level}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSchool && (
              <div className={cn("p-3 rounded-xl border text-xs flex flex-col gap-1 transition-all", isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedSchool.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{selectedSchool.lat.toFixed(6)}, {selectedSchool.lon.toFixed(6)}</span>
                </div>
                <p className="text-[11px] text-slate-500">{selectedSchool.address}</p>
              </div>
            )}
          </div>

          {/* Card: Pengaturan Multi-Radius & Input Radius Kustom */}
          <div className={cn("p-5 rounded-2xl border transition-colors shadow-sm flex flex-col gap-3.5 relative overflow-hidden", isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200")}>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-500" /> Multi-Radius & Pemindaian Seluruh Banjar
              </span>
              <button
                type="button"
                onClick={() => setShowRadiusRings(!showRadiusRings)}
                className={cn("text-[11px] px-2.5 py-1 rounded font-medium border transition-colors", showRadiusRings ? "bg-blue-600 text-white border-blue-600" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700")}
              >
                {showRadiusRings ? 'Radius Aktif' : 'Sembunyikan'}
              </button>
            </div>

            {/* Indikator Loading Sinkronisasi Halus dengan teks status */}
            {isSyncingSchool && (
              <div className={cn("p-2 rounded-xl border text-xs flex items-center gap-2 animate-pulse", isDark ? "bg-blue-950/40 border-blue-900/60 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700")}>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span className="text-[11px] font-medium">
                  Menyelaraskan ke {selectedSchool?.name || 'sekolah baru'} & memindai ulang wilayah...
                </span>
              </div>
            )}

            {showRadiusRings && (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Pilih Beberapa Radius Sekaligus:</span>
                    <span className="text-[10px] text-slate-400">Klik untuk aktif / non-aktif</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[500, 1000, 1500, 2000, 2500, 3000, 5000].map((r) => {
                      const isSelected = activeRadiusList.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRadiusSelection(r)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5",
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : (isDark ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900")
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-slate-400")} />
                          {r >= 1000 ? `${(r / 1000).toLocaleString('id-ID')} km` : `${r} m`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Mengetik Langsung Radius Kustom */}
                <form onSubmit={handleAddCustomRadius} className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Ketik Radius Kustom Yang Diinginkan:</span>
                    <span className="text-[10px] text-slate-400">Misal: 1200 m atau 1.8 km</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={customRadiusInput}
                      onChange={(e) => setCustomRadiusInput(e.target.value)}
                      placeholder="Masukkan angka radius..."
                      className={cn("flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none font-mono transition-colors", isDark ? "bg-black/40 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500")}
                    />
                    <select
                      value={customRadiusUnit}
                      onChange={(e) => setCustomRadiusUnit(e.target.value as 'm' | 'km')}
                      className={cn("px-2.5 py-1.5 text-xs rounded-xl border font-bold outline-none cursor-pointer", isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800")}
                    >
                      <option value="m">Meter</option>
                      <option value="km">Kilometer (KM)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!customRadiusInput.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-all disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </form>

                {/* Lingkaran Radius Aktif Saat Ini */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 mr-1">Lingkaran Aktif:</span>
                  {activeRadiusList.length === 0 ? (
                    <span className="text-[10px] text-amber-500 italic">Pilih atau tambah minimal 1 radius</span>
                  ) : (
                    activeRadiusList.map((rad, idx) => (
                      <span
                        key={rad}
                        className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border", isDark ? "bg-slate-950 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-300 text-slate-800")}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: RADIUS_COLORS[idx % RADIUS_COLORS.length].stroke }}
                        />
                        {rad >= 1000 ? `${(rad / 1000).toLocaleString('id-ID')} km` : `${rad} m`}
                        <button
                          type="button"
                          onClick={() => removeRadius(rad)}
                          className="hover:text-red-500 ml-0.5 p-0.5"
                          title="Hapus radius ini"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className={cn("p-2.5 rounded-xl border text-[11px] flex items-center justify-between", isDark ? "bg-slate-950/40 border-slate-800 text-slate-400" : "bg-blue-50/50 border-blue-200 text-slate-600")}>
                  <span>
                    {isSyncingSchool ? (
                      <span className="text-blue-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menghitung ulang banjar di lokasi baru...
                      </span>
                    ) : (
                      <>
                        Ditemukan <strong className="text-blue-500 font-mono text-xs">{visibleBanjars.length} titik banjar/kelurahan</strong> di dalam radius luar ({maxActiveRadius >= 1000 ? `${(maxActiveRadius / 1000).toLocaleString('id-ID')} km` : `${maxActiveRadius} m`}).
                      </>
                    )}
                  </span>
                  {loadingBanjars && !isSyncingSchool && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />}
                </div>
              </>
            )}
          </div>

          {/* Card: Titik Domisili / Rumah Calon Siswa */}
          <div className={cn("p-5 rounded-2xl border transition-colors shadow-sm flex flex-col gap-4 relative overflow-hidden", isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider">2. Rumah Calon Siswa (Titik B)</h2>
              </div>
              <button
                type="button"
                onClick={() => setPickingTarget(pickingTarget === 'home' ? null : 'home')}
                className={cn("text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-all", pickingTarget === 'home' ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : (isDark ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"))}
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                {pickingTarget === 'home' ? 'Klik Peta...' : 'Pilih di Peta'}
              </button>
            </div>

            {/* Student Name & Number */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  Nama Siswa (Opsional)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Misal: Putu Arya"
                  className={cn("w-full px-3 py-2 rounded-xl text-xs border outline-none", isDark ? "bg-black/40 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500")}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  NISN / No. Peserta
                </label>
                <input
                  type="text"
                  value={candidateNumber}
                  onChange={(e) => setCandidateNumber(e.target.value)}
                  placeholder="0078129381"
                  className={cn("w-full px-3 py-2 rounded-xl text-xs border outline-none font-mono", isDark ? "bg-black/40 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500")}
                />
              </div>
            </div>

            {/* Home Address Search & Coordinates */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Alamat Tempat Tinggal / Titik Koordinat GPS
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => {
                    setHomeAddress(e.target.value);
                    setShowHomeDropdown(true);
                  }}
                  onFocus={() => setShowHomeDropdown(true)}
                  placeholder="Ketik alamat rumah, banjar/desa, atau koordinat (-8.65, 115.21)"
                  className={cn("w-full pl-9 pr-8 py-2.5 rounded-xl text-sm border outline-none transition-colors", isDark ? "bg-black/40 border-slate-800 text-slate-100 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500")}
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {searchingHome && <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute right-3 top-3" />}
              </div>

              {showHomeDropdown && homeSuggestions.length > 0 && (
                <div className={cn("absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 max-h-56 overflow-y-auto", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                  {homeSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setHomePoint(item);
                        setHomeAddress(item.display_name);
                        setShowHomeDropdown(false);
                      }}
                      className={cn("w-full text-left px-3.5 py-2.5 border-b last:border-none text-xs transition-colors", isDark ? "hover:bg-slate-800 border-slate-800/60 text-slate-300" : "hover:bg-slate-50 border-slate-100 text-slate-700")}
                    >
                      <p className="line-clamp-2">{item.display_name}</p>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">{item.lat.toFixed(5)}, {item.lon.toFixed(5)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {homePoint && (
              <div className={cn("p-3 rounded-xl border text-xs flex flex-col gap-1", isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Titik Domisili Terpilih</span>
                  <span className="font-mono text-[10px] text-slate-400">{homePoint.lat.toFixed(5)}, {homePoint.lon.toFixed(5)}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{homePoint.display_name}</p>
              </div>
            )}
          </div>

          {/* Verification Result Box */}
          {distanceData && zoningStatus && (
            <div className={cn("p-5 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden shadow-md", isDark ? "bg-slate-900 border-slate-700" : "bg-white border-blue-200")}>
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hasil Pengukuran Jarak Udara
                </span>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border transition-all", isSyncingSchool && "opacity-50", zoningStatus.badgeBg, zoningStatus.badgeBorder, zoningStatus.badgeText)}>
                  {zoningStatus.title}
                </span>
              </div>

              {/* Main Distance Display */}
              <div className="flex items-baseline gap-3 my-1">
                <span className={cn("text-4xl lg:text-5xl font-black font-mono tracking-tight tabular-nums transition-opacity text-slate-900 dark:text-white", isSyncingSchool && "opacity-40")}>
                  {distanceData.formattedMeters}
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Meter
                </span>
                <span className="text-sm font-mono text-slate-400">
                  ({distanceData.formattedKm} km)
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {zoningStatus.description}
              </p>

              {/* Priority Bar Indicator */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className={cn("h-full transition-all duration-500", zoningStatus.tier === 'ZONA_1' ? "bg-emerald-500" : zoningStatus.tier === 'ZONA_2' ? "bg-blue-500" : zoningStatus.tier === 'ZONA_3' ? "bg-amber-500" : "bg-rose-500")}
                  style={{ width: `${zoningStatus.priorityScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Skor Prioritas: {zoningStatus.priorityScore}/100</span>
                <span>Metode: Geodesik WGS84</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Leaflet Satellite Map Viewport */}
        <div className="flex-1 min-h-[520px] lg:min-h-[720px] rounded-2xl border overflow-hidden relative shadow-lg flex flex-col border-slate-300 dark:border-slate-800">
          
          {/* Active Mode Notice / Picking Notification */}
          {pickingTarget && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl font-medium text-xs flex items-center gap-2 border border-blue-400 animate-pulse">
              <MapPin className="w-4 h-4" />
              <span>
                Klik pada peta untuk menentukan posisi {pickingTarget === 'school' ? 'Sekolah' : 'Rumah Siswa'}
              </span>
              <button
                type="button"
                onClick={() => setPickingTarget(null)}
                className="ml-2 hover:bg-blue-700 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Map Layer Switcher */}
          <div className={cn("absolute bottom-6 right-6 z-[400] flex flex-col gap-1.5 p-1 rounded-xl shadow-xl backdrop-blur-md border", isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200")}>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors", mapType === 'satellite' ? "bg-blue-600 text-white" : (isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"))}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satelit</span>
            </button>
            <button
              type="button"
              onClick={() => setMapType('street')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors", mapType === 'street' ? "bg-blue-600 text-white" : (isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"))}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Jalan</span>
            </button>
          </div>

          {/* Distance floating summary on map top-left */}
          {distanceData && (
            <div className={cn("absolute top-4 left-4 z-[400] p-3.5 rounded-xl border backdrop-blur-md shadow-xl flex items-center gap-3 transition-opacity", isSyncingSchool && "opacity-50", isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white/95 border-slate-200 text-slate-900")}>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Jarak Garis Lurus Terukur</p>
                <p className="text-xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {distanceData.formattedMeters} Meter
                </p>
              </div>
            </div>
          )}

          {/* Leaflet Map Component */}
          <MapContainer
            center={schoolCoordinate ? [schoolCoordinate.lat, schoolCoordinate.lon] : [-8.656554, 115.219518]}
            zoom={14}
            scrollWheelZoom={true}
            className={cn("w-full h-full flex-1 z-0", pickingTarget ? "cursor-crosshair" : "")}
            zoomControl={false}
          >
            {mapType === 'satellite' ? (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
            )}

            {/* School Marker (Point A) */}
            {schoolCoordinate && (
              <Marker position={[schoolCoordinate.lat, schoolCoordinate.lon]} icon={schoolIcon}>
                <Tooltip permanent direction="top" offset={[0, -22]} className="bg-white/95 text-slate-900 font-bold text-xs px-2.5 py-1 rounded shadow-md border-none">
                  {schoolCoordinate.display_name}
                </Tooltip>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-red-600 mb-1">Titik Sekolah (A)</p>
                    <p className="font-semibold text-slate-800">{schoolCoordinate.display_name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      {schoolCoordinate.lat.toFixed(6)}, {schoolCoordinate.lon.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Home Marker (Point B) */}
            {homePoint && (
              <Marker position={[homePoint.lat, homePoint.lon]} icon={homeIcon}>
                <Tooltip permanent direction="top" offset={[0, -22]} className="bg-white/95 text-slate-900 font-bold text-xs px-2.5 py-1 rounded shadow-md border-none">
                  {studentName ? studentName : 'Rumah Siswa'}
                </Tooltip>
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-600 mb-1">Titik Tempat Tinggal (B)</p>
                    <p className="font-semibold text-slate-800">{studentName || 'Calon Siswa'}</p>
                    <p className="text-slate-600 mt-1">{homePoint.display_name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      {homePoint.lat.toFixed(6)}, {homePoint.lon.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Connecting Line Between School and Home */}
            {schoolCoordinate && homePoint && (
              <Polyline
                positions={[
                  [schoolCoordinate.lat, schoolCoordinate.lon],
                  [homePoint.lat, homePoint.lon]
                ]}
                color="#3b82f6"
                weight={3.5}
                dashArray="8, 8"
                opacity={0.85}
              />
            )}

            {/* Multi-Radius Circles centered at School (Tembus Klik agar tidak memblokir Banjar) */}
            {schoolCoordinate &&
              showRadiusRings &&
              activeRadiusList.map((radius, idx) => {
                const colors = RADIUS_COLORS[idx % RADIUS_COLORS.length];
                return (
                  <Circle
                    key={radius}
                    center={[schoolCoordinate.lat, schoolCoordinate.lon]}
                    radius={radius}
                    interactive={false}
                    pathOptions={{
                      color: colors.stroke,
                      fillColor: colors.fill,
                      fillOpacity: 0.04,
                      weight: 2,
                      dashArray: '5, 5',
                      interactive: false
                    }}
                  />
                );
              })}

            {/* Titik Seluruh Banjar / Wilayah di Dalam Radius dengan Tooltips & Area Sentuh Responsif */}
            {showRadiusRings &&
              visibleBanjars.map((bj) => (
                <CircleMarker
                  key={bj.id}
                  center={[bj.lat, bj.lon]}
                  radius={7.5}
                  pane="markerPane"
                  eventHandlers={{
                    click: () => {
                      setSelectedBanjarPopup(bj);
                    }
                  }}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2,
                    fillColor: '#7c3aed',
                    fillOpacity: 0.95
                  }}
                >
                  <Tooltip direction="top" offset={[0, -9]} opacity={0.95}>
                    <div className="text-xs font-sans text-slate-900 py-0.5">
                      <p className="font-bold text-slate-900">{bj.name}</p>
                      <p className="text-[10px] text-slate-500">{bj.village ? `${bj.village}, ` : ''}{bj.subdistrict}</p>
                      <p className="text-[10px] text-purple-700 font-semibold font-mono mt-0.5">
                        Jarak: {Math.round(bj.distanceMeters || 0).toLocaleString('id-ID')} m ({(bj.distanceKm || 0).toFixed(2)} km)
                      </p>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

            {/* Popup Detail Banjar Terpilih (Responsif Klik Langsung maupun Proximity Snap) */}
            {selectedBanjarPopup && (
              <Popup
                position={[selectedBanjarPopup.lat, selectedBanjarPopup.lon]}
                onClose={() => setSelectedBanjarPopup(null)}
                autoPan={true}
              >
                <div className="p-1 min-w-[230px] font-sans">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-2 border-slate-200">
                    <Building className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {selectedBanjarPopup.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {selectedBanjarPopup.village ? `${selectedBanjarPopup.village}, ` : ''}{selectedBanjarPopup.subdistrict}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-900 space-y-1 mb-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-purple-600 font-medium">Jarak ke Sekolah:</span>
                      <span className="font-bold font-mono text-purple-800">
                        {Math.round(selectedBanjarPopup.distanceMeters || 0).toLocaleString('id-ID')} meter
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-purple-500">
                      <span>Jarak Kilometrik:</span>
                      <span className="font-mono font-semibold">
                        {(selectedBanjarPopup.distanceKm || 0).toFixed(2)} km
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setHomePoint({
                        lat: selectedBanjarPopup.lat,
                        lon: selectedBanjarPopup.lon,
                        display_name: `${selectedBanjarPopup.name}, ${selectedBanjarPopup.village ? `${selectedBanjarPopup.village}, ` : ''}${selectedBanjarPopup.subdistrict}, Kota Denpasar`
                      });
                      setHomeAddress(`${selectedBanjarPopup.name}, ${selectedBanjarPopup.subdistrict}`);
                      setSelectedBanjarPopup(null);
                    }}
                    className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Set Sebagai Rumah Siswa</span>
                  </button>
                </div>
              </Popup>
            )}

            <MapViewController schoolPoint={schoolCoordinate} homePoint={homePoint} />
            <MapClickHandler
              isActive={pickingTarget !== null}
              onPick={handleMapPick}
              banjars={showRadiusRings ? visibleBanjars : []}
              onSelectBanjar={(b) => setSelectedBanjarPopup(b)}
            />
          </MapContainer>
        </div>
      </main>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={cn("border rounded-2xl max-w-xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="p-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base">Riwayat Verifikasi Jarak Siswa</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Belum ada riwayat verifikasi yang tersimpan di browser ini.
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className={cn("p-3.5 rounded-xl border flex items-center justify-between gap-4 text-xs transition-colors", isDark ? "bg-slate-950/40 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:border-slate-300")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.studentName}</span>
                        {item.candidateNumber && (
                          <span className="font-mono text-[10px] text-slate-400">NISN: {item.candidateNumber}</span>
                        )}
                      </div>
                      <p className="text-slate-500 truncate">Sekolah: {item.schoolName}</p>
                      <p className="text-slate-500 truncate">Domisili: {item.homeAddress}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(item.distanceMeters).toLocaleString('id-ID')} m ({item.distanceKm.toFixed(2)} km)
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-400">{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadHistoryItem(item)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors"
                      >
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = HistoryStorage.delete(item.id);
                          setHistoryList(updated);
                        }}
                        className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-between border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  HistoryStorage.clearAll();
                  setHistoryList([]);
                }}
                disabled={historyList.length === 0}
                className="text-xs text-red-500 hover:text-red-600 font-semibold disabled:opacity-40"
              >
                Hapus Semua Riwayat
              </button>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Slip Modal (Cetak Bukti Verifikasi Jarak SPMB) */}
      {showPrintModal && distanceData && selectedSchool && homePoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 print:border-none print:shadow-none print:w-full print:max-w-none">
            
            {/* Header Slip */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                  SPMB
                </div>
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wide">
                    Surat Hasil Verifikasi Jarak Udara (Jalur Zonasi)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Sistem Pengukuran Koordinat Geodesik WGS84 Resmi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="print:hidden text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Table */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Nama Calon Siswa</p>
                  <p className="font-bold text-sm text-slate-900">{studentName || 'Calon Siswa'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Nomor Induk / Peserta (NISN)</p>
                  <p className="font-mono font-bold text-sm text-slate-900">{candidateNumber || '-'}</p>
                </div>
              </div>

              <div className="border rounded-xl divide-y border-slate-200">
                <div className="p-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Sekolah Tujuan</span>
                  <span className="font-bold text-right">{selectedSchool.name}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Koordinat Sekolah</span>
                  <span className="font-mono text-right">{selectedSchool.lat.toFixed(6)}, {selectedSchool.lon.toFixed(6)}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Alamat Tempat Tinggal (KK)</span>
                  <span className="font-medium text-right max-w-xs">{homePoint.display_name}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Koordinat Domisili Siswa</span>
                  <span className="font-mono text-right">{homePoint.lat.toFixed(6)}, {homePoint.lon.toFixed(6)}</span>
                </div>
                <div className="p-3.5 bg-blue-50/70 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Jarak Garis Lurus (Udara)</span>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-blue-700">
                      {distanceData.formattedMeters} Meter
                    </span>
                    <span className="text-xs text-slate-500 block">
                      ({distanceData.formattedKm} km)
                    </span>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Status Kelayakan Zonasi</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {zoningStatus?.title}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic leading-relaxed pt-2">
                *Dokumen hasil kalkulasi ini diukur menggunakan model geodesik matematis koordinat bumi WGS84 untuk keperluan verifikasi berkas penerimaan murid baru.
              </div>
            </div>

            {/* Print Buttons */}
            <div className="border-t pt-4 flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={cn("px-6 py-3.5 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors", isDark ? "bg-[#0A0C10] border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-500")}>
        <div className="flex items-center gap-3">
          <span>SkyDist Pro &bull; Versi SPMB & PPDB Zonasi Denpasar</span>
          <span>&bull;</span>
          <span>Datum: WGS84</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Kalkulasi multi-radius zonasi presisi tinggi &bull; Memuat seluruh Banjar, Dusun & Kelurahan Kota Denpasar
        </div>
      </footer>
    </div>
  );
}
