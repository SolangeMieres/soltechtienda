// =========================================================
// 1. REGISTRO DEL SERVICE WORKER (Debe ir fuera de DOMContentLoaded)
// =========================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // La ruta debe ser absoluta, apuntando a la raíz del sitio de Vercel
        navigator.serviceWorker.register('/sw.js') 
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration);
            })
            .catch(error => {
                console.log('Fallo al registrar ServiceWorker:', error);
            });
    });
}


// =========================================================
// 2. LÓGICA PWA DEL BOTÓN (Debe ir fuera de DOMContentLoaded)
// =========================================================
let deferredPrompt;
const installButton = document.getElementById('install-button');

// Ocultamos el botón al inicio, solo se mostrará si el navegador lo permite
if (installButton) {
    installButton.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Si el navegador dispara el evento, mostramos el botón
    if (installButton) {
        installButton.style.display = 'block';
    }
});

if (installButton) {
    installButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (deferredPrompt) {
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó la instalación PWA');
                } else {
                    console.log('Usuario rechazó la instalación PWA');
                }
                // Ocultamos el botón después de la interacción
                installButton.style.display = 'none'; 
                deferredPrompt = null;
            });
        }
    });
}


// =========================================================
// 3. LÓGICA DEL CARRUSEL AUTOMÁTICO
// Debe ir fuera de DOMContentLoaded para inicializarse inmediatamente
// =========================================================

let currentSlide = 0;
const totalSlides = 2; // Hay 2 slides de promoción

function showSlide(index) {
    const container = document.getElementById('hero-carousel-container');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (!container || dots.length === 0) return; 

    // Cálculo para asegurar el loop
    currentSlide = index % totalSlides; 
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }

    // Mueve el carrusel: Ajuste para 2 slides (0% y -100%)
    const offset = -currentSlide * 100 / totalSlides; // Se ajusta a la división del width en CSS
    container.style.transform = `translateX(${offset}%)`;

    // Actualiza los puntos indicadores
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === currentSlide) {
            dot.classList.add('active');
        }
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

// Inicializar el carrusel al cargar y establecer el intervalo automático
window.addEventListener('load', () => {
    // Escuchar clics en los puntos para navegación manual
    const dots = document.querySelectorAll('.carousel-dots .dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            // El data-slide es 1 o 2, le restamos 1 para el índice 0 o 1
            const slideIndex = parseInt(dot.getAttribute('data-slide')) - 1;
            showSlide(slideIndex);
        });
    });

    // Iniciar carrusel automático
    setInterval(nextSlide, 5000); // Cambia de slide cada 5 segundos
});

// Llamamos showSlide(0) al inicio para asegurar que el primer slide se muestre correctamente
// Usamos DOMContentLoaded para garantizar que los elementos HTML existan.
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);

    // =========================================================
    // 4. LÓGICA DE FILTROS Y ORDENAMIENTO (Solo para index.html)
    // =========================================================
    console.log("Soltech Store cargada correctamente. Inicializando filtros.");

    // SELECTORES DE ELEMENTOS
    const productGrid = document.getElementById('product-grid');
    
    // *** PROTECCIÓN CRÍTICA CONTRA NULL ***
    // Si no hay grilla de productos (ej: en contacto.html), salimos.
    if (!productGrid) {
        console.log("No hay grilla de productos en esta página. Finalizando lógica de filtros.");
        return; 
    }
    // **********************************************************************************

    const productCards = Array.from(productGrid.getElementsByClassName('product-card'));
    
    const categoryFilter = document.getElementById('categories-filter');
    const textFilter = document.getElementById('text-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortOrder = document.getElementById('sort-order');
    
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    
    // LISTENERS
    applyFiltersBtn.addEventListener('click', applyAllFilters);
    sortOrder.addEventListener('change', sortProducts);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Escuchar el evento Enter en los campos de texto
    const filterInputs = [textFilter, minPriceInput, maxPriceInput];
    filterInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyAllFilters();
            }
        });
    });


    // FUNCIÓN PRINCIPAL DE FILTRADO
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

            // Filtros booleanos
            const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
            const priceMatch = price >= minPrice && price <= maxPrice;
            const textMatch = fullText.includes(searchText);

            // Mostrar u ocultar
            if (categoryMatch && priceMatch && textMatch) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none';
            }
        });
        
        // Ordenar los productos visibles después del filtrado
        sortProducts();
    }

    // FUNCIÓN DE ORDENAMIENTO
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

        // Reinsertar las tarjetas ordenadas en la grilla
        visibleCards.forEach(card => {
            productGrid.appendChild(card);
        });
    }

    // FUNCIÓN DE LIMPIEZA DE FILTROS
    function clearFilters() {
        categoryFilter.value = 'all';
        textFilter.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        sortOrder.value = 'none';
        
        applyAllFilters(); // Esto restablece la visibilidad y el orden
    }
    
    // Aplicar filtros al inicio para asegurar el orden/visibilidad inicial
    applyAllFilters();
});