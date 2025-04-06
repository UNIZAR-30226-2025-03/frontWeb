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
   gap: 12px;
   background: #1f1f1f;
   padding: 12px;
   border-radius: 12px;
   width: 100%;
   box-shadow: 0 0 6px rgba(0,0,0,0.3);
 }
 
 .message-field {
   flex: 1;
   padding: 10px 14px;
   border-radius: 10px;
   border: none;
   background: #333;
   color: white;
   font-size: 1rem;
   outline: none;
 }
 
 .send-button {
   background: #ff9800;
   border: none;
   border-radius: 10px;
   padding: 10px 18px;
   color: black;
   font-weight: bold;
   font-size: 1rem;
   cursor: pointer;
   transition: background 0.2s ease;
 }
 
 .send-button:hover {
   background: #e68900;
 }
 </style>
 