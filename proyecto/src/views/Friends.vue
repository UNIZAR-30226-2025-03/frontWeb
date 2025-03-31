<template>
   <div class="friends-container">
     <div class="tabs">
       <button @click="activeTab = 'chats'" :class="{ active: activeTab === 'chats' }">Chats</button>
       <button @click="activeTab = 'all'" :class="{ active: activeTab === 'all' }">Todos</button>
       <button @click="activeTab = 'requests'" :class="{ active: activeTab === 'requests' }">Solicitudes recibidas</button>
       <button @click="activeTab = 'pending'" :class="{ active: activeTab === 'pending' }">Solicitudes enviadas</button>
       <button @click="addFriend" class="add-friend-btn">➕ Añadir amigo</button>
     </div>
     
     <div class="friends-list">
       <div v-if="activeTab === 'chats'">
         <h3>Chats recientes</h3>
         <div v-for="friend in chattedFriends" :key="friend.id" class="friend-item">
           <img :src="friend.avatar" alt="Avatar" class="avatar" />
           <span>{{ friend.name }}</span>
         </div>
       </div>
       
       <div v-else-if="activeTab === 'all'">
         <h3>Todos los amigos</h3>
         <div v-for="friend in allFriends" :key="friend.id" class="friend-item">
           <img :src="friend.avatar" alt="Avatar" class="avatar" />
           <span>{{ friend.name }}</span>
         </div>
       </div>
       
       <div v-else-if="activeTab === 'requests'">
         <h3>Solicitudes recibidas</h3>
         <div v-for="friend in friendRequests" :key="friend.id" class="friend-item">
           <img :src="friend.avatar" alt="Avatar" class="avatar" />
           <span>{{ friend.name }}</span>
           <button @click="acceptRequest(friend.id)" class="accept-btn">Aceptar</button>
         </div>
       </div>
       
       <div v-else-if="activeTab === 'pending'">
         <h3>Solicitudes enviadas</h3>
         <div v-for="friend in pendingRequests" :key="friend.id" class="friend-item">
           <img :src="friend.avatar" alt="Avatar" class="avatar" />
           <span>{{ friend.name }}</span>
           <button @click="cancelRequest(friend.id)" class="cancel-btn">Cancelar</button>
         </div>
       </div>
     </div>
     
   </div>
 </template>
 
 <script setup>
 import { ref } from 'vue';
 
 const activeTab = ref('chats');
 const chattedFriends = ref([
   { id: 1, name: 'Carlos', avatar: 'https://via.placeholder.com/50' },
   { id: 2, name: 'Sofía', avatar: 'https://via.placeholder.com/50' }
 ]);
 
 const allFriends = ref([
   ...chattedFriends.value,
   { id: 3, name: 'Martín', avatar: 'https://via.placeholder.com/50' }
 ]);
 
 const friendRequests = ref([
   { id: 4, name: 'Lucía', avatar: 'https://via.placeholder.com/50' }
 ]);
 
 const pendingRequests = ref([
   { id: 5, name: 'Andrés', avatar: 'https://via.placeholder.com/50' }
 ]);
 
 const acceptRequest = (id) => {
   const friend = friendRequests.value.find(f => f.id === id);
   if (friend) {
     allFriends.value.push(friend);
     friendRequests.value = friendRequests.value.filter(f => f.id !== id);
   }
 };
 
 const cancelRequest = (id) => {
   pendingRequests.value = pendingRequests.value.filter(f => f.id !== id);
 };
 
 const addFriend = () => {
   alert('Función para añadir amigo aún no implementada');
 };
 </script>
 
 <style scoped>
 .friends-container {
   width: 100%;
   max-width: 98vw;
   height: calc(100vh - 21vh);
   margin: auto;
   background: #1e1e1e;
   padding: 20px;
   border-radius: 10px;
   color: white;
   z-index: 1000;
 }
 .tabs {
   display: flex;
   justify-content: space-between;
 }
 .tabs button {
   background: none;
   border: none;
   color: white;
   padding: 10px;
   cursor: pointer;
 }
 .tabs button.active {
   border-bottom: 2px solid #ff9800;
 }
 .friends-list {
   margin-top: 20px;
 }
 .friend-item {
   display: flex;
   align-items: center;
   gap: 10px;
   padding: 10px;
   border-bottom: 1px solid #333;
 }
 .avatar {
   width: 40px;
   height: 40px;
   border-radius: 50%;
 }
 .accept-btn, .cancel-btn {
   margin-left: auto;
   padding: 5px 10px;
   cursor: pointer;
 }
 .accept-btn {
   background: green;
   color: white;
 }
 .cancel-btn {
   background: red;
   color: white;
 }
 .add-friend-btn {
   display: block;
   padding: 10px;
   background: #ff9800;
   color: white;
   border: none;
   cursor: pointer;
   border-radius: 5px;
 }
 </style>
 