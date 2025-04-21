<template>
 <div class="profile-layout"  @click="emit('close')">
 
   <div class="profile-popup" v-if="friend">
    
    <!-- Sección principal -->  
    <div class="profile-header">
      
        <img class="profile-picture" :src="infoUser.Portada" alt="Avatar" />
        <div class="profile-text">
            <h1 class="profile-nombre">{{ infoUser.Nombre || 'nombre' }}</h1>
            <h2 class="profile-handle">@{{ infoUser.Nick }}</h2>
            <button class="message-button" @click="goToChats">Chat</button>
        </div>
    </div>
    <!-- Info adicional -->
    <section class="playlists">
        
        <ul class="playlists-list">
            <li
            v-for="(element, index) in playlists"
            :key="element.Id || index"
            class="playlists-item"
            >
            <div class="playlist-card" @click="handleClick(element.Id, 'ajeno')">
                <img class="playlist-cover" :src="element.Portada" alt="Portada" />
                <div class="playlist-info">
                <h3 class="playlist-title">{{ element.Nombre }}</h3>
                <p class="playlist-meta">
                    {{ element.NumCanciones }} canciones • {{ element.NumLikes }} ❤️ • {{ element.TipoLista }}
                </p>
                </div>
            </div>
            </li>
        </ul>
    </section>

  </div> 
</div>
</template>
  
<script setup>
  /**
   * Importa las funciones ref y onMounted de Vue para reactividad y ciclo de vida.
   * @module vue
   */
  import { ref, onMounted } from 'vue';

  /**
   * Importa useRouter de Vue Router para navegación programática.
   * @module vue-router
   */
  import { useRouter } from 'vue-router';

  /**
   * Instancia del router para manejar navegación.
   * @type {import('vue-router').Router}
   */
  const router = useRouter();

  /**
   * Lista reactiva de playlists del usuario amigo.
   * @type {import('vue').Ref<Array>}
   */
  const playlists = ref([]);

  /**
   * Información reactiva del usuario amigo.
   * @type {import('vue').Ref<Object>}
   * @property {string} Nick - Apodo del usuario.
   * @property {string} Portada - URL de la portada del usuario.
   * @property {string} Nombre - Nombre completo del usuario.
   * @property {string} LastList - Última lista escuchada por el usuario.
   */
  const infoUser = ref({
    Nick: "",
    Portada: "",
    Nombre: "",
    LastList: ""
  });

  /**
   * Email del amigo, obtenido de las props.
   * @type {string}
   */
  let friendEmail = "";

  /**
   * Define las propiedades que recibe este componente.
   * @typedef {Object} Props
   * @property {Object} friend - Objeto con datos del amigo (requerido).
   */
  const props = defineProps({
    friend: {
      type: Object,
      required: true
    }
  });

  /**
   * Define el emisor de eventos para notificar el cierre del componente.
   * @function defineEmits
   * @returns {function} emit - Función para emitir eventos personalizados.
   */
  const emit = defineEmits(['close']);

  /**
   * Hook que se ejecuta al montar el componente.
   * Obtiene información del usuario amigo y sus playlists desde la API.
   */
  onMounted(async () => {
    friendEmail = props.friend.contact != null
      ? props.friend.contact
      : props.friend.Email;
    console.log(friendEmail);

    try {
      const dataUserResponse = await fetch(
        `https://echobeatapi.duckdns.org/users/profile-with-playlists?userEmail=${friendEmail}`
      );
      if (!dataUserResponse.ok) throw new Error("Error al cargar la información del usuario");
      const userData = await dataUserResponse.json();

      playlists.value = userData.Playlists;
      infoUser.value.Nick = userData.Nick;
      infoUser.value.Portada = userData.LinkFoto;
    } catch (error) {
      console.error(error);
    }

    try {
      const dataUserResponse = await fetch(
        `https://echobeatapi.duckdns.org/users/get-user?userEmail=${friendEmail}`
      );
      if (!dataUserResponse.ok) throw new Error("Error al cargar la información extra del usuario");
      const userData = await dataUserResponse.json();

      infoUser.value.Nombre = userData.NombreCompleto;
      infoUser.value.LastList = userData.UltimaListaEscuchada;
    } catch (error) {
      console.error(error);
    }
  });

  /**
   * Maneja el clic en una playlist, guardando el tipo y navegando al detalle.
   * @param {string} id - ID de la playlist.
   * @param {string} type - Tipo de playlist.
   */
  const handleClick = (id, type) => {
    console.log("Playlist seleccionada:", id);
    localStorage.setItem("type", type);
    router.push({ path: '/playlist', query: { id: id } });
  };

  /**
   * Navega a la pantalla de chat con el amigo.
   */
  const goToChats = () => {
    router.push(`/chat/${friendEmail}`);
  };
</script>

  
  
<style scoped>
 .profile-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* ocupa toda la altura visible */
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
}

.profile-popup {
  display: flex;
  flex-direction: column;
  justify-content: center; /* centra en vertical */
  align-items: center;     /* centra en horizontal */
  max-width: 30vw;
  min-width: 30vw;
  min-height: 70vh;
  max-height: 70vh;
  background-color: #2b2d31;
  color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}


.cover-section {
  background-color: #2b2d31;
  height: 100px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 20px;
 
  max-width: 30vw;
}
    
.profile-picture {
    width: 8vw;
    height: 8vw;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.profile-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 1vw;
}

.profile-nombre {
  color: #ffba4a;
  margin: 0;
  font-size: 2vh;
}

.profile-handle {
    font-size: 1vw;
  color: #ccc;
  margin: 4px 0 12px;
}


.username {
    
  margin: 5px 0 0;
}

.handle {
  color: #b5bac1;
  font-size: 14px;
  margin: 2px 0 10px;
}

.message-button {
  background-color: #5865f2;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.message-button:hover {
  background-color: #4752c4;
}

.profile-info {
  padding: 20px;
  font-size: 14px;
  color: #b5bac1;
}

.profile-info a {
  color: #00a8fc;
  text-decoration: none;
}

.playlists {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 24px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35),
  inset 0 -2px 3px rgba(255, 255, 255, 0.03); /* menos profundidad */
  width: 25vw;
  height: 36vh;    
  border-radius: 12px;   
  overflow-y:auto ;
 
}

.playlists::-webkit-scrollbar {
   width: 0px; /* Hace la barra de desplazamiento invisible */
}
.playlists-list {
  list-style: none; 
  padding-left: 0;  
  margin: 0;
}
.playlists-item {
  margin-top: 12px; 
}
.playlist-card {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  /* background: rgba(255, 255, 255, 0.05); */
  padding: 14px 20px;
  border-radius: 12px;
  transition: background 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
  /* box-shadow: 0 2px 6px rgba(0,0,0,0.2); */
}

.playlist-card:hover {
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.playlist-cover {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.playlist-info {
  display: flex;
  flex-direction: column;
}

.playlist-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.playlist-meta {
  font-size: 0.9rem;
  color: #ccc;
  margin-top: 4px;
}


.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 18px;
  color: #aaa;
  cursor: pointer;
  z-index: 10;
}
.close-btn:hover {
  color: white;
}




</style>
  