<template>
   <div class="friends-container">
      <div class="tabs">
         <button @click="activeTab = 'chats'" :class="{ active: activeTab === 'chats' }">Chats</button>
         <button @click="activeTab = 'all'" :class="{ active: activeTab === 'all' }">Todos</button>
         <button @click="activeTab = 'requests'" :class="{ active: activeTab === 'requests' }">Solicitudes</button>
         <button @click="activeTab = 'pending'" :class="{ active: activeTab === 'pending' }">Pendientes</button>
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
            <FriendItem v-for="friend in chattedFriends" :key="friend.id" :friend="friend" />
         </div>
       
         <div v-else-if="activeTab === 'all'">
            <h3>Todos los amigos</h3>
            <FriendItem v-for="friend in allFriends" :key="friend.Nick" :friend="friend" type="all" @remove="removeFriend"/>
         </div>
         
         <div v-else-if="activeTab === 'requests'">
            <h3>Solicitudes recibidas</h3>
            <FriendItem v-for="friend in friendRequests" :key="friend.NickFriendSender" :friend="friend" type="request" @accept="acceptRequest" @reject="rejectRequest"/>
         </div>
         
         <div v-else-if="activeTab === 'pending'">
            <h3>Solicitudes enviadas</h3>
            <FriendItem v-for="friend in pendingRequests" :key="friend.id" :friend="friend" @cancel="cancelRequest(friend.id)" />
         </div>
      </div>
      <div v-if="showPopup" :class="popupType" class="popup">
            {{ popupMessage }}
      </div>
   </div>
 </template>
 
<script setup>
import { ref, onMounted } from 'vue';
import FriendItem from '@/components/FriendItem.vue';

const email =  localStorage.getItem("email");
const currentNick = ref('');
const showAddFriendInput = ref(false);
const friendNick = ref("");

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
const pendingRequests = ref([]);

const toggleAddFriend = () => {
   showAddFriendInput.value = !showAddFriendInput.value;
   friendNick.value = ""; // Resetear el campo al cerrar
};


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
      // Obtener solicitudes de amistad recibidas
      const requestResponse = await fetch(`https://echobeatapi.duckdns.org/amistades/verSolicitudes/${encodeURIComponent(userData.Nick)}`);
      if (!requestResponse.ok) throw new Error('Error al obtener las solicitudes recibidas del usuario');
      
      const requestData = await requestResponse.json();
      friendRequests.value = Array.isArray(requestData) ? requestData : [requestData];
      
      
      console.log("requests data ", friendRequests.value); 

      const friendsResponse = await fetch(`https://echobeatapi.duckdns.org/amistades/verAmigos/${encodeURIComponent(userData.Nick)}`);
      if (!friendsResponse.ok) throw new Error('Error al obtener los amigos del usuario');
      
      const friendsData = await friendsResponse.json();
      allFriends.value = Array.isArray(friendsData) ? friendsData : [friendsData];
      
      
      console.log("friends data ", allFriends.value); 

   } catch (error) {
      console.error(error.message);
   }
});

const removeFriend = async (Nick) => {
  try {
    console.log("Nick: ", Nick);
    const response = await fetch(`https://echobeatapi.duckdns.org/amistades/eliminar/${currentNick.value}/${Nick}`, {
      method: 'DELETE',
      headers: {
         'Accept': '*/*', 
      },
    });

    if (!response.ok) {
      throw new Error('Error en la eliminación del amigo');
    }

    // Si la eliminación es exitosa, podemos eliminar la canción localmente del vector
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
            'Content-Type': 'application/json',
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
 
const acceptRequest = async (Nick) => {
   try {
      const response = await fetch('https://echobeatapi.duckdns.org/amistades/aceptar', {
         method: 'POST',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            nickSender: Nick,
            nickReceiver: currentNick.value,
         }),
      });

      if (!response.ok) throw new Error('Error al aceptar la solicitud de amistad');

      friendRequests.value = friendRequests.value.filter(friend => friend.NickFriendSender !== Nick);

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
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            nickSender: currentNick.value,
            nickReceiver: friendNick.value,
         }),
      });

      if (!response.ok) throw new Error('Error al enviar solicitud de amistad');

      pendingRequests.value.push({
         NickFriendReceiver: friendNick.value,
      });

      showPopupMessage(`Solicitud enviada a ${friendNick.value}!`, "popup-success");
      toggleAddFriend(); // Cierra el input después de enviar

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
   max-height: 370px; /* Ajusta la altura según lo que necesites */
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
</style>