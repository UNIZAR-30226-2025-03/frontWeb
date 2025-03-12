<template>
   
     <div class="playlist-container">
       <div class="playlist-header">
         <img :src="playlist.cover" alt="Cover" class="playlist-cover" />
         <div class="playlist-info">
           <h1>{{ playlist.name }}</h1>
           <p>{{ playlist.author }}</p>
           <p>{{ playlist.description }}</p>
           <p>{{ playlist.genre }} - {{ playlist.likes }} Likes</p>
         </div>
       </div>
 
       <div class="playlist-actions">
         <button>🔀</button>
         <button>▶️</button>
         <input v-model="searchTerm" placeholder="Buscar canción" />
         <select v-model="sortOption" @change="sortSongs">
           <option value="default">Predefinido</option>
           <option value="artist">Artista</option>
           <option value="plays">Reproducciones</option>
           <option value="album">Álbum</option>
         </select>
       </div>
 
       <ul class="song-list">
         <li v-for="(song, index) in filteredSongs" :key="song.id" class="song-item">
           <div class="song-info">
             <!-- Nombre y Artista + Duración -->
             <div class="song-name-artist">
               <p>{{ song.name }} - {{ song.artist }} ({{ song.duration }})</p>
             </div>
 
             <!-- Álbum -->
             <div class="song-album">
               <p v-if="playlist.type === 'playlist'">Álbum: {{ song.album }}</p>
             </div>
 
             <!-- Reproducciones -->
             <div class="song-plays">
               <p>Reproducciones: {{ song.plays }}</p>
             </div>
 
             <!-- Botones -->
             <div class="song-buttons">
               <button>❤️</button>
               <button>▶️</button>
               <button v-if="isOwner" @click="moveUp(index)">⬆️</button>
               <button v-if="isOwner" @click="moveDown(index)">⬇️</button>
             </div>
           </div>
         </li>
       </ul>
     </div>
  
 </template>
 
 <script setup>
 import { ref, computed } from 'vue';
 
 const playlist = ref({
   name: 'Mi Playlist',
   author: 'Usuario',
   description: 'Descripción de la playlist',
   genre: 'Pop',
   likes: 120,
   type: 'playlist',
   cover: 'https://via.placeholder.com/150',
   songs: [
     { id: 1, name: 'Canción 1', artist: 'Artista A', album: 'Álbum X', duration: '3:45', plays: 100 },
     { id: 2, name: 'Canción 2', artist: 'Artista B', album: 'Álbum Y', duration: '4:12', plays: 80 },
     { id: 3, name: 'Canción 3', artist: 'Artista A', album: 'Álbum Z', duration: '3:30', plays: 150 },
     { id: 4, name: 'Canción 4', artist: 'Artista C', album: 'Álbum X', duration: '4:00', plays: 200 },
     { id: 5, name: 'Canción 5', artist: 'Artista D', album: 'Álbum Y', duration: '5:10', plays: 50 },
     { id: 6, name: 'Canción 6', artist: 'Artista A', album: 'Álbum Z', duration: '2:50', plays: 120 },
     { id: 7, name: 'Canción 7', artist: 'Artista B', album: 'Álbum X', duration: '4:30', plays: 90 },
     { id: 8, name: 'Canción 8', artist: 'Artista C', album: 'Álbum Y', duration: '3:15', plays: 110 },
     { id: 9, name: 'Canción 9', artist: 'Artista D', album: 'Álbum Z', duration: '4:20', plays: 75 },
     { id: 10, name: 'Canción 10', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 },
     { id: 11, name: 'Canción 11', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 }
   ]
 });
 
 const searchTerm = ref('');
 const sortOption = ref('default');
 const isOwner = ref(true);
 
 const filteredSongs = computed(() => {
   let songs = [...playlist.value.songs];
   if (searchTerm.value) {
     songs = songs.filter(song => song.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
   }
   return songs;
 });
 
 function sortSongs() {
   if (sortOption.value === 'artist') {
     playlist.value.songs.sort((a, b) => a.artist.localeCompare(b.artist) || a.name.localeCompare(b.name));
   } else if (sortOption.value === 'plays') {
     playlist.value.songs.sort((a, b) => b.plays - a.plays);
   } else if (sortOption.value === 'album') {
     playlist.value.songs.sort((a, b) => a.album.localeCompare(b.album));
   }
 }
 
 function moveUp(index) {
   if (index > 0) {
     const songs = playlist.value.songs;
     [songs[index - 1], songs[index]] = [songs[index], songs[index - 1]];
   }
 }
 
 function moveDown(index) {
   if (index < playlist.value.songs.length - 1) {
     const songs = playlist.value.songs;
     [songs[index], songs[index + 1]] = [songs[index + 1], songs[index]];
   }
 }
 </script>
 
 <style scoped>
 .playlist-container {
  width: 100%;
  height: calc(100vh - 22vh); /* Restamos la altura de la barra de reproducción */
  padding: 20px;
  background-color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  margin-top: 6px;
}

.playlist-header {
  display: flex;
  align-items: center; /* Centra verticalmente la portada y la información */
  gap: 20px; /* Añade espacio entre la portada y la información */
  justify-content: center; /* Centra horizontalmente los elementos */
  flex-wrap: wrap; /* Permite que los elementos se ajusten cuando el espacio es pequeño */
  margin-bottom: 30px; /* Espacio debajo de la cabecera */
}

.playlist-info {
  color: white;
  text-align: left; /* Cambiado a left para mantener los textos alineados a la izquierda */
  max-width: 500px; /* Limita el ancho de la información */
}

.playlist-info h1 {
  margin: 10px 0;
  font-size: 2rem;
  font-weight: bold;
}

.playlist-info p {
  margin: 5px 0;
  font-size: 1rem;
}

.playlist-actions {
  display: flex;
  justify-content: center;  /* Centra los elementos */
  align-items: center;
  gap: 20px;  /* Espaciado entre los elementos */
  margin-bottom: 20px;
  width: 100%; /* Asegura que ocupe todo el ancho disponible */
}

.playlist-actions input,
.playlist-actions select,
.playlist-actions button {
  background-color: #444;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: white;
}

.playlist-actions input {
  width: 200px;  /* Tamaño fijo para la barra de búsqueda */
}

.playlist-actions select {
  width: 150px;  /* Tamaño fijo para el select */
}

.playlist-actions button {
  padding: 10px 15px;  /* Un poco más de tamaño en los botones */
}
 
.song-list {
  width: 90%;
  max-height: calc(100vh - 240px); /* Deja espacio para la barra de reproducción y otros márgenes */
  overflow-y: auto;
}
 
 .song-list li {
   margin: 10px 0;
   background-color: #444;
   padding: 10px;
   border-radius: 8px;
   list-style: none;
 }
 
 .song-info {
   display: flex;
   justify-content: space-between;
   align-items: center;
 }
 
 .song-name-artist,
 .song-album,
 .song-plays,
 .song-buttons {
   width: 20%; /* Ajusta el tamaño de cada columna */
   text-align: center;
 }
 
 h1 {
   margin-top: 60px;
 }
 
 .button {
   background-color: #333;
   border: none;
   padding: 8px;
   border-radius: 8px;
   cursor: pointer;
   transition: background 0.3s;
 }
 
 .button:hover {
   background-color: #555;
 }
 
 .button img {
   width: 22px;
   height: 22px;
   filter: brightness(0) invert(1);
 }
 
 .controls-container {
   display: flex;
   gap: 12px;
   align-items: center;
 }
 </style>
 