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
  flex-direction: column;
  align-items: flex-end;
  max-width: 70%;
  position: relative;
  transition: transform 0.2s ease;
}

.message-content {
  position: relative;
  padding: 12px 16px;
  border-radius: 20px;
  max-width: 100%;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease, transform 0.2s ease;
  word-break: break-word;
  line-height: 1.4;
}

.message-content:hover {
  transform: scale(1.02);
}

.right .message-content {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  margin-left: auto;
}

.left .message-content {
  background: linear-gradient(135deg, #5a6268, #7b8794);
  margin-right: auto;
}

/* Bubble tail */
.right .message-content::after,
.left .message-content::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
  border: 10px solid transparent;
}

.right .message-content::after {
  right: -10px;
  border-left-color: #4caf50;
  border-right: 0;
  border-top: 0;
}

.left .message-content::after {
  left: -10px;
  border-right-color: #5a6268;
  border-left: 0;
  border-top: 0;
}

.timestamp {
  display: block;
  font-size: 0.75rem;
  margin-top: 6px;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
}

.unread-indicator {
  align-self: flex-end;
  background-color: #ff9800;
  color: black;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-top: 4px;
  font-weight: bold;
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
 