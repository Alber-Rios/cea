// js/script.js

document.addEventListener("DOMContentLoaded", () => {
    // =========================================
    // 0. CONTROL DE SCROLL Y MENÚ HAMBURGUESA
    // =========================================
    window.scrollTo(0, 0); 

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // =========================================
    // 1. GESTIÓN DE DATOS (LÓGICA DE FECHAS)
    // =========================================
    const monthNamesShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // A. Función interna para el Calendario (Obtiene TODO para pintar el mes)
    function getEventsFromData(year) {
        const eventsDataFormatted = {};

        if (typeof eventData === 'undefined') return eventsDataFormatted;

        eventData.forEach((event, index) => {
            const day = event.day;
            const month = monthNamesShort.indexOf(event.month);
            const title = event.title;
            const info = event.info;

            if (!isNaN(day) && month !== -1) {
                const key = `${day}-${month}-${year}`;
                if (!eventsDataFormatted[key]) eventsDataFormatted[key] = [];
                eventsDataFormatted[key].push({ title, info, id: index + 1 });
            }
        });
        return eventsDataFormatted;
    }

    // B. FUNCIÓN PÚBLICA PARA EL CHATBOT (OBTIENE TODOS LOS EVENTOS)
    // La hacemos global (window) para que tu script del chatbot la pueda encontrar.
    window.obtenerTodosLosEventos = function() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const listaEventos = [];

        if (typeof eventData === 'undefined') return listaEventos;

        eventData.forEach((event) => {
            const dia = event.day;
            const mesIndex = monthNamesShort.indexOf(event.month);
            const titulo = event.title;
            const info = event.info;

            if (!isNaN(dia) && mesIndex !== -1) {
                // Lógica inteligente de año:
                // Si estamos en Diciembre (11) y el evento es en Enero (0), asumimos que es del año siguiente.
                let eventYear = currentYear;
                if (currentMonth > 10 && mesIndex < 2) {
                    eventYear = currentYear + 1;
                }

                const fechaEvento = new Date(eventYear, mesIndex, dia);

                listaEventos.push({
                    fechaRaw: fechaEvento, // Objeto fecha para ordenar si hace falta
                    fechaLegible: `${dia} de ${monthNames[mesIndex]}`,
                    titulo: event.title,
                    descripcion: event.info,
                    link: event.link // <-- AÑADIR ESTA LÍNEA
                });
            }
        });

        // Ordenar los eventos por fecha (del más cercano al más lejano)
        return listaEventos.sort((a, b) => a.fechaRaw - b.fechaRaw);
    };

    // C. RENDERIZAR LA LISTA DE EVENTOS EN EL DOM
    function renderEventsList() {
        const eventsListContainer = document.querySelector(".events-list");
        if (!eventsListContainer) return;

        const todosLosEventos = window.obtenerTodosLosEventos();
        
        if (todosLosEventos.length > 0) {
            let eventsHTML = '';
            todosLosEventos.forEach(event => {
                const day = event.fechaRaw.getDate();
                const month = monthNamesShort[event.fechaRaw.getMonth()];

                // Generar el botón solo si hay un link
                const botonInscribirse = event.link 
                    ? `<a href="${event.link}" target="_blank" class="btn-register">Inscribirse</a>`
                    : '';

                eventsHTML += `
                <div class="event-item">
                    <div class="event-date">
                        <div class="day">${day}</div>
                        <div class="month">${month}</div>
                    </div>
                    <div class="event-info">
                        <h4>${event.titulo}</h4>
                        <p>${event.descripcion}</p>
                        ${botonInscribirse}
                    </div>
                </div>`;
            });
            eventsListContainer.innerHTML = eventsHTML;
        }
    }


    // =========================================
    // 2. RENDERIZADO DEL CALENDARIO
    // =========================================

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const calendarWidget = document.querySelector(".calendar-widget");

    function renderCalendar() {
        updateCalendar(currentMonth, currentYear);
    }
    
    function updateCalendar(month, year) {
        if (!calendarWidget) return;

        const events = getEventsFromData(year);
        const now = new Date();
        const today = now.getDate();
        const currentActualMonth = now.getMonth();
        const currentActualYear = now.getFullYear();

        let firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <button id="prevMonth" title="Mes anterior" style="background:none; border:none; cursor:pointer; font-size:1.5rem; color:var(--primary-green);"><i class="fas fa-chevron-left"></i></button>
                <h4 style="margin: 0; color: var(--primary-green);">${monthNames[month]} ${year}</h4>
                <button id="nextMonth" title="Mes siguiente" style="background:none; border:none; cursor:pointer; font-size:1.5rem; color:var(--primary-green);"><i class="fas fa-chevron-right"></i></button>
            </div>
            <table class="calendar-table">
                <thead>
                    <tr><th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th></tr>
                </thead>
                <tbody><tr>`;

        for (let i = 0; i < adjustedFirstDay; i++) html += "<td></td>";

        let currentDayOfWeek = adjustedFirstDay;

        for (let day = 1; day <= daysInMonth; day++) {
            if (currentDayOfWeek > 6) {
                html += "</tr><tr>";
                currentDayOfWeek = 0;
            }

            const eventKey = `${day}-${month}-${year}`;
            const eventArray = events[eventKey];

            let classList = [];
            if (day === today && month === currentActualMonth && year === currentActualYear) classList.push("active-date");
            if (eventArray) classList.push("has-event");

            const dataAttributes = eventArray
                ? `data-event-title="${eventArray[0].title}" data-event-info="${eventArray[0].info}"`
                : "";

            html += `<td class="${classList.join(" ")}" ${dataAttributes}>${day}</td>`;
            currentDayOfWeek++;
        }

        html += "</tr></tbody></table>";
        html += '<div id="calendar-info-box" class="calendar-info-box" style="display:none;"></div>';

        calendarWidget.innerHTML = html;
        attachCalendarListeners();
    }
    
    function attachCalendarListeners() {
        document.getElementById("prevMonth")?.addEventListener("click", () => changeMonth(-1));
        document.getElementById("nextMonth")?.addEventListener("click", () => changeMonth(1));

        const infoBox = document.getElementById("calendar-info-box");

        document.querySelectorAll(".calendar-table td.has-event").forEach((td) => {
            td.addEventListener("click", function (e) {
                const rect = e.target.getBoundingClientRect();
                infoBox.innerHTML = `<p><strong>${e.target.getAttribute("data-event-title")}</strong></p><p style="margin-top:5px; font-size:0.9em; color:#ddd;">${e.target.getAttribute("data-event-info")}</p>`;
                const widgetRect = calendarWidget.getBoundingClientRect();

                infoBox.style.left = `${rect.left - widgetRect.left + rect.width / 2}px`;
                infoBox.style.top = `${rect.bottom - widgetRect.top + 10}px`;
                infoBox.style.transform = `translateX(-50%)`;
                infoBox.style.display = "block";

                setTimeout(() => { infoBox.style.display = "none"; }, 4000);
            });
        });

        document.addEventListener("click", (e) => {
            if (!calendarWidget?.contains(e.target) && infoBox && !infoBox.contains(e.target)) {
                infoBox.style.display = "none";
            }
        });
    }

    function changeMonth(step) {
        currentMonth += step;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar(currentMonth, currentYear);
    }

    // =========================================
    // INICIALIZACIÓN Y ANIMACIONES
    // =========================================

    renderEventsList(); // Render the event list dynamically

    if (document.querySelector(".calendar-widget")) {
        renderCalendar();
    }

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px",
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('fade-up') || entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('element-visible');
                }
                if (entry.target.classList.contains('events-section') || entry.target.classList.contains('location-section')) {
                    const container = entry.target.querySelector('.leaf-animation-container');
                    if (container && !container.dataset.generated) {
                        generateSideLeaves(container);
                        container.dataset.generated = 'true';
                    }
                }
                observer.unobserve(entry.target);
            }
        });
    });
    
    document
        .querySelectorAll(".fade-up, .fade-in, .events-section, .location-section")
        .forEach((el) => {
            observer.observe(el);
        });

    const heroSection = document.querySelector(".hero");
    if (heroSection) {
        for (let i = 0; i < 5; i++) {
            let leaf = document.createElement("div");
            leaf.className = "leaf";
            heroSection.appendChild(leaf);
        }
    }

    function generateSideLeaves(container) {
        for (let i = 0; i < 6; i++) {
            let leaf = document.createElement("div");
            leaf.className = "side-leaf";
            leaf.style.top = 10 + Math.random() * 80 + "%";
            if (Math.random() > 0.5) {
                leaf.style.left = "-30px";
                leaf.classList.add("animate-leaf-left");
            } else {
                leaf.style.right = "-30px";
                leaf.classList.add("animate-leaf-right");
            }
            const size = 20 + Math.random() * 15;
            leaf.style.width = `${size}px`;
            leaf.style.height = `${size}px`;
            leaf.style.animationDelay = Math.random() * 2 + "s";
            container.appendChild(leaf);
        }
    }
});