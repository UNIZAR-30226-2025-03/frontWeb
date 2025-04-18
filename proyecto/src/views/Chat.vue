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
 
 const route = useRoute();
 const friendMail = route.params.email;
 const email = localStorage.getItem("email");
 
 const router = useRouter();
 
 const messages = ref([]);
 const messageContainer = ref(null);
 
 const user = ref({
    nick: '',
    perfil: '',
 });
 
 const goBack = () => {
    router.back();
 };
 
 let pollingInterval;
 
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
       // Si la llamada es exitosa, se actualiza el estado local
       messages.value = messages.value.map(msg =>
          msg.EmailSender === friendMail ? { ...msg, Leido: true } : msg
       );
    } catch (error) {
       console.error(error.message);
    }
 };
 
 const startPolling = () => {
    pollingInterval = setInterval(async () => {
       try {
          const res = await fetch(
             `https://echobeatapi.duckdns.org/chat/historialDelChat?userPrincipal=${encodeURIComponent(email)}&userAmigo=${encodeURIComponent(friendMail)}`
          );
          if (!res.ok) throw new Error("Error al obtener los mensajes");
          const data = await res.json();
 
          const formattedMessages = data.map(msg => ({
             ...msg,
             posicion: msg.EmailSender === email ? 'right' : 'left',
          }));
 
          // Solo actualiza si hay mensajes nuevos
          if (JSON.stringify(formattedMessages) !== JSON.stringify(messages.value)) {
             messages.value = formattedMessages;
             scrollToBottom();
 
             // Detecta si hay mensajes sin marcar como leídos (enviados por el amigo)
             const unreadMessages = formattedMessages.filter(
                msg => msg.EmailSender === friendMail && !msg.Leido
             );
             if (unreadMessages.length > 0) {
                // Llama a la función para marcarlos como leídos en la API
                await markMessagesAsRead();
             }
          }
       } catch (error) {
          console.error("Polling error:", error.message);
       }
    }, 1000); // cada 1 segundo
 };
 
 // Limpia el intervalo al desmontar el componente
 onUnmounted(() => {
    clearInterval(pollingInterval);
 });
 
 onMounted(async () => {
    try {
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
 
       // Obtener foto de perfil y nick del usuario
       const userResponse = await fetch(
          `https://echobeatapi.duckdns.org/users/get-user?userEmail=${encodeURIComponent(friendMail)}`
       );
       if (!userResponse.ok) throw new Error('Error al obtener los datos del usuario');
       const userData = await userResponse.json();
       user.value = {
          nick: userData.Nick,
          perfil: userData.LinkFoto,
       };
 
       // Marcar los mensajes como leídos al cargar (los que ya existen)
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
       // Actualiza localmente todos los mensajes del amigo como leídos
       messages.value = messages.value.map(msg =>
          msg.EmailSender === friendMail ? { ...msg, Leido: true } : msg
       );
    } catch (error) {
       console.error(error.message);
    }
    
    startPolling();
 });
 
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
   top: 9px;
   left: 10px;
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
 