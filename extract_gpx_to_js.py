import os
import xml.etree.ElementTree as ET
import json

gpx_dir = "h:/vias-verdes-murcia/gpx"
routes_info = [
    {
        "filename": "Via_Verde_Campo_de_Cartagena.gpx",
        "id": "vv1",
        "num": 1,
        "name": "Vía Verde del Campo de Cartagena",
        "desc": "La ruta más larga de Murcia. Atraviesa huertas, frutales y zonas áridas desde Cartagena hasta Totana.",
        "km": "51",
        "time": "4-5h bici",
        "diff": "easy",
        "type": "lineal",
        "location": "Cartagena → Totana",
        "tags": ["Ferrocarril", "Huerta", "Patrimonio"],
        "image_file": "vv1-campo-catagena_1.webp",
        "status": "operational"
    },
    {
        "filename": "Via_Verde_Mazarron.gpx",
        "id": "vv2",
        "num": 2,
        "name": "Vía Verde de Mazarrón",
        "desc": "Conecta con la Vía Verde del Campo de Cartagena en La Pinilla y desciende hacia Mazarrón.",
        "km": "13.8",
        "time": "1.5h bici",
        "diff": "easy",
        "type": "lineal",
        "location": "La Pinilla → Mazarrón",
        "tags": ["Sierra", "Minería", "Costa"],
        "image_file": None,
        "status": "operational"
    },
    {
        "filename": "Via-Verde-del-Noroeste.gpx",
        "id": "vv3",
        "num": 3,
        "name": "Vía Verde del Noroeste",
        "desc": "Peregrinación hacia Caravaca de la Cruz. Atraviesa paisajes lunares (badlands), pinares y antiguas estaciones.",
        "km": "78",
        "time": "7-8h bici",
        "diff": "medium",
        "type": "lineal",
        "location": "Murcia → Caravaca",
        "tags": ["Peregrinación", "Badlands", "Montaña"],
        "image_file": "vv4-noroeste_1.webp",
        "status": "operational" 
    },
    {
        "filename": "Via_Verde_Almendricos.gpx",
        "id": "vv4",
        "num": 4,
        "name": "Vía Verde de Almendricos",
        "desc": "Pequeño tramo que recupera la historia minera entre Lorca y el litoral almeriense.",
        "km": "6.6",
        "time": "45m bici",
        "diff": "easy",
        "type": "lineal",
        "location": "Almendricos",
        "tags": ["Minería", "Secano", "Historia"],
        "image_file": "vv3-almedricos_1.webp",
        "status": "coming_soon"
    },
    {
        "filename": "Via_Verde_Chicharra_Cieza.gpx",
        "id": "vv5",
        "num": 5,
        "name": "Vía Verde del Chicharra (Cieza)",
        "desc": "Recorrido por los paisajes de Cieza siguiendo el antiguo tren 'Chicharra'. Vistas a la huerta y montañas.",
        "km": "13.7",
        "time": "1.5h bici",
        "diff": "easy",
        "type": "lineal",
        "location": "Cieza",
        "tags": ["Huerta", "Floración", "Vistas"],
        "image_file": "vv7-chicharrra-cieza_1.webp",
        "status": "coming_soon"
    },
    {
        "filename": "Via_Verde_Chicharra_Yecla.gpx",
        "id": "vv6",
        "num": 6,
        "name": "Vía Verde del Chicharra (Yecla)",
        "desc": "Ruta por el Altiplano murciano, entre viñedos y paisajes esteparios, siguiendo el histórico tren.",
        "km": "9",
        "time": "1h bici",
        "diff": "easy",
        "type": "lineal",
        "location": "Yecla",
        "tags": ["Vino", "Altiplano", "Estepa"],
        "image_file": "vv6-chicharra-yecla_1.webp",
        "status": "coming_soon"
    },
    {
        "filename": "Via_Verde_Embarcadero_del_Hornillo.gpx",
        "id": "vv7",
        "num": 7,
        "name": "Vía Verde del Embarcadero del Hornillo",
        "desc": "Paseo urbano y costero en Águilas, visitando el histórico embarcadero de mineral británico.",
        "km": "1.2",
        "time": "20m a pie",
        "diff": "easy",
        "type": "lineal",
        "location": "Águilas",
        "tags": ["Costa", "Industrial", "Urbano"],
        "image_file": "vv5-aguilas_1.webp",
        "status": "coming_soon"
    },
    {
        "filename": "Via_Verde_Floracion_Cieza.gpx",
        "id": "vv8",
        "num": 8,
        "name": "Vía Verde de la Floración",
        "desc": "Espectacular ruta entre frutales, especialmente bella durante la floración primaveral de Cieza.",
        "km": "4.5",
        "time": "30m bici",
        "diff": "easy",
        "type": "circular",
        "location": "Cieza",
        "tags": ["Floración", "Naturaleza", "Fotografía"],
        "image_file": "vv8-floracion-cieza_1.webp",
        "status": "coming_soon"
    }
]

colors = [
    { "main": '#2D6A4F', "glow": '#40916C' }, # vv1
    { "main": '#16A34A', "glow": '#22C55E' }, # vv2
    { "main": '#0D9488', "glow": '#14B8A6' }, # vv3
    { "main": '#0369A1', "glow": '#0EA5E9' }, # vv4
    { "main": '#7C3AED', "glow": '#A78BFA' }, # vv5
    { "main": '#EA580C', "glow": '#F97316' }, # vv6
    { "main": '#DC2626', "glow": '#EF4444' }, # vv7
    { "main": '#DB2777', "glow": '#F472B6' }  # vv8
]

js_output = "const CONFIG = {\n"
js_output += "    center: [-1.13, 37.99],\n"
js_output += "    zoom: 8,\n"
js_output += "    boundaryColor: '#2D6A4F'\n"
js_output += "};\n\n"
js_output += "const VIA_VERDE_COLORS = [\n"
for c in colors:
    js_output += f"    {{ main: '{c['main']}', glow: '{c['glow']}' }},\n"
js_output += "];\n\n"

js_output += "const villasVerdes = [\n" # Use 'viasVerdes' eventually

js_output = js_output.replace("villasVerdes", "viasVerdes")

for i, route in enumerate(routes_info):
    file_path = os.path.join(gpx_dir, route["filename"])
    
    # Process GPX
    coords = []
    if os.path.exists(file_path):
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
            points = root.findall(".//gpx:trkpt", ns)
            if not points:
                points = root.findall(".//trkpt")
                
            for pt in points:
                lat = float(pt.get("lat"))
                lon = float(pt.get("lon"))
                ele = 0
                ele_tag = pt.find("gpx:ele", ns)
                if ele_tag is None:
                    ele_tag = pt.find("ele")
                if ele_tag is not None and ele_tag.text:
                    ele = float(ele_tag.text)
                coords.append([lon, lat, ele])
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")

    # Sampling
    step = 1
    if len(coords) > 600:
        step = len(coords) // 600
    sampled_coords = coords[::step]
    if coords and coords[-1] != sampled_coords[-1]:
        sampled_coords.append(coords[-1])
        
    color = colors[i % len(colors)]
    
    # Prepare Image URL
    image_url = "null"
    if route['image_file']:
        image_url = f"'assets/images/hero/{route['image_file']}'"
    
    js_obj = "    {\n"
    js_obj += f"        id: '{route['id']}',\n"
    js_obj += f"        num: {route['num']},\n"
    js_obj += f"        color: {{ main: '{color['main']}', glow: '{color['glow']}' }},\n"
    js_obj += f"        name: '{route['name']}',\n"
    safe_desc = route['desc'].replace("'", "\\'")
    js_obj += f"        desc: '{safe_desc}',\n"
    js_obj += f"        km: '{route['km']}',\n"
    js_obj += f"        time: '{route['time']}',\n"
    js_obj += f"        diff: '{route['diff']}',\n"
    js_obj += f"        type: '{route['type']}',\n"
    js_obj += f"        location: '{route['location']}',\n"
    tags_str = ", ".join([f"'{t}'" for t in route['tags']])
    js_obj += f"        tags: [{tags_str}],\n"
    js_obj += f"        status: '{route['status']}',\n"
    js_obj += f"        image: {image_url},\n"
    js_obj += f"        url360: null,\n"
    js_obj += f"        coords: {json.dumps(sampled_coords)}\n"
    js_obj += "    },"
    
    js_output += js_obj + "\n"

js_output += "];\n"

with open("h:/vias-verdes-murcia/data.js", "w", encoding="utf-8") as f:
    f.write(js_output)
    
print("Data reconstructed and written to data.js.")
