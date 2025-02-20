<template>
  <div class="homepage-container">
    <!-- Sección Escuchado Recientemente -->
    <section class="recently-played">
      <h2>Escuchado Recientemente</h2>
      <div class="grid-container">
        <div v-for="(item, index) in recentlyPlayed" :key="index" class="playlist-item">
          <input type="text" :value="item.title" readonly />
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
  { title: 'playlist3' },
  { title: 'playlist4' },
  { title: 'playlist5' },
  { title: 'playlist6' }
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
  color: white;
}

.recently-played, .recommendations {
  width: 100%;
  max-width: 800px;
  text-align: center;
  margin-bottom: 16px;
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
  border-radius: 8px;

  cursor: pointer;

  color: black;
	background: white;
}

.divider {
  background: white;
  width: 65%;
  margin: 16px auto;
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
