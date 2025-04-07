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
   background: #202020;
   padding: 14px 16px;
   border-radius: 16px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
 }
 
 .message-field {
   flex: 1;
   padding: 12px 16px;
   border-radius: 12px;
   border: none;
   background: #333;
   color: white;
   font-size: 1rem;
   outline: none;
   transition: background 0.2s ease;
 }
 
 .message-field::placeholder {
   color: #bbb;
 }
 
 .message-field:focus {
   background: #444;
 }
 
 .send-button {
   background: linear-gradient(145deg, #ff9800, #e67e00);
   border: none;
   border-radius: 12px;
   padding: 10px 18px;
   color: black;
   font-weight: bold;
   font-size: 1rem;
   cursor: pointer;
   transition: transform 0.2s ease, background 0.2s ease;
 }
 
 .send-button:hover {
   transform: translateY(-1px);
   background: #ffa726;
 }
 </style>
 