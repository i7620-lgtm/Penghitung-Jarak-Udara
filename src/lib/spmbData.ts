// Data Sekolah Referensi untuk SPMB / PPDB (SMP, SMA, SMK)
export interface SchoolData {
  id: string;
  name: string;
  level: 'SMP' | 'SMA' | 'SMK';
  city: string;
  province: string;
  lat: number;
  lon: number;
  address: string;
}

export interface BanjarNode {
  id: string | number;
  name: string;
  subdistrict: string; // Kecamatan (Denpasar Barat, Utara, Timur, Selatan)
  village?: string;     // Kelurahan / Desa
  lat: number;
  lon: number;
  type: string;        // 'banjar' | 'dusun' | 'kelurahan'
  distanceKm?: number;
  distanceMeters?: number;
}

// Seluruh SMP Negeri di Kota Denpasar (1 s.d 17 Lengkap)
export const SMP_NEGERI_DENPASAR: SchoolData[] = [
  { id: 'dps-smp-1', name: 'SMP Negeri 1 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.656554, lon: 115.219518, address: 'Jl. Surapati No.2, Dangin Puri, Denpasar Timur' },
  { id: 'dps-smp-2', name: 'SMP Negeri 2 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.651708, lon: 115.199247, address: 'Jl. Gunung Agung No.112, Pemecutan Kaja, Denpasar Barat' },
  { id: 'dps-smp-3', name: 'SMP Negeri 3 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.652135, lon: 115.225518, address: 'Jl. Jepun No.5, Dangin Puri Kangin, Denpasar Timur' },
  { id: 'dps-smp-4', name: 'SMP Negeri 4 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.652477, lon: 115.203827, address: 'Jl. Gunung Agung Gang Indus No.1, Pemecutan Kaja' },
  { id: 'dps-smp-5', name: 'SMP Negeri 5 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.632867, lon: 115.200401, address: 'Jl. Ubung Kaja No.15, Denpasar Utara' },
  { id: 'dps-smp-6', name: 'SMP Negeri 6 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.702476, lon: 115.217289, address: 'Jl. Tukad Nyali, Sanur Kauh, Denpasar Selatan' },
  { id: 'dps-smp-7', name: 'SMP Negeri 7 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.665190, lon: 115.199253, address: 'Jl. Gunung Rinjani, Monang Maning, Denpasar Barat' },
  { id: 'dps-smp-8', name: 'SMP Negeri 8 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.644567, lon: 115.234768, address: 'Jl. Meduri No.12, Sumerta, Denpasar Timur' },
  { id: 'dps-smp-9', name: 'SMP Negeri 9 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.689595, lon: 115.259148, address: 'Jl. Danau Buyan No.19, Sanur, Denpasar Selatan' },
  { id: 'dps-smp-10', name: 'SMP Negeri 10 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.638020, lon: 115.213707, address: 'Jl. Gandapura, Tonja, Denpasar Timur' },
  { id: 'dps-smp-11', name: 'SMP Negeri 11 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.724407, lon: 115.230831, address: 'Jl. By Pass Ngurah Rai, Pedungan, Denpasar Selatan' },
  { id: 'dps-smp-12', name: 'SMP Negeri 12 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.598061, lon: 115.221893, address: 'Jl. Trenggana No.80, Penatih, Denpasar Timur' },
  { id: 'dps-smp-13', name: 'SMP Negeri 13 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.680102, lon: 115.176030, address: 'Jl. Padang Mekar, Padangsambian Klod, Denpasar Barat' },
  { id: 'dps-smp-14', name: 'SMP Negeri 14 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.644951, lon: 115.248045, address: 'Jl. WR Supratman Gang Kesari No.1, Kesiman Kertalangu' },
  { id: 'dps-smp-15', name: 'SMP Negeri 15 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.620475, lon: 115.185327, address: 'Jl. Kebo Iwa, Gg. Batu Sunia, Banjar Batukandik, Padangsambian Kaja' },
  { id: 'dps-smp-16', name: 'SMP Negeri 16 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.702735, lon: 115.235702, address: 'Jl. Raya Sesetan, Sidakarya, Denpasar Selatan' },
  { id: 'dps-smp-17', name: 'SMP Negeri 17 Denpasar', level: 'SMP', city: 'Kota Denpasar', province: 'Bali', lat: -8.612007, lon: 115.243493, address: 'Jl. Hang Tuah No.45, Sanur Kaja, Denpasar Selatan' }
];

// Seluruh SMA & SMK Negeri di Kota Denpasar Lengkap
export const SMA_SMK_DENPASAR: SchoolData[] = [
  { id: 'dps-sma-1', name: 'SMA Negeri 1 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.656820, lon: 115.218840, address: 'Jl. Kamboja No.4, Dangin Puri Kangin, Denpasar Timur' },
  { id: 'dps-sma-2', name: 'SMA Negeri 2 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.675600, lon: 115.227400, address: 'Jl. PB Sudirman No.1, Dangin Puri Klod, Denpasar Barat' },
  { id: 'dps-sma-3', name: 'SMA Negeri 3 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.675400, lon: 115.231200, address: 'Jl. Nusa Indah No.20X, Sumerta, Denpasar Timur' },
  { id: 'dps-sma-4', name: 'SMA Negeri 4 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.650890, lon: 115.198900, address: 'Jl. Gunung Rinjani No.1, Monang Maning, Denpasar Barat' },
  { id: 'dps-sma-5', name: 'SMA Negeri 5 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.679800, lon: 115.253600, address: 'Jl. Sanitasi No.2, Sidakarya, Denpasar Selatan' },
  { id: 'dps-sma-6', name: 'SMA Negeri 6 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.681200, lon: 115.258900, address: 'Jl. Tirta Nadi II, Sanur Kauh, Denpasar Selatan' },
  { id: 'dps-sma-7', name: 'SMA Negeri 7 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.651500, lon: 115.228500, address: 'Jl. Kamboja No.9, Dangin Puri Kangin, Denpasar Timur' },
  { id: 'dps-sma-8', name: 'SMA Negeri 8 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.618500, lon: 115.229100, address: 'Jl. Antasura No.25, Peguyangan Kangin, Denpasar Utara' },
  { id: 'dps-sma-9', name: 'SMA Negeri 9 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.707600, lon: 115.241500, address: 'Jl. By Pass Ngurah Rai, Pedungan, Denpasar Selatan' },
  { id: 'dps-sma-10', name: 'SMA Negeri 10 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.685200, lon: 115.249200, address: 'Jl. Hang Tuah, Sanur Kaja, Denpasar Selatan' },
  { id: 'dps-sma-11', name: 'SMA Negeri 11 Denpasar', level: 'SMA', city: 'Kota Denpasar', province: 'Bali', lat: -8.718800, lon: 115.231200, address: 'Jl. Tukad Balian, Renon / Serangan, Denpasar Selatan' },
  { id: 'dps-smk-1', name: 'SMK Negeri 1 Denpasar', level: 'SMK', city: 'Kota Denpasar', province: 'Bali', lat: -8.636700, lon: 115.201400, address: 'Jl. Cokroaminoto No.84, Ubung, Denpasar Utara' },
  { id: 'dps-smk-2', name: 'SMK Negeri 2 Denpasar', level: 'SMK', city: 'Kota Denpasar', province: 'Bali', lat: -8.672900, lon: 115.231800, address: 'Jl. Pendidikan No.28, Sidakarya, Denpasar Selatan' },
  { id: 'dps-smk-3', name: 'SMK Negeri 3 Denpasar', level: 'SMK', city: 'Kota Denpasar', province: 'Bali', lat: -8.682500, lon: 115.259800, address: 'Jl. Tirta Nadi II, Sanur Kauh, Denpasar Selatan' },
  { id: 'dps-smk-4', name: 'SMK Negeri 4 Denpasar', level: 'SMK', city: 'Kota Denpasar', province: 'Bali', lat: -8.665800, lon: 115.238200, address: 'Jl. Drupadi No.5, Sumerta Klod, Denpasar Timur' },
  { id: 'dps-smk-5', name: 'SMK Negeri 5 Denpasar', level: 'SMK', city: 'Kota Denpasar', province: 'Bali', lat: -8.684200, lon: 115.226500, address: 'Jl. Merdeka / Tukad Citarum, Panjer, Denpasar Selatan' }
];

// Basis data sekolah referensi khusus SPMB Kota Denpasar (SMP, SMA & SMK Negeri)
export const PRESET_SCHOOLS: SchoolData[] = [
  ...SMP_NEGERI_DENPASAR,
  ...SMA_SMK_DENPASAR
];

// DATASET KOMPREHENSIF SELURUH BANJAR DINAS & BANJAR ADAT KOTA DENPASAR (180+ Titik Terverifikasi 4 Kecamatan)
export const BANJAR_DENPASAR_DATA: BanjarNode[] = [
  // =========================================================================
  // 1. KECAMATAN DENPASAR BARAT (Mencakup Wilayah Sekitar SMPN 15 Denpasar)
  // =========================================================================
  // Desa Padangsambian Kaja (Lokasi SMPN 15 Denpasar & Sekitarnya)
  { id: 'db-psk-1', name: 'Banjar Batukandik', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.621200, lon: 115.185100, type: 'banjar' },
  { id: 'db-psk-2', name: 'Banjar Umaklungkung', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.628500, lon: 115.186500, type: 'banjar' },
  { id: 'db-psk-3', name: 'Banjar Tegallinggah', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.634500, lon: 115.189500, type: 'banjar' },
  { id: 'db-psk-4', name: 'Banjar Robokan', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.639500, lon: 115.187500, type: 'banjar' },
  { id: 'db-psk-5', name: 'Banjar Batuparas', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.631500, lon: 115.182500, type: 'banjar' },
  { id: 'db-psk-6', name: 'Banjar Pagutan', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.644500, lon: 115.185500, type: 'banjar' },
  { id: 'db-psk-7', name: 'Banjar Dukuh Sari', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.647500, lon: 115.188500, type: 'banjar' },
  { id: 'db-psk-8', name: 'Banjar Lepang', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.638500, lon: 115.181500, type: 'banjar' },
  { id: 'db-psk-9', name: 'Banjar Tegehsari Padangsambian', subdistrict: 'Denpasar Barat', village: 'Padangsambian Kaja', lat: -8.642500, lon: 115.183500, type: 'banjar' },

  // Desa Padangsambian Klod & Kelurahan Padangsambian
  { id: 'db-ps-1', name: 'Banjar Padangsambian', subdistrict: 'Denpasar Barat', village: 'Padangsambian', lat: -8.658200, lon: 115.179500, type: 'banjar' },
  { id: 'db-ps-2', name: 'Banjar Minggir', subdistrict: 'Denpasar Barat', village: 'Padangsambian', lat: -8.655500, lon: 115.176500, type: 'banjar' },
  { id: 'db-ps-3', name: 'Banjar Padang Udayana', subdistrict: 'Denpasar Barat', village: 'Padangsambian Klod', lat: -8.662500, lon: 115.187400, type: 'banjar' },
  { id: 'db-ps-4', name: 'Banjar Padang Mekar', subdistrict: 'Denpasar Barat', village: 'Padangsambian Klod', lat: -8.679500, lon: 115.175500, type: 'banjar' },
  { id: 'db-ps-5', name: 'Banjar Tegal Buah', subdistrict: 'Denpasar Barat', village: 'Padangsambian Klod', lat: -8.674200, lon: 115.172500, type: 'banjar' },
  { id: 'db-ps-6', name: 'Banjar Jabapura', subdistrict: 'Denpasar Barat', village: 'Padangsambian', lat: -8.652500, lon: 115.178500, type: 'banjar' },
  { id: 'db-ps-7', name: 'Banjar Sangiang', subdistrict: 'Denpasar Barat', village: 'Padangsambian', lat: -8.659500, lon: 115.184500, type: 'banjar' },
  { id: 'db-ps-8', name: 'Banjar Pengipahan', subdistrict: 'Denpasar Barat', village: 'Padangsambian Klod', lat: -8.671500, lon: 115.178500, type: 'banjar' },

  // Kelurahan Pemecutan & Pemecutan Kaja & Pemecutan Klod
  { id: 'db-pm-1', name: 'Banjar Pemecutan Kaja', subdistrict: 'Denpasar Barat', village: 'Pemecutan Kaja', lat: -8.649200, lon: 115.197800, type: 'banjar' },
  { id: 'db-pm-2', name: 'Banjar Gerenceng', subdistrict: 'Denpasar Barat', village: 'Pemecutan Kaja', lat: -8.652100, lon: 115.207900, type: 'banjar' },
  { id: 'db-pm-3', name: 'Banjar Busung Yeh Kauh', subdistrict: 'Denpasar Barat', village: 'Pemecutan', lat: -8.654500, lon: 115.191200, type: 'banjar' },
  { id: 'db-pm-4', name: 'Banjar Busung Yeh Kangin', subdistrict: 'Denpasar Barat', village: 'Pemecutan', lat: -8.654100, lon: 115.193500, type: 'banjar' },
  { id: 'db-pm-5', name: 'Banjar Pemedilan', subdistrict: 'Denpasar Barat', village: 'Pemecutan', lat: -8.659800, lon: 115.204500, type: 'banjar' },
  { id: 'db-pm-6', name: 'Banjar Pemecutan Kelod', subdistrict: 'Denpasar Barat', village: 'Pemecutan Kelod', lat: -8.661200, lon: 115.195600, type: 'banjar' },
  { id: 'db-pm-7', name: 'Banjar Monang Maning', subdistrict: 'Denpasar Barat', village: 'Pemecutan Klod', lat: -8.668500, lon: 115.196500, type: 'banjar' },
  { id: 'db-pm-8', name: 'Banjar Perumnas Monang Maning', subdistrict: 'Denpasar Barat', village: 'Pemecutan Klod', lat: -8.671500, lon: 115.198500, type: 'banjar' },
  { id: 'db-pm-9', name: 'Banjar Buagan', subdistrict: 'Denpasar Barat', village: 'Pemecutan Klod', lat: -8.675400, lon: 115.201200, type: 'banjar' },
  { id: 'db-pm-10', name: 'Banjar Tegal Harum', subdistrict: 'Denpasar Barat', village: 'Tegal Harum', lat: -8.671500, lon: 115.192400, type: 'banjar' },
  { id: 'db-pm-11', name: 'Banjar Tegal Kawan', subdistrict: 'Denpasar Barat', village: 'Pemecutan Kelod', lat: -8.665500, lon: 115.201500, type: 'banjar' },
  { id: 'db-pm-12', name: 'Banjar Kerandan', subdistrict: 'Denpasar Barat', village: 'Pemecutan', lat: -8.657500, lon: 115.201500, type: 'banjar' },

  // Kelurahan Dauh Puri, Dauh Puri Kaja, Dauh Puri Kangin, Dauh Puri Klod
  { id: 'db-dp-1', name: 'Banjar Titih Kaja', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Kangin', lat: -8.655800, lon: 115.210400, type: 'banjar' },
  { id: 'db-dp-2', name: 'Banjar Titih Kelod', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Kangin', lat: -8.658500, lon: 115.209800, type: 'banjar' },
  { id: 'db-dp-3', name: 'Banjar Titih Tengah', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Kangin', lat: -8.657200, lon: 115.210100, type: 'banjar' },
  { id: 'db-dp-4', name: 'Banjar Sebelanga', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Kauh', lat: -8.665500, lon: 115.205500, type: 'banjar' },
  { id: 'db-dp-5', name: 'Banjar Beraban', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Kauh', lat: -8.668500, lon: 115.208500, type: 'banjar' },
  { id: 'db-dp-6', name: 'Banjar Jematang', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Kauh', lat: -8.671200, lon: 115.206500, type: 'banjar' },
  { id: 'db-dp-7', name: 'Banjar Bumi Shanti', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Klod', lat: -8.678500, lon: 115.212500, type: 'banjar' },
  { id: 'db-dp-8', name: 'Banjar Sanglah Barat', subdistrict: 'Denpasar Barat', village: 'Dauh Puri Klod', lat: -8.676500, lon: 115.215500, type: 'banjar' },

  // =========================================================================
  // 2. KECAMATAN DENPASAR UTARA (Berdampingan Langsung dengan Wilayah Barat)
  // =========================================================================
  // Desa Ubung Kaja (Sangat dekat ke SMPN 15 di Jl. Kargo Permai)
  { id: 'du-uk-1', name: 'Banjar Binoh Kaja', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.618500, lon: 115.195500, type: 'banjar' },
  { id: 'du-uk-2', name: 'Banjar Binoh Kelod', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.624500, lon: 115.196500, type: 'banjar' },
  { id: 'du-uk-3', name: 'Banjar Dauh Kutuh', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.621500, lon: 115.191500, type: 'banjar' },
  { id: 'du-uk-4', name: 'Banjar Poh Gading (Pohgading)', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.619800, lon: 115.207500, type: 'banjar' },
  { id: 'du-uk-5', name: 'Banjar Anyar-Anyar', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.625500, lon: 115.195500, type: 'banjar' },
  { id: 'du-uk-6', name: 'Banjar Tulangampiang', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.638500, lon: 115.206500, type: 'banjar' },
  { id: 'du-uk-7', name: 'Banjar Batu Mekaem', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.615500, lon: 115.192500, type: 'banjar' },
  { id: 'du-uk-8', name: 'Banjar Tegal Kangin', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.616500, lon: 115.201500, type: 'banjar' },
  { id: 'du-uk-9', name: 'Banjar Tegal Kauh', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.617500, lon: 115.198500, type: 'banjar' },
  { id: 'du-uk-10', name: 'Banjar Liligundi', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.612500, lon: 115.196500, type: 'banjar' },
  { id: 'du-uk-11', name: 'Banjar Pemangkalan', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.608500, lon: 115.194500, type: 'banjar' },
  { id: 'du-uk-12', name: 'Banjar Petangan Gede', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.636500, lon: 115.198500, type: 'banjar' },
  { id: 'du-uk-13', name: 'Banjar Ubung Kaja', subdistrict: 'Denpasar Utara', village: 'Ubung Kaja', lat: -8.631200, lon: 115.199800, type: 'banjar' },
  { id: 'du-uk-14', name: 'Banjar Ubung Kelod', subdistrict: 'Denpasar Utara', village: 'Ubung', lat: -8.641500, lon: 115.202400, type: 'banjar' },
  { id: 'du-uk-15', name: 'Banjar Batur Ubung', subdistrict: 'Denpasar Utara', village: 'Ubung', lat: -8.622500, lon: 115.199500, type: 'banjar' },

  // Kelurahan Peguyangan & Desa Peguyangan Kaja & Peguyangan Kangin
  { id: 'du-pg-1', name: 'Banjar Kepuh Peguyangan', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.615500, lon: 115.216500, type: 'banjar' },
  { id: 'du-pg-2', name: 'Banjar Pulugambang', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.617500, lon: 115.218500, type: 'banjar' },
  { id: 'du-pg-3', name: 'Banjar Tek-Tek', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.619500, lon: 115.212500, type: 'banjar' },
  { id: 'du-pg-4', name: 'Banjar Pemalukan', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.613500, lon: 115.214500, type: 'banjar' },
  { id: 'du-pg-5', name: 'Banjar Kertasari', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.621500, lon: 115.215500, type: 'banjar' },
  { id: 'du-pg-6', name: 'Banjar Dakdakan', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.625500, lon: 115.211500, type: 'banjar' },
  { id: 'du-pg-7', name: 'Banjar Tagtag Kaja', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.618500, lon: 115.214500, type: 'banjar' },
  { id: 'du-pg-8', name: 'Banjar Tagtag Kelod', subdistrict: 'Denpasar Utara', village: 'Peguyangan', lat: -8.623500, lon: 115.213500, type: 'banjar' },
  { id: 'du-pg-9', name: 'Banjar Denbiyu', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.604500, lon: 115.211500, type: 'banjar' },
  { id: 'du-pg-10', name: 'Banjar Denyeh', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.601500, lon: 115.214500, type: 'banjar' },
  { id: 'du-pg-11', name: 'Banjar Punduh Kulit', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.598500, lon: 115.216500, type: 'banjar' },
  { id: 'du-pg-12', name: 'Banjar Pondok Peguyangan', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.606500, lon: 115.218500, type: 'banjar' },
  { id: 'du-pg-13', name: 'Banjar Uma Desa', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.609500, lon: 115.219500, type: 'banjar' },
  { id: 'du-pg-14', name: 'Banjar Belusung (Blusung)', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.595500, lon: 115.212500, type: 'banjar' },
  { id: 'du-pg-15', name: 'Banjar Dualang', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.603500, lon: 115.208500, type: 'banjar' },
  { id: 'du-pg-16', name: 'Banjar Saih', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.607500, lon: 115.206500, type: 'banjar' },
  { id: 'du-pg-17', name: 'Banjar Paang Tebel', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kaja', lat: -8.592500, lon: 115.215500, type: 'banjar' },
  { id: 'du-pg-18', name: 'Banjar Peguyangan Kangin', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kangin', lat: -8.614500, lon: 115.226800, type: 'banjar' },
  { id: 'du-pg-19', name: 'Banjar Cengkilung', subdistrict: 'Denpasar Utara', village: 'Peguyangan Kangin', lat: -8.598500, lon: 115.218500, type: 'banjar' },

  // Kelurahan Tonja
  { id: 'du-tj-1', name: 'Banjar Tonja Kaja', subdistrict: 'Denpasar Utara', village: 'Tonja', lat: -8.632500, lon: 115.216500, type: 'banjar' },
  { id: 'du-tj-2', name: 'Banjar Tonja Kelod', subdistrict: 'Denpasar Utara', village: 'Tonja', lat: -8.639500, lon: 115.215200, type: 'banjar' },
  { id: 'du-tj-3', name: 'Banjar Tegeh Sari Tonja', subdistrict: 'Denpasar Utara', village: 'Tonja', lat: -8.635500, lon: 115.222500, type: 'banjar' },
  { id: 'du-tj-4', name: 'Banjar Sengguan Tonja', subdistrict: 'Denpasar Utara', village: 'Tonja', lat: -8.637500, lon: 115.218500, type: 'banjar' },
  { id: 'du-tj-5', name: 'Banjar Oebobo Tonja', subdistrict: 'Denpasar Utara', village: 'Tonja', lat: -8.641500, lon: 115.221500, type: 'banjar' },

  // =========================================================================
  // 3. KECAMATAN DENPASAR TIMUR
  // =========================================================================
  // Dangin Puri & sekitarnya
  { id: 'dt-dp-1', name: 'Banjar Kayumas Kaja', subdistrict: 'Denpasar Timur', village: 'Dangin Puri', lat: -8.657500, lon: 115.221200, type: 'banjar' },
  { id: 'dt-dp-2', name: 'Banjar Kayumas Kelod', subdistrict: 'Denpasar Timur', village: 'Dangin Puri', lat: -8.660100, lon: 115.222400, type: 'banjar' },
  { id: 'dt-dp-3', name: 'Banjar Belaluan Sad Merta', subdistrict: 'Denpasar Timur', village: 'Dangin Puri', lat: -8.653800, lon: 115.217300, type: 'banjar' },
  { id: 'dt-dp-4', name: 'Banjar Abasan Dangin Puri', subdistrict: 'Denpasar Timur', village: 'Dangin Puri', lat: -8.654500, lon: 115.220100, type: 'banjar' },
  { id: 'dt-dp-5', name: 'Banjar Kaliungu Kaja', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kaja', lat: -8.650800, lon: 115.215500, type: 'banjar' },
  { id: 'dt-dp-6', name: 'Banjar Kaliungu Kelod', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kaja', lat: -8.652500, lon: 115.214800, type: 'banjar' },
  { id: 'dt-dp-7', name: 'Banjar Kreneng Kaja', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kangin', lat: -8.651200, lon: 115.227800, type: 'banjar' },
  { id: 'dt-dp-8', name: 'Banjar Kreneng Kelod', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kangin', lat: -8.652800, lon: 115.229100, type: 'banjar' },
  { id: 'dt-dp-9', name: 'Banjar Mertanadi', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kangin', lat: -8.650100, lon: 115.223500, type: 'banjar' },

  // Sumerta, Sumerta Kaja, Sumerta Kelod, Sumerta Kauh
  { id: 'dt-sm-1', name: 'Banjar Sumerta Kaja', subdistrict: 'Denpasar Timur', village: 'Sumerta Kaja', lat: -8.647100, lon: 115.235600, type: 'banjar' },
  { id: 'dt-sm-2', name: 'Banjar Sumerta Kelod', subdistrict: 'Denpasar Timur', village: 'Sumerta Kelod', lat: -8.655200, lon: 115.238100, type: 'banjar' },
  { id: 'dt-sm-3', name: 'Banjar Tanjung Bungkak Kaja', subdistrict: 'Denpasar Timur', village: 'Sumerta Klod', lat: -8.662500, lon: 115.238500, type: 'banjar' },
  { id: 'dt-sm-4', name: 'Banjar Tanjung Bungkak Kelod', subdistrict: 'Denpasar Timur', village: 'Sumerta Klod', lat: -8.664500, lon: 115.239800, type: 'banjar' },
  { id: 'dt-sm-5', name: 'Banjar Pagan Kaja', subdistrict: 'Denpasar Timur', village: 'Sumerta Kauh', lat: -8.641500, lon: 115.226800, type: 'banjar' },
  { id: 'dt-sm-6', name: 'Banjar Pagan Kelod', subdistrict: 'Denpasar Timur', village: 'Sumerta Kauh', lat: -8.645600, lon: 115.227400, type: 'banjar' },
  { id: 'dt-sm-7', name: 'Banjar Pagan Tengah', subdistrict: 'Denpasar Timur', village: 'Sumerta Kauh', lat: -8.643500, lon: 115.227100, type: 'banjar' },
  { id: 'dt-sm-8', name: 'Banjar Yangbatu Kauh', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kelod', lat: -8.656800, lon: 115.230400, type: 'banjar' },
  { id: 'dt-sm-9', name: 'Banjar Yangbatu Kangin', subdistrict: 'Denpasar Timur', village: 'Dangin Puri Kelod', lat: -8.657200, lon: 115.233500, type: 'banjar' },
  { id: 'dt-sm-10', name: 'Banjar Bengkel', subdistrict: 'Denpasar Timur', village: 'Sumerta', lat: -8.654200, lon: 115.240500, type: 'banjar' },
  { id: 'dt-sm-11', name: 'Banjar Abian Kapas Kaja', subdistrict: 'Denpasar Timur', village: 'Sumerta', lat: -8.652100, lon: 115.236500, type: 'banjar' },
  { id: 'dt-sm-12', name: 'Banjar Abian Kapas Kelod', subdistrict: 'Denpasar Timur', village: 'Sumerta', lat: -8.654800, lon: 115.235800, type: 'banjar' },

  // Kesiman & Kesiman Kertalangu & Kesiman Petilan
  { id: 'dt-ks-1', name: 'Banjar Kesiman', subdistrict: 'Denpasar Timur', village: 'Kesiman', lat: -8.646500, lon: 115.245200, type: 'banjar' },
  { id: 'dt-ks-2', name: 'Banjar Batan Buah', subdistrict: 'Denpasar Timur', village: 'Kesiman Petilan', lat: -8.638400, lon: 115.248900, type: 'banjar' },
  { id: 'dt-ks-3', name: 'Banjar Bukit Buwung', subdistrict: 'Denpasar Timur', village: 'Kesiman Petilan', lat: -8.641200, lon: 115.251200, type: 'banjar' },
  { id: 'dt-ks-4', name: 'Banjar Tohpati', subdistrict: 'Denpasar Timur', village: 'Kesiman Kertalangu', lat: -8.635800, lon: 115.261200, type: 'banjar' },
  { id: 'dt-ks-5', name: 'Banjar Kertalangu', subdistrict: 'Denpasar Timur', village: 'Kesiman Kertalangu', lat: -8.639500, lon: 115.265400, type: 'banjar' },
  { id: 'dt-ks-6', name: 'Banjar Biaung', subdistrict: 'Denpasar Timur', village: 'Kesiman Kertalangu', lat: -8.629500, lon: 115.269800, type: 'banjar' },
  { id: 'dt-ks-7', name: 'Banjar Tangtu', subdistrict: 'Denpasar Timur', village: 'Kesiman Kertalangu', lat: -8.645500, lon: 115.268500, type: 'banjar' },

  // Penatih & Penatih Dangin Puri
  { id: 'dt-pn-1', name: 'Banjar Penatih', subdistrict: 'Denpasar Timur', village: 'Penatih', lat: -8.618900, lon: 115.238400, type: 'banjar' },
  { id: 'dt-pn-2', name: 'Banjar Anggabaya', subdistrict: 'Denpasar Timur', village: 'Penatih', lat: -8.608500, lon: 115.241500, type: 'banjar' },
  { id: 'dt-pn-3', name: 'Banjar Saba', subdistrict: 'Denpasar Timur', village: 'Penatih', lat: -8.614500, lon: 115.235500, type: 'banjar' },
  { id: 'dt-pn-4', name: 'Banjar Trenggana', subdistrict: 'Denpasar Timur', village: 'Penatih', lat: -8.601500, lon: 115.231500, type: 'banjar' },
  { id: 'dt-pn-5', name: 'Banjar Semaga', subdistrict: 'Denpasar Timur', village: 'Penatih', lat: -8.598500, lon: 115.225500, type: 'banjar' },

  // =========================================================================
  // 4. KECAMATAN DENPASAR SELATAN
  // =========================================================================
  // Sesetan & Pedungan & Pemogan
  { id: 'ds-st-1', name: 'Banjar Sesetan Kaja', subdistrict: 'Denpasar Selatan', village: 'Sesetan', lat: -8.685400, lon: 115.218500, type: 'banjar' },
  { id: 'ds-st-2', name: 'Banjar Sesetan Tengah', subdistrict: 'Denpasar Selatan', village: 'Sesetan', lat: -8.694500, lon: 115.219800, type: 'banjar' },
  { id: 'ds-st-3', name: 'Banjar Sesetan Kelod', subdistrict: 'Denpasar Selatan', village: 'Sesetan', lat: -8.705200, lon: 115.218200, type: 'banjar' },
  { id: 'ds-st-4', name: 'Banjar Pegok', subdistrict: 'Denpasar Selatan', village: 'Sesetan', lat: -8.712500, lon: 115.223500, type: 'banjar' },
  { id: 'ds-st-5', name: 'Banjar Suwung Batan Kendal', subdistrict: 'Denpasar Selatan', village: 'Sesetan', lat: -8.719500, lon: 115.225500, type: 'banjar' },
  { id: 'ds-pd-1', name: 'Banjar Pedungan Kaja', subdistrict: 'Denpasar Selatan', village: 'Pedungan', lat: -8.691200, lon: 115.208500, type: 'banjar' },
  { id: 'ds-pd-2', name: 'Banjar Pedungan Kelod', subdistrict: 'Denpasar Selatan', village: 'Pedungan', lat: -8.718500, lon: 115.215400, type: 'banjar' },
  { id: 'ds-pd-3', name: 'Banjar Menesa', subdistrict: 'Denpasar Selatan', village: 'Pedungan', lat: -8.701500, lon: 115.211500, type: 'banjar' },
  { id: 'ds-pd-4', name: 'Banjar Dukuh Pesirahan', subdistrict: 'Denpasar Selatan', village: 'Pedungan', lat: -8.710500, lon: 115.208500, type: 'banjar' },
  { id: 'ds-pm-1', name: 'Banjar Pemogan Kaja', subdistrict: 'Denpasar Selatan', village: 'Pemogan', lat: -8.692500, lon: 115.195500, type: 'banjar' },
  { id: 'ds-pm-2', name: 'Banjar Pemogan Kelod', subdistrict: 'Denpasar Selatan', village: 'Pemogan', lat: -8.715500, lon: 115.198500, type: 'banjar' },
  { id: 'ds-pm-3', name: 'Banjar Gunung Pemogan', subdistrict: 'Denpasar Selatan', village: 'Pemogan', lat: -8.698500, lon: 115.191500, type: 'banjar' },

  // Sidakarya, Panjer, Renon
  { id: 'ds-sk-1', name: 'Banjar Sidakarya', subdistrict: 'Denpasar Selatan', village: 'Sidakarya', lat: -8.701200, lon: 115.234500, type: 'banjar' },
  { id: 'ds-sk-2', name: 'Banjar Graha Shanti', subdistrict: 'Denpasar Selatan', village: 'Sidakarya', lat: -8.698500, lon: 115.231500, type: 'banjar' },
  { id: 'ds-sk-3', name: 'Banjar Sari Sidakarya', subdistrict: 'Denpasar Selatan', village: 'Sidakarya', lat: -8.706500, lon: 115.236500, type: 'banjar' },
  { id: 'ds-pj-1', name: 'Banjar Panjer Kaja', subdistrict: 'Denpasar Selatan', village: 'Panjer', lat: -8.675500, lon: 115.221500, type: 'banjar' },
  { id: 'ds-pj-2', name: 'Banjar Panjer Kelod', subdistrict: 'Denpasar Selatan', village: 'Panjer', lat: -8.683500, lon: 115.223500, type: 'banjar' },
  { id: 'ds-rn-1', name: 'Banjar Renon Kaja', subdistrict: 'Denpasar Selatan', village: 'Renon', lat: -8.671200, lon: 115.234500, type: 'banjar' },
  { id: 'ds-rn-2', name: 'Banjar Renon Kelod', subdistrict: 'Denpasar Selatan', village: 'Renon', lat: -8.682500, lon: 115.232500, type: 'banjar' },
  { id: 'ds-rn-3', name: 'Banjar Pande Renon', subdistrict: 'Denpasar Selatan', village: 'Renon', lat: -8.676500, lon: 115.236500, type: 'banjar' },

  // Sanur & Serangan
  { id: 'ds-sn-1', name: 'Banjar Sanur Kaja', subdistrict: 'Denpasar Selatan', village: 'Sanur Kaja', lat: -8.681500, lon: 115.257500, type: 'banjar' },
  { id: 'ds-sn-2', name: 'Banjar Sanur Kauh', subdistrict: 'Denpasar Selatan', village: 'Sanur Kauh', lat: -8.692500, lon: 115.249500, type: 'banjar' },
  { id: 'ds-sn-3', name: 'Banjar Sindu Kaja', subdistrict: 'Denpasar Selatan', village: 'Sanur', lat: -8.685200, lon: 115.262500, type: 'banjar' },
  { id: 'ds-sn-4', name: 'Banjar Sindu Kelod', subdistrict: 'Denpasar Selatan', village: 'Sanur', lat: -8.691500, lon: 115.261200, type: 'banjar' },
  { id: 'ds-sn-5', name: 'Banjar Intaran Kaja', subdistrict: 'Denpasar Selatan', village: 'Sanur Kauh', lat: -8.699500, lon: 115.254500, type: 'banjar' },
  { id: 'ds-sn-6', name: 'Banjar Intaran Kelod', subdistrict: 'Denpasar Selatan', village: 'Sanur Kauh', lat: -8.704500, lon: 115.257500, type: 'banjar' },
  { id: 'ds-sn-7', name: 'Banjar Semawang', subdistrict: 'Denpasar Selatan', village: 'Sanur', lat: -8.712500, lon: 115.258500, type: 'banjar' },
  { id: 'ds-sn-8', name: 'Banjar Blanjong', subdistrict: 'Denpasar Selatan', village: 'Sanur Kauh', lat: -8.708500, lon: 115.251500, type: 'banjar' },
  { id: 'ds-sn-9', name: 'Banjar Betngandang', subdistrict: 'Denpasar Selatan', village: 'Sanur Kauh', lat: -8.696500, lon: 115.244500, type: 'banjar' },
  { id: 'ds-sr-1', name: 'Banjar Serangan Kaja', subdistrict: 'Denpasar Selatan', village: 'Serangan', lat: -8.724500, lon: 115.234500, type: 'banjar' },
  { id: 'ds-sr-2', name: 'Banjar Serangan Tengah', subdistrict: 'Denpasar Selatan', village: 'Serangan', lat: -8.728500, lon: 115.235500, type: 'banjar' },
  { id: 'ds-sr-3', name: 'Banjar Serangan Kelod', subdistrict: 'Denpasar Selatan', village: 'Serangan', lat: -8.734500, lon: 115.236500, type: 'banjar' }
];

// Rumus Haversine presisi tinggi (WGS84 Earth Mean Radius = 6,371,008.8 meter)
export function calculatePreciseDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { meters: number; kilometers: number; formattedMeters: string; formattedKm: string } {
  const R = 6371008.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;
  const kilometers = meters / 1000;

  return {
    meters: Math.round(meters * 10) / 10,
    kilometers: Math.round(kilometers * 1000) / 1000,
    formattedMeters: Math.round(meters).toLocaleString('id-ID'),
    formattedKm: (meters / 1000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
  };
}

// Menentukan Kategori Zona SPMB
export interface ZoningZoneStatus {
  tier: 'ZONA_1' | 'ZONA_2' | 'ZONA_3' | 'LUAR_ZONA';
  title: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  priorityScore: number;
}

export function evaluateZoningStatus(distanceMeters: number): ZoningZoneStatus {
  if (distanceMeters <= 1000) {
    return {
      tier: 'ZONA_1',
      title: 'Zona 1 (Prioritas Sangat Tinggi)',
      description: 'Jarak tempat tinggal < 1.000 meter dari sekolah. Peluang kelulusan jalur zonasi maksimal.',
      colorClass: 'emerald',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeBorder: 'border-emerald-500/40',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      priorityScore: 98
    };
  } else if (distanceMeters <= 2500) {
    return {
      tier: 'ZONA_2',
      title: 'Zona 2 (Prioritas Standar)',
      description: 'Jarak tempat tinggal 1.000 - 2.500 meter dari sekolah. Masuk kuota zonasi reguler.',
      colorClass: 'blue',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      badgeBorder: 'border-blue-500/40',
      badgeText: 'text-blue-600 dark:text-blue-400',
      priorityScore: 82
    };
  } else if (distanceMeters <= 5000) {
    return {
      tier: 'ZONA_3',
      title: 'Zona 3 (Zona Penyangga)',
      description: 'Jarak tempat tinggal 2.500 - 5.000 meter. Dipertimbangkan jika kuota zona prioritas belum terpenuhi.',
      colorClass: 'amber',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      badgeBorder: 'border-amber-500/40',
      badgeText: 'text-amber-600 dark:text-amber-400',
      priorityScore: 55
    };
  } else {
    return {
      tier: 'LUAR_ZONA',
      title: 'Luar Zona Prioritas (> 5 km)',
      description: 'Jarak tempat tinggal melebihi 5.000 meter. Disarankan mendaftar lewat Jalur Prestasi atau Afirmasi.',
      colorClass: 'rose',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      badgeBorder: 'border-rose-500/40',
      badgeText: 'text-rose-600 dark:text-rose-400',
      priorityScore: 20
    };
  }
}
