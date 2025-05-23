<template>
  <div class="artist-profile">
      <div class="back-btn-container">
         <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
      </div>
    <h1>Perfil de {{ artistName }}</h1>

    <!-- Información del artista -->
    <div v-if="artist" class="profile-info">
      <!-- Biografía a la izquierda -->
      <div class="bio-card">
        <h2>Biografía</h2>
        <div class="bio-content">
          <img :src="artist.FotoPerfil" alt="Foto de perfil del artista" class="bio-image" />
          <p>{{ artist.Biografia || "Biografía no disponible" }}</p>
        </div>
      </div>

      <!-- Discografía sin carrusel, con barra de desplazamiento si es necesario -->
      <div v-if="discografia.length" class="discography-card">
        <h2>Discografía</h2>
        <div class="albums-container">
          <div v-for="(album, index) in discografia.slice(0, 3)" :key="album.Id" class="album-card" @click="redirectToAlbum(album.Id)">
            <img :src="album.Portada" alt="Portada del álbum" />
            <p>{{ album.Nombre }}</p>
          </div>
        </div>
        <div v-if="discografia.length > 3" class="scroll-container">
          <button class="scroll-button" @click="scrollAlbums('left')">←</button>
          <div class="scrollable-albums">
            <div class="albums-container">
              <div v-for="(album, index) in discografia.slice(3)" :key="album.Id" class="album-card">
                <img :src="album.Portada" alt="Portada del álbum" />
                <p>{{ album.Nombre }}</p>
              </div>
            </div>
          </div>
          <button class="scroll-button" @click="scrollAlbums('right')">→</button>
        </div>
      </div>
    </div>

    <!-- Carrusel de canciones -->
    <div v-if="topCanciones.length" class="top-songs-card">
      <h2>Top 5 Canciones</h2>
      <div class="carousel-container">
        <div
          class="carousel"
          :style="{
            transform: `translateX(-${currentSongIndex * 100}%)`,
            transition: 'transform 0.5s ease-in-out',
          }"
        >
          <div
            v-for="(cancion, index) in topCanciones"
            :key="cancion.Id"
            class="carousel-item"
            :style="{
              backgroundImage: `url(${cancion.Portada})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }" 
            @click="Song(cancion)"
            >
            <div class="song-info">
              <p>{{ cancion.Nombre }}</p>
              <span>{{ cancion.NumReproducciones }} reproducciones</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Si no hay datos -->
    <div v-else>
      <p>Cargando información del artista...</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';
import { useRouter } from 'vue-router';  // Importar Vue Router para redirigir

/**
 * Función inyectada para reproducir canciones.
 * Se espera que el componente padre provea esta función mediante la API de inyección de Vue.
 *
 * @type {Function}
 */
const playSong = inject('playSong');

/**
 * Función inyectada para reproducir desde una búsqueda (playFromQuest).
 * Permite vaciar la cola y reproducir una nueva canción.
 *
 * @type {Function}
 */
const playFromQuest = inject('playFromQuest');

/**
 * Propiedades que recibe el componente.
 * - artistName: Nombre del artista (requerido).
 *
 * @typedef {object} Props
 * @property {string} artistName - Nombre del artista.
 */
const props = defineProps({
  artistName: {
    type: String,
    required: true
  }
});

/** 
 * Estado reactivo que almacena los datos del artista.
 * @type {Ref<object|null>}
 */
const artist = ref(null);

/**
 * Estado reactivo que contiene la discografía del artista.
 * @type {Ref<Array>}
 */
const discografia = ref([]);

/**
 * Estado reactivo que contiene las top canciones del artista.
 * @type {Ref<Array>}
 */
const topCanciones = ref([]);

/**
 * Índice actual para el carrusel de canciones.
 * @type {Ref<number>}
 */
const currentSongIndex = ref(0);

/**
 * Índice actual para el carrusel de álbumes.
 * @type {Ref<number>}
 */
const currentAlbumIndex = ref(0);

/**
 * Intervalo reactivo para el carrusel de canciones.
 * @type {Ref<number|null>}
 */
const songCarouselInterval = ref(null);

/**
 * Intervalo reactivo para el carrusel de álbumes.
 * @type {Ref<number|null>}
 */
const albumCarouselInterval = ref(null);

/**
 * Instancia del router para gestionar redirecciones.
 * @type {object}
 */
const router = useRouter();

/**
 * Función para regresar a la página anterior utilizando el router.
 */
const goBack = () => {
   router.back();
};

/**
 * Llama a la API para obtener la información del artista, discografía y top canciones.
 * Además, inicia los carruseles de canciones y álbumes.
 *
 * @async
 * @param {string} artistName - Nombre del artista a buscar.
 * @throws {Error} Si falla la petición a la API.
 */
const fetchArtistData = async (artistName) => {
  try {
    const response = await fetch(`https://echobeatapi.duckdns.org/artistas/perfil?artistName=${encodeURIComponent(artistName)}`);
    if (!response.ok) throw new Error('Error al obtener la información del artista');
    const data = await response.json();
    
    artist.value = data.artista;
    discografia.value = data.discografia;
    topCanciones.value = data.topCanciones;
    
    // Iniciar los carruseles una vez cargados los datos
    startSongCarousel();
    startAlbumCarousel();
  } catch (error) {
    console.error('Error al obtener los datos del artista:', error);
  }
};

/**
 * Inicia el carrusel de canciones que actualiza el índice de la canción actual cada 3 segundos.
 */
const startSongCarousel = () => {
  songCarouselInterval.value = setInterval(() => {
    currentSongIndex.value = (currentSongIndex.value + 1) % topCanciones.value.length;
  }, 3000); // Cambia de canción cada 3 segundos
};

/**
 * Inicia el carrusel de álbumes que actualiza el índice del álbum actual cada 3 segundos.
 */
const startAlbumCarousel = () => {
  albumCarouselInterval.value = setInterval(() => {
    currentAlbumIndex.value = (currentAlbumIndex.value + 1) % discografia.value.length;
  }, 3000); // Cambia de álbum cada 3 segundos
};

/**
 * Detiene los intervalos de los carruseles cuando el componente se desmonte.
 * Se utiliza el hook de ciclo de vida onBeforeUnmount para evitar memory leaks.
 */
onBeforeUnmount(() => {
  clearInterval(songCarouselInterval.value);
  clearInterval(albumCarouselInterval.value);
});

/**
 * Hook de ciclo de vida: onMounted.
 * Se ejecuta cuando el componente se ha montado y se inicia la obtención de datos del artista.
 */
onMounted(() => {
  fetchArtistData(props.artistName);
});

/**
 * Redirige a la página del álbum, pasando el id del álbum como query parameter.
 *
 * @param {string} albumId - Identificador del álbum.
 */
const redirectToAlbum = (albumId) => {
  router.push({ path: '/album', query: { id: albumId } });
};

/**
 * Función para reproducir una canción.
 * Llama a la función inyectada playFromQuest para limpiar la cola y reproducir la canción seleccionada.
 *
 * @param {object} cancion - Objeto que representa la canción a reproducir.
 */
const Song = (cancion) => {
  console.log("Reproduciendo canción con ID:", cancion.Id);
  
  if (playFromQuest) {
    // Se pasa la canción a playFromQuest para la reproducción
    playFromQuest(cancion);
  }
};

/**
 * Watcher que observa cambios en la propiedad 'artistName'.
 * Al detectar un cambio, limpia los datos actuales y vuelve a llamar a fetchArtistData para cargar la nueva información.
 */
watch(() => props.artistName, (newArtistName) => {
  // Limpiar datos previos antes de cargar el nuevo artista
  artist.value = null;
  discografia.value = [];
  topCanciones.value = [];
  fetchArtistData(newArtistName);
});
</script>

<style scoped>
/* Estilo base para el fondo de la página */
.artist-profile {
   display: flex;
   flex-direction: column;
   height: 100vh;
   background: linear-gradient(180deg, #141414 15%, #4a1e04 40%, #8a3a10 60%, #ffb347 100%);
   color: white;
   margin-top: -25px;
   background-attachment: fixed;
   overflow-y: auto; /* Permite desplazarse por la página */
   
}
h1 {
   color: #ffa500;
   text-align: center;
   margin-bottom: 20px;
}

.profile-info {
   display: flex;
   justify-content: space-between;
   margin-bottom: 30px;
   padding: 10px;
   gap: 40px; /* Más espacio entre la biografía y la discografía */
}

/* Tarjetas de Biografía y Discografía */
.bio-card, .discography-card, .top-songs-card {
   background-color: #1e1e1e;
   padding: 15px;
   border-radius: 12px;
   box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
   transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out;
}
.discography-card {
   flex-grow: 1; /* Hace que la discografía ocupe el espacio restante */
}

.bio-card:hover, .discography-card:hover, .top-songs-card:hover {
   transform: scale(1.05); /* Efecto de zoom */
   box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4); /* Aumentar sombra */
   cursor: pointer; /* Cambiar el cursor al pasar el ratón */
   background-color: #ffa500; /* Cambiar el fondo a naranja */
}

.bio-card h2, .discography-card h2, .top-songs-card h2 {
   color: #fff;
   font-size: 1.4rem;
   text-align: center; /* Centrar el texto de los títulos */
}

/* Estilo de la biografía */
.bio-content {
   display: block;
   text-align: justify;
   gap: 20px;
   align-items: center;
   overflow-y: auto;
   max-height: 300px;
   padding-right: 10px; /* Añadir más espacio a la derecha */
}

.bio-image {
   width: 200px; /* Imagen del artista más grande */
   height: 200px;
   border-radius: 12px;
   object-fit: cover;
   border: 3px solid #ffa500;
   margin-bottom: 10px; /* Espacio entre la imagen y el texto */
   margin-left: 35px;
}

.bio-card {
   width: 300px; /* Fija el tamaño de la biografía */
   flex-shrink: 0;
   display: flex;
   flex-direction: column;
   align-items: center; /* Centrar la imagen de la biografía */
}

/* Personalización de la barra de desplazamiento de la biografía */
.bio-content::-webkit-scrollbar {
   width: 8px;
}

.bio-content::-webkit-scrollbar-track {
   background: #333;
   border-radius: 10px;
}

.bio-content::-webkit-scrollbar-thumb {
   background-color: #ffa500;
   border-radius: 10px;
   border: 2px solid #4a1e04;
}

.bio-content::-webkit-scrollbar-thumb:hover {
   background-color: #ff5722;
}

/* Estilo de los álbumes */
.album-carousel-container,
.carousel-container {
   overflow: hidden;
   position: relative;
   max-width: 600px;
   margin: 0 auto;
}

.carousel {
   display: flex;
   transition: transform 0.5s ease-in-out;
}

.carousel-item {
   min-width: 100%;
   text-align: center;
   position: relative;
   height: 250px;
}

.carousel-item .song-info,
.album-info {
   position: absolute;
   bottom: 10px;
   left: 0;
   right: 0;
   color: white;
   background: rgba(0, 0, 0, 0.5);
   padding: 10px;
}

.carousel-item p {
   font-size: 1.2rem;
   font-weight: bold;
}

.carousel-item span {
   font-size: 1rem;
}

.album-info {
   text-align: center;
}

.carousel-item img {
   width: 100%;
   height: 100%;
   object-fit: cover;
   border-radius: 12px;
   transition: transform 0.3s ease-in-out;
}

.carousel-item img:hover {
   transform: scale(1.05);
}

.top-songs-card {
   margin-top: 20px;
   margin-bottom: 200px;
   text-align: center;
   background-color: #1e1e1e;
   padding: 15px;
   border-radius: 12px;  
}

.top-songs-card h2 {
   margin-top: 20px;
   font-size: 1.5rem;
}

.top-songs-card:hover {
   background-color: #ffa500;
   transform: scale(1.05);
   box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
   cursor: pointer;
}

/* Estilo para los álbumes estáticos */
.albums-container {
   display: flex;
   gap: 200px; /* Controla el espacio entre las imágenes */
   flex-wrap: wrap;
   justify-content: center; /* Asegura que los álbumes estén centrados */
}

.album-card {
   background-color: transparent; /* Eliminar el fondo gris */
   padding: 10px;
   border-radius: 8px;
   text-align: center;
   width: 180px;
}

.album-card img {
   width: 200px;
   height: 200px; /* Aumento la altura de las imágenes */
   object-fit: cover;
   border-radius: 50%; /* Hace que la imagen sea redonda */
}

.album-card p {
   margin-top: 10px;
   color: #fff;
   font-size: 1rem;
   font-weight: bold;
   text-align: center;
   text-overflow: ellipsis;
   margin-left: 10px;
}

/* Personalización de la barra de desplazamiento de los álbumes */
.scrollable-albums::-webkit-scrollbar {
   height: 8px;
}

.scrollable-albums::-webkit-scrollbar-track {
   background: #333;
   border-radius: 10px;
}

.scrollable-albums::-webkit-scrollbar-thumb {
   background-color: #ffa500;
   border-radius: 10px;
   border: 2px solid #4a1e04;
}

.scrollable-albums::-webkit-scrollbar-thumb:hover {
   background-color: #ff5722;
}

/* Contenedor para las barras de desplazamiento */
.scroll-container {
   display: flex;
   justify-content: center;
   align-items: center;
   margin-top: 10px;
   gap: 10px;
}

.scroll-button {
   background-color: #ffa500;
   padding: 10px;
   border: none;
   border-radius: 8px;
   color: #fff;
   cursor: pointer;
}

.scroll-button:hover {
   background-color: #ff5722;
}

/* Ajustes de desplazamiento para los álbumes */
.scrollable-albums {
   overflow-x: auto;
   white-space: nowrap;
   max-width: 100%;
   display: flex;
}

/* Estilo de la barra de desplazamiento de la página */
.artist-profile::-webkit-scrollbar {
   width: 10px;
}

.artist-profile::-webkit-scrollbar-track {
   background: #333;
   border-radius: 10px;
}

.artist-profile::-webkit-scrollbar-thumb {
   background-color: #ffa500;
   border-radius: 10px;
   border: 2px solid #4a1e04;
}

.artist-profile::-webkit-scrollbar-thumb:hover {
   background-color: #ff5722;
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

</style>
