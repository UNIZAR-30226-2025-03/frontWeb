<template>
  <div class="artist-profile">
    <h1>Perfil del Artista: {{ artistName }}</h1>
    <!-- Mostrar la información del artista -->
    <div v-if="artist">
      <img :src="artist.FotoPerfil" alt="Foto de perfil del artista" v-if="artist.FotoPerfil"/>
      <p>{{ artist.Biografia }}</p>
      <!-- Aquí puedes mostrar la discografía y las canciones -->
      <div v-if="discografia.length">
        <h2>Discografía</h2>
        <ul>
          <li v-for="album in discografia" :key="album.Id">
            <img :src="album.Portada" alt="Portada del álbum" />
            <p>{{ album.Nombre }}</p>
          </li>
        </ul>
      </div>
      <div v-if="topCanciones.length">
        <h2>Top 5 Canciones</h2>
        <ul>
          <li v-for="cancion in topCanciones" :key="cancion.Id">
            <p>{{ cancion.Nombre }}</p>
            <span>{{ cancion.NumReproducciones }} reproducciones</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <p>Cargando información del artista...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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

// Llamada a la API para obtener la información del artista
const fetchArtistData = async (artistName) => {
  try {
    const response = await fetch(`https://echobeatapi.duckdns.org/artistas/perfil?artistName=${encodeURIComponent(artistName)}`);
    if (!response.ok) throw new Error('Error al obtener la información del artista');
    const data = await response.json();
    
    artist.value = data.artista;
    discografia.value = data.discografia;
    topCanciones.value = data.topCanciones;
  } catch (error) {
    console.error('Error al obtener los datos del artista:', error);
  }
};

// Llamar a la función cuando el componente se monte
onMounted(() => {
  fetchArtistData(props.artistName);
});
</script>

<style scoped>
.artist-profile {
  color: white;
  padding: 20px;
  background-color: #333;
}

.artist-profile h1 {
  color: #ffa500;
}

.artist-profile img {
  width: 200px;
  height: 200px;
  border-radius: 10px;
}

.artist-profile ul {
  list-style-type: none;
}

.artist-profile li {
  margin-bottom: 10px;
}

.artist-profile p {
  font-size: 1rem;
  color: #bbb;
}
</style>
