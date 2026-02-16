// ==================== TRANSPORT MODULE - Overpass API (OpenStreetMap) ====================
// Free API, no key required. Rate-limited, use conservatively.

const TRANSPORT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Main RENFE stations in Murcia region (static data for reliability)
const MAIN_STATIONS = [
    { name: 'Estación de Murcia del Carmen', lat: 37.9875, lon: -1.1304, type: 'train', operator: 'RENFE', lines: ['C-1 Murcia-Alicante', 'MD'] },
    { name: 'Estación de Cartagena', lat: 37.6005, lon: -0.9911, type: 'train', operator: 'RENFE', lines: ['C-1', 'Regional'] },
    { name: 'Estación de Lorca-Sutullena', lat: 37.6713, lon: -1.7008, type: 'train', operator: 'RENFE', lines: ['Regional'] },
    { name: 'Estación de Águilas', lat: 37.4070, lon: -1.5794, type: 'train', operator: 'RENFE', lines: ['Regional Lorca-Águilas'] },
    { name: 'Estación de Cieza', lat: 38.2393, lon: -1.4188, type: 'train', operator: 'RENFE', lines: ['Regional Madrid-Cartagena'] },
    { name: 'Estación de Molina de Segura', lat: 38.0500, lon: -1.2100, type: 'train', operator: 'RENFE (cerrada)', lines: [] },
];

const TRANSPORT_ICONS = {
    train: '🚆',
    bus: '🚌',
    bus_station: '🚏',
    tram: '🚊',
    halt: '🚂',
    taxi: '🚕'
};

const TRANSPORT_LABELS = {
    train: 'Estación tren',
    bus: 'Parada bus',
    bus_station: 'Estación bus',
    tram: 'Parada tranvía',
    halt: 'Apeadero',
    taxi: 'Parada taxi'
};

// Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getTransportIcon(type) {
    return TRANSPORT_ICONS[type] || '📍';
}

function getTransportLabel(type) {
    return TRANSPORT_LABELS[type] || 'Transporte';
}

// Categorize raw OSM nodes
function categorizeTransport(nodes) {
    return nodes.map(node => {
        const tags = node.tags || {};
        let type = 'bus';
        if (tags.railway === 'station') type = 'train';
        else if (tags.railway === 'halt') type = 'halt';
        else if (tags.railway === 'tram_stop') type = 'tram';
        else if (tags.amenity === 'bus_station') type = 'bus_station';
        else if (tags.amenity === 'taxi') type = 'taxi';
        else if (tags.highway === 'bus_stop') type = 'bus';

        return {
            id: node.id,
            lat: node.lat,
            lon: node.lon,
            name: tags.name || tags['name:es'] || getTransportLabel(type),
            type,
            operator: tags.operator || tags.network || '',
            lines: tags.route_ref ? tags.route_ref.split(';').map(s => s.trim()) : []
        };
    });
}

// localStorage cache
function getCachedTransport(lat, lon, radius) {
    try {
        const key = `transport_${lat.toFixed(2)}_${lon.toFixed(2)}_${radius}`;
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp > TRANSPORT_CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return data.transport;
    } catch (e) { return null; }
}

function setCachedTransport(lat, lon, radius, transport) {
    try {
        const key = `transport_${lat.toFixed(2)}_${lon.toFixed(2)}_${radius}`;
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), transport }));
    } catch (e) { /* quota exceeded */ }
}

// Fetch transport near a point using Overpass API
async function fetchTransportNear(lat, lon, radiusKm = 5) {
    const cached = getCachedTransport(lat, lon, radiusKm);
    if (cached) return cached;

    const radiusM = radiusKm * 1000;
    const query = `[out:json][timeout:15];(node["highway"="bus_stop"](around:${radiusM},${lat},${lon});node["railway"="station"](around:${radiusM},${lat},${lon});node["railway"="halt"](around:${radiusM},${lat},${lon});node["amenity"="bus_station"](around:${radiusM},${lat},${lon});node["railway"="tram_stop"](around:${radiusM},${lat},${lon});node["amenity"="taxi"](around:${radiusM},${lat},${lon}););out body;`;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query)
        });
        if (!response.ok) throw new Error('Overpass API error');
        const data = await response.json();
        const nodes = data.elements || [];
        const categorized = categorizeTransport(nodes);
        setCachedTransport(lat, lon, radiusKm, categorized);
        return categorized;
    } catch (e) {
        console.warn('Transport fetch failed:', e);
        return [];
    }
}

// Merge static RENFE stations with Overpass results
function mergeStaticStations(overpassResults, lat, lon, radiusKm) {
    const merged = [...overpassResults];
    MAIN_STATIONS.forEach(station => {
        const dist = calculateDistance(lat, lon, station.lat, station.lon);
        if (dist <= radiusKm) {
            // Check if already in results (avoid duplicates)
            const exists = merged.some(r =>
                r.type === 'train' && calculateDistance(r.lat, r.lon, station.lat, station.lon) < 0.3
            );
            if (!exists) {
                merged.push({
                    id: 'static_' + station.name.replace(/\s/g, '_'),
                    lat: station.lat,
                    lon: station.lon,
                    name: station.name,
                    type: station.type,
                    operator: station.operator,
                    lines: station.lines
                });
            }
        }
    });
    return merged;
}

// Get transport for a route's start and end points
async function fetchRouteTransport(routeId, radiusKm = 5) {
    const route = viasVerdes.find(v => v.id === routeId);
    if (!route || !route.coords || route.coords.length < 2) return { start: [], end: [] };

    const startCoord = route.coords[0]; // [lon, lat, elev]
    const endCoord = route.coords[route.coords.length - 1];

    const [startRaw, endRaw] = await Promise.all([
        fetchTransportNear(startCoord[1], startCoord[0], radiusKm),
        fetchTransportNear(endCoord[1], endCoord[0], radiusKm)
    ]);

    const startResults = mergeStaticStations(startRaw, startCoord[1], startCoord[0], radiusKm);
    const endResults = mergeStaticStations(endRaw, endCoord[1], endCoord[0], radiusKm);

    // Add distance from start/end and sort
    const addDist = (items, refLat, refLon) =>
        items.map(item => ({
            ...item,
            distance: calculateDistance(refLat, refLon, item.lat, item.lon)
        })).sort((a, b) => a.distance - b.distance);

    return {
        start: addDist(startResults, startCoord[1], startCoord[0]),
        end: addDist(endResults, endCoord[1], endCoord[0])
    };
}

// Distance color coding
function getDistanceColor(km) {
    if (km < 1) return '#22c55e';
    if (km < 3) return '#eab308';
    if (km < 5) return '#f97316';
    return '#ef4444';
}

function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
}

// ==================== SIDEBAR TAB ====================
let transportRadius = 5;
let transportData = {}; // { vv1: { start: [...], end: [...] }, ... }
let transportLoading = false;

async function loadTransportForAllRoutes() {
    if (transportLoading) return;
    transportLoading = true;

    const container = document.getElementById('transportContent');
    if (container) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:13px;"><div style="font-size:24px; margin-bottom:8px;">🔄</div>Buscando transporte cercano...</div>';
    }

    try {
        // Fetch sequentially to respect Overpass rate limits
        for (const route of viasVerdes) {
            if (!transportData[route.id]) {
                transportData[route.id] = await fetchRouteTransport(route.id, transportRadius);
                // Small delay between requests
                await new Promise(r => setTimeout(r, 500));
            }
        }
    } catch (e) {
        console.warn('Transport load error:', e);
    }

    transportLoading = false;
    renderTransportTab();
}

function changeTransportRadius(newRadius) {
    transportRadius = newRadius;
    transportData = {}; // Clear to refetch
    loadTransportForAllRoutes();

    // Update radius buttons
    document.querySelectorAll('.transport-radius-btn').forEach(btn => {
        const r = parseInt(btn.dataset.radius);
        btn.classList.toggle('active-radius', r === newRadius);
    });
}

function renderTransportTab() {
    const container = document.getElementById('transportContent');
    if (!container) return;

    let html = `
        <div style="padding:0 2px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <span style="font-size:16px;">🚌</span>
                <span style="font-size:14px; font-weight:700; color:var(--text-primary);">Transporte cercano</span>
            </div>
            <div style="display:flex; gap:6px;">
                <button class="transport-radius-btn ${transportRadius === 2 ? 'active-radius' : ''}" data-radius="2" onclick="changeTransportRadius(2)">2 km</button>
                <button class="transport-radius-btn ${transportRadius === 5 ? 'active-radius' : ''}" data-radius="5" onclick="changeTransportRadius(5)">5 km</button>
                <button class="transport-radius-btn ${transportRadius === 10 ? 'active-radius' : ''}" data-radius="10" onclick="changeTransportRadius(10)">10 km</button>
            </div>
        </div>
    `;

    viasVerdes.forEach(route => {
        const data = transportData[route.id];
        if (!data) return;

        const allStops = [...data.start, ...data.end];
        // Deduplicate by id
        const seen = new Set();
        const unique = allStops.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
        }).sort((a, b) => a.distance - b.distance);

        if (unique.length === 0) return;

        const routeShort = route.name.replace('Vía Verde ', '').replace('del ', '').replace('de ', '').replace('la ', '');
        const color = route.color?.main || '#9E1B32';

        html += `
        <div style="margin-bottom:8px;">
            <div onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.transport-chevron').classList.toggle('transport-chevron-open')" style="display:flex; align-items:center; gap:8px; padding:10px 12px; background:linear-gradient(135deg, ${color}15, ${color}08); border:1px solid ${color}33; border-radius:10px; cursor:pointer; user-select:none;">
                <span style="width:14px; height:4px; border-radius:2px; background:${color}; flex-shrink:0;"></span>
                <span style="flex:1; font-size:13px; font-weight:700; color:var(--text-primary);">${routeShort}</span>
                <span style="font-size:11px; color:var(--text-secondary); background:var(--btn-secondary-bg); padding:2px 8px; border-radius:10px;">${unique.length}</span>
                <svg class="transport-chevron" style="width:16px; height:16px; color:var(--text-secondary); transition:transform 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
            <div class="hidden" style="flex-direction:column; gap:4px; padding:6px 0 0 18px;">
                ${unique.slice(0, 8).map(stop => {
                    const dColor = getDistanceColor(stop.distance);
                    return `<div class="transport-stop-card" onclick="flyToTransport(${stop.lon}, ${stop.lat}, '${stop.name.replace(/'/g, "\\'")}')">
                        <div style="font-size:18px; line-height:1;">${getTransportIcon(stop.type)}</div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${stop.name}</div>
                            <div style="font-size:10px; color:var(--text-muted);">${getTransportLabel(stop.type)}${stop.operator ? ' · ' + stop.operator : ''}</div>
                        </div>
                        <span style="font-size:11px; font-weight:700; color:${dColor}; white-space:nowrap;">${formatDistance(stop.distance)}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    });

    if (Object.keys(transportData).length === 0) {
        html += '<div style="text-align:center; padding:30px 20px; color:var(--text-muted); font-size:12px;">No se encontró transporte público cercano</div>';
    }

    container.innerHTML = html;
}

function flyToTransport(lon, lat, name) {
    if (typeof map !== 'undefined') {
        map.flyTo({ center: [lon, lat], zoom: 15 });

        // Show popup
        if (typeof maplibregl !== 'undefined') {
            new maplibregl.Popup({ closeOnClick: true, maxWidth: '200px' })
                .setLngLat([lon, lat])
                .setHTML(`<div style="padding:6px 8px; font-size:12px; font-weight:600;">${name}</div>`)
                .addTo(map);
        }
    }
}

// ==================== MODAL: ACCESO TAB ====================
function renderAccesoTab(routeId) {
    const data = transportData[routeId];
    const route = viasVerdes.find(v => v.id === routeId);
    if (!route) return '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">Datos no disponibles</div>';

    const startCoord = route.coords[0];
    const endCoord = route.coords[route.coords.length - 1];

    // Google Maps transit link
    const transitLink = `https://www.google.com/maps/dir/?api=1&destination=${startCoord[1]},${startCoord[0]}&travelmode=transit`;

    let html = `
        <div style="margin-bottom:16px;">
            <a href="${transitLink}" target="_blank" rel="noopener" class="transit-directions-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                Como llegar en transporte publico
            </a>
        </div>
    `;

    if (!data || (data.start.length === 0 && data.end.length === 0)) {
        html += `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">
            <div style="font-size:20px; margin-bottom:6px;">🔍</div>
            Cargando transporte cercano...
            <br><span style="font-size:11px;">Los datos se cargan automaticamente</span>
        </div>`;
        return html;
    }

    // Start point transport
    html += renderTransportEndpoint('Punto de inicio', route.location ? route.location.split('→')[0]?.trim() : '', data.start);

    // End point transport
    html += renderTransportEndpoint('Punto final', route.location ? route.location.split('→')[1]?.trim() : '', data.end);

    return html;
}

function renderTransportEndpoint(title, locationName, stops) {
    if (!stops || stops.length === 0) {
        return `<div style="margin-bottom:16px;">
            <h4 style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">${title}${locationName ? ' · ' + locationName : ''}</h4>
            <div style="padding:12px; background:var(--btn-secondary-bg); border-radius:10px; font-size:12px; color:var(--text-muted); text-align:center;">No se encontró transporte cercano</div>
        </div>`;
    }

    let html = `<div style="margin-bottom:16px;">
        <h4 style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">${title}${locationName ? ' · ' + locationName : ''}</h4>
        <div style="display:flex; flex-direction:column; gap:6px;">`;

    stops.slice(0, 5).forEach(stop => {
        const dColor = getDistanceColor(stop.distance);
        html += `<div class="transport-modal-card" onclick="flyToTransport(${stop.lon}, ${stop.lat}, '${stop.name.replace(/'/g, "\\'")}'); closeRouteModal();">
            <div style="font-size:20px; line-height:1; flex-shrink:0;">${getTransportIcon(stop.type)}</div>
            <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:600; color:var(--text-primary);">${stop.name}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${getTransportLabel(stop.type)}${stop.operator ? ' · ' + stop.operator : ''}</div>
                ${stop.lines && stop.lines.length > 0 ? `<div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Líneas: ${stop.lines.join(', ')}</div>` : ''}
            </div>
            <div style="text-align:right; flex-shrink:0;">
                <div style="font-size:12px; font-weight:700; color:${dColor};">${formatDistance(stop.distance)}</div>
                <div style="font-size:9px; color:var(--text-muted); margin-top:2px;">📍 Ver mapa</div>
            </div>
        </div>`;
    });

    html += '</div></div>';
    return html;
}

// ==================== MAP MARKERS ====================
let transportMarkersVisible = false;
let transportMapMarkers = [];

function toggleTransportMarkers() {
    transportMarkersVisible = !transportMarkersVisible;
    const btn = document.getElementById('transportMapBtn');

    if (transportMarkersVisible) {
        btn.classList.add('active');
        showTransportMarkers();
    } else {
        btn.classList.remove('active');
        hideTransportMarkers();
    }
}

async function showTransportMarkers() {
    hideTransportMarkers();
    if (typeof map === 'undefined' || typeof maplibregl === 'undefined') return;

    // Collect unique stops from all routes
    const allStops = new Map();
    for (const route of viasVerdes) {
        let data = transportData[route.id];
        if (!data) {
            data = await fetchRouteTransport(route.id, transportRadius);
            transportData[route.id] = data;
        }
        [...data.start, ...data.end].forEach(stop => {
            if (!allStops.has(stop.id)) allStops.set(stop.id, stop);
        });
    }

    allStops.forEach(stop => {
        const el = document.createElement('div');
        el.className = 'transport-map-marker';

        const isStation = stop.type === 'train' || stop.type === 'halt';
        const size = isStation ? 32 : 26;
        const iconSize = isStation ? 16 : 13;

        el.style.cssText = `width:${size}px; height:${size}px; border-radius:${size / 2}px; background:rgba(255,255,255,0.92); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1.5px solid rgba(${isStation ? '158,27,50' : '37,99,235'},0.3); display:flex; align-items:center; justify-content:center; font-size:${iconSize}px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.12); transition:transform 0.15s;`;
        el.textContent = getTransportIcon(stop.type);

        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
        el.addEventListener('click', () => {
            new maplibregl.Popup({ closeOnClick: true, maxWidth: '240px' })
                .setLngLat([stop.lon, stop.lat])
                .setHTML(`<div style="padding:8px 10px;">
                    <div style="font-size:13px; font-weight:700; margin-bottom:2px;">${getTransportIcon(stop.type)} ${stop.name}</div>
                    <div style="font-size:11px; color:#6b7280;">${getTransportLabel(stop.type)}${stop.operator ? ' · ' + stop.operator : ''}</div>
                    ${stop.lines && stop.lines.length > 0 ? `<div style="font-size:10px; color:#9ca3af; margin-top:2px;">Líneas: ${stop.lines.join(', ')}</div>` : ''}
                </div>`)
                .addTo(map);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([stop.lon, stop.lat])
            .addTo(map);
        transportMapMarkers.push(marker);
    });
}

function hideTransportMarkers() {
    transportMapMarkers.forEach(m => m.remove());
    transportMapMarkers = [];
}

// ==================== INIT ====================
async function initTransport() {
    // Transport tab loads on-demand when the tab is clicked
    // Pre-load only if data is cached
    const hasCached = viasVerdes.some(route => {
        const coords = ROUTE_START_COORDS[route.id];
        if (!coords) return false;
        return getCachedTransport(coords[0], coords[1], transportRadius) !== null;
    });
    if (hasCached) {
        loadTransportForAllRoutes();
    }
}
