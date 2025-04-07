<template>
   <div :class="['message', message.posicion]">
     <div class="message-wrapper">
       <div class="message-content">
         <p>{{ message.Mensaje }}</p>
         <span class="timestamp">{{ formattedDate }}</span>
       </div>
       <div v-if="!message.Leido" class="unread-indicator">No leído</div>
     </div>
   </div>
 </template>
 
 <script setup>
 import { computed } from 'vue';
 
 const props = defineProps({
   message: {
     type: Object,
     required: true,
   }
 });
 
 const formattedDate = computed(() => {
   const date = new Date(props.message.Fecha);
   const hours = date.getHours().toString().padStart(2, '0');
   const mins = date.getMinutes().toString().padStart(2, '0');
   return `${hours}:${mins} · ${date.toLocaleDateString()}`;
 });
 </script>
 
 <style scoped>
 .message {
   display: flex;
   margin: 12px 0;
   width: 100%;
   animation: fadeIn 0.3s ease-in;
 }
 
 .message-wrapper {
   display: flex;
   align-items: flex-end;
   max-width: 70%;
 }
 
 .message-content {
   padding: 10px;
   border-radius: 10px;
   max-width: 80%;
   color: white;
}

.right .message-content {
   background-color: #4caf50; /* Verde suave para los mensajes del amigo */
   margin-left: auto; /* Alineación a la derecha */
}

.left .message-content {
   background-color: #8e9eab; /* Azul claro o gris para los mensajes enviados por ti */
}

.timestamp {
   display: block;
   font-size: 0.8rem;
   margin-top: 5px;
   text-align: right;
}
 
 .unread-indicator {
   margin-left: 10px;
   background-color: #ff9800;
   color: black;
   padding: 4px 8px;
   border-radius: 8px;
   font-size: 0.75rem;
 }
 
 .right {
   justify-content: flex-end;
   text-align: right;
 }
 
 .left {
   justify-content: flex-start;
   text-align: left;
 }
 
 @keyframes fadeIn {
   from { opacity: 0; transform: translateY(8px); }
   to { opacity: 1; transform: translateY(0); }
 }
 </style>
 