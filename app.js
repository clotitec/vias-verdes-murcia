// ==================== VÍAS VERDES DE MURCIA - APP ====================

let map, markers = [], routeLayers = [], routeSources = [], activeFilter = 'all', selectedFeature = null, murciaBoundary = null, elevationMarker = null, isSatellite = false;
const SNAP = { COLLAPSED: 140, HALF: window.innerHeight * 0.45, FULL: window.innerHeight - 60 };
let currentSnap = SNAP.COLLAPSED;
const lightStyle = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const satelliteSource = {
    type: 'raster',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    attribution: 'Tiles &copy; Esri'
};

// ==================== INIT ====================
window.addEventListener('load', async () => {
    await initMap();
    await loadBoundary();
    renderDesktopSidebar();
    renderMobileSheet();
    renderDetailModal();
    render360Fullscreen();
    setupBottomSheet();
    setupSearch();

    // El mapa ya está cargado (initMap espera 'load'), renderizar directamente
    renderUI();
});

async function initMap() {
    map = new maplibregl.Map({ container: 'map', style: lightStyle, center: CONFIG.center, zoom: CONFIG.zoom, attributionControl: false });
    await new Promise(r => map.on('load', r));
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
}

async function loadBoundary() {
    try {
        const response = await fetch('https://nominatim.openstreetmap.org/search?q=Región de Murcia,Spain&format=json&polygon_geojson=1&limit=1', { headers: { 'User-Agent': 'ViasVerdesMurcia/1.0' } });
        const data = await response.json();
        if (data?.[0]?.geojson) {
            const geojson = data[0].geojson;
            murciaBoundary = geojson.type === 'Polygon' ? geojson.coordinates[0] : geojson.coordinates.reduce((a, b) => b[0].length > a.length ? b[0] : a, []);
            addBoundaryMask();
        }
    } catch (e) { console.log('Using fallback boundary'); }
}

function addBoundaryMask() {
    if (!murciaBoundary) return;
    const world = [[-180, 90], [180, 90], [180, -90], [-180, -90], [-180, 90]];
    if (!map.getSource('mask')) {
        map.addSource('mask', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [world, murciaBoundary] } } });
        map.addLayer({ id: 'mask-fill', type: 'fill', source: 'mask', paint: { 'fill-color': '#000', 'fill-opacity': isSatellite ? 0.45 : 0.35 } });
    }
    if (!map.getSource('boundary-line')) {
        map.addSource('boundary-line', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [...murciaBoundary, murciaBoundary[0]] } } });
        map.addLayer({ id: 'boundary-stroke', type: 'line', source: 'boundary-line', paint: { 'line-color': '#FFFFFF', 'line-width': 2, 'line-opacity': 0.5 } });
    }
}

function toggleSatellite() {
    isSatellite = !isSatellite;
    const btn = document.getElementById('satelliteBtn');
    if (isSatellite) {
        if (!map.getSource('satellite')) {
            map.addSource('satellite', satelliteSource);
        }
        map.addLayer({ id: 'satellite-layer', type: 'raster', source: 'satellite' }, 'mask-fill');
        btn.classList.add('active');
        if (map.getLayer('mask-fill')) map.setPaintProperty('mask-fill', 'fill-opacity', 0.5);
    } else {
        if (map.getLayer('satellite-layer')) map.removeLayer('satellite-layer');
        btn.classList.remove('active');
        if (map.getLayer('mask-fill')) map.setPaintProperty('mask-fill', 'fill-opacity', 0.35);
    }
}

// ==================== DYNAMIC HTML ====================
function renderDesktopSidebar() {
    const container = document.getElementById('desktopSidebar');
    if (!container) return;

    const operativas = viasVerdes.filter(v => v.status === 'operational').length;
    const proximamente = viasVerdes.filter(v => v.status === 'coming_soon').length;

    container.innerHTML = `
        <div class="p-6 pb-4" style="border-bottom:1px solid rgba(255,255,255,0.3);">
            <div class="flex items-center gap-3 mb-5">
                <div class="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden" style="background:rgba(255,255,255,0.6); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.5); box-shadow:0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5);">
                    <img src="assets/images/logo principal vias verdes de murcia_1.webp" class="w-full h-full object-contain" alt="Vías Verdes">
                </div>
                <div class="flex-1">
                    <h1 class="text-lg font-bold leading-tight" style="color:var(--text-primary);">Vías Verdes</h1>
                    <p class="text-sm font-medium" style="color:var(--text-secondary);">Región de Murcia</p>
                </div>
            </div>
            <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" id="searchDesktop" placeholder="Buscar vía verde..." class="w-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-murcia/20 transition-all" style="background:rgba(255,255,255,0.55); backdrop-filter:blur(12px); border-radius:14px; border:1px solid rgba(255,255,255,0.5); box-shadow:inset 0 1px 2px rgba(0,0,0,0.04);">
            </div>
        </div>
        <div class="px-4 py-3" style="background:rgba(158,27,50,0.04); border-bottom:1px solid rgba(255,255,255,0.3);">
            <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-murcia flex items-center gap-2">
                    <span class="text-lg">🚴</span> ${viasVerdes.length} Vías Verdes
                </span>
                <div class="flex gap-2 text-xs">
                    <span class="px-2 py-1 rounded-full font-semibold" style="background:rgba(158,27,50,0.12); color:#9E1B32;">${operativas} Operativa</span>
                    <span class="px-2 py-1 rounded-full font-semibold" style="background:rgba(245,158,11,0.12); color:#92400e;">${proximamente} Próx.</span>
                </div>
            </div>
        </div>
        <div id="filterContainerDesktop" class="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar" style="border-bottom:1px solid rgba(255,255,255,0.3);"></div>
        <div id="listDesktop" class="flex-1 overflow-y-auto p-4 space-y-3 subtle-scrollbar"></div>`;

    const searchInput = document.getElementById('searchDesktop');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterRoutes(e.target.value));
    }
    updateFilters();
    renderList();
}

function renderMobileSheet() {
    const operativas = viasVerdes.filter(v => v.status === 'operational').length;
    const proximamente = viasVerdes.filter(v => v.status === 'coming_soon').length;

    document.getElementById('bottomSheet').innerHTML = `
        <div id="sheetHandle" class="w-full py-4 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0"><div class="w-10 h-1.5 rounded-full" style="background:rgba(0,0,0,0.12);"></div></div>
        <div class="flex flex-col flex-1 overflow-hidden">
            <div class="flex items-center justify-between px-4 pb-3 shrink-0">
                <div class="flex items-center gap-3 w-full">
                    <div class="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden" style="background:rgba(255,255,255,0.6); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.5); box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                        <img src="assets/images/logo principal vias verdes de murcia_1.webp" class="w-full h-full object-contain" alt="Vías Verdes">
                    </div>
                    <div class="flex-1">
                        <p class="font-bold leading-tight" style="color:var(--text-primary);">Vías Verdes</p>
                        <p class="text-sm" style="color:var(--text-secondary);">Región de Murcia</p>
                        <p class="text-xs mt-1" style="color:var(--text-muted);">${operativas} Operativa · ${proximamente} Próx.</p>
                    </div>
                </div>
            </div>
            <div id="filterContainerMobile" class="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0"></div>
            <div id="listMobile" class="flex-1 overflow-y-auto px-4 pb-safe space-y-3"></div>
        </div>`;
}

function renderDetailModal() {
    document.getElementById('detailModal').innerHTML = `
        <div class="absolute inset-0 bg-black/25 backdrop-blur-md" onclick="closeDetail()"></div>
        <div class="absolute bottom-0 inset-x-0 rounded-t-3xl lg:rounded-3xl lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[480px] lg:max-h-[85vh] flex flex-col overflow-hidden max-h-[90vh] animate-slide-up" style="background:rgba(255,255,255,0.82); backdrop-filter:blur(40px) saturate(180%); -webkit-backdrop-filter:blur(40px) saturate(180%); box-shadow:0 40px 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.4);">
            <!-- Hero Image -->
            <div id="detailHeader" class="relative h-52 shrink-0 bg-cover bg-center transition-all" style="background:rgba(0,0,0,0.04);">
                <div id="detailMapPreview" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-murcia/20 to-murcia-light/20">
                    <svg class="w-16 h-16 text-murcia/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                </div>
                <button onclick="closeDetail()" class="absolute top-4 right-4 w-10 h-10 text-white rounded-full flex items-center justify-center touch-target active:scale-95 transition-transform" style="background:rgba(0,0,0,0.25); backdrop-filter:blur(16px);"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
                <!-- Type Badge — Glass Pill -->
                <div id="detailTypeBadge" class="absolute bottom-4 left-4 px-3 py-1.5 text-white text-xs font-bold rounded-full" style="background:rgba(158,27,50,0.85); backdrop-filter:blur(8px); box-shadow:0 2px 8px rgba(158,27,50,0.3);"></div>
            </div>
            <div class="p-6 overflow-y-auto flex-1">
                <!-- Title & Location -->
                <h2 id="detailTitle" class="text-xl font-bold leading-tight mb-1" style="color:var(--text-primary);"></h2>
                <p id="detailSubtitle" class="text-sm mb-5 flex items-center gap-1" style="color:var(--text-secondary);"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span></span></p>

                <!-- Stats Grid — Glass -->
                <div id="detailStats" class="grid grid-cols-3 gap-4 mb-6"></div>

                <!-- Elevation Profile — Glass -->
                <div id="elevationContainer" class="hidden mb-6">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider" style="color:var(--text-primary);">
                            <svg class="w-4 h-4 text-murcia" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Perfil Altimétrico
                        </span>
                        <div id="elevationIndicator" class="text-[10px] font-bold" style="color:var(--text-muted);">Pasa el cursor para ver altitud</div>
                    </div>
                    <div class="glass-stat relative w-full h-28 p-2">
                        <canvas id="elevationChart"></canvas>
                        <div id="elevationLine" class="absolute top-0 bottom-0 w-px bg-murcia/50 hidden pointer-events-none"></div>
                    </div>
                    <!-- Elevation Stats — Glass -->
                    <div id="elevationStats" class="grid grid-cols-3 gap-2 mt-3">
                        <div class="glass-stat p-3 text-center">
                            <div class="text-[10px] uppercase tracking-wide" style="color:var(--text-muted);">Subida</div>
                            <div id="elevGain" class="text-base font-bold text-murcia">-</div>
                        </div>
                        <div class="glass-stat p-3 text-center">
                            <div class="text-[10px] uppercase tracking-wide" style="color:var(--text-muted);">Máx</div>
                            <div id="elevMax" class="text-base font-bold" style="color:var(--text-primary);">-</div>
                        </div>
                        <div class="glass-stat p-3 text-center">
                            <div class="text-[10px] uppercase tracking-wide" style="color:var(--text-muted);">Mín</div>
                            <div id="elevMin" class="text-base font-bold" style="color:var(--text-primary);">-</div>
                        </div>
                    </div>
                </div>

                <!-- Tags -->
                <div id="detailTags" class="flex flex-wrap gap-2 mb-4"></div>

                <!-- Description -->
                <p id="detailDesc" class="text-sm leading-relaxed mb-5" style="color:var(--text-secondary);"></p>

                <!-- 360 Viewer -->
                <div id="container360" class="hidden mb-5"><div class="flex items-center justify-between mb-3"><span id="viewer360Label" class="text-sm font-semibold flex items-center gap-2" style="color:var(--text-primary);"><span>🚴</span> Tour Virtual 360°</span></div><div class="relative"><iframe id="iframe360" class="w-full h-48 bg-slate-900" style="border-radius:18px; border:1px solid rgba(255,255,255,0.3);" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer"></iframe></div></div>

                <!-- Action Buttons -->
                <div id="actionButtons" class="space-y-3 pb-safe"></div>
            </div>
        </div>`;
}

function render360Fullscreen() {
    document.getElementById('fs360').innerHTML = `
        <div class="h-14 flex items-center justify-between px-4 bg-black/90 text-white shrink-0 pt-safe">
            <span id="fs360Title" class="font-bold truncate mr-4">Tour Virtual 360°</span>
            <button onclick="closeFullscreen360()" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center touch-target active:scale-95"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <iframe id="fs360frame" class="flex-1 w-full border-none bg-black"></iframe>`;
}

// ==================== MARKERS ====================
function clearMap() {
    if (markers) {
        markers.forEach(m => { try { m.remove(); } catch (e) { console.warn(e); } });
    }
    markers = [];

    if (typeof viasVerdes !== 'undefined') {
        viasVerdes.forEach(route => {
            const id = `route-${route.id}`;
            const layers = [`${id}-path`, `${id}-glow`, `${id}-outline`, `${id}-label`, `${id}-start`, `${id}-end`];

            layers.forEach(lid => {
                if (map.getLayer(lid)) {
                    try { map.removeLayer(lid); } catch (e) { console.warn('Layer clear error:', lid, e); }
                }
            });

            const sources = [id, `${id}-points`];
            sources.forEach(sid => {
                if (map.getSource(sid)) {
                    try { map.removeSource(sid); } catch (e) { console.warn('Source clear error:', sid, e); }
                }
            });
        });
    }

    routeLayers = [];
    routeSources = [];
}

// Endpoints and Labels as GL Layers for perfect stability
function createRouteMarker(coords, routeNumber, color, onClick, tooltipText, isComingSoon = false) {
    const el = document.createElement('div');
    el.className = 'route-number-marker';
    el.style.cssText = `cursor:pointer;position:relative;`;

    const inner = document.createElement('div');
    const bgColor = isComingSoon ? '#771E2E' : color;
    inner.style.cssText = `
        width:28px;
        height:28px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:${bgColor};
        border-radius:50%;
        border:2.5px solid white;
        font-size:12px;
        font-weight:800;
        color:white;
        box-shadow:0 3px 12px rgba(0,0,0,0.3);
        transition:all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        ${isComingSoon ? 'opacity:0.9; border-color: rgba(255,255,255,0.8);' : ''}
    `;
    inner.textContent = routeNumber;
    el.appendChild(inner);

    if (tooltipText) {
        const t = document.createElement('div');
        t.style.cssText = `position:absolute;bottom:36px;left:50%;transform:translateX(-50%);background:rgba(15, 23, 42, 0.98);color:white;padding:5px 10px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;opacity:0;pointer-events:none;transition:all 0.2s;z-index:100;box-shadow:0 8px 20px rgba(0,0,0,0.3);border-bottom:3px solid ${bgColor};`;
        t.textContent = tooltipText + (isComingSoon ? ` (Próx.)` : '');
        el.appendChild(t);
        el.addEventListener('mouseenter', () => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(-5px)'; inner.style.transform = 'scale(1.15)'; });
        el.addEventListener('mouseleave', () => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(0)'; inner.style.transform = 'scale(1)'; });
    }

    el.onclick = (e) => { e.stopPropagation(); onClick(); };
    markers.push(new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(coords).addTo(map));
}

function addRouteLayers(route, color, isComingSoon) {
    const id = `route-${route.id}`;
    // Extraer solo lon/lat (sin elevación) para MapLibre
    const start = [route.coords[0][0], route.coords[0][1]];
    const end = [route.coords[route.coords.length - 1][0], route.coords[route.coords.length - 1][1]];
    const middleIndex = Math.floor(route.coords.length / 2);
    const middlePoint = [route.coords[middleIndex][0], route.coords[middleIndex][1]];

    // Source for points - check if exists first
    const pointsId = `${id}-points`;
    if (!map.getSource(pointsId)) {
        map.addSource(pointsId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', geometry: { type: 'Point', coordinates: start }, properties: { type: 'start' } },
                    { type: 'Feature', geometry: { type: 'Point', coordinates: end }, properties: { type: 'end' } },
                    { type: 'Feature', geometry: { type: 'Point', coordinates: middlePoint }, properties: { type: 'label', label: String(route.num) } }
                ]
            }
        });
    }

    // Start point layer - check if exists first
    const startLayerId = `${id}-start`;
    if (!map.getLayer(startLayerId)) {
        map.addLayer({
            id: startLayerId,
            type: 'circle',
            source: pointsId,
            filter: ['==', 'type', 'start'],
            paint: {
                'circle-radius': 5,
                'circle-color': '#FFFFFF',
                'circle-stroke-color': color,
                'circle-stroke-width': 2
            }
        });
    }

    // Label layer - check if exists first
    const labelLayerId = `${id}-label`;
    if (!map.getLayer(labelLayerId)) {
        map.addLayer({
            id: labelLayerId,
            type: 'symbol',
            source: pointsId,
            filter: ['==', 'type', 'label'],
            layout: {
                'text-field': ['get', 'label'],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 11,
                'text-allow-overlap': true
            },
            paint: {
                'text-color': '#FFFFFF',
                'text-halo-color': color,
                'text-halo-width': 2
            }
        });
    }

    // End flag layer - check if exists first
    const endLayerId = `${id}-end`;
    if (!map.getLayer(endLayerId)) {
        map.addLayer({
            id: endLayerId,
            type: 'symbol',
            source: pointsId,
            filter: ['==', 'type', 'end'],
            layout: {
                'text-field': '🏁',
                'text-size': 16,
                'text-anchor': 'bottom-left',
                'text-allow-overlap': true
            }
        });
    }
}

function loadDataLayer() {
    try { clearMap(); } catch (e) { console.error('ClearMap failed:', e); }

    let filtered = viasVerdes;
    if (activeFilter === 'easy') filtered = viasVerdes.filter(v => v.diff === 'easy');
    else if (activeFilter === 'medium') filtered = viasVerdes.filter(v => v.diff === 'medium');
    else if (activeFilter === 'moderate') filtered = viasVerdes.filter(v => v.diff === 'moderate');

    filtered.forEach(route => {
        const id = `route-${route.id}`;
        const glowId = `${id}-glow`;
        const outlineId = `${id}-outline`;
        const pathId = `${id}-path`;
        const isComingSoon = route.status === 'coming_soon';
        const color = isComingSoon ? '#771E2E' : (route.color?.main || '#9E1B32');
        const glow = isComingSoon ? '#992E3E' : (route.color?.glow || '#C43A54');

        try {
            // Convertir coords de [lon,lat,elev] a [lon,lat] para MapLibre
            const coords2D = route.coords.map(c => [c[0], c[1]]);
            if (!map.getSource(id)) {
                map.addSource(id, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords2D }, properties: { name: route.name, id: route.id } } });
            }

            if (!map.getLayer(glowId)) {
                map.addLayer({ id: glowId, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': glow, 'line-width': 10, 'line-opacity': isComingSoon ? 0.15 : 0.25, 'line-blur': 4 } });
            }

            if (!map.getLayer(outlineId)) {
                map.addLayer({ id: outlineId, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': 6, 'line-opacity': isComingSoon ? 0.6 : 0.9 } });
            }

            if (!map.getLayer(pathId)) {
                map.addLayer({ id: pathId, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': color, 'line-width': 3, 'line-opacity': isComingSoon ? 0.7 : 0.95 } });
            }

            // High stability labels and endpoints
            addRouteLayers(route, color, isComingSoon);

            const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'route-popup' });

            map.on('mouseenter', pathId, (e) => {
                map.getCanvas().style.cursor = 'pointer';
                if (map.getLayer(pathId)) map.setPaintProperty(pathId, 'line-width', 5);
                if (map.getLayer(outlineId)) map.setPaintProperty(outlineId, 'line-width', 8);
                if (map.getLayer(glowId)) map.setPaintProperty(glowId, 'line-width', 14);
                popup.setLngLat(e.lngLat).setHTML(`<div style="font-weight:600;font-size:13px;padding:2px 4px;border-left:3px solid ${color};padding-left:6px;">${route.name}${isComingSoon ? ` <span style="opacity:0.7">(Próx.)</span>` : ''}</div>`).addTo(map);
            });

            map.on('mouseleave', pathId, () => {
                map.getCanvas().style.cursor = '';
                if (map.getLayer(pathId)) map.setPaintProperty(pathId, 'line-width', 3);
                if (map.getLayer(outlineId)) map.setPaintProperty(outlineId, 'line-width', 6);
                if (map.getLayer(glowId)) map.setPaintProperty(glowId, 'line-width', 10);
                popup.remove();
            });

            map.on('dblclick', pathId, (e) => { e.preventDefault(); openDetail(route); });
        } catch (e) {
            console.error('Error loading route:', route.id, e);
        }
    });
}

// ==================== UI RENDERING ====================
function renderUI() {
    try {
        loadDataLayer();
    } catch (e) {
        console.error('Critical map error:', e);
    }
    updateFilters();
    renderList();
}

function updateFilters() {
    const counts = {
        all: viasVerdes.length,
        easy: viasVerdes.filter(v => v.diff === 'easy').length,
        medium: viasVerdes.filter(v => v.diff === 'medium').length,
        moderate: viasVerdes.filter(v => v.diff === 'moderate').length
    };

    const btn = (f, l, a, color = '') => `<button onclick="setFilter('${f}')" class="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-target flex items-center gap-1.5 ${a ? 'btn-glass-primary' : 'btn-glass-secondary'}" style="border-radius:100px;">${color ? `<span class="w-2 h-2 rounded-full ${color}"></span>` : ''}${l}</button>`;
    const html = btn('all', `Todas`, activeFilter === 'all') +
        btn('easy', `Fácil`, activeFilter === 'easy', 'bg-green-500') +
        btn('medium', `Media`, activeFilter === 'medium', 'bg-amber-500') +
        btn('moderate', `Moderado`, activeFilter === 'moderate', 'bg-orange-500');

    const dContainer = document.getElementById('filterContainerDesktop');
    const mContainer = document.getElementById('filterContainerMobile');

    if (dContainer) dContainer.innerHTML = html;
    if (mContainer) mContainer.innerHTML = html;
}

function setFilter(f) {
    activeFilter = f;
    loadDataLayer();
    renderList();
    updateFilters();
}

function renderList() {
    let items = viasVerdes;
    if (activeFilter === 'easy') items = items.filter(v => v.diff === 'easy');
    else if (activeFilter === 'medium') items = items.filter(v => v.diff === 'medium');
    else if (activeFilter === 'moderate') items = items.filter(v => v.diff === 'moderate');
    const html = items.map((item, i) => createCard(item, i)).join('');
    document.getElementById('listDesktop').innerHTML = html;
    document.getElementById('listMobile').innerHTML = html;
}

function createCard(item) {
    const isComingSoon = item.status === 'coming_soon';
    const badgeColor = isComingSoon ? '#771E2E' : item.color.main;
    const typeIcon = item.type === 'circular' ? '↻' : '→';
    const typeLabel = item.type === 'circular' ? 'Circular' : 'Lineal';

    return `<div onclick="openDetailById('${item.id}')"
        class="card-item ${isComingSoon ? 'card-coming-soon' : ''} flex items-center gap-4">

        <!-- Route Number — 3D Glass -->
        <div class="route-number-3d" style="background:${badgeColor}; box-shadow:0 4px 12px ${badgeColor}40, 0 1px 3px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.1);">
            ${item.num}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
            <h3 class="font-bold text-base leading-tight truncate mb-1" style="color:var(--text-primary);">
                ${item.name}
            </h3>
            <p class="text-sm flex items-center gap-2 flex-wrap" style="color:var(--text-secondary);">
                <span>${item.km} km</span>
                <span style="color:var(--text-muted);">·</span>
                <span>${item.time}</span>
                <span style="color:var(--text-muted);">·</span>
                <span>${typeIcon} ${typeLabel}</span>
            </p>
            ${isComingSoon ? '<span class="coming-soon-badge mt-1 inline-block">Próximamente</span>' : ''}
        </div>

        <!-- Arrow -->
        <svg class="w-5 h-5 flex-shrink-0" style="color:var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
    </div>`;
}

// ==================== DETAIL VIEW ====================
function openDetailById(id) { const item = viasVerdes.find(i => i.id === id); if (item) openDetail(item); }

function openDetail(item) {
    selectedFeature = { item };
    const modal = document.getElementById('detailModal');
    modal.classList.remove('hidden');
    // Force reflow
    void modal.offsetWidth;
    modal.classList.add('active');
    modal.style.zIndex = '9999'; // Ensure it's on top

    // Type Badge (Bareyo Style: Circular/Lineal)
    const typeBadge = document.getElementById('detailTypeBadge');
    typeBadge.textContent = item.type === 'circular' ? 'Circular' : 'Lineal';

    const header = document.getElementById('detailHeader');
    const preview = document.getElementById('detailMapPreview');

    if (item.image) {
        header.style.backgroundImage = `url(${item.image})`;
        preview.style.display = 'none';
        header.classList.remove('bg-gradient-to-br', 'from-murcia/20', 'to-murcia-light/20');
    } else {
        header.style.backgroundImage = 'none';
        preview.style.display = 'flex';
        header.classList.add('bg-gradient-to-br', 'from-murcia/20', 'to-murcia-light/20');
    }

    document.getElementById('detailTitle').textContent = item.name;
    document.getElementById('detailSubtitle').querySelector('span').textContent = item.location || 'Región de Murcia';

    // Stats Grid (Bareyo Style: centered, clean)
    const dl = { easy: 'Fácil', medium: 'Media', moderate: 'Moderado' };
    const dc = { easy: 'text-green-600', medium: 'text-amber-600', moderate: 'text-orange-600' };
    const stats = document.getElementById('detailStats');
    stats.innerHTML = `
        <div class="glass-stat text-center p-3">
            <div class="text-2xl font-bold" style="color:var(--text-primary);">${item.km}</div>
            <div class="text-xs uppercase tracking-wider" style="color:var(--text-muted);">KM</div>
        </div>
        <div class="glass-stat text-center p-3">
            <div class="text-2xl font-bold" style="color:var(--text-primary);">${item.time.split(' ')[0]}</div>
            <div class="text-xs uppercase tracking-wider" style="color:var(--text-muted);">Tiempo</div>
        </div>
        <div class="glass-stat text-center p-3">
            <div class="text-2xl font-bold ${dc[item.diff]}">${dl[item.diff]}</div>
            <div class="text-xs uppercase tracking-wider" style="color:var(--text-muted);">Dificultad</div>
        </div>`;

    const tagsDiv = document.getElementById('detailTags');
    if (item.tags?.length) {
        tagsDiv.innerHTML = item.tags.map(t => `<span class="px-3 py-1 text-xs font-medium" style="background:rgba(158,27,50,0.1); color:#9E1B32; border-radius:100px; border:1px solid rgba(158,27,50,0.15); backdrop-filter:blur(4px);">${t}</span>`).join('');
        tagsDiv.style.display = 'flex';
    } else {
        tagsDiv.style.display = 'none';
    }
    document.getElementById('detailDesc').textContent = item.desc;

    // Perfil Altimétrico
    const elevContainer = document.getElementById('elevationContainer');
    if (item.coords?.[0]?.length === 3) {
        elevContainer.classList.remove('hidden');
        setTimeout(() => drawElevationProfile(item.coords), 100);
    } else {
        elevContainer.classList.add('hidden');
    }

    const div360 = document.getElementById('container360');
    if (item.url360) {
        div360.classList.remove('hidden');
        document.getElementById('iframe360').src = item.url360;
    } else {
        div360.classList.add('hidden');
        document.getElementById('iframe360').src = '';
    }

    // Action Buttons (Bareyo Style)
    const actionsDiv = document.getElementById('actionButtons');
    const gpxButton = item.gpxFile ? `
        <button onclick="downloadGPX('${item.id}')" class="btn-glass-secondary flex-1 py-3 active:scale-95 transition-transform touch-target flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            GPX Track
        </button>` : '';

    if (item.url360) {
        actionsDiv.innerHTML = `
            <!-- Primary CTA — Glass -->
            <button onclick="navigateToItem()" class="btn-glass-primary w-full py-4 font-bold active:scale-[0.98] transition-transform touch-target flex items-center justify-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
                Iniciar Navegación GPS
            </button>
            <div class="flex gap-3">
                <button onclick="shareItem()" class="btn-glass-secondary flex-1 py-3 active:scale-95 transition-transform touch-target flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    Compartir
                </button>
                ${gpxButton}
            </div>
            <!-- 360 Button — Glass Dark -->
            <button onclick="openFullscreen360()" class="liquid-glass-dark w-full py-3 text-white font-semibold active:scale-[0.98] transition-transform touch-target flex items-center justify-center gap-2" style="border-radius:16px;">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                Explorar en 360°
            </button>`;
    } else {
        actionsDiv.innerHTML = `
            <!-- Primary CTA — Glass -->
            <button onclick="navigateToItem()" class="btn-glass-primary w-full py-4 font-bold active:scale-[0.98] transition-transform touch-target flex items-center justify-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
                Iniciar Navegación GPS
            </button>
            <div class="flex gap-3">
                <button onclick="shareItem()" class="btn-glass-secondary flex-1 py-3 active:scale-95 transition-transform touch-target flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    Compartir
                </button>
                ${gpxButton}
            </div>`;
    }

    const coords = Array.isArray(item.coords[0]) ? item.coords[0] : item.coords;
    map.flyTo({ center: coords, zoom: 11, padding: { bottom: window.innerWidth < 1024 ? 300 : 0 } });
}

function closeDetail() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('active');
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.classList.add('hidden');
            modal.style.zIndex = '';
            const iframe = document.getElementById('iframe360');
            if (iframe) iframe.src = '';
        }
    }, 300);
    selectedFeature = null;
}

// ==================== BOTTOM SHEET ====================
function setupBottomSheet() {
    const sheet = document.getElementById('bottomSheet');
    const handle = document.getElementById('sheetHandle');
    let startY = 0, initTranslate = 0, isDragging = false;
    const getTranslateY = () => { const style = window.getComputedStyle(sheet); const matrix = new WebKitCSSMatrix(style.transform); return matrix.m42; };
    const setTranslate = (y, animate = false) => { sheet.classList.toggle('dragging', !animate); sheet.style.transform = `translateY(${y}px)`; };
    const snapTo = (snapHeight) => { currentSnap = snapHeight; setTranslate(window.innerHeight - snapHeight, true); };
    const findNearestSnap = (height) => { const snaps = [SNAP.COLLAPSED, SNAP.HALF, SNAP.FULL]; return snaps.reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev); };
    handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; initTranslate = getTranslateY(); isDragging = true; sheet.classList.add('dragging'); }, { passive: true });
    handle.addEventListener('touchmove', (e) => { if (!isDragging) return; const delta = e.touches[0].clientY - startY; let newTranslate = initTranslate + delta; const maxTranslate = window.innerHeight - SNAP.COLLAPSED; const minTranslate = window.innerHeight - SNAP.FULL; if (newTranslate > maxTranslate) newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.2; if (newTranslate < minTranslate) newTranslate = minTranslate; setTranslate(newTranslate); }, { passive: true });
    handle.addEventListener('touchend', (e) => { if (!isDragging) return; isDragging = false; const endY = e.changedTouches[0].clientY; const delta = endY - startY; const velocity = Math.abs(delta) / 100; const currentHeight = window.innerHeight - getTranslateY(); if (velocity > 1) { if (delta > 0) snapTo(SNAP.COLLAPSED); else snapTo(SNAP.FULL); } else { snapTo(findNearestSnap(currentHeight)); } });
    handle.addEventListener('click', () => { if (currentSnap === SNAP.COLLAPSED) snapTo(SNAP.HALF); else snapTo(SNAP.COLLAPSED); });
    snapTo(SNAP.COLLAPSED);
}

// ==================== UTILITIES ====================
function locateUser() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            map.flyTo({ center: coords, zoom: 14 });
            const el = document.createElement('div'); const pulse = document.createElement('div'); pulse.className = 'pulse-ring'; el.appendChild(pulse);
            new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map);
            new maplibregl.Marker({ color: '#9E1B32', scale: 0.8 }).setLngLat(coords).addTo(map);
        }, () => alert('No se pudo obtener la ubicación'));
    }
}

function resetView() { map.flyTo({ center: CONFIG.center, zoom: CONFIG.zoom }); }

function filterRoutes(val) {
    const term = val.toLowerCase();
    document.querySelectorAll('#listDesktop > div, #listMobile > div').forEach(el => {
        el.style.display = el.innerText.toLowerCase().includes(term) ? 'block' : 'none';
    });
}

function setupSearch() {
    document.getElementById('searchDesktop')?.addEventListener('input', (e) => filterRoutes(e.target.value));
    document.getElementById('searchMobile')?.addEventListener('input', (e) => filterRoutes(e.target.value));
}

function openFullscreen360() { if (!selectedFeature?.item?.url360) return; document.getElementById('fs360Title').textContent = selectedFeature.item.name; document.getElementById('fs360frame').src = selectedFeature.item.url360; document.getElementById('fs360').classList.remove('hidden'); document.getElementById('fs360').classList.add('flex'); }
function closeFullscreen360() { document.getElementById('fs360').classList.add('hidden'); document.getElementById('fs360').classList.remove('flex'); document.getElementById('fs360frame').src = ''; }
function navigateToItem() { if (!selectedFeature) return; const coords = Array.isArray(selectedFeature.item.coords[0]) ? selectedFeature.item.coords[0] : selectedFeature.item.coords; window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`, '_blank'); }
function shareItem() { if (!selectedFeature) return; const text = `Descubre ${selectedFeature.item.name} - Vías Verdes de la Región de Murcia`; if (navigator.share) { navigator.share({ title: 'Vías Verdes de Murcia', text, url: window.location.href }); } else { navigator.clipboard.writeText(text); alert('Enlace copiado al portapapeles'); } }

// GPX Download Function
function downloadGPX(routeId) {
    const route = viasVerdes.find(v => v.id === routeId);
    if (!route || !route.gpxFile) {
        alert('Archivo GPX no disponible para esta ruta.');
        return;
    }
    const link = document.createElement('a');
    link.href = `gpx/${route.gpxFile}`;
    link.download = route.gpxFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== ELEVATION PROFILE ====================
function drawElevationProfile(coords) {
    const canvas = document.getElementById('elevationChart');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const line = document.getElementById('elevationLine');
    const indicator = document.getElementById('elevationIndicator');

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    let totalDist = 0;
    const dataPoints = coords.map((c, i) => {
        if (i > 0) {
            const d = getDistance(coords[i - 1][0], coords[i - 1][1], c[0], c[1]);
            totalDist += d;
        }
        return { x: totalDist, y: c[2] || 0, lon: c[0], lat: c[1] };
    });

    const elevations = dataPoints.map(p => p.y);
    const minElev = Math.max(0, Math.min(...elevations) - 10);
    const maxElev = Math.max(...elevations) + 20;
    const range = maxElev - minElev || 1;

    const padding = { top: 15, right: 10, bottom: 25, left: 35 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    let gain = 0;
    for (let i = 1; i < elevations.length; i++) { if (elevations[i] > elevations[i - 1]) gain += elevations[i] - elevations[i - 1]; }
    document.getElementById('elevGain').textContent = `+${Math.round(gain)}m`;
    document.getElementById('elevMax').textContent = `${Math.round(Math.max(...elevations))}m`;
    document.getElementById('elevMin').textContent = `${Math.round(Math.min(...elevations))}m`;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(158, 27, 50, 0.08)';
    ctx.lineWidth = 1;
    ctx.font = 'bold 9px Inter, system-ui';
    ctx.fillStyle = 'rgba(158, 27, 50, 0.4)';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
        const val = minElev + (range * (i / steps));
        const y = padding.top + chartH - (chartH * (i / steps));

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();

        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(val)}m`, padding.left - 8, y + 3);
    }

    const distSteps = 5;
    for (let i = 0; i <= distSteps; i++) {
        const d = (totalDist * (i / distSteps));
        const x = padding.left + (chartW * (i / distSteps));
        ctx.textAlign = 'center';
        ctx.fillText(`${d.toFixed(1)}k`, x, h - 8);
    }

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(158, 27, 50, 0.2)');
    gradient.addColorStop(1, 'rgba(158, 27, 50, 0)');

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    dataPoints.forEach(p => {
        const x = padding.left + (p.x / totalDist) * chartW;
        const y = padding.top + chartH - ((p.y - minElev) / range) * chartH;
        ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    dataPoints.forEach((p, i) => {
        const x = padding.left + (p.x / totalDist) * chartW;
        const y = padding.top + chartH - ((p.y - minElev) / range) * chartH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#9E1B32';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left);

        if (mouseX < padding.left || mouseX > padding.left + chartW) {
            line.style.display = 'none';
            if (elevationMarker) elevationMarker.remove();
            return;
        }

        const hoverDist = ((mouseX - padding.left) / chartW) * totalDist;

        let closest = dataPoints[0];
        let minDist = Infinity;
        dataPoints.forEach(p => {
            const d = Math.abs(p.x - hoverDist);
            if (d < minDist) { minDist = d; closest = p; }
        });

        const x = padding.left + (closest.x / totalDist) * chartW;
        line.style.left = `${x}px`;
        line.style.top = `${padding.top}px`;
        line.style.height = `${chartH}px`;
        line.style.display = 'block';

        indicator.innerHTML = `Dist: <span style="color:var(--text-primary);">${closest.x.toFixed(2)}km</span> | Alt: <span class="text-murcia">${Math.round(closest.y)}m</span>`;
        indicator.className = 'text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2';
        indicator.style.cssText = 'background:rgba(255,255,255,0.8); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.5); box-shadow:0 2px 8px rgba(0,0,0,0.08); color:var(--text-secondary);';

        if (elevationMarker) elevationMarker.remove();
        const el = document.createElement('div');
        el.className = 'elevation-hover-marker';
        elevationMarker = new maplibregl.Marker({ element: el }).setLngLat([closest.lon, closest.lat]).addTo(map);
    };

    canvas.onmouseleave = () => {
        line.style.display = 'none';
        indicator.textContent = 'Pasa el cursor para ver altitud';
        indicator.className = 'text-[10px] font-bold';
        indicator.style.cssText = 'color:var(--text-muted);';
        if (elevationMarker) { elevationMarker.remove(); elevationMarker = null; }
    };
}

function getDistance(lon1, lat1, lon2, lat2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
