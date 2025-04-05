<template>
   <form @submit.prevent="submitMessage" class="chat-input">
     <input
       v-model="message"
       type="text"
       placeholder="Escribe un mensaje..."
       class="message-field"
     />
     <button type="submit" class="send-button">Enviar</button>
   </form>
 </template>
 
 <script setup>
 import { ref } from 'vue'
 
 const emit = defineEmits(['send'])
 const message = ref('')
 
 const submitMessage = () => {
   if (message.value.trim()) {
     emit('send', message.value)
     message.value = ''
   }
 }
 </script>
 
 <style scoped>
 .chat-input {
   display: flex;
   gap: 8px;
 }
 
 .message-field {
   flex: 1;
   padding: 10px;
   border-radius: 8px;
   border: none;
   background: #444;
   color: white;
 }
 
 .send-button {
   background: #ff9800;
   border: none;
   border-radius: 8px;
   padding: 10px 16px;
   color: white;
   font-weight: bold;
   cursor: pointer;
 }
 
 .send-button:hover {
   background: #e68900;
 }
 </style>
 