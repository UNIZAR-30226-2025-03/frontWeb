<template>
  <div class="layout">
    <!-- Barra lateral -->
   
    <aside class="sidebar">
      <div class="library">
        <h2>Escuchando </h2>
        <button class="trash-btn" @click="clearQueue">
          🗑️
        </button>
        <div id="songs-list">
          <div v-for="(song, index) in songs" :key="index" 
               class="song-item" 
               @mouseover="hoveredSong = song.id" 
               @mouseleave="hoveredSong = null" 
               @click="playAsong(song.id, index)">  
            <p class="song-title">{{ song.nombre }}</p>
            <button v-if="hoveredSong === song.id" 
                    class="song-trash-btn" 
                    @click.stop="removeSong(index)">
              🗑️
            </button>
          </div>
        </div> 
      </div>
    </aside>
    

    <!-- Contenido principal -->
    <main class="content">
      <!-- Sección Escuchado Recientemente -->
      <section class="recently-played">
        <h2>Bienvenido {{ nombre }}</h2>
        <div class="playlist-container">
          <div v-for="(playlist, index) in playlists" :key="index" class="playlist-item" @click="handleClick(playlist.Id, playlist.lista.TipoLista)" >
            <div class="playlist-image">
              <img 
                :src="playlist.lista?.Portada" 
                alt="Playlist Image"  
                @error="(event) => event.target.style.display = 'none'"
              />
            </div>
            <div class="playlist-info">
              <p class="playlist-title">{{ playlist.Nombre }}</p>
            </div>
          </div>
        </div>
      </section>
      <!-- Sección Recomendaciones -->
      <section class="recommendations">
          <h2>Recomendaciones</h2>
          <div id="recomendations-container">
              <!-- Aquí se insertarán dinámicamente las recomendaciones -->
          </div>
      </section>

    </main>
    <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, inject, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import randomIcon from '@/assets/random-button.png';
import default_img from '@/assets/kebab.jpg';
import add_button from '@/assets/add_circle.svg';
import pauseIcon from '@/assets/pause-circle.svg';
import playIcon from '@/assets/play-circle.svg';
import favs_cover from '@/assets/favoritos-cover.jpg';

/**
 * Función inyectada para reproducir canciones.
 * Se espera que el componente padre provea esta función mediante la inyección de dependencias.
 * @type {Function}
 */
const playSong = inject('playSong');

/**
 * Instancia del router para navegación programática.
 * @type {object}
 */
const router = useRouter();

/**
 * Objeto de la ruta actual, que se utiliza para obtener parámetros desde la URL.
 * @type {object}
 */
const route = useRoute();

/**
 * Función inyectada para acceder a los datos de la cola de reproducción (songsData).
 * Se asume que songsData es inyectado desde un componente padre o proveedor global.
 * @type {object}
 */
const songsData = inject('songsData');

/**
 * Email del usuario, obtenido desde el localStorage.
 * @type {string|null}
 */
const email = localStorage.getItem("email");
console.log("email: ", email);

/**
 * Array reactivo para almacenar las canciones en la cola.
 * @type {Ref<Array>}
 */
const songs = ref([]);

/**
 * Array reactivo para almacenar las playlists propias del usuario.
 * @type {Ref<Array>}
 */
const playlists = ref([]);

/**
 * Estado reactivo para almacenar el id de la playlist actual.
 * @type {Ref<number>}
 */
const id = ref(0);

/**
 * Estado reactivo para almacenar el nombre del usuario (o de la playlist) en uso.
 * @type {Ref<any>}
 */
const nombre = ref();

/**
 * Estado reactivo que almacena la canción sobre la que se pasa el cursor.
 * @type {Ref<any>}
 */
const hoveredSong = ref(null);

/**
 * Estado reactivo que controla la visualización del popup de mensajes.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo que contiene el mensaje a mostrar en el popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo que define el tipo de popup ("popup-error" o "popup-success").
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/**
 * Función que muestra un popup con un mensaje y un tipo especificado.
 * El popup se oculta automáticamente después de 3 segundos.
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

/**
 * Función asíncrona para reproducir una canción específica.
 * Realiza una petición a la API para obtener los detalles de la canción y actualiza la cola de reproducción.
 *
 * @async
 * @param {number|string} song - Identificador de la canción a reproducir.
 * @param {number} posicion - Posición en la cola de reproducción.
 * @throws {Error} Si falla la petición para obtener los detalles de la canción.
 */
const playAsong = async (song, posicion) => {
   try {
      // Solicita los detalles de la canción mediante su id.
      const songResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${song}`);
      if (!songResponse.ok) {
         throw new Error('Error al reproducir la canción ');
      }
      const songData = await songResponse.json();
      const newSong = {
         Id: song,
         Nombre: songData.Nombre,
         Portada: songData.Portada,
         Duracion: songData.Duracion,
      };
      //-------------Actualizar posición cola------------------
      const bodyData = {
         userEmail: email,
         reproduccionAleatoria: false,
         posicionCola: posicion,
         colaReproduccion: songsData.value.ColaReproduccion
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

      // Llama a la función playSong inyectada para reproducir la canción.
      playSong(newSong);
   } catch (error) {
      console.error('play a song:', error);
   }
};

/**
 * Watcher que actualiza la variable local "songs" cuando cambian los datos inyectados en "songsData".
 * Se asegura que "songs" contenga un array de canciones, ya que puede venir como un solo objeto.
 */
watch(
  songsData,
  (newVal) => {
    if (newVal && newVal.ColaReproduccion && newVal.ColaReproduccion.canciones) {
      songs.value = Array.isArray(newVal.ColaReproduccion.canciones)
        ? newVal.ColaReproduccion.canciones
        : [newVal.ColaReproduccion.canciones];
    } else {
      songs.value = [];
    }
    console.log("Sidebar: Lista de canciones actualizada:", songs.value);
  },
  { deep: true }
);

/**
 * Función para manejar el clic sobre una playlist.
 * Al hacer clic, se guarda el tipo de playlist en el localStorage y se redirige al usuario a la vista de la playlist.
 *
 * @param {number|string} id - Identificador de la playlist seleccionada.
 * @param {string} playlistType - Tipo de playlist (por ejemplo, "album").
 */
const handleClick = (id, playlistType) => {
   console.log("Playlist seleccionada:", id);
   localStorage.setItem("type", playlistType);
   router.push({ path: '/playlist', query: { id: id } });
};

/**
 * Hook de ciclo de vida: onMounted.
 * Se ejecuta al montar el componente para inicializar datos como:
 * - Obtener el nick del usuario mediante su email.
 * - Obtener las playlists propias del usuario.
 * - Obtener recomendaciones basadas en preferencias del género.
 * - Obtener la cola de reproducción actual y actualizar "songs".
 */
onMounted(async () => {
   // Obtener nick del usuario.
   try {
      const nick = await fetch(`https://echobeatapi.duckdns.org/users/nick?userEmail=${encodeURIComponent(email)}`)
      const nickData = await nick.json();
      nombre.value = nickData.Nick;
   } catch (error) {
      console.error('Nick Error:', error);
   }

   // Obtener las playlists propias del usuario.
   try {
      const playlistResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/user/${encodeURIComponent(email)}`);
      if (!playlistResponse.ok) throw new Error('Error al obtener las playlist del usuario');

      const playlistData = await playlistResponse.json();
      console.log("Playlist data: ", playlistData);
      if (playlistData.message === 'El usuario no tiene playlists') {
         playlists.value = [];
      } else {
         playlists.value = Array.isArray(playlistData) ? playlistData : [playlistData];
      }
      console.log("playlists data ", playlists.value); // 🔥 Ver en la consola
   } catch (error) {
      console.error('Playlist Error:', error);
   }

   // Obtener recomendaciones basadas en preferencias del usuario.
   try {
      const container = document.getElementById("recomendations-container");
      const response = await fetch(`https://echobeatapi.duckdns.org/genero/preferencia?userEmail=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Error al obtener las recomendaciones del usuario');
      const data = await response.json();

      data.forEach(genero => {
         console.log('playlist genero: ', genero);
         const listElement = document.createElement("div");
         listElement.classList.add("recomendations-item");

         const imgElement = document.createElement("img");
         imgElement.src = genero.FotoGenero;
         imgElement.alt = genero.NombreGenero;
         imgElement.classList.add("recomendations-cover");

         // Manejar error de imagen: si falla, se muestra una imagen predeterminada o se oculta.
         imgElement.onerror = function () {
            if (!this.dataset.error) { // Evita bucles infinitos
               this.dataset.error = "true"; 
               this.src = default_img; // Imagen de respaldo
            } else {
               this.style.display = "none"; // Si la imagen de respaldo falla, oculta la imagen
            }
         };

         const titleElement = document.createElement("p");
         titleElement.textContent = genero.NombreGenero;
         titleElement.classList.add("recomendations-title");

         // Agregar evento de clic para redirigir a la página correspondiente.
         listElement.addEventListener("click", () => {
            handleClick(genero.IdLista, "album");
         });

         listElement.appendChild(imgElement);
         listElement.appendChild(titleElement);
         container.appendChild(listElement);
      });
   } catch (error) {
      console.error('Generos Error:', error);
   }

   // Obtener la cola de reproducción actual del usuario.
   try {
      const songsResponse = await fetch(`https://echobeatapi.duckdns.org/cola-reproduccion/get-user-queue?userEmail=${encodeURIComponent(email)}`);
      if (!songsResponse.ok) throw new Error('Error la cola');

      songsData.value = await songsResponse.json();
      console.log("songsData: ", songsData.value);
      songs.value = Array.isArray(songsData.value.ColaReproduccion.canciones)
         ? songsData.value.ColaReproduccion.canciones
         : [songsData.value.ColaReproduccion.canciones];
      console.log("songsValue: ", songs.value);
      console.log(songs.value);
   } catch (error) {
      console.error('Cola Error:', error);
   }
});

/**
 * Función asíncrona para vaciar la cola de reproducción.
 * Realiza una petición a la API para limpiar la cola y, luego, elimina los elementos de la lista local con una animación.
 *
 * @async
 * @throws {Error} Si falla la petición a la API.
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

      showPopupMessage("Cola vaciada con éxito", "popup-success");

      // Agrega animación de fade-out a cada elemento de canción.
      document.querySelectorAll('.song-item').forEach((el) => {
         el.classList.add('fade-out');
      });

      // Espera a que finalice la animación antes de limpiar la lista.
      setTimeout(() => {
         songs.value = [];
      }, 500);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

/**
 * Función asíncrona para eliminar una canción específica de la cola de reproducción.
 * Envía una petición a la API y, si es exitosa, elimina la canción del array local con una animación.
 *
 * @async
 * @param {number} position - La posición de la canción en la cola.
 * @throws {Error} Si la petición a la API falla.
 */
const removeSong = async (position) => {
   try {
      const response = await fetch('https://echobeatapi.duckdns.org/cola-reproduccion/delete-song-from-queue', {
         method: 'POST',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            userEmail: email,
            posicionCola: position
         })
      });

      if (!response.ok) {
         throw new Error('Error al eliminar canción de la cola de reproducción');
      }

      showPopupMessage("Canción eliminada de la cola de reproducción con éxito", "popup-success");

      // Agrega animación de fade-out al elemento de la canción que será removida.
      const songElement = document.querySelector(`.song-item[data-index="${position}"]`);
      if (songElement) {
         songElement.classList.add('fade-out');
      }

      // Espera a que termine la animación antes de remover la canción del array.
      setTimeout(() => {
         songs.value.splice(position, 1);
      }, 500);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};
</script>

  
<style scoped>

/* Contenedor de la lista de canciones en la sidebar */
#songs-list {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Espaciado entre canciones */
}

/* Estilo de cada canción (similar al bloque "Welcome...") */
.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.3s ease-in-out;
  cursor: pointer;
}

/* Efecto hover */
.song-item:hover {
    background: #333; /* Cambio de color en hover */
    transform: scale(1.05); /* Pequeña animación de zoom */
}

/* Texto del nombre de la canción */
.song-title {
    margin: 0;
    font-size: 14px;
    flex-grow: 1; /* Ocupar el espacio disponible */
    text-align: left; /* Alinear texto a la izquierda */
    padding: 1.5vh 1.5vw; /* Más padding a los lados */
}

.song-trash-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  color: rgba(255, 255, 255, 0.5); /* Papelera apagada */
  margin-left: 10px; /* Espaciado */
}

/* Efecto al pasar el cursor */
.song-trash-btn:hover {
  transform: scale(1.3) rotate(-10deg); /* Crece y gira un poco */
  color: red; /* Se vuelve roja */
  text-shadow: 0 0 8px rgba(255, 0, 0, 0.7); /* Brillo */
}

.layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(180deg, #141414, #1e1e1e); /* Gradiente aplicado al contenedor principal */
  /*background-color: #141414;*/
  color: white;
}


.sidebar {
  width: 17%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 12px; /* Aumenta el redondeo de los bordes */
  background-color: #1e1e1e;
  margin-top: 1vh;
  margin-left: 0.7vw;
  margin-bottom: 22vh;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.4) ;
}

/* Para Webkit (Chrome, Safari, Edge) */
.sidebar::-webkit-scrollbar {
   width: 0px; /* Hace la barra de desplazamiento invisible */
}

.library {
  flex-grow: 1;
  padding: 10px 15px;
}

.library h3 {
  margin-bottom: 15px;
  font-size: 18px;
  
}

.library ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.library li {
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.library li:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffa500;
}

.content {
  flex: 1;
  padding: 10px 15px;
  background: transparent; /* Elimina el fondo sólido para usar el de .layout */
  
}

.trash-btn {
  margin-bottom: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  color: rgba(255, 255, 255, 0.5); /* Papelera apagada */
  margin-left: 10px; /* Espaciado */
}

/* Efecto al pasar el cursor */
.trash-btn:hover {
  transform: scale(1.3) rotate(-10deg); /* Crece y gira un poco */
  color: red; /* Se vuelve roja */
  text-shadow: 0 0 8px rgba(255, 0, 0, 0.7); /* Brillo */
}


.recently-played{
  padding-top:5px;
  padding-left: 20px;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 4px 6px 8px rgba(0, 0, 0, 0.4);
  height: 23.5vh;
  overflow-y: auto; 
}

/* Para Webkit (Chrome, Safari, Edge) */
.recently-played::-webkit-scrollbar {
   width: 0px; /* Hace la barra de desplazamiento invisible */
}

.playlist-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  justify-content: flex-start;
  gap: 2vh 1.5vw;
}

.playlist-item {
  display: grid;
  grid-template-columns: 60px auto; /* 🔥 Columna fija para la imagen, la otra ocupa el resto */
  align-items: center;
  width: 14vw;
  height: 5.7vh;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  transition: box-shadow 0.3s ease-in-out;
  cursor: pointer;
  overflow: hidden;
  padding: 0; /* 🔥 Asegura que no haya espacio extra */
  /*background: linear-gradient(135deg, #ffaa33, #cc5500);*/
}

.playlist-item:hover {
  box-shadow: 0px 0px 8px rgba(255, 165, 0, 0.8);
}

.playlist-image {
  width: 100%; /* La imagen ocupa toda su celda */
  height: 100%;
  border-radius: 10px 0 0 10px; /* 🔥 Bordes redondeados solo en la izquierda */
  overflow: hidden;
}

.playlist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 🔥 Se asegura de que la imagen llene el espacio */
  display: block;
}

.playlist-info {
  padding-left: 10px; /* Espaciado entre imagen y texto */
  display: flex;
  align-items: center;
  
}

.playlist-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
}


.recommendations {
  margin-top: 15px;
  padding-top:5px;
  padding-left: 20px;
  background: #1e1e1e;
  border-radius: 12px;
  height: 50vh;
  box-shadow: 4px 6px 8px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
}


.recently-played h2,
.recommendations h2 {
  font-size: 22px;
  margin-bottom: 15px;
}


/* Mantiene la estructura de 4 columnas */
#recomendations-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px 20px;
    padding: 10px;
    justify-items: center;
    align-items: center;
}

/* Diseño del item de la recomendación */
:deep(.recomendations-item) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 180px; /* Tamaño uniforme */
    height: auto;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    box-shadow: 0px 6px 10px rgba(204, 85, 0, 0.5), 
            0px 3px 6px rgba(255, 170, 51, 0.4);
}

:deep(.recomendations-item:hover) {
    transform: translate(-2px,-4px);
    box-shadow: 10px 10px 15px rgba(204, 85, 0, 0.4), 
            5px 5px 6px rgba(255, 170, 51, 0.4);
    transition: 0.2s ease-in-out;
}

/* Imagen de la portada */
:deep(.recomendations-cover) {
    width: 100%;
    height: 180px; /* Altura fija para uniformidad */
    display: block;
    border-top-right-radius: 16px;
    border-top-left-radius: 16px;
    object-fit: cover;
    flex: 1;
    min-height: 180px;
}

/* Título sobre la imagen */
:deep(.recomendations-title) {
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 8px;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
    color: #212121;
    background: linear-gradient(135deg, #ffaa33, #cc5500);
    border-radius: 0 0 12px 12px;
    text-align: center;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}

/* Responsividad */
@media (max-width: 1024px) {
    #recomendations-container {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    #recomendations-container {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .recomendations-title {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    #recomendations-container {
        grid-template-columns: repeat(1, 1fr);
    }
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
