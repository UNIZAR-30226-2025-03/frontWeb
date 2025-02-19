<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
    </nav>

    <div class="container">
      <div class="header">
        <!-- Imagen que activa el menú -->
        <img 
          class="image-left" 
          :src="previewIcon" 
          alt="Preview" 
          @click="toggleMenu" 
        />
        
        <input class="search-bar" type="text" placeholder="¿Qué quieres reproducir?" />
        
        <img class="image-right" :src="userIcon" alt="User" />
      </div>
      <router-view/>
      <!-- Barra de canción -->
      <div class="player-bar">
        <div class="controls">
          <button>
            <img :src="previousIcon" alt="Previous" />
          </button>
          <button @click="togglePlay">
            <img :src="isPlaying ? pauseIcon : playIcon" alt="Play/Pause" />
          </button>
          <button>
            <img :src="nextIcon" alt="Next" />
          </button>
        </div>
        <div class="progress-container">
          <div class="song-info">
            <img :src="recordVinylIcon" alt="Song Icon" class="song-icon" />
            <span class="song-name">Canción en reproducción</span>
          </div>
          <input type="range" class="progress-bar" min="0" max="100" v-model="progress" />
        </div>
      </div>

      <!-- Capa de fondo difuminada (se muestra solo si el menú está abierto) -->
      <div v-if="isMenuOpen" class="overlay" @click="closeMenu"></div>

      <!-- Menú en semicírculo desde la esquina superior izquierda -->
      <div v-if="isMenuOpen" class="menu-container">
        <div class="menu">
          <button class="menu-item" 
            v-for="(icon, index) in menuIcons" 
            :key="index" 
            :style="getIconPosition(index, menuIcons.length)">
            <img :src="icon.src" :alt="icon.alt" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Importar las imágenes
import previewIcon from '@/assets/preview.svg';
import userIcon from '@/assets/circle-user.svg';
import previousIcon from '@/assets/previous-square.svg';
import pauseIcon from '@/assets/pause-circle.svg';
import playIcon from '@/assets/play-circle.svg';
import nextIcon from '@/assets/step-forward.svg';
import recordVinylIcon from '@/assets/record-vinyl.svg';
import friendsIcon from '@/assets/following.svg';
import starIcon from '@/assets/star.svg';
import settingsIcon from '@/assets/settings.svg';
import albumIcon from '@/assets/folder-music.svg';

// Variables reactivas
const isMenuOpen = ref(false);
const isPlaying = ref(false);
const progress = ref(0);
const menuIcons = ref([
  { src: friendsIcon, alt: 'Amigos' },
  { src: starIcon, alt: 'Favoritos' },
  { src: settingsIcon, alt: 'Configuración' },
  { src: albumIcon, alt: 'Álbum' }
]);

// Métodos
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
}

function getIconPosition(index, total) {
  const angle = (index / (total - 1)) * (Math.PI / 2);
  const radius = 100;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { transform: `translate(${x}px, ${y}px)` };
}
</script>

<style scoped>
/* Fondo negro */
.container {
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Barra fija */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: black;
  z-index: 1000;
}

/* Imagenes */
.image-left, .image-right {
  width: 40px;
  height: auto;
  filter: brightness(0) invert(1);
  cursor: pointer;
}

/* Barra de búsqueda */
.search-bar {
  width: 400px;
  margin: 0 10px;
  padding: 12px 12px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
}

.search-bar::placeholder {
  color: #bbb;
}

/* Menú desplegable */
.menu-container {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1101;
}

.menu {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Íconos del menú */
.menu-item {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  border: none;
}

.menu-item img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

/* Fondo difuminado */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1100;
}

/* 🔥 ESTILOS DE LA BARRA DE REPRODUCCIÓN 🔥 */
.player-bar {
  display: flex;
  flex-direction: column; /* Apila los elementos */
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px; /* Aumenta la altura para acomodar los controles */
  background-color: #111;
  padding: 10px 0;
  z-index: 1000;
  color: white;
}

/* Controles de música */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px; /* Espacio entre los controles y la barra de progreso */
}

.controls button {
  background: none;
  border: none;
  cursor: pointer;
  margin: 0 15px;
}

.controls img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
}

/* Contenedor de la barra de progreso */
.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Icono de la canción */
.song-info {
  position: absolute;
  bottom: 25px;
  left: 20px;
  display: flex;
  align-items: center;
}

.song-icon {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
  margin-right: 10px;
}

.song-name {
  font-size: 14px;
  color: white;
}

/* Barra de progreso */
.progress-bar {
  width: 50%;
  height: 4px;
  background: #444;
  border-radius: 2px;
  appearance: none;
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  appearance: none;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
}
</style>
