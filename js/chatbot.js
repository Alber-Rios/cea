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
    const LINK_INSCRIPCION = "https://www.instagram.com/medioambientestgo/"; 

    const CONOCIMIENTO_BOT = {
        "📅 Próximos Eventos": { 
            keywords: ["taller", "curso", "charla", "caminata", "evento", "actividad", "calendario", "agenda", "feria"],
            tipo: "dinamico_eventos"
        },
        "🕒 Horarios": {
            keywords: ["horario", "hora", "abre", "cierra", "atencion", "dias", "cuando"],
            respuesta: "🕒 **Horario de Atención CEA:**\n\n🟢 **Lunes a Viernes:** 09:00 - 18:00 hrs.\n🔴 **Sábados y Domingos:** Cerrado (salvo actividades especiales).\n\n¡Te esperamos!"
        },
        "♻️ Reciclaje": {
            keywords: ["recicla", "basura", "plastico", "vidrio", "carton", "punto"],
            respuesta: "♻️ **Puntos Limpios:**\nEn CEA recibimos:\n- 🟦 Papeles y cartones\n- 🟨 Plásticos PET 1 y latas\n- 🟩 Vidrio (botellas y frascos)\n\nRecuerda traerlos limpios."
        },
        "📍 Ubicación": {
            keywords: ["donde", "ubicaci", "direccion", "llegar", "mapa", "metro"],
            respuesta: "📍 **Nuestra Sede Principal:**\nAv. Beauchef 1327, Santiago Centro (Interior Parque O'Higgins).\n🚇 **Metro cercano:** Estación Parque O'Higgins (Línea 2)."
        }
    };

    const RESPUESTA_DEFAULT = "😅 Disculpa, no entendí bien. Prueba con las opciones del menú.";
    const MENU_AUTOMATICO = Object.keys(CONOCIMIENTO_BOT);
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
        
        let formattedText = text
            .replace(/\n/g, '<br>') 
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="chat-link">🔗 Inscribirse aquí</a>');

        messageDiv.innerHTML = `<p>${formattedText}</p>`;
        chatBody.appendChild(messageDiv);

        if (showMenu && sender === 'bot') {
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
        }
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // =================================================================
    // 🕵️‍♀️ LÓGICA DE BÚSQUEDA
    // =================================================================
    function encontrarRespuesta(input) {
        const text = input.toLowerCase().trim();
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

            if (info.tipo === "dinamico_eventos") {
                if (typeof window.obtenerEventosFuturos === 'function') {
                    const eventos = window.obtenerEventosFuturos();

                    if (eventos.length > 0) {
                        let respuesta = "📅 **¡Estos son los próximos eventos!**\n\n";
                        
                        const eventosFiltrados = eventos.slice(0, 3);
                        
                        eventosFiltrados.forEach((ev, index) => {
                            respuesta += `🔹 **${ev.fechaLegible}:** ${ev.titulo}\n`;
                            respuesta += `   _${ev.descripcion}_\n`;
                            respuesta += `   📝 **Inscripciones:** ${LINK_INSCRIPCION}\n`;
                            
                            // Agregamos línea separadora solo si NO es el último evento
                            if (index < eventosFiltrados.length - 1) {
                                respuesta += `\n──────────────────\n\n`; 
                            } else {
                                respuesta += `\n`;
                            }
                        });

                        respuesta += "\nℹ️ _Recuerda que los cupos son limitados._";
                        return respuesta;
                    } else {
                        return "📅 Actualmente no veo eventos programados. ¡Atento a nuestras redes!";
                    }
                } else {
                    return "⚠️ Error técnico: No pude leer el calendario.";
                }
            }
            return info.respuesta;
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

    setTimeout(() => {
        if (chatBody.childElementCount > 0) {
            chatBody.innerHTML = '';
        }
        addMessage('¡Hola! 👋 Soy el asistente virtual de CEA. ¿En qué puedo ayudarte hoy?', 'bot', true);
    }, 100);
});