document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const floatingBtn = document.querySelector('.floating-chat');
    const closeBtn = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatWindow || !floatingBtn || !closeBtn || !sendBtn || !userInput || !chatBody) return;

    // =================================================================
    // 🧠 CEREBRO Y CONOCIMIENTO
    // =================================================================
    const CONOCIMIENTO_BOT = {
        "📅 Próximos Eventos": { 
            keywords: ["taller", "curso", "charla", "caminata", "evento", "actividad", "calendario", "agenda", "feria"],
            tipo: "dinamico_eventos"
        },
        "🕒 Horarios": {
            keywords: ["horario", "hora", "abre", "cierra", "atencion", "dias", "cuando"],
            respuesta: "<p>🕒 <strong>Horario de Atención CEA:</strong></p><p>🟢 <strong>Lunes a Viernes:</strong> 09:00 - 18:00 hrs.<br>🔴 <strong>Sábados y Domingos:</strong> Cerrado (salvo actividades especiales).</p><p>¡Te esperamos!</p>"
        },
        "♻️ Reciclaje": {
            keywords: ["recicla", "basura", "plastico", "vidrio", "carton", "punto"],
            respuesta: "<p>♻️ <strong>Puntos Limpios:</strong></p><p>En CEA recibimos:<br>- 🟦 Papeles y cartones<br>- 🟨 Plásticos PET 1 y latas<br>- 🟩 Vidrio (botellas y frascos)</p><p>Recuerda traerlos limpios.</p>"
        },
        "📍 Ubicación": {
            keywords: ["donde", "ubicaci", "direccion", "llegar", "mapa", "metro"],
            respuesta: "<p>📍 <strong>Nuestra Sede Principal:</strong></p><p>Av. Beauchef 1327, Santiago Centro (Interior Parque O'Higgins).<br>🚇 <strong>Metro cercano:</strong> Estación Parque O'Higgins (Línea 2).</p>"
        }
    };

    const RESPUESTA_DEFAULT = "<p>😅 Disculpa, no entendí bien. Prueba con las opciones del menú.</p>";
    const MENU_AUTOMATICO = Object.keys(CONOCIMIENTO_BOT);
    let contextoBot = null; 

    // =================================================================
    // 💾 PERSISTENCIA (MEMORIA DE SESIÓN)
    // =================================================================

    function guardarMensaje(text, sender) {
        let historial = JSON.parse(sessionStorage.getItem('chatHistorial')) || [];
        historial.push({ text, sender });
        sessionStorage.setItem('chatHistorial', JSON.stringify(historial));
    }

    function cargarHistorial() {
        let historial = JSON.parse(sessionStorage.getItem('chatHistorial')) || [];
        
        if (historial.length === 0) {
            // Mensaje de bienvenida inicial
             setTimeout(() => {
                addMessage('<p>¡Hola! 👋 Soy el asistente virtual de CEA. ¿En qué puedo ayudarte hoy?</p>', 'bot', true, false);
            }, 500);
        } else {
            // Restaurar mensajes del historial
            historial.forEach(msg => {
                addMessage(msg.text, msg.sender, false, false); 
            });
            // Restaurar el menú de opciones al final (si hay mensajes)
            mostrarMenuOpciones();
        }

        const estabaAbierto = sessionStorage.getItem('chatAbierto') === 'true';
        if (estabaAbierto) chatWindow.classList.add('active');
    }

    // =================================================================
    // ⚙️ FUNCIONES DE UI
    // =================================================================
    floatingBtn.addEventListener('click', () => toggleChat(true));
    
    // --- LÓGICA DE REINICIO AL CERRAR ---
    closeBtn.addEventListener('click', () => {
        toggleChat(false); 
        sessionStorage.removeItem('chatHistorial'); 
        sessionStorage.removeItem('chatAbierto'); 
        chatBody.innerHTML = ''; 
        cargarHistorial(); 
    });
    // ------------------------------------

    function toggleChat(show) {
        chatWindow.classList.toggle('active', show);
        sessionStorage.setItem('chatAbierto', show); 
    }

    function addMessage(text, sender, showMenu = false, save = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
        
        let processedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            .replace(/_(.*?)_/g, '<em>$1</em>');
            
        messageDiv.innerHTML = processedText;
        chatBody.appendChild(messageDiv);

        if (save) guardarMensaje(text, sender); 

        if (showMenu && sender === 'bot') {
            mostrarMenuOpciones();
        }
        
        // Lógica de Smart Scroll (ajustada para el comportamiento deseado)
        function smartScroll() {
            const scrollTolerance = 150; 
            // Si el mensaje es del usuario, o si estamos leyendo cerca del final, baja.
            if (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < scrollTolerance || sender === 'user') {
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }
        
        smartScroll(); 
    }

    function mostrarMenuOpciones() {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chat-options';
        
        const existingMenu = chatBody.querySelector('.chat-options');
        if (existingMenu) existingMenu.remove();
        
        MENU_AUTOMATICO.forEach(option => {
            const button = document.createElement('button');
            button.className = 'chat-option-btn';
            button.textContent = option;
            button.onclick = () => handleSend(option); 
            optionsDiv.appendChild(button);
        });
        chatBody.appendChild(optionsDiv);
        // NOTA: Se ELIMINA el scroll forzado aquí para evitar el salto
    }

    // =================================================================
    // 🕵️‍♀️ LÓGICA DE BÚSQUEDA Y RENDERING (MEJORADO)
    // =================================================================

    function normalizarEntrada(texto) {
        let temp = texto.toLowerCase();
        temp = temp.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
        temp = temp.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¡¿?"]/g,""); 
        return temp.trim();
    }


    function encontrarRespuesta(input) {
        const text = normalizarEntrada(input); 
        contextoBot = null; 
        let keyEncontrada = null;

        if (CONOCIMIENTO_BOT[input]) {
            keyEncontrada = input;
        } else {
            for (let key in CONOCIMIENTO_BOT) {
                if (CONOCIMIENTO_BOT[key].keywords.some(k => text.includes(k))) {
                    keyEncontrada = key;
                    break;
                }
            }
        }

        if (keyEncontrada) {
            const info = CONOCIMIENTO_BOT[keyEncontrada];
            contextoBot = keyEncontrada; 
            
            if (info.tipo === "dinamico_eventos") {
                if (typeof window.obtenerTodosLosEventos === 'function') {
                    const eventos = window.obtenerTodosLosEventos();

                    if (eventos.length > 0) {
                        let respuestaHTML = '<p style="margin-bottom: 10px;">📅 <strong>¡Estos son los próximos eventos!</strong></p>';
                        const eventosFiltrados = eventos.slice(0, 3);
                        
                        // RENDERING LIMPIO DE TARJETAS
                        const eventosDiv = eventosFiltrados.map(ev => {
                            return `
                            <div class="chat-event-card">
                                <div class="chat-event-title">🔹 ${ev.fechaLegible}: ${ev.titulo}</div>
                                <div class="chat-event-info"><em>${ev.descripcion}</em></div>
                                ${ev.link ? `<a href="${ev.link}" target="_blank" class="chat-link btn-inscripcion">🔗 Ver más y registrarse</a>` : ""}
                            </div>
                            `;
                        }).join(''); 

                        respuestaHTML += eventosDiv;
                        respuestaHTML += '<p style="margin-top: 10px; font-size:0.85rem;">ℹ️ <em>Recuerda que los cupos son limitados.</em></p>';
                        return respuestaHTML;

                    } else {
                        return "<p>📅 Actualmente no veo eventos programados. ¡Atento a nuestras redes!</p>";
                    }
                } else {
                    return "<p>⚠️ Error técnico: No pude leer el calendario.</p>";
                }
            }
            return info.respuesta;
        }

        return RESPUESTA_DEFAULT;
    }

    function handleSend(text = null) {
        const msg = text || userInput.value.trim();
        if (!msg) return;

        addMessage(msg, 'user', false, true); 
        userInput.value = '';
        
        setTimeout(() => {
            addMessage(encontrarRespuesta(msg), 'bot', true, true); 
        }, 500);
    }

    sendBtn.addEventListener('click', () => handleSend());
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    // Inicialización al cargar la página
    cargarHistorial();
});