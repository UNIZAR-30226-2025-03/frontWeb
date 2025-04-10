<template>
    <!-- Div general de toda la pantalla -->
  <div class="layout">
      <div class="back-btn-container">
         <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
      </div>
    <div class="side-blur left"></div>
    <!-- Div para todas las playlist  -->  
        <main class="content">
            <div class="main-wrapper">
                <!-- CABECERA SUPERIOR -->
                <div class="header">
                    <h2>Playlist likeadas</h2>
                </div>

                <section class="playlists">

                    <draggable :list="likedPlaylists" tag="ul" class="playlists-list" item-key="id" animation="200" ghost-class="drag-ghost">
                        <template #item="{ element, index }">
                          <li class="playlists-item" :key="element.Id || index">
                            <div class="playlist-card" @click="handleClick(element.Id, element.TipoLista )">
                              <img class="playlist-cover" :src="element.Portada" alt="Portada" />
                              <div class="playlist-info">
                                <h3 class="playlist-title">{{ element.Nombre }}</h3>
                                <p class="playlist-meta">
                                  {{ element.NumCanciones }} canciones • {{ element.NumLikes }} ❤️ • {{ element.TipoLista }}
                                </p>
                              </div>
                               <!-- 🗑️ Botón de eliminar -->
                              <button class="trash-btn" @click.stop="unlikePlaylist(element.Id)">🗑️</button>
                            </div>
                          </li>
                        </template>
                    </draggable>

                </section>
            </div>
        </main>
           <!-- COLUMNA 2 -->
    <div class="side-blur right"></div>
  
  </div>

  <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
  </div>

</template>

<script setup>
import { onMounted,ref, onBeforeUnmount } from 'vue';
import draggable from 'vuedraggable';
import { useRouter } from 'vue-router';
import { emitter } from '@/js/event-bus';

const router = useRouter();
//pop up 
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("popup-error");

const likedPlaylists = ref([]); 
const email = localStorage.getItem("email")

const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
      showPopup.value = false;
   }, 1500);
};

const goBack = () => {
   router.back();
};

async function fetchFavourites() {
  // OBTENER PLAYLISTS CON LIKE
  try {
      const replyPlaylist = await fetch (`https://echobeatapi.duckdns.org/playlists/liked/${email}`);
      if (!replyPlaylist.ok) throw new Error('Errror al obtener las playlist');

      const likedPlaylistsData = await replyPlaylist.json();
      console.log("✅ likedPlaylistsData cargada: ",likedPlaylistsData);
      likedPlaylists.value = Array.isArray(likedPlaylistsData) ? likedPlaylistsData : [likedPlaylistsData];
      console.log("✅ likedPlaylists cargada: ", likedPlaylists.value);
   } catch (error) {

      console.error(error);
   }
}

onMounted(async () => {
   
      fetchFavourites();

      emitter.on('likedLists-updated', () => {
         fetchFavourites(); // vuelve a cargar los favoritos cuando haya un cambio
      });
         
});

onBeforeUnmount(() => {
  emitter.off('likedLists-updated'); // limpia el listener
});

const unlikePlaylist = async (playlistId) => {
   try {
      const response = await fetch(`https://echobeatapi.duckdns.org/playlists/like/${email}/${playlistId}`, {
      method: 'DELETE',
      });

      if (!response.ok) {
      throw new Error('Error quitar el like de una playlist');
      }
    // ✅ Actualiza el array reactivamente
    likedPlaylists.value = likedPlaylists.value.filter(p => p.Id !== playlistId);
      showPopupMessage("Playlist unlikeada con exito", "popup-success");
      
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
} 

const handleClick = (id,type) => {
   console.log("Playlist seleccionada:", id);
   localStorage.setItem("type", type);
   router.push({ path: '/playlist', query: { id: id} });
};

</script>

<style scoped>

.layout {
   display: flex;
   height: 100vh;
   background: linear-gradient(180deg, #141414 15%, #4a1e04 40%, #8a3a10 60%, #ffb347 100%);
   color: white;
   overflow: hidden;
  
}

/* Columna difuminada */
.side-blur {
   width: 15vw;
   backdrop-filter: blur(20px);
   -webkit-backdrop-filter: blur(20px);
   background: rgba(20, 20, 20, 0.1); /* suave overlay */
   z-index: 1;
}

/* Izquierda o derecha */
.left {
   border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.right {
   border-left: 1px solid rgba(255, 255, 255, 0.05);
}

/* Contenido principal */
.content {
   flex: 1;
   display: flex;
   justify-content: center;
   padding: 10px 15px;
   z-index: 2;
   box-shadow:
   0 12px 24px rgba(0, 0, 0, 0.6),
   0 0 30px rgba(0, 0, 0, 0.4); /* expansión horizontal */
}

/* Nuevo contenedor que agrupa título + playlists */
.main-wrapper {
   display: flex;
   flex-direction: column;
   align-items: center; /* <-- centra ambos elementos */
   width: 100%;
}

/* HEADER con nombre de usuario o título */
.header {
   margin-bottom: 15px;
   background: rgba(0, 0, 0, 0.2);
   padding: 12px 24px;
   border-radius: 8px;
   box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
   font-size: 1.5rem;
   font-weight: bold;
}

/* Tarjeta de listas */
.playlists {
   background: rgba(0, 0, 0, 0.2);
   padding: 12px 24px;
   box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
   min-width: 60vw;
   min-height: 60vh;
   max-height: 60vh;    
   border-radius: 12px;   
   margin-bottom: 60px;  
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

.trash-btn {
   background: none;
   border: none;
   font-size: 1.2rem;
   margin-left: auto;
   color: #ff5e5e;
   cursor: pointer;
   transition: transform 0.2s ease;
}

.trash-btn:hover {
   transform: scale(1.3) rotate(-10deg); /* Crece y gira un poco */
   color: red; 
   text-shadow: 0 0 8px rgba(255, 0, 0, 0.7); 
}

.back-btn-container {
   position: absolute;
   top: 60px;
   left: 10px;
   display: flex;
   justify-content: flex-start;
   z-index: 1000;
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

/*Pop up */
.popup {
   z-index: 100000;
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