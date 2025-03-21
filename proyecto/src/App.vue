<template>
  <AudioStreamer ref="streamerRef" />
  <div id="app">
  
   <div class="container">
      <div class="header">

         <!-- Imagen que activa el menú -->
         <img class="image-left" :src="previewIcon" alt="Preview" @click="toggleMenu"/>
         <div class="busqueda">
            <input class="search-bar" type="text" placeholder="¿Qué quieres reproducir?" v-model="currentSearch" @input="fetchResults"/>
            <div class="search-results" v-if="currentSearch && !isLoading">

               <template v-if="hasResults">
                  <div v-for="artista in results.artistas" :key="artista.Nombre" class="result-item">
                     <img :src="artista.FotoPerfil || 'default-image.jpg'" alt="Artista" />
                     <span>{{ artista.Nombre }}</span>
                  </div>

                  <div v-for="cancion in results.canciones" :key="cancion.Nombre" class="result-item"  @mouseover="hoveredSong = cancion.Nombre" @mouseleave="hoveredSong = null">
                     <img :src="cancion.Portada" alt="Canción" />
                     <div class="song-quest-info">
                        <span>{{ cancion.Nombre }} ({{ formatTime(cancion.Duracion) }})</span>
                        <button v-if="hoveredSong === cancion.Nombre" @click="playSong(cancion)">
                        <img :src="playIcon" alt="Play" />
                        </button>
                     </div>
                  </div>

                  <div v-for="album in results.albums" :key="album.Nombre" class="result-item">
                     <img :src="album.Portada" alt="Preview" />
                     <span> {{ album.Nombre }}</span>
                  </div>

                  <div v-for="lista in results.listas" :key="lista.Nombre" class="result-item">
                     <img :src="lista.Portada" alt="Preview" />
                     <span> {{ lista.Nombre }}</span>
                  </div>
               </template>
               <div v-else class="no-results">
                  ❌ Sin resultados
               </div>
            </div>
            
            <select v-model="searchOption" @change="fetchResults" >
               <option>Todo</option>
               <option value="artistas">Artista</option>
               <option value="canciones">Canción</option>
               <option value="albums">Álbum</option>
               <option value="listas">Lista</option>
            </select>
         </div>
        <img class="image-right" :src="userIcon" alt="User" @click="openUser"
        />
      </div>

      <main class="main-content">
        <router-view />
      </main>
      <audio id="app-player" hidden @error="onPlayerError" @timeupdate="updateCurrentTime"  ></audio>
      <!-- Barra de canción -->
      <div class="player-bar">
        <div class="controls">
          <button>
            <img :src="previousIcon" alt="Previous" />
          </button>
          <button @click="togglePlay">
            <img :src="isPlaying ? pauseIcon : playIcon" alt="Play/Pause" />
          </button>
          <button>
            <img :src="nextIcon" alt="Next" />
          </button>
        </div>
        <div class="progress-container">
          <div class="song-info">
            <!-- Mostrar la portada y el nombre de la canción -->
            <img :src="lastSong.cover" alt="Song Icon" class="song-icon" />
            <span class="song-name">{{ lastSong.name }}</span>
          </div>
          <div>  {{ currentSongTime }} </div>
          <input type="range" class="progress-bar" min="0" max="100" v-model="progress"  @input="seekAudio" />
          <div>  {{ lastSong.minute }}</div>
        </div>
      </div>
      <!-- Capa de fondo difuminada (se muestra solo si el menú está abierto) -->
      <div v-if="isMenuOpen" class="overlay" @click="closeMenu"></div>

      <!-- Menú en semicírculo desde la esquina superior izquierda -->
      <div v-if="isMenuOpen" class="menu-container">
        <div class="menu">
          <button class="menu-item" 
            v-for="(icon, index) in menuIcons" 
            :key="index" 
            :style="getIconPosition(index, menuIcons.length)"
            @click="icon.action">
            <img :src="icon.src" :alt="icon.alt" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, provide } from 'vue';

// Importar las imágenes
import previewIcon from '@/assets/preview.svg';
import userIcon from '@/assets/circle-user.svg';
import previousIcon from '@/assets/skip_previous.svg';
import pauseIcon from '@/assets/pause-circle.svg';
import playIcon from '@/assets/play-circle.svg';
import nextIcon from '@/assets/skip_next.svg';
import recordVinylIcon from '@/assets/record-vinyl.svg';
import friendsIcon from '@/assets/following.svg';
import starIcon from '@/assets/star.svg';
import settingsIcon from '@/assets/settings.svg';
import albumIcon from '@/assets/folder-music.svg';
import createList from '@/assets/task-checklist.svg'
import router from './router';
import AudioStreamer from './components/AudioStreamer.vue'

const streamerRef = ref(null)
provide('playSong',playSong);
// Variables reactivas
const lastSong = ref({
  name: '',
  cover: '',
  minute: 0
});

const email =  localStorage.getItem("email");
const isMenuOpen = ref(false);
const isPlaying = ref(false);
const currentSongTime = ref(0);
const isLoading = ref(false);
const searchOption = ref('Todo');
const currentSearch = ref('');
const hoveredSong = ref(null);
const currentSong = ref('');
const currentStopTime = ref('');
const progress = ref(0); // Valor de la barra (0 a 100)
const results = ref({
  artistas: [],
  canciones: [],
  albums: [],
  listas: []
});

const menuIcons = ref([
  { src: friendsIcon, alt: 'Amigos' },
  { src: starIcon, alt: 'Favoritos' },
  { src: settingsIcon, alt: 'Configuración' },
  { src: albumIcon, alt: 'Álbum' },
  { src: createList, alt: 'List', action: () => router.push('/createList') }, 
]);

const hasResults = computed(() => 
  results.value.artistas.length || 
  results.value.canciones.length || 
  results.value.albums.length || 
  results.value.listas.length
);


let lastUpdatedSecond = -1;

function updateCurrentTime(event) {
  const newTime = Math.floor(event.target.currentTime); // Solo segundos enteros

  if (newTime !== lastUpdatedSecond && isPlaying.value) {
    lastUpdatedSecond = newTime;
    currentSongTime.value =  formatTime(event.target.currentTime.toFixed(0));
    
    if (event.target.duration) {
      progress.value = (event.target.currentTime / event.target.duration) * 100;
      
    }
    
    console.log(`[info] Tiempo actualizado: ${currentSongTime.value}s`);
  }
}

// Función para iniciar una canción
function playSong(song) {

  lastSong.value = {
    name: song.Nombre,
    cover: song.Portada,
    minute: formatTime(song.Duracion),
  };
  if (streamerRef.value?.startStreamSong) {
    console.log("id:",song.Id);
    console.log("nommbre:",song.Nombre);
    streamerRef.value.startStreamSong(song.Id, song.Nombre)
    currentSong.value = song;
    isPlaying.value = true;
  } else {
    console.warn('startStreamSong no está disponible')
  }
}

// Función para pausar/reanudar
function togglePlay() {
  
  if (streamerRef.value?.stopCurrentStream) {
      if (isPlaying.value){
        streamerRef.value.stopCurrentStream()
        currentStopTime.value = currentSongTime.value
        isPlaying.value = false;
        console.log("stop: ", currentStopTime.value);
      }else{
    
        streamerRef.value.resumeCurrentStream(currentSong.value.Id,currentSong.value.Nombre,currentStopTime.value)
        isPlaying.value = true;
        console.log("play");
      }
    } else {
      console.warn('No se pudo acceder a stopCurrentStream')
    }
  
  }
  

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

const openUser = () => {
  router.push('/User');
};

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Función para obtener la posición de los íconos en el menú
function getIconPosition(index, total) {
  const angle = (index / (total - 1)) * (Math.PI / 2);
  const radius = 120;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { transform: `translate(${x}px, ${y}px)` };
}


const fetchResults = async () => {
   
   if (!currentSearch.value.trim()) {
      results.value = { artistas: [], canciones: [], albums: [], listas: [] };
      return;
   }

   isLoading.value = true;
   console.log("Texto de búsqueda:", currentSearch.value);
   console.log("Filtro seleccionado:", searchOption.value);

   try { 
      // Convertir "Todo" en un valor vacío para que la API devuelva todos los resultados
      const tipo = searchOption.value === "Todo" ? "" : searchOption.value;
      const response = await fetch(`https://echobeatapi.duckdns.org/search/?q=${encodeURIComponent(currentSearch.value)}&tipo=${encodeURIComponent(tipo)}`);
      if (!response.ok) throw new Error('Error al obtener los datos de búsqueda');

      results.value = await response.json();
      console.log("Respuesta de la API:", results.value);
      console.log("Artistas:", JSON.parse(JSON.stringify(results.value.artistas)));
      console.log("Canciones:", JSON.parse(JSON.stringify(results.value.canciones)));
      console.log("Álbumes:", JSON.parse(JSON.stringify(results.value.albums)));
      console.log("Listas:", JSON.parse(JSON.stringify(results.value.listas)));

   } catch (error) {
      console.error('Error:', error);

   } finally {
      isLoading.value = false; 
   }
};

function seekAudio(event) {
  const newTime = event.target.currentTime;
  console.log(newTime)
  event.target.currentTime = newTime
  currentSongTime.value = newTime

}

// onMounted(async () => {
//   try {
//     const songResponse = await fetch(`https://echobeatapi.duckdns.org/users/last-played-song?userEmail=${encodeURIComponent(email)}`);
//     if (!songResponse.ok) throw new Error('Error al obtener la última canción');

//     const songData = await songResponse.json();

    
//     // Extraer los datos de la respuesta
//     const songName = songData.Nombre;
//     const songCover = songData.Portada;
//     const songMinute = songData.MinutoEscucha;

//     // Asignar los datos a las variables reactivas
//     lastSong.value = {
//       name: songName,
//       cover: songCover,
//       minute: songMinute,
//     };

//     // Establecer la barra de progreso de acuerdo con el minuto de escucha
//     progress.value = (lastSong.value.minute / songDuration.value) * 100;

//     console.log('Última canción:', lastSong.value);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// });


</script>


<style scoped>
/* Fondo negro */
.container {
  width: 100vw;
  height: 100vh;
  background-color:  #222222;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Barra fija */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  height: 5vh;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: #141414;
  
  z-index: 1000;

}

.main-content {
  padding-top: 7vh; /* Ajusta según la altura del header */
  padding-bottom: 12vh; 
}

/* Imagenes */
.image-left, .image-right {
  width: 40px;
  height: auto;
  filter: brightness(0) invert(1);
  cursor: pointer;
}

/* Barra de búsqueda */
.search-bar {
  width: 400px;
  margin: 0 10px;
  padding: 12px 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
}

.search-bar::placeholder {
  color: #bbb;
}

/* Menú desplegable */
.menu-container {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1101;
}

.busqueda {
   justify-content: space-between;
}

.menu {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Íconos del menú */
.menu-item {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  border: none;
}

.menu-item img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

/* Fondo difuminado */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1100;
}

select {
   padding: 6px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
   box-sizing: border-box;
}

.search-results {
  position: absolute;
  width: 430px;
  background-color: #333;
  color: white;
  border-radius: 8px;
  border-width: 10px;
  border-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  margin-top: 5px;
  margin-left: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  scrollbar-width: none;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  position: relative;
}

.result-item img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.result-item:hover {
  background-color: #555;
}

.result-item button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}

.result-item button img {
  width: 25px;
  height: 25px;
  filter: brightness(0) invert(1);
  transition: transform 0.2s ease-in-out;
}

.result-item button:hover img {
  transform: scale(1.2);
}

.song-quest-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1; 
}

.no-results {
  padding: 15px;
  text-align: center;
  color: #bbb;
  font-size: 16px;
}

/*  ESTILOS DE LA BARRA DE REPRODUCCIÓN */
.player-bar {
  display: flex;
  flex-direction: column; /* Apila los elementos */
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height:10vh; /* Aumenta la altura para acomodar los controles */
  background-color: #111;
  padding: 10px 0;
  z-index: 1000;
  color: white;
  box-shadow: 0px -7px 6px rgba(1, 1, 1, 0.6);
  
  
}

/* Controles de música */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px; /* Espacio entre los controles y la barra de progreso */
}

.controls button {
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 15px;
}

.controls img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}

/* Contenedor de la barra de progreso */
.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Icono de la canción */
.song-info {
  position: absolute;
  bottom: 25px;
  left: 20px;
  display: flex;
  align-items: center;
}

.song-icon {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
  margin-right: 10px;
}

.song-name {
  font-size: 14px;
  color: white;
}

/* Barra de progreso */
.progress-bar {
  width: 30%;
  height: 4px;
  background: #444;
  border-radius: 2px;
  appearance: none;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
}

.progress-bar::-webkit-slider-thumb {
  appearance: none;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
}


</style>
