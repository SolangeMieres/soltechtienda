// =========================================================
// 1. REGISTRO DEL SERVICE WORKER (Debe ir fuera de DOMContentLoaded)
// Esto asegura que la PWA sea detectable por el navegador.
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
// Controla el botón "Instalar App".
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
// 3. LÓGICA DE FILTROS Y ORDENAMIENTO (Dentro de DOMContentLoaded)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Soltech Store cargada correctamente. Filtros y lógica de productos activados.");

    // SELECTORES DE ELEMENTOS
    const productGrid = document.getElementById('product-grid');
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

// =========================================================
// 5. MANEJO DE MENSAJE DE ÉXITO DE CONTACTO
// =========================================================
function checkUrlForSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        // Mostrar la alerta de éxito
        alert('¡Gracias por contactarnos! Tu mensaje fue enviado con éxito. Te responderemos pronto.');
        
        // Limpiar el parámetro de la URL para que el mensaje no se muestre en futuras recargas
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Llama a esta función al cargar la página de inicio.
// Puedes añadir la llamada dentro de tu DOMContentLoaded en script.js, o llamarla directamente aquí si está al final:
checkUrlForSuccess();
});