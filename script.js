document.addEventListener('DOMContentLoaded', () => {
    // --- General Selectors ---
    const allModals = document.querySelectorAll('.modal-backdrop');
    const closeBtns = document.querySelectorAll('.modal-close-btn');

    // --- Authentication Selectors ---
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignupLinks = document.querySelectorAll('#showSignup, #showSignupFromLogin');
    const showLoginLinks = document.querySelectorAll('#showLogin, #showLoginFromSignup');
    
    // --- UI State Selectors ---
    const loginLi = document.getElementById('loginLi');
    const signupLi = document.getElementById('signupLi');
    const logoutLi = document.getElementById('logoutLi');
    const userProfile = document.getElementById('userProfile');
    const userNameSpan = document.getElementById('userName');
    const favoritesLi = document.getElementById('favoritesLi');

    // --- Favorites Selectors ---
    const favoritesBtn = document.getElementById('favoritesBtn');
    const favoritesModal = document.getElementById('favoritesModal');
    const favoritesList = document.getElementById('favoritesList');
    
    // --- Car Detail Modal Selectors ---
    const carDetailModal = document.getElementById('carDetailModal');

    // --- Toast Notification ---
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(message, isError = false) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.style.backgroundColor = isError ? '#e74c3c' : '#28a745';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- Modal Management ---
    function openModal(modal) { if (modal) modal.style.display = 'flex'; }
    function closeModal(modal) { if (modal) modal.style.display = 'none'; }

    loginBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
    signupBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); });
    favoritesBtn?.addEventListener('click', (e) => { e.preventDefault(); renderFavorites(); openModal(favoritesModal); });

    showSignupLinks.forEach(link => link?.addEventListener('click', (e) => { e.preventDefault(); closeModal(loginModal); openModal(signupModal); }));
    showLoginLinks.forEach(link => link?.addEventListener('click', (e) => { e.preventDefault(); closeModal(signupModal); openModal(loginModal); }));

    allModals.forEach(modal => modal.addEventListener('click', function(e) { if (e.target === this) closeModal(this); }));
    closeBtns.forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal-backdrop'))));

    // --- Authentication ---
    function updateAuthState() {
        const token = sessionStorage.getItem('authToken');
        const username = sessionStorage.getItem('username');

        if (token && username) {
            loginLi.style.display = 'none';
            signupLi.style.display = 'none';
            userProfile.style.display = 'flex';
            favoritesLi.style.display = 'list-item';
            logoutLi.style.display = 'list-item'; // Show logout button
            userNameSpan.textContent = `Welcome, ${username}!`;
            updateFavoriteButtonsUI();
        } else {
            loginLi.style.display = 'list-item';
            signupLi.style.display = 'list-item';
            userProfile.style.display = 'none';
            favoritesLi.style.display = 'none';
            logoutLi.style.display = 'none'; // Hide logout button
            userNameSpan.textContent = 'Welcome!';
        }
    }
    
    logoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('username');
        showToast('You have been logged out.');
        updateAuthState();
    });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            if (data.username) {
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('username', data.username);
                showToast(`Welcome back, ${data.username}!`);
                closeModal(loginModal);
                updateAuthState();
            } else {
                throw new Error("Login successful, but username not provided.");
            }
        } catch (err) {
            showToast(err.message, true);
        }
    });

    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        try {
            const res = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            showToast('Account created! Please log in.');
            closeModal(signupModal);
            openModal(loginModal);
        } catch (err) {
            showToast(err.message, true);
        }
    });

    // --- View Car Details ---
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.view-details-btn')) {
            const card = e.target.closest('.car-card');
            if (!card) return;
            document.getElementById('modalImage').src = card.querySelector('img').src;
            document.getElementById('modalTitle').textContent = card.dataset.name;
            document.getElementById('modalPrice').textContent = card.querySelector('.price').textContent;
            document.getElementById('modalYear').textContent = card.dataset.year;
            document.getElementById('modalKm').textContent = `${card.dataset.km} km`;
            document.getElementById('modalFuel').textContent = card.dataset.fuel;
            document.getElementById('modalTransmission').textContent = card.dataset.transmission;
            openModal(carDetailModal);
        }
    });

    // --- Favorites / Wishlist Functionality ---
    function getFavorites() { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
    function saveFavorites(favs) { localStorage.setItem('favorites', JSON.stringify(favs)); }
    function toggleFavorite(carName) {
        let favorites = getFavorites();
        if (favorites.includes(carName)) {
            favorites = favorites.filter(fav => fav !== carName);
            showToast('Removed from favorites.');
        } else {
            favorites.push(carName);
            showToast('Added to favorites!');
        }
        saveFavorites(favorites);
        updateFavoriteButtonsUI();
    }
    function updateFavoriteButtonsUI() {
        const favorites = getFavorites();
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const cardName = btn.closest('.car-card').dataset.name;
            btn.classList.toggle('active', favorites.includes(cardName));
        });
    }
    function renderFavorites() {
        if (!favoritesList) return;
        favoritesList.innerHTML = '';
        const favorites = getFavorites();
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p>You have no favorite cars yet.</p>';
            return;
        }
        const allCarCards = document.querySelectorAll('#carListings .car-card');
        favorites.forEach(favName => {
            for (const card of allCarCards) {
                if (card.dataset.name === favName) {
                    favoritesList.appendChild(card.cloneNode(true));
                    break;
                }
            }
        });
    }
    document.body.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            if (!sessionStorage.getItem('authToken')) {
                showToast('Please log in to add favorites.');
                openModal(loginModal);
                return;
            }
            toggleFavorite(favBtn.closest('.car-card').dataset.name);
        }
    });

    // --- Inventory Page Filtering ---
    const filtersBar = document.querySelector('.filters-bar');
    if (filtersBar) {
        const applyFiltersBtn = document.querySelector('.filter-btn');
        applyFiltersBtn.addEventListener('click', () => {
            const makeValue = document.getElementById('makeFilterSidebar').value;
            const priceValue = document.getElementById('priceFilterSidebar').value;
            const selectedFuels = Array.from(document.querySelectorAll('input[name="fuel"]:checked')).map(cb => cb.value);
            const inventoryCarCards = document.querySelectorAll('.car-listings .car-card');
            let visibleCount = 0;
            inventoryCarCards.forEach(card => {
                const makeMatch = (makeValue === 'all') || (card.dataset.make === makeValue);
                const price = parseInt(card.dataset.price, 10);
                const priceMatch = priceValue === 'all' || (priceValue === '1500000' ? price > 1200000 : price <= parseInt(priceValue));
                const fuelMatch = (selectedFuels.length === 0) || selectedFuels.includes(card.dataset.fuel);
                if (makeMatch && priceMatch && fuelMatch) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            document.getElementById('noResultsMessage').style.display = visibleCount === 0 ? 'block' : 'none';
        });
    }

    // --- Sell Car Multi-Step Form Logic ---
    const sellCarForm = document.getElementById('sellCarForm');
    if (sellCarForm) {
        const steps = Array.from(sellCarForm.querySelectorAll('.form-step'));
        const progressSteps = Array.from(document.querySelectorAll('.progress-bar .step'));
        let currentStep = 0;
        const updateFormStep = () => {
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            progressSteps.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < currentStep) step.classList.add('completed');
                else if (index === currentStep) step.classList.add('active');
            });
        };
        const validateStep = (stepIndex) => {
            const currentInputs = steps[stepIndex].querySelectorAll('input[required]');
            let isValid = true;
            currentInputs.forEach(input => {
                input.classList.remove('input-error');
                if (!input.checkValidity()) {
                    isValid = false;
                    input.classList.add('input-error');
                }
            });
            return isValid;
        };
        sellCarForm.addEventListener('click', e => {
            if (e.target.matches('.next-btn')) {
                if (validateStep(currentStep)) {
                    if (currentStep < steps.length - 1) {
                        currentStep++;
                        updateFormStep();
                    }
                } else {
                    showToast('Please fill all required fields.', true);
                }
            } else if (e.target.matches('.prev-btn')) {
                if (currentStep > 0) {
                    currentStep--;
                    updateFormStep();
                }
            }
        });
        sellCarForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateStep(currentStep)) {
                showToast('Please fill all required fields.', true);
                return;
            }
            const carData = {
                make: document.getElementById('make').value, model: document.getElementById('model').value,
                year: document.getElementById('year').value, kilometers: document.getElementById('km').value,
                ownership: sellCarForm.querySelector('input[name="ownership"]:checked').value,
                condition: sellCarForm.querySelector('input[name="condition"]:checked').value,
                issues: document.getElementById('issues').value || 'None',
                sellerName: document.getElementById('name').value, sellerPhone: document.getElementById('phone').value,
                sellerEmail: document.getElementById('email').value
            };
            try {
                const res = await fetch('http://localhost:3000/api/sell-car', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carData)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                showToast(data.message);
                sellCarForm.reset();
                currentStep = 0;
                updateFormStep();
            } catch (err) {
                showToast(err.message, true);
            }
        });
        updateFormStep();
    }

    // --- Contact Form Logic ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const messageInput = document.getElementById('contactMessage');
            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                showToast('Please fill out all fields.', true);
                return;
            }
            const contactData = {
                name: nameInput.value,
                email: emailInput.value,
                message: messageInput.value,
            };
            try {
                const res = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactData),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                showToast(data.message);
                contactForm.reset();
            } catch (err) {
                showToast(err.message, true);
            }
        });
    }

    // --- Initial Page Load ---
    updateAuthState();
});