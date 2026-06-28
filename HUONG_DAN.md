# Hướng dẫn nối app "Đại lí Thành Hoá" với Google Sheet (Hướng A)

Thứ tự bắt buộc: **Sheet → Apps Script → URL /exec → HTML → Vercel.**
Làm tuần tự từ trên xuống. Tổng ~10–15 phút.

File trong bộ này:
- `index.html` — app, đẩy lên Git/Vercel.
- `Code.gs` — backend, dán vào Apps Script.
- `SanPham_seed.csv` — 228 sản phẩm, đổ vào Sheet.

---

## PHẦN 1 — Chuẩn bị Google Sheet

**1.1. Kiểm tra Sheet là native hay Excel.**
Mở Sheet. Nhìn thanh tiêu đề:
- Nếu thấy đuôi **`.xlsx`** → đây là Excel upload, Apps Script KHÔNG chạy được.
  → Vào **Tệp → Lưu dưới dạng Google Sheets**. File mới sinh ra (ID mới) — từ giờ chỉ dùng file mới này, bỏ file cũ.
- Nếu không thấy `.xlsx` → đã là native, đi tiếp.

**1.2. Tạo tab tên `SanPham`.**
Dưới đáy, bấm dấu **+** tạo trang tính mới, đổi tên thành đúng `SanPham` (viết liền, không dấu).

**1.3. Đổ dữ liệu vào.**
- Bấm vào ô **A1** của tab `SanPham`.
- **Tệp → Nhập (Import) → Tải lên** → chọn `SanPham_seed.csv`.
- Vị trí nhập: chọn **"Thay thế dữ liệu tại ô đã chọn"**.
- Loại dấu phân tách: **Tự động phát hiện**. Bấm **Nhập dữ liệu**.
- Kết quả: hàng 1 là tiêu đề `code | name | sellPrice | cost | stock`, 228 hàng sản phẩm bên dưới. Đúng thứ tự cột này là bắt buộc.

> Tab `HoaDon` không cần tạo tay — script tự tạo lần đầu có người in bill.

---

## PHẦN 2 — Dán backend (Apps Script)

**2.1.** Vẫn trong Sheet: **Tiện ích mở rộng → Apps Script**. Một tab mới mở ra (trình soạn code).

**2.2.** Xoá sạch đoạn `function myFunction() {}` có sẵn.

**2.3.** Mở `Code.gs`, copy **toàn bộ**, dán vào. Bấm **Ctrl/Cmd + S** để lưu. (Đặt tên project tuỳ ý, vd "ThanhHoa-backend".)

---

## PHẦN 3 — Deploy (chỗ hay sai nhất, làm chậm)

**3.1.** Góc trên phải bấm **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)**.

**3.2.** Bấm bánh răng ⚙ bên trái ("Chọn loại") → chọn **Ứng dụng web (Web app)**.

**3.3.** Điền:
- **Thực thi với tư cách (Execute as):** `Tôi (email của anh)`
- **Người có quyền truy cập (Who has access):** **`Bất kỳ ai (Anyone)`**
  ⚠️ KHÔNG chọn "Bất kỳ ai có Tài khoản Google" — chọn nhầm cái này app sẽ bị đá về trang đăng nhập, sync luôn lỗi.

**3.4.** Bấm **Triển khai**.

**3.5.** Lần đầu sẽ hiện màn xin quyền:
- **Ủy quyền truy cập** → chọn tài khoản Google của anh.
- Hiện cảnh báo "Google chưa xác minh ứng dụng này" — bình thường với script cá nhân.
- Bấm **Nâng cao (Advanced)** → **Đi tới [tên project] (không an toàn)** → **Cho phép (Allow)**.

**3.6.** Copy **URL ứng dụng web**, dạng kết thúc bằng **`/exec`**:
`https://script.google.com/macros/s/AKfyc..../exec`
→ Giữ cái URL này lại.

---

## PHẦN 4 — Nối app + đẩy Vercel

**4.1.** Mở `index.html`, tới **dòng 719**, thay placeholder bằng URL `/exec` vừa copy:
```js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfyc..../exec';
```

**4.2.** (Khuyến nghị) Giữ tên file là **`index.html`** ở thư mục gốc repo — Vercel tự phục vụ ở đường dẫn gốc, khỏi cấu hình gì.

**4.3.** Đẩy lên Git, rồi trên Vercel: **Add New → Project → Import** repo đó. Framework để **"Other"**, không có build command. Bấm **Deploy**.

---

## PHẦN 5 — Kiểm tra

Mở URL Vercel:
1. App load xong, vài giây sau hiện toast **"✓ Đã đồng bộ tồn kho"** → đọc Sheet OK.
2. Bấm 🔒 nhập PIN **`2468`** → thấy giá vốn + tồn kho (chế độ chủ).
3. Thêm vài món → **In bill**. Sau đó kiểm tra trên Sheet:
   - Tab `HoaDon` có thêm các dòng.
   - Tab `SanPham` cột `stock` của món vừa bán đã **giảm**.

Nếu chạy hết được 3 cái này = xong, hệ thống chạy thật.

---

## Hai cái sẽ cắn anh về sau — nhớ sẵn

**A. Sửa Code.gs xong PHẢI re-deploy.** Không thì URL `/exec` vẫn chạy code cũ.
→ **Triển khai → Quản lý các bản triển khai → bút chì (Chỉnh sửa) → Phiên bản: Mới → Triển khai.** URL giữ nguyên, không đổi, không phải sửa lại HTML.

**B. Từ giờ Sheet là nguồn sự thật.** Sửa giá / tồn kho là sửa trên tab `SanPham`, KHÔNG sửa trong code HTML nữa. Mỗi lần app sync, nó lấy từ Sheet đè lên. (App vẫn còn danh sách cứng bên trong chỉ để chạy lúc mất mạng — không dùng để chỉnh giá.)

---

## Khi lỗi — soi nhanh

- **Toast "⚠ Lỗi sync" / "Lỗi lưu HĐ":** 90% là (1) chọn nhầm quyền, không phải "Bất kỳ ai", hoặc (2) URL dán thiếu/sai, không kết thúc bằng `/exec`.
- **Test nhanh backend không cần app:** dán thẳng vào trình duyệt: `...­/exec?action=getProducts`. Phải trả về một cục JSON bắt đầu bằng `{"products":[...`. Nếu ra trang đăng nhập Google → sai quyền ở 3.3.
- **Sync OK nhưng danh sách trống:** tab chưa đúng tên `SanPham`, hoặc thứ tự cột sai.
