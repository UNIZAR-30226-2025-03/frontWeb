<template>
   <div class="layout">
     <div class="album-container">
       <div class="back-btn-container">
          <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
       </div>
       <div class="album-header">
         <img :src="albumInfo.portada" alt="Album" @error="handleImageError($event)">
         <div class="album-info">
           <h1>{{ albumInfo.nombre }}</h1>
           <div class="album-autor">
               <p>{{ albumInfo.autor }}</p>
               <p> Fecha de lanzamiento: {{ formatDate(albumInfo.fechaLanzamiento) }} </p>
            </div>
           <p>{{ albumInfo.numCanciones }} canciones</p>
           <p>{{ albumInfo.numLikes }} Likes</p>
           <p>{{ albumInfo.numReproducciones }} Reproducciones</p>
         </div>
 
       </div>
 
       <div class="song-container">
         <div class="album-actions">
             <button class="button-action" @click="randomClick">
                <img :src="randomIcon" alt="random" :class="{ 'glow-effect': isGlowing }" />
             </button>
             <input v-model="searchTerm" placeholder="Buscar canción" />
             <button @click="playAlbum" class="button-action">  
                <img :src= "playIcon" alt="Play/Pause" />
             </button>
         </div>
 
         <hr>
 
         <draggable :list="filteredAlbum" tag="ul" class="song-list" item-key="id" animation="200" ghost-class="drag-ghost">
           <template #item="{ element, index }">
             <li class="song-item" :key="element.id || index">
               <div class="song-info">
                 <div class="song-cover">
                   <img :src="element.portada" :alt="element.nombre" @error="handleImageError($event)" />
                 </div>
 
                 <div class="song-name-artist">
                   <p>{{ element.nombre }} ({{ formatTime(element.duracion) }})</p>
                 </div>
 
                 <div class="song-plays">
                   <p>Reproducciones: {{ element.numReproducciones }}</p>
                 </div>
 
                 <div class="song-buttons">
                   <button @click="addSongToFavorites(element)">❤️</button>
                   <button @click="playNewSong(element,index)">▶️</button>
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
import { ref, onMounted, watch, inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import randomIcon from '@/assets/random-button.png';
import default_img from '@/assets/kebab.jpg';
import playIcon from '@/assets/play-circle.svg';

const playSong = inject('playSong')
 
// Variables para CSS y HTML
const isGlowing = ref(false);
const router = useRouter();

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
 
const filteredAlbum = computed(() => {
   if (!searchTerm.value.trim()) {
      return album.value; // Si no hay búsqueda, mostrar todo el álbum
   }

   return album.value.filter(song =>
      song.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
   );
});
 
const goBack = () => {
   router.back();
};
 
const route = useRoute();
const Id = route.query.id;

console.log('ID del album:', Id);
 
const albumInfo = ref({}); // Inicializado como objeto vacío
const album = ref([]); // Inicializado como array vacío
const searchTerm = ref('');
 
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
      throw new Error('Error al reproducir álbum');
   }
   const albumResponse = await response.json();
   console.log("album response: ", albumResponse );

   playSong(newSong);
}
 
onMounted(async () => {
   try {
      // OBTENER INFO DEL ÁLBUM
      const infoResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/album/${Id}`);
      if (!infoResponse.ok) throw new Error('Error al obtener la información del álbum');
      
      albumInfo.value = await infoResponse.json();
      console.log("✅ AlbumInfo cargada: ", albumInfo.value);
   
      //  OBTENER CANCIONES DEL ÁLBUM
      const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/${Id}/songs`);
      if (!songsResponse.ok) throw new Error('Error al obtener las canciones del álbum');
   
      songsData.value = await songsResponse.json();
      console.log("✅ SongsData recibido: ", songsData.value);
   
      // VERIFICAR SI LOS DATOS ESTÁN BIEN FORMATEADOS
      if (!songsData.value || !Array.isArray(songsData.value.canciones)) {
         throw new Error('Las canciones no llegaron en formato de array');
      }
 
      // ASIGNAR LAS CANCIONES A `álbum`
      album.value = songsData.value.canciones;
      console.log("✅ Álbum final cargado:", album.value);
 
   } catch (error) {
      console.error('Error al cargar el álbum:', error);
   }
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

function formatDate(isoString) {
   const date = new Date(isoString);
   const day = date.getUTCDate().toString().padStart(2, '0');
   const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
   const year = date.getUTCFullYear();
   
   return `${day}-${month}-${year}`;
}
 
const playAlbum = async () => {
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
         throw new Error('Error al reproducir álbum');
      }
      const albumResponse = await response.json();
      console.log("album response: ", albumResponse );

      const song = await fetch(`https://echobeatapi.duckdns.org/playlists/song-details/${albumResponse.primeraCancionId}`)
      
      if (!song.ok) {
         throw new Error('Error al reproducir la canción ');
      }
      const songData = await song.json();
      const newSong = {
         Id: albumResponse.primeraCancionId,
         Nombre: songData.Nombre,
         Portada: songData.Portada,
         Duracion: songData.Duracion,
      };
      playSong(newSong);
 
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
}
 
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

watch(() => route.query.id, async (newId, oldId) => {
   if (!newId || newId === oldId) return;

   try {
      // OBTENER INFO DEL ÁLBUM
      const infoResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/album/${newId}`);
      if (!infoResponse.ok) throw new Error('Error al obtener la información del álbum');

      albumInfo.value = await infoResponse.json();

      // OBTENER CANCIONES DEL ÁLBUM
      const songsResponse = await fetch(`https://echobeatapi.duckdns.org/playlists/${newId}/songs`);
      if (!songsResponse.ok) throw new Error('Error al obtener las canciones del álbum');

      songsData.value = await songsResponse.json();

      if (!songsData.value || !Array.isArray(songsData.value.canciones)) {
         throw new Error('Las canciones no llegaron en formato de array');
      }

      album.value = songsData.value.canciones;
      searchTerm.value = ''; // Resetea la búsqueda
   } catch (error) {
      console.error('Error al actualizar el álbum:', error);
   }
});
 
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
 
.album-container {
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
 
.album-header {
   min-height: 20vh;
   display: flex;
   align-items: center;
   gap: 20px;
   justify-content: center;
   flex-wrap: wrap;
   margin-bottom: 30px; 
}
 
.album-header img {
   width: 15vw;
   height: 15vw;
   object-fit: cover; /* Hace que la imagen llene el div sin deformarse */
   border-radius: 8px; /* Mantiene el mismo borde redondeado */
}
 
 
.album-info {
   color: white;
   text-align: left;
   max-width: 500px;
}
 
.album-info h1 {
   margin: 10px 0;
   font-family: 'Montserrat', sans-serif;
   font-size: 2rem;
   font-weight: bold;
   color: #ffb347;  /* Naranja brillante */
   text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5); /* Sombra para mejor legibilidad */
   letter-spacing: 1px;
}

.album-autor p{
   margin: 5px 0;
   font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
   font-size: 1.4rem;
   font-weight: 400;
   margin: 4px 0; /* Espaciado entre líneas */
}
 
.album-info > p {
   margin: 5px 0;
   font-family: 'Inter', sans-serif;
   font-size: 1.2rem;
   font-weight: 400;
   color: #d4d4d4; /* Gris claro para legibilidad */
   opacity: 0.8; /* Hace que el texto sea un poco más suave */
   margin: 4px 0; /* Espaciado entre líneas */
}
 
.album-actions {
   display: flex;
   justify-content: center;
   align-items: center;
   gap: 20px;
   margin-bottom: 20px;
   width: 100%;
}
 
.album-actions input,
.album-actions select,
.album-actions button {
   background-color: #2d1405;
   border: none;
   padding: 10px;
   border-radius: 10px;
   color: white;
   font-weight: bold;
   transition: background 0.3s, border 0.3s;
}
 
.album-actions input {
   width: 220px;
   background-color: #8A3A1B;   
}

.album-actions input::placeholder {
   color: white; /* Color del placeholder dorado para mejor visibilidad */
   opacity: 0.5;
}
 
.album-actions select {
   width: 160px;
   background-color: transparent;
   color: white;
   opacity: 0.5;
}

.album-actions button {
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
  