# 🌿 Đại lí Thành Hoá - App Bán Hàng v2.0

App tra giá và tính tiền cho đại lý vật tư nông nghiệp. PWA, chạy offline, sync Google Sheets.

## ✨ Tính năng

- ✅ **228 sản phẩm** với giá bán, giá vốn, tồn kho
- ✅ **Tìm kiếm nhanh** theo tên hoặc mã SP
- ✅ **Giỏ hàng + Tính tiền** với giảm giá (VND / %)
- ✅ **In bill** (80mm thermal printer)
- ✅ **Chế độ chủ** (PIN 2468) — xem giá vốn, lãi
- ✅ **Cảnh báo tồn thấp** — SP có stock ≤ 5
- ✅ **Quét mã vạch** bằng camera (BarcodeDetector API)
- ✅ **Lịch sử hoá đơn** (lưu localStorage)
- ✅ **Dark mode**
- ✅ **PWA** — cài được trên điện thoại, chạy offline
- ✅ **Sync Google Sheets** mỗi 60 giây
- ✅ **Responsive** — mobile / tablet / desktop

## 🚀 Deploy lên Vercel (5 phút)

### Bước 1: Push lên GitHub

```bash
# Trong thư mục web_ban_hang/
git init
git add .
git commit -m "feat: app ban hang v2.0"
git remote add origin https://github.com/hoanganhvu20082000/dai-li-thanh-hoa.git
git push -u origin main
```

### Bước 2: Deploy Vercel

1. Vào [vercel.com](https://vercel.com) → đăng nhập bằng GitHub
2. **Add New → Project → Import** repo `dai-li-thanh-hoa`
3. Framework: chọn **"Other"**
4. Build Command: **để trống**
5. Output Directory: **để trống** (`.`)
6. Bấm **Deploy**

→ Xong! App chạy ở `https://dai-li-thanh-hoa.vercel.app`

### Bước 3: Nối Google Sheets (để sync tồn kho)

Xem chi tiết ở file [HUONG_DAN.md](./HUONG_DAN.md)

**Tóm tắt:**
1. Mở Google Sheet → **Tệp → Lưu dưới dạng Google Sheets** (nếu là .xlsx)
2. Tạo tab `SanPham`, import file `SanPham_seed.csv`
3. **Tiện ích mở rộng → Apps Script** → dán nội dung `Code.gs`
4. **Triển khai → Ứng dụng web** → Quyền: "Bất kỳ ai" → Copy URL `/exec`
5. Mở `app.js`, dán URL vào dòng:
   ```js
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfyc..../exec';
   ```
6. Commit + push → Vercel tự deploy lại

## 📁 Cấu trúc file

```
web_ban_hang/
├── index.html          # HTML shell
├── style.css           # Styles (responsive, dark mode)
├── app.js              # Logic chính (cart, sync, scanner, history)
├── products.js         # 228 SP dạng JS (offline fallback)
├── sw.js               # Service Worker (PWA offline)
├── manifest.json       # PWA manifest
├── vercel.json         # Vercel config
├── icons/              # App icons (SVG)
├── Code.gs             # Backend Google Apps Script
├── SanPham_seed.csv    # Data seed (228 SP)
└── HUONG_DAN.md        # Hướng dẫn chi tiết nối Sheet
```

## 🔒 Đổi PIN chủ

Mặc định PIN là `2468`. Để đổi, mở Console (F12) và chạy:
```js
localStorage.setItem('ownerPin', '1234');
```

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| Không sync được | Kiểm tra SCRIPT_URL trong app.js |
| Camera không mở | Cho phép quyền camera trong browser |
| App không cài được | Phải dùng HTTPS (Vercel tự có) |
| Sheet là Excel | Tệp → Lưu dưới dạng Google Sheets |
