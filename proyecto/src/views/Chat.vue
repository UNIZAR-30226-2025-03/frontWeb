<template>
   <div class="chat-view">
     <h2 class="chat-title">Chat con {{ friendMail }}</h2>
 
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
 import { ref, onMounted, onUnmounted, nextTick } from 'vue'
 import { useRoute } from 'vue-router'
 import ChatMessage from '@/components/ChatMessage.vue'
 import ChatInput from '@/components/ChatInput.vue'
 
 const route = useRoute()
 const friendMail = route.params.email
 const email = localStorage.getItem("email");
 
 const messages = ref([])
 const messageContainer = ref(null)

 let pollingInterval;

onMounted(() => {
  startPolling();
});

const startPolling = () => {
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`https://echobeatapi.duckdns.org/chat/historialDelChat?userPrincipal=${encodeURIComponent(email)}&userAmigo=${encodeURIComponent(friendMail)}`);
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
      }
    } catch (error) {
      console.error("Polling error:", error.message);
    }
  }, 3000); // cada 3 segundos
};

// Limpia el intervalo al desmontar el componente
onUnmounted(() => {
  clearInterval(pollingInterval);
});
 
onMounted(async () => {
   try {
      console.log("Email: ", email);
      console.log("Friend mail: ", friendMail);
      const res = await fetch(`https://echobeatapi.duckdns.org/chat/historialDelChat?userPrincipal=${encodeURIComponent(email)}&userAmigo=${encodeURIComponent(friendMail)}`);
      if (!res.ok) {
         throw new Error("Error al obtener los mensajes");
      }
      const data = await res.json();
      messages.value = data.map(msg => ({
      ...msg,
      posicion: msg.EmailSender === email ? 'right' : 'left', // Determina la posición
      }));
      scrollToBottom();
      console.log('Mensajes: ', messages.value);

   } catch (error) {
      console.error(error.message);
   }
});
 
 const sendMessage = async (text) => {
   if (!text.trim()) return
   try {
      const res = await fetch(`https://echobeatapi.duckdns.org/chat/guardarMensaje?senderId=${encodeURIComponent(email)}&receiverId=${encodeURIComponent(friendMail)}&content=${encodeURIComponent(text)}`, {
      method: 'POST',
      headers: {
               'Accept': '*/*',
            },
      })

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
         posicion: 'right'
      })
   
      scrollToBottom();
   } catch (error) {
      console.error(error.message);
   }
 }
 
 const scrollToBottom = async () => {
   await nextTick()
   if (messageContainer.value) {
     messageContainer.value.scrollTop = messageContainer.value.scrollHeight
   }
 }
 
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
 }

 .chat-title {
   font-size: 20px;
   margin-bottom: 12px;
   color: #ff9800;
   text-align: center;
 }
 
 .chat-messages {
   width: 90%;
   max-width: 75vw;
   flex: 0.8;
   overflow-y: auto;
   padding: 10px;
   background: #2a2a2a;
   border-radius: 12px;
   margin: 12px auto; 
 }

 .chat-messages::-webkit-scrollbar {
   width: 8px;
}

.chat-messages::-webkit-scrollbar-thumb {
   background-color: #555;
   border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-track {
   background: #252525;
}

.chat-input-wrapper {
  width: 90%;
  max-width: 75vw;
  margin: 0 auto;
}
 
 </style>
