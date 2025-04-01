<template>
   <div class="friend-item">
     <img :src="friend.LinkFoto" alt="Avatar" class="avatar" />
     
     <div class="friend-info">
       <span class="friend-name">{{ friendName  }}</span>
 
       <!-- Última canción escuchada (solo en "Todos los amigos") -->
       <div v-if="type === 'all' && friend.CancionActual" class="last-song">
         🎵 Última canción: <strong>{{ friend.CancionActual }}</strong>
       </div>
     </div>
 
     <!-- Botones para solicitudes recibidas -->
     <div v-if="type === 'request'" class="action-buttons">
       <button class="accept-btn" @click="$emit('accept', friend.NickFriendSender)">✔</button>
       <button class="reject-btn" @click="$emit('reject', friend.NickFriendSender)">✖</button>
     </div>
 
     <!-- Botón para eliminar amigos -->
     <button v-if="type === 'all'" class="delete-btn" @click="$emit('remove', friend.Nick)">❌</button>
   </div>
 </template>
 
 <script setup>
 import { computed } from 'vue';

 const props = defineProps({
  friend: Object, 
  type: String, // Puede ser "all", "request" o "pending"
});


 const friendName = computed(() => {
  if (props.type === 'request') {
    return props.friend.NickFriendSender; 
  }
  else if (props.type === 'pending') {
   console.log("Nick de pendiente: ", props.friend.NickFriendReceiver);
   return props.friend.NickFriendReceiver;
  }
  else {
   return props.friend.Nick; 
  }
  
});
 </script>
 
 <style scoped>
 .friend-item {
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 12px;
   border-bottom: 1px solid #333;
   background: #2a2a2a;
   border-radius: 10px;
   transition: background 0.2s ease-in-out;
 }
 
 .friend-item:hover {
   background: #3a3a3a;
 }
 
 .avatar {
   width: 50px;
   height: 45px;
   border-radius: 50%;
 }
 
 .friend-info {
   flex: 1;
   color: white;
   display: flex;
   flex-direction: column;
 }
 
 .friend-name {
   font-size: 16px;
   font-weight: bold;
 }
 
 .last-song {
   font-size: 13px;
   color: #b3b3b3;
   margin-top: 3px;
 }
 
 .action-buttons {
   display: flex;
   gap: 8px;
 }
 
 .accept-btn,
 .reject-btn,
 .delete-btn {
   border: none;
   padding: 7px;
   border-radius: 50%;
   font-size: 14px;
   cursor: pointer;
   transition: background 0.2s;
 }
 
 .accept-btn {
   background: #4caf50;
   color: white;
   padding: 8px;
 }
 
 .accept-btn:hover {
   background: #45a049;
 }
 
 .reject-btn {
   background: #f44336;
   color: white;
   padding: 8px;
 }
 
 .reject-btn:hover {
   background: #e53935;
 }
 
 .delete-btn {
   background: #ff9800;
   color: white;
 }
 
 .delete-btn:hover {
   background: #f57c00;
 }
 </style>
 