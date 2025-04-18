<template>
   <div class="friend-item">

     <!-- Sección izquierda -->
     <div class="left-section">
       <img :src="foto" alt="Avatar" class="avatar" @click.stop="$emit('profile')" />

 
         <div class="friend-info">
            <span class="friend-name">{{ friendName }}</span>
         
            <!-- Última canción escuchada -->
            <div v-if="type === 'all' && friend.CancionActual" class="last-song">
            🎵 Última canción: <strong>{{ friend.CancionActual }}</strong>
            </div>
 
            <!-- Último mensaje -->
            <div v-if="type === 'chats'" class="last-message">
            {{ lastMessageDisplay }}
            <span v-if="showReadStatus" class="read-status">
               {{ friend.Leido ? '✔ Leído' : '⏳ No leído' }}
            </span>
            <span v-if="hasNewMessages" class="message-dot"></span>
            </div>
         </div>
      </div>
 
      <!-- Sección derecha -->
      <div class="right-section">
         <!-- Botones para solicitudes recibidas -->
         <div v-if="type === 'request'" class="action-buttons">
            <button class="accept-btn" @click="$emit('accept', friend.NickFriendSender)">✔</button>
            <button class="reject-btn" @click="$emit('reject', friend.NickFriendSender)">✖</button>
         </div>
 
         <!-- Botón para eliminar amigos -->
         <button v-if="type === 'all'" class="delete-btn" @click.stop="$emit('remove', friend.Nick)">❌</button>
      </div>
   </div>
</template>
 
<script setup>
import { computed } from 'vue';
 
const props = defineProps({
   friend: Object,
   type: String, // "chats", "all" o "request"
   hasNewMessages: Boolean
});
 
const friendName = computed(() => {
   if (props.type === 'request') {
      return props.friend.NickFriendSender;
   } else {
      return props.friend.Nick;
   }
});

const foto = computed(() => {
   if (props.type === 'chats') {
      return props.friend.foto;
   } else {
      return props.friend.LinkFoto;
   }
})
 
const lastMessageDisplay = computed(() => {
   return props.friend.mensaje ? `"${props.friend.mensaje}"` : 'Sin mensajes aún';
});
 
const showReadStatus = computed(() => {
   const currentUserEmail = localStorage.getItem('email');
   return (
      props.type === 'chats' &&
      props.friend?.contact &&
      currentUserEmail === props.friend?.lastMensaje &&
      props.friend?.Leido != undefined
   );
});
 
</script>
 
<style scoped>
.friend-item {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 12px;
   border-bottom: 1px solid #333;
   background: #2a2a2a;
   border-radius: 10px;
   transition: background 0.2s ease-in-out;
   margin: 10px auto;
   gap: 12px;
}

.friend-item:hover {
   background: #3a3a3a;
}

.left-section {
   display: flex;
   align-items: center;
   gap: 12px;
   flex: 1;
}

.avatar {
   width: 50px;
   height: 45px;
   border-radius: 50%;

   cursor: pointer;
 }
 
.friend-info {
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

.last-message {
   font-size: 13px;
   color: #ccc;
   margin-top: 4px;
   display: flex;
   align-items: center;
}

.read-status {
   font-size: 12px;
   color: #ff9800;
   margin-left: 5px;
}

.right-section {
   display: flex;
   align-items: center;
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
   margin-left: 5px;
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

.message-dot {
   display: inline-block;
   width: 8px;
   height: 8px;
   background-color: #ff3b30;
   border-radius: 50%;
   margin-left: 6px;
   vertical-align: middle;
   animation: pulse 1.2s infinite;
}

@keyframes pulse {
0% {
   transform: scale(1);
   opacity: 1;
}
50% {
   transform: scale(1.4);
   opacity: 0.6;
}
100% {
   transform: scale(1);
   opacity: 1;
}
}

</style>
