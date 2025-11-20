
  const products = [
    { id: 1, title: "Resident evil 7 ", img: "header.jpg", price: 10000, genre: "Action" },
    { id: 2, title: "The Last of Us 2", img: "один из нас.jpg", price: 15000, genre: "Action" },
    { id: 3, title: "Days Gone", img: "жизнь полсе.jpg", price: 10000, genre: "Action" },
    { id: 4, title: "Ghost of Tsushima", img: "capsule_616x353.jpg", price: 15000, genre: "Adventure" },
    { id: 5, title: "Horizon Zero Dawn", img: "ss_cf69250b6b7144244fe5ec715a82e9cf52398715.1920x1080.jpg", price: 3490, genre: "RPG" },
    { id: 6, title: "Uncharted 4", img: "uncharted-4-a-thiefs-end-guide.jpg", price: 5000, genre: "Adventure" }
  ];

  const STORAGE_KEY = 'ps4_magazin_cart';

  // --- Утилиты ---
  function money(v){ return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '₸'; }

  function readCart(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e){
      console.error('readCart error', e);
      return {};
    }
  }
  function writeCart(cart){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      updateCartCountUI();
    } catch(e){
      console.error('writeCart error', e);
    }
  }

  function addToCart(id, qty = 1){
    const cart = readCart();
    cart[id] = (cart[id] || 0) + qty;
    if(cart[id] <= 0) delete cart[id];
    writeCart(cart);
    flashAdded(id);
  }

  function removeFromCart(id){
    const cart = readCart();
    if(cart[id]) delete cart[id];
    writeCart(cart);
  }

  function setQty(id, qty){
    const cart = readCart();
    if(qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    writeCart(cart);
  }

  function cartTotalCount(){
    const cart = readCart();
    return Object.values(cart).reduce((s,n)=>s+n,0);
  }

  function cartTotalSum(){
    const cart = readCart();
    let sum = 0;
    for(const idStr of Object.keys(cart)){
      const id = +idStr;
      const p = products.find(x => x.id === id);
      if(p) sum += p.price * cart[idStr];
    }
    return sum;
  }

  function updateCartCountUI(){
    const count = cartTotalCount();
    document.querySelectorAll('#cartCount').forEach(el => {
      if(el) el.textContent = count;
    });
  }

  // Визуальный эффект добавления (короткий)
  function flashAdded(id){
    // Найдём карточку с data-id и добавим класс
    const btn = document.querySelector(`[data-buy="${id}"]`);
    if(btn){
      btn.textContent = 'Добавлено';
      btn.disabled = true;
      setTimeout(()=>{ if(btn){ btn.textContent = 'Купить'; btn.disabled=false;} }, 900);
    }
  }

  // --- Рендер каталога (страница catalog.html) ---
  function renderCatalog(){
    const list = document.getElementById('gameList');
    if(!list) return;
    list.innerHTML = '';
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${escapeHtml(p.title)}">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="price">${money(p.price)}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
          <a class="btn" href="product.html?id=${p.id}">Подробнее</a>
          <button class="btn outline" data-buy="${p.id}">Купить</button>
        </div>
      `;
      list.appendChild(card);
    });

    // Прикрепляем обработчики к кнопкам "Купить"
    document.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.currentTarget.getAttribute('data-buy');
        addToCart(id, 1);
        // краткое уведомление
        showToast(`Добавлено: ${products.find(p=>p.id===id).title}`);
      });
    });
  }

  // --- Удобный тултип/тоаст снизу ---
  function showToast(text){
    let toast = document.getElementById('__ps4_toast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = '__ps4_toast';
      toast.style.position = 'fixed';
      toast.style.left = '50%';
      toast.style.bottom = '30px';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = '#111';
      toast.style.color = '#fff';
      toast.style.padding = '12px 18px';
      toast.style.border = '1px solid rgba(255,255,255,0.06)';
      toast.style.borderRadius = '10px';
      toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto';
    setTimeout(()=>{ toast.style.opacity = '0'; toast.style.pointerEvents = 'none'; }, 1400);
  }

  // --- Страница cart.html: отрисовка корзины ---
  function renderCartPage(){
    if(!document.getElementById('cartItems')) return;
    const cart = readCart();
    const itemsWrap = document.getElementById('cartItems');
    itemsWrap.innerHTML = '';

    const keys = Object.keys(cart);
    if(keys.length === 0){
      document.getElementById('cartEmpty').style.display = '';
      document.getElementById('cartFooter').style.display = 'none';
      return;
    } else {
      document.getElementById('cartEmpty').style.display = 'none';
      document.getElementById('cartFooter').style.display = '';
    }

    keys.forEach(idStr => {
      const id = +idStr;
      const qty = cart[idStr];
      const p = products.find(x => x.id === id);
      if(!p) return;

      const row = document.createElement('div');
      row.className = 'cart-row';
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '120px 1fr 120px';
      row.style.gap = '12px';
      row.style.alignItems = 'center';
      row.style.padding = '12px';
      row.style.borderBottom = '1px solid rgba(255,255,255,0.03)';

      row.innerHTML = `
        <div><img src="${p.img}" alt="${escapeHtml(p.title)}" style="width:100%; border-radius:10px"></div>
        <div>
          <div style="font-weight:800; margin-bottom:6px">${escapeHtml(p.title)}</div>
          <div style="color:var(--muted, #9aa); font-size:14px">${escapeHtml(p.genre)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800">${money(p.price * qty)}</div>
          <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:8px">
            <button class="qty-btn" data-id="${id}" data-op="minus">−</button>
            <div style="min-width:28px; text-align:center; padding-top:4px">${qty}</div>
            <button class="qty-btn" data-id="${id}" data-op="plus">+</button>
          </div>
          <button class="remove-btn" data-id="${id}" style="margin-top:8px; background:transparent; color:#ff8; border:1px solid rgba(255,255,255,0.04); padding:6px 8px; border-radius:8px">Удалить</button>
        </div>
      `;
      itemsWrap.appendChild(row);
    });

    // attach qty handlers
    document.querySelectorAll('.qty-btn').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = +e.currentTarget.getAttribute('data-id');
        const op = e.currentTarget.getAttribute('data-op');
        const cart = readCart();
        const cur = cart[id] || 0;
        if(op === 'plus') cart[id] = cur + 1;
        else cart[id] = Math.max(0, cur - 1);
        if(cart[id] === 0) delete cart[id];
        writeCart(cart);
        renderCartPage();
      });
    });

    // attach remove
    document.querySelectorAll('.remove-btn').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = +e.currentTarget.getAttribute('data-id');
        removeFromCart(id);
        renderCartPage();
      });
    });

    // update total
    document.getElementById('cartTotal').textContent = money(cartTotalSum());
  }

// --- Очистка корзины и чек-аут ---
function initCartActions(){
  const clearBtn = document.getElementById('clearCart');
  if(clearBtn) {
    clearBtn.addEventListener('click', ()=>{
      if(confirm('Очистить корзину?')) {
        writeCart({});
        renderCartPage();
        showToast('Корзина очищена');
      }
    });
  }
  const checkoutBtn = document.getElementById('checkout');
  if(checkoutBtn) {
    checkoutBtn.addEventListener('click', checkoutOrder);
  }
}

// === Новый Checkout ===
function checkoutOrder() {
  const total = cartTotalSum();
  if(total === 0){
    alert("Корзина пуста!");
    return;
  }

  // Форма (минимальная)
  const name = prompt("Введите ваше имя:");
  const phone = prompt("Введите номер телефона:");
  const email = prompt("Введите Email:");

  if(!name || !phone) {
    alert("Заполните хотя бы имя и телефон!");
    return;
  }

  // Сохраняем заказ
  const orders = JSON.parse(localStorage.getItem('ps4_orders') || '[]');

  const newOrder = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    name, phone, email,
    items: readCart(),
    total
  };

  orders.push(newOrder);
  localStorage.setItem('ps4_orders', JSON.stringify(orders));

  // Чистим корзину
  writeCart({});
  renderCartPage();

  alert("Спасибо! Заказ оформлен.");
}


  // --- Product page: если есть product.html, наполняем по ?id= ---
  function renderProductPage(){
    const page = document.getElementById('productPage');
    if(!page) return;
    const params = new URLSearchParams(location.search);
    const id = +params.get('id');
    const p = products.find(x=>x.id===id);
    if(!p){
      page.innerHTML = `<p>Игра не найдена. <a href="catalog.html">Вернуться в каталог</a></p>`;
      return;
    }
    page.innerHTML = `
      <div class="product-visual"><img src="${p.img}" alt="${escapeHtml(p.title)}" style="width:100%; border-radius:12px"></div>
      <div class="product-info">
        <h1>${escapeHtml(p.title)}</h1>
        <p style="color:var(--muted,#9aa)">${escapeHtml(p.genre)}</p>
        <p style="margin-top:12px">${escapeHtml(p.desc || 'Описание отсутствует.')}</p>
        <div class="buy-row" style="margin-top:18px">
          <div style="font-size:20px;font-weight:800">${money(p.price)}</div>
          <button class="btn" id="buyNow">Купить</button>
        </div>
      </div>
    `;
    const buyNow = document.getElementById('buyNow');
    if(buyNow) buyNow.addEventListener('click', ()=>{ addToCart(p.id, 1); showToast('Добавлено в корзину'); });
  }

  // --- Escape helper to avoid injecting titles with HTML ---
  function escapeHtml(str){
    if(!str) return '';
    return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  // --- Инициализация страницы ---
  function init(){
    // update header counters
    updateCartCountUI();

    // catalog render if present
    renderCatalog();

    // render cart page if present
    renderCartPage();
    initCartActions();

    // product page
    renderProductPage();

    // search & filter bindings (if elements present on catalog.html)
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    if(searchInput){
      searchInput.addEventListener('input', () => applyFilters());
      if(genreFilter) genreFilter.addEventListener('change', () => applyFilters());
      // initial fill/filter
      applyFilters();
    }

    // Fallback: attach buy buttons also on DOM elements created elsewhere
    document.addEventListener('click', (e) => {
      const target = e.target;
      if(target && target.matches && target.matches('[data-buy]')) {
        const id = +target.getAttribute('data-buy');
        addToCart(id, 1);
        showToast('Добавлено в корзину');
      }
    });
  }

  function applyFilters(){
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const list = document.getElementById('gameList');
    if(!list) return;
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const gen = genreFilter ? genreFilter.value : '';
    list.innerHTML = '';
    products.filter(p=>{
      if(gen && p.genre !== gen) return false;
      if(q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    }).forEach(p => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${escapeHtml(p.title)}">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="price">${money(p.price)}</p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
          <a class="btn" href="product.html?id=${p.id}">Подробнее</a>
          <button class="btn outline" data-buy="${p.id}">Купить</button>
        </div>
      `;
      list.appendChild(card);
    });

    // rebind: buttons have delegated listener above for data-buy
    updateCartCountUI();
  }

// init on DOM ready
document.addEventListener('DOMContentLoaded', init);
