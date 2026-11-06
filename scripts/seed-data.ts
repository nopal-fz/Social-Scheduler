import type { CalendarPostStatus } from "../lib/calendar/types";
import type { Platform } from "../lib/db/schema";

export type SeedAccount = {
  key: string;
  platform: Platform;
  externalId: string;
  handle: string;
  needsReconnect?: boolean;
};

export type SeedPost = {
  day: number;
  time: string;
  targets: string[];
  status: CalendarPostStatus;
  caption: string;
  error?: string;
};

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    key: "threads",
    platform: "threads",
    externalId: "seed-threads-naufal",
    handle: "@naufal.core",
  },
  {
    key: "ig",
    platform: "instagram",
    externalId: "seed-instagram-naufal",
    handle: "@naufal.core",
  },
  {
    key: "ig2",
    platform: "instagram",
    externalId: "seed-instagram-studio",
    handle: "@studio.kecil",
  },
  {
    key: "tiktok",
    platform: "tiktok",
    externalId: "seed-tiktok-naufal",
    handle: "@naufal.core",
    needsReconnect: true,
  },
];

export const SEED_POSTS: SeedPost[] = [
  { day: 0, time: "08:30", targets: ["threads"], status: "published", caption: "Tiga hal yang saya pelajari waktu pindah ke Next.js." },
  { day: 0, time: "12:00", targets: ["threads", "ig"], status: "scheduled", caption: "Behind the desk, minggu ini." },
  { day: 0, time: "19:30", targets: ["tiktok"], status: "failed", caption: "Potongan proses bikin konten minggu ini.", error: "Token TikTok kedaluwarsa. Sambungkan ulang akun, lalu coba lagi." },
  { day: 1, time: "09:00", targets: ["threads"], status: "published", caption: "Catatan rilis 0.4: kalender, retry, token." },
  { day: 1, time: "13:30", targets: ["ig"], status: "scheduled", caption: "Reel: 3 alat yang bikin kerja lebih cepat." },
  { day: 1, time: "18:00", targets: ["threads", "ig"], status: "scheduled", caption: "Kenapa saya berhenti posting tiap hari." },
  { day: 2, time: "07:30", targets: ["threads"], status: "published", caption: "Rangkuman minggu: 3 platform, 21 post." },
  { day: 2, time: "13:00", targets: ["ig", "tiktok"], status: "scheduled", caption: "Carousel: alur kerja dari brief sampai terbit." },
  { day: 2, time: "16:00", targets: ["ig2"], status: "scheduled", caption: "Studio kecil, proses panjang." },
  { day: 3, time: "10:00", targets: ["threads"], status: "published", caption: "Satu jam di meja, tiga ide." },
  { day: 3, time: "14:05", targets: ["ig"], status: "publishing", caption: "Reel: sebelum dan sesudah pindah ke scheduler." },
  { day: 3, time: "15:30", targets: ["threads", "ig"], status: "scheduled", caption: "Proses pindah dari spreadsheet ke scheduler: apa yang berubah, apa yang masih manual, dan kenapa saya tidak buru-buru menambah platform baru." },
  { day: 4, time: "09:30", targets: ["tiktok"], status: "scheduled", caption: "Video: jawab tiga pertanyaan paling sering." },
  { day: 4, time: "08:00", targets: ["threads", "ig", "tiktok"], status: "partial", caption: "Peluncuran minggu ini: satu video, tiga platform.", error: "TikTok gagal karena token kedaluwarsa." },
  { day: 4, time: "17:00", targets: ["threads"], status: "failed", caption: "Kenapa kalender lebih berguna dari daftar ide.", error: "Post tidak terbit: batas post harian Threads tercapai. Coba lagi besok." },
  { day: 5, time: "08:00", targets: ["threads"], status: "published", caption: "Meja kerja pagi ini." },
  { day: 5, time: "10:30", targets: ["ig2"], status: "published", caption: "Carousel: tiga hal yang saya ubah di studio." },
  { day: 5, time: "11:00", targets: ["tiktok"], status: "scheduled", caption: "Video: proses edit 60 detik." },
  { day: 5, time: "15:00", targets: ["ig"], status: "published", caption: "Reel: satu menit di studio." },
  { day: 6, time: "10:00", targets: ["ig", "threads"], status: "scheduled", caption: "Minggu ini: 12 ide, 3 platform, 21 post." },
  { day: 6, time: "19:00", targets: ["threads"], status: "scheduled", caption: "Catatan kecil sebelum minggu baru." },
];
