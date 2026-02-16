// ==================== VÍAS VERDES DE MURCIA - MAPBOX GL JS ====================
// Reemplaza 'MAPBOX_ACCESS_TOKEN_AQUI' con tu token de Mapbox
// Obtén tu token en: https://account.mapbox.com/access-tokens/

mapboxgl.accessToken = 'MAPBOX_ACCESS_TOKEN_AQUI';

// ==================== CONFIGURATION ====================
const CONFIG = {
    // Cambiar estas coordenadas para centrar el mapa en otra zona
    center: [-1.3, 37.85], // [longitud, latitud] - Centro aproximado de la Región de Murcia
    zoom: 8,
    minZoom: 6,
    maxZoom: 18,
    // Estilos de mapa disponibles
    styles: {
        streets: 'mapbox://styles/mapbox/streets-v12',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
        outdoors: 'mapbox://styles/mapbox/outdoors-v12'
    }
};

// ==================== POI ICONS & COLORS ====================
const POI_CONFIG = {
    mirador: {
        color: '#F59E0B',
        icon: 'viewpoint',
        label: 'Mirador',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/></svg>'
    },
    tunel: {
        color: '#6B7280',
        icon: 'tunnel',
        label: 'Túnel',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16M4 20V10a8 8 0 1116 0v10M8 20v-6a4 4 0 018 0v6"/></svg>'
    },
    estacion: {
        color: '#9E1B32',
        icon: 'rail',
        label: 'Estación',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M12 19v2M8 21h8M8 7h8M8 11h8M8 15h8"/></svg>'
    },
    patrimonio: {
        color: '#92400E',
        icon: 'castle',
        label: 'Patrimonio',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>'
    },
    servicio: {
        color: '#0EA5E9',
        icon: 'information',
        label: 'Servicio',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    },
    playa: {
        color: '#06B6D4',
        icon: 'beach',
        label: 'Playa',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M5 21l7-8 7 8"/></svg>'
    },
    puente: {
        color: '#D97706',
        icon: 'bridge',
        label: 'Puente',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16h16M4 16l2-8M4 16l-2 4M20 16l-2-8M20 16l2 4M6 8h12M8 8v8M16 8v8M12 8v8"/></svg>'
    },
    panel_interpretativo: {
        color: '#3B82F6',
        icon: 'information',
        label: 'Panel Informativo',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v4M12 16h.01"/></svg>'
    },
    punto_conflictivo: {
        color: '#DC2626',
        icon: 'danger',
        label: 'Precaución',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>'
    },
    albergue: {
        color: '#059669',
        icon: 'lodging',
        label: 'Albergue',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/></svg>'
    },
    area_descanso: {
        color: '#84CC16',
        icon: 'picnic-site',
        label: 'Área Descanso',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>'
    },
    pueblo: {
        color: '#7C3AED',
        icon: 'town',
        label: 'Pueblo',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-6h2l-7-7-7 7h2v6"/><path d="M9 21v-4h2v4"/></svg>'
    },
    restaurante: {
        color: '#E11D48',
        icon: 'restaurant',
        label: 'Restaurante',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>'
    },
    aparcamiento: {
        color: '#2563EB',
        icon: 'parking',
        label: 'Aparcamiento',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>'
    },
    fuente_agua: {
        color: '#0891B2',
        icon: 'drinking-water',
        label: 'Fuente de Agua',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6M8 4l4 4 4-4"/><path d="M6 12a6 6 0 0012 0"/><path d="M6 12H4a8 8 0 0016 0h-2"/></svg>'
    },
    camping: {
        color: '#15803D',
        icon: 'campsite',
        label: 'Camping',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/><path d="M12 14l-4 8h8l-4-8z"/></svg>'
    },
    centro_salud: {
        color: '#E11D48',
        icon: 'hospital',
        label: 'Centro Salud',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v12M6 12h12"/><rect x="3" y="3" width="18" height="18" rx="3"/></svg>'
    }
};

// ==================== DIFFICULTY CONFIG ====================
const DIFFICULTY_CONFIG = {
    'fácil': { color: '#22c55e', label: 'Fácil', class: 'badge-easy' },
    'media': { color: '#f59e0b', label: 'Media', class: 'badge-medium' },
    'difícil': { color: '#ef4444', label: 'Difícil', class: 'badge-hard' }
};

// ==================== STATE ====================
let map;
let routesData = null;
let poisData = null;
let activeFilters = {
    routes: [],
    poiTypes: [],
    difficulties: []
};
let isSatellite = false;
let is3D = false;
let markers = [];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    await initMap();
    await loadData();
    renderUI();
    hideLoader();
});

async function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: CONFIG.styles.streets,
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        minZoom: CONFIG.minZoom,
        maxZoom: CONFIG.maxZoom,
        attributionControl: false,
        pitch: 0,
        bearing: 0
    });

    // Wait for map to load
    await new Promise(resolve => map.on('load', resolve));

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    // Add scale
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');
}

async function loadData() {
    try {
        // Sustituye estas URLs por tus archivos GeoJSON reales
        const [routesResponse, poisResponse] = await Promise.all([
            fetch('public/data/routes.geojson'),
            fetch('public/data/pois.geojson')
        ]);

        routesData = await routesResponse.json();
        poisData = await poisResponse.json();

        // Initialize filters with all routes visible
        activeFilters.routes = routesData.features.map(f => f.properties.id_ruta);
        activeFilters.poiTypes = Object.keys(POI_CONFIG);
        activeFilters.difficulties = Object.keys(DIFFICULTY_CONFIG);

        console.log('Data loaded:', {
            routes: routesData.features.length,
            pois: poisData.features.length
        });

    } catch (error) {
        console.error('Error loading data:', error);
        // Use fallback data if fetch fails
        routesData = { type: 'FeatureCollection', features: [] };
        poisData = { type: 'FeatureCollection', features: [] };
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
}

// ==================== RENDER UI ====================
function renderUI() {
    addRoutesLayer(routesData);
    addPoisLayer(poisData);
    renderRoutesList();
    renderPOIsList();
    setupFilters();
    renderLegend();
}

// ==================== ROUTES LAYER ====================
function addRoutesLayer(data) {
    // Add source
    if (map.getSource('routes')) {
        map.getSource('routes').setData(data);
    } else {
        map.addSource('routes', {
            type: 'geojson',
            data: data
        });
    }

    // Add line layer for each route
    data.features.forEach((feature, index) => {
        const routeId = feature.properties.id_ruta;
        const layerId = `route-${routeId}`;

        if (!map.getLayer(layerId)) {
            // Add casing (outline) layer
            map.addLayer({
                id: `${layerId}-casing`,
                type: 'line',
                source: 'routes',
                filter: ['==', ['get', 'id_ruta'], routeId],
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 8,
                    'line-opacity': 0.8
                },
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
                }
            });

            // Add main line layer
            map.addLayer({
                id: layerId,
                type: 'line',
                source: 'routes',
                filter: ['==', ['get', 'id_ruta'], routeId],
                paint: {
                    'line-color': feature.properties.color || '#9E1B32',
                    'line-width': 5,
                    'line-opacity': 1
                },
                layout: {
                    'line-cap': 'round',
                    'line-join': 'round'
                }
            });

            // Add hover effect
            map.on('mouseenter', layerId, () => {
                map.getCanvas().style.cursor = 'pointer';
                map.setPaintProperty(layerId, 'line-width', 7);
            });

            map.on('mouseleave', layerId, () => {
                map.getCanvas().style.cursor = '';
                map.setPaintProperty(layerId, 'line-width', 5);
            });

            // Add click handler
            map.on('click', layerId, (e) => {
                const properties = e.features[0].properties;
                showRoutePopup(properties, e.lngLat);
            });
        }
    });
}

// ==================== POIs LAYER ====================
function addPoisLayer(data) {
    // Clear existing markers
    markers.forEach(m => m.remove());
    markers = [];

    data.features.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const poiConfig = POI_CONFIG[props.tipo] || POI_CONFIG.servicio;

        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = poiConfig.color;
        el.innerHTML = poiConfig.svg;
        el.setAttribute('data-poi-id', props.id);
        el.setAttribute('data-route-id', props.id_ruta);
        el.setAttribute('data-poi-type', props.tipo);

        // Create marker
        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(coords)
        .addTo(map);

        // Add click handler
        el.addEventListener('click', () => {
            showPOIPopup(props, coords);
        });

        markers.push(marker);
    });
}

// ==================== POPUPS ====================
function showRoutePopup(properties, lngLat) {
    const diffConfig = DIFFICULTY_CONFIG[properties.dificultad] || DIFFICULTY_CONFIG['fácil'];
    const hasTour = properties.url_tour_360 && properties.url_tour_360.length > 0;

    const popupHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>${properties.nombre}</h3>
                <p>${properties.distancia_km} km · ${Math.round(properties.tiempo_estimado_min / 60)}h ${properties.tiempo_estimado_min % 60}min</p>
            </div>
            <div class="popup-body">
                <p class="popup-description">${properties.descripcion_corta}</p>
                <div class="route-badges" style="margin-bottom: 12px;">
                    <span class="badge ${diffConfig.class}">${diffConfig.label}</span>
                    <span class="badge" style="background: #e5e7eb; color: #374151;">${properties.superficie}</span>
                    ${hasTour ? '<span class="badge badge-tour360">360°</span>' : ''}
                </div>
                <div class="popup-actions">
                    ${hasTour ? `<a href="#" onclick="open360Tour('${properties.url_tour_360}'); return false;" class="popup-btn popup-btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                        </svg>
                        Ver Tour 360°
                    </a>` : ''}
                    <a href="#" onclick="openRouteModal('${properties.id_ruta}'); return false;" class="popup-btn popup-btn-secondary">
                        Más info
                    </a>
                </div>
            </div>
        </div>
    `;

    new mapboxgl.Popup({ closeOnClick: true, maxWidth: '320px' })
        .setLngLat(lngLat)
        .setHTML(popupHTML)
        .addTo(map);
}

function showPOIPopup(properties, coords) {
    const poiConfig = POI_CONFIG[properties.tipo] || POI_CONFIG.servicio;
    const route = routesData.features.find(f => f.properties.id_ruta === properties.id_ruta);
    const routeName = route ? route.properties.nombre : 'Ruta desconocida';
    const hasTour = properties.url_tour && properties.url_tour.length > 0;
    const hasImage = properties.foto_thumb_url && properties.foto_thumb_url.length > 0;

    const popupHTML = `
        <div class="popup-content">
            <div class="popup-header" style="background: linear-gradient(135deg, ${poiConfig.color}, ${poiConfig.color}dd);">
                <h3>${properties.titulo}</h3>
                <p>${poiConfig.label} · ${routeName}</p>
            </div>
            <div class="popup-body">
                ${hasImage ? `<img src="${properties.foto_thumb_url}" alt="${properties.titulo}" class="popup-image">` : ''}
                <p class="popup-description">${properties.descripcion}</p>
                <div class="popup-actions">
                    ${hasTour ? `<a href="#" onclick="open360Tour('${properties.url_tour}'); return false;" class="popup-btn popup-btn-primary">
                        Ver Tour 360°
                    </a>` : ''}
                    ${properties.url_mas_info ? `<a href="${properties.url_mas_info}" target="_blank" rel="noopener" class="popup-btn popup-btn-secondary">
                        Más info
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;

    new mapboxgl.Popup({ closeOnClick: true, maxWidth: '320px' })
        .setLngLat(coords)
        .setHTML(popupHTML)
        .addTo(map);
}

// ==================== ROUTE MODAL ====================
function openRouteModal(routeId) {
    const route = routesData.features.find(f => f.properties.id_ruta === routeId);
    if (!route) return;

    const props = route.properties;
    const diffConfig = DIFFICULTY_CONFIG[props.dificultad] || DIFFICULTY_CONFIG['fácil'];
    const routePOIs = poisData.features.filter(f => f.properties.id_ruta === routeId)
        .sort((a, b) => a.properties.orden_ruta - b.properties.orden_ruta);
    const hasTour = props.url_tour_360 && props.url_tour_360.length > 0;

    const modalHTML = `
        <div class="modal-header" style="background: linear-gradient(135deg, ${props.color}, ${props.color}cc);">
            <button class="modal-close" onclick="closeRouteModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
            <div>
                <span class="badge ${diffConfig.class}" style="margin-bottom: 8px; display: inline-block;">${diffConfig.label}</span>
                <h2 class="modal-title">${props.nombre}</h2>
                <p class="modal-subtitle">${props.descripcion_corta}</p>
            </div>
        </div>
        <div class="modal-body">
            <div class="modal-stats">
                <div class="modal-stat">
                    <div class="modal-stat-value">${props.distancia_km}</div>
                    <div class="modal-stat-label">Kilómetros</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${Math.floor(props.tiempo_estimado_min / 60)}h ${props.tiempo_estimado_min % 60}m</div>
                    <div class="modal-stat-label">Duración</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${props.superficie}</div>
                    <div class="modal-stat-label">Superficie</div>
                </div>
                <div class="modal-stat">
                    <div class="modal-stat-value">${props.perfil_elevacion || 'Suave'}</div>
                    <div class="modal-stat-label">Perfil</div>
                </div>
            </div>

            ${routePOIs.length > 0 ? `
            <div class="modal-section">
                <h3 class="modal-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Puntos de Interés (${routePOIs.length})
                </h3>
                <div class="modal-pois">
                    ${routePOIs.map(poi => {
                        const poiConfig = POI_CONFIG[poi.properties.tipo] || POI_CONFIG.servicio;
                        return `
                        <div class="modal-poi" onclick="flyToPOI(${poi.geometry.coordinates[0]}, ${poi.geometry.coordinates[1]}); closeRouteModal();">
                            <div class="poi-icon poi-${poi.properties.tipo}">
                                ${poiConfig.svg}
                            </div>
                            <div class="poi-info">
                                <div class="poi-title">${poi.properties.titulo}</div>
                                <div class="poi-route">${poiConfig.label}</div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <div class="modal-actions">
                ${hasTour ? `
                <button class="modal-btn modal-btn-primary" onclick="open360Tour('${props.url_tour_360}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                    </svg>
                    Explorar en 360°
                </button>
                ` : ''}
                <button class="modal-btn modal-btn-secondary" onclick="zoomToRoute('${routeId}'); closeRouteModal();">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                    Ver en mapa
                </button>
                ${props.url_info ? `
                <a href="${props.url_info}" target="_blank" rel="noopener" class="modal-btn modal-btn-secondary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    Más info
                </a>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('modalContent').innerHTML = modalHTML;
    document.getElementById('routeModal').classList.remove('hidden');
}

function closeRouteModal() {
    document.getElementById('routeModal').classList.add('hidden');
}

// ==================== 360 TOUR ====================
function open360Tour(url) {
    if (!url) return;
    document.getElementById('tour360Frame').src = url;
    document.getElementById('tour360Modal').classList.remove('hidden');
}

function close360Tour() {
    document.getElementById('tour360Modal').classList.add('hidden');
    document.getElementById('tour360Frame').src = '';
}

// ==================== SIDEBAR LISTS ====================
function renderRoutesList() {
    const container = document.getElementById('routesContent');
    container.innerHTML = routesData.features.map((feature, index) => {
        const props = feature.properties;
        const diffConfig = DIFFICULTY_CONFIG[props.dificultad] || DIFFICULTY_CONFIG['fácil'];
        const hasTour = props.url_tour_360 && props.url_tour_360.length > 0;

        return `
        <div class="route-card" onclick="openRouteModal('${props.id_ruta}')">
            <div class="route-card-header">
                <div class="route-number" style="background: ${props.color};">${index + 1}</div>
                <div class="route-info">
                    <div class="route-name">${props.nombre}</div>
                    <div class="route-description">${props.descripcion_corta}</div>
                </div>
            </div>
            <div class="route-stats">
                <div class="route-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
                    </svg>
                    ${props.distancia_km} km
                </div>
                <div class="route-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    ${Math.floor(props.tiempo_estimado_min / 60)}h ${props.tiempo_estimado_min % 60}m
                </div>
                <div class="route-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19h16M4 15l4-6 4 4 4-8 4 10"/>
                    </svg>
                    ${props.perfil_elevacion || 'Suave'}
                </div>
            </div>
            <div class="route-badges">
                <span class="badge ${diffConfig.class}">${diffConfig.label}</span>
                <span class="badge" style="background: #e5e7eb; color: #374151;">${props.superficie}</span>
                ${hasTour ? '<span class="badge badge-tour360">360°</span>' : ''}
            </div>
        </div>
        `;
    }).join('');
}

function renderPOIsList() {
    const container = document.getElementById('poisContent');
    const sortedPOIs = [...poisData.features].sort((a, b) => {
        const routeA = a.properties.id_ruta;
        const routeB = b.properties.id_ruta;
        if (routeA !== routeB) return routeA.localeCompare(routeB);
        return a.properties.orden_ruta - b.properties.orden_ruta;
    });

    container.innerHTML = sortedPOIs.map(feature => {
        const props = feature.properties;
        const poiConfig = POI_CONFIG[props.tipo] || POI_CONFIG.servicio;
        const route = routesData.features.find(f => f.properties.id_ruta === props.id_ruta);
        const routeName = route ? route.properties.nombre.replace('Vía Verde ', '') : '';

        return `
        <div class="poi-card" onclick="flyToPOI(${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]})">
            <div class="poi-icon poi-${props.tipo}">
                ${poiConfig.svg}
            </div>
            <div class="poi-info">
                <div class="poi-title">${props.titulo}</div>
                <div class="poi-route">${routeName} · ${poiConfig.label}</div>
            </div>
        </div>
        `;
    }).join('');
}

// ==================== FILTERS ====================
function setupFilters() {
    // Route filters
    const routeFiltersContainer = document.getElementById('routeFilters');
    routeFiltersContainer.innerHTML = routesData.features.map(feature => {
        const props = feature.properties;
        return `
        <label class="filter-checkbox">
            <input type="checkbox" value="${props.id_ruta}" checked onchange="toggleRouteFilter('${props.id_ruta}')">
            <span class="filter-color-dot" style="background: ${props.color};"></span>
            <span>${props.nombre.replace('Vía Verde ', '')}</span>
        </label>
        `;
    }).join('');

    // POI type filters
    const poiFiltersContainer = document.getElementById('poiFilters');
    poiFiltersContainer.innerHTML = Object.entries(POI_CONFIG).map(([key, config]) => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${key}" checked onchange="togglePOIFilter('${key}')">
            <span class="filter-color-dot" style="background: ${config.color};"></span>
            <span>${config.label}</span>
        </label>
    `).join('');

    // Difficulty filters
    const difficultyFiltersContainer = document.getElementById('difficultyFilters');
    difficultyFiltersContainer.innerHTML = Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => `
        <label class="filter-checkbox">
            <input type="checkbox" value="${key}" checked onchange="toggleDifficultyFilter('${key}')">
            <span class="filter-color-dot" style="background: ${config.color};"></span>
            <span>${config.label}</span>
        </label>
    `).join('');
}

function toggleRouteFilter(routeId) {
    const index = activeFilters.routes.indexOf(routeId);
    if (index > -1) {
        activeFilters.routes.splice(index, 1);
    } else {
        activeFilters.routes.push(routeId);
    }
    applyFilters();
}

function togglePOIFilter(poiType) {
    const index = activeFilters.poiTypes.indexOf(poiType);
    if (index > -1) {
        activeFilters.poiTypes.splice(index, 1);
    } else {
        activeFilters.poiTypes.push(poiType);
    }
    applyFilters();
}

function toggleDifficultyFilter(difficulty) {
    const index = activeFilters.difficulties.indexOf(difficulty);
    if (index > -1) {
        activeFilters.difficulties.splice(index, 1);
    } else {
        activeFilters.difficulties.push(difficulty);
    }
    applyFilters();
}

function applyFilters() {
    // Filter routes
    routesData.features.forEach(feature => {
        const routeId = feature.properties.id_ruta;
        const difficulty = feature.properties.dificultad;
        const isVisible = activeFilters.routes.includes(routeId) &&
                         activeFilters.difficulties.includes(difficulty);

        const layerId = `route-${routeId}`;
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
            map.setLayoutProperty(`${layerId}-casing`, 'visibility', isVisible ? 'visible' : 'none');
        }
    });

    // Filter POI markers
    markers.forEach(marker => {
        const el = marker.getElement();
        const routeId = el.getAttribute('data-route-id');
        const poiType = el.getAttribute('data-poi-type');
        const route = routesData.features.find(f => f.properties.id_ruta === routeId);
        const difficulty = route ? route.properties.dificultad : 'fácil';

        const isVisible = activeFilters.routes.includes(routeId) &&
                         activeFilters.poiTypes.includes(poiType) &&
                         activeFilters.difficulties.includes(difficulty);

        el.style.display = isVisible ? 'flex' : 'none';
    });
}

function resetFilters() {
    activeFilters.routes = routesData.features.map(f => f.properties.id_ruta);
    activeFilters.poiTypes = Object.keys(POI_CONFIG);
    activeFilters.difficulties = Object.keys(DIFFICULTY_CONFIG);

    // Reset checkboxes
    document.querySelectorAll('#routeFilters input, #poiFilters input, #difficultyFilters input').forEach(checkbox => {
        checkbox.checked = true;
    });

    applyFilters();
}

// ==================== LEGEND ====================
function renderLegend() {
    const container = document.getElementById('legendItems');
    container.innerHTML = routesData.features.map(feature => {
        const props = feature.properties;
        return `
        <div class="legend-item" onclick="zoomToRoute('${props.id_ruta}')" title="Clic para ver esta ruta">
            <div class="legend-color" style="background: ${props.color};"></div>
            <span class="legend-name">${props.nombre.replace('Vía Verde ', '')}</span>
            <span class="legend-distance">${props.distancia_km} km</span>
        </div>
        `;
    }).join('');
}

// ==================== NAVIGATION ====================
function zoomToRoute(routeId) {
    const route = routesData.features.find(f => f.properties.id_ruta === routeId);
    if (!route) return;

    const bounds = getBoundsForRoute(route);
    map.fitBounds(bounds, {
        padding: 80,
        duration: 1000
    });
}

function getBoundsForRoute(route) {
    const coords = route.geometry.coordinates;
    const bounds = coords.reduce((bounds, coord) => {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
    return bounds;
}

function flyToPOI(lng, lat) {
    map.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000
    });
}

function resetView() {
    map.flyTo({
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        duration: 1000,
        pitch: 0,
        bearing: 0
    });
}

function locateUser() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                map.flyTo({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: 14,
                    duration: 1000
                });

                // Add user marker
                new mapboxgl.Marker({ color: '#3b82f6' })
                    .setLngLat([position.coords.longitude, position.coords.latitude])
                    .addTo(map);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('No se pudo obtener tu ubicación');
            }
        );
    } else {
        alert('Tu navegador no soporta geolocalización');
    }
}

// ==================== MAP CONTROLS ====================
function toggleSatellite() {
    isSatellite = !isSatellite;
    const style = isSatellite ? CONFIG.styles.satellite : CONFIG.styles.streets;

    map.setStyle(style);

    // Re-add data layers after style change
    map.once('style.load', () => {
        addRoutesLayer(routesData);
        addPoisLayer(poisData);
        applyFilters();
    });

    // Update button style
    const btn = document.getElementById('satelliteBtn');
    btn.classList.toggle('bg-murcia', isSatellite);
    btn.classList.toggle('text-white', isSatellite);
}

function toggle3DMode() {
    is3D = !is3D;

    if (is3D) {
        map.easeTo({
            pitch: 60,
            bearing: -20,
            duration: 1000
        });
    } else {
        map.easeTo({
            pitch: 0,
            bearing: 0,
            duration: 1000
        });
    }

    // Update button style
    const btn = document.getElementById('btn3D');
    btn.classList.toggle('bg-murcia', is3D);
    btn.classList.toggle('text-white', is3D);
}

// ==================== TABS ====================
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="tab"]').forEach(btn => {
        btn.classList.remove('text-murcia', 'border-murcia', 'bg-murcia/5', 'border-b-2');
        btn.classList.add('text-gray-500');
    });

    const activeTab = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    activeTab.classList.remove('text-gray-500');
    activeTab.classList.add('text-murcia', 'border-murcia', 'bg-murcia/5', 'border-b-2');

    // Update content visibility
    document.getElementById('routesContent').classList.toggle('hidden', tab !== 'routes');
    document.getElementById('poisContent').classList.toggle('hidden', tab !== 'pois');
    document.getElementById('filtersContent').classList.toggle('hidden', tab !== 'filters');
}

// ==================== SEARCH ====================
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        renderRoutesList();
        renderPOIsList();
        return;
    }

    // Filter routes
    const filteredRoutes = routesData.features.filter(f =>
        f.properties.nombre.toLowerCase().includes(query) ||
        f.properties.descripcion_corta.toLowerCase().includes(query)
    );

    // Filter POIs
    const filteredPOIs = poisData.features.filter(f =>
        f.properties.titulo.toLowerCase().includes(query) ||
        f.properties.descripcion.toLowerCase().includes(query)
    );

    // Update UI with filtered results
    // This is a simplified version - you might want to create separate render functions
    console.log('Search results:', {
        routes: filteredRoutes.length,
        pois: filteredPOIs.length
    });
});

// ==================== MOBILE SIDEBAR TOGGLE ====================
document.querySelector('#sidebar header').addEventListener('click', () => {
    if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.toggle('expanded');
    }
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRouteModal();
        close360Tour();
    }
});

console.log('Vías Verdes de Murcia - Map initialized');
