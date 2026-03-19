document.addEventListener('DOMContentLoaded', function() {
    const mobileBtn = document.getElementById('mobile_btn');
    const mobileMenu = document.getElementById('mobile_menu');
    const navLinks = document.querySelectorAll('#nav_list .nav-item a, #mobile_nav_list .nav-item a');

    mobileBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        mobileBtn.querySelector('i').classList.toggle('fa-x');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileBtn.querySelector('i').classList.remove('fa-x');
            }
        });
    });

    // highlight nav item based on section in view
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('#nav_list .nav-item').forEach(li => {
                    li.classList.remove('active');
                    const a = li.querySelector('a');
                    if (a) a.removeAttribute('aria-current');
                });
                const id = entry.target.id;
                const activeLink = document.querySelector(`#nav_list .nav-item a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.parentElement.classList.add('active');
                    activeLink.setAttribute('aria-current', 'page');
                }
                // mobile menu sync
                const activeLinkMobile = document.querySelector(`#mobile_nav_list .nav-item a[href="#${id}"]`);
                if (activeLinkMobile) {
                    document.querySelectorAll('#mobile_nav_list .nav-item').forEach(li => li.classList.remove('active'));
                    activeLinkMobile.parentElement.classList.add('active');
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

    // simple order form handler
    const orderForm = document.getElementById('order_form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Pedido enviado! Entraremos em contato em breve.');
            orderForm.reset();
            // In a real app, send form data to server here.
        });
    }

    // shopping cart functionality
    let cart = JSON.parse(localStorage.getItem('cocktail_cart')) || [];

    const cartBtn = document.getElementById('cart_btn');
    const cartSidebar = document.getElementById('cart_sidebar');
    const closeCartBtn = document.getElementById('close_cart');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const cartCountSpan = document.getElementById('cart_count');
    const cartItemsDiv = document.getElementById('cart_items');
    const cartTotalSpan = document.getElementById('cart_total');
    const checkoutBtn = document.getElementById('checkout_btn');

    // open cart
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
    });

    // close cart
    closeCartBtn.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    // add to cart
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            addItemToCart(name, price);
            cartSidebar.classList.add('active');
        });
    });

    function addItemToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        saveCart();
        renderCart();
    }

    function removeFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        saveCart();
        renderCart();
    }

    function updateQuantity(name, quantity) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity = Math.max(1, quantity);
            saveCart();
            renderCart();
        }
    }

    function saveCart() {
        localStorage.setItem('cocktail_cart', JSON.stringify(cart));
    }

    function renderCart() {
        cartItemsDiv.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
            cartCountSpan.textContent = '0';
            cartTotalSpan.textContent = '0.00';
            checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-qty">
                    <button onclick="window.updateQty('${item.name}', ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="window.updateQty('${item.name}', ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item-remove" onclick="window.removeItem('${item.name}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });

        cartCountSpan.textContent = totalItems;
        cartTotalSpan.textContent = total.toFixed(2);
        checkoutBtn.disabled = false;
    }

    // expose functions to global scope for onclick handlers
    window.removeItem = removeFromCart;
    window.updateQty = updateQuantity;

    // checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        const cartSummary = cart.map(item => `${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
        alert(`Pedido resumido:\n${cartSummary}\n\nTotal: R$ ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}\n\nVocê será redirecionado para o formulário de pedido.`);
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        cartSidebar.classList.remove('active');
    });

    // initial render
    renderCart();
});