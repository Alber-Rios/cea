document.addEventListener('DOMContentLoaded', () => {
    // Busca el botón "VER MÁS" de la primera tarjeta
    const btnVerPuntos = document.querySelector('.cards-section .card:nth-child(1) button');
    const seccionMapa = document.getElementById('seccion-mapa');
    let mapaIniciado = false;

    // --- 1. DEFINICIÓN DE PUNTOS Y HORARIOS CON COORDENADAS PRECISAS ---
    const PUNTOS_DE_RECICLAJE = [
        // Coordenadas actualizadas por el usuario
        { nombre: 'Zona de Aseo Mapocho', direccion: 'Mapocho #2752', horario: 'Lunes a Domingo de 08:00 hrs a 20:00 hrs.', lat: -33.43253, lon: -70.6744 },
        { nombre: 'Cesfam Arauco', direccion: 'Mirador #1599', horario: 'Lunes a Sábado de 10:00 hrs a 16:00 hrs.', lat: -33.46815, lon: -70.67033 },
        { nombre: 'Centro Comunitario Carol Urzúa', direccion: 'Av. Santa #1727', horario: 'Lunes a Domingo de 10:00 hrs a 18:00 hrs.', lat: -33.46773, lon: -70.64255 },
        { nombre: 'Oficina Adulto Mayor', direccion: 'Av. Matucana #272', horario: 'Lunes a Sábado de 14:00 hrs a 19:00 hrs.', lat: -33.44312, lon: -70.67994 },
        { nombre: 'Gimnasio J. López', direccion: 'Santa Helena #1675', horario: 'Lunes a Domingo de 10:00 hrs a 19:00 hrs.', lat: -33.46613, lon: -70.62892 },
        { nombre: 'Hermanita de los pobres', direccion: 'Carmen #1243', horario: 'Lunes a Domingo de 10:00 hrs a 18:00 hrs.', lat: -33.5171, lon: -70.76332 },
        { nombre: 'Acceso Parque O\'Higgins', direccion: 'Rondizzoni 6 Luis Cousiño', horario: 'Lunes a Domingo de 10:00 hrs a 20:00 hrs.', lat: -33.47003, lon: -70.65633 },
        { nombre: 'Plaza de bolsillo Santa Isabel', direccion: 'Lira esq. Santa Isabel', horario: 'Lunes a Domingo de 10:00 hrs a 18:00 hrs.', lat: -33.44964, lon: -70.63884 },
        { nombre: 'JJVV Gabriela Mistral', direccion: 'Diez de Julio #760', horario: 'Lunes a Viernes de 17:00 hrs a 20:00 hrs.', lat: -33.45392, lon: -70.64533 },
        { nombre: 'JJVV Adelanto y Progreso', direccion: 'Placer #530', horario: 'Lunes a Sábado de 09:00 hrs a 14:00 hrs.', lat: -33.47524, lon: -70.63666 },
        { nombre: 'ECOENGRANAJE', direccion: 'Pedro Antonio Gonzalez 3665', horario: 'Consultar web', lat: -33.46775, lon: -70.68547 },
        { nombre: 'Punto Limpio - Av. Del Parque', direccion: 'Avenida Del Parque 4951', horario: 'Consultar web', lat: -33.3895, lon: -70.61746 },
    ];
    // ----------------------------------------------------------------------

    // Verifica si el botón existe antes de añadir el listener
    if (btnVerPuntos) {
        btnVerPuntos.addEventListener('click', () => {
            if (seccionMapa) {
                seccionMapa.style.display = 'block';
                seccionMapa.scrollIntoView({ behavior: 'smooth' });

                if (!mapaIniciado) {
                    // Centro del mapa ajustado y zoom (12) para que quepan todos los puntos
                    const map = L.map('mapReciclaje').setView([-33.45, -70.67], 12);

                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(map);

                    // --- ICONOS PERSONALIZADOS ---
                    var ceaIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                    
                    var reciclajeIcon = L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    // 📍 MARCADOR CEA (Sede Principal) - COORDENADA CORREGIDA
                    L.marker([-33.464272, -70.661817], {icon: ceaIcon}).addTo(map)
                        .bindPopup('<b>🏢 Sede Principal CEA</b><br>Av. Beauchef 1327').openPopup();

                    // --- 2. AÑADIR TODOS LOS PUNTOS DE RECICLAJE ---
                    PUNTOS_DE_RECICLAJE.forEach(punto => {
                        const popupContent = `
                            <b>♻️ ${punto.nombre}</b><br>
                            ${punto.direccion}<br>
                            Horario: ${punto.horario}
                        `;
                        L.marker([punto.lat, punto.lon], {icon: reciclajeIcon}).addTo(map)
                            .bindPopup(popupContent);
                    });

                    mapaIniciado = true;
                }
            }
        });
    }
});