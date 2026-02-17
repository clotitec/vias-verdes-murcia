// ==================== WEATHER MODULE - Open-Meteo API ====================
// Free API, no key required. ~10,000 calls/day.

const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Route start coordinates [lat, lon] - extracted from data.js first coord
const ROUTE_START_COORDS = {
    vv1: [37.7639, -1.4954],
    vv2: [37.6901, -1.2859],
    vv3: [38.0205, -1.1718],
    vv4: [37.4761, -1.7781],
    vv5: [38.3670, -1.4515],
    vv6: [38.6165, -1.0123],
    vv7: [37.4090, -1.5670],
    vv8: [38.2833, -1.4785]
};

// WMO Weather Code mappings
const WMO_CODES = {
    0:  { icon: '☀️', iconNight: '🌙', desc: 'Despejado' },
    1:  { icon: '🌤️', iconNight: '🌙', desc: 'Mayormente despejado' },
    2:  { icon: '⛅', iconNight: '☁️', desc: 'Parcialmente nublado' },
    3:  { icon: '☁️', iconNight: '☁️', desc: 'Nublado' },
    45: { icon: '🌫️', iconNight: '🌫️', desc: 'Niebla' },
    48: { icon: '🌫️', iconNight: '🌫️', desc: 'Niebla con escarcha' },
    51: { icon: '🌦️', iconNight: '🌧️', desc: 'Llovizna ligera' },
    53: { icon: '🌦️', iconNight: '🌧️', desc: 'Llovizna moderada' },
    55: { icon: '🌧️', iconNight: '🌧️', desc: 'Llovizna intensa' },
    61: { icon: '🌧️', iconNight: '🌧️', desc: 'Lluvia ligera' },
    63: { icon: '🌧️', iconNight: '🌧️', desc: 'Lluvia moderada' },
    65: { icon: '🌧️', iconNight: '🌧️', desc: 'Lluvia intensa' },
    66: { icon: '🌨️', iconNight: '🌨️', desc: 'Lluvia helada ligera' },
    67: { icon: '🌨️', iconNight: '🌨️', desc: 'Lluvia helada intensa' },
    71: { icon: '❄️', iconNight: '❄️', desc: 'Nieve ligera' },
    73: { icon: '❄️', iconNight: '❄️', desc: 'Nieve moderada' },
    75: { icon: '❄️', iconNight: '❄️', desc: 'Nieve intensa' },
    77: { icon: '🌨️', iconNight: '🌨️', desc: 'Granizo' },
    80: { icon: '🌦️', iconNight: '🌧️', desc: 'Chubascos ligeros' },
    81: { icon: '🌧️', iconNight: '🌧️', desc: 'Chubascos moderados' },
    82: { icon: '🌧️', iconNight: '🌧️', desc: 'Chubascos intensos' },
    85: { icon: '🌨️', iconNight: '🌨️', desc: 'Nieve ligera' },
    86: { icon: '🌨️', iconNight: '🌨️', desc: 'Nieve intensa' },
    95: { icon: '⛈️', iconNight: '⛈️', desc: 'Tormenta' },
    96: { icon: '⛈️', iconNight: '⛈️', desc: 'Tormenta con granizo' },
    99: { icon: '⛈️', iconNight: '⛈️', desc: 'Tormenta con granizo intenso' }
};

function getWeatherIcon(weatherCode, isDay) {
    const wmo = WMO_CODES[weatherCode] || WMO_CODES[0];
    return isDay ? wmo.icon : wmo.iconNight;
}

function getWeatherDescription(weatherCode) {
    const wmo = WMO_CODES[weatherCode] || WMO_CODES[0];
    return wmo.desc;
}

function getWindDirection(degrees) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(degrees / 45) % 8];
}

// localStorage cache
function getCachedWeather(lat, lon) {
    try {
        const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp > WEATHER_CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return data.weather;
    } catch (e) {
        return null;
    }
}

function setCachedWeather(lat, lon, weather) {
    try {
        const key = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), weather }));
    } catch (e) { /* quota exceeded, ignore */ }
}

async function fetchWeather(lat, lon) {
    // Check cache first
    const cached = getCachedWeather(lat, lon);
    if (cached) return cached;

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,uv_index',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
        timezone: 'Europe/Madrid',
        forecast_days: 4
    });

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!response.ok) throw new Error('Weather API error');
        const data = await response.json();
        setCachedWeather(lat, lon, data);
        return data;
    } catch (e) {
        console.warn('Weather fetch failed:', e);
        return null;
    }
}

// Fetch weather for a specific route
async function fetchRouteWeather(routeId) {
    const coords = ROUTE_START_COORDS[routeId];
    if (!coords) return null;
    return fetchWeather(coords[0], coords[1]);
}

// Fetch weather for all routes (batch)
async function fetchAllRoutesWeather() {
    const uniqueCoords = {};
    Object.entries(ROUTE_START_COORDS).forEach(([id, coords]) => {
        const key = `${coords[0].toFixed(2)}_${coords[1].toFixed(2)}`;
        if (!uniqueCoords[key]) uniqueCoords[key] = { coords, routes: [] };
        uniqueCoords[key].routes.push(id);
    });

    const results = {};
    const promises = Object.values(uniqueCoords).map(async ({ coords, routes }) => {
        const data = await fetchWeather(coords[0], coords[1]);
        routes.forEach(id => { results[id] = data; });
    });

    await Promise.all(promises);
    return results;
}

// Route recommendation based on weather
function getRouteRecommendation(weatherData, routeDifficulty) {
    if (!weatherData || !weatherData.current) return { score: 'bueno', warnings: [] };

    const current = weatherData.current;
    const temp = current.temperature_2m;
    const wind = current.wind_speed_10m;
    const uv = current.uv_index;
    const code = current.weather_code;
    const warnings = [];

    // Temperature warnings
    if (temp >= 35) {
        warnings.push({ type: 'danger', icon: '🌡️', text: 'Alerta por calor extremo. No recomendada.' });
    } else if (temp >= 30) {
        warnings.push({ type: 'warning', icon: '☀️', text: 'Mucho calor. Lleva agua extra y proteccion solar.' });
    } else if (temp <= 5) {
        warnings.push({ type: 'warning', icon: '🥶', text: 'Frio intenso. Abrigate bien.' });
    } else if (temp <= 0) {
        warnings.push({ type: 'danger', icon: '❄️', text: 'Riesgo de helada. Extrema precaucion.' });
    }

    // UV warnings
    if (uv >= 8) {
        warnings.push({ type: 'danger', icon: '☀️', text: 'UV muy alto. Proteccion solar imprescindible.' });
    } else if (uv >= 6) {
        warnings.push({ type: 'warning', icon: '🧴', text: 'UV alto. Usa proteccion solar.' });
    }

    // Wind warnings
    if (wind >= 40) {
        warnings.push({ type: 'danger', icon: '💨', text: 'Viento muy fuerte. No recomendada.' });
    } else if (wind >= 25) {
        warnings.push({ type: 'warning', icon: '🌬️', text: 'Viento moderado-fuerte. Precaucion en zonas expuestas.' });
    }

    // Rain/storm warnings
    if ([95, 96, 99].includes(code)) {
        warnings.push({ type: 'danger', icon: '⛈️', text: 'Tormenta activa. No salgas a la ruta.' });
    } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        warnings.push({ type: 'warning', icon: '🌧️', text: 'Lluvia. Superficie puede estar resbaladiza.' });
    } else if ([51, 53, 55].includes(code)) {
        warnings.push({ type: 'info', icon: '🌦️', text: 'Llovizna ligera. Lleva chubasquero.' });
    }

    // Fog
    if ([45, 48].includes(code)) {
        warnings.push({ type: 'warning', icon: '🌫️', text: 'Niebla. Visibilidad reducida.' });
    }

    // Score
    const hasDanger = warnings.some(w => w.type === 'danger');
    const hasWarning = warnings.some(w => w.type === 'warning');
    const score = hasDanger ? 'no_recomendado' : hasWarning ? 'precaucion' : 'bueno';

    return { score, warnings };
}

// Render sidebar weather widget
function renderWeatherWidget(weatherData) {
    const container = document.getElementById('weatherWidget');
    if (!container) return;

    // Update floating button icon & temp
    const floatIcon = document.getElementById('weatherFloatIcon');
    const floatTemp = document.getElementById('weatherFloatTemp');
    if (weatherData && weatherData.current && floatIcon && floatTemp) {
        const c = weatherData.current;
        floatIcon.textContent = getWeatherIcon(c.weather_code, c.is_day);
        floatTemp.textContent = Math.round(c.temperature_2m) + '°';
    }

    if (!weatherData || !weatherData.current) {
        container.innerHTML = '';
        return;
    }

    const c = weatherData.current;
    const icon = getWeatherIcon(c.weather_code, c.is_day);
    const desc = getWeatherDescription(c.weather_code);
    const windDir = getWindDirection(c.wind_direction_10m);

    const daily = weatherData.daily;
    const todayMax = daily ? Math.round(daily.temperature_2m_max[0]) : '--';
    const todayMin = daily ? Math.round(daily.temperature_2m_min[0]) : '--';

    // UV color
    let uvColor = '#22c55e';
    if (c.uv_index >= 8) uvColor = '#dc2626';
    else if (c.uv_index >= 6) uvColor = '#f97316';
    else if (c.uv_index >= 3) uvColor = '#eab308';

    container.innerHTML = `
        <div class="weather-widget-inner">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:28px; line-height:1;">${icon}</span>
                    <div>
                        <div style="font-size:22px; font-weight:800; color:var(--text-primary); line-height:1;">${Math.round(c.temperature_2m)}°</div>
                        <div style="font-size:11px; color:var(--text-secondary); font-weight:500;">${desc}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px; color:var(--text-secondary);">
                        <span style="color:#ef4444;">↑${todayMax}°</span>
                        <span style="color:#3b82f6;">↓${todayMin}°</span>
                    </div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Sensacion ${Math.round(c.apparent_temperature)}°</div>
                </div>
            </div>
            <div style="display:flex; gap:12px; font-size:10px; color:var(--text-secondary);">
                <span style="display:flex; align-items:center; gap:3px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>
                    ${Math.round(c.wind_speed_10m)} km/h ${windDir}
                </span>
                <span style="display:flex; align-items:center; gap:3px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
                    ${c.relative_humidity_2m}%
                </span>
                <span style="display:flex; align-items:center; gap:3px;">
                    <span style="color:${uvColor}; font-weight:700;">UV</span>
                    ${Math.round(c.uv_index)}
                </span>
            </div>
        </div>
    `;
}

// Render mini weather badge for route card
function renderWeatherBadge(weatherData) {
    if (!weatherData || !weatherData.current) return '';
    const c = weatherData.current;
    const icon = getWeatherIcon(c.weather_code, c.is_day);
    const temp = Math.round(c.temperature_2m);

    let tempColor = '#6b7280';
    if (temp >= 30) tempColor = '#ef4444';
    else if (temp <= 10) tempColor = '#3b82f6';

    return `<span class="badge weather-badge" style="background:var(--btn-secondary-bg); color:${tempColor}; display:flex; align-items:center; gap:3px; font-weight:600;">${icon} ${temp}°</span>`;
}

// Render weather section in route detail modal
function renderModalWeatherSection(weatherData, routeId) {
    if (!weatherData || !weatherData.current || !weatherData.daily) {
        return '<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:12px;">Datos meteorologicos no disponibles</div>';
    }

    const c = weatherData.current;
    const d = weatherData.daily;
    const icon = getWeatherIcon(c.weather_code, c.is_day);
    const desc = getWeatherDescription(c.weather_code);
    const windDir = getWindDirection(c.wind_direction_10m);
    const rawRoute = viasVerdes.find(v => v.id === routeId);
    const rec = getRouteRecommendation(weatherData, rawRoute ? rawRoute.diff : 'easy');

    // UV color
    let uvColor = '#22c55e', uvLabel = 'Bajo';
    if (c.uv_index >= 8) { uvColor = '#dc2626'; uvLabel = 'Muy alto'; }
    else if (c.uv_index >= 6) { uvColor = '#f97316'; uvLabel = 'Alto'; }
    else if (c.uv_index >= 3) { uvColor = '#eab308'; uvLabel = 'Moderado'; }

    // Score badge
    let scoreBg, scoreColor, scoreText;
    if (rec.score === 'bueno') { scoreBg = '#dcfce7'; scoreColor = '#166534'; scoreText = 'Buenas condiciones'; }
    else if (rec.score === 'precaucion') { scoreBg = '#fef3c7'; scoreColor = '#92400e'; scoreText = 'Precaucion'; }
    else { scoreBg = '#fee2e2'; scoreColor = '#991b1b'; scoreText = 'No recomendado'; }

    // 3-day forecast
    let forecastHtml = '';
    for (let i = 1; i <= 3 && i < d.time.length; i++) {
        const date = new Date(d.time[i]);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
        const fIcon = getWeatherIcon(d.weather_code[i], true);
        const rainProb = d.precipitation_probability_max[i];
        forecastHtml += `
            <div class="forecast-day-card">
                <div style="font-size:11px; font-weight:600; color:var(--text-secondary); text-transform:capitalize;">${dayName}</div>
                <div style="font-size:20px; margin:4px 0;">${fIcon}</div>
                <div style="font-size:12px; font-weight:700; color:var(--text-primary);">
                    <span style="color:#ef4444;">${Math.round(d.temperature_2m_max[i])}°</span>
                    <span style="color:#3b82f6; font-weight:500;">${Math.round(d.temperature_2m_min[i])}°</span>
                </div>
                ${rainProb > 0 ? `<div style="font-size:10px; color:#3b82f6; margin-top:2px;">🌧 ${rainProb}%</div>` : ''}
            </div>`;
    }

    // Warnings
    let warningsHtml = '';
    if (rec.warnings.length > 0) {
        warningsHtml = `<div style="display:flex; flex-direction:column; gap:6px; margin-top:12px;">`;
        rec.warnings.forEach(w => {
            const bg = w.type === 'danger' ? '#fee2e2' : w.type === 'warning' ? '#fef3c7' : '#eff6ff';
            const color = w.type === 'danger' ? '#991b1b' : w.type === 'warning' ? '#92400e' : '#1e40af';
            const border = w.type === 'danger' ? '#fecaca' : w.type === 'warning' ? '#fde68a' : '#bfdbfe';
            warningsHtml += `<div style="display:flex; align-items:center; gap:8px; padding:8px 10px; background:${bg}; border:1px solid ${border}; border-radius:8px; font-size:11px; color:${color};">${w.icon} ${w.text}</div>`;
        });
        warningsHtml += '</div>';
    }

    return `
        <div class="weather-modal-section">
            <h4 style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
                Meteorologia actual
            </h4>

            <!-- Score badge -->
            <div style="display:inline-flex; align-items:center; gap:6px; padding:5px 12px; background:${scoreBg}; color:${scoreColor}; border-radius:20px; font-size:11px; font-weight:600; margin-bottom:12px;">
                ${rec.score === 'bueno' ? '✅' : rec.score === 'precaucion' ? '⚠️' : '❌'} ${scoreText}
            </div>

            <!-- Current conditions -->
            <div style="display:flex; align-items:center; gap:14px; padding:14px; background:var(--btn-secondary-bg); border-radius:12px; margin-bottom:12px;">
                <span style="font-size:40px; line-height:1;">${icon}</span>
                <div style="flex:1;">
                    <div style="font-size:28px; font-weight:800; color:var(--text-primary); line-height:1;">${Math.round(c.temperature_2m)}°C</div>
                    <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${desc}</div>
                </div>
                <div style="text-align:right; font-size:11px; color:var(--text-secondary); line-height:1.6;">
                    <div>Sensacion ${Math.round(c.apparent_temperature)}°</div>
                    <div>Viento ${Math.round(c.wind_speed_10m)} km/h ${windDir}</div>
                    <div>Humedad ${c.relative_humidity_2m}%</div>
                    <div style="color:${uvColor}; font-weight:600;">UV ${Math.round(c.uv_index)} - ${uvLabel}</div>
                </div>
            </div>

            <!-- 3-day forecast -->
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">
                ${forecastHtml}
            </div>

            ${warningsHtml}
        </div>
    `;
}

// Global weather data store
let allWeatherData = {};

// Initialize weather for all routes
async function initWeather() {
    try {
        allWeatherData = await fetchAllRoutesWeather();

        // Render sidebar widget with weather from center of region (vv1)
        const mainWeather = allWeatherData['vv1'] || Object.values(allWeatherData)[0];
        renderWeatherWidget(mainWeather);

        // Update route cards with weather badges
        updateRouteCardsWeather();
    } catch (e) {
        console.warn('Weather init failed:', e);
    }
}

// Update route cards after weather data arrives
function updateRouteCardsWeather() {
    document.querySelectorAll('.route-card').forEach(card => {
        const onclick = card.getAttribute('onclick') || '';
        const match = onclick.match(/openRouteModal\('(vv\d+)'\)/);
        if (!match) return;
        const routeId = match[1];
        const weather = allWeatherData[routeId];
        if (!weather) return;

        const badgesContainer = card.querySelector('.weather-badge');
        if (badgesContainer) return; // already has weather badge

        const badgeRow = card.querySelector('[style*="flex-wrap:wrap"]');
        if (badgeRow) {
            badgeRow.insertAdjacentHTML('beforeend', renderWeatherBadge(weather));
        }
    });
}
