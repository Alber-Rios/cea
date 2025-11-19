// ⚠️ ATENCIÓN: DEBES PEGAR LA URL DE TU FUNCIÓN AQUÍ
const APPWRITE_FUNCTION_URL = 'https://cloud.appwrite.io/v1/functions/691d43a0001aa8bb49da/executions';
// 💡 ID del Proyecto (Obtenido de tu dashboard Appwrite):
const APPWRITE_PROJECT_ID = '691c80a1083bcc4386c5'; 


document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const floatingBtn = document.querySelector('.floating-chat');
    const closeBtn = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    if (!chatWindow || !floatingBtn || !closeBtn || !sendBtn || !userInput || !chatBody) return;

    // =================================================================
    // 🧠 CEREBRO Y CONOCIMIENTO (INSTANTÁNEO Y LOCAL)
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
             setTimeout(() => {
                addMessage('<p>¡Hola! 👋 Soy el asistente virtual de CEA. ¿En qué puedo ayudarte hoy?</p>', 'bot', true, false);
            }, 500);
        } else {
            historial.forEach(msg => {
                addMessage(msg.text, msg.sender, false, false); 
            });
            mostrarMenuOpciones();
        }

        const estabaAbierto = sessionStorage.getItem('chatAbierto') === 'true';
        if (estabaAbierto) chatWindow.classList.add('active');
    }

    // =================================================================
    // ⚙️ FUNCIONES DE UI Y UTILITIES
    // =================================================================
    
    // Función clave para mejorar la inteligencia de las palabras clave (FIX DE RIGIDEZ)
    function normalizarEntrada(texto) {
        let temp = texto.toLowerCase();
        temp = temp.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita acentos
        temp = temp.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¡¿?"]/g,""); // Quita puntuación
        return temp.trim();
    }

    // Lógica de Smart Scroll
    function smartScroll() {
        const scrollTolerance = 150; 
        if (chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < scrollTolerance) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

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
    }


    // =================================================================
    // 🕵️‍♀️ LÓGICA ASÍNCRONA DE IA (FIX DE CONEXIÓN)
    // =================================================================

    // Función modificada para ser ASÍNCRONA
    async function encontrarRespuesta(input) {
        const text = normalizarEntrada(input); 
        contextoBot = null; 
        
        // 1. CHEQUEO RÁPIDO LOCAL (Horarios, Ubicación, Reciclaje - Instantáneo)
        for (let key in CONOCIMIENTO_BOT) {
            if (CONOCIMIENTO_BOT[key].keywords.some(k => text.includes(k))) {
                const info = CONOCIMIENTO_BOT[key];
                contextoBot = key; 
                
                if (info.tipo !== "dinamico_eventos") { 
                     return info.respuesta;
                }
            }
        }
        
        // 2. LLAMADA AL SERVIDOR DE IA (Appwrite Function)
        try {
            const response = await fetch(APPWRITE_FUNCTION_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // 🚨 EL FIX FINAL: IDENTIFICACIÓN DEL PROYECTO
                    'X-Appwrite-Project': APPWRITE_PROJECT_ID
                },
                body: JSON.stringify({ prompt: input }) 
            });

            // Si el fetch falla (red, CORS, 403), el catch lo maneja. Si no es un 200/OK, es un error.
            if (!response.ok) {
                // Aquí el error es interno de Appwrite o la clave de IA falló
                 return "<p>⚠️ ¡Error! El servidor de IA no pudo generar una respuesta.</p>"; 
            }

            const data = await response.json();

            if (data.status === 'success' && data.respuestaIA) {
                return data.respuestaIA; 
            } else {
                return RESPUESTA_DEFAULT; 
            }
        } catch (error) {
            console.error("Error de conexión con Appwrite Function:", error);
            // Este es el error final de red que aparece en la consola
            return "<p>⚠️ Error de red. No pude contactar con el asistente de IA.</p>";
        }
    }

    // ----------------------------------------------------
    // Modificar HANDLE SEND para usar ASYNC/AWAIT y Carga
    // ----------------------------------------------------
    function handleSend(text = null) {
        const msg = text || userInput.value.trim();
        if (!msg) return;

        addMessage(msg, 'user', false, true); 
        userInput.value = '';
        
        setTimeout(async () => { // ⬅️ ASYNC APLICADO AQUÍ
            // 1. Mostrar mensaje de carga (Temporal)
            const tempMsg = document.createElement('div');
            tempMsg.classList.add('message', 'bot-message', 'loading-msg');
            tempMsg.innerHTML = '<p>🤖 Escribiendo respuesta...</p>';
            chatBody.appendChild(tempMsg);
            smartScroll(); 

            const respuestaBot = await encontrarRespuesta(msg); // 2. ESPERAR RESULTADO DE LA IA
            
            // 3. Quitar mensaje de carga
            tempMsg.remove(); 

            // 4. Mostrar respuesta de la IA
            addMessage(respuestaBot, 'bot', true, true); 
        }, 500);
    }

    sendBtn.addEventListener('click', () => handleSend());
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });

    // Inicialización al cargar la página
    cargarHistorial();
});