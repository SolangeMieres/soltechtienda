// ** REGISTRO DEL SERVICE WORKER **
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // La ruta debe coincidir con la ubicación de sw.js (debe estar en la raíz del proyecto)
        navigator.serviceWorker.register('/sw.js') 
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration);
            })
            .catch(error => {
                console.log('Fallo al registrar ServiceWorker:', error);
            });
    });
}
// ---------------------------------


document.addEventListener('DOMContentLoaded', () => {
    console.log("Soltech Store cargada correctamente. Filtros y lógica de productos activados.");

    // 1. SELECTORES DE ELEMENTOS (Declaración Única de Variables)
    const productGrid = document.getElementById('product-grid');
    const productCards = Array.from(productGrid.getElementsByClassName('product-card'));
    
    const categoryFilter = document.getElementById('categories-filter');
    const textFilter = document.getElementById('text-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortOrder = document.getElementById('sort-order');
    
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    
    // Declaración ÚNICA del botón de instalación
    const installButton = document.getElementById('install-button');
    let deferredPrompt; 

    // --- LÓGICA PWA ---
    
    // Ocultamos el botón por defecto (el navegador lo mostrará si detecta PWA)
    // Nota: Dejamos el display: block en el CSS si quieres que se vea al cargar.
    // Opcional: installButton.style.display = 'none'; // Si quieres que JavaScript lo muestre
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Solo guardamos el evento para dispararlo
        e.preventDefault();
        deferredPrompt = e;
        // Si el navegador dispara el evento, mostramos el botón (si está oculto por defecto)
        installButton.style.display = 'block'; 
    });

    installButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (deferredPrompt) {
            // Dispara la ventana de instalación
            deferredPrompt.prompt();
            deferredPrompt = null;
        }
        // El botón queda visible para la siguiente recarga o si el navegador lo permite
    });
    // -------------------


    // Escuchar el botón principal de aplicar filtros
    applyFiltersBtn.addEventListener('click', applyAllFilters);
    
    // Escuchar el evento Enter en los campos de texto
    textFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyAllFilters();
        }
    });
    minPriceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyAllFilters();
        }
    });
    maxPriceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyAllFilters();
        }
    });

    // Escuchar el cambio en el orden (para aplicar inmediatamente)
    sortOrder.addEventListener('change', sortProducts);
    
    // Escuchar el botón de limpiar filtros
    clearFiltersBtn.addEventListener('click', clearFilters);


    // 2. FUNCIONES PRINCIPALES DE FILTRADO

    function applyAllFilters() {
        const selectedCategory = categoryFilter.value;
        const searchText = textFilter.value.toLowerCase().trim();
        const minPrice = parseFloat(minPriceInput.value) || 0;
        const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const price = parseFloat(card.getAttribute('data-price')) || 0;
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const fullText = title + ' ' + description;

            const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
            const priceMatch = price >= minPrice && price <= maxPrice;
            const textMatch = fullText.includes(searchText);

            if (categoryMatch && priceMatch && textMatch) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none';
            }
        });
        
        sortProducts();
    }

    // 3. FUNCIÓN DE ORDENAMIENTO
    function sortProducts() {
        const order = sortOrder.value;
        const visibleCards = productCards.filter(card => card.style.display !== 'none');

        if (order === 'none') {
            return; 
        }

        visibleCards.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price')) || 0;
            const priceB = parseFloat(b.getAttribute('data-price')) || 0;

            if (order === 'price-asc') {
                return priceA - priceB;
            } else if (order === 'price-desc') {
                return priceB - priceA;
            }
        });

        visibleCards.forEach(card => {
            productGrid.appendChild(card);
        });
    }

    // 4. FUNCIÓN DE LIMPIEZA
    function clearFilters() {
        categoryFilter.value = 'all';
        textFilter.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        sortOrder.value = 'none';
        
        productCards.forEach(card => {
            card.style.display = 'flex';
        });

        applyAllFilters();
    }
    
    applyAllFilters();
});