<template>
   <div :class="['message', message.posicion]">
     <div class="message-content">
       <p>{{ message.Mensaje }}</p>
       <span class="timestamp">{{ formattedDate }}</span>
     </div>
     <div v-if="!message.Leido" class="unread-indicator">No leído</div>
   </div>
 </template>
 
 <script setup>
 import { defineProps, computed } from 'vue';
 
 const props = defineProps({
   message: {
     type: Object,
     required: true,
   }
 });
 
 // Formatear la fecha para mostrarla de una forma legible
 const formattedDate = computed(() => {
   const date = new Date(props.message.Fecha);
   return `${date.getHours()}:${date.getMinutes()} ${date.toLocaleDateString()}`;
 });
 </script>
 
 <style scoped>
 .message {
   display: flex;
   margin: 10px 0;
   align-items: center;
 }
 
 .message-content {
   background-color: #3b3b3b;
   padding: 10px;
   border-radius: 10px;
   max-width: 80%;
   color: white;
 }
 
 .timestamp {
   display: block;
   font-size: 0.8rem;
   margin-top: 5px;
   text-align: right;
 }
 
 .unread-indicator {
   background-color: #ff9800;
   color: white;
   padding: 5px;
   border-radius: 8px;
   font-size: 0.9rem;
   margin-left: 10px;
   text-align: center;
 }
 
 .right {
   justify-content: flex-end;
   text-align: right;
 }
 
 .left {
   justify-content: flex-start;
   text-align: left;
 }
 </style>
 