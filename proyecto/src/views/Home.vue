<template>
  <div class="homepage-container">

    <!-- Seccion canciones de lista actual-->
    <div class="container">
      <div class="sidebar">
        Sidebar
      </div>
      <div class="content">
        Contenido principal
      </div>
      
  </div>
  
    <!-- Sección Escuchado Recientemente -->
    <section class="recently-played">
      <h2>Escuchado Recientemente</h2>
      <div class="grid-icons">
        <div v-for="(item, index) in recentlyPlayed" :key="index" class="recommendation-item">
            <div class="icon-placeholder"> ♬ </div>
        </div>
      </div>
    </section>

    <!-- Línea Divisoria -->
    <hr class="divider" />

    <!-- Sección Recomendaciones -->
    <section class="recommendations">
      <h2>Recomendaciones</h2>
      <div class="grid-icons">
        <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-item" >
          
          <div class="icon-placeholder"> ♬ </div>
          <p>{{ rec.title }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// Datos de ejemplo, que serán reemplazados por los datos heredados en el futuro
const recentlyPlayed = ref([
  { title: 'playlist1' },
  { title: 'playlist2' },
  { title: 'playlist3' }
]);

const recommendations = ref([
  { title: 'Éxitos 90s' },
  { title: 'Icon Name' },

  { title: 'Icon Name' },
  { title: 'Icon Name' },
  { title: 'Icon Name' },
  { title: 'Icon Name' }
]);
</script>

<style scoped>
.homepage-container {
  display: flex;
  flex-direction: column;
  padding: 16px;
  align-items: center;
  color:  #ffa500;
}

.recently-played, .recommendations {
  width: 100%;
  max-width: 800px;
  text-align: center;
  margin-bottom: 16px;
}

.sidebar {
  width: 250px;
  color: white;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #222222;
  box-shadow: 10px 0 5px rgba(1, 1, 1, 0.6); /* Sombra en el lado derecho */

}

.content {
  margin-left: 250px;
  flex-grow: 1;
  padding: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  justify-items: center;
}

.playlist-item input {
  width: 140px;
  padding: 8px;
  text-align: left;
  padding-left: 6 px;
  font-weight: bold;
  border-radius: 16px;
  cursor: pointer;
  color:  #ffa500;
  background-color:  #121212;

}

.divider {
  background: #ffa500;
  opacity: 1;
  border: #0A0A0A;
  border-radius: 25px;
  height: 1vh;
  width: 50%;
  margin: 16px auto;
  
}
.divider.lat{
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 1vw;
}

.grid-icons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: center;
}

.recommendation-item {
  position: relative;
  width: 120px;
  height: 120px;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-align: center;
  
  /*
  iconos no planos
  box-shadow:
    4px 4px 0 white,  
    8px 8px 0 orange,    
    12px 12px 0 white, 
    16px 16px 0 orange;
  */     
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  cursor: pointer;
}

/* Efecto al hacer hover */
.icon-placeholder:hover {
  transform: translateY(-5px);
  box-shadow:
    4px 4px 0 orange,
    6px 6px 0 white,
    10px 10px 0 orange;
}


.icon-placeholder {
  width: 80px;
  height: 80px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, background-color 0.3s;
  color: orange;
  box-shadow: 4px 4px orange;
  z-index: 1;
}


</style>
