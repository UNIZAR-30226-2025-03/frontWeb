<template>
   <div class="layout">
     <div class="playlist-container">
       <div class="back-btn-container">
          <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
       </div>
       <div class="playlist-header">
         <img :src="favs_cover" alt="Playlist" @error="handleImageError($event)">
         <div class="playlist-info">
           <h1>Favoritos</h1>
         </div>
 
       </div>
 
       <div class="song-container">
         <div class="playlist-actions">
            <button class="button-action tooltip-container" @click="randomClick">
               <img :src="randomIcon" alt="Aleatorio" :class="{ 'glow-effect': isGlowing }" />
               <span class="tooltip">Reproducción aleatoria</span>
            </button>

             <input v-model="searchTerm" placeholder="Buscar canción" />

             <button ref="addButtonRef" class="button-action tooltip-container" @click="toggleSearch">
               <img :src="add_button" alt="Añadir" />
               <span class="tooltip">Añadir canciones</span>
            </button>

             <button class="button-action tooltip-container" @click="playPlaylist">
               <img :src="playIcon" alt="Reproducir" />
               <span class="tooltip">Reproducir</span>
            </button>
 
             <!-- El contenedor para el buscador -->
             <div v-if="searchVisible" ref="searchContainerRef" class="search-container" :class="{'active': searchVisible}">
                <input type="text" placeholder="Buscar canción..." v-model="currentSearch" @input="fetchResults"/>
                <div class="search-results" v-if="currentSearch && !isLoading">
                   <div v-if="results?.canciones.length">
                      <div v-for="cancion in results.canciones" :key="cancion.Nombre" class="result-item" @mouseover="hoveredSong = cancion.Nombre" @mouseleave="hoveredSong = null">
                         <img :src="cancion.Portada || 'ruta/a/imagen/default.jpg'" alt="Canción" />
                         <div class="song-quest-info">
                           <div class="song-text">
                              <span>{{ cancion.Nombre }} ({{ formatTime(cancion.Duracion) }})</span>
                              <span class="song-name-artist">{{ cancion.Autor }}</span>
                           </div>
                            <!-- Botón para agregar la canción seleccionada -->
                            <button class="addButton" v-if="hoveredSong === cancion.Nombre" @click="addSong(cancion)">Añadir</button>
                         </div>
                      </div>
                   </div>
 
                   <div v-else class="no-results">
                      ❌ Sin resultados
                   </div>
                </div>
             </div>
         </div>
 
         <hr>
 
         <draggable :list="filteredPlaylist" tag="ul" class="song-list" item-key="id" animation="200" ghost-class="drag-ghost">
           <template #item="{ element, index }">
             <li class="song-item" :key="element.id || index">
               <div class="song-info">
                 <div class="song-cover">
                   <img :src="element.portada" :alt="element.nombre" @error="handleImageError($event)" />
                 </div>
 
                 <div class="song-name-artista">
                  <p class="song-title">{{ element.nombre }} <span class="duration">({{ formatTime(element.duracion) }})</span></p>
                  <p class="song-author">{{ element.Autor }}</p>
                </div>
 
                 <div class="song-album">
                   <p v-if="playlistInfo.type === 'playlist'">Álbum: {{ element.album }}</p>
                 </div>
 
                 <div class="song-plays">
                   <p>Reproducciones: {{ element.numReproducciones }}</p>
                 </div>
 
                 <div class="song-buttons">
                   <button @click="playNewSong(element,index)">▶️</button>
                   <button @click="removeSong(element.id)">🗑️</button>
                 </div>
               </div>
             </li>
           </template>
         </draggable>
         <p v-if="!loading && songsData.length === 0" class="empty-message">
            Todavía no hay ninguna canción guardada. Haz click en el botón de "Añadir canciones" para agregar alguna
         </p>
       </div>
    </div>
     <div v-if="showPopup" :class="popupType" class="popup">
          {{ popupMessage }}
     </div>
   </div>
</template>
 
  
<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { emitter } from '@/js/event-bus';
import draggable from 'vuedraggable';
import randomIcon from '@/assets/random-button.png';
import default_img from '@/assets/kebab.jpg';
import add_button from '@/assets/add_circle.svg';
import pauseIcon from '@/assets/pause-circle.svg';
import playIcon from '@/assets/play-circle.svg';
import favs_cover from '@/assets/favoritos-cover.jpg';

/**
 * Función inyectada para reproducir canciones.
 * Se espera que el componente padre provea esta función a través de la inyección de dependencias.
 * @type {Function}
 */
const playSong = inject('playSong');

/**
 * Estado reactivo que controla el efecto visual del botón aleatorio.
 * @type {Ref<boolean>}
 */
const isGlowing = ref(false);

/**
 * Instancia del router para navegación programática.
 * @type {object}
 */
const router = useRouter();

/**
 * Estado reactivo que controla la visibilidad del menú de búsqueda.
 * @type {Ref<boolean>}
 */
const searchVisible = ref(false);

/**
 * Referencia al contenedor del menú de búsqueda.
 * @type {Ref<HTMLElement|null>}
 */
const searchContainerRef = ref(null);

/**
 * Referencia al botón de añadir, usado para detectar clics fuera del menú.
 * @type {Ref<HTMLElement|null>}
 */
const addButtonRef = ref(null);

/**
 * Estado reactivo que almacena el texto actual de búsqueda.
 * @type {Ref<string>}
 */
const currentSearch = ref('');

 /**
  * Estado reactivo que indica si los resultados de búsqueda están cargando.
  * @type {Ref<boolean>}
  */
const isLoading = ref(false);

/**
 * Estado reactivo para almacenar la canción sobre la que se pasa el cursor.
 * @type {Ref<any>}
 */
const hoveredSong = ref(null);

/**
 * Email del usuario obtenido del localStorage.
 * @type {string|null}
 */
const email = localStorage.getItem("email");

/**
 * Estado reactivo que indica si la reproducción debe ser aleatoria.
 * @type {Ref<boolean>}
 */
const aleatorio = ref(false);

/**
 * Estado reactivo que controla la carga de los datos.
 * @type {Ref<boolean>}
 */
 const loading = ref(true);

/**
 * Estado reactivo que controla la visibilidad del popup.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo que almacena el mensaje que se mostrará en el popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo que define el tipo de popup ("popup-error" o "popup-success").
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/**
 * Estado reactivo que almacenará los datos de las canciones.
 * @type {Ref<any>}
 */
const songsData = ref('');


/**
 * Función para mostrar un popup con mensaje y tipo específico.
 * El popup se cierra automáticamente después de 3 segundos.
 *
 * @param {string} message - Mensaje a mostrar.
 * @param {string} type - Tipo de popup ("popup-error" o "popup-success").
 */
const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
      showPopup.value = false;
   }, 3000); // Cierra el popup después de 3 segundos
};

/**
 * Computed que filtra la playlist según el término de búsqueda ingresado.
 * Si el campo de búsqueda está vacío, devuelve toda la playlist.
 *
 * @returns {Array} La lista filtrada de canciones.
 */
const filteredPlaylist = computed(() => {
   if (!searchTerm.value.trim()) {
      return playlist.value; // Sin búsqueda, muestra toda la playlist
   }
   return playlist.value.filter(song =>
      song.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
   );
});

/**
 * Función para navegar hacia la página anterior en el historial del navegador.
 */
const goBack = () => {
   router.back();
};

/**
 * Función para alternar la visibilidad del menú de búsqueda.
 */
const toggleSearch = () => {
   searchVisible.value = !searchVisible.value;
};

/**
 * Objeto de la ruta actual, obteniendo parámetros de la URL.
 * @type {object}
 */
const route = useRoute();

/**
 * Identificador de la playlist obtenido del query de la URL.
 * @type {string}
 */
const Id = route.query.id;
console.log('ID de la playlist:', Id);

/**
 * Objeto reactivo que almacena la información de la playlist.
 * Inicializado como objeto vacío.
 * @type {Ref<object>}
 */
const playlistInfo = ref({});

/**
 * Array reactivo que almacena las canciones de la playlist.
 * Inicializado como array vacío.
 * @type {Ref<Array>}
 */
const playlist = ref([]);

/**
 * Estado reactivo para el término de búsqueda específico de la playlist.
 * @type {Ref<string>}
 */
const searchTerm = ref('');

/**
 * @constant {Ref<string>} currentNick - Apodo actual del usuario.
 */
 const currentNick = ref('');

/**
 * Estado reactivo para almacenar la opción de ordenamiento de canciones.
 * @type {Ref<string>}
 */
const sortOption = ref('default');

/**
 * Objeto reactivo que almacena los resultados de búsqueda agrupados por categoría.
 * @type {Ref<{ artistas: Array, canciones: Array, albums: Array, listas: Array }>}
 */
const results = ref({
   artistas: [],
   canciones: [],
   albums: [],
   listas: []
});

/**
 * Función asíncrona para reproducir una nueva canción.
 * Envía una petición a la API para reproducir la playlist a partir de una posición dada, 
 * y luego reproduce la nueva canción usando la función inyectada playSong.
 *
 * @async
 * @param {object} song - Objeto de la canción a reproducir.
 * @param {number} posicion - Posición en la cola de reproducción.
 * @throws {Error} Si falla la petición a la API.
 */
const playNewSong = async (song, posicion) => {
   console.log("cancionid:", song);
   console.log("posicion:", posicion);

   const newSong = {
      Id: song.id,
      Nombre: song.nombre,
      Portada: song.portada,
      Duracion: song.duracion,
      Autor: song.Autor
   };

   console.log(newSong);
   const colaSinAutor = songsData.value.map(({ Autor, ...rest }) => rest);
   const bodyData = {
      userEmail: email,
      reproduccionAleatoria: aleatorio.value,
      posicionCola: posicion,
      colaReproduccion: {
         canciones: colaSinAutor
      } 
   };

   console.log("JSON enviado:", bodyData);

   const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/play-list-by-position`, {
      method: 'POST',
      headers: {
         'Accept': '*/*', 
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData)
   });

   if (!response.ok) {
      throw new Error('Error al reproducir playlist');
   }
   const playlistResponse = await response.json();
   console.log("playlist response: ", playlistResponse);

   playSong(newSong);
};

/**
 * Función que oculta el menú de búsqueda si se detecta un clic fuera del contenedor del menú
 * y fuera del botón de añadir.
 *
 * @param {Event} event - Evento de clic.
 */
const handleClickOutside = (event) => {
   // Si el clic es fuera del contenedor del menú de búsqueda y del botón "añadir", se oculta el menú.
   if (
      searchContainerRef.value && 
      !searchContainerRef.value.contains(event.target) && 
      !addButtonRef.value.contains(event.target)
   ) {
      searchVisible.value = false; // Oculta el menú desplegable
   }
};

/**
 * Función asíncrona para obtener las canciones favoritas del usuario.
 * Realiza una petición a la API y actualiza el estado reactivo "songsData" y "playlist".
 *
 * @async
 * @throws {Error} Si la petición a la API falla.
 */
 async function fetchFavourites() {
   try {
      // OBTENER CANCIONES FAVORITAS
      const songsResponse = await fetch(`https://echobeatapi.duckdns.org/cancion/favorites?email=${encodeURIComponent(email)}`);
      if (!songsResponse.ok) throw new Error('Error al obtener las canciones de la playlist');
   
      songsData.value = await songsResponse.json();
      console.log("✅ Canciones favoritas: ", songsData.value);
   
      // VERIFICAR SI LOS DATOS ESTÁN BIEN FORMATEADOS
      if (!songsData.value || !Array.isArray(songsData.value.canciones)) {
         throw new Error('Las canciones no llegaron en formato de array');
      }
 
      const rawSongs = songsData.value.canciones;
      const cancionesConAutores = [];
      for (const song of rawSongs) {
         try {
            const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${song.id}`);
            if (!songsResponse.ok) {
               console.error(`Error al obtener datos de la canción ${song.Id}`);
               continue;
            }
            const songsResponseData = await songsResponse.json();
            cancionesConAutores.push({
               ...song,
               Autor: songsResponseData.Autores.join(', '),
            });
         } catch (err) {
            console.error('Error al procesar canción:', err);
         }
      }
      songsData.value = cancionesConAutores;
      console.log("🕵️‍♂️ Canciones actualizadas:", songsData.value);
      // ASIGNAR LAS CANCIONES A `playlist`
      playlist.value = songsData.value;
      console.log("✅ Playlist final cargada:", playlist.value);
   } catch (error) {
      console.error('Error al cargar la playlist:', error);
   } finally {
      loading.value = false; 
   }
}

/**
 * Hook de ciclo de vida: onMounted.
 * Se ejecuta cuando el componente se ha montado y realiza lo siguiente:
 * - Solicita las canciones favoritas del usuario desde la API.
 * - Verifica el formato de los datos recibidos.
 * - Asigna la lista de canciones a la playlist.
 *
 * @async
 */
onMounted(async () => {
   fetchFavourites();
   emitter.on('FavoriteSongs-updated', () => {
      fetchFavourites(); // Vuelve a cargar los favoritos cuando hay un cambio
   });

});

/**
 * Hook de ciclo de vida: onMounted.
 * Añade un listener al documento para detectar clics fuera del menú de búsqueda.
 */
onMounted(() => {
   document.addEventListener('click', handleClickOutside);
});

/**
 * Hook de ciclo de vida: onUnmounted.
 * Se ejecuta cuando el componente se desmonte.
 * Remueve el listener del evento 'click' para evitar memory leaks.
 */
onUnmounted(() => {
   console.log("Saliendo de la página...");
   document.removeEventListener('click', handleClickOutside);
   emitter.off('FavoriteSongs-updated'); // Limpia el listener
});

/**
 * Función para manejar errores al cargar imágenes.
 * Si ocurre un error al cargar una imagen, se sustituye por una imagen predeterminada.
 *
 * @param {Event} event - Evento de error en la carga de imagen.
 */
const handleImageError = (event) => {
   event.target.src = default_img; // Reemplaza la imagen con la predeterminada
};

/**
 * Función que gestiona el clic en el botón aleatorio.
 * Alterna el efecto visual y la bandera de reproducción aleatoria.
 */
const randomClick = () => {
   isGlowing.value = !isGlowing.value;
   aleatorio.value = !aleatorio.value;
};

/**
 * Función auxiliar para formatear el tiempo (segundos) a formato "MM:SS".
 *
 * @param {number} seconds - Tiempo en segundos.
 * @returns {string} Tiempo formateado.
 */
function formatTime(seconds) {
   let minutes = Math.floor(seconds / 60);
   let secs = seconds % 60;
   return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Función asíncrona para reproducir la playlist completa.
 * Realiza una petición a la API con los detalles de la cola de reproducción,
 * y luego reproduce la primera canción de la lista.
 *
 * @async
 * @throws {Error} Si la petición a la API falla.
 */
const playPlaylist = async () => {
   const colaSinAutor = songsData.value.map(({ Autor, ...rest }) => rest);
   try {
      const bodyData = {
         userEmail: email,
         reproduccionAleatoria: aleatorio.value,
         colaReproduccion: {
            canciones: colaSinAutor
         }
      };

      console.log("JSON enviado:", bodyData);

      const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/play-list`, {
         method: 'POST',
         headers: {
            'Accept': '*/*', 
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
         throw new Error('Error al reproducir playlist');
      }
      const playlistResponse = await response.json();
      console.log("playlist response: ", playlistResponse);

      const song = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${playlistResponse.primeraCancionId}`);

      if (!song.ok) {
         throw new Error('Error al reproducir la canción ');
      }
      const songData = await song.json();
      const newSong = {
         Id: playlistResponse.primeraCancionId,
         Nombre: songData.Nombre,
         Portada: songData.Portada,
         Duracion: songData.Duracion,
         Autor: songData.Autores.join(', '),
      };
      playSong(newSong);
      emitter.emit('random-changed', aleatorio.value);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para añadir una canción a la playlist de favoritos.
 * Envía una petición POST a la API, y si es exitosa, añade la canción al array local de la playlist.
 *
 * @async
 * @param {object} song - Objeto de la canción a añadir.
 * @throws {Error} Si falla la petición a la API.
 */
const addSong = async (song) => {
   try {
      console.log("Email: ", email);
      console.log("Id canción: ", song.Id);
      const response = await fetch(`https://echobeatapi.duckdns.org/cancion/like/${email}/${song.Id}`, {
         method: 'POST',
         headers: {
            'Accept': '*/*',
         },
      });
   
      if (!response.ok) {
         throw new Error('Error al añadir canción a favoritos');
      }
   
      showPopupMessage("Canción añadida a favoritos con éxito", "popup-success");
      const newSong = {
         id: song.Id,
         nombre: song.Nombre,
         portada: song.Portada,
         duracion: song.Duracion,
         numReproducciones: song.NumReproducciones
      };
      playlist.value = [...playlist.value, newSong];
      console.log('valor canciones playlist', playlist.value);
      emitter.emit('FavoriteSongs-updated');
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para eliminar una canción de la playlist de favoritos.
 * Envía una petición DELETE a la API, y si la eliminación es exitosa, elimina la canción del array local.
 *
 * @async
 * @param {string} songId - ID de la canción a eliminar.
 * @throws {Error} Si falla la petición a la API.
 */
const removeSong = async (songId) => {
   try {
      console.log("Email: ", email);
      console.log("Id canción: ", songId);
      const response = await fetch(`https://echobeatapi.duckdns.org/cancion/unlike/${email}/${songId}`, {
         method: 'DELETE',
         headers: {
            'Accept': '*/*',
         },
      });

      if (!response.ok) {
         throw new Error('Error al eliminar la canción de favoritos');
      }
      // Elimina la canción del array local si la eliminación es exitosa.
      playlist.value = playlist.value.filter(song => song.id !== songId);
      emitter.emit('FavoriteSongs-updated');
      showPopupMessage("Canción eliminada con éxito", "popup-success");
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};


/**
 * Función asíncrona para obtener resultados de búsqueda para canciones.
 * Si el campo de búsqueda está vacío, resetea los resultados de canciones.
 * Realiza una petición a la API y actualiza el estado reactivo "results".
 *
 * @async
 */
const fetchResults = async () => {
   if (!currentSearch.value.trim()) {
      results.value.canciones = [];
      return;
   }

   isLoading.value = true;
   console.log("Texto de búsqueda:", currentSearch.value);
   currentNick.value =  localStorage.getItem("Nick");
   try {
      const response = await fetch(`https://echobeatapi.duckdns.org/search/?Búsqueda=${encodeURIComponent(currentSearch.value)}&usuarioNick=${currentNick.value}&tipo=canciones`);
      if (!response.ok) throw new Error('Error al obtener los datos de búsqueda');

      results.value = await response.json();
      console.log("Respuesta de la API:", results.value);
      const rawSongs = results.value.canciones;
      const cancionesConAutores = [];
      for (const song of rawSongs) {
         try {
            const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${song.Id}`);
            if (!songsResponse.ok) {
               console.error(`Error al obtener datos de la canción ${song.Id}`);
               continue;
            }
            const songsResponseData = await songsResponse.json();
            cancionesConAutores.push({
               ...song,
               Autor: songsResponseData.Autores.join(', '),
            });
         } catch (err) {
            console.error('Error al procesar canción:', err);
         }
      }
      results.value.canciones = cancionesConAutores;
      console.log("🕵️‍♂️ Canciones actualizadas:", results.value.canciones);
   } catch (error) {
      console.error('Error:', error);
   } finally {
      isLoading.value = false;
   }
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
   border: 1px solid #ccc; 
}

.playlist-actions input::placeholder {
   color: white; /* Color del placeholder dorado para mejor visibilidad */
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
   filter: brightness(0) invert(1);
}
 
.button-action:hover img {
   transform: scale(1.2);
   transition: transform 0.2s ease-in-out;
}

.filterSelect {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #8A3A1B;
  color: #ffffff;
  font-size: 13px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: border-color 0.3s ease;
}

.filterSelect:hover {
  border-color: #888;
}

.filterSelect:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.filterSelect option {
  background-color: #1e1e1e;
  color: #fff;
}

.select-wrapper {
  position: relative;
  display: inline-block;
}

.select-wrapper::after {
  content: "▼";
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #aaa;
}

.tooltip-container {
   position: relative;
   display: inline-block;
}

.tooltip {
   visibility: hidden;
   width: max-content;
   background-color: #333;
   color: #fff;
   text-align: center;
   border-radius: 5px;
   padding: 6px 10px;
   position: absolute;
   z-index: 1;
   bottom: 125%; /* Sitúa el tooltip arriba del botón */
   left: 50%;
   transform: translateX(-50%);
   opacity: 0;
   transition: opacity 0.3s;
   white-space: nowrap;
   font-size: 0.75rem;
   pointer-events: none;
}

.tooltip::after {
   content: "";
   position: absolute;
   top: 100%; /* Flecha hacia abajo */
   left: 50%;
   margin-left: -5px;
   border-width: 5px;
   border-style: solid;
   border-color: #333 transparent transparent transparent;
}

.tooltip-container:hover .tooltip {
   visibility: visible;
   opacity: 1;
}

@keyframes glowPulse {
   0% { filter: drop-shadow(0px 0px 8px rgba(20, 18, 166, 0.888)); }
   50% { filter: drop-shadow(0px 0px 15px rgba(255, 215, 0, 1)); }
   100% { filter: drop-shadow(0px 0px 8px rgba(255, 215, 0, 0.8)); }
}

.glow-effect {
   animation: glowPulse 1.5s infinite alternate ease-in-out;
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

.song-name-artista,
.song-album,
.song-plays,
.song-buttons {
   width: 22%;
   text-align: center;  
}

.song-text {
  display: flex;
  flex-direction: column; 
  overflow: hidden;
}

.song-name {
  color: white;
  white-space: normal;
  word-break: break-word;
  max-width: 250px;
  font-weight: 600;
}

.song-name-artist {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
  margin-top: 2px;
}

.song-name-artista {
   padding-top: 8px;
}

.song-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.duration {
  font-weight: 450;
  font-size: 0.9rem;
  color: #666;
}

.song-author {
  font-size: 0.85rem;
  color: #888;
  margin-top: 6px;
  font-style: italic;
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

.back-btn-container {
   position: absolute;
   top: 10vh;
   left: 1vw;
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

/* Contenedor del buscador */
.search-container {
   opacity: 0;
   transform: translateY(-20px);
   transition: opacity 0.3s ease, transform 0.3s ease;
   z-index: 999;
}

.search-container input {
   padding: 8px;
   font-size: 16px;
   width: 415px; 
}

/* Aparece cuando el buscador está visible */
.search-container.active {
   opacity: 1;
   transform: translateY(0);
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
   max-height: 275px;
   overflow-y: auto;
   z-index: 10000;
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
 
.addButton {
   background-color: #ffb347; /* Naranja brillante */
   color: white;
   padding: 10px 10px;
   border-radius: 8px;
   font-weight: bold;
   border: none;
   cursor: pointer;
   transition: all 0.3s ease;
   display: flex;
   align-items: center;
   justify-content: center;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
 
.addButton:hover {
   background-color: #e68a00; /* Naranja más oscuro */
   transform: scale(1.05);
}
 
.addButton:focus {
   outline: none;
   box-shadow: 0 0 8px rgba(255, 165, 0, 0.7);
}

.empty-message {
  text-align: center;
  margin-top: 40px;
  font-size: 1.1rem;
  color: #eee;
  opacity: 0.8;
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
  