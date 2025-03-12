<template>
   <div class="layout">
     
    <div class="playlist-container">
        <div class="playlist-header">
          <img 
          :src="default_img" 
          alt="Playlist"
          @error="handleImageError($event)"
          >
          <div class="playlist-info">
            <h1>{{ playlist.name }}</h1>
            <p>{{ playlist.author }}</p>
            <p>{{ playlist.description }}</p>
            <p>{{ playlist.genre }} - {{ playlist.likes }} Likes</p>
          </div>
        </div>
        

        <div class="song-container">
          <div class="playlist-actions">
            <button class="button-action">🔀</button>
            <button class="button-action">▶️</button>
            <input v-model="searchTerm" placeholder="Buscar canción" />
            <select v-model="sortOption" @change="sortSongs">
              <option value="default">Predefinido</option>
              <option value="artist">Artista</option>
              <option value="plays">Reproducciones</option>
              <option value="album">Álbum</option>
            </select>
          </div>
          <hr >
          <ul class="song-list">
            <li v-for="(song, index) in playlist" :key="index" class="song-item">
              <div class="song-info">
                <div class="song-cover">
                  <img :src="song.portada" 
                  :alt="song.nombre"
                  @error="handleImageError($event)"
                  >
                   
                </div>
                <!-- Nombre y Artista + Duración -->
                <div class="song-name-artist">
                  <p>{{ song.nombre }}   {{ song.duracion }} s</p>
                </div>
    
                <!-- Álbum -->
                <div class="song-album">
                  <p v-if="playlist.type === 'playlist'">Álbum: {{ song.album }}</p>
                </div>
    
                <!-- Reproducciones -->
                <div class="song-plays">
                  <p>Reproducciones: {{ song.numReproducciones }}</p>
                </div>
    
                <!-- Botones -->
                <div class="song-buttons">
                  <button>❤️</button>
                  <button>▶️</button>
                  <button v-if="isOwner" @click="moveUp(index)">⬆️</button>
                  <button v-if="isOwner" @click="moveDown(index)">⬇️</button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
 </template>
 
 <script setup>
 import { ref, computed, onMounted } from 'vue';
 import { useRoute } from 'vue-router';
 import default_img from  '@/assets/kebab.jpg';

const route = useRoute();
const Id = route.query.id;

console.log('ID de la playlist:', Id);

 const playlist = ref([]); 
 const searchTerm = ref('');
 const sortOption = ref('default');
 const isOwner = ref(true);

 onMounted(async () => {
  try {
    const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/${Id}/songs`);
    if (!songsResponse.ok) throw new Error('Error al obtener las canciones de la playlist');
    const songsData = await songsResponse.json();
    console.log("songs.data: ", songsData);
    playlist.value = Array.isArray(songsData.canciones) ? songsData.canciones : [songsData.canciones];
    console.log("playlist: ", playlist.value);
  } catch (error) {
    console.error('songs Error:', error);
  }
    

});

// Imagen de remplazo
const handleImageError = (event) => {
  event.target.src = default_img; // Reemplaza la imagen con la default
};

const filteredSongs = computed(() => {
   let localsongs = playlist.value;
   if (searchTerm.value) {
    localsongs = localsongs.filter(song => song.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
   }
   return localsongs;
 });
 
 function sortSongs() {
   if (sortOption.value === 'artist') {
     playlist.value.canciones.sort((a, b) => a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name));
   } else if (sortOption.value === 'plays') {
     playlist.value.canciones.sort((a, b) => b.plays - a.plays);
   } else if (sortOption.value === 'album') {
     playlist.value.canciones.sort((a, b) => a.album.localeCompare(b.album));
   }
 }
 
 function moveUp(index) {
   if (index > 0) {
     const songs = playlist.value.canciones;
     [songs[index - 1], songs[index]] = [songs[index], songs[index - 1]];
   }
 }
 
 function moveDown(index) {
   if (index < playlist.value.canciones.length - 1) {
     const songs = playlist.value.canciones;
     [songs[index], songs[index + 1]] = [songs[index + 1], songs[index]];
   }
 }

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
    font-size: 2.2rem;
    font-weight: bold;
  }

  .playlist-info p {
    margin: 5px 0;
    font-size: 1.1rem;
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

  .playlist-actions button:hover {
    background-color: #ffb347;
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
  
    background-color: #d4752b; /* Naranja más oscuro en hover */
  }

  
  .controls-container {
    display: flex;
    gap: 14px;
    align-items: center;
  }

</style>
 