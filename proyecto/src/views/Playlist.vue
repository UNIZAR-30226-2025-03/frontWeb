<template>
  <div class="layout">
    <div class="playlist-container">
      <div class="back-btn-container">
         <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
      </div>
      <div class="playlist-header">
         <div class="image-container" @mouseover="showEditOverlay = true && type === 'ListaReproduccion' " @mouseleave="showEditOverlay = false && type === 'ListaReproduccion'" >
            <img :src="previewImageUrl || playlistInfo.Portada" alt="Playlist" @error="handleImageError($event)">
            <div v-if="showEditOverlay" class="edit-overlay">
               <button v-if="type === 'ListaReproduccion'" @click="triggerFileInput">Subir Imagen</button>
               <button v-if="type === 'ListaReproduccion'" @click="profileAction = 'select'">Elegir predeterminada</button>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" @change="handleFileUpload" style="display: none;" />
         </div>
         <div class="playlist-info">
            <h1>{{ playlistInfo.Nombre }}</h1>
            <p>{{ playlistInfo.NumCanciones }} canciones</p>
            <p>{{ playlistInfo.Descripcion }}</p>
            <p>{{ playlistInfo.NumLikes }} Likes</p>
         </div>
      </div>
      <div v-if="profileAction === 'select'" class="image-selection-modal">
         <h3>Selecciona una imagen</h3>
         <div class="image-grid">
            <img 
               v-for="image in defaultImages" :key="image" :src="image" @click="selectDefaultImage(image)" class="selectable-image"
            />
         </div>
         <button class="close-btn" @click="closeImageSelection">Cerrar</button>
      </div>

      <div class="song-container">
        <div class="playlist-actions">
            <button class="button-action" @click="deletePlaylist" v-if="type === 'ListaReproduccion'" >
               <img :src="deleteIcon" alt="delete"/>
            </button>
            <button class="button-action" @click="randomClick">
               <img :src="randomIcon" alt="random" :class="{ 'glow-effect': isGlowing }" />
            </button>
            <input v-model="searchTerm" placeholder="Buscar canción" />

            <button ref="addButtonRef" class="button-action" @click="toggleSearch"  v-if="type === 'ListaReproduccion'" >
            
               <img :src="add_button" alt="add"/>
            </button>
            <button @click="playPlaylist" class="button-action">  
               <img :src= "playIcon" alt="Play/Pause" />
            </button>

            <!-- El contenedor para el buscador -->
            <div v-if="searchVisible" ref="searchContainerRef" class="search-container" :class="{'active': searchVisible}">
               <input type="text" placeholder="Buscar canción..." v-model="currentSearch" @input="fetchResults"/>
               <div class="search-results" v-if="currentSearch && !isLoading">
                  <div v-if="results?.canciones.length">
                     <div v-for="cancion in results.canciones" :key="cancion.Nombre" class="result-item" @mouseover="hoveredSong = cancion.Nombre" @mouseleave="hoveredSong = null">
                        <img :src="cancion.Portada || 'ruta/a/imagen/default.jpg'" alt="Canción" />
                        <div class="song-quest-info">
                           <span>{{ cancion.Nombre }} ({{ formatTime(cancion.Duracion) }})</span>
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

                <div class="song-name-artist">
                  <p>{{ element.nombre }} ({{ formatTime(element.duracion) }})</p>
                </div>

                <div class="song-album">
                  <p v-if="playlistInfo.type === 'playlist'">Álbum: {{ element.album }}</p>
                </div>

                <div class="song-plays">
                  <p>Reproducciones: {{ element.numReproducciones }}</p>
                </div>

                <div class="song-buttons">
                  <button @click="addSongToFavorites(element)">❤️</button>
                  <button @click="playNewSong(element,index)">▶️</button>
                  <button @click="removeSong(element.id)"  v-if="type === 'ListaReproduccion'" >🗑️</button>

                </div>
              </div>
            </li>
          </template>
        </draggable>
      </div>
   </div>
    <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
    </div>
  </div>
</template>

 
<script setup>
import { ref, onMounted, onUnmounted, inject, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import randomIcon from '@/assets/random-button.png';
import default_img from '@/assets/kebab.jpg';
import add_button from '@/assets/add_circle.svg';
import pauseIcon from '@/assets/pause-circle.svg';
import playIcon from '@/assets/play-circle.svg';
import deleteIcon from '@/assets/delete.svg';

const playSong = inject('playSong')
const type = localStorage.getItem("type")
localStorage.removeItem("type");
// Variables para CSS y HTML
const isGlowing = ref(false);
const router = useRouter();
const searchVisible = ref(false);
const searchContainerRef = ref(null); // Referencia al contenedor del menú de búsqueda
const addButtonRef = ref(null); 
const currentSearch = ref('');
const isLoading = ref(false);
const hoveredSong = ref(null);

const email = localStorage.getItem("email");
const aleatorio = ref(false);
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("popup-error");
const songsData = ref('');

const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
      showPopup.value = false;
   }, 3000); // Cierra el popup después de 3 segundos
};

const filteredPlaylist = computed(() => {
   if (!searchTerm.value.trim()) {
      return playlist.value; // Si no hay búsqueda, mostrar toda la playlist
   }

   return playlist.value.filter(song =>
      song.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
   );
});

const route = useRoute();
const Id = route.query.id;

console.log('ID de la playlist:', Id);
console.log('Type de la playlist:', type);

const playlistInfo = ref({}); // Inicializado como objeto vacío
const playlist = ref([]); // Inicializado como array vacío
const searchTerm = ref('');
const showEditOverlay = ref(false);
const fileInputRef = ref(null);
const previewImageUrl = ref(null);
const defaultImages = ref([]);
const profileAction = ref(null);


const results = ref({
   artistas: [],
   canciones: [],
   albums: [],
   listas: []
});

const goBack = () => {
   router.back();
};

// Toggle para mostrar/ocultar el buscador
const toggleSearch = () => {
   searchVisible.value = !searchVisible.value;
};

watch(() => route.query.id, async (newId, oldId) => {
   if (!newId || newId === oldId) return;

   try {
      // OBTENER INFO DE LA PLAYLIST
      const infoResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/lista/${newId}`);
      if (!infoResponse.ok) throw new Error('Error al obtener la información de la playlist');

      playlistInfo.value = await infoResponse.json();

      // OBTENER CANCIONES DE LA PLAYLIST
      const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/${newId}/songs`);
      if (!songsResponse.ok) throw new Error('Error al obtener las canciones de la playlist');

      songsData.value = await songsResponse.json();

      if (!songsData.value || !Array.isArray(songsData.value.canciones)) {
         throw new Error('Las canciones no llegaron en formato de array');
      }

      playlist.value = songsData.value.canciones;
      searchTerm.value = ''; // Resetea la búsqueda
   } catch (error) {
      console.error('Error al actualizar la playlist:', error);
   }
});

// Función para seleccionar una imagen predeterminada
const selectDefaultImage = (image) => {
   updateImage(image);
   previewImageUrl.value = image;
   profileAction.value = ''; // Vuelve a la opción de 'Subir nueva imagen'
};

// Cerrar el modal de selección de imagen
const closeImageSelection = () => {
   profileAction.value = "";
};

const updateImage = async (newUrl) => {
   try {
      console.log("Archivo a subir:", newUrl);
      const response = await fetch("https://echobeatapi.duckdns.org/playlists/update-cover", {
         method: 'POST',
         headers: {
            'Accept': '*/*', 
            'Content-Type': 'application/json',  
         },
         body: JSON.stringify({
            userEmail: email,  
            playlistId: Number(Id),
            imageUrl: newUrl,
         })
      });

      if (!response.ok) {
         console.error("Error con la imagen predeterminada")
         throw new Error("Error al actualizar la imagen ");
      }
      
      showPopupMessage("Imagen actualizada con éxito", "popup-success");
      console.log("Imagen predeterminada actualizada correctamente");
   } catch (error) {
      showPopupMessage("Error al actualizar la imagen", "popup-error");
   }
};

const handleFileUpload = async (event) => {
   const file = event.target.files[0];
   if (!file) return;

   const reader = new FileReader();
   reader.onload = async (e) => {
      previewImageUrl.value = e.target.result;
      const formData = new FormData();
      formData.append('userEmail', email);
      console.log('Email Actualizar playlist: ', email);
      formData.append('file', file);
      const idLista = Number(Id);
      console.log('IdLista: ', idLista);
      console.log("Archivo a subir:", file);
      try {
         const response = await fetch(`https://echobeatapi.duckdns.org/playlists/update-photo/${idLista}`, { 
            method: "POST",
            headers: {},
            body: 
               formData,
            })
         
         if (!response.ok) {
            const errorData = await response.text(); // Ver el error en texto
            throw new Error("Error al subir la imagen");
         }
         console.log("Imagen actualizada con éxito");
         showPopupMessage("Imagen actualizada con éxito", "popup-success");
      } catch (error) {
         console.error(error.message, "popup-error");
      }
      };

   reader.readAsDataURL(file); // Esto genera la vista previa
};

const triggerFileInput = () => {
   fileInputRef.value?.click();
};

const playNewSong = async (song,posicion) => {
   console.log("cancionid:", song);
   console.log("posicion:", posicion);

   const newSong = {
      Id: song.id,
      Nombre: song.nombre,
      Portada: song.portada,
      Duracion: song.duracion,
   };

   console.log(newSong);
   
   const bodyData = {
      userEmail: email,
      reproduccionAleatoria: aleatorio.value,
      posicionCola: posicion,
      colaReproduccion: songsData.value
   };

   console.log("JSON enviado:", bodyData);   
   
   const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/play-list-by-position`, {
      method: 'POST',
      headers: {
         'Accept': '*/*', 
         'Content-Type': 'application/json',  
      },
      body:  JSON.stringify(bodyData)
   });

   if (!response.ok) {
      throw new Error('Error al reproducir playlist');
   }
   const playlistResponse = await response.json();
   console.log("playlist response: ",playlistResponse );

   playSong(newSong);
}

// Función que oculta el menú de búsqueda cuando se hace clic fuera de él
const handleClickOutside = (event) => {
   // Si el clic es fuera del contenedor del menú y del botón de añadir, ocultamos el menú
   if (
      searchContainerRef.value && 
      !searchContainerRef.value.contains(event.target) && 
      !addButtonRef.value.contains(event.target)
   ) {
      searchVisible.value = false; // Oculta el desplegable
   }
};

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

      songsData.value = await songsResponse.json();
      console.log("✅ SongsData recibido: ", songsData.value);

      // VERIFICAR SI LOS DATOS ESTÁN BIEN FORMATEADOS
      if (!songsData.value || !Array.isArray(songsData.value.canciones)) {
         throw new Error('Las canciones no llegaron en formato de array');
      }

      // ASIGNAR LAS CANCIONES A `playlist`
      playlist.value = songsData.value.canciones;
      console.log("✅ Playlist final cargada:", playlist.value);

      // Imágenes predeterminadas
      const ImageResponse = await fetch("https://echobeatapi.duckdns.org/playlists/default-photos");
      if (!ImageResponse.ok) throw new Error("Error al cargar imágenes predeterminadas");
      defaultImages.value = await ImageResponse.json();
      console.log('Canciones predeterminadas', defaultImages.value)

   } catch (error) {
      console.error('Error al cargar la playlist:', error);
   }
});

onMounted(() => {
   // Añadir el listener al documento para detectar clics fuera
   document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
   console.log("Saliendo de la página...");
   // Aquí puedes hacer una actualización en la base de datos si se reordenaron canciones
   document.removeEventListener('click', handleClickOutside);
});

// Imagen de reemplazo
const handleImageError = (event) => {
   event.target.src = default_img; // Reemplaza la imagen con la default
};

// Gestión al hacer clic en el botón aleatorio
const randomClick = () => {
   isGlowing.value = !isGlowing.value;
   aleatorio.value = !aleatorio.value;
};

function formatTime(seconds) {
   let minutes = Math.floor(seconds / 60);
   let secs = seconds % 60;
   return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

const deletePlaylist = async () => {
   try {  
      
      const response = await fetch('https://echobeatapi.duckdns.org/playlists/delete', {
         method: 'DELETE',
         headers: {
            'Accept': '*/*', 
            'Content-Type': 'application/json',  
         },
         body: JSON.stringify({
            userEmail: email,
            idLista: Number(Id)
         })
      });

      if (!response.ok) {
         throw new Error('Error al eliminar la playlist');
      }

      showPopupMessage ("Playlist eliminada correctamente", "popup-success")

      // Redirigir al usuario al home
      setTimeout(() => {
         router.push("/home");
      }, 2000);

   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
}

const playPlaylist = async () => {
   try {
      const bodyData = {
         userEmail: email,
         reproduccionAleatoria: aleatorio.value,
         colaReproduccion: songsData.value
      };

      console.log("JSON enviado:", bodyData);   
      
      const response = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/play-list`, {
         method: 'POST',
         headers: {
            'Accept': '*/*', 
            'Content-Type': 'application/json',  
         },
         body:  JSON.stringify(bodyData)
      });

      if (!response.ok) {
         throw new Error('Error al reproducir playlist');
      }
      const playlistResponse = await response.json();
      console.log("playlist response: ",playlistResponse );

      const song = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${playlistResponse.primeraCancionId}`)
      
      if (!song.ok) {
         throw new Error('Error al reproducir la canción ');
      }
      const songData = await song.json();
      const newSong = {
         Id: playlistResponse.primeraCancionId,
         Nombre: songData.Nombre,
         Portada: songData.Portada,
         Duracion: songData.Duracion,
      };
      playSong(newSong);

   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
 
}

const addSong = async (song) => {
   try {
      console.log("Id playlist: ", Id);
      console.log("Id canción: ", song.Id);
      const playlistId = Number(Id);
      const response = await fetch(`https://echobeatapi.duckdns.org/playlists/add-song/${playlistId}`, {
         method: 'POST',
         headers: {
            'Accept': '*/*', 
            'Content-Type': 'application/json',  
         },
         body: JSON.stringify({
         idLista: playlistId,  
         songId: song.Id 
         })
      });

      if (!response.ok) {
         throw new Error('Error al añadir la canción');
      }

      showPopupMessage("Canción añadida con éxito", "popup-success");
      const newSong = {
         id: song.Id,
         nombre: song.Nombre,
         portada: song.Portada,
         duracion: song.Duracion,
         numReproducciones: song.NumReproducciones
      };
      playlist.value = [...playlist.value, newSong];
      console.log('valor canciones playlist', playlist.value);
    
   } catch (error) {
         showPopupMessage(error.message, "popup-error");
   }
};

const removeSong = async (songId) => {
   try {
      console.log("Id playlist: ", Id);
      console.log("Id canción: ", songId);
      const playlistId = Number(Id);
      const response = await fetch(`https://echobeatapi.duckdns.org/playlists/delete-song/${playlistId}`, {
         method: 'DELETE',
         headers: {
            'Accept': '*/*', 
            'Content-Type': 'application/json',  
         },
         body: JSON.stringify({
         idLista: playlistId,  
         songId: songId 
         })
      });

      if (!response.ok) {
         throw new Error('Error en la eliminación de la canción');
      }

      // Si la eliminación es exitosa, podemos eliminar la canción localmente del vector
      playlist.value = playlist.value.filter(song => song.id !== songId);
      showPopupMessage("Canción eliminada con éxito", "popup-success");
      
   } catch (error) {
         showPopupMessage(error.message, "popup-error");
   }
};

const addSongToFavorites = async (song) => {
   try {
      console.log("Email: ", email);
      console.log("Id canción: ", song.id);
      const response = await fetch(`https://echobeatapi.duckdns.org/cancion/like/${email}/${song.id}`, {
         method: 'POST',
         headers: {
            'Accept': '*/*', 
         },
      });
   
      if (!response.ok) {
         throw new Error('Error al añadir canción a favoritos');
      }
 
      showPopupMessage("Canción añadida a favoritos con éxito", "popup-success");
     
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};


const fetchResults = async () => {
   
   if (!currentSearch.value.trim()) {
      results.value.canciones = [];
      return;
   }

   isLoading.value = true;
   console.log("Texto de búsqueda:", currentSearch.value);

   try { 
      const response = await fetch(`https://echobeatapi.duckdns.org/search/?q=${encodeURIComponent(currentSearch.value)}&tipo=canciones`);
      if (!response.ok) throw new Error('Error al obtener los datos de búsqueda');

      results.value = await response.json();
      console.log("Respuesta de la API:", results.value);

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
   filter: brightness(0) invert(1);
}

.button-action:hover img {
   transform: scale(1.2);
   transition: transform 0.2s ease-in-out;
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

.back-btn-container {
   position: absolute;
   top: 60px;
   left: 10px;
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
   max-height: 300px;
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

.image-container {
  position: relative;
  width: fit-content;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 10;
}

.edit-overlay button {
  background-color: #ffffffdd;
  color: #1e1e1e;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.edit-overlay button:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.image-selection-modal {
   position: fixed;
   top: 45%;
   left: 50%;
   transform: translate(-50%, -50%);
   background: #1a1a1a;
   padding: 20px;
   border-radius: 10px;
   box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
   text-align: center;
   z-index: 1000;
}

.image-grid {
   display: flex;
   gap: 15px;
   flex-wrap: wrap;
   justify-content: center;
   margin: 10px 0;
}

.selectable-image {
   width: 80px;
   height: 80px;
   border-radius: 50%;
   cursor: pointer;
   transition: 0.3s;
   object-fit: cover;
   border: 2px solid #ffa500;
}

.selectable-image:hover {
   transform: scale(1.1);
}

.close-btn {
   width: 60%;
   padding: 12px;
   margin-top: 2rem;
   border: none;
   border-radius: 4px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
   background-color: #ff5722;
}

.close-btn:hover {
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
 