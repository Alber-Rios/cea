document.addEventListener('DOMContentLoaded', () => {
    const btnVerPuntos = document.querySelector('.cards-container .card:nth-child(1) button');
    const seccionMapa = document.getElementById('seccion-mapa');
    let mapaIniciado = false;

    btnVerPuntos.addEventListener('click', () => {
        seccionMapa.style.display = 'block';
        seccionMapa.scrollIntoView({ behavior: 'smooth' });

        if (!mapaIniciado) {
            // Coordenadas centradas en Parque O'Higgins con un zoom un poco más abierto (13)
            // para intentar mostrar más puntos cercanos.
            const map = L.map('mapReciclaje').setView([-33.4645, -70.6607], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);

            // --- ICONO PERSONALIZADO PARA CEA (Opcional, para destacarlo) ---
            var ceaIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            // 📍 MARCADOR CEA (USTEDES)
            L.marker([-33.466714, -70.660626], {icon: ceaIcon}).addTo(map)
                .bindPopup('<b>🏢 Sede Principal CEA</b><br>Av. Beauchef 1327').openPopup();

            // --- NUEVOS PUNTOS DE RECICLAJE SOLICITADOS ---

            // ♻️ 1. ECOENGRANAJE
            // Ubicación aprox: Pedro Antonio Gonzalez 3665, Estación Central
            L.marker([-33.4645, -70.7048]).addTo(map)
                .bindPopup('<b>♻️ ECOENGRANAJE</b><br>Pedro Antonio Gonzalez 3665');

            // ♻️ 2. Punto Limpio - Avenida Del Parque
            // Ubicación aprox: Avenida Del Parque 4951, Huechuraba (Ciudad Empresarial)
            // NOTA: Este punto está lejos hacia el norte, el usuario tendrá que alejar el mapa para verlo.
            L.marker([-33.3865, -70.6168]).addTo(map)
                .bindPopup('<b>♻️ Punto Limpio</b><br>Avenida Del Parque 4951');

            mapaIniciado = true;
        }
    });
});