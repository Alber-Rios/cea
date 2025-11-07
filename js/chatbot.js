document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const floatingBtn = document.querySelector('.floating-chat');
    const closeBtn = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatWindow || !floatingBtn || !closeBtn || !sendBtn || !userInput || !chatBody) return;

    // =================================================================
    // 🧠 CEREBRO DEL BOT
    // =================================================================
    const CONOCIMIENTO_BOT = {
        "🌱 Próximo Taller": {
            keywords: ["taller", "curso", "aprender", "huerto", "proximo", "actividad"],
            respuesta: "🌱 **¡Excelente pregunta!**\n\nNuestro próximo gran evento es el **Taller de Reciclaje**.\n\n🗓️ **Fecha:** 28 de Noviembre\n⏰ **Hora:** 10:00 am\n📍 **Lugar:** Sede Principal (Interior Parque O'Higgins)\n\n¡Es gratuito y no requiere inscripción previa! **¿Te gustaría saber cómo llegar?**"
        },
        "🕒 Horarios": {
            keywords: ["horario", "hora", "abre", "cierra", "atencion", "dias", "cuando"],
            respuesta: "🕒 **Horario de Atención CEA:**\n\n🟢 **Lunes a Viernes:** 09:00 - 18:00 hrs.\n🔴 **Sábados y Domingos:** Cerrado (salvo actividades especiales como talleres).\n\n¡Te esperamos en el parque!"
        },
        "♻️ Reciclaje": {
            keywords: ["recicla", "basura", "plastico", "vidrio", "carton", "punto"],
            respuesta: "♻️ **Puntos Limpios:**\nEn CEA recibimos:\n- 🟦 Papeles y cartones\n- 🟨 Plásticos PET 1 y latas\n- 🟩 Vidrio (botellas y frascos)\n\nRecuerda traerlos limpios y aplastados."
        },
        "📍 Ubicación": {
            keywords: ["donde", "ubicaci", "direccion", "llegar", "mapa", "metro"],
            respuesta: "📍 **Nuestra Ubicación:**\nAv. Beauchef 1327, Santiago Centro (Interior Parque O'Higgins).\n🚇 **Metro cercano:** Estación Parque O'Higgins (Línea 2)."
        }
    };

    const RESPUESTA_DEFAULT = "😅 Disculpa, no entendí bien. Prueba con las opciones del menú.";
    const MENU_AUTOMATICO = Object.keys(CONOCIMIENTO_BOT);
    
    // Variable para recordar la última pregunta del bot
    let contextoBot = null;

    // =================================================================
    // ⚙️ FUNCIONES INTERNAS
    // =================================================================
    floatingBtn.addEventListener('click', () => toggleChat(true));
    closeBtn.addEventListener('click', () => toggleChat(false));

    function toggleChat(show) {
        chatWindow.classList.toggle('active', show);
    }

    function addMessage(text, sender, showMenu = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
        let formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messageDiv.innerHTML = `<p>${formattedText}</p>`;
        chatBody.appendChild(messageDiv);

        if (showMenu && sender === 'bot') {
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'chat-options';
            MENU_AUTOMATICO.forEach(option => {
                const button = document.createElement('button');
                button.className = 'chat-option-btn';
                button.textContent = option;
                button.onclick = () => handleSend(option);
                optionsDiv.appendChild(button);
            });
            chatBody.appendChild(optionsDiv);
        }
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // --- FUNCIÓN CEREBRO MEJORADA CON MEMORIA ---
    function encontrarRespuesta(input) {
        const text = input.toLowerCase().trim();

        // 1. REVISAR CONTEXTO (¿Estamos esperando un sí/no?)
        if (contextoBot === 'esperando_confirmacion_ubicacion') {
            if (['si', 'sí', 'claro', 'por favor', 'bueno'].some(k => text.includes(k))) {
                contextoBot = null; // Ya respondimos, borramos la memoria
                return CONOCIMIENTO_BOT["📍 Ubicación"].respuesta;
            }
            if (['no', 'gracias', 'asi esta bien'].some(k => text.includes(k))) {
                contextoBot = null; // Ya respondimos, borramos la memoria
                return "¡Entendido! Si necesitas algo más, aquí tienes el menú 👇";
            }
        }

        // 2. BÚSQUEDA NORMAL (Si no hay contexto o no fue sí/no)
        contextoBot = null; // Reseteamos contexto si cambian de tema
        
        // Revisamos si coincide con una clave exacta (clic en botón)
        if (CONOCIMIENTO_BOT[input]) {
            // Si pidieron Taller, activamos la memoria para la próxima respuesta
            if (input === "🌱 Próximo Taller") contextoBot = 'esperando_confirmacion_ubicacion';
            return CONOCIMIENTO_BOT[input].respuesta;
        }

        // Revisamos palabras clave
        for (let key in CONOCIMIENTO_BOT) {
            if (CONOCIMIENTO_BOT[key].keywords.some(k => text.includes(k))) {
                // Si pidieron Taller, activamos la memoria para la próxima respuesta
                if (key === "🌱 Próximo Taller") contextoBot = 'esperando_confirmacion_ubicacion';
                return CONOCIMIENTO_BOT[key].respuesta;
            }
        }

        return RESPUESTA_DEFAULT;
    }

    function handleSend(text = null) {
        const msg = text || userInput.value.trim();
        if (!msg) return;

        addMessage(msg, 'user');
        userInput.value = '';
        
        setTimeout(() => {
            addMessage(encontrarRespuesta(msg), 'bot', true);
        }, 500);
    }

    sendBtn.addEventListener('click', () => handleSend());
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    // =================================================================
    // 🚀 SALUDO PROACTIVO
    // =================================================================
    let haSidoAbierto = false;
    setTimeout(() => {
        chatBody.innerHTML = '';
        addMessage('¡Hola! 👋 Veo que te interesa el medio ambiente. ¿Quieres saber cuál es nuestro próximo taller?', 'bot', true);
    }, 1000);

    setTimeout(() => {
        if (!chatWindow.classList.contains('active') && !haSidoAbierto) {
            toggleChat(true);
            haSidoAbierto = true;
        }
    }, 5000);

    floatingBtn.addEventListener('click', () => { haSidoAbierto = true; });
});