# Carpeta GPX - Archivos de Rutas

Coloca aquí los archivos GPX de cada vía verde.
El sistema los cargará automáticamente para mostrar la ruta en el mapa y calcular la altimetría.

## Nomenclatura de archivos

| Archivo | Vía Verde |
|---------|-----------|
| `vv1-campo-cartagena.gpx` | Vía Verde del Campo de Cartagena |
| `vv2-mazarron.gpx` | Vía Verde de Mazarrón |
| `vv3-almendricos.gpx` | Vía Verde de Almendricos |
| `vv4-noroeste.gpx` | Vía Verde del Noroeste |
| `vv5-aguilas.gpx` | Vía Verde del Embarcadero del Hornillo |
| `vv6-chicharra-yecla.gpx` | Vía Verde del Chicharra - Yecla |
| `vv7-chicharra-cieza.gpx` | Vía Verde del Chicharra - Cieza |
| `vv8-floracion-cieza.gpx` | Vía Verde de la Floración de Cieza |

## Formato esperado

Los archivos GPX deben contener puntos de track (`<trkpt>`) con:

- `lat` - Latitud
- `lon` - Longitud  
- `<ele>` - Elevación en metros (importante para la altimetría)

Ejemplo:

```xml
<trkpt lat="37.6170" lon="-0.9830">
  <ele>30</ele>
</trkpt>
```
