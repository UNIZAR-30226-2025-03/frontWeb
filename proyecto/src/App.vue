<template>
   <AudioStreamer ref="streamerRef" />
   <div id="app">
 
    <div class="container">
       <div class="header" v-if="!isAdmin">
          <!-- Imagen que activa el menú -->
           <div class="busqueda">
             <img class="image-left" :src="previewIcon" alt="Preview" @click="toggleMenu"/>
             <img class="logo" :src="logo" alt="Logo" @click="backHome"/>
          </div>
          <div class="busqueda" ref="searchArea" @click.stop>
             <input class="search-bar" type="text" placeholder="¿Qué quieres reproducir?" v-model="currentSearch" @input="fetchResults"/>
             <div class="search-results" v-if="currentSearch && !isLoading" ref="resultsArea">
                 <template v-if="hasResults">
                     <!-- Resultados de artistas -->
                   <div 
                     v-for="artista in results.artistas" 
                     :key="artista.Nombre" 
                     class="result-item" 
                     @click="goToArtistProfile(artista.Nombre)">
                     <img :src="artista.FotoPerfil || 'default-image.jpg'" alt="Artista" />
                     <span>{{ artista.Nombre }}</span>
                   </div>
 
                   <div v-for="cancion in results.canciones" :key="cancion.Id" class="result-item"  @mouseover="hoveredSong = cancion.Nombre" @mouseleave="hoveredSong = null">
                      <img :src="cancion.Portada" alt="Canción" />
                      <div class="song-quest-info">
                         <span>{{ cancion.Nombre }} ({{ formatTime(cancion.Duracion) }})</span>
                         <button v-if="hoveredSong === cancion.Nombre" @click="playFromQuest(cancion)">
                         <img :src="playIcon" alt="Play" />
                         </button>
                      </div>
                   </div>
 
 
                   <div v-for="album in results.albums" :key="album.id" class="result-item" @click='handleClick(album.id, "album")' >
 
                      <img :src="album.portada" alt="Preview" />
                      <span> {{ album.nombre }} </span>
                      <span class="numCanciones-span"> {{ album.numCanciones }} canciones</span>
                      <button
                         @mouseenter="hoverLike[album.id] = true"
                         @mouseleave="hoverLike[album.id] = false"
                         class="like-hover"
                         @click.stop="likePlaylist(album.id)"
                       >
                       <span>{{ playlistHoverLike[album.id] || isLiked(album.id) ? '❤️' : '🤍' }}</span>
                      </button>
                   </div>
 
                   <div v-for="lista in results.playlists" :key="lista.id" class="result-item"  @click='handleClick(lista.id, "")' >
                      <img :src="lista.portada" alt="Preview" />
                      <span> {{ lista.nombre }}</span>
 
                      <button
                         @mouseenter="playlistHoverLike[lista.id] = true"
                         @mouseleave="playlistHoverLike[lista.id] = false"
                         class="like-hover"
                         @click.stop="likePlaylist(lista.id)"
                       >
                       <span>{{ playlistHoverLike[lista.id] || isLiked(lista.id) ? '❤️' : '🤍' }}</span>
                      </button>
                   </div>
 
                   <div v-for="listaAmigos in results.playlistsProtegidasDeAmigos" :key="listaAmigos.id" class="result-item" @click='handleClick(listaAmigos.id, "")'>
                      <img :src="listaAmigos.portada" alt="Preview" />
                      <span> {{ listaAmigos.nombre }}</span>
                      <button
                        @mouseenter="playlistHoverLike[listaAmigos.id] = true"
                        @mouseleave="playlistHoverLike[listaAmigos.id] = false"
                        class="like-hover"
                        @click.stop="likePlaylist(listaAmigos.id)"
                      >
                      <span>{{ playlistHoverLike[listaAmigos.id] || isLiked(listaAmigos.id) ? '❤️' : '🤍' }}</span>
                     </button>
                   </div>
 
                   <div v-for="listaGeneros in results.playlistsPorGenero" :key="listaGeneros.id" class="result-item" @click='handleClick(listaGeneros.id, "")'>
                      <img :src="listaGeneros.portada" alt="Preview" />
                      <span> {{ listaGeneros.nombre }}</span>
                      <button
                        @mouseenter="playlistHoverLike[listaGeneros.id] = true"
                        @mouseleave="playlistHoverLike[listaGeneros.id] = false"
                        class="like-hover"
                        @click.stop="likePlaylist(listaGeneros.id)"
                      >
                      <span>{{ playlistHoverLike[listaGeneros.id] || isLiked(listaGeneros.id) ? '❤️' : '🤍' }}</span>
                     </button>
                   </div>
 
                </template>
                <div v-else class="no-results">
                   ❌ Sin resultados
                </div>
             </div>
             <div class="select-wrapper">
                <select v-model="searchOption" @change="handleSearchOptionChange" >
                   <option>Todo</option>
                   <option value="artistas">Artista</option>
                   <option value="canciones">Canción</option>
                   <option value="albums">Álbum</option>
                   <option value="playlists">Playlist</option>
                   <option value="genero">Genero</option>
                </select>
                <!-- Flyout de géneros en forma de botones -->
                <div v-if="showGenderDropdown" class="gender-flyout" ref="genderFlyout">
                   <span class="gender-title">Selecciona un género:</span>
                   <div class="gender-list">
                      <button v-for="gender in genders" :key="gender.NombreGenero" class="gender-btn" @click="selectGender(gender)" :class="{ active: selectedGender === gender }"
                      >
                      {{ gender.NombreGenero }}
                      </button>
                   </div>
                </div>
             </div>
          </div>
 
         <img class="image-right" :src="userIcon" alt="User" @click="openUser"/>
       </div>
 
       <main class="main-content">
         <router-view />
       </main>
       <audio id="app-player"  ref="player" hidden @error="onPlayerError"  @timeupdate="updateCurrentTime" ></audio>
       <!-- Barra de canción -->
 
       <div class="bottom-bar">
         <!-- Left -->
         <div class="now-playing">
           <div class="song-info">
               <!-- Mostrar la portada y el nombre de la canción -->
               <img :src="lastSong.cover" alt="Song Icon" class="song-icon" />
               <span class="song-name">{{ lastSong.name }}</span>
             </div>
             
         </div>
        
         <!-- Center -->
         <div class="controls">
           <div class="buttons">
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
   
               <button class="side-buttons" @click="toggleLoop">
                  <img :src="restart" alt="Restart" :class="{'loop-active': isLooping}" />
             </button>
           </div>
 
           <div class="progress">
             
             <div>  {{ currentSongTime }} </div>
             <input type="range" class="progress-bar" min="0" max="100" v-model="progress"  @input="seekAudio" step="0.1"
             :style="{ backgroundSize: (progress / 100) * 100 + '% 100%' }"/>
             <div> 
                {{ lastSong.minute }}
             </div>
           </div>
 
         </div>
 
         <!-- Right -->
         <div class="extras">
          
           <div class="volume-wrapper">
             <i class="fa-solid fa-volume-high" @click="muteVolumen" >🔊</i>
             <transition name="fade">
                 <input
                   ref="volumeSlider"
                   type="range"
                   min="0"
                   max="1"
                   step="0.01"
                   @input="setVolume($event.target.value)"
                   class="volume-slider"
                 />
               </transition>
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
 
     <div v-if="showPopup" :class="popupType" class="popup">
          {{ popupMessage }}
     </div>
    
   </div>
 
   
 </template>
 
 <script setup>
 
 //falta poner icono de mute
 
 import { computed, ref, provide, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
 /**
  * Importación de funciones reactivas y ciclo de vida desde Vue.
  */
 
  // Importar las imágenes
 import previewIcon from '@/assets/preview.svg';
 /**
  * @constant {string} previewIcon - Ruta de la imagen para vista previa.
  */
 import userIcon from '@/assets/circle-user.svg';
 /**
  * @constant {string} userIcon - Ruta de la imagen del usuario.
  */
 import previousIcon from '@/assets/skip_previous.svg';
 /**
  * @constant {string} previousIcon - Ruta de la imagen para ir a la canción anterior.
  */
 import pauseIcon from '@/assets/pause-circle.svg';
 /**
  * @constant {string} pauseIcon - Ruta de la imagen del botón de pausa.
  */
 import playIcon from '@/assets/play-circle.svg';
 /**
  * @constant {string} playIcon - Ruta de la imagen del botón de reproducción.
  */
 import nextIcon from '@/assets/skip_next.svg';
 /**
  * @constant {string} nextIcon - Ruta de la imagen para ir a la siguiente canción.
  */
 import recordVinylIcon from '@/assets/record-vinyl.svg';
 /**
  * @constant {string} recordVinylIcon - Ruta de la imagen del icono de vinilo.
  */
 import friendsIcon from '@/assets/following.svg';
 /**
  * @constant {string} friendsIcon - Ruta de la imagen del icono de amigos.
  */
 import starIcon from '@/assets/star.svg';
 /**
  * @constant {string} starIcon - Ruta de la imagen del icono de estrella.
  */
 import settingsIcon from '@/assets/settings.svg';
 /**
  * @constant {string} settingsIcon - Ruta de la imagen del icono de configuración.
  */
 import albumIcon from '@/assets/folder-music.svg';
 /**
  * @constant {string} albumIcon - Ruta de la imagen del icono de álbum.
  */
 import createList from '@/assets/task-checklist.svg';
 /**
  * @constant {string} createList - Ruta de la imagen del icono de crear lista.
  */
 import restart from '@/assets/restart.svg';
 /**
  * @constant {string} restart - Ruta de la imagen del icono de reinicio.
  */
 import randomIcon from '@/assets/random-button.png';
 /**
  * @constant {string} randomIcon - Ruta de la imagen del botón de reproducción aleatoria.
  */
 import logo from '@/assets/logo.png';
 /**
  * @constant {string} logo - Ruta de la imagen del logotipo.
  */
 import router from './router';
 /**
  * @constant {object} router - Instancia del router para navegación.
  */
 import AudioStreamer from './components/AudioStreamer.vue'
 /**
  * @component AudioStreamer - Componente para la transmisión de audio.
  */
 import CorazonVacio from '@/assets/me-gusta.png';
 /**
  * @constant {string} CorazonVacio - Ruta de la imagen de "me gusta" vacío.
  */
 import { emitter } from '@/js/event-bus';
 /**
  * @constant {object} emitter - Bus de eventos para comunicación entre componentes.
  */
 
 const streamerRef = ref(null)
 /**
  * @constant {Ref<any>} streamerRef - Referencia al componente AudioStreamer.
  */
 sessionStorage.removeItem('home-song-loaded')
 
 provide('playSong', playSong);
 /**
  * Provee la función playSong para uso en componentes hijos.
  */
 provide('playFromQuest', playFromQuest);
 /**
  * Provee la función playFromQuest para uso en componentes hijos.
  */
 
  provide('streamerRef', streamerRef)
 /**
  * Provee la variable streamerRef para uso en componentes hijos.
  */
 
 emitter.emit("audio-buffer-ready");
 /**
  * Emite el evento "audio-buffer-ready" a través del bus de eventos.
  */
 
 // Variables reactivas
 const lastSong = ref({
   id: '',
   name: '',
   cover: '',
   minute: 0
 });
 /**
  * @constant {Ref<Object>} lastSong - Objeto que almacena la última canción reproducida.
  */
 provide("lastSong", lastSong)
 /**
  * Provee la variable lastSong para uso en componentes hijos.
  */
 // VARIABLES COMPARTIDAS
 const songsData = ref([]); // Esta variable contendrá toda la información de la cola
 /**
  * @constant {Ref<Array>} songsData - Array que almacena la cola de reproducción.
  */
 // Proveemos songsData para que otros componentes (como Home) puedan inyectarla y reaccionar a sus cambios.
 provide('songsData', songsData);
 /**
  * Provee la variable songsData para que componentes hijos puedan acceder y reaccionar a sus cambios.
  */
 
 const player = ref(null);
 /**
  * @constant {Ref<any>} player - Referencia al elemento de audio.
  */
 const mute = ref(false);
 /**
  * @constant {Ref<boolean>} mute - Estado del mute (silencio) del reproductor.
  */
 const email =  localStorage.getItem("email");
 /**
  * @constant {string|null} email - Correo electrónico del usuario obtenido del almacenamiento local.
  */
 const currentNick = ref('');
 /**
  * @constant {Ref<string>} currentNick - Apodo actual del usuario.
  */
 const isMenuOpen = ref(false);
 /**
  * @constant {Ref<boolean>} isMenuOpen - Estado que indica si el menú está abierto.
  */
 const isPlaying = ref(false);
 /**
  * @constant {Ref<boolean>} isPlaying - Estado que indica si una canción se está reproduciendo.
  */
 const currentSongTime = ref(0);
 /**
  * @constant {Ref<number>} currentSongTime - Tiempo actual de la canción en reproducción.
  */
 
  provide('currentSongTime', currentSongTime)
 /**
  * Provee la variable currentSongTime para uso en componentes hijos.
  */
 
 const isLoading = ref(false);
 /**
  * @constant {Ref<boolean>} isLoading - Estado que indica si se están cargando datos.
  */
 const searchOption = ref('Todo');
 /**
  * @constant {Ref<string>} searchOption - Opción de búsqueda seleccionada.
  */
 const currentSearch = ref('');
 /**
  * @constant {Ref<string>} currentSearch - Término de búsqueda actual.
  */
 const hoveredSong = ref(null);
 /**
  * @constant {Ref<any>} hoveredSong - Canción actualmente pasada por encima (hover) en la interfaz.
  */
 const currentSong = ref('');
 /**
  * @constant {Ref<any>} currentSong - Objeto de la canción actualmente en reproducción.
  */
 provide("currentSong",currentSong)
 /**
  * Provee la variable currentSong para uso en componentes hijos.
  */
 const currentStopTime = ref('');
 /**
  * @constant {Ref<string>} currentStopTime - Tiempo en que se detuvo la canción.
  */
 const progress = ref(0); // Valor de la barra (0 a 100)
 /**
  * @constant {Ref<number>} progress - Progreso de la reproducción en porcentaje.
  */
 const isLooping = ref(false);
 /**
  * @constant {Ref<boolean>} isLooping - Estado que indica si la reproducción está en bucle.
  */
 
 const searchArea = ref(null);
 /**
  * @constant {Ref<HTMLElement|null>} searchArea - Referencia al área de búsqueda.
  */
 const resultsArea = ref(null);
 /**
  * @constant {Ref<HTMLElement|null>} resultsArea - Referencia al área que muestra los resultados de búsqueda.
  */
 const hoverLike = ref({});
 /**
  * @constant {Ref<Object>} hoverLike - Estado de like en hover para canciones.
  */
 const playlistHoverLike = ref({});
 /**
  * @constant {Ref<Object>} playlistHoverLike - Estado de like en hover para playlists.
  */
 const audioIsReadyToSeek = ref(false);
 /**
  * @constant {Ref<boolean>} audioIsReadyToSeek - Indica si el audio está listo para saltar a una posición determinada.
  */
 
 const genders = ref([]);
 /**
  * @constant {Ref<Array>} genders - Lista de géneros disponibles.
  */
 const showGenderDropdown = ref(false);
 /**
  * @constant {Ref<boolean>} showGenderDropdown - Estado que controla la visibilidad del desplegable de géneros.
  */
 const selectedGender = ref('');
 /**
  * @constant {Ref<string>} selectedGender - Género seleccionado actualmente.
  */
 const genderFlyout = ref(null);
 /**
  * @constant {Ref<HTMLElement|null>} genderFlyout - Referencia al elemento desplegable de géneros.
  */
  const likedPlaylists = ref([]);
 /**
  * @constant {Ref<HTMLElement|null>} likedPlaylists - Lista de playlists guardadas.
  */
 // pop-up 
 const showPopup = ref(false);
 /**
  * @constant {Ref<boolean>} showPopup - Estado que controla la visualización del popup.
  */
 const popupMessage = ref("");
 /**
  * @constant {Ref<string>} popupMessage - Mensaje que se muestra en el popup.
  */
 const popupType = ref("popup-error");
 /**
  * @constant {Ref<string>} popupType - Tipo del popup ("popup-error" o "popup-success").
  */
 
 const showPopupMessage = (message, type) => {
    popupMessage.value = message;
    popupType.value = type;
    showPopup.value = true;
 
    setTimeout(() => {
       showPopup.value = false;
    }, 1500);
 };
 /**
  * Función para mostrar un popup de mensaje.
  * @param {string} message - Mensaje a mostrar.
  * @param {string} type - Tipo de popup ("popup-error" o "popup-success").
  */
 
 const results = ref({
   artistas: [],
   canciones: [],
   albums: [],
   playlists: [],
   playlistsProtegidasDeAmigos: [],
   playlistsPorGenero: []
 });
 /**
  * @constant {Ref<Object>} results - Objeto que almacena los resultados de la búsqueda en distintas categorías.
  */
 
 const menuIcons = ref([
   { src: friendsIcon, alt: 'Amigos', action: () => actionIcon('/friends')},
   { src: starIcon, alt: 'Favoritos', action: () => actionIcon('/favs')},
   { src: settingsIcon, alt: 'Configuración' },
   { src: albumIcon, alt: 'Álbum', action: () => actionIcon('/fav-playlists') },
   { src: createList, alt: 'List', action: () => actionIcon('/createList') }, 
 ]);
 /**
  * @constant {Ref<Array>} menuIcons - Lista de objetos que contienen los íconos del menú y sus acciones correspondientes.
  */

  const isLiked = (id) => likedPlaylists.value.some(p => p.Id === id);
 /**
  * Función para comprobar si una playlist se encuentra guardada o no
  * @param {string} id - Playlist a comprobar.
  */
 const actionIcon = (pagina) => {
    router.push(pagina);
    closeMenu();
 };
 /**
  * Función para redirigir a una ruta específica y cerrar el menú.
  * @param {string} pagina - Ruta a la que redirigir.
  */
 
  const isAdmin  = ref(false);                 // ▸ reactivo
 
 // 1) Sincronizar al montar
 onMounted(() => {
   isAdmin.value = localStorage.getItem('isAdmin') === 'true';
   console.log("isAdmin: ", isAdmin.value);
   window.addEventListener('storage', syncAdmin);
 });
 
 // 2) Limpieza
 onBeforeUnmount(() => {
   window.removeEventListener('storage', syncAdmin);
 });
 
 function syncAdmin() {
   isAdmin.value = localStorage.getItem('isAdmin') === 'true';
 }
 
 const hasResults = computed(() => 
   results.value.artistas.length || 
   results.value.canciones.length || 
   results.value.albums.length || 
   results.value.playlists.length || 
   results.value.playlistsProtegidasDeAmigos.length || 
   results.value.playlistsPorGenero.length
 );
 /**
  * @constant {ComputedRef<boolean>} hasResults - Computada que indica si existen resultados en alguna categoría.
  */
 
 
 // Opción de búsqueda
 const handleSearchOptionChange = () => {
    if (searchOption.value === 'genero') {
       showGenderDropdown.value = true;
       currentSearch.value = '';
       results.value = {
          artistas: [],
          canciones: [],
          albums: [],
          playlists: [],
          playlistsProtegidasDeAmigos: [],
          playlistsPorGenero: []
       };
    } else {
       showGenderDropdown.value = false;
       fetchResults(); // actualizar búsqueda al cambiar de tipo
    }
 };
 /**
  * Función para gestionar el cambio de opción de búsqueda.
  * Actualiza el estado del desplegable y realiza una nueva búsqueda si es necesario.
  */
 
 const selectGender = (gender) => {
   selectedGender.value = gender;
   currentSearch.value = gender.NombreGenero;
   fetchResults(); 
 };
 /**
  * Función para seleccionar un género.
  * @param {Object} gender - Objeto del género seleccionado.
  */
 
 // Función que cambia el estado del bucle
 const toggleLoop = () => {
    isLooping.value = !isLooping.value; // Cambia el estado del bucle
 
    // Si está en bucle, activamos la reproducción en bucle
    if (isLooping.value) {
       if (player.value) {
          player.value.loop = true; // Activamos el bucle
       }
    } else {
       if (player.value) {
          player.value.loop = false; // Desactivamos el bucle
       }
    }
 };
 /**
  * Función para alternar el modo de reproducción en bucle.
  */
 
 // Función para gestionar siguiente cancion
 const nextSong = async() => {
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
 };
 /**
  * Función asíncrona para reproducir la siguiente canción en la cola.
  */
 
 async function handleSongEnded() {
   try {
     const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/siguiente-cancion?userEmail=${encodeURIComponent(email)}`);
 
     if (!response.ok) {
       console.log('[cola] No hay más canciones en la cola. Fin de reproducción.');
       isPlaying.value = false;
       return;
     }
 
     const nextSongData = await response.json();
 
     if (!nextSongData?.siguienteCancionId) {
       console.log('[cola] No hay más canciones. Deteniendo reproducción.');
       isPlaying.value = false;
       return;
     }
 
     // Si hay siguiente canción, cargar y reproducir
     const song = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${nextSongData.siguienteCancionId}`);
     if (!song.ok) throw new Error('Error al obtener los datos de la siguiente canción');
 
     const songData = await song.json();
 
     const newSong = {
       Id: nextSongData.siguienteCancionId,
       Nombre: songData.Nombre,
       Portada: songData.Portada,
       Duracion: songData.Duracion,
     };
 
     playSong(newSong);
   } catch (error) {
     console.error('[cola] Error al intentar reproducir la siguiente canción:', error);
     isPlaying.value = false;
   }
 }
 /**
  * Función asíncrona que se ejecuta cuando finaliza una canción.
  * Intenta reproducir la siguiente canción de la cola.
  */
 
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
 };
 /**
  * Función asíncrona para reproducir la canción anterior en la cola.
  */
 
 const handleClick = (id, playlistType) => {
    if (playlistType === "album") {
       router.push({ path: '/album', query: { id: id } });
    }
    else {
       console.log("Playlist seleccionada:", id);
       localStorage.setItem("type", playlistType);
       router.push({ path: '/playlist', query: { id: id } });
    }
 };
 /**
  * Función para manejar el clic en una playlist o álbum.
  * Redirige a la ruta correspondiente basado en el tipo.
  */
  
 // Funciones de like a playlist
 const likePlaylist = async (idLista) => {

   if (isLiked(idLista)) {
      showPopupMessage("La playlist ya se encuentra guardada", "popup-error");
   }

   else {
      try {
         const responseLike = await fetch(`https://echobeatapi.duckdns.org/playlists/like/${email}/${idLista}`, {
            method: 'POST',
            });
      
         if(!responseLike.ok) throw new Error(" No se ha podido guardar la playlist");
         showPopupMessage(" Playlist guardada con éxito","popup-success"); 
         emitter.emit('likedLists-updated');
   
      } catch (error) {
         showPopupMessage(error,"popup-error");
      }
   }
 };
 /**
  * Función asíncrona para dar like a una playlist.
  * @param {string} idLista - ID de la playlist a la que se dará like.
  */

 async function fetchLikedPlaylists() {
   try {
      const response = await fetch(`https://echobeatapi.duckdns.org/playlists/liked/${email}`);
      const data = await response.json();
      likedPlaylists.value = Array.isArray(data) ? data : [data];
      console.log("Playlists con like: ", likedPlaylists.value);
   } catch (error) {
      console.error("Error al cargar liked playlists", error);
   }
 };
 /**
  * Función asíncrona para cargar las playlists guardadas.
  */
 
 // Función para cerrar el desplegable de búsqueda
 const closeSearchResults = () => {
   currentSearch.value = ''; // Limpiar la búsqueda
 };
 /**
  * Función para cerrar y limpiar los resultados de búsqueda.
  */
 
 // Agregar evento de clic global
 const handleClickOutside = (event) => {
   const clickedOutsideSearch =
     searchArea.value && !searchArea.value.contains(event.target) &&
     resultsArea.value && !resultsArea.value.contains(event.target);
 
   const clickedOutsideGender =
     genderFlyout.value && !genderFlyout.value.contains(event.target);
 
   if (clickedOutsideSearch) {
     closeSearchResults();
   }
 
   if (showGenderDropdown.value && clickedOutsideGender) {
     showGenderDropdown.value = false;
     searchOption.value = 'Todo';
     selectedGender.value = '';
   }
 };
 /**
  * Función que detecta clics fuera de los elementos de búsqueda y género,
  * y cierra el desplegable de búsqueda o género si es necesario.
  */
 
 const currentTimeNoFormat = ref(0);
 
 /**
  * @constant {Ref<number>} currentTimeNoFormat - Tiempo actual sin formatear.
  */
 
 provide('currentTimeNoFormat', currentTimeNoFormat)
 /**
  * Provee la variable currentTimeNoFormat para uso en componentes hijos.
  */
 // Registrar el evento al montar el componente
 onMounted(async () => {
   await updateQueue();
   document.addEventListener('click', handleClickOutside);
   document.addEventListener('audio-buffer-ready', bufferReady);
   window.addEventListener('beforeunload', enviarProgreso);
   
   fetchLikedPlaylists();

   emitter.on('likedLists-updated', () => {
   fetchLikedPlaylists(); // Refresca la lista de likes cuando haya cambios
   });

    if (player.value) {
       player.value.addEventListener('ended', handleSongEnded);
    }
 
     try{
 
       // Obtener generos
       const genderResponse = await fetch(`https://echobeatapi.duckdns.org/genero?userEmail=${encodeURIComponent(email)}`);
       if (!genderResponse.ok) throw new Error("Error al cargar los géneros");
 
       const data = await genderResponse.json();
       genders.value = data;
       console.log("Géneros cargados:", genders.value);
 
    } catch (error) {
       console.error('Error:', error);
    }
 });
 /**
  * Bloque onMounted:
  * - Actualiza la cola de reproducción.
  * - Registra eventos globales.
  * - Obtiene datos del usuario, la primera canción y los géneros.
  */
 
 const bufferReady = () => {
   if ( currentTimeNoFormat.value != null && player.value) {
     
     player.value.currentTime =  currentTimeNoFormat.value;
     console.log(`✅ [Seek buffer-ready] Jump a ${ currentTimeNoFormat.value}s`);
     currentTimeNoFormat.value = null;
     progress.value = (player.value.currentTime / player.value.duration) * 100;
    
   }
 };
 /**
  * Función que, al estar listo el buffer de audio, actualiza la posición actual del reproductor.
  */
 
 onBeforeUnmount(() => {
   console.log('[UNMOUNT] Componente se desmonta');
   document.removeEventListener('click', handleClickOutside);
   window.removeEventListener('beforeunload', enviarProgreso)
   emitter.off('likedLists-updated');
   if (player.value) {
      player.value.removeEventListener('ended', handleSongEnded);
   }
 
 });
 /**
  * Bloque onBeforeUnmount:
  * - Elimina los eventos registrados.
  * - Emite la actualización del progreso del audio antes de desmontar el componente.
  */
 
  function enviarProgreso() {
   if (player.value && streamerRef.value?.socket) {
     const currentTime = player.value.currentTime
     streamerRef.value.socket.emit('progressUpdate', {
       userId: email,
       songId: currentSong.value.Id,
       currentTime: currentTime,
     })
   }
 }
 
 /**
  * Funcion que actualiza el estado de la cancion actual al cerrar la pagina:
  */
 
 let lastUpdatedSecond = -1;
 let progressInterval = null;
 let contador = 1;
 /**
  * Variables para el seguimiento del progreso y control de intervalos.
  */
 
 function updateCurrentTime(event) {
    console.log("Progress:", progress.value, "CurrentTime:", event.target.currentTime);
 
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
           const currentTime = player.value.currentTime;
           //const currentTime = parseInt(event.target.currentTime.toFixed(0));
           console.log(`userId: ${email}, songId: ${currentSong.value.Id}, currentTime: ${currentTime}`) 
           streamerRef.value.socket.emit('progressUpdate', {
               userId: email,
               songId: currentSong.value.Id,
               currentTime: currentTime,
           });
 
 
           console.log(`[Progress]Progreso enviado: ${currentTime} segundos`);
         }
 
     }else{
       contador--;
     }
     
 
     console.log(`[info] Tiempo actualizado: ${currentSongTime.value}s`);
   }
 }
 /**
  * Función para actualizar el tiempo actual de la canción.
  * Calcula y actualiza el progreso y emite el progreso a través del socket.
  */
 
 const clearQueue = async () => {
    try {
       const response = await fetch('https://echobeatapi.duckdns.org/cola-reproduccion/clear', {
       method: 'POST',
       headers: {
          'Accept': '*/*', 
          'Content-Type': 'application/json',  
       },
       body: JSON.stringify({
          userEmail: email
       })
       });
 
       if (!response.ok) {
       throw new Error('Error al vaciar la cola de reproducción');
       }
 
       console.log("Cola vaciada con éxito");
 
       // // Animación antes de eliminar las canciones
       // document.querySelectorAll('.song-item').forEach((el) => {
       //    el.classList.add('fade-out');
       // });
 
       // // Espera la animación antes de limpiar la lista
       // setTimeout(() => {
       //    songs.value = [];
       // }, 500);
       
    } catch (error) {
       console.log(error.message);
    }
 }; 
 /**
  * Función asíncrona para vaciar la cola de reproducción.
  */
 
  // FUNCION updateQueue
 const updateQueue = async () => {
   try {
     const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/get-user-queue?userEmail=${encodeURIComponent(email)}`);
     if (!response.ok) throw new Error('Error al obtener la cola');
     songsData.value = await response.json();
     console.log("Cola actualizada:", songsData.value);
   } catch (error) {
     console.error('updateQueue error:', error);
   }
 };
 /**
  * Función asíncrona para actualizar la cola de reproducción del usuario.
  */
 
 // Función playFromQuest actualizada
 async function playFromQuest(song) {
    try {
       // 1️⃣ Vaciar la cola actual
       await fetch('https://echobeatapi.duckdns.org/cola-reproduccion/clear', {
          method: 'POST',
          headers: { 'Accept': '*/*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: email })
       });
 
       // 2️⃣ Añadir la nueva canción a la cola de reproducción
       const response = await fetch('https://echobeatapi.duckdns.org/cola-reproduccion/add-song-to-queue', {
          method: 'POST',
          headers: { 'Accept': '*/*', 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: email, songId: song.Id })
       });
       if (!response.ok) throw new Error('Error al añadir la canción a la cola de reproducción');
 
       // 3️⃣ Actualizar la cola global (esto refrescará el estado compartido)
       await updateQueue();
 
       // 4️⃣ Reproducir la canción
       lastSong.value = {
          name: song.Nombre,
          cover: song.Portada,
          minute: formatTime(song.Duracion),
       };
       if (streamerRef.value?.startStreamSong) {
          streamerRef.value.startStreamSong(song.Id, song.Nombre, email);
          currentSong.value = song;
          isPlaying.value = true;
       } else {
          console.warn('startStreamSong no está disponible');
       }
       
    } catch (error) {
       console.error('Error al reproducir la canción:', error);
    }
 }
 /**
  * Función asíncrona para reproducir una canción desde una búsqueda o acción externa.
  * Vacía la cola actual, añade la canción y actualiza la cola, luego reproduce la canción.
  */
 
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
       const email2 = localStorage.getItem("email")
       console.log("email:",email);
       console.log("email2:",email2);
       streamerRef.value.startStreamSong(song.Id, song.Nombre, email2);
 
       currentSong.value = song;
       isPlaying.value = true;
    } else {
       console.warn('startStreamSong no está disponible')
    }
 }
 /**
  * Función para reproducir una canción.
  * Actualiza la última canción, inicia la transmisión y cambia el estado a reproduciendo.
  */
 
 const volumeSlider = ref(null);
 /**
  * @constant {Ref<HTMLElement|null>} volumeSlider - Referencia al slider de volumen.
  */
 function setVolume(volumen) {
   if (!player.value) return
 
   const volume = Math.min(Math.max(volumen, 0), 1) // asegura valor entre 0 y 1
   player.value.volume = volume
   console.log(`[volumen] Nivel de volumen establecido: ${volume}`)
   mute.value = false;
   // Cambiar visualmente el fondo
   if (volumeSlider.value) {
     volumeSlider.value.style.backgroundSize = `${volume * 100}% 100%`;
   }
 }
 /**
  * Función para establecer el nivel de volumen.
  * @param {number} volumen - Nivel de volumen entre 0 y 1.
  */
 
 function muteVolumen(){
   player.value.volume = 0;
   mute.value = true;
 }
 /**
  * Función para silenciar el reproductor.
  */
 
 // Función para pausar/reanudar
 function togglePlay() {
   if (!player.value){
     console.warn("[player] Error con el player audio")
     return
   } 
   if (streamerRef.value?.stopCurrentStream) {
       if (isPlaying.value){
 
         currentStopTime.value = currentSongTime.value
         player.value.pause()
         isPlaying.value = false;
         console.log("stop: ", currentStopTime.value);
       } else{
         console.log("play current:", player.value.currentTime)
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
 /**
  * Función para alternar entre pausar y reanudar la reproducción.
  */
 
 const backHome = () => {
    router.push('/home');
 };
 /**
  * Función para redirigir al inicio (home).
  */
 
 function toggleMenu() {
   isMenuOpen.value = !isMenuOpen.value;
 }
 /**
  * Función para alternar la visibilidad del menú.
  */
 
 function closeMenu() {
   
   isMenuOpen.value = false;
 }
 /**
  * Función para cerrar el menú.
  */
 
 const openUser = () => {
   router.push('/user');
 };
 /**
  * Función para redirigir al perfil del usuario.
  */
 
 function formatTime(seconds) {
     let minutes = Math.floor(seconds / 60);
     let secs = seconds % 60;
     return `${minutes}:${secs.toString().padStart(2, '0')}`;
 }
 
 /**
  * Función para formatear segundos a minutos y segundos (mm:ss).
  */
  provide('formatTime', formatTime);
  /**
  * Provee la variable formatTime para uso en componentes hijos.
  */
 
 // Función para obtener la posición de los íconos en el menú
 function getIconPosition(index, total) {
   const angle = (index / (total - 1)) * (Math.PI / 2);
   const radius = 120;
   const x = Math.cos(angle) * radius;
   const y = Math.sin(angle) * radius;
   return { transform: `translate(${x}px, ${y}px)` };
 }
 /**
  * Función para calcular la posición de un ícono en un menú circular.
  * @param {number} index - Índice del ícono.
  * @param {number} total - Número total de íconos.
  * @returns {object} - Objeto con propiedad transform para posicionar el ícono.
  */
 
 // Búsqueda
 const fetchResults = async () => {
    
    if (!currentSearch.value.trim()) {
       results.value = { artistas: [], canciones: [], albums: [], playlists: [], playlistsProtegidasDeAmigos: [], playlistsPorGenero: [] };
       return;
    }
 
    isLoading.value = true;
    console.log("Texto de búsqueda:", currentSearch.value);
    console.log("Filtro seleccionado:", searchOption.value);
 
    try { 
       // Convertir "Todo" en un valor vacío para que la API devuelva todos los resultados
       const tipo = searchOption.value === "Todo" ? "" : searchOption.value;
       currentNick.value =  localStorage.getItem("Nick");
       const response = await fetch(`https://echobeatapi.duckdns.org/search/?Búsqueda=${encodeURIComponent(currentSearch.value)}&usuarioNick=${currentNick.value}&tipo=${encodeURIComponent(tipo)}`);
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
 /**
  * Función asíncrona para realizar búsquedas.
  * Realiza una petición a la API con el término y el filtro de búsqueda, y actualiza los resultados.
  */
 
 function seekAudio(event) {
   const newProgress = event.target.value;
   if (!player.value || !player.value.duration) return;
 
   // Calcular el nuevo tiempo en segundos
   const newTime = (newProgress / 100) * player.value.duration;
 
   // Establecer el nuevo tiempo en el reproductor
   player.value.currentTime = newTime;
 
   // Actualizar la variable reactiva para reflejar el nuevo tiempo
   currentSongTime.value = formatTime(Math.floor(newTime));
 
   console.log(`[Seek] Nueva posición: ${newTime} segundos`);
 }
 /**
  * Función para buscar en el audio.
  * Calcula y establece una nueva posición en la reproducción basándose en el progreso de la barra.
  */
 
 // Función para redirigir al perfil del artista
 const goToArtistProfile = (artistName) => {
   router.push(`/artist/${artistName}`);
 };
 /**
  * Función para redirigir al perfil de un artista.
  * @param {string} artistName - Nombre del artista.
  */
 
 </script>
 
 
 <style scoped>
 
 /* Fondo negro */
 .container {
   width: 100vw;
   height: 100vh;
   background: linear-gradient(180deg, #141414 15%, #4a1e04 40%, #8a3a10 60%, #ffb347 100%);
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
   cursor: pointer;
 }
 
 .logo:hover {
    transform: scale(1.2);
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
   cursor: pointer;
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
 
 .side-buttons {
   flex-grow: 0; /* Espaciado equitativo */
   display: flex;
   justify-content: center;
   flex: none; 
 }
 
 .loop-active {
   border: 2px solid #ff474d;
   border-radius: 50%; /* Hace que el borde sea redondeado */
   background-color: rgba(255, 99, 71, 0.1); /* Fondo semitransparente */
   transform: scale(1.1);
 }
 
 .loop-active:hover {
   background-color: rgba(255, 99, 71, 0.2); /* Cambio de fondo al pasar el ratón */
 }
 
 .play-button {
   flex-grow: 0;
   transform: scale(1.2); /* Aumenta el tamaño del botón central */
   justify-content: center;
   flex: none; 
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
 
 .song-name {
   color: white;
 }
 
 .bottom-bar {
   position: fixed;
   bottom: 0;
   left: 0;
   right: 0;
   display: flex;
   justify-content: space-between;
   align-items: center;
   height:12vh; /* Aumenta la altura para acomodar los controles */
   padding: 0 16px;
   background-color: #111;
   box-shadow: 0px -7px 6px rgba(1, 1, 1, 0.6);
   z-index: 999;
 }
 
 .now-playing {
   display: flex;
   align-items: center;
   gap: 12px;
   flex: 1;
   min-width: 200px;
 }
 
 .now-playing img {
    width: 72px;
   height: 72px;
   object-fit: cover;
   border-radius: 4px;
 }
 
 .track-info {
   display: flex;
   flex-direction: column;
   justify-content: center;
 }
 
 .track-title {
   font-size: 14px;
   font-weight: 600;
 }
 
 .track-artist {
   font-size: 12px;
   color: #b3b3b3;
 }
 
 .green {
   color: #1ed760;
 }
 
 .controls {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 2px;
   flex: 2;
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
 
 .buttons {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 0.5rem;
   justify-self: end; /* pegado a la derecha */
   margin: auto;
 }
 
 .play-btn {
   width: 32px;
   height: 32px;
   border-radius: 50%;
   background-color: #fff;
   display: flex;
   align-items: center;
   justify-content: center;
   color: black;
 }
 
 .progress {
   display: flex;
   align-items: center;
   gap: 8px;
   width: 100%;
   max-width: 500px;
 }
 
 .progress input[type="range"] {
   flex: 1;
   height: 4px;
   appearance: none;
   background-color: #404040;
   border-radius: 2px;
   outline: none;
   background-image: linear-gradient(#fff, #fff);
   background-repeat: no-repeat;
   background-size: 70% 100%;
 }
 
 .progress .bar {
   flex: 1;
   height: 4px;
   background-color: #404040;
   border-radius: 2px;
   overflow: hidden;
 }
 
 .progress .fill {
   width: 70%;
   height: 100%;
   background-color: #fff;
 }
 
 .time {
   font-size: 11px;
   color: #b3b3b3;
 }
 
 .extras {
   display: flex;
   align-items: center;
   gap: 16px;
   flex: 1;
   justify-content: flex-end;
   
 }
 
 .volume-wrapper {
   display: flex;
   align-items: center;
   gap: 8px;
   position: relative;
 }
 
 .volume-wrapper i {
   cursor: pointer;
   font-size: 16px;
   color: #b3b3b3;
   transition: color 0.3s ease;
 }
 
 .volume-wrapper i:hover {
   color: #1ed760;
 }
 
 .volume-slider {
   right: 0;
   width: 100px;
   height: 4px;
   appearance: none;
   background: #404040;
   border-radius: 2px;
   outline: none;
   background-image: linear-gradient(#fff, #fff);
   background-repeat: no-repeat;
   transition: opacity 0.3s ease, transform 0.3s ease;
   transform-origin: top right;
   z-index: 10;
 }
 
 /* Estilo del thumb */
 .volume-slider::-webkit-slider-thumb {
   appearance: none;
   width: 12px;
   height: 12px;
   border-radius: 50%;
   background: #fff;
   cursor: pointer;
   border: none;
 }
 
 .volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: none;
 }
 
 /* Transiciones fade volumen */
 .fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
 }
 .fade-enter-from, .fade-leave-to {
    opacity: 0;
 }
 /* like album*/
 
 .like-hover {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
 }
 
 .select-wrapper {
    position: relative;
    display: inline-block;
 }
 
 .gender-flyout {
    position: absolute;
    top: 0;
    left: 110%;
    background-color: #222; /* Fondo oscuro */
    border: 1px solid #444; /* Borde tenue */
    padding: 12px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    z-index: 10;
    min-width: 180px;
    color: #fff;
    white-space: nowrap;
 }
 
 .gender-title {
    font-weight: bold;
    font-size: 14px;
    color: #ffb347; /* Naranja para destacar */
    margin-bottom: 10px;
 }
 
 .gender-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 5px;
 }
 
 .gender-btn {
    padding: 6px 12px;
    background-color: #333;
    border: 1px solid #555;
    border-radius: 20px;
    color: white;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
 }
 
 .gender-btn:hover {
    background-color: #555;
    transform: scale(1.05);
 }
 
 /* Responsivo */
 @media (max-width: 600px) {
    .gender-flyout {
       position: static;
       margin-top: 10px;
       left: 0;
    }
 
    .gender-list {
       flex-direction: row;
       flex-wrap: wrap;
       gap: 10px;
    }
 }
 
 .gender-btn.active {
    background-color: #ffb347;
    color: #000;
    font-weight: bold;
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
 