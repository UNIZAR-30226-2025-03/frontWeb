<template>
    <!-- Div general de toda la pantalla -->
  <div class="layout">
      
    <div class="side-blur left"></div>
    <!-- Div para todas las playlist  -->  
        <main class="content">
            <div class="main-wrapper">
                <!-- CABECERA SUPERIOR -->
                <div class="header">
                    <h2>Playlist favoritas</h2>
                </div>

                <section class="playlists">

                    <draggable :list="likedPlaylists" tag="ul" class="playlists-list" item-key="id" animation="200" ghost-class="drag-ghost">
                        <template #item="{ element, index }">
                            <li class="playlists-item" :key="element.id || index">
                            <div class="playlists-info">
                                {{ element.Nombre }}
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


</template>

<script setup>
import { onMounted,ref } from 'vue';
import draggable from 'vuedraggable';

const likedPlaylists = ref([]); 
const email = localStorage.getItem("email")

onMounted(async () => {
    try {
          // OBTENER PLAYLISTS CON LIKE
        const replyPlaylist = await fetch (`https://echobeatapi.duckdns.org/playlists/liked/${email}`);
        if (!replyPlaylist.ok) throw new Error('Errror al obetner las playlist');

        const likedPlaylistsData = await replyPlaylist.json();
        console.log("✅ likedPlaylistsData cargada: ",likedPlaylistsData);
        likedPlaylists.value = Array.isArray(likedPlaylistsData) ? likedPlaylistsData : [likedPlaylistsData];
        console.log("✅ likedPlaylists cargada: ", likedPlaylists.value);

    } catch (error) {
        
    }



});

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
  min-height: 57vh;  
  border-radius: 12px;               
  overflow-y: visible;          
}



.playlists-item {
  margin-bottom: 12px;
  list-style: none;
}

.playlists-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: background 0.3s ease;
}

.playlists-info:hover {
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

  </style>