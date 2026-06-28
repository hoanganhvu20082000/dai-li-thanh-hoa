// ====== Đại lí Thành Hoá - App v2.0 ======
// CONFIG
const SCRIPT_URL = 'DAN_URL_APPS_SCRIPT_VAO_DAY';
let OWNER_PIN = localStorage.getItem('ownerPin') || '2468';
let PRODUCTS = (typeof PRODUCTS_SEED !== 'undefined') ? [...PRODUCTS_SEED] : [];

// HELPERS
const fmt = n => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0));
const normalize = s => (s||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const $ = id => document.getElementById(id);
const isOnline = () => SCRIPT_URL && SCRIPT_URL.startsWith('https://');

// STATE
let state = { search:'', sort:'default', ownerMode:false, cart:[], discountMode:'amt', discountVal:0 };

// ====== API ======
async function apiGet(action) {
  if (!isOnline()) throw new Error('Offline');
  const r = await fetch(SCRIPT_URL+'?action='+action);
  const d = await r.json(); if(d.error) throw new Error(d.error); return d;
}
async function apiPost(action, body) {
  if (!isOnline()) throw new Error('Offline');
  const r = await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...body})});
  const d = await r.json(); if(d.error) throw new Error(d.error); return d;
}

// ====== SYNC ======
async function syncProducts() {
  if (!isOnline()) return;
  try {
    const r = await apiGet('getProducts');
    if (r.products && r.products.length) { PRODUCTS = r.products; renderGrid(); showToast('✓ Đã đồng bộ tồn kho'); $('sync-status').textContent = 'Online · ' + new Date().toLocaleTimeString('vi'); }
  } catch(e) { showToast('⚠ Lỗi sync: '+e.message); }
}

// ====== RENDER GRID ======
function getFiltered() {
  let list = [...PRODUCTS];
  if (state.search) { const q = normalize(state.search); list = list.filter(p => normalize(p.name).includes(q) || normalize(p.code).includes(q)); }
  switch(state.sort) {
    case 'name-asc': list.sort((a,b)=>a.name.localeCompare(b.name,'vi')); break;
    case 'name-desc': list.sort((a,b)=>b.name.localeCompare(a.name,'vi')); break;
    case 'price-asc': list.sort((a,b)=>a.sellPrice-b.sellPrice); break;
    case 'price-desc': list.sort((a,b)=>b.sellPrice-a.sellPrice); break;
    case 'stock-asc': list.sort((a,b)=>a.stock-b.stock); break;
  }
  return list;
}

function renderGrid() {
  const list = getFiltered();
  const grid = $('grid');
  // Low stock alert
  const lowItems = PRODUCTS.filter(p=>p.stock>0&&p.stock<=5);
  if(lowItems.length){$('alert-bar').classList.add('show');$('alert-text').textContent=lowItems.length+' SP sắp hết hàng (tồn ≤5)';}else{$('alert-bar').classList.remove('show');}
  $('count-info').textContent = list.length + ' / ' + PRODUCTS.length + ' sản phẩm';
  $('mode-badge').innerHTML = state.ownerMode ? '<span class="owner-badge">👑 Chủ</span>' : '';
  if (!list.length) { grid.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div>Không tìm thấy sản phẩm</div>'; return; }
  grid.innerHTML = list.map(p => {
    const inCart = state.cart.find(c=>c.code===p.code);
    const stockCls = p.stock<=0?'out':p.stock<=5?'low':'ok';
    const stockTxt = p.stock<=0?'Hết':p.stock<=5?'Còn '+p.stock:'Kho '+p.stock;
    const cardCls = 'card'+(inCart?' in-cart':'')+(p.stock<=0?' out':p.stock<=5?' low':'');
    return `<div class="${cardCls}" data-code="${p.code}">
      <span class="stock-badge ${stockCls}">${stockTxt}</span>
      <div class="card-name">${esc(p.name)}</div>
      <div class="card-code">${p.code}</div>
      <div class="card-bottom">
        <div class="card-price">${fmt(p.sellPrice)}<small>đ</small></div>
        ${inCart
          ? `<div class="card-qty-controls"><button class="cq-minus" data-code="${p.code}">−</button><div class="card-qty-num">${inCart.qty}</div><button class="cq-plus" data-code="${p.code}">+</button></div>`
          : `<button class="add-btn" data-code="${p.code}">+</button>`}
      </div>
      <div class="card-owner-info"><span>Vốn: ${fmt(p.cost)}đ</span><span>Lãi: ${fmt(p.sellPrice-p.cost)}đ</span></div>
    </div>`;
  }).join('');
}

// ====== CART ======
function addToCart(code) {
  const p = PRODUCTS.find(x=>x.code===code); if(!p) return;
  const ex = state.cart.find(x=>x.code===code);
  if(ex) ex.qty++; else state.cart.push({code:p.code,name:p.name,price:p.sellPrice,qty:1});
  showToast('✓ '+p.name); renderAll();
}
function updateQty(code,delta) {
  const item = state.cart.find(x=>x.code===code); if(!item) return;
  item.qty += delta; if(item.qty<=0) state.cart=state.cart.filter(x=>x.code!==code);
  renderAll();
}
function clearCart() {
  if(!state.cart.length){showToast('Giỏ trống');return;}
  showConfirm('Xoá toàn bộ '+state.cart.length+' SP trong giỏ?',()=>{state.cart=[];state.discountVal=0;renderAll();closeModal('cart-modal');showToast('✓ Đã xoá giỏ');});
}
function renderCartBar() {
  const count = state.cart.reduce((s,i)=>s+i.qty,0);
  const total = state.cart.reduce((s,i)=>s+i.qty*i.price,0);
  $('cart-bar-count').textContent = count;
  $('cart-bar-total').textContent = fmt(total)+'đ';
  $('cart-bar').classList.toggle('show', count>0);
}
function calcTotal() {
  const sub = state.cart.reduce((s,i)=>s+i.qty*i.price,0);
  let disc = 0;
  if(state.discountMode==='pct') disc = sub * (state.discountVal||0)/100;
  else disc = state.discountVal||0;
  return {sub, disc:Math.min(disc,sub), grand:Math.max(0,sub-disc)};
}

// ====== CART MODAL ======
function openCartModal() {
  const t = calcTotal();
  $('cart-modal-body').innerHTML = `
    <h3>🧾 Bill tính tiền</h3><p>${state.cart.length} sản phẩm · ${state.cart.reduce((s,i)=>s+i.qty,0)} đơn vị</p>
    <div class="cart-list">${state.cart.map(i=>`<div class="cart-item">
      <div class="cart-item-info"><div class="cart-item-name">${esc(i.name)}</div><div class="cart-item-sub">${fmt(i.price)}đ × ${i.qty}</div></div>
      <div class="cart-item-qty"><button class="qty-btn" onclick="updateQty('${i.code}',-1)">−</button><span style="min-width:20px;text-align:center;font-weight:700">${i.qty}</span><button class="qty-btn" onclick="updateQty('${i.code}',1)">+</button></div>
      <div class="cart-item-total">${fmt(i.qty*i.price)}đ</div>
    </div>`).join('')}</div>
    <div class="discount-row"><label>Giảm</label>
      <div class="discount-mode"><button data-mode="amt" class="${state.discountMode==='amt'?'active':''}">VND</button><button data-mode="pct" class="${state.discountMode==='pct'?'active':''}">%</button></div>
      <input type="number" class="discount-input" id="disc-inp" value="${state.discountVal||''}" placeholder="0" inputmode="numeric">
    </div>
    <div class="summary">
      <div class="summary-row"><span>Tổng hàng</span><span>${fmt(t.sub)}đ</span></div>
      ${t.disc>0?`<div class="summary-row" style="color:var(--danger)"><span>Giảm</span><span>-${fmt(t.disc)}đ</span></div>`:''}
      <div class="summary-row grand"><span>Thanh toán</span><span>${fmt(t.grand)}đ</span></div>
      <div class="amount-words">${amountWords(t.grand)}</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('cart-modal')">Đóng</button>
      <button class="btn btn-danger" onclick="clearCart()">Xoá</button>
      <button class="btn btn-primary" onclick="printBill()">🖨 In bill</button>
    </div>`;
  showModal('cart-modal');
  // Discount handlers
  const di = $('disc-inp');
  if(di){di.oninput=()=>{state.discountVal=Number(di.value)||0;openCartModal();};}
  $('cart-modal-body').querySelectorAll('.discount-mode button').forEach(b=>b.onclick=()=>{state.discountMode=b.dataset.mode;openCartModal();});
}

// ====== PRINT & SAVE INVOICE ======
function printBill() {
  const t = calcTotal();
  const now = new Date();
  const no = 'HD'+now.toISOString().slice(2,10).replace(/-/g,'')+'-'+now.toTimeString().slice(0,8).replace(/:/g,'');
  const bill = $('print-bill');
  bill.style.display='block';
  bill.innerHTML = `<div style="font-family:'Times New Roman',serif;max-width:300px;margin:0 auto">
    <h2 style="text-align:center;margin:0">ĐẠI LÍ THÀNH HOÁ</h2>
    <p style="text-align:center;font-size:12px;margin:4px 0">Hoá đơn bán hàng</p>
    <p style="font-size:11px">Số: ${no}<br>Ngày: ${now.toLocaleString('vi')}</p>
    <hr>
    <table style="width:100%;font-size:12px;border-collapse:collapse">
    <tr><th style="text-align:left">SP</th><th>SL</th><th>Giá</th><th style="text-align:right">TT</th></tr>
    ${state.cart.map(i=>`<tr><td>${esc(i.name)}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${fmt(i.price)}</td><td style="text-align:right">${fmt(i.qty*i.price)}</td></tr>`).join('')}
    </table><hr>
    <p style="font-size:13px"><b>Tổng: ${fmt(t.sub)}đ</b></p>
    ${t.disc>0?`<p style="font-size:12px">Giảm: -${fmt(t.disc)}đ</p>`:''}
    <p style="font-size:15px"><b>THANH TOÁN: ${fmt(t.grand)}đ</b></p>
    <p style="font-size:11px;font-style:italic">${amountWords(t.grand)}</p>
    <p style="text-align:center;font-size:10px;margin-top:12px">Cảm ơn quý khách!</p>
  </div>`;
  // Save to history
  saveHistory({no,date:now.toISOString(),items:[...state.cart],sub:t.sub,disc:t.disc,grand:t.grand});
  // Save to Google Sheets
  if(isOnline()){apiPost('saveInvoice',{invoice:{invoiceNo:no,items:state.cart.map(i=>({code:i.code,qty:i.qty,price:i.price})),discount:t.disc}}).then(()=>showToast('✓ Đã lưu lên Sheet')).catch(e=>showToast('⚠ Lỗi lưu: '+e.message));}
  setTimeout(()=>{window.print();bill.style.display='none';state.cart=[];state.discountVal=0;renderAll();closeModal('cart-modal');showToast('✓ In xong, giỏ đã xoá');},200);
}

// ====== HISTORY ======
function getHistory(){try{return JSON.parse(localStorage.getItem('invoiceHistory')||'[]');}catch{return[];}}
function saveHistory(inv){const h=getHistory();h.unshift(inv);if(h.length>50)h.length=50;localStorage.setItem('invoiceHistory',JSON.stringify(h));}
function renderHistory(){
  const h=getHistory();
  $('history-list').innerHTML=h.length?h.map(i=>`<div class="history-item"><span class="history-no">${i.no}</span> — <b>${fmt(i.grand)}đ</b><div class="history-meta">${new Date(i.date).toLocaleString('vi')} · ${i.items.length} SP</div></div>`).join(''):'<p style="padding:20px;text-align:center;color:var(--muted)">Chưa có hoá đơn nào</p>';
}

// ====== BARCODE SCANNER ======
let scannerStream = null;
async function startScanner(){
  showModal('scan-modal');
  const box=$('scanner-box');
  try{
    scannerStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    box.innerHTML='<video autoplay playsinline></video><p style="text-align:center;font-size:11px;color:var(--muted);padding:8px">Đưa mã vạch vào khung hình</p>';
    box.querySelector('video').srcObject=scannerStream;
    // Simple polling with BarcodeDetector if available
    if('BarcodeDetector' in window){
      const det = new BarcodeDetector({formats:['ean_13','ean_8','code_128','code_39']});
      const video = box.querySelector('video');
      const scan = async()=>{
        if(!scannerStream) return;
        try{const codes=await det.detect(video);if(codes.length){const code=codes[0].rawValue;stopScanner();const p=PRODUCTS.find(x=>x.code===code);if(p){addToCart(code);showToast('📷 '+p.name);}else{showToast('⚠ Không tìm thấy: '+code);}return;}}catch{}
        requestAnimationFrame(scan);
      };
      video.onloadedmetadata=()=>scan();
    } else {
      box.innerHTML+='<p style="text-align:center;color:var(--warning);font-size:12px;padding:8px">Trình duyệt không hỗ trợ BarcodeDetector.<br>Hãy gõ mã vào ô tìm kiếm.</p>';
    }
  }catch(e){box.innerHTML='<p style="padding:20px;text-align:center;color:var(--danger)">Không truy cập được camera:<br>'+e.message+'</p>';}
}
function stopScanner(){if(scannerStream){scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null;}closeModal('scan-modal');}

// ====== AMOUNT TO WORDS ======
function amountWords(num){
  if(!num)return'Không đồng';num=Math.round(Math.abs(num));if(!num)return'Không đồng';
  const w=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
  const rd=(n,lead)=>{const h=Math.floor(n/100),t=Math.floor((n%100)/10),u=n%10;const p=[];
    if(h>0){p.push(w[h]+' trăm');if(t===0&&u>0)p.push('lẻ');}else if(lead&&(t>0||u>0)){p.push('không trăm');if(t===0&&u>0)p.push('lẻ');}
    if(t>1)p.push(w[t]+' mươi');else if(t===1)p.push('mười');
    if(u>0){if(t>=1&&u===1)p.push('mốt');else if(t>=1&&u===5)p.push('lăm');else p.push(w[u]);}return p.join(' ');};
  const b=Math.floor(num/1e9),m=Math.floor((num%1e9)/1e6),k=Math.floor((num%1e6)/1e3),o=num%1000;const p=[];
  if(b>0)p.push(rd(b,false)+' tỷ');if(m>0)p.push(rd(m,b>0)+' triệu');if(k>0)p.push(rd(k,m>0||b>0)+' nghìn');if(o>0)p.push(rd(o,k>0||m>0||b>0));
  let r=p.join(' ')+' đồng chẵn';return r.charAt(0).toUpperCase()+r.slice(1);
}

// ====== UI HELPERS ======
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2000);}
function showModal(id){$(id).classList.add('show');}
function closeModal(id){$(id).classList.remove('show');}
let confirmCb=null;
function showConfirm(msg,cb){$('confirm-msg').textContent=msg;confirmCb=cb;showModal('confirm-modal');}

// ====== RENDER ALL ======
function renderAll(){renderGrid();renderCartBar();}

// ====== EVENT LISTENERS ======
document.addEventListener('DOMContentLoaded',()=>{
  // Theme
  if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark');
  $('theme-btn').onclick=()=>{const d=document.documentElement;const dark=d.getAttribute('data-theme')==='dark';d.setAttribute('data-theme',dark?'':'dark');localStorage.setItem('theme',dark?'':'dark');$('theme-btn').textContent=dark?'🌙':'☀️';};

  // Search & Sort
  $('search').oninput=e=>{state.search=e.target.value;renderGrid();};
  $('sort').onchange=e=>{state.sort=e.target.value;renderGrid();};

  // Grid clicks (delegation)
  $('grid').onclick=e=>{
    const btn=e.target.closest('.add-btn');if(btn){e.stopPropagation();addToCart(btn.dataset.code);return;}
    const plus=e.target.closest('.cq-plus');if(plus){e.stopPropagation();updateQty(plus.dataset.code,1);return;}
    const minus=e.target.closest('.cq-minus');if(minus){e.stopPropagation();updateQty(minus.dataset.code,-1);return;}
    const card=e.target.closest('.card');if(card)addToCart(card.dataset.code);
  };

  // Cart bar
  $('cart-open').onclick=()=>openCartModal();
  $('cart-bar-summary').onclick=()=>openCartModal();
  $('cart-clear-quick').onclick=()=>clearCart();

  // Owner mode
  $('owner-btn').onclick=()=>{if(state.ownerMode){state.ownerMode=false;document.body.classList.remove('owner-mode');$('owner-btn').classList.remove('active');$('owner-btn').textContent='🔒';renderGrid();}else{$('pin-input').value='';showModal('pin-modal');setTimeout(()=>$('pin-input').focus(),100);}};
  $('pin-submit').onclick=()=>{if($('pin-input').value===OWNER_PIN){state.ownerMode=true;document.body.classList.add('owner-mode');$('owner-btn').classList.add('active');$('owner-btn').textContent='🔓';closeModal('pin-modal');showToast('👑 Chế độ chủ');renderGrid();}else{$('pin-input').classList.add('error');setTimeout(()=>$('pin-input').classList.remove('error'),400);}};
  $('pin-cancel').onclick=()=>closeModal('pin-modal');
  $('pin-input').onkeydown=e=>{if(e.key==='Enter')$('pin-submit').click();};

  // Scanner
  $('scan-btn').onclick=()=>startScanner();
  $('scan-close').onclick=()=>stopScanner();

  // History
  $('history-btn').onclick=()=>{renderHistory();showModal('history-modal');};
  $('history-close').onclick=()=>closeModal('history-modal');
  $('history-clear').onclick=()=>showConfirm('Xoá toàn bộ lịch sử?',()=>{localStorage.removeItem('invoiceHistory');renderHistory();showToast('✓ Đã xoá');closeModal('confirm-modal');});

  // Confirm modal
  $('confirm-ok').onclick=()=>{closeModal('confirm-modal');if(confirmCb)confirmCb();confirmCb=null;};
  $('confirm-cancel').onclick=()=>{closeModal('confirm-modal');confirmCb=null;};

  // Sync button
  $('sync-btn').onclick=()=>{showToast('🔄 Đang sync...');syncProducts();};

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m=>m.onclick=e=>{if(e.target===m){closeModal(m.id);if(m.id==='scan-modal')stopScanner();}});

  // Alert bar click -> filter low stock
  $('alert-bar').onclick=()=>{$('search').value='';state.search='';state.sort='stock-asc';$('sort').value='stock-asc';renderGrid();showToast('Hiển thị SP tồn thấp');};

  // Initial render
  renderAll();
  $('sync-status').textContent = isOnline() ? 'Đang kết nối...' : 'Offline (chưa cấu hình URL)';
  if(isOnline()) syncProducts();
  // Auto sync every 60s
  setInterval(()=>{if(isOnline())syncProducts();},60000);
});

// ====== PWA Service Worker ======
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
