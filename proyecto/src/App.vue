<template>
  <AudioStreamer ref="streamerRef" />
  <div id="app">
  
   <div class="container">
      <div class="header">

         <!-- Imagen que activa el menú -->
          <div class="busqueda">
            <img class="image-left" :src="previewIcon" alt="Preview" @click="toggleMenu"/>
            <img class="logo" :src="logo" alt="Logo"/>
         </div>
         <div class="busqueda" ref="searchArea" @click.stop>
            <input class="search-bar" type="text" placeholder="¿Qué quieres reproducir?" v-model="currentSearch" @input="fetchResults"/>
            <div class="search-results" v-if="currentSearch && !isLoading" ref="resultsArea">

               <template v-if="hasResults">
                  <div v-for="artista in results.artistas" :key="artista.Nombre" class="result-item">
                     <img :src="artista.FotoPerfil || 'default-image.jpg'" alt="Artista" />
                     <span>{{ artista.Nombre }}</span>
                  </div>

                  <div v-for="cancion in results.canciones" :key="cancion.Id" class="result-item"  @mouseover="hoveredSong = cancion.Nombre" @mouseleave="hoveredSong = null">
                     <img :src="cancion.Portada" alt="Canción" />
                     <div class="song-quest-info">
                        <span>{{ cancion.Nombre }} ({{ formatTime(cancion.Duracion) }})</span>
                        <button v-if="hoveredSong === cancion.Nombre" @click="playSong(cancion)">
                        <img :src="playIcon" alt="Play" />
                        </button>
                     </div>
                  </div>

                  <div v-for="album in results.albums" :key="album.id" class="result-item">
                     <img :src="album.portada" alt="Preview" />
                     <span> {{ album.nombre }} </span>
                     <span class="numCanciones-span"> {{ album.numCanciones }} canciones</span>
                  </div>

                  <div v-for="lista in results.playlists" :key="lista.id" class="result-item">
                     <img :src="lista.portada" alt="Preview" />
                     <span> {{ lista.nombre }}</span>
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
               <option value="playlists">Playlist</option>
            </select>
         </div>
        <img class="image-right" :src="userIcon" alt="User" @click="openUser"
        />
      </div>

      <main class="main-content">
        <router-view />
      </main>
      <audio id="app-player"  ref="player" hidden @error="onPlayerError" @timeupdate="updateCurrentTime"  ></audio>
      <!-- Barra de canción -->
      <div class="player-bar">

        <div class="controls">
            <button class="side-buttons" @click="randomClick">
               <img :src="randomIcon" alt="random" />
            </button>
            <button class="side-buttons">
               <img :src="previousIcon" alt="Previous" @click="previousSong"/>
            </button>

            <button class="play-button" @click="togglePlay">
               <img :src="isPlaying ? pauseIcon : playIcon" alt="Play/Pause" />
            </button>

            <button class="side-buttons">
               <img :src="nextIcon" alt="Next" @click="nextSong"/>
            </button>

            <button class="side-buttons" @click="playSong(currentSong)">
               <img :src="restart" alt="Restart" />
            </button>
         
          </div>

          <div class="progress-container">

            <div class="song-info">
              <img :src="lastSong.cover" alt="Song Icon" class="song-icon" />
              <span class="song-name">{{ lastSong.name }}</span>
            </div>

            <div class="progress-section">
              <div>{{ currentSongTime }}</div>
              <input type="range" class="progress-bar" min="0" max="100" v-model="progress" @input="seekAudio" step="0.1"
                :style="{ backgroundSize: (progress / 100) * 100 + '% 100%' }" />
              <div>{{ lastSong.minute }}</div>
            </div>

            <div class="volume-section">
              <span class="volume-icon">🔊</span>
              <input type="range" min="0" max="1" step="0.01" @input="setVolume($event.target.value)" />
          </div>

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
            <img :src="icon.src" :alt="icon.alt"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, provide, onMounted, onBeforeUnmount } from 'vue';

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
import createList from '@/assets/task-checklist.svg';
import restart from '@/assets/restart.svg';
import randomIcon from '@/assets/random-button.png';
import logo from '@/assets/logo.png';
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
const player = ref(null);

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

const searchArea = ref(null);
const resultsArea = ref(null);


const results = ref({
  artistas: [],
  canciones: [],
  albums: [],
  playlists: []
});

const menuIcons = ref([
  { src: friendsIcon, alt: 'Amigos' },
  { src: starIcon, alt: 'Favoritos', action: () => router.push('/favs')},
  { src: settingsIcon, alt: 'Configuración' },
  { src: albumIcon, alt: 'Álbum' },
  { src: createList, alt: 'List', action: () => router.push('/createList') }, 
]);

const hasResults = computed(() => 
  results.value.artistas.length || 
  results.value.canciones.length || 
  results.value.albums.length || 
  results.value.playlists.length
);

// Función para gestionar siguiente cancion
const nextSong = async() =>{
  try {
    const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/siguiente-cancion?userEmail=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Error al obtener next song');
    const nextSongData = await response.json();
    console.log("nextsong: ", nextSongData);

    const song = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${nextSongData.siguienteCancionId}`)
      
      if (!song.ok) {
         throw new Error('Error al reproducir la canción ');
      }
      const songData = await song.json();
      const newSong = {
         Id: nextSongData.siguienteCancionId,
         Nombre: songData.Nombre,
         Portada: songData.Portada,
         Duracion: songData.Duracion,
      };
      playSong(newSong);

  } catch (error) {
    console.error('Error next song:', error);
  }
 
}

const previousSong = async() =>{
  try {
    const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/anterior?userEmail=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Error al obtener previous song');
    const previousSong = await response.json();
    console.log("previousSong: ", previousSong);

    const song = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${previousSong.cancionAnteriorId}`)
      
      if (!song.ok) {
         throw new Error('Error al reproducir la canción ');
      }
      const songData = await song.json();
      const newSong = {
         Id: previousSong.cancionAnteriorId,
         Nombre: songData.Nombre,
         Portada: songData.Portada,
         Duracion: songData.Duracion,
      };

      playSong(newSong);


  } catch (error) {
    console.error('Error previous song:', error);
  }
}

// Función para cerrar el desplegable de búsqueda
const closeSearchResults = () => {
  currentSearch.value = ''; // Limpiar la búsqueda
};

// Agregar evento de clic global
const handleClickOutside = (event) => {
  // Si el clic fue fuera de la barra de búsqueda y los resultados
  if (
    searchArea.value && !searchArea.value.contains(event.target) &&
    resultsArea.value && !resultsArea.value.contains(event.target)
  ) {
    closeSearchResults(); // Cerrar resultados si el clic fue fuera
  }
};

// Registrar el evento al montar el componente
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Eliminar el evento cuando se desmonte el componente
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});


let lastUpdatedSecond = -1;
let progressInterval = null;
let contador = 1;

function updateCurrentTime(event) {
  const newTime = Math.floor(event.target.currentTime); // Solo segundos enteros
  if (newTime !== lastUpdatedSecond && isPlaying.value) {
    lastUpdatedSecond = newTime;
    currentSongTime.value =  formatTime(event.target.currentTime.toFixed(0));
    
    if (event.target.duration) {
      progress.value = (event.target.currentTime / event.target.duration) * 100;
      
    }
    // Si ya existía un intervalo, lo limpiamos para no duplicarlo
   
    if (progressInterval) {
        
        clearInterval(progressInterval);
    }
    if(contador  ===  0 ){
      contador = 1;
      // Enviamos solo si el audio se está reproduciendo
        if (isPlaying.value) {
          const currentTime = parseInt(event.target.currentTime.toFixed(0));
          console.log(`userId: ${email}, songId: ${currentSong.Id}, currentTime: ${currentTime}`) 
          streamerRef.value.socket.emit('progressUpdate', {
            userId: email,
            songId: currentSong.Id,
            currentTime,
          });
          console.log(`[Progress]Progreso enviado: ${currentTime} segundos`);
        }

    }else{
      contador--;
    }
    console.log(`[info] Tiempo actualizado: ${currentSongTime.value}s`);
  }
}
//Hacer otra funcion que para pner una cancion desde el reproductor await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/play-list


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

    streamerRef.value.startStreamSong(song.Id, song.Nombre, email);

    currentSong.value = song;
    isPlaying.value = true;
  } else {
    console.warn('startStreamSong no está disponible')
  }
}

function setVolume(volumen) {
  if (!player.value) return

  const volume = Math.min(Math.max(volumen, 0), 1) // asegura valor entre 0 y 1
  player.value.volume = volume
  console.log(`[volumen] Nivel de volumen establecido: ${volume}`)
}


// Función para pausar/reanudar
// Función para pausar/reanudar
function togglePlay() {
  if (!player.value){
    console.warn("[player] Error con el player audio")
    return
  } 
  if (streamerRef.value?.stopCurrentStream) {
      if (isPlaying.value){
        // streamerRef.value.stopCurrentStream()
        currentStopTime.value = currentSongTime.value

        player.value.pause()
        isPlaying.value = false;
        console.log("stop: ", currentStopTime.value);
      } else{
    
        // streamerRef.value.resumeCurrentStream(currentSong.value.Id,currentSong.value.Nombre,email,currentStopTime.value)
        player.value.play().catch((err) => {
          console.warn('[player] Error al reproducir:', err)
        })
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
      results.value = { artistas: [], canciones: [], albums: [], playlists: [] };
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
      console.log("Playlists:", JSON.parse(JSON.stringify(results.value.playlists)));

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

.logo {
  width: 45px;
  height: auto;
  margin-left: 15px;
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

.menu-item:hover{
  background-color: rgba(255, 255, 255, 0.4); 
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
   border: 2px solid #575553;
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

.numCanciones-span {
   margin-left: 20px;
   color: orange
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

.player-bar-right {
  align-self: flex-end; /* mueve este hijo a la derecha del contenedor vertical */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%; /* ocupa todo el ancho posible */
  padding-right: 20px; /* separación del borde derecho */
}

/* Controles de música */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px; /* Espacio entre botones */
}

.side-buttons {
  flex-grow: 0; /* Espaciado equitativo */
  display: flex;
  justify-content: center;
  flex: none; 
}

.play-button {
  flex-grow: 0;
  transform: scale(1.2); /* Aumenta el tamaño del botón central */
  justify-content: center;
  flex: none; 
}

.controls button {
  background: none;
  border: none;
  cursor: pointer;
}

.controls img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}


/* Progreso de la canción */
.progress-bar-filled {
  height: 100%;
  background: #323fa6; /* Color verde para el progreso */
  border-radius: 2px;
  transition: width 0.1s ease-in-out; /* Animación suave para el progreso */
}

.player-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #111;
  padding: 10px 0;
  z-index: 1000;
  color: white;
  box-shadow: 0px -7px 6px rgba(1, 1, 1, 0.6);
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.progress-container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0 1rem;
  
}

.song-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  justify-self: start; /* pegado a la izquierda */
}

.song-icon {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 5px;
}

.song-name {
  font-size: 14px;
  color: white;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 35vw;
   justify-content: center;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #444;
  border-radius: 2px;
}

.volume-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  justify-self: end; /* pegado a la derecha */
  margin: auto;
}

.volume-section input[type="range"] {
  width: 120px;
  height: 4px;
  background-color: #555;
  border-radius: 4px;
  appearance: none;
  cursor: pointer;
}



</style>
