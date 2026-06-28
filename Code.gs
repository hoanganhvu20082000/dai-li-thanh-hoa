/**
 * Backend cho app "Đại lí Thành Hoá".
 * Dán toàn bộ file này vào: Tiện ích mở rộng → Apps Script (trong chính Google Sheet).
 * Sau đó: Triển khai → Tùy chọn mới → Ứng dụng web → lấy URL /exec dán vào SCRIPT_URL trong file HTML.
 *
 * Sheet phải có 2 tab:
 *   - "SanPham": cột A..E = code | name | sellPrice | cost | stock  (hàng 1 là tiêu đề)
 *   - "HoaDon" : script tự tạo nếu chưa có, để log từng dòng hoá đơn.
 */

const SHEET_PRODUCTS = 'SanPham';
const SHEET_INVOICES = 'HoaDon';
const TZ = 'GMT+7';

// Vị trí cột trong tab SanPham (0-based). Đổi ở đây nếu sau này thêm/bớt cột.
const COL = { code: 0, name: 1, sellPrice: 2, cost: 3, stock: 4 };

/* ---------- Router ---------- */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  try {
    if (action === 'getProducts') return json({ products: getProducts_() });
    return json({ error: 'Unknown action: ' + action });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || '';
    if (action === 'saveInvoice') return json(saveInvoice_(body.invoice));
    return json({ error: 'Unknown action: ' + action });
  } catch (err) {
    return json({ error: String(err) });
  }
}

/* ---------- Đọc sản phẩm (app tự gọi mỗi 60 giây) ---------- */

function getProducts_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_PRODUCTS);
  if (!sh) throw new Error('Không thấy tab "' + SHEET_PRODUCTS + '"');
  const rows = sh.getDataRange().getValues().slice(1); // bỏ hàng tiêu đề
  const out = [];
  for (const r of rows) {
    const code = String(r[COL.code] || '').trim();
    if (!code) continue;
    out.push({
      code: code,
      name: String(r[COL.name] || '').trim(),
      sellPrice: Number(r[COL.sellPrice]) || 0,
      cost: Number(r[COL.cost]) || 0,
      stock: Number(r[COL.stock]) || 0,
    });
  }
  return out;
}

/* ---------- Lưu hoá đơn + trừ tồn ---------- */

function saveInvoice_(invoice) {
  if (!invoice || !invoice.items || !invoice.items.length) {
    throw new Error('Hoá đơn rỗng');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // tránh 2 bill ghi cùng lúc làm sai tồn
  try {
    const ss = SpreadsheetApp.getActive();
    const prodSh = ss.getSheetByName(SHEET_PRODUCTS);
    if (!prodSh) throw new Error('Không thấy tab "' + SHEET_PRODUCTS + '"');

    let invSh = ss.getSheetByName(SHEET_INVOICES);
    if (!invSh) {
      invSh = ss.insertSheet(SHEET_INVOICES);
      invSh.appendRow(['invoiceNo','datetime','customer','code','name','qty','price','lineTotal','discount']);
    }

    const pv = prodSh.getDataRange().getValues(); // gồm cả tiêu đề
    const now = new Date();
    const invoiceNo = invoice.invoiceNo ||
      ('HD' + Utilities.formatDate(now, TZ, 'yyMMdd-HHmmss'));
    const dt = Utilities.formatDate(now, TZ, 'yyyy-MM-dd HH:mm:ss');

    // index nhanh: code -> số hàng trong sheet (1-based) để trừ tồn
    const rowOf = {};
    for (let i = 1; i < pv.length; i++) {
      rowOf[String(pv[i][COL.code]).trim()] = i; // i = chỉ số mảng; hàng thật = i+1
    }

    const logRows = [];
    invoice.items.forEach(it => {
      const code = String(it.code).trim();
      const i = rowOf[code];
      const name = (i != null) ? pv[i][COL.name] : '';
      logRows.push([invoiceNo, dt, invoice.customer || 'Khách lẻ',
                    code, name, it.qty, it.price, it.qty * it.price,
                    invoice.discount || 0]);
      // trừ tồn
      if (i != null) {
        const cur = Number(pv[i][COL.stock]) || 0;
        prodSh.getRange(i + 1, COL.stock + 1).setValue(cur - Number(it.qty));
      }
    });

    // ghi log 1 lần cho nhanh
    invSh.getRange(invSh.getLastRow() + 1, 1, logRows.length, logRows[0].length)
         .setValues(logRows);

    return { invoiceNo: invoiceNo };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Tiện ích ---------- */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
