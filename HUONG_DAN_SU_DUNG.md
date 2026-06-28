# 📱 Hướng Dẫn Sử Dụng App "Đại lí Thành Hoá"

## Dành cho nhân viên bán hàng & chủ cửa hàng

---

## 1. Mở App

- Trên điện thoại/máy tính: mở trình duyệt (Chrome, Safari, Cốc Cốc...)
- Nhập link app (do chủ cửa hàng cung cấp)
- **Mẹo**: Bấm "Thêm vào màn hình chính" để tạo icon app như app thật, mở nhanh hơn

### Cài app lên điện thoại (Android):
1. Mở link app bằng Chrome
2. Bấm dấu 3 chấm ⋮ góc trên phải
3. Chọn **"Thêm vào màn hình chính"**
4. Đặt tên → OK
5. Giờ có icon "Thành Hoá" trên màn hình, mở như app bình thường

### Cài app lên iPhone:
1. Mở link app bằng Safari
2. Bấm icon chia sẻ ⬆️ ở dưới
3. Kéo xuống chọn **"Thêm vào MH chính"**
4. Bấm **Thêm**

---

## 2. Tra Giá Sản Phẩm

### Cách 1: Gõ tên
- Bấm vào ô tìm kiếm 🔍
- Gõ tên sản phẩm (ví dụ: "ure", "npk 16", "nhện đỏ"...)
- Kết quả hiện ngay bên dưới với giá bán

### Cách 2: Quét mã vạch
- Bấm nút 📷 trên thanh header
- Cho phép truy cập camera khi được hỏi
- Đưa mã vạch sản phẩm vào khung hình
- App tự nhận mã và hiện sản phẩm

### Sắp xếp danh sách
- Bấm ô dropdown bên phải ô tìm kiếm
- Chọn: Tên A→Z, Giá thấp→cao, Tồn thấp→cao...

---

## 3. Tạo Bill Tính Tiền

### Bước 1: Thêm sản phẩm vào giỏ
- Bấm vào **thẻ sản phẩm** hoặc nút **+** màu xanh
- Sản phẩm được thêm vào giỏ (thẻ chuyển màu xanh nhạt)
- Bấm thêm lần nữa = tăng số lượng
- Dùng nút **−** và **+** trên thẻ để điều chỉnh

### Bước 2: Xem bill
- Khi có SP trong giỏ → thanh xanh hiện ở dưới cùng
- Bấm **"Xem bill"** để mở chi tiết

### Bước 3: Sửa số lượng (trong bill)
- Bấm **−** hoặc **+** bên cạnh từng SP để sửa
- Bấm **−** cho đến 0 = xoá SP khỏi giỏ

### Bước 4: Giảm giá (nếu có)
- Chọn kiểu giảm: **VND** (giảm tiền cố định) hoặc **%** (giảm phần trăm)
- Nhập số tiền/phần trăm giảm

### Bước 5: In bill
- Bấm **🖨 In bill**
- Máy in sẽ in hoá đơn
- Giỏ hàng tự động xoá sau khi in
- Tồn kho trên Sheet tự động trừ

---

## 4. Xem Lịch Sử Hoá Đơn

- Bấm nút 📋 trên thanh header
- Xem lại các bill đã in (lưu trên máy)
- Hiển thị: số hoá đơn, ngày giờ, tổng tiền

---

## 5. Chế Độ Chủ (xem giá vốn)

> ⚠️ Chỉ dành cho chủ cửa hàng, không cho khách/nhân viên thấy

- Bấm nút 🔒 trên thanh header
- Nhập PIN 4 số (mặc định: **2468**)
- Sau khi mở → mỗi thẻ SP hiện thêm: **giá vốn** và **lãi**
- Bấm lại 🔓 để thoát chế độ chủ

---

## 6. Đổi Giao Diện Sáng/Tối

- Bấm nút 🌙 (hoặc ☀️) trên thanh header
- Giao diện tối tốt cho ban đêm, tiết kiệm pin

---

## 7. Đồng Bộ Tồn Kho

- App tự đồng bộ từ Google Sheet mỗi 60 giây
- Bấm nút 🔄 để đồng bộ thủ công ngay
- Khi thấy **"✓ Đã đồng bộ tồn kho"** = OK
- Nếu mất mạng → app vẫn chạy bình thường với dữ liệu cũ

---

## 8. Ý Nghĩa Các Màu Tồn Kho

| Màu | Ý nghĩa |
|-----|----------|
| 🟢 Xanh | Còn hàng (> 5 SP) |
| 🟡 Vàng | Sắp hết (≤ 5 SP) |
| 🔴 Đỏ | Hết hàng (0 SP) |

- Khi có SP sắp hết → thanh cảnh báo vàng hiện ở trên
- Bấm vào thanh cảnh báo → lọc nhanh các SP tồn thấp

---

## 9. Cập Nhật Giá / Tồn Kho

> Mọi thay đổi giá hoặc tồn kho đều sửa trên **Google Sheet**, tab `SanPham`.

- Mở Google Sheet
- Vào tab `SanPham`
- Sửa cột giá bán (`sellPrice`) hoặc tồn kho (`stock`)
- App sẽ tự cập nhật trong vòng 60 giây (hoặc bấm 🔄)

**Không sửa giá trong app** — app chỉ đọc từ Sheet.

---

## 10. Hỏi Đáp Thường Gặp

**Q: App không hiện sản phẩm?**
- Kiểm tra mạng internet
- Bấm 🔄 để thử đồng bộ lại
- Nếu vẫn lỗi → liên hệ chủ cửa hàng

**Q: In bill nhưng không ra giấy?**
- Kiểm tra máy in đã bật và kết nối
- Trên điện thoại: chọn đúng máy in khi hộp thoại in hiện ra

**Q: Quên PIN chế độ chủ?**
- PIN mặc định: 2468
- Liên hệ chủ cửa hàng để đổi PIN

**Q: Mất mạng có dùng được không?**
- Có! App vẫn tra giá và tính tiền bình thường
- Tuy nhiên tồn kho sẽ không cập nhật cho đến khi có mạng lại
- Bill sẽ được lưu lên Sheet khi có mạng

---

## 📞 Liên Hệ Hỗ Trợ

Nếu gặp vấn đề, liên hệ chủ cửa hàng.

---

*App "Đại lí Thành Hoá" v2.0 — Tra giá nhanh, tính tiền gọn.*
