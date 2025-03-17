<template>
  <div class="layout">
    <div class="playlist-container">
      <div class="playlist-header">
        <img :src="playlistInfo.Portada" alt="Playlist" @error="handleImageError($event)">
        <div class="playlist-info">
          <h1>{{ playlistInfo.Nombre }}</h1>
          <p>{{ playlistInfo.NumCanciones }} canciones</p>
          <p>{{ playlistInfo.Descripcion }}</p>
          <p>{{ playlistInfo.NumLikes }} Likes</p>
        </div>
      </div>

      <div class="song-container">
        <div class="playlist-actions">
          <button class="button-action" @click="randomClick">
            <img :src="randomIcon" alt="random" :class="{ 'glow-effect': isGlowing }" />
          </button>
          <input v-model="searchTerm" placeholder="Buscar canción" />
        </div>

        <hr>

        <draggable v-model="playlist" tag="ul" class="song-list" item-key="id" animation="200" ghost-class="drag-ghost">
          <template #item="{ element, index }">
            <li class="song-item" :key="element.id || index">
              <div class="song-info">
                <div class="song-cover">
                  <img :src="element.portada" :alt="element.nombre" @error="handleImageError($event)" />
                </div>

                <div class="song-name-artist">
                  <p>{{ element.nombre }} {{ element.duracion }} s</p>
                </div>

                <div class="song-album">
                  <p v-if="playlistInfo.type === 'playlist'">Álbum: {{ element.album }}</p>
                </div>

                <div class="song-plays">
                  <p>Reproducciones: {{ element.numReproducciones }}</p>
                </div>

                <div class="song-buttons">
                  <button>❤️</button>
                  <button>▶️</button>
                </div>
              </div>
            </li>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

 
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';
import randomIcon from '@/assets/random-button.png';
import default_img from '@/assets/kebab.jpg';
import playIcon from '@/assets/play-circle.svg';

// Variables para CSS y HTML
const isGlowing = ref(false);

const route = useRoute();
const Id = route.query.id;

console.log('ID de la playlist:', Id);

const playlistInfo = ref({}); // Inicializado como objeto vacío
const playlist = ref([]); // Inicializado como array vacío
const searchTerm = ref('');

onMounted(async () => {
  try {
    // OBTENER INFO DE LA PLAYLIST
    const infoResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/lista/${Id}`);
    if (!infoResponse.ok) throw new Error('Error al obtener la información de la playlist');
    
    playlistInfo.value = await infoResponse.json();
    console.log("✅ PlaylistInfo cargada: ", playlistInfo.value);

    //  OBTENER CANCIONES DE LA PLAYLIST
    const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/${Id}/songs`);
    if (!songsResponse.ok) throw new Error('Error al obtener las canciones de la playlist');

    const songsData = await songsResponse.json();
    console.log("✅ SongsData recibido: ", songsData);

    // VERIFICAR SI LOS DATOS ESTÁN BIEN FORMATEADOS
    if (!songsData || !Array.isArray(songsData.canciones)) {
      throw new Error('Las canciones no llegaron en formato de array');
    }

    // ASIGNAR LAS CANCIONES A `playlist`
    playlist.value = songsData.canciones;
    console.log("✅ Playlist final cargada:", playlist.value);

  } catch (error) {
    console.error('Error al cargar la playlist:', error);
  }
});

onUnmounted(() => {
  console.log("Saliendo de la página...");
  // Aquí puedes hacer una actualización en la base de datos si se reordenaron canciones
});

// Imagen de reemplazo
const handleImageError = (event) => {
  event.target.src = default_img; // Reemplaza la imagen con la default
};

// Gestión al hacer clic en el botón aleatorio
const randomClick = () => {
  isGlowing.value = !isGlowing.value;
};

</script>

 
<style scoped>


  hr{
 
    border-color:#8a3a10 ;
    opacity: 0.8;
    width: 100vw;
  }
  .layout {
    display: flex;
    height: 100vh;
    background: linear-gradient(180deg, #141414 15%,#4a1e04 40%,#8a3a10 60%, #ffb347 100%); /* Ajuste del gradiente para reducir el negro */
    
    color: white;
    background-attachment: fixed;
    } 

    .song-action{
    align-items: center;
    }

  .playlist-container {
    align-items: center;
    width: 100%;
    height: calc(100vh - 21vh);
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    overflow-y: auto;
    margin-top: 6px;
    /*background: linear-gradient(180deg, #141414 20%, #8a3a10 40%, #ffb347 100%);*/
    scrollbar-width: none; /* Oculta la barra de desplazamiento en Firefox */
    -ms-overflow-style: none; /* Oculta la barra de desplazamiento en Internet Explorer y Edge */
    background-attachment: fixed;
  }

  .playlist-header {
    min-height: 20vh;
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 30px; 
  }
  
.playlist-header img {
  width: 12vw;
  height: 12vw;
  object-fit: cover; /* Hace que la imagen llene el div sin deformarse */
  border-radius: 8px; /* Mantiene el mismo borde redondeado */

}


  .playlist-info {
    color: white;
    text-align: left;
    max-width: 500px;


  }

  .playlist-info h1 {
    margin: 10px 0;
    font-family: 'Montserrat', sans-serif;
    font-size: 2.8rem;
    font-weight: bold;
    color: #ffb347;  /* Naranja brillante */
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5); /* Sombra para mejor legibilidad */
    letter-spacing: 1px;
  }

  .playlist-info p {
    margin: 5px 0;
    font-family: 'Inter', sans-serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: #d4d4d4; /* Gris claro para legibilidad */
    opacity: 0.8; /* Hace que el texto sea un poco más suave */
    margin: 4px 0; /* Espaciado entre líneas */
  }

  .playlist-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    width: 100%;
  }

  .playlist-actions input,
  .playlist-actions select,
  .playlist-actions button {
    background-color: #2d1405;
    border: none;
    padding: 10px;
    border-radius: 10px;
    color: white;
    font-weight: bold;
    transition: background 0.3s, border 0.3s;
  }

  .playlist-actions input {
    width: 220px;
    background-color: #8A3A1B;
    
  }
  .playlist-actions input::placeholder {
    color: white; /* Color del placeholder dorado para mejor visibilidad */
    opacity: 0.5;
  }

  .playlist-actions select {
    width: 160px;
    background-color: transparent;
    color: white;
    opacity: 0.5;
  }

  .playlist-actions button {
    background-color: transparent;
  }

  .song-list {
    width: 95%;
    margin-bottom: 4vh;
  }
  
  .song-list li {
    margin: 12px 0;
    background-color: #2d1405;
    padding: 14px;
    border-radius: 12px;
    list-style: none;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    cursor: pointer; 
  }
  .song-list li:hover {
    transition: 0.2s;
    transform: scale(1.03,1.03);  
    background-color: #d4752b; /* Naranja más oscuro en hover */
    opacity: 0.8;
  }
  
  .song-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px;
    margin: 0 auto;
    
  }
  .song-cover {
  text-align: center;
  width: 60px;  /* Define un tamaño fijo para la portada */
  height: 60px; /* Asegura que el contenedor no se expanda */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px; /* Bordes redondeados opcionales */
}


.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Hace que la imagen llene el div sin deformarse */
  border-radius: 8px; /* Mantiene el mismo borde redondeado */

}

.button-action {
    width: 50px;  /* Ajusta según el tamaño deseado */
    height: 50px; /* Ajusta según el tamaño deseado */
    background-color: transparent;
   
  }


  .button-action img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Asegura que la imagen no se deforme */
    cursor: pointer;
  }

  .glow-effect {
    mix-blend-mode: screen; /* Hace que las partes oscuras del icono se iluminen */
    filter: drop-shadow(0px 0px 8px rgba(255, 165, 0, 0.8)); /* Agrega brillo */
  }

.song-titles {
  display: flex;
  justify-content: space-between; /* Distribuye los títulos de manera uniforme */
  width: 95%;
  margin: 10px auto; /* Centrar el contenedor */
  font-weight: bold;
  text-transform: capitalize;
  color: #ffb347; /* Naranja claro para destacar */
}

.song-titles span {
  flex: 1; /* Cada título ocupa el mismo espacio */
  text-align: center;
}

  .song-name-artist,
  .song-album,
  .song-plays,
  .song-buttons {
    width: 22%;
    text-align: center;
    
  }
  
  h1 {
    margin-top: 60px;
  }
  .song-buttons button{
    background-color: transparent;
    border: transparent;
    border-radius: 50%;
    width: 40px; height: 40px
    
  }
  .song-buttons button:hover {
  
    background-color: #2d1405; /* Naranja más oscuro en hover */
  }

  
  .controls-container {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  /* Animación de movimiento */
.slide-fade-move {
  transition: transform 0.4s ease-in-out, opacity 0.3s;
}

/* Animación de entrada y salida */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.drag-ghost {
  opacity: 0.5;
  background: #8a3a10;
  transform: scale(1.05);
}


</style>
 