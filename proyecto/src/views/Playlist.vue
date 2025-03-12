<template>
   <div class="layout">
     
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
        

        <div class="song-container">
          <div class="playlist-actions">
            <button class="button-action">🔀</button>
            <button class="button-action">▶️</button>
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
      </div>
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
     { id: 11, name: 'Canción 11', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 },
     { id: 12, name: 'Canción 12', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 },
     { id: 13, name: 'Canción 13', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 },
     { id: 14, name: 'Canción 14', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 },
     { id: 15, name: 'Canción 15', artist: 'Artista A', album: 'Álbum X', duration: '3:40', plays: 130 }
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
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 30px; 
}

.playlist-info {
  color: white;
  text-align: left;
  max-width: 500px;
}

.playlist-info h1 {
  margin: 10px 0;
  font-size: 2.2rem;
  font-weight: bold;
}

.playlist-info p {
  margin: 5px 0;
  font-size: 1.1rem;
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
  background-color: #ffb347;
  border: none;
  padding: 10px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  transition: background 0.3s, border 0.3s;
}

.playlist-actions input {
  width: 220px;
  background-color: #d4752b;
  
}
.playlist-actions input::placeholder {
  color: #2d1405; /* Color del placeholder dorado para mejor visibilidad */
  opacity: 0.5;
}

.playlist-actions select {
  width: 160px;
  background-color: #d4752b;
  color: #2d1405;
}

.playlist-actions button {
  background-color: #d4752b;
}

.playlist-actions button:hover {
  background-color: #ffb347;
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
 }
 
 .song-info {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 6px;
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
  background-color: #d4752b; /* Naranja más oscuro en hover */
}

 
 .controls-container {
   display: flex;
   gap: 14px;
   align-items: center;
 }

 </style>
 