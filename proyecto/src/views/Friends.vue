<template>
   <div class="friends-container">
      <div class="back-btn-container">
         <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
      </div>
      <div class="tabs">
         <button @click="activeTab = 'chats'" :class="{ active: activeTab === 'chats' }" class="tab-btn">
            Chats
            <span v-if="hasUnreadMessages" class="notification-badge">
               {{ chattedFriends.filter(chat => chat.hasNewMessages).length }}
            </span>

         </button>
         <button @click="activeTab = 'all'" :class="{ active: activeTab === 'all' }">Todos</button>
         <button @click="activeTab = 'requests'" :class="{ active: activeTab === 'requests' }" class="tab-btn">
            Solicitudes
            <span v-if="pendingRequestsCount > 0" class="notification-badge">
               {{ pendingRequestsCount }}
            </span>
         </button>
         <button @click="toggleAddFriend" class="add-friend-btn">➕ Añadir amigo</button>
      </div>

      <!-- Desplegable para ingresar el nick -->
      <div v-if="showAddFriendInput" class="add-friend-container">
         <input v-model="friendNick" type="text" placeholder="Introduce el nick del amigo" class="friend-input" />
         <button @click="addFriend" class="confirm-btn">Enviar</button>
         <button @click="toggleAddFriend" class="cancel-btn">Cancelar</button>
      </div>
     
      <div class="friends-list">

         <div v-if="activeTab === 'chats'">
            <h3>Chats recientes</h3>
            <FriendItem v-for="friend in chattedFriends" :key="friend.Nick" :friend="friend" type="chats" :hasNewMessages="friend.hasNewMessages" @click="goToChats(friend)"  @profile="profileRequest(friend)"/>
         </div>
         
         <div v-else-if="activeTab === 'all'">
            <div class="friends-header">
               <h3>Todos los amigos</h3>
               <input v-model="searchTerm" type="text" placeholder="Buscar amigo" class="search-friend-input"/>
            </div>
            <FriendItem v-for="friend in filteredFriends" :key="friend.Nick" :friend="friend" type="all" @click="goToChat(friend)" @remove="removeFriend" @profile="profileRequest(friend)"/>
         </div>

         <div v-else-if="activeTab === 'requests'">
            <h3>Solicitudes recibidas</h3>
            <FriendItem v-for="friend in friendRequests" :key="friend.NickFriendSender" :friend="friend" type="request" @accept="acceptRequest" @reject="rejectRequest" @profile="profileRequest(friend)"/>
         </div>
         <transition name="slide-up">
         <Profile
               v-if="showProfile"
               :friend="selectedUser"
               @close="showProfile = false"
            />
         </transition>
      </div>
      <div v-if="showPopup" :class="popupType" class="popup">
            {{ popupMessage }}
      </div>
   </div>
   <div class="layout"  v-if="showProfile"></div>
 </template>
 
 <script setup>
 import { ref, onMounted, onUnmounted, computed } from 'vue';
 import { useRouter } from 'vue-router';
 import FriendItem from '@/components/FriendItem.vue';
 import Profile from '@/components/profile.vue';
 
 const email = localStorage.getItem("email");
 const currentNick = ref('');
 const showAddFriendInput = ref(false);
 const friendNick = ref("");
 const searchTerm = ref('');
 
 const router = useRouter();
 const showPopup = ref(false);
 const popupMessage = ref("");
 const popupType = ref("popup-error");
 
 const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;
 
   setTimeout(() => {
     showPopup.value = false;
   }, 3000); // Cierra el popup después de 3 segundos
 };
 
 const activeTab = ref('chats');
 const chattedFriends = ref([]);
 const allFriends = ref([]);
 const friendRequests = ref([]);
 
 const toggleAddFriend = () => {
   showAddFriendInput.value = !showAddFriendInput.value;
   friendNick.value = ""; // Resetear el campo al cerrar
 };
 
 const pendingRequestsCount = computed(() => friendRequests.value.length);
 
 const hasUnreadMessages = computed(() => {
   return chattedFriends.value.some(chat => chat.hasNewMessages);
 });
 
 const filteredFriends = computed(() => {
   if (!searchTerm.value.trim()) {
     return allFriends.value; 
   }
   return allFriends.value.filter(friend =>
     friend.Nick.toLowerCase().includes(searchTerm.value.toLowerCase())
   );
 });
 
 const selectedUser = ref(null);  // Usuario seleccionado
 const showProfile = ref(false);  // Controla si el modal está visible
 
 function openProfile(user) {
   selectedUser.value = user;
   showProfile.value = true;
 }
 
 const goBack = () => {
   router.back();
 };
 
 const goToChat = (friend) => {
   router.push(`/chat/${friend.Email}`);
 };
 
 const goToChats = (friend) => {
   router.push(`/chat/${friend.contact}`);
 };
 
 // --- Funciones de actualización con polling ---
 
 // Función para obtener la lista de amigos
 async function fetchFriends(nick) {
   try {
     const friendsResponse = await fetch(`https://echobeatapi.duckdns.org/amistades/verAmigos/${encodeURIComponent(nick)}`);
     if (!friendsResponse.ok) throw new Error('Error al obtener los amigos del usuario');
     const friendsData = await friendsResponse.json();
     allFriends.value = Array.isArray(friendsData) ? friendsData : [friendsData];
     console.log("Lista de amigos actualizada:", allFriends.value);
   } catch (error) {
     console.error(error.message);
   }
 }
 
 // Función para obtener la lista de solicitudes
 async function fetchFriendRequests(nick) {
   try {
     const requestResponse = await fetch(`https://echobeatapi.duckdns.org/amistades/verSolicitudes/${encodeURIComponent(nick)}`);
     if (!requestResponse.ok) throw new Error('Error al obtener las solicitudes recibidas del usuario');
     const requestData = await requestResponse.json();
     friendRequests.value = Array.isArray(requestData) ? requestData : [requestData];
     console.log("Lista de solicitudes actualizada:", friendRequests.value);
   } catch (error) {
     console.error(error.message);
   }
 }
 
 // Función para obtener y enriquecer los chats
 async function fetchChats(email) {
   try {
     const chatResponse = await fetch(`https://echobeatapi.duckdns.org/chat/chatsDelUsuario?userEmail=${encodeURIComponent(email)}`);
     if (!chatResponse.ok) throw new Error('Error al obtener los chats del usuario');
     const chatData = await chatResponse.json();
     // Enriquecer chats: obtiene el nick del contacto
     const enrichedChats = [];
     for (const chat of chatData) {
       const userChatResponse = await fetch(`https://echobeatapi.duckdns.org/users/nick?userEmail=${encodeURIComponent(chat.contact)}`);
       if (!userChatResponse.ok) {
         console.error(`No se pudo obtener el nick para: ${chat.contact}`);
         continue;
       }
       const userChatData = await userChatResponse.json();
       if (!userChatData || !userChatData.Nick) {
         console.error(`Nick no encontrado para: ${chat.contact}`);
         continue;
       }
       enrichedChats.push({
         ...chat,
         Nick: userChatData.Nick,
         hasNewMessages: chat.Leido === false && chat.lastMensaje != email
       });
       console.log(chat); // Mira el valor de unreadFecha

     }
     chattedFriends.value = enrichedChats;
     console.log("Chats actualizados:", chattedFriends.value);
   } catch (error) {
     console.error(error.message);
   }
 }
 
 // Variables para guardar los intervalos de polling
 let pollingFriendsInterval = null;
 let pollingRequestsInterval = null;
 let pollingChatsInterval = null;
 
 onMounted(async () => {
   try {
     // Obtener nick del usuario
     const userResponse = await fetch(`https://echobeatapi.duckdns.org/users/nick?userEmail=${encodeURIComponent(email)}`);
     if (!userResponse.ok) {
       throw new Error("No existe una cuenta con este correo.");
     }
     const userData = await userResponse.json();
     currentNick.value = userData.Nick;
     if (!userData || !userData.Nick) {
       throw new Error("No existe una cuenta con este correo.");
     }
     
     // Consultas iniciales
     await fetchFriendRequests(userData.Nick);
     await fetchFriends(userData.Nick);
     await fetchChats(email);
 
     // Configurar polling cada 5 segundos
     pollingRequestsInterval = setInterval(async () => {
       await fetchFriendRequests(currentNick.value);
     }, 5000);
 
     pollingFriendsInterval = setInterval(async () => {
       await fetchFriends(currentNick.value);
     }, 5000);
 
     pollingChatsInterval = setInterval(async () => {
       await fetchChats(email);
     }, 5000);
 
   } catch (error) {
     console.error(error.message);
   }
 });
 
 onUnmounted(() => {
   // Limpia los intervalos al destruir el componente
   if (pollingRequestsInterval) clearInterval(pollingRequestsInterval);
   if (pollingFriendsInterval) clearInterval(pollingFriendsInterval);
   if (pollingChatsInterval) clearInterval(pollingChatsInterval);
 });
 
 // --- Funciones para acciones de amistad ---
 
 const removeFriend = async (Nick) => {
   try {
     const response = await fetch(`https://echobeatapi.duckdns.org/amistades/eliminar/${currentNick.value}/${Nick}`, {
       method: 'DELETE',
       headers: { 'Accept': '*/*' }
     });
     if (!response.ok) throw new Error('Error en la eliminación del amigo');
     // Actualizar la lista local (aunque el polling se encarga de refrescar)
     allFriends.value = allFriends.value.filter(friend => friend.Nick !== Nick);
     showPopupMessage("Amigo eliminado con éxito", "popup-success");
   } catch (error) {
     showPopupMessage(error.message, "popup-error");
   }
 };
 
 const rejectRequest = async (Nick) => {
   try {
     const response = await fetch('https://echobeatapi.duckdns.org/amistades/rechazar', {
       method: 'POST',
       headers: {
         'Accept': '*/*',
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         nickSender: Nick,
         nickReceiver: currentNick.value,
       }),
     });
     if (!response.ok) throw new Error('Error al rechazar la solicitud de amistad');
     friendRequests.value = friendRequests.value.filter(friend => friend.NickFriendSender !== Nick);
     showPopupMessage(`Solicitud de ${Nick} rechazada con éxito!`, "popup-success");
   } catch (error) {
     showPopupMessage(error.message, "popup-error");
   }
 };
 
 const profileRequest = async (friend) => {
   selectedUser.value = friend;
   showProfile.value = true;
 };
 
 const acceptRequest = async (Nick) => {
   try {
     const response = await fetch('https://echobeatapi.duckdns.org/amistades/aceptar', {
       method: 'POST',
       headers: {
         'Accept': '*/*',
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         nickSender: Nick,
         nickReceiver: currentNick.value,
       }),
     });
     if (!response.ok) throw new Error('Error al aceptar la solicitud de amistad');
     friendRequests.value = friendRequests.value.filter(friend => friend.NickFriendSender !== Nick);
     // Después de aceptar, refrescar la lista de amigos y de chats
     await fetchFriends(currentNick.value);
     await fetchChats(email);
     showPopupMessage(`Solicitud de ${Nick} aceptada con éxito!`, "popup-success");
   } catch (error) {
     showPopupMessage(error.message, "popup-error");
   }
 };
 
 const addFriend = async () => {
   if (!friendNick.value.trim()) {
     showPopupMessage("Por favor, introduce un nick válido.", "popup-error");
     return;
   }
   if (currentNick.value === friendNick.value) {
     showPopupMessage("No puedes enviarte una solicitud a ti mismo.", "popup-error");
     return;
   }
   // Verificar si ya son amigos
   const isAlreadyFriend = allFriends.value.some(friend => friend.Nick === friendNick.value);
   if (isAlreadyFriend) {
     showPopupMessage(`¡${friendNick.value} ya es tu amigo!`, "popup-error");
     return;
   }
   try {
     const response = await fetch('https://echobeatapi.duckdns.org/amistades/solicitar', {
       method: 'POST',
       headers: {
         'Accept': '*/*',
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         nickSender: currentNick.value,
         nickReceiver: friendNick.value,
       }),
     });
     const data = await response.json();
     const message = data.message;
     if (!response.ok) {
       if (message === "Ya existe una solicitud de amistad pendiente.") {
         throw new Error(`Ya existe una solicitud de amistad pendiente con ${friendNick.value}`);
       } else {
         throw new Error(`Error al enviar la solicitud de amistad`);
       }
     }
     if (message === "Solicitud mutua detectada. Amistad aceptada automáticamente.") {
       showPopupMessage(`Solicitud mutua detectada. Amistad aceptada automáticamente`, "popup-success");
       toggleAddFriend();
     } else {
       showPopupMessage(`Solicitud enviada a ${friendNick.value}!`, "popup-success");
       toggleAddFriend();
     }
   } catch (error) {
     showPopupMessage(error.message, "popup-error");
   }
 };
 </script>
 
 
<style scoped>
.friends-container {
   width: 90%;
   max-width: 75vw;
   margin: auto;
   padding: 20px;
   background: #252525;
   border-radius: 20px;
   color: white;
   box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
   margin-top: 30px;
}

.tabs {
   display: flex;
   justify-content: space-between;
   margin-bottom: 15px;
   border-bottom: 2px solid #ff9800;
   padding-bottom: 10px;
}

.tabs button {
   background: none;
   border: none;
   color: white;
   font-size: 16px;
   padding: 10px;
   cursor: pointer;
   transition: 0.3s;
}

.tabs button.active {
   color: #ff9800;
   font-weight: bold;
   border-bottom: 2px solid #ff9800;
}

.friends-list {
   margin-top: 20px;
   max-height: 385px; /* Ajusta la altura según lo que necesites */
   overflow-y: auto;
   scrollbar-width: thin; /* Para navegadores compatibles */
   scrollbar-color: #555 #252525; /* Color del scroll */
}

/* Para mejorar el scroll en WebKit (Chrome, Safari) */
   .friends-list::-webkit-scrollbar {
   width: 8px;
}

.friends-list::-webkit-scrollbar-thumb {
   background-color: #555;
   border-radius: 10px;
}

.friends-list::-webkit-scrollbar-track {
   background: #252525;
}

.friends-header {
   display: flex;
   gap: 20px;
   align-items: center;
   margin-bottom: 15px;
}

.search-friend-input {
   padding: 8px 12px;
   border-radius: 20px;
   border: 1px solid #ff9800;
   background-color: #2f2f2f;
   color: white;
   font-size: 14px;
   width: 200px;
   transition: all 0.3s ease;
}

.search-friend-input::placeholder {
   color: #cccccc;
}

.search-friend-input:focus {
   outline: none;
   border-color: #ffa726;
   box-shadow: 0 0 5px rgba(255, 152, 0, 0.7);
   background-color: #3a3a3a;
}


.add-friend-btn {
   background: #ff9800;
   color: white;
   padding: 8px 12px;
   border-radius: 6px;
   font-size: 14px;
   cursor: pointer;
   transition: 0.3s;
}

.add-friend-btn:hover {
   background: #e68900;
}

/* Desplegable para ingresar nick */
.add-friend-container {
   display: flex;
   justify-content: center;
   gap: 10px;
   margin-bottom: 15px;
}

.friend-input {
   padding: 8px;
   border-radius: 5px;
   border: none;
   font-size: 14px;
   background: #a69a95;
   color: white;
}

.friend-input::placeholder {
   color: white;
}

.confirm-btn {
   background: #4CAF50;
   color: white;
   padding: 8px 12px;
   border-radius: 6px;
   font-size: 14px;
   cursor: pointer;
   transition: 0.3s;
}

.cancel-btn {
   background: #f44336;
   color: white;
   padding: 8px 12px;
   border-radius: 6px;
   font-size: 14px;
   cursor: pointer;
   transition: 0.3s;
}

.cancel-btn:hover {
   opacity: 0.8;
}

.confirm-btn:hover {
   opacity: 0.8;
}

.tab-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f44336;
  color: white;
  font-size: 11px;
  font-weight: bold;
  border-radius: 50%;
  padding: 3px 6px;
  line-height: 1;
  display: inline-block;
}

.back-btn-container {
   position: absolute;
   top: 60px;
   left: 10px;
   display: flex;
   justify-content: flex-start;
}

.back-btn {
   background-color: transparent;
   border: 1px solid #ffa500;
   color: #ffa500;
   padding: 6px 12px;
   border-radius: 6px;
   font-weight: bold;
   cursor: pointer;
   transition: background-color 0.3s ease;
   min-width: 100px;
}

.back-btn:hover {
   background-color: rgba(255, 165, 0, 0.2);
}

/* Mensaje emergente */
.popup {
   position: fixed;
   top: 20px;
   left: 50%;
   transform: translateX(-50%);
   color: white;
   padding: 10px 20px;
   border-radius: 8px;
   font-weight: bold;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
   animation: fadeInOut 3s ease-in-out;
   z-index: 1000;
}

.popup-error {
   background: rgba(255, 87, 34, 0.9);
}

.popup-success {
   background: rgba(76, 175, 80, 0.9);
}

@keyframes fadeInOut {
   0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
   10% { opacity: 1; transform: translateX(-50%) translateY(0); }
   90% { opacity: 1; }
   100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

.layout {
  height: 100vh; /* ocupa toda la altura visible */
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}


.scale-fade-enter-active {
  animation: scaleIn 0.25s ease-out;
}
.scale-fade-leave-active {
  animation: scaleOut 0.2s ease-in forwards;
}


/* Opción 2 transición pop up */

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}

</style>