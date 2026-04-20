document.addEventListener('DOMContentLoaded', async() => {
    let allProducts = [];
    try {
        const response = await fetch('assets/data/products.json');
        const data = await response.json();
        allProducts = data.products;
    } catch (error) {
        showToast('បរាជ័យក្នុងការបញ្ជូនទិឍមៗផលិតផល (Failed to load products)', 'error');
        return;
    }

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    updateCartCount();

    function updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) cartCountElement.innerText = count;
    }

    await renderProducts(allProducts);

    window.handleAction = (e, productId, action) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        const existingItem = cartItems.find(item => item.productId === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartCount();

        if (action === 'buy-now') {
            window.location.href = 'cart.html';
        } else {
            showToast(`បានបញ្ចូល ${product.name} ទៅកន្ត្រក!`);
            animateCartIcon();
        }
    };

    function animateCartIcon() {
        const cartIcon = document.querySelector('.fa-shopping-bag');
        if (cartIcon) {
            cartIcon.parentElement.classList.add('animate-float');
            setTimeout(() => cartIcon.parentElement.classList.remove('animate-float'), 1000);
        }
    }

    const searchInput = document.querySelector('input[type="search"]');
    const searchBtn = document.querySelector('button[type="submit"]');

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (query.length > 1) {
                    showAutocomplete(query, allProducts);
                } else {
                    hideAutocomplete();
                }
            }, 300);
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performSearch(searchInput.value.trim(), allProducts);
            });
        }

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchInput.value.trim(), allProducts);
                hideAutocomplete();
            }
        });
    }

    document.querySelectorAll('.list-group-item[data-filter]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-filter');
            
            document.querySelectorAll('.list-group-item[data-filter]').forEach(l => l.classList.remove('active', 'text-primary'));
            link.classList.add('active', 'text-primary');

            const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
            renderProducts(filtered);

            const title = document.getElementById('category-title');
            if (title) title.innerHTML = `${link.textContent} (<span class="text-primary">${filtered.length}</span>)`;
        });
    });

    const sortSelect = document.querySelector('select.form-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            let sorted = [...allProducts];
            if (val === '1') sorted.sort((a,b) => a.price - b.price);
            else if (val === '2') sorted.sort((a,b) => b.price - a.price);
            else if (val === '3') sorted.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            renderProducts(sorted);
        });
    }
});

async function renderProducts(products) {
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.style.opacity = '0';
        setTimeout(() => {
            productGrid.innerHTML = products.map(product => `
                <div class="col-6 col-md-3 col-lg-2 mb-4 product-item">
                    <div class="card-gaming h-100" data-product-id="${product.id}" style="cursor: pointer;" onclick="location.href='product-detail.html?id=${product.id}'">
                        <div class="position-relative overflow-hidden">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
                            ${product.category === 'account' ? '<span class="position-absolute top-0 end-0 bg-accent text-white px-2 py-1 small fw-bold rounded-start m-2">HOT</span>' : ''}
                        </div>
                        <div class="card-body text-center p-3">
                            <h6 class="text-main fw-bold mb-1 text-truncate">${product.name}</h6>
                            <p class="text-muted small mb-2 text-truncate">${product.description}</p>
                            <p class="price-gaming mb-3">$${product.price.toFixed(2)}</p>
                             <button class="btn btn-gaming w-100 btn-sm" onclick="handleAction(event, ${product.id}, '${product.category === 'topup' ? 'buy-now' : 'add-to-cart'}')">
                                 ${product.category === 'topup' ? 'ទិញឥឡូវ' : 'បញ្ចូលកន្ត្រក'}
                             </button>
                        </div>
                    </div>
                </div>
            `).join('');
            productGrid.style.opacity = '1';
        }, 300);
    }

    const featuredRow = document.querySelector('[data-type="featured-row"]');
    if (featuredRow) {
        const featured = products.slice(0, 6);
        featuredRow.innerHTML = featured.map(product => `
            <div class="col-6 col-md-4 col-lg-2 mb-4">
                <div class="card-gaming h-100" data-product-id="${product.id}" style="cursor: pointer;" onclick="location.href='product-detail.html?id=${product.id}'">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body text-center p-3">
                        <h6 class="text-main fw-bold mb-1 text-truncate">${product.name}</h6>
                        <p class="price-gaming mb-3">$${product.price.toFixed(2)}</p>
                         <button class="btn btn-gaming btn-sm w-100" onclick="handleAction(event, ${product.id}, 'buy-now')">ទិញភេ្លាមៗ</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function performSearch(query, products) {
    if (!query) return;
    const searchLower = query.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.nameEn.toLowerCase().includes(searchLower)
    );

    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        renderProducts(filtered);
    } else {
        localStorage.setItem('searchQuery', query);
        window.location.href = 'category.html';
    }
}

function showAutocomplete(query, products) {
    hideAutocomplete();
    const results = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    if (results.length === 0) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'autocomplete';
    dropdown.className = 'autocomplete-dropdown position-absolute shadow mt-1 p-2 rounded-4';
    dropdown.style.width = document.querySelector('input[type="search"]').offsetWidth + 'px';
    dropdown.style.left = document.querySelector('input[type="search"]').offsetLeft + 'px';
    dropdown.style.background = 'white';
    dropdown.style.zIndex = '2000';

    dropdown.innerHTML = results.map(p => `
        <div class="suggestion-item p-2 rounded-3 hover-primary" data-id="${p.id}">
            <div class="d-flex align-items-center">
                <img src="${p.image}" style="width: 40px; height: 40px; object-fit: cover;" class="rounded-2 me-3">
                <span class="text-main fw-600">${p.name}</span>
            </div>
        </div>
    `).join('');

    document.querySelector('input[type="search"]').parentNode.appendChild(dropdown);

    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const p = products.find(x => x.id == item.getAttribute('data-id'));
            performSearch(p.name, products);
            hideAutocomplete();
        });
    });
}

function hideAutocomplete() {
    const autocomplete = document.getElementById('autocomplete');
    if (autocomplete) {
        autocomplete.remove();
    }
}

function sortProducts(products, sortBy) {
    let sorted = [...products];

    switch (sortBy) {
        case '1':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case '2':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case '3':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case '4':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        default:
            sorted = products;
    }

    renderProducts(sorted);
}

async function toggleWishlist(button) {
    const productId = parseInt(button.getAttribute('data-product-id'));
    const product = products.find(p => p.id === productId);

    if (!product) return;

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const index = wishlist.findIndex(item => item.productId === productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        button.classList.remove('btn-danger');
        button.classList.add('btn-outline-danger');
        button.innerHTML = '<i class="far fa-heart"></i>';
    } else {
        wishlist.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category
        });
        button.classList.remove('btn-outline-danger');
        button.classList.add('btn-danger');
        button.innerHTML = '<i class="fas fa-heart"></i>';
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = "9999";
        document.body.appendChild(toastContainer);
    }

    const bgClass = type === 'error' ? 'bg-danger' :
        type === 'warning' ? 'bg-warning' :
        type === 'info' ? 'bg-info' : 'bg-success';

    const toastHTML = `
    <div class="toast align-items-center text-bg-${bgClass} border-0 show shadow" role="alert" aria-live="assertive" aria-atomic="true" style="animation: fadeInUp 0.5s ease-out;">
      <div class="d-flex">
        <div class="toast-body" style="font-weight: bold;">
          <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    </div>`;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    setTimeout(() => {
        const toasts = toastContainer.querySelectorAll('.toast');
        const lastToast = toasts[toasts.length - 1];
        if (lastToast) {
            lastToast.classList.remove('show');
            setTimeout(() => lastToast.remove(), 300);
        }
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.autocomplete-dropdown { max-height: 300px; overflow-y: auto; z-index: 10000; }
.suggestion-item { padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #eee; }
.suggestion-item:hover { background-color: #f8f9fa; }
.suggestion-item:last-child { border-bottom: none; }
`;
document.head.appendChild(style);