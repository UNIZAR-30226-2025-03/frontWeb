<template>
  <div class="artist-profile">
    <h1>Perfil de {{ artistName }}</h1>

    <!-- Información del artista -->
    <div v-if="artist" class="profile-info">
      <div class="bio-card">
        <h2>Biografía</h2>
        <div class="bio-content">
          <img :src="artist.FotoPerfil" alt="Foto de perfil del artista" class="bio-image" />
          <p>{{ artist.Biografia || "Biografía no disponible" }}</p>
        </div>
      </div>

      <!-- Carrusel de discografía en la parte superior derecha -->
      <div v-if="discografia.length" class="discography-card">
        <h2>Discografía</h2>
        <div class="album-carousel-container">
          <div
            class="carousel"
            :style="{
              transform: `translateX(-${currentAlbumIndex * 100}%)`,
              transition: 'transform 0.5s ease-in-out',
            }"
          >
            <div
              v-for="(album, index) in discografia"
              :key="album.Id"
              class="carousel-item"
              :style="{
                backgroundImage: `url(${album.Portada})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }"
            >
              <div class="album-info">
                <p>{{ album.Nombre }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Carrusel de canciones centrado -->
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
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Definir las propiedades que recibirá el componente
const props = defineProps({
  artistName: {
    type: String,
    required: true
  }
});

// Variables reactivas para almacenar los datos del artista
const artist = ref(null);
const discografia = ref([]);
const topCanciones = ref([]);

// Carruseles
const currentSongIndex = ref(0);
const currentAlbumIndex = ref(0);
const songCarouselInterval = ref(null);
const albumCarouselInterval = ref(null);

// Llamada a la API para obtener la información del artista
const fetchArtistData = async (artistName) => {
  try {
    const response = await fetch(`https://echobeatapi.duckdns.org/artistas/perfil?artistName=${encodeURIComponent(artistName)}`);
    if (!response.ok) throw new Error('Error al obtener la información del artista');
    const data = await response.json();
    
    artist.value = data.artista;
    discografia.value = data.discografia;
    topCanciones.value = data.topCanciones;
    
    // Iniciar los carruseles
    startSongCarousel();
    startAlbumCarousel();
  } catch (error) {
    console.error('Error al obtener los datos del artista:', error);
  }
};

// Iniciar el carrusel de canciones
const startSongCarousel = () => {
  songCarouselInterval.value = setInterval(() => {
    currentSongIndex.value = (currentSongIndex.value + 1) % topCanciones.value.length;
  }, 3000); // Cambia de canción cada 3 segundos
};

// Iniciar el carrusel de álbumes
const startAlbumCarousel = () => {
  albumCarouselInterval.value = setInterval(() => {
    currentAlbumIndex.value = (currentAlbumIndex.value + 1) % discografia.value.length;
  }, 3000); // Cambia de álbum cada 3 segundos
};

// Detener los carruseles cuando el componente se desmonte
onBeforeUnmount(() => {
  clearInterval(songCarouselInterval.value);
  clearInterval(albumCarouselInterval.value);
});

// Llamar a la función cuando el componente se monte
onMounted(() => {
  fetchArtistData(props.artistName);
});
</script>

<style scoped>
.artist-profile {
  padding: 20px;
  background-color: #333;
  color: white;
  padding-bottom: 150px; /* Añadido espacio para evitar que se solape con la barra del reproductor */
}

h1 {
  color: #ffa500;
  text-align: center;
}

.profile-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}

.bio-card, .discography-card, .top-songs-card {
  background-color: #444;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.bio-card h2, .discography-card h2, .top-songs-card h2 {
  color: #ffa500;
}

.bio-content {
  display: flex;
  gap: 20px;
  flex: 1;
}

.bio-image {
  width: 150px;
  height: 150px;
  border-radius: 10px;
}

.album-carousel-container,
.carousel-container {
  overflow: hidden;
  position: relative;
  max-width: 500px;
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
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
}

.carousel-item p {
  font-size: 1.2rem;
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
}

/* Ajustes para evitar solapamientos */
.top-songs-card {
  margin-top: 20px; /* Espacio entre el carrusel de canciones y la barra de reproductor */
  margin-bottom: 40px; /* Añadir más espacio para que no se solape con la barra inferior */
}


</style>
