# Design system: jadwalin

Status: **terkunci run 1** — layar kalender minggu. Screens berikutnya wajib memakai file ini, bukan mengundi style baru.

Arah: alat kerja harian, kalender sebagai pusat. Warna hanya dipakai untuk status dan interaksi. Tidak ada gradient dekoratif, foto, atau ilustrasi.

## Palet

Diambil dari dealer `tasteskill 2.5` (palet `cool-grey-cobalt`, tipe `host`, radius `soft`).

| Token | Nilai | Pakai |
|---|---|---|
| `--bg` | `#eef0f3` | chrome: topbar, rail |
| `--surface` | `#e2e5ea` | hover, field, avatar |
| `--paper` | `#ffffff` | kanvas grid, blok post |
| `--ink` | `#0b0c0e` | teks utama |
| `--muted` | `#5d6470` | teks sekunder |
| `--faint` | `#626b77` | label kecil, hitungan, tick |
| `--line` | `#dfe4e9` | garis 1px |
| `--line-strong` | `#cdd4dc` | batas kolom, gutter |
| `--accent` | `#1f2de6` | fokus, now line, hari ini, tombol utama |
| `--accent-ink` | `#ffffff` | teks di atas accent |
| `--today` | `rgba(31,45,230,.028)` | wash kolom hari ini |

Aturan accent: **hanya untuk interaksi dan waktu sekarang**. Jangan pakai untuk status, heading, atau dekorasi.

Turunan status: `--warn-bg: rgba(180,83,9,.06)`, `--warn-line: #ecdcc8`, `--st-reconnect-ink: #92400e`.

## Status

Warna status tidak boleh dipakai untuk hal lain. Label status selalu tinta; hue hanya di edge, titik, atau ikon.

| Status | Hue | Bentuk |
|---|---|---|
| Terjadwal | `#64748b` | cincin kosong |
| Sedang terbit | `#b45309` | cincin amber |
| Terbit | `#15803d` | titik penuh |
| Sebagian | `#15803d` + `#b91c1c` | lingkaran terbelah |
| Gagal | `#b91c1c` | titik penuh |
| Perlu reconnect | `#b45309`, teks `#92400e` | segitiga kecil |

Prioritas bila target berbeda: `gagal > sebagian > sedang terbit > terjadwal > terbit`.

- Edge blok 3px memakai hue status; untuk `sebagian` edge dibelah hijau/merah.
- Status tidak boleh hanya warna: sertakan bentuk di legend dan di blok.
- Target yang akunnya `needs_reconnect` diberi segitiga amber di atas mark platform, edge blok tetap status post.

## Tipografi

- Teks: **Host Grotesk** 400/500/600, file lokal `design/assets/fonts/host-grotesk-latin.woff2`.
- Data: **JetBrains Mono** 400/500, file lokal `design/assets/fonts/jetbrains-mono-latin.woff2`.

| Peran | Ukuran | Berat | Catatan |
|---|---|---|---|
| Judul layar / rentang minggu | 19px | 600 | tracking -0.025em |
| Judul panel | 13–14px | 600 | sentence case |
| UI default | 13px | 400/500 | |
| Caption blok | 12px (11.5px ≤900) | 400 | 1 baris, ellipsis |
| Caption agenda | 13px | 400 | maks 2 baris |
| Label kecil | 10–11px | 500 | tanpa ALL-CAPS |
| Hitungan hari | 8–9px | 400 | mono; tetap ≥4.5:1 |
| Hitungan akun/legend | 10px | 400 | mono |
| Jam blok & timezone | 10.5px | 500 | mono, tabular |
| Jam gutter | 9.5px | 400 | mono, tabular |

Mono hanya untuk data asli: jam, hitungan, timezone, ID, kode error. Bukan untuk label dekoratif.

## Spasi dan bentuk

- Spasi: 4 / 8 / 12 / 16 / 24 / 32.
- Radius: 3px (blok, tombol kecil), 4px (panel, drawer nanti), 50% (avatar).
- Border: 1px `--line`; garis jam 1px `rgba(11,12,14,.10)` tiap 88px, setengah jam `rgba(11,12,14,.045)`.
- Shadow hanya untuk elemen yang benar-benar terangkat: blok saat drag, toast. Diam = tanpa shadow.

## Ukuran layout

| Bagian | Ukuran |
|---|---|
| Topbar | 56px |
| Rail akun | 208px (≥1200) |
| Toolbar | 56px |
| Subbar (ringkasan + legend) | 36px |
| Header hari | 52px |
| Gutter jam | 52px |
| Baris 30 menit | 44px |
| Rentang jam | 06:00–23:00 |
| Drawer detail (run berikutnya) | 400px, overlay kanan |

Breakpoint:
- `≥1200`: rail kiri 208px + grid 7 kolom.
- `768–1199`: rail jadi baris chip akun di atas; grid 7 kolom; blok pindah ke layout bertumpuk (jam + mark di baris atas, caption di bawah), caption tetap tampil.
- `<768`: agenda satu hari + strip 7 hari; tanpa drag. Chip akun memakai handle pendek (`@naufal`, `@studio`), hitungan disembunyikan ≤430px.

Grid membuka di sekitar waktu sekarang (bukan selalu 08:00), discroll ke batas 30 menit terdekat ke bawah supaya tidak ada blok yang terpotong di tepi atas.

## Komponen

### Blok post (elemen utama)
- Bentuk tiket (≥1200): edge status 3px, kolom jam mono 36px, pemisah 1px, lalu caption + mark platform di kanan.
- Di 768–1199: edge status 3px, jam + mark di baris atas, caption selebar blok di baris kedua. Caption 11.5px; mark 9px di ≤900, 12px di 901–1199. Bentuk tiket penuh hanya di desktop lebar.
- Tinggi 40px di slot 30 menit (inset 2px atas/bawah). Tanpa shadow saat diam.
- Mark platform monokrom `currentColor`, 12px (9px ≤900), bukan warna brand. Warna sudah dipakai status.
- Bentuk status kecil 7px di ujung kanan baris meta.
- Hover: border menguat; cursor grab hanya pada blok yang bisa digeser. Terpilih: ring 2px accent. Drag: hanya blok, shadow `0 10px 24px rgba(11,12,14,.16)`.
- Hanya `terjadwal` dan `gagal` yang bisa digeser; `terbit`, `sedang terbit`, dan `sebagian` tidak.
- Data dummy sengaja tidak punya dua post di menit yang sama; same-slot stacking belum ada.

### Header hari
- `Kam` 10px muted, tanggal 15px 600, `4 post` 9px faint.
- Hari ini: tanggal dalam chip accent 22px, teks putih.

### Rail akun
- Checkbox native dengan `accent-color: var(--accent)`.
- Baris: checkbox, mark platform 14px, handle 13px, hitungan mono 10.5px.
- Akun `needs_reconnect`: titik amber + catatan inline, border kiri amber 2px.
- Di <1200 rail jadi chip: ≤767 handle pendek, ≤430 tanpa hitungan; state aktif = garis bawah accent 2px.

### Legend status
- Hanya ≥1200. Titik bentuk + label + hitungan mono.
- Sembunyi saat minggu kosong atau filter kosong.

## Motion

- Hover 120ms, tekan 80ms, toast 160ms masuk.
- Drag: blok terangkat, ghost slot putus-putus + jam hasil snap 15 menit.
- Tidak ada animasi saat scroll, tidak ada fade-in section, tidak ada pulse status.
- `prefers-reduced-motion: reduce`: semua transisi 0ms; drag tetap berfungsi tanpa animasi.

## Aksesibilitas

- Fokus keyboard: outline 2px `--accent` offset 2px; blok dan tombol primary memakai ring 2px `--paper` + 2px `--accent`.
- Status selalu punya label teks di aria-label/tooltip + bentuk.
- Kontras teks minimal AA; label status pakai tinta, bukan hue.
- Grid bisa di-tab per blok; produksi sebaiknya pakai roving tabindex.
- Drag pointer-only di prototipe; produksi wajib punya jalur keyboard (ubah waktu di drawer).

## Copy

- Aksi konsisten: `Post baru`, `Jadwalkan` → toast `Terjadwal`, `Sambungkan ulang`, `Coba lagi`, `Tampilkan semua akun`.
- Error menjelaskan penyebab dan langkah berikutnya, tanpa minta maaf.
- Empty state mengajak bertindak, bukan menghias layar kosong.

## Di luar run ini

- Isi composer/detail drawer, tampilan bulan, inbox, analytics, retry dari blok (pindah ke drawer).
- Same-slot stacking (>1 post di menit yang sama) — data dummy sengaja tidak memicunya.

## Catatan metode

Skill `design-taste-frontend` versi terpasang (tasteskill 2.5) tidak punya `inspect.mjs`/`--app`. `check.mjs` yang ada adalah checker layout halaman marketing: ia butuh `main .wrap/.container` dan `main > section`, lalu crash di layar app ini. Run ini memakai dealer palet/type, aturan anti-slop, `shoot.mjs` di 1440/1024/768/390, `perf.mjs`, dan audit app sendiri (console, overflow, alignment kolom, fonts, kontras, keyboard). `AGENTS.md` sudah diperbarui: definition of done UI tidak lagi menyebut `inspect.mjs --app`.
