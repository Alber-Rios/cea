// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // FUNCIÓN DE CALENDARIO AUTOMÁTICO
    // =========================================
    function updateCalendar() {
        const calendarWidget = document.querySelector('.calendar-widget');
        // Si no hay widget de calendario en esta página, salimos de la función
        if (!calendarWidget) return;

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const today = now.getDate();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Ajustar primer día del mes (Lunes=0, Domingo=6)
        let firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = `<h4 style="text-align:center; margin-bottom:15px;">${monthNames[month]} ${year}</h4>
                    <table class="calendar-table">
                        <thead>
                            <tr><th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th></tr>
                        </thead>
                        <tbody><tr>`;

        for (let i = 0; i < adjustedFirstDay; i++) html += '<td></td>';

        let currentDayOfWeek = adjustedFirstDay;
        for (let day = 1; day <= daysInMonth; day++) {
            if (currentDayOfWeek > 6) {
                html += '</tr><tr>';
                currentDayOfWeek = 0;
            }
            html += (day === today) ? `<td><span class="active-date">${day}</span></td>` : `<td>${day}</td>`;
            currentDayOfWeek++;
        }
        html += '</tr></tbody></table>';
        calendarWidget.innerHTML = html;
    }

    // Ejecutar la función
    updateCalendar();
});