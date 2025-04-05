<template>
   <div class="chat-view">
     <h2 class="chat-title">Chat con {{ friendNick }}</h2>
 
     <div class="chat-messages" ref="messageContainer">
       <ChatMessage
         v-for="(msg, index) in messages"
         :key="index"
         :message="msg"
         :isSentByMe="msg.sender === currentNick"
       />
     </div>
 
     <ChatInput @send="sendMessage" />
   </div>
 </template>
 
 <script setup>
 import { ref, onMounted, watch, nextTick } from 'vue'
 import { useRoute } from 'vue-router'
 import ChatMessage from '@/components/ChatMessage.vue'
 import ChatInput from '@/components/ChatInput.vue'
 
 const route = useRoute()
 const friendNick = route.params.friendNick
 
 const messages = ref([])
 const currentNick = localStorage.getItem('nick') || '' // adjust according to your logic
 const messageContainer = ref(null)
 
 onMounted(async () => {
   try {
      const res = await fetch(`https://echobeatapi.duckdns.org/chat/historialDelChat?userPrincipal=874912%40unizar.es&userAmigo=adriannamar1406%40gmail.com`);
      if (!res.ok) {
         throw new Error("Error al obtener los mensajes");
      }
      const data = await res.json();
      messages.value = data.map(msg => ({
      ...msg,
      //posicion: msg.EmailSender === currentUserEmail ? 'derecha' : 'izquierda', // Determina la posición
      }));
      scrollToBottom();
      console.log('Mensajes: ', messages.value);

   } catch (error) {
      console.error(error.message);
   }
});
 
 const sendMessage = async (text) => {
   if (!text.trim()) return
 
   await fetch(`https://echobeatapi.duckdns.org/chat/guardarMensaje`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       sender: currentNick,
       receiver: friendNick,
       mensaje: text,
     }),
   })
 
   messages.value.push({
     sender: currentNick,
     receiver: friendNick,
     mensaje: text,
     fecha: new Date().toISOString(),
   })
 
   scrollToBottom()
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
   background: #1e1e1e;
   color: white;
   border-radius: 16px;
 }
 
 .chat-title {
   font-size: 20px;
   margin-bottom: 12px;
   color: #ff9800;
 }
 
 .chat-messages {
   flex: 1;
   overflow-y: auto;
   padding: 10px;
   background: #2a2a2a;
   border-radius: 12px;
   margin-bottom: 12px;
 }
 </style>
 