// shortcut: static sample week, swap for posts/post_targets queries once publishing exists.
export type Platform = "threads" | "instagram" | "tiktok";
export type PostStatus = "scheduled" | "publishing" | "published" | "partial" | "failed";

export type SocialAccount = {
  id: string;
  platform: Platform;
  label: string;
  handle: string;
  short: string;
  needsReconnect?: boolean;
};

export type SamplePost = {
  id: string;
  day: number;
  time: string;
  targets: string[];
  status: PostStatus;
  caption: string;
  error?: string;
};

export const ACCOUNTS: SocialAccount[] = [
  { id: "threads", platform: "threads", label: "Threads", handle: "@naufal.core", short: "@naufal" },
  { id: "ig", platform: "instagram", label: "Instagram", handle: "@naufal.core", short: "@naufal" },
  {
    id: "ig2",
    platform: "instagram",
    label: "Instagram",
    handle: "@studio.kecil",
    short: "@studio",
  },
  {
    id: "tiktok",
    platform: "tiktok",
    label: "TikTok",
    handle: "@naufal.core",
    short: "@naufal",
    needsReconnect: true,
  },
];

export const STATUS_LABELS: Record<PostStatus, string> = {
  scheduled: "Terjadwal",
  publishing: "Sedang terbit",
  published: "Terbit",
  partial: "Sebagian",
  failed: "Gagal",
};

export const LEGEND_ORDER: PostStatus[] = [
  "scheduled",
  "publishing",
  "published",
  "partial",
  "failed",
];

export const SAMPLE_POSTS: SamplePost[] = [
  { id: "p01", day: 0, time: "08:30", targets: ["threads"], status: "published", caption: "Tiga hal yang saya pelajari waktu pindah ke Next.js." },
  { id: "p02", day: 0, time: "12:00", targets: ["threads", "ig"], status: "scheduled", caption: "Behind the desk, minggu ini." },
  { id: "p03", day: 0, time: "19:30", targets: ["tiktok"], status: "failed", caption: "Potongan proses bikin konten minggu ini.", error: "Token TikTok kedaluwarsa. Sambungkan ulang akun, lalu coba lagi." },
  { id: "p04", day: 1, time: "09:00", targets: ["threads"], status: "published", caption: "Catatan rilis 0.4: kalender, retry, token." },
  { id: "p05", day: 1, time: "13:30", targets: ["ig"], status: "scheduled", caption: "Reel: 3 alat yang bikin kerja lebih cepat." },
  { id: "p06", day: 1, time: "18:00", targets: ["threads", "ig"], status: "scheduled", caption: "Kenapa saya berhenti posting tiap hari." },
  { id: "p07", day: 2, time: "07:30", targets: ["threads"], status: "published", caption: "Rangkuman minggu: 3 platform, 21 post." },
  { id: "p08", day: 2, time: "13:00", targets: ["ig", "tiktok"], status: "scheduled", caption: "Carousel: alur kerja dari brief sampai terbit." },
  { id: "p09", day: 2, time: "16:00", targets: ["ig2"], status: "scheduled", caption: "Studio kecil, proses panjang." },
  { id: "p10", day: 3, time: "10:00", targets: ["threads"], status: "published", caption: "Satu jam di meja, tiga ide." },
  { id: "p11", day: 3, time: "14:05", targets: ["ig"], status: "publishing", caption: "Reel: sebelum dan sesudah pindah ke scheduler." },
  { id: "p12", day: 3, time: "15:30", targets: ["threads", "ig"], status: "scheduled", caption: "Proses pindah dari spreadsheet ke scheduler: apa yang berubah, apa yang masih manual, dan kenapa saya tidak buru-buru menambah platform baru." },
  { id: "p13", day: 4, time: "09:30", targets: ["tiktok"], status: "scheduled", caption: "Video: jawab tiga pertanyaan paling sering." },
  { id: "p14", day: 4, time: "08:00", targets: ["threads", "ig", "tiktok"], status: "partial", caption: "Peluncuran minggu ini: satu video, tiga platform.", error: "TikTok gagal karena token kedaluwarsa." },
  { id: "p15", day: 4, time: "17:00", targets: ["threads"], status: "failed", caption: "Kenapa kalender lebih berguna dari daftar ide.", error: "Post tidak terbit: batas post harian Threads tercapai. Coba lagi besok." },
  { id: "p16", day: 5, time: "08:00", targets: ["threads"], status: "published", caption: "Meja kerja pagi ini." },
  { id: "p17", day: 5, time: "10:30", targets: ["ig2"], status: "published", caption: "Carousel: tiga hal yang saya ubah di studio." },
  { id: "p18", day: 5, time: "11:00", targets: ["tiktok"], status: "scheduled", caption: "Video: proses edit 60 detik." },
  { id: "p19", day: 5, time: "15:00", targets: ["ig"], status: "published", caption: "Reel: satu menit di studio." },
  { id: "p20", day: 6, time: "10:00", targets: ["ig", "threads"], status: "scheduled", caption: "Minggu ini: 12 ide, 3 platform, 21 post." },
  { id: "p21", day: 6, time: "19:00", targets: ["threads"], status: "scheduled", caption: "Catatan kecil sebelum minggu baru." },
];
