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
  /**
   * Importa la función computed de Vue para crear propiedades computadas.
   * @module vue
   */
  import { computed } from 'vue';
 
  /**
   * Define las propiedades esperadas en el componente.
   * @typedef {Object} Props
   * @property {Object} friend - Objeto que representa a un amigo.
   * @property {String} type - Tipo de visualización ("chats", "all" o "request").
   * @property {Boolean} hasNewMessages - Indica si hay nuevos mensajes.
   */
  const props = defineProps({
     friend: Object,
     type: String, // "chats", "all" o "request"
     hasNewMessages: Boolean
  });
 
  /**
   * Propiedad computada que determina el nombre del amigo a mostrar.
   * Si el tipo es 'request', utiliza la propiedad NickFriendSender;
   * de lo contrario, utiliza la propiedad Nick.
   * @constant {import('vue').ComputedRef<string>} friendName
   */
  const friendName = computed(() => {
     if (props.type === 'request') {
        return props.friend.NickFriendSender;
     } else {
        return props.friend.Nick;
     }
  });
 
  /**
   * Propiedad computada que obtiene la foto del amigo a mostrar.
   * Si el tipo es 'chats', usa la propiedad foto; en caso contrario, usa LinkFoto.
   * @constant {import('vue').ComputedRef<string>} foto
   */
  const foto = computed(() => {
     if (props.type === 'chats') {
        return props.friend.foto;
     } else {
        return props.friend.LinkFoto;
     }
  });
 
  /**
   * Propiedad computada que prepara el mensaje último a mostrar.
   * Envuelve el mensaje entre comillas si existe, o retorna un texto predeterminado.
   * @constant {import('vue').ComputedRef<string>} lastMessageDisplay
   */
  const lastMessageDisplay = computed(() => {
     return props.friend.mensaje ? `"${props.friend.mensaje}"` : 'Sin mensajes aún';
  });
 
  /**
   * Propiedad computada que determina si se debe mostrar el estado de lectura del mensaje.
   * Comprueba que:
   * - El tipo es 'chats'.
   * - La propiedad 'contact' del amigo existe.
   * - El correo del usuario actual (obtenido desde localStorage) coincide con la propiedad lastMensaje.
   * - La propiedad 'Leido' existe.
   *
   * @constant {import('vue').ComputedRef<boolean>} showReadStatus
   */
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
   cursor: pointer;
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

.avatar:hover {
   transform: scale(1.1);
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

.reject-btn {
   background: #f44336;
   color: white;
   padding: 8px;
   margin-left: 5px;
}

.accept-btn:hover,
.reject-btn:hover {
   opacity: 0.6;
}

.delete-btn {
   background: #ff9800;
   color: white;
}

.delete-btn:hover {
   opacity: 0.8;
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
