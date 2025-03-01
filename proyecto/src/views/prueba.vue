<template>
    <div v-if="playlists.length > 0">
      <div v-for="(playlist, index) in playlists" :key="index" class="playlist-container">
        <h1>🎵 {{ playlist.Nombre }}</h1>
        <p><strong>Género:</strong> {{ playlist.Genero }}</p>
        <p><strong>Autor:</strong> {{ playlist.EmailAutor }}</p>
        <p><strong>Privada:</strong> {{ playlist.EsPrivada === 'true' ? 'Sí' : 'No' }}</p>
  
        <h2>📀 Detalles del Álbum</h2>
        <p><strong>Nombre:</strong> {{ playlist.lista.Nombre }}</p>
        <p><strong>Número de canciones:</strong> {{ playlist.lista.NumCanciones }}</p>
        <p><strong>Duración:</strong> {{ playlist.lista.Duracion }} segundos</p>
        <p><strong>Likes:</strong> {{ playlist.lista.NumLikes }}</p>
        <p><strong>Descripción:</strong> {{ playlist.lista.Descripcion }}</p>
  
        <img :src="playlist.lista.Portada" class="album-cover" alt="Portada del álbum"/>
      </div>
    </div>
  
    <p v-else class="loading">Cargando...</p>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const email = 'a@gmail.com';
  const playlists = ref([]);
  const lastSong = ref([]);
//Recoge datos referentes a playlists y cancion
  onMounted(async () => {
    try {
      const response = await fetch(`http://48.209.24.188:3000/playlists/user?userEmail=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Error al obtener datos de las playlist');
  
      const data = await response.json();
      
      // Verifica si la API devuelve un array o un objeto
      playlists.value = Array.isArray(data) ? data : [data];
  
      console.log(playlists.value); // 🔥 Ver en la consola

    // Obtener la última canción
    const songResponse = await fetch(`http://48.209.24.188:3000/users/last-played?userEmail=${encodeURIComponent(email)}`);
    if (!songResponse.ok) throw new Error('Error al obtener datos de la última canción');
    
    const songData = await songResponse.json();
    lastSong.value = Array.isArray(songData) ? songData : [songData];

    console.log('Última canción:', lastSong.value);
    } catch (error) {
    console.error('Error:', error);
    }
  });

  </script>
  
  <style scoped>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .playlist-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    width: 400px;
    margin: 10px;
    text-align: center;
  }
  
  h1 {
    font-size: 24px;
    color: #333;
  }
  
  h2 {
    font-size: 20px;
    color: #555;
    margin-top: 20px;
  }
  
  p {
    font-size: 16px;
    color: #666;
    margin: 5px 0;
  }
  
  strong {
    color: #222;
  }
  
  .album-cover {
    display: block;
    width: 100%;
    max-width: 200px;
    border-radius: 8px;
    margin: 10px auto;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .loading {
    text-align: center;
    font-size: 18px;
    color: #777;
  }
  </style>
  