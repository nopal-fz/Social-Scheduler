# Threads API

Status: hasil riset M1a, 6 November 2026. Sumber tunggal: dokumentasi resmi Meta
(`https://developers.facebook.com/documentation/threads`, index
`.../threads/llms.txt`). Verifikasi ulang sebelum rilis; Meta bisa mengubah versi API.

## Setup app

- Buat Meta app dengan use case Threads. Pakai **Threads App ID + Threads App secret**
  (app punya dua pasang id/secret; yang Facebook tidak dipakai).
- Settings app: daftar valid OAuth redirect URI, Deauthorize callback URL, dan
  Data Deletion Requests URL. Redirect URI harus sama persis saat authorize dan
  exchange code (dashboard kadang menambah trailing slash).
- Self-use: tambahkan akun Threads sebagai **Threads Tester** di App roles. Tester
  menerima undangan di `threads.com/settings/account` → Website permissions.
  Tester bisa memberikan permission tanpa App Review. App baru perlu published
  kalau dipakai akun di luar role tester.
- App secret hanya boleh dipakai di server.

## Scope

| Scope | Dipakai untuk |
|---|---|
| `threads_basic` | Wajib untuk semua endpoint |
| `threads_content_publish` | Publish post |
| `threads_read_replies`, `threads_manage_replies` | Inbox komen (P1) |
| `threads_manage_insights` | Analytics (P1) |

## OAuth

Authorize (browser):

```
https://threads.com/oauth/authorize
  ?client_id=<THREADS_APP_ID>
  &redirect_uri=<REDIRECT_URI>
  &scope=threads_basic,threads_content_publish
  &response_type=code
  &state=<STATE>
```

- `state` opsional menurut docs; app kita tetap memakainya dan memverifikasinya.
- Code berlaku 1 jam dan hanya bisa dipakai sekali. Redirect sukses bisa
  menambahkan `#_` di akhir URL; buang sebelum menukar code.
- Batal: redirect berisi `error=access_denied`, `error_reason=user_denied`,
  `error_description`.

Tukar code → short-lived token (server, POST):

```
POST https://graph.threads.com/oauth/access_token
  client_id, client_secret, code, grant_type=authorization_code, redirect_uri
→ { access_token, token_type: "bearer", user_id }
```

Short-lived token berlaku 1 jam.

Short-lived → long-lived (server, GET):

```
GET https://graph.threads.com/access_token
  ?grant_type=th_exchange_token&client_secret=<APP_SECRET>&access_token=<SHORT>
→ { access_token, token_type, expires_in }  // 60 hari
```

Refresh long-lived (server, GET):

```
GET https://graph.threads.com/refresh_access_token
  ?grant_type=th_refresh_token&access_token=<LONG>
→ { access_token, token_type, expires_in }  // 60 hari sejak refresh
```

- Refresh hanya berhasil kalau token long-lived berumur ≥24 jam dan belum expired.
- Permission grant profil publik berlaku 90 hari dan ikut diperpanjang saat refresh.
  Profil privat tidak bisa diperpanjang lewat refresh → akun harus reconnect.
- Token kadaluwarsa tidak bisa ditukar/diperpanjang; user harus authorize ulang.

## Publish teks (dua langkah)

1. Buat container:

```
POST https://graph.threads.com/v1.0/<THREADS_USER_ID>/threads
  media_type=TEXT
  text=<CAPTION>
  access_token=<TOKEN>
→ { id: <CONTAINER_ID> }
```

2. Publish container:

```
POST https://graph.threads.com/v1.0/<THREADS_USER_ID>/threads_publish
  creation_id=<CONTAINER_ID>
  access_token=<TOKEN>
→ { id: <THREADS_MEDIA_ID> }
```

- Simpan `<CONTAINER_ID>` ke `post_targets.creation_id` **sebelum** langkah publish,
  supaya retry memakai container yang sama dan tidak membuat post dobel.
- Container kedaluwarsa setelah 24 jam. Untuk media, docs menyarankan tunggu
  ~30 detik sebelum publish; status container bisa dicek:
  `GET /v1.0/<CONTAINER_ID>?fields=status,error_message` dengan status
  `EXPIRED | ERROR | FINISHED | IN_PROGRESS | PUBLISHED`. Untuk teks, publish
  biasanya langsung; kalau publish tidak mengembalikan id, cek status container.

## Batas dan kuota

- Post teks maksimal **500 karakter**. Emoji dihitung sebagai jumlah **UTF-8 byte**,
  jadi validator publish tidak boleh memakai `string.length` JavaScript saja.
- Maksimal **250 post API per 24 jam bergerak** per profil (carousel dihitung satu).
  Cek pemakaian: `GET /v1.0/<USER_ID>/threads_publishing_limit?fields=quota_usage,config`.
- Rate limit call dihitung per app + app user dalam 24 jam:
  `4800 × jumlah impressions` (minimum impressions 10), ditambah batas CPU time.
- Post teks maksimal 5 link unik (sejak 22 Des 2025); lebih dari itu gagal di
  langkah buat container dengan kode `THREADS_API__LINK_LIMIT_EXCEEDED`.

## Error

- Error OAuth (contoh resmi): `{ error_type, code, error_message }`.
- Error Graph umumnya berbentuk `{ error: { message, type, code, error_subcode, fbtrace_id } }`;
  contoh nyata publish belum dikumpulkan. `TODO(verify)` saat M1c.
- Klasifikasi retry sementara di worker: 429, 5xx, timeout → retry (maks 3, backoff).
  4xx lain → `failed` permanen dengan `error_code` + `error_message` dari platform.

## TODO(verify) sebelum M1c

- Bentuk persis error publish (field mana yang disimpan ke `error_code`/`error_message`).
- Perilaku publish kalau container sudah `PUBLISHED` (retry setelah respons hilang).
- Scope dan endpoint komen/insights untuk P1 (belum diriset).
