// ==================== PUNTOS DE INTERÉS - VÍAS VERDES DE MURCIA ====================
// Funcion para interpolar coordenadas a lo largo de una ruta dado un km
function interpolateCoord(routeId, km) {
    if (typeof viasVerdes === 'undefined') return [0, 0];
    const route = viasVerdes.find(v => v.id === routeId);
    if (!route || !route.coords || route.coords.length < 2) return [0, 0];

    const totalKm = parseFloat(route.km);
    let fraction = Math.min(Math.max(km / totalKm, 0), 1);
    // VV6 Yecla: las coordenadas en data.js van en sentido inverso al kilometraje real
    const reversedRoutes = ['vv6'];
    if (reversedRoutes.includes(routeId)) fraction = 1 - fraction;
    const targetIdx = fraction * (route.coords.length - 1);
    const idx = Math.floor(targetIdx);
    const t = targetIdx - idx;

    if (idx >= route.coords.length - 1) return [route.coords[route.coords.length - 1][0], route.coords[route.coords.length - 1][1]];

    const c1 = route.coords[idx];
    const c2 = route.coords[idx + 1];
    return [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t
    ];
}

// Funcion auxiliar para crear un POI feature
function poi(id, routeId, orden, tipo, titulo, descripcion, coords, urlTour) {
    return {
        "type": "Feature",
        "properties": { "id": id, "id_ruta": routeId, "orden_ruta": orden, "tipo": tipo, "titulo": titulo, "descripcion": descripcion, "url_tour": urlTour || "" },
        "geometry": { "type": "Point", "coordinates": coords }
    };
}

// ==================== GENERAR TODOS LOS POIs ====================
function generateAllPois() {
    const features = [];

    // ============================================================
    // VV1 - VÍA VERDE DEL CAMPO DE CARTAGENA (51 km)
    // ============================================================
    // Estaciones
    features.push(poi("vv1_est_001", "vv1", 1, "estacion", "Inicio - Barrio de Los Dolores", "Área de acogida y panel informativo. Conexión con carril bici hacia el puerto de Cartagena.", interpolateCoord("vv1", 0)));
    features.push(poi("vv1_est_002", "vv1", 2, "estacion", "Estación de El Romeral", "Edificio histórico abandonado de grandes dimensiones. Nunca llegó a tener vías en uso. Entorno de los Saladares del Guadalentín.", interpolateCoord("vv1", 41.4)));
    features.push(poi("vv1_est_003", "vv1", 3, "estacion", "Estación de Tren de Totana", "Final de la Vía Verde. Conexión con línea Cercanías Murcia-Águilas y enlace hacia la Vía Verde del Noroeste.", interpolateCoord("vv1", 51)));

    // Pueblos
    features.push(poi("vv1_pue_001", "vv1", 4, "pueblo", "La Aljorra", "Pueblo principal con servicios completos (tiendas, bares, farmacia).", interpolateCoord("vv1", 7.9)));
    features.push(poi("vv1_pue_002", "vv1", 5, "pueblo", "Fuente Álamo de Murcia", "Villa con todos los servicios. La vía atraviesa el casco urbano (tramo compartido/urbano).", interpolateCoord("vv1", 20.8)));
    features.push(poi("vv1_pue_003", "vv1", 6, "pueblo", "La Pinilla", "Conexión con la Vía Verde de Mazarrón. Iglesia de Nª Sª de Monserrat y olivo multicentenario.", interpolateCoord("vv1", 27)));
    features.push(poi("vv1_pue_004", "vv1", 7, "pueblo", "Cartagena", "Muralla Púnica, Teatro Romano, Museos (ARQUA, Naval), arquitectura modernista.", interpolateCoord("vv1", 0)));
    features.push(poi("vv1_pue_005", "vv1", 8, "pueblo", "Totana", "Santuario de Santa Eulalia, Yacimiento argárico de La Bastida, Iglesia de Santiago.", interpolateCoord("vv1", 51)));

    // Áreas de descanso
    features.push(poi("vv1_des_001", "vv1", 9, "area_descanso", "Área de Descanso Taibilla", "Junto al depósito de la Mancomunidad de Canales del Taibilla.", interpolateCoord("vv1", 3.9)));
    features.push(poi("vv1_des_002", "vv1", 10, "area_descanso", "Área de Descanso Casa Grande", "Situada en un vértice del rodeo a la finca Casa Grande.", interpolateCoord("vv1", 16)));

    // Puentes y viaductos
    features.push(poi("vv1_pue_006", "vv1", 11, "puente", "Pasarela Metálica RM-E11", "Gran pasarela peatonal/ciclista sobre la carretera RM-E11. Hito visual de la ruta. Área de Acogida.", interpolateCoord("vv1", 36.2)));
    features.push(poi("vv1_pue_007", "vv1", 12, "puente", "Puente sobre el Río Guadalentín", "Principal obra de fábrica (viaducto) de este tramo.", interpolateCoord("vv1", 46.2)));

    // Patrimonio
    features.push(poi("vv1_pat_001", "vv1", 13, "patrimonio", "Iglesia de Nª Sª de Monserrat", "Iglesia del siglo XVII en La Pinilla, junto a un olivo centenario.", interpolateCoord("vv1", 27)));

    // Paneles informativos
    features.push(poi("vv1_pan_001", "vv1", 14, "panel_interpretativo", "Panel Inicio Los Dolores", "Panel informativo en el área de acogida de Cartagena.", interpolateCoord("vv1", 0)));
    features.push(poi("vv1_pan_002", "vv1", 15, "panel_interpretativo", "Panel Pasarela RM-E11", "Panel informativo en el área de acogida de la pasarela.", interpolateCoord("vv1", 36.2)));

    // Puntos de interés / Precaución
    features.push(poi("vv1_via_001", "vv1", 16, "punto_conflictivo", "Desvío Finca Casa Grande", "La traza original está ocupada, se rodea por el perímetro. Firme irregular.", interpolateCoord("vv1", 10.8)));
    features.push(poi("vv1_via_002", "vv1", 17, "punto_conflictivo", "Desvío Finca La Loma", "Tramo con firme irregular/no acondicionado.", interpolateCoord("vv1", 29)));

    // Mirador / Naturaleza
    features.push(poi("vv1_mir_001", "vv1", 18, "mirador", "Saladares del Guadalentín", "Zona esteparia protegida cerca de la Estación de El Romeral. Paisaje único.", interpolateCoord("vv1", 42)));

    // Conexión con Vía Verde de la Barrio de Peral
    features.push(poi("vv1_ser_001", "vv1", 19, "servicio", "Conexión V.V. Barrio de Peral", "Ramal urbano de 1,8 km hacia el centro de Cartagena.", interpolateCoord("vv1", 1.8)));

    // Paso inferior
    features.push(poi("vv1_tun_001", "vv1", 20, "tunel", "Paso inferior Autovía RM-23", "Paso inferior bajo la autovía, cerca del resort Condado de Alhama.", interpolateCoord("vv1", 40.1)));

    // ============================================================
    // VV2 - VÍA VERDE DE MAZARRÓN (13.8 km)
    // ============================================================
    // Áreas de descanso
    features.push(poi("vv2_des_001", "vv2", 1, "area_descanso", "Inicio La Pinilla - Bifurcación", "Punto de inicio oficial. Bifurcación con V.V. Campo de Cartagena. Paneles interpretativos.", interpolateCoord("vv2", 0)));
    features.push(poi("vv2_des_002", "vv2", 2, "area_descanso", "Área El Saladillo", "Junto al aparcamiento del Mesón El Saladillo. Fuente y sombra.", interpolateCoord("vv2", 6)));
    features.push(poi("vv2_des_003", "vv2", 3, "area_descanso", "Área Las Yeseras", "Área de descanso habilitada con paneles informativos.", interpolateCoord("vv2", 10.5)));
    features.push(poi("vv2_des_004", "vv2", 4, "area_descanso", "Área Final - Cruce RM-D4", "Área de descanso final con paneles. Fin del trazado de tierra compactada.", interpolateCoord("vv2", 13.8)));

    // Miradores
    features.push(poi("vv2_mir_001", "vv2", 5, "mirador", "Mirador Sierra del Algarrobo", "Trincheras curvadas y terraplenes con vistas panorámicas hacia la depresión y paisaje de secano.", interpolateCoord("vv2", 1.5)));
    features.push(poi("vv2_mir_002", "vv2", 6, "mirador", "Alto de las Hermanillas", "Relieves volcánicos coronados por despuntes rocosos. Paisaje singular.", interpolateCoord("vv2", 7)));
    features.push(poi("vv2_mir_003", "vv2", 7, "mirador", "Paisaje Minero Cerro San Cristóbal", "Paisaje 'lunar' de tierras rojas y amarillas. Restos de arqueología industrial minera.", interpolateCoord("vv2", 12.8)));

    // Puentes
    features.push(poi("vv2_pue_001", "vv2", 8, "puente", "Puente Rambla Fuente de la Pinilla", "Gran puente de hormigón. Una de las obras de ingeniería más destacadas de la ruta.", interpolateCoord("vv2", 4)));
    features.push(poi("vv2_pue_002", "vv2", 9, "puente", "Puente Rambla del Saladillo", "Puente sobre la Rambla del Saladillo.", interpolateCoord("vv2", 6)));
    features.push(poi("vv2_pue_003", "vv2", 10, "puente", "Puente Rambla de las Yeseras", "Puente/viaducto sobre la Rambla de las Yeseras.", interpolateCoord("vv2", 10.5)));

    // Patrimonio
    features.push(poi("vv2_pat_001", "vv2", 11, "patrimonio", "Ermita de San José del Saladillo", "Ermita histórica (o San Antonio) situada frente al mesón.", interpolateCoord("vv2", 6)));
    features.push(poi("vv2_pat_002", "vv2", 12, "patrimonio", "Coto Minero San Cristóbal", "Zona minera histórica del Cerro San Cristóbal y Los Perules.", interpolateCoord("vv2", 12.8)));

    // Pueblos
    features.push(poi("vv2_pbl_001", "vv2", 13, "pueblo", "Country Club Mazarrón", "Urbanización con servicios: bar-restaurante y piscina pública en verano.", interpolateCoord("vv2", 8.7)));
    features.push(poi("vv2_pbl_002", "vv2", 14, "pueblo", "Mazarrón", "Casas Consistoriales, Iglesia de San Andrés, Castillo de los Vélez. Acceso por carril bici asfaltado.", interpolateCoord("vv2", 13.8)));

    // Paneles
    features.push(poi("vv2_pan_001", "vv2", 15, "panel_interpretativo", "Panel La Pinilla", "Panel interpretativo en el inicio de la bifurcación.", interpolateCoord("vv2", 0)));

    // ============================================================
    // VV3 - VÍA VERDE DEL NOROESTE (78 km)
    // ============================================================
    // Etapa 1: Espinardo - Alguazas (0-10 km)
    features.push(poi("vv3_est_001", "vv3", 1, "estacion", "Campus de Espinardo - Inicio", "Punto de inicio oficial en el perímetro norte del Campus de la Universidad de Murcia.", interpolateCoord("vv3", 0)));
    features.push(poi("vv3_des_001", "vv3", 2, "area_descanso", "Área Cabezo del Aire", "Cruce con señalización hacia el Itinerario ecoturístico Los Cordeles.", interpolateCoord("vv3", 1.5)));
    features.push(poi("vv3_tun_001", "vv3", 3, "tunel", "Túnel 1 - Espinardo", "Galería recta de 200 metros, bien iluminada.", interpolateCoord("vv3", 3.9)));
    features.push(poi("vv3_est_002", "vv3", 4, "estacion", "Estación La Ribera de Molina", "Antiguo almacén reconvertido en bar.", interpolateCoord("vv3", 4)));
    features.push(poi("vv3_est_003", "vv3", 5, "estacion", "Estación de Molina de Segura", "Actualmente gestionada por Cruz Roja.", interpolateCoord("vv3", 7.1)));
    features.push(poi("vv3_pco_001", "vv3", 6, "punto_conflictivo", "Cruce N-344", "Paso de cebra regulado por semáforo. Precaución.", interpolateCoord("vv3", 7.5)));
    features.push(poi("vv3_pue_001", "vv3", 7, "puente", "Puente de Hierro - Río Segura", "Imponente puente metálico restaurado. Uno de los vestigios más llamativos de la ruta.", interpolateCoord("vv3", 9.1)));
    features.push(poi("vv3_alb_001", "vv3", 8, "albergue", "Albergue Estación de Alguazas", "Antigua estación recuperada como albergue y cafetería.", interpolateCoord("vv3", 9.7)));

    // Etapa 2: Alguazas - Mula (10-34 km)
    features.push(poi("vv3_mir_001", "vv3", 9, "mirador", "Inicio Badlands", "El paisaje cambia de huerta a tierras baldías (badlands). Vista espectacular.", interpolateCoord("vv3", 12.4)));
    features.push(poi("vv3_des_002", "vv3", 10, "area_descanso", "Área entre cultivos", "Zona de descanso entre terrenos de cultivo antes de Los Rodeos.", interpolateCoord("vv3", 15)));
    features.push(poi("vv3_est_004", "vv3", 11, "estacion", "Estación de Los Rodeos", "Estación abandonada con área de descanso. Vistas a los meandros del río Mula.", interpolateCoord("vv3", 19.1)));
    features.push(poi("vv3_alb_002", "vv3", 12, "albergue", "Albergue Estación Campos del Río", "Estación recuperada como albergue en la plaza del pueblo.", interpolateCoord("vv3", 22.4)));
    features.push(poi("vv3_pue_002", "vv3", 13, "puente", "Viaducto Barranco de Gracia", "Gran viaducto sobre rambla.", interpolateCoord("vv3", 24.6)));
    features.push(poi("vv3_pue_003", "vv3", 14, "puente", "Viaducto Barranco del Arco", "Viaducto sobre el Barranco del Arco.", interpolateCoord("vv3", 25.5)));
    features.push(poi("vv3_alb_003", "vv3", 15, "albergue", "Albergue Estación de Albudeite", "Estación recuperada como albergue. La plataforma férrea se convierte en un balcón sobre las cárcavas.", interpolateCoord("vv3", 26)));
    features.push(poi("vv3_pue_004", "vv3", 16, "puente", "Viaducto Barranco del Moro", "Viaducto sobre el Barranco del Moro (o del Carrizal).", interpolateCoord("vv3", 28.3)));
    features.push(poi("vv3_est_005", "vv3", 17, "estacion", "Estación de Baños de Mula", "En estado ruinoso. La pedanía cuenta con famosas instalaciones termales.", interpolateCoord("vv3", 29.3)));
    features.push(poi("vv3_pue_005", "vv3", 18, "puente", "Viaducto Rambla de Perea", "Gran longitud (200 metros) y altura considerable.", interpolateCoord("vv3", 29.6)));
    features.push(poi("vv3_est_006", "vv3", 19, "estacion", "Estación de La Puebla de Mula", "Cuenta con área de descanso.", interpolateCoord("vv3", 32)));
    features.push(poi("vv3_pue_006", "vv3", 20, "puente", "Viaducto La Sultana - Río Mula", "Espectacular viaducto sobre el río. Vistas a la casa 'La Sultana'. Mirador.", interpolateCoord("vv3", 32.7)));

    // Etapa 3: Mula - Bullas (34-52 km)
    features.push(poi("vv3_pbl_001", "vv3", 21, "pueblo", "Mula", "Travesía urbana. Gran patrimonio histórico: Castillo de los Vélez, iglesias, museos.", interpolateCoord("vv3", 34.5)));
    features.push(poi("vv3_est_007", "vv3", 22, "estacion", "Apeadero de El Niño", "Cerca de la Ermita de El Niño de Mula.", interpolateCoord("vv3", 40.5)));
    features.push(poi("vv3_tun_002", "vv3", 23, "tunel", "Zona de 4 Túneles (Mula-Bullas)", "Concentración de 4 túneles (entre 60m y 200m) debido al terreno montañoso.", interpolateCoord("vv3", 42)));
    features.push(poi("vv3_alb_004", "vv3", 24, "albergue", "Albergue Apeadero de La Luz", "Pequeño albergue-refugio en un entorno de pinares.", interpolateCoord("vv3", 45.2)));
    features.push(poi("vv3_pue_007", "vv3", 25, "puente", "Viaducto Río Mula (La Luz)", "Gran viaducto de ocho arcos. Vistas espectaculares del paisaje.", interpolateCoord("vv3", 46)));
    features.push(poi("vv3_pbl_002", "vv3", 26, "pueblo", "Bullas", "Punto más alto de la ruta (630m). Famoso por sus bodegas y vino. Museo del Vino.", interpolateCoord("vv3", 52)));

    // Etapa 4: Bullas - Caravaca (52-78 km)
    features.push(poi("vv3_alb_005", "vv3", 27, "albergue", "Camping/Albergue La Rafa", "Albergue de la Vía Verde junto al camping, en entorno natural.", interpolateCoord("vv3", 57.4)));
    features.push(poi("vv3_des_003", "vv3", 28, "area_descanso", "Área tras la autovía", "Punto donde se retoma la plataforma del ferrocarril.", interpolateCoord("vv3", 60)));
    features.push(poi("vv3_pue_008", "vv3", 29, "puente", "Viaducto Arroyo Burete", "Zona de pinares y laderas abruptas.", interpolateCoord("vv3", 66)));
    features.push(poi("vv3_pue_009", "vv3", 30, "puente", "Viaducto Río Quípar", "Viaducto sobre el Río Quípar.", interpolateCoord("vv3", 68.7)));
    features.push(poi("vv3_pat_001", "vv3", 31, "patrimonio", "Ruinas de Begastri", "Antigua ciudad romano-visigoda, antecedente de Cehegín. Yacimiento arqueológico.", interpolateCoord("vv3", 69)));
    features.push(poi("vv3_alb_006", "vv3", 32, "albergue", "Albergue Estación de Cehegín", "Ofrece albergue y restaurante. Cerca del casco histórico (Conjunto Histórico Artístico).", interpolateCoord("vv3", 70.4)));
    features.push(poi("vv3_tun_003", "vv3", 33, "tunel", "Último Túnel", "Último túnel de la ruta antes de entrar en el valle del Argos.", interpolateCoord("vv3", 72.9)));
    features.push(poi("vv3_pue_010", "vv3", 34, "puente", "Viaducto Río Argos", "Viaducto sobre el Río Argos.", interpolateCoord("vv3", 73.4)));
    features.push(poi("vv3_alb_007", "vv3", 35, "albergue", "Albergue Estación de Caravaca", "Rehabilitada como albergue con cantina. Punto final del recorrido.", interpolateCoord("vv3", 76.8)));
    features.push(poi("vv3_pat_002", "vv3", 36, "patrimonio", "Basílica de la Vera Cruz", "Ciudad Santa de Caravaca de la Cruz. Basílica-Santuario de la Vera Cruz.", interpolateCoord("vv3", 78)));
    features.push(poi("vv3_pbl_003", "vv3", 37, "pueblo", "Caravaca de la Cruz", "Ciudad Santa. Basílica de la Vera Cruz, castillo, casco histórico.", interpolateCoord("vv3", 78)));

    // ============================================================
    // VV4 - VÍA VERDE DE ALMENDRICOS (6.6 km)
    // ============================================================
    features.push(poi("vv4_est_001", "vv4", 1, "estacion", "Apeadero de Almendricos", "Punto de inicio. Zona con paneles informativos y área recreativa con mesas.", interpolateCoord("vv4", 0)));
    features.push(poi("vv4_pat_001", "vv4", 2, "patrimonio", "Yacimiento argárico El Rincón", "Poblado de la Edad del Bronce, situado a 1 km al norte.", interpolateCoord("vv4", 0.5)));
    features.push(poi("vv4_pco_001", "vv4", 3, "punto_conflictivo", "Rambla de los Pelegrines", "¡Atención! No hay puente; bajada y subida por rampas empinadas de cemento.", interpolateCoord("vv4", 0.4)));
    features.push(poi("vv4_des_001", "vv4", 4, "area_descanso", "Primera Área de Descanso", "Equipada con mobiliario y plantaciones de algarrobos y pinos.", interpolateCoord("vv4", 3)));
    features.push(poi("vv4_mir_001", "vv4", 5, "mirador", "Mirador Límite Regional", "Punto donde termina la Región de Murcia y comienza Andalucía. Cambio de paisaje.", interpolateCoord("vv4", 6.6)));

    // ============================================================
    // VV5 - VÍA VERDE DEL CHICHARRA CIEZA (13.7 km)
    // ============================================================
    features.push(poi("vv5_des_001", "vv5", 1, "area_descanso", "Área Casa del Manchego", "Límite norte de la Vía Verde. Ruinas de antigua casilla ferroviaria.", interpolateCoord("vv5", 0)));
    features.push(poi("vv5_est_001", "vv5", 2, "estacion", "Apeadero de Las Lomas", "Área de acogida en el antiguo apeadero. Cruce con carretera RM-714.", interpolateCoord("vv5", 4.1)));
    features.push(poi("vv5_des_002", "vv5", 3, "area_descanso", "Área El Elipe - Olivo del Argaz", "Bajo un pino centenario. Centro de Interpretación del Melocotón de Cieza y árbol singular.", interpolateCoord("vv5", 7.7)));
    features.push(poi("vv5_mir_001", "vv5", 4, "mirador", "Mirador de Badlands", "Zona de paisaje árido (badlands) antes del viaducto.", interpolateCoord("vv5", 9.7)));
    features.push(poi("vv5_pue_001", "vv5", 5, "puente", "Viaducto Rambla del Judío", "Pasarela metálica roja de más de 40 metros sobre los estribos del antiguo puente. Excelentes vistas.", interpolateCoord("vv5", 11.2)));
    features.push(poi("vv5_pan_001", "vv5", 6, "panel_interpretativo", "Panel Polígono Los Prados", "Área de acogida principal con paneles informativos. Carril bici hacia Cieza.", interpolateCoord("vv5", 13.7)));
    features.push(poi("vv5_pbl_001", "vv5", 7, "pueblo", "Cieza", "Ciudad del melocotón. Conexión con Vía Verde de la Floración.", interpolateCoord("vv5", 13.7)));

    // ============================================================
    // VV6 - VÍA VERDE DEL CHICHARRA YECLA (9 km)
    // ============================================================
    features.push(poi("vv6_est_001", "vv6", 1, "estacion", "Antigua Estación de Yecla", "Punto de inicio del itinerario histórico del tren 'Chicharra'.", interpolateCoord("vv6", 0)));
    features.push(poi("vv6_pbl_001", "vv6", 2, "pueblo", "Yecla", "Ciudad vinícola al norte de la Región de Murcia.", interpolateCoord("vv6", 0)));
    features.push(poi("vv6_mir_001", "vv6", 3, "mirador", "Mirador Sierra del Buey", "Vistas panorámicas al paisaje agrícola: viñedos, olivos y almendros.", interpolateCoord("vv6", 4)));
    features.push(poi("vv6_des_001", "vv6", 4, "area_descanso", "Áreas de Descanso Sierra del Buey", "Varias zonas de descanso y miradores señalizados a lo largo del camino rural.", interpolateCoord("vv6", 5)));

    // ============================================================
    // VV7 - VÍA VERDE DEL EMBARCADERO DEL HORNILLO (1.2 km)
    // ============================================================
    features.push(poi("vv7_pbl_001", "vv7", 1, "pueblo", "Águilas", "Núcleo urbano donde se encuentra toda la ruta.", interpolateCoord("vv7", 0)));
    features.push(poi("vv7_est_001", "vv7", 2, "estacion", "Estación de Águilas", "Punto de partida histórico del ramal. Museo del Ferrocarril en el sótano.", interpolateCoord("vv7", 0)));
    features.push(poi("vv7_pat_001", "vv7", 3, "patrimonio", "Locomotora 'La Pava'", "Locomotora de vapor de 1890 (Glasgow). Monumento en la Plaza de Isaac Peral.", interpolateCoord("vv7", 0)));
    features.push(poi("vv7_pue_001", "vv7", 4, "puente", "Puente Rambla de las Culebras", "Estructura metálica de 42 metros sostenida por pilares de sillar.", interpolateCoord("vv7", 0.4)));
    features.push(poi("vv7_pan_001", "vv7", 5, "panel_interpretativo", "Paneles Tramo Acondicionado", "Paneles que explican la historia del mineral, la construcción y el funcionamiento del cargadero.", interpolateCoord("vv7", 0.7)));
    features.push(poi("vv7_tun_001", "vv7", 6, "tunel", "Túnel Musealizado", "Primer túnel de carga acondicionado como Centro de Interpretación. Tres túneles en total.", interpolateCoord("vv7", 0.85)));
    features.push(poi("vv7_des_001", "vv7", 7, "area_descanso", "Área de Descanso Túneles", "Marquesinas metálicas con bancos, papeleras e iluminación junto a los túneles.", interpolateCoord("vv7", 0.9)));
    features.push(poi("vv7_mir_001", "vv7", 8, "mirador", "Mirador del Embarcadero", "Pasarela metálica sobre los depósitos. Vistas panorámicas a la Bahía del Hornillo e Isla del Fraile.", interpolateCoord("vv7", 1)));
    features.push(poi("vv7_pat_002", "vv7", 9, "patrimonio", "Embarcadero del Hornillo (BIC)", "Estructura icónica de acero y hormigón (1903). Ingeniero Gustavo Gillman. 178m de largo, 12m de alto. Bien de Interés Cultural.", interpolateCoord("vv7", 1.1)));

    // ============================================================
    // VV8 - VÍA VERDE DE LA FLORACIÓN (4.5 km)
    // ============================================================
    features.push(poi("vv8_mir_001", "vv8", 1, "mirador", "Mirador de La Macetúa", "Mirador con vistas a los campos de melocotoneros en flor (febrero-marzo).", interpolateCoord("vv8", 2)));
    features.push(poi("vv8_est_001", "vv8", 2, "estacion", "Antigua Estación de La Macetúa", "Estación histórica en la ruta de la floración.", interpolateCoord("vv8", 3)));
    features.push(poi("vv8_pbl_001", "vv8", 3, "pueblo", "Cieza (conexión)", "Conexión con la V.V. del Chicharra Cieza al norte.", interpolateCoord("vv8", 0)));

    return features;
}
