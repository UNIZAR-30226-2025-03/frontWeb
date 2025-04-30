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
            <div class="playlist-title">
               <h1 :class="{ 'disabled': type !== 'ListaReproduccion' }" @click.stop="toggleEditTitle" v-if="!isEditingTitle" >{{ playlistInfo.Nombre }}</h1>
               <input v-if="isEditingTitle && type === 'ListaReproduccion'" ref="titleInputRef" v-model="editedTitle" @blur="saveTitle" @keyup.enter="saveTitle" type="text" :class="{'show': isEditingTitle}" />
               <div class="info-popup-anchor">
                  <img :src="infoIcon" alt="info" class="info-icon" @click.stop="togglePopup"/>
                  
                  <!-- Popup -->
                  <div v-if="isPopupOpen" ref="popupRef" class="playlist-popup" :style="popupStyle">
                     <h2>Detalles de la Playlist</h2>
                     <p><strong>Género:</strong> {{ playlistDetails.Genero }}</p>
                     <div class="playlist-privacy">
                        <strong>Privacidad:</strong> 
                        <span v-if="!isEditingPrivacy">{{ playlistDetails.TipoPrivacidad }}</span>
                        <select v-if="isEditingPrivacy && type === 'ListaReproduccion'" ref="PrivacyInputRef" v-model="editedPrivacy">
                           <option value="publico">Público</option>
                           <option value="privado">Privado</option>
                           <option value="protegido">Protegido</option>
                        </select>
                        <img v-if="!isEditingPrivacy && type === 'ListaReproduccion'" :src="editIcon" alt="edit" class="edit-icon" @click.stop="toggleEditPrivacy"/>
                     </div>
                     <div class="popup-buttons">
                        <button @click="closePopup">Cerrar</button>
                        <button @click="savePrivacy">Guardar</button>
                     </div>
                  </div>

                  <!-- Fondo oscuro sutil cuando el popup está abierto -->
                  <div v-if="isPopupOpen" class="popup-background-overlay" @click="closePopup">
                  </div>
               </div>
            </div>
            <p>{{ playlistInfo.NumCanciones }} canciones</p> 
            <div class="playlist-description">
               <p :class="{ 'disabled': type !== 'ListaReproduccion' }" @click.stop="toggleEditDescription" v-if="!isEditingDescription">{{ playlistInfo.Descripcion }}</p>
               <input v-if="isEditingDescription && type === 'ListaReproduccion'" ref="descriptionInputRef" v-model="editedDescription" @blur="saveDescription" @keyup.enter="saveDescription" type="text" :class="{'show': isEditingDescription}" />
            </div>
            <p v-if="type !== 'ajenoPrivado'">{{ playlistInfo.NumLikes }} Likes</p>
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
            <div class="select-wrapper">
               <select class="filterSelect" v-model="sortOption" @change="sortSongs">
                  <option disabled value=""> Orden playlist </option>
                  <option value="default">Predefinida</option>
                  <option value="name">Nombre</option>
                  <option value="plays">Reproducciones</option>
               </select>
            </div>

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
                  <button v-if="!isFavorite(element.id)" @click="addSongToFavorites(element)">🤍</button>
                  <button v-else @click="errorMessage">❤️</button>
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
import { emitter } from '@/js/event-bus';
import draggable from 'vuedraggable';
import randomIcon from '@/assets/random-button.png';
import default_img from '@/assets/kebab.jpg';
import add_button from '@/assets/add_circle.svg';
import pauseIcon from '@/assets/pause-circle.svg';
import playIcon from '@/assets/play-circle.svg';
import deleteIcon from '@/assets/delete.svg';
import infoIcon from '@/assets/info.svg';
import editIcon from '@/assets/edit.svg';

/**
 * Función inyectada para reproducir una canción.
 * Se espera que el componente padre provea esta función a través de la inyección de dependencias.
 * @type {Function}
 */
const playSong = inject('playSong');

/**
 * Tipo de playlist, obtenido del localStorage.
 * @type {string|null}
 */
const type = localStorage.getItem("type");

// Variables para CSS y HTML

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
 * Referencia al botón de "añadir", utilizada para detectar clics fuera del menú.
 * @type {Ref<HTMLElement|null>}
 */
const addButtonRef = ref(null);

/**
 * Estado reactivo que almacena el texto actual ingresado en la búsqueda.
 * @type {Ref<string>}
 */
const currentSearch = ref('');

/**
 * Estado reactivo para indicar si hay carga en proceso.
 * @type {Ref<boolean>}
 */
const isLoading = ref(false);

/**
 * Estado reactivo que almacena la canción sobre la que se pasa el cursor.
 * @type {Ref<any>}
 */
const hoveredSong = ref(null);

/**
 * Objeto de la ruta actual, utilizado para extraer parámetros de la URL.
 * @type {object}
 */
const route = useRoute();

/**
 * Identificador de la playlist, obtenido desde la query de la URL.
 * @type {string}
 */
const Id = route.query.id;

console.log('ID de la playlist:', Id);
console.log('Type de la playlist:', type);

/**
 * Estado reactivo que contiene la información general de la playlist.
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
 * Estado reactivo para controlar si se muestra la superposición de edición.
 * @type {Ref<boolean>}
 */
const showEditOverlay = ref(false);

/**
 * Referencia al input de archivo para la imagen (para actualizar portada).
 * @type {Ref<HTMLElement|null>}
 */
const fileInputRef = ref(null);

/**
 * Estado reactivo para almacenar la URL de la imagen de vista previa.
 * @type {Ref<string|null>}
 */
const previewImageUrl = ref(null);

/**
 * Array reactivo que contendrá las imágenes predeterminadas.
 * @type {Ref<Array>}
 */
const defaultImages = ref([]);

/**
 * Estado reactivo para definir la acción de perfil (por ejemplo, cambiar imagen).
 * @type {Ref<any>}
 */
const profileAction = ref(null);

/**
 * Estado reactivo para almacenar la opción de ordenamiento de canciones.
 * @type {Ref<string>}
 */
const sortOption = ref('default');

/**
 * Estado reactivo para almacenar los datos de las canciones, inicalmente como string vacío.
 * @type {Ref<any>}
 */
const songsData = ref('');

/**
 * Array reactivo que almacena los detalles de la playlist.
 * @type {Ref<Array>}
 */
const playlistDetails = ref([]);

/**
 * Estado reactivo para almacenar el título editado.
 * @type {Ref<string>}
 */
const editedTitle = ref('');

/**
 * Estado reactivo para almacenar la descripción editada.
 * @type {Ref<string>}
 */
const editedDescription = ref('');

/**
 * Estado reactivo que indica si el título está siendo editado.
 * @type {Ref<boolean>}
 */
const isEditingTitle = ref(false);

/**
 * Estado reactivo que indica si la descripción está siendo editada.
 * @type {Ref<boolean>}
 */
const isEditingDescription = ref(false);

/**
 * Referencia al input del título, usado durante la edición.
 * @type {Ref<HTMLElement|null>}
 */
const titleInputRef = ref(null);

/**
 * Referencia al input de la descripción, usado durante la edición.
 * @type {Ref<HTMLElement|null>}
 */
const descriptionInputRef = ref(null);

/**
 * Estado reactivo para almacenar el nivel de privacidad editado.
 * @type {Ref<string>}
 */
const editedPrivacy = ref('');

 /**
  * Estado reactivo que indica si la privacidad está siendo editada.
  * @type {Ref<boolean>}
  */
const isEditingPrivacy = ref(false);

/**
 * Referencia al input o elemento del selector de privacidad, usado durante la edición.
 * @type {Ref<HTMLElement|null>}
 */
const PrivacyInputRef = ref(null);

/**
 * Objeto reactivo que almacena los resultados de búsqueda agrupados por categorías.
 * @type {Ref<{ artistas: Array, canciones: Array, albums: Array, listas: Array }>}
 */
const results = ref({
   artistas: [],
   canciones: [],
   albums: [],
   listas: []
});

/**
 * Email del usuario obtenido desde el localStorage.
 * @type {string|null}
 */
const email = localStorage.getItem("email");

/**
 * Estado reactivo que indica si la reproducción debe ser aleatoria.
 * @type {Ref<boolean>}
 */
const aleatorio = ref(false);

/**
 * Estado reactivo que almacenará los datos de las canciones favoritas.
 * @type {Ref<any>}
 */
const favoriteSongs = ref([]);

/**
 * @constant {Ref<string>} currentNick - Apodo actual del usuario.
 */
const currentNick = ref('');
 
/**
 * Estado reactivo que controla la visibilidad del popup.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo que almacena el mensaje del popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo que define el tipo de popup ("popup-error" o "popup-success").
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/* ============================
   Funciones Popup y generales
   ============================ */

/**
 * Función para mostrar un popup con un mensaje y tipo específicos.
 * El popup se cierra automáticamente después de 3 segundos.
 *
 * @param {string} message - Mensaje a mostrar.
 * @param {string} type - Tipo del popup ("popup-error" o "popup-success").
 */
const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
      showPopup.value = false;
   }, 3000); // Cierra el popup después de 3 segundos
};

/* ============================
   Popup detalles playlist
   ============================ */

/**
 * Estado reactivo que controla si el popup de detalles de la playlist está abierto.
 * @type {Ref<boolean>}
 */
const isPopupOpen = ref(false);

/**
 * Estado reactivo que almacena el estilo personalizado del popup.
 * @type {Ref<object>}
 */
const popupStyle = ref({});

/**
 * Referencia al elemento del popup de detalles.
 * @type {Ref<HTMLElement|null>}
 */
const popupRef = ref(null);

/**
 * Función para alternar la visibilidad del popup de detalles.
 * @async
 */
const togglePopup = async () => {
  isPopupOpen.value = !isPopupOpen.value;
};

/**
 * Función para cerrar el popup de detalles y la edición de privacidad.
 */
const closePopup = () => {
  isPopupOpen.value = false;
  isEditingPrivacy.value = false;
};

/* ============================
   Computed y Navegación
   ============================ */

/**
 * Computed que filtra la playlist según el término de búsqueda.
 * Si no se ingresa búsqueda, retorna toda la playlist.
 *
 * @returns {Array} Lista filtrada de canciones.
 */
const filteredPlaylist = computed(() => {
   if (!searchTerm.value.trim()) {
      return playlist.value; // Mostrar toda la playlist si no hay búsqueda
   }
   return playlist.value.filter(song =>
      song.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
   );
});

/**
 * Función para regresar a la página anterior.
 */
const goBack = () => {
   router.back();
};

// Watcher para monitorear cambios en editedPrivacy y loguearlos.
watch(editedPrivacy, (newValue) => {
   console.log("Valor de editedPrivacy cambiado a:", newValue);
});

/* ============================
   Funciones de canciones favoritas
   ============================ */

/**
 * Función para comprobar si una canción se encuentra en favoritos o no
 * @param {string} id - Canción a comprobar.
 */
const isFavorite = (id) => {
   if (!Array.isArray(favoriteSongs.value.canciones)) return false;
   return favoriteSongs.value.canciones.some(s => s.id === id);
};

/**
  * Función para mostrar error cuando la canción ya se encuentra en favoritos
 */
const errorMessage = () => {
   showPopupMessage ("La canción ya se encuentra en favoritos", "popup-error");
}


/* ============================
   Funciones de Edición
   ============================ */

/**
 * Alterna la edición del título de la playlist.
 * Si se activa, rellena el input con el nombre actual.
 */
const toggleEditTitle = () => {
   isEditingTitle.value = !isEditingTitle.value;
   if (isEditingTitle.value) {
      editedTitle.value = playlistInfo.value.Nombre;
   }
};

/**
 * Alterna la edición de la descripción de la playlist.
 * Si se activa, rellena el input con la descripción actual.
 */
const toggleEditDescription = () => {
   isEditingDescription.value = !isEditingDescription.value;
   if (isEditingDescription.value) {
      editedDescription.value = playlistInfo.value.Descripcion;
   }
};

/**
 * Alterna la edición de la privacidad de la playlist.
 * Si se activa, asigna el valor actual de privacidad al input.
 */
const toggleEditPrivacy = () => {
   isEditingPrivacy.value = !isEditingPrivacy.value;
   console.log("isEditingPrivacy cambiado a:", isEditingPrivacy.value);
   if (isEditingPrivacy.value) {
      editedPrivacy.value = playlistDetails.value.TipoPrivacidad;
      console.log("editedPrivacy al abrir: ", editedPrivacy.value);
   }
};

/**
 * Función asíncrona para guardar el título editado.
 * Si el título ha cambiado, actualiza playlistInfo y realiza una petición a la API para guardar el cambio.
 *
 * @async
 */
const saveTitle = async () => {
   if (editedTitle.value != playlistInfo.value.Nombre) {
      playlistInfo.value.Nombre = editedTitle.value;
      isEditingTitle.value = false;
      try {
         const res = await fetch("https://echobeatapi.duckdns.org/playlists/update-nombre", { 
            method: "POST",
            headers: {
               "Accept": "application/json",
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               userEmail: email,
               idPlaylist: Number(Id),
               nuevoNombre: playlistInfo.value.Nombre
            })
         });
         if (!res.ok) throw new Error("Error al actualizar nombre de playlist");
         showPopupMessage('Título actualizado correctamente', 'popup-success');
      } catch (error) {
         console.error(error.message);
      }
   } else {
      isEditingTitle.value = false;
   }
};

/**
 * Función asíncrona para guardar la descripción editada.
 * Si la descripción ha cambiado, actualiza playlistInfo y realiza una petición a la API para guardar el cambio.
 *
 * @async
 */
const saveDescription = async () => {
   if (editedDescription.value != playlistInfo.value.Descripcion) {
      playlistInfo.value.Descripcion = editedDescription.value;
      isEditingDescription.value = false;
      try {
         const res = await fetch("https://echobeatapi.duckdns.org/playlists/update-descripcion", { 
            method: "POST",
            headers: {
               "Accept": "application/json",
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               userEmail: email,
               idPlaylist: Number(Id),
               nuevaDescripcion: playlistInfo.value.Descripcion
            })
         });
         if (!res.ok) throw new Error("Error al actualizar descripción de playlist");
         showPopupMessage('Descripción actualizada correctamente', 'popup-success');
      } catch (error) {
         console.error(error.message);
      }
   } else {
      isEditingDescription.value = false;
   }
};

/**
 * Función asíncrona para guardar la privacidad editada.
 * Si ha cambiado, actualiza playlistDetails y guarda el cambio en la API.
 *
 * @async
 */
const savePrivacy = async () => {
   if (editedPrivacy.value != playlistDetails.value.TipoPrivacidad) {
      playlistDetails.value.TipoPrivacidad = editedPrivacy.value;
      console.log('Playlist privacidad: ', playlistDetails.value.TipoPrivacidad);
      isEditingPrivacy.value = false;
      try {
         const res = await fetch("https://echobeatapi.duckdns.org/playlists/update-privacidad", { 
            method: "POST",
            headers: {
               "Accept": "application/json",
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               userEmail: email,
               idPlaylist: Number(Id),
               nuevoTipoPrivacidad: playlistDetails.value.TipoPrivacidad
            })
         });
         if (!res.ok) throw new Error("Error al actualizar privacidad de playlist");
         showPopupMessage('Privacidad actualizada correctamente', 'popup-success');
      } catch (error) {
         console.error(error.message);
      }
   } else {
      isEditingPrivacy.value = false;
   }
};

/* ============================
   Funciones de Búsqueda y Ordenamiento
   ============================ */

/**
 * Función para alternar la visibilidad del buscador.
 */
const toggleSearch = () => {
   searchVisible.value = !searchVisible.value;
};

/**
 * Función asíncrona para ordenar las canciones de la playlist.
 * La opción de ordenamiento se determina por sortOption, que se traduce a un filtro numérico.
 *
 * @async
 */
async function sortSongs() {
   const idLista = Number(Id);
   try {
      let filtro;
      switch (sortOption.value) {
         case 'default':
            filtro = 0;
            break;
         case 'name': 
            filtro = 1;
            break;
         case 'plays':
            filtro = 2;
            break;
         default:
            filtro = 0;
      }
      const response = await fetch(`https://echobeatapi.duckdns.org/playlists/ordenar-canciones/${idLista}/${filtro}`);
      if (!response.ok) throw new Error("Error al ordenar las canciones");

      const data = await response.json();
      playlist.value = data.canciones;

      showPopupMessage('Playlist ordenada correctamente', 'popup-success');
   } catch (error) {
      console.error(error);
      showPopupMessage(' Error al ordenar la playlist', 'popup-error');
   }
}

/* ============================
   Watchers
   ============================ */

/**
 * Watcher para actualizar la playlist cuando el id en la query de la ruta cambia.
 * Se actualiza la información de la playlist, canciones, y se resetea el término de búsqueda.
 */
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

/* ============================
   Funciones para Imágenes y Archivos
   ============================ */

/**
 * Función para seleccionar una imagen predeterminada.
 * Actualiza la imagen de vista previa y cambia la acción del perfil a 'Subir nueva imagen'.
 *
 * @param {string} image - URL de la imagen predeterminada.
 */
const selectDefaultImage = (image) => {
   updateImage(image);
   previewImageUrl.value = image;
   profileAction.value = ''; // Vuelve a la opción de 'Subir nueva imagen'
};

/**
 * Función para cerrar el modal de selección de imagen.
 */
const closeImageSelection = () => {
   profileAction.value = "";
};

/**
 * Función asíncrona para actualizar la imagen de portada de la playlist.
 *
 * @async
 * @param {string} newUrl - Nueva URL de la imagen.
 * @throws {Error} Si ocurre un error al actualizar la imagen.
 */
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
         console.error("Error con la imagen predeterminada");
         throw new Error("Error al actualizar la imagen ");
      }
      showPopupMessage("Imagen actualizada con éxito", "popup-success");
      console.log("Imagen predeterminada actualizada correctamente");
   } catch (error) {
      showPopupMessage("Error al actualizar la imagen", "popup-error");
   }
};

/**
 * Función asíncrona para manejar la subida de un archivo de imagen.
 * Utiliza FileReader para generar una vista previa de la imagen y luego la sube al servidor.
 *
 * @async
 * @param {Event} event - Evento del input file.
 */
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
            body: formData,
         });
         if (!response.ok) {
            const errorData = await response.text(); // Captura el error en texto
            throw new Error("Error al subir la imagen");
         }
         console.log("Imagen actualizada con éxito");
         showPopupMessage("Imagen actualizada con éxito", "popup-success");
      } catch (error) {
         console.error(error.message, "popup-error");
      }
   };
   reader.readAsDataURL(file); // Genera la vista previa
};

/**
 * Función para activar el input file a través de su referencia.
 */
const triggerFileInput = () => {
   fileInputRef.value?.click();
};

/* ============================
   Funciones de Reproducción
   ============================ */

/**
 * Función para actualizar localmente el número de reproducciones de una canción.
 *
 * @param {object} song - Objeto de la canción.
 */
const updateSongReproductions = (song) => {
   song.numReproducciones++; // Incrementa localmente las reproducciones
};

/**
 * Watcher para escuchar cambios en la playlist.
 * Imprime la playlist actualizada en la consola.
 */
watch(() => playlist.value, (newPlaylist) => {
   console.log('Playlist actualizada:', newPlaylist);
}, { immediate: true });

/**
 * Función asíncrona para reproducir una nueva canción dentro de la playlist.
 * Actualiza las reproducciones localmente y realiza una petición para reproducir la canción a partir de una posición específica.
 *
 * @async
 * @param {object} song - Objeto de la canción a reproducir.
 * @param {number} posicion - Posición de la canción en la cola de reproducción.
 * @throws {Error} Si falla la petición a la API.
 */
const playNewSong = async (song, posicion) => {
   // Actualiza el contador de reproducciones localmente
   updateSongReproductions(song);
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
      body: JSON.stringify(bodyData)
   });

   if (!response.ok) {
      throw new Error('Error al reproducir playlist');
   }
   const playlistResponse = await response.json();
   console.log("playlist response: ", playlistResponse);

   playSong(newSong);
};

/* ============================
   Función para Manejar Clics Fuera
   ============================ */

/**
 * Función que oculta el menú de búsqueda o termina la edición de campos si se hace clic fuera de ellos.
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
      searchVisible.value = false; // Oculta el desplegable
   }
   // Si se está editando el título y el clic es fuera, guarda el título y cierra la edición.
   if (isEditingTitle.value && titleInputRef.value && !titleInputRef.value.contains(event.target)) {
      saveTitle();
   }
   // Si se está editando la descripción y el clic es fuera, guarda la descripción y cierra la edición.
   if (isEditingDescription.value && descriptionInputRef.value && !descriptionInputRef.value.contains(event.target)) {
      saveDescription();
   }
   // Si se está editando la privacidad y el clic es fuera del popup, guarda la privacidad y cierra la edición.
   if (isEditingPrivacy.value && popupRef.value && !popupRef.value.contains(event.target)) {
      savePrivacy();
      isEditingPrivacy.value = false;
   }
};

/* ============================
   onMounted y onUnmounted Hooks
   ============================ */

/**
 * Hook de ciclo de vida: onMounted.
 * Realiza las siguientes acciones al montar el componente:
 * - Obtiene la información general de la playlist.
 * - Obtiene los detalles de la playlist.
 * - Obtiene las canciones de la playlist.
 * - Verifica el formato de las canciones y actualiza la playlist.
 * - Obtiene las imágenes predeterminadas.
 */
onMounted(async () => {
   fetchFavourites();
   emitter.on('FavoriteSongs-updated', () => {
      fetchFavourites(); // Vuelve a cargar los favoritos cuando hay un cambio
   });
   try {
      // OBTENER INFO DE LA PLAYLIST
      const infoResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/lista/${Id}`);
      if (!infoResponse.ok) throw new Error('Error al obtener la información de la playlist');
      playlistInfo.value = await infoResponse.json();
      console.log("✅ PlaylistInfo cargada: ", playlistInfo.value);

      // OBTENER DETALLES DE LA PLAYLIST
      const detailsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/playlist/${Id}`);
      if (!detailsResponse.ok) throw new Error('Error al obtener los detalles de la playlist');
      playlistDetails.value = await detailsResponse.json();
      console.log("✅ Playlist details: ", playlistDetails.value);
      editedPrivacy.value = playlistDetails.value.TipoPrivacidad;

      // OBTENER CANCIONES DE LA PLAYLIST
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

      // Obtener imágenes predeterminadas
      const ImageResponse = await fetch("https://echobeatapi.duckdns.org/playlists/default-photos");
      if (!ImageResponse.ok) throw new Error("Error al cargar imágenes predeterminadas");
      defaultImages.value = await ImageResponse.json();
      console.log('Canciones predeterminadas', defaultImages.value);
   } catch (error) {
      console.error('Error al cargar la playlist:', error);
   }
});

/**
 * Hook de ciclo de vida: onMounted.
 * Añade un listener al documento para detectar clics fuera de ciertos elementos.
 */
onMounted(() => {
   document.addEventListener('click', handleClickOutside);
});

/**
 * Hook de ciclo de vida: onUnmounted.
 * Realiza la actualización de la lista de canciones en el servidor y limpia el listener.
 */
onUnmounted(async () => {
   console.log("Actualizando lista...");
   try {
      const canciones = filteredPlaylist.value;
      const cancionesJson = { canciones };
      const responde = await fetch("https://echobeatapi.duckdns.org/playlists/reordenar-canciones", {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            idPlaylist: Number(Id),
            cancionesJson: cancionesJson
         })
      });
      if (!responde.ok) throw new Error('Error al actualizando lista');
   } catch (error) {
      console.error(error);
   }
});

/**
 * Hook de ciclo de vida: onUnmounted.
 * Remueve el listener de clic y elimina el item "type" del localStorage.
 */
onUnmounted(() => {
   document.removeEventListener('click', handleClickOutside);
   emitter.off('FavoriteSongs-updated');
   localStorage.removeItem("type");
});

/* ============================
   Funciones para Imágenes y Errores
   ============================ */

/**
 * Función para manejar errores de carga de imagen.
 * Si ocurre un error, reemplaza la imagen por una imagen predeterminada.
 *
 * @param {Event} event - Evento de error en la carga de la imagen.
 */
const handleImageError = (event) => {
   event.target.src = default_img; // Reemplaza la imagen con la default
};

/**
 * Función para gestionar el clic en el botón aleatorio.
 * Alterna el efecto visual del botón y la bandera de reproducción aleatoria.
 */
const randomClick = () => {
   isGlowing.value = !isGlowing.value;
   aleatorio.value = !aleatorio.value;
};

/**
 * Función para formatear un tiempo dado en segundos al formato MM:SS.
 *
 * @param {number} seconds - Tiempo en segundos.
 * @returns {string} Tiempo formateado.
 */
function formatTime(seconds) {
   let minutes = Math.floor(seconds / 60);
   let secs = seconds % 60;
   return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/* ============================
   Funciones para Gestión de Playlist
   ============================ */

/**
 * Función asíncrona para eliminar la playlist.
 * Envía una petición DELETE a la API y, si es exitosa, redirige al usuario al home.
 *
 * @async
 */
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
      showPopupMessage("Playlist eliminada correctamente", "popup-success");
      // Redirige al usuario al home después de 2 segundos
      setTimeout(() => {
         router.push("/home");
      }, 2000);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para reproducir la playlist completa.
 * Envía los detalles de la cola de reproducción a la API y reproduce la primera canción de la lista.
 *
 * @async
 */
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
      };
      playSong(newSong);
      emitter.emit('random-changed', aleatorio.value);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para añadir una canción a la playlist.
 * Envía una petición POST a la API para agregar la canción y actualiza la playlist localmente.
 *
 * @async
 * @param {object} song - Objeto de la canción a añadir.
 */
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

/**
 * Función asíncrona para eliminar una canción de la playlist.
 * Envía una petición DELETE a la API y, si es exitosa, elimina la canción del array local.
 *
 * @async
 * @param {number} songId - ID de la canción a eliminar.
 */
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
      // Elimina la canción localmente si la eliminación es exitosa.
      playlist.value = playlist.value.filter(song => song.id !== songId);
      showPopupMessage("Canción eliminada con éxito", "popup-success");
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para obtener las canciones favoritas del usuario.
 * Realiza una petición a la API y actualiza el estado reactivo "songsData".
 *
 * @async
 * @throws {Error} Si la petición a la API falla.
 */
 async function fetchFavourites() {
   try {
      // OBTENER CANCIONES FAVORITAS
      const songsResponse = await fetch(`https://echobeatapi.duckdns.org/cancion/favorites?email=${encodeURIComponent(email)}`);
      if (!songsResponse.ok) throw new Error('Error al obtener las canciones de la playlist');
   
      favoriteSongs.value = await songsResponse.json();
      console.log(" ✅ Canciones favoritas: ", favoriteSongs.value);
   
      // VERIFICAR SI LOS DATOS ESTÁN BIEN FORMATEADOS
      if (!favoriteSongs.value || !Array.isArray(favoriteSongs.value.canciones)) {
         throw new Error('Las canciones no llegaron en formato de array');
      }
 
   } catch (error) {
      console.error('Error al cargar la playlist:', error);
   }
}

/**
 * Función asíncrona para añadir una canción a favoritos.
 * Envía una petición POST a la API para marcar la canción como favorita.
 *
 * @async
 * @param {object} song - Objeto de la canción a marcar como favorita.
 */
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
      emitter.emit('FavoriteSongs-updated');
      showPopupMessage("Canción añadida a favoritos con éxito", "popup-success");
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para buscar canciones.
 * Si el término de búsqueda está vacío, resetea los resultados.
 * De lo contrario, realiza una petición a la API y actualiza el objeto "results".
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

.playlist-title {
  display: flex;
  align-items: center;
  gap: 20px; /* espacio entre el texto y el icono */
}

.playlist-title input,
.playlist-description input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ffa500;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #fff;
  opacity: 0;
  height: 0;
  transition: opacity 0.3s, height 0.3s ease-in-out;
}

.playlist-title input:focus,
.playlist-description input:focus {
  outline: none;
  border-color: #009688;
}

.playlist-title h1,
.playlist-description p {
  transition: opacity 0.3s, color 0.3s ease-in-out;
}

.playlist-title input.show,
.playlist-description input.show {
  opacity: 1;
  height: auto;
}

.playlist-title h1:hover,
.playlist-description p:hover {
  color: #009688;
  cursor: pointer;
  transition: color 0.3s;
}

.playlist-info .info-icon {
  width: 40px;  /* Ajusta el tamaño */
  height: 40px;
  object-fit: contain;  /* Evita distorsión de la imagen */
  cursor: pointer;
  filter: brightness(0) invert(1);
}

.playlist-info h1 {
   margin: 10px 0;
   font-family: 'Montserrat', sans-serif;
   font-size: 2.2rem;
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

/* Estilos para el popup */
.info-popup-wrapper {
  position: relative;
  display: inline-block;
}

/* Popup visual */
.info-popup-anchor {
  position: relative;
  display: inline-block;
}

/* Popup sobre contenido */
.playlist-popup {
  position: fixed;
  background-color: #4a1e04;
  border-radius: 12px;
  padding: 20px 20px;
  min-width: 240px;
  color: #ffb347;
  z-index: 9999;
  font-family: 'Inter', sans-serif;
  animation: fadeSlideIn 0.25s ease-out;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7),
              0 0 10px rgba(255, 180, 71, 0.3); 
}

/* Título */
.playlist-popup h2 {
  font-size: 1.5rem;
  margin-bottom: 12px;
  font-weight: bold;
  color: #ffb347;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
}

/* Detalles */
.playlist-popup p {
  margin: 8px 0;
  font-size: 1.05rem;
  opacity: 0.85;
}

/* Contenedor de botones */
.popup-buttons {
  display: flex;
  justify-content: center; /* Centra los botones */
  gap: 10px; /* Separación entre los botones */
  margin-top: 15px; /* Separación entre los detalles y los botones */
}

/* Botón cerrar y guardar */
.playlist-popup button {
  background-color: #8a3a10;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 0.95rem;
  margin-top: 5px;
}

.playlist-popup button:hover {
  background-color: #ffb347;
  color: #2d1405;
}


/* Entrada animada */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.popup-background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(1px);
  background-color: rgba(0, 0, 0, 0.4); /* Oscurece un poco */
  z-index: 9998; /* Justo por debajo del popup */
}

.playlist-privacy {
  display: flex;
  align-items: center;
  gap: 10px;
}

.playlist-header .edit-icon {
  width: 25px;
  height: 25px;
  cursor: pointer;
  filter: brightness(0) invert(1); /* Ajusta el color del icono si es necesario */
  transition: filter 0.3s;
}

.edit-icon:hover {
  filter: brightness(0.5) invert(1); /* Cambia el color cuando se hace hover */
}

.playlist-privacy select {
   width: 100%;
   padding: 8px;
   font-size: 14px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
   transition: opacity 0.3s, height 0.3s ease-in-out;
   z-index: 1000;
}

.disabled {
   pointer-events: none;  /* Desactiva la capacidad de hacer clic */
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
 