<template>
  <div class="container">
    <div class="header">
      <!-- Imagen que activa el menú -->
      <img 
        class="image-left" 
        src="@/assets/preview.svg" 
        alt="Preview" 
        @click="toggleMenu" 
      />
      
      <input class="search-bar" type="text" placeholder="¿Qué quieres reproducir?" />
      
      <img class="image-right" src="@/assets/circle-user.svg" alt="User" />
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
</template>

<script>
import searchIcon from '@/assets/search.svg';
import starIcon from '@/assets/star.svg';
import settingsIcon from '@/assets/settings.svg';
import albumIcon from '@/assets/folder-music.svg';

export default {
  name: 'Home',
  data() {
    return {
      isMenuOpen: false,
      menuIcons: [
        { src: searchIcon, alt: 'Buscar' },  // Lupa
        { src: starIcon, alt: 'Favoritos' },  // Estrella
        { src: settingsIcon, alt: 'Configuración' }, // Engranaje
        { src: albumIcon, alt: 'Album' } // Album
      ]
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    getIconPosition(index, total) {
      const angle = (index / (total - 1)) * (Math.PI / 2); // 90° para un semicírculo
      const radius = 100; // Distancia desde el centro
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      return {
        transform: `translate(${x}px, ${y}px)`
      };
    }
  }
};
</script>

<style scoped>
/* Fondo negro */
.container {
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
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
  z-index: 1101; /* Asegura que el menú esté encima del blur */
}

/* Posición de los iconos */
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

/* Fondo difuminado (se muestra solo cuando el menú está activo) */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1100; /* Debajo del menú pero sobre el contenido */
}
</style>
