<template>
   <div class="chat-view">
      <div class="back-btn-container">
         <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
      </div>
     <div class="chat-header">
         <img :src="user.perfil" alt="Avatar" class="avatar" />
         <h2 class="chat-title">Chat con {{ user.nick }}</h2>
     </div>
 
     <div class="chat-messages" ref="messageContainer">
         <ChatMessage
            v-for="(msg, index) in messages"
            :key="index"
            :message="msg"
            :isSentByMe="msg.sender === email"
         />
     </div>
 
     <div class="chat-input-wrapper">
         <ChatInput @send="sendMessage" />
     </div>
   </div>
 </template>
 
 <script setup>
 import { ref, onMounted, onUnmounted, nextTick } from 'vue';
 import { useRoute, useRouter } from 'vue-router';
 import ChatMessage from '@/components/ChatMessage.vue';
 import ChatInput from '@/components/ChatInput.vue';

 /**
  * Objeto reactivo para acceder a la ruta actual.
  * @type {object}
  */
 const route = useRoute();

 /**
  * Email del amigo obtenido de los parámetros de la ruta.
  * @type {string}
  */
 const friendMail = route.params.email;

 /**
  * Email del usuario obtenido desde el localStorage.
  * @type {string|null}
  */
 const email = localStorage.getItem("email");

 /**
  * Instancia del router para navegación programática.
  * @type {object}
  */
 const router = useRouter();

 /**
  * Array reactivo que almacena los mensajes del chat.
  * @type {Ref<Array>}
  */
 const messages = ref([]);

 /**
  * Referencia al contenedor de mensajes, para controlar el scroll.
  * @type {Ref<HTMLElement|null>}
  */
 const messageContainer = ref(null);

 /**
  * Objeto reactivo que almacena la información del usuario (amigo).
  * @type {Ref<{nick: string, perfil: string}>}
  */
 const user = ref({
    nick: '',
    perfil: '',
 });

 /**
  * Función que navega hacia atrás en el historial del navegador.
  */
 const goBack = () => {
    router.back();
 };

 /**
  * Intervalo para el polling de mensajes.
  * @type {number}
  */
 let pollingInterval;

 /**
  * Función que marca los mensajes como leídos en la API.
  * Actualiza localmente el estado de los mensajes marcando aquellos enviados por el amigo como leídos.
  *
  * @async
  * @throws {Error} Si falla la petición a la API.
  */
 const markMessagesAsRead = async () => {
    try {
       const result = await fetch(
          `https://echobeatapi.duckdns.org/chat/marcarComoLeidos?senderId=${encodeURIComponent(friendMail)}&receiverId=${encodeURIComponent(email)}`,
          {
             method: 'POST',
             headers: {
                'Accept': '*/*',
             },
          }
       );
       if (!result.ok) {
          throw new Error("Error al marcar mensajes como leídos");
       }
       // Actualiza localmente todos los mensajes del amigo como leídos.
       messages.value = messages.value.map(msg =>
          msg.EmailSender === friendMail ? { ...msg, Leido: true } : msg
       );
    } catch (error) {
       console.error(error.message);
    }
 };

 /**
  * Función que inicia el polling para obtener el historial del chat.
  *
  * Establece un intervalo que cada segundo realiza una petición a la API para obtener los mensajes.
  * Si hay mensajes nuevos, actualiza el estado reactivo y realiza el scroll hacia el final.
  * Además, detecta y marca los mensajes sin leer.
  */
 const startPolling = () => {
    pollingInterval = setInterval(async () => {
       try {
          const res = await fetch(
             `https://echobeatapi.duckdns.org/chat/historialDelChat?userPrincipal=${encodeURIComponent(email)}&userAmigo=${encodeURIComponent(friendMail)}`
          );
          if (!res.ok) throw new Error("Error al obtener los mensajes");
          const data = await res.json();

          /**
           * Formatea los mensajes agregando una propiedad 'posicion'
           * que determina si se muestra a la izquierda o a la derecha.
           * @type {Array}
           */
          const formattedMessages = data.map(msg => ({
             ...msg,
             posicion: msg.EmailSender === email ? 'right' : 'left',
          }));

          // Actualiza la lista de mensajes si se detectan cambios.
          if (JSON.stringify(formattedMessages) !== JSON.stringify(messages.value)) {
             messages.value = formattedMessages;
             scrollToBottom();

             // Filtra los mensajes del amigo que no se han marcado como leídos.
             const unreadMessages = formattedMessages.filter(
                msg => msg.EmailSender === friendMail && !msg.Leido
             );
             if (unreadMessages.length > 0) {
                // Marca los mensajes como leídos a través de la API.
                await markMessagesAsRead();
             }
          }
       } catch (error) {
          console.error("Polling error:", error.message);
       }
    }, 1000); // Se ejecuta cada 1 segundo.
 };

 /**
  * Hook de ciclo de vida: onUnmounted.
  * Limpia el intervalo del polling cuando el componente se desmonte para evitar memory leaks.
  */
 onUnmounted(() => {
    clearInterval(pollingInterval);
 });

 /**
  * Hook de ciclo de vida: onMounted.
  *
  * Realiza las siguientes acciones al montar el componente:
  * - Obtiene el historial del chat y lo formatea.
  * - Realiza scroll al final del contenedor de mensajes.
  * - Obtiene la información de perfil y nick del amigo.
  * - Marca como leídos los mensajes existentes.
  * - Inicia el polling para actualizar continuamente el chat.
  */
 onMounted(async () => {
    try {
       // Solicita el historial del chat entre el usuario y el amigo.
       const res = await fetch(
          `https://echobeatapi.duckdns.org/chat/historialDelChat?userPrincipal=${encodeURIComponent(email)}&userAmigo=${encodeURIComponent(friendMail)}`
       );
       if (!res.ok) {
          throw new Error("Error al obtener los mensajes");
       }
       const data = await res.json();
       messages.value = data.map(msg => ({
          ...msg,
          posicion: msg.EmailSender === email ? 'right' : 'left',
       }));
       scrollToBottom();

       // Solicita los datos del usuario (amigo): nick y foto de perfil.
       const userResponse = await fetch(
          `https://echobeatapi.duckdns.org/users/get-user?userEmail=${encodeURIComponent(friendMail)}`
       );
       if (!userResponse.ok) throw new Error('Error al obtener los datos del usuario');
       const userData = await userResponse.json();
       user.value = {
          nick: userData.Nick,
          perfil: userData.LinkFoto,
       };

       // Marca los mensajes existentes como leídos al cargar el chat.
       const result = await fetch(
          `https://echobeatapi.duckdns.org/chat/marcarComoLeidos?senderId=${encodeURIComponent(friendMail)}&receiverId=${encodeURIComponent(email)}`,
          {
             method: 'POST',
             headers: {
                'Accept': '*/*',
             },
          }
       );
       if (!result.ok) {
          throw new Error("Error al leer los mensajes");
       }
       // Actualiza localmente todos los mensajes enviados por el amigo como leídos.
       messages.value = messages.value.map(msg =>
          msg.EmailSender === friendMail ? { ...msg, Leido: true } : msg
       );
    } catch (error) {
       console.error(error.message);
    }
    
    // Inicia el polling para actualizar continuamente el chat.
    startPolling();
 });

 /**
  * Función para enviar un mensaje.
  *
  * Envía el mensaje a través de la API y actualiza la lista de mensajes localmente con el nuevo mensaje.
  *
  * @async
  * @param {string} text - Texto del mensaje a enviar.
  * @throws {Error} Si falla la petición para enviar el mensaje.
  */
 const sendMessage = async (text) => {
    if (!text.trim()) return;
    try {
       const res = await fetch(
          `https://echobeatapi.duckdns.org/chat/guardarMensaje?senderId=${encodeURIComponent(email)}&receiverId=${encodeURIComponent(friendMail)}&content=${encodeURIComponent(text)}`,
          {
             method: 'POST',
             headers: {
                'Accept': '*/*',
             },
          }
       );
       if (!res.ok) {
          throw new Error("Error al enviar el mensaje");
       }
       const data = await res.json();
       messages.value.push({
          EmailReceiver: data.EmailReceiver,
          EmailSender: data.EmailSender,
          Id: data.Id,
          Leido: data.Leido,
          Fecha: data.Fecha,
          Mensaje: data.Mensaje,
          posicion: 'right',
       });
       scrollToBottom();
    } catch (error) {
       console.error(error.message);
    }
 };

 /**
  * Función para hacer scroll hasta el final del contenedor de mensajes.
  * Utiliza nextTick para asegurar que la actualización del DOM se haya completado antes de realizar el scroll.
  *
  * @async
  */
 const scrollToBottom = async () => {
    await nextTick();
    if (messageContainer.value) {
       messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
 };
</script>

 
 
 <style scoped>
.chat-view {
   display: flex;
   flex-direction: column;
   height: 90vh;
   padding: 16px;
   background: linear-gradient(180deg, #141414 15%, #4a1e04 40%, #8a3a10 60%, #ffb347 100%);
   color: white;
   border-radius: 16px;
   position: relative;
   overflow: hidden;
}

.chat-header {
display: flex;
align-items: center;
gap: 12px;
margin-bottom: 12px;
justify-content: center;
}

.chat-title {
   font-size: 22px;
   margin: 0;
   color: #ff9800;
   text-align: center;
}

.avatar {
width: 50px;
height: 50px;
border-radius: 50%;
object-fit: cover;
border: 2px solid #ff9800;
align-self: center;
}

.chat-messages {
   width: 90%;
   max-width: 75vw;
   flex: 0.8;
   overflow-y: auto;
   padding: 12px;
   background: rgba(0, 0, 0, 0.4); /* Fondo oscuro y transparente */
   border-radius: 18px;
   margin: 12px auto;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); /* Sombra para resaltar */
   border: 2px solid rgba(255, 255, 255, 0.2); /* Borde sutil pero visible */
   transition: border-color 0.3s ease; /* Transición suave en el borde */
   overflow-y: auto;
   overflow-x: hidden; /* <- evita el scroll horizontal */
   word-wrap: break-word;
   word-break: break-word; /* fuerza el corte del texto largo */
}
 
.chat-messages:hover {
   border-color: #ff9800; /* Efecto de borde cuando el ratón pasa sobre el chat */
}

.chat-messages::-webkit-scrollbar {
   width: 10px; /* Ancho más grueso para la barra de desplazamiento */
}

.chat-messages::-webkit-scrollbar-thumb {
   background: linear-gradient(135deg, #ff9800, #ff5722); /* Gradiente suave con tonos cálidos */
   border-radius: 10px;
   box-shadow: 0 0 10px rgba(255, 87, 34, 0.6); /* Sombra suave para el pulgar */
}

.chat-messages::-webkit-scrollbar-track {
   background: rgba(0, 0, 0, 0.6); /* Fondo oscuro de la pista de desplazamiento */
   border-radius: 10px;
}
 
.chat-input-wrapper {
   width: 90%;
   max-width: 75vw;
   margin: 0 auto;
}

.back-btn-container {
   position: absolute;
   top: 3vh;
   left: 1vw;
   display: flex;
   justify-content: flex-start;
}

.back-btn {
   background-color: transparent;
   border: 1px solid #ffa500;
   color: #ffa500;
   padding: 6px 12px;
   border-radius: 6px;
   font-weight: bold;
   cursor: pointer;
   transition: background-color 0.3s ease;
   min-width: 100px;
}

.back-btn:hover {
   background-color: rgba(255, 165, 0, 0.2);
}

</style>
 