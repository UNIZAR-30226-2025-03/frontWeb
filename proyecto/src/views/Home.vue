<template>
  <div class="layout">
    <!-- Barra lateral -->
   
      <aside class="sidebar">
        <div class="library">
          <h3>Escuchando </h3>
          <ul>
            <li>Canción 1</li>
            <li>Canción 2</li>
            <li>Canción 3</li>
            <li>Canción 4</li>
            <li>Canción 5</li>
            <li>Canción 6</li>
          </ul>
        </div>
      </aside>
    

    <!-- Contenido principal -->
    <main class="content">
      <!-- Sección Escuchado Recientemente -->
      <section class="recently-played">
        <h2>Welcome...</h2>
        <div class="playlist-container">
          <div v-for="(playlist, index) in playlists" :key="index" class="recommendation-item" >
          
          <div class="icon-placeholder"> {{ playlist.lista.Portada }} </div>
          <p>{{ playlist.Nombre }}</p>
        </div>
        </div>
      </section>

      <!-- Sección Recomendaciones -->
      <section class="recommendations">
        <h2>Recomendaciones</h2>
        <div class="playlist-container">
          <div v-for="(recomendation, index) in recomendations" :key="index" class="recommendation-item" >
            
            <div class="icon-placeholder"> {{ recomendation.FotoGenero }} </div>
            <p>{{ recomendation.NombreGenero }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(180deg, #141414, #1e1e1e); /* Gradiente aplicado al contenedor principal */
  /*background-color: #141414;*/
  color: white;
}


.sidebar {
  width: 17%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 12px; /* Aumenta el redondeo de los bordes */
  background-color: #1e1e1e;
  margin-top: 1vh;
  margin-left: 0.7vw;
  margin-bottom: 22vh;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.4) ;
  
}

.library {
  flex-grow: 1;
  padding: 10px 15px;
}

.library h3 {
  margin-bottom: 15px;
  font-size: 18px;
  
}

.library ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.library li {
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease;
}

.library li:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffa500;
}

.content {
  flex: 1;
  padding: 10px 15px;
  background: transparent; /* Elimina el fondo sólido para usar el de .layout */
  
}

.recently-played{
  
  padding-top:5px;
  padding-left: 20px;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 4px 6px 8px rgba(0, 0, 0, 0.4);
  height: 23.5vh;
  
}
.recommendations {
  margin-top: 15px;
  padding-top:5px;
  padding-left: 20px;
  background: #1e1e1e;
  border-radius: 12px;
  height: 50vh;
  box-shadow: 4px 6px 8px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
}

.recently-played h2,
.recommendations h2 {
  font-size: 22px;
  margin-bottom: 15px;
}

.playlist-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding-bottom: 20px;
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


<script setup>
  import { ref, onMounted } from 'vue';
  
  const email = 'a@gmail.com';
  const playlists = ref([]);//Playlist propias del usario
  const lastSong = ref([]);
  const recomendations= ref([]);
//Recoge datos referentes a playlists y cancion
  onMounted(async () => {
    try {
      const response = await fetch(`http://48.209.24.188:3000/playlists/user?userEmail=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Error al obtener datos de las playlist');
  
      const data = await response.json();
      
      // Verifica si la API devuelve un array o un objeto
      playlists.value = Array.isArray(data) ? data : [data];
  
      console.log(playlists.value); // 🔥 Ver en la consola

      // Obtener recomendaciones
      const recomendationsResponse = await fetch(`http://48.209.24.188:3000/genero/preferencia?userEmail=${encodeURIComponent(email)}`);
      if (!recomendationsResponse.ok) throw new Error('Error al obtener datos de la última canción');
      
      const recomendationsData = await recomendationsResponse.json();
      recomendations.value = Array.isArray(recomendationsData) ? recomendationsData : [recomendationsData];

      console.log('Recomendaciones:', recomendations.value);
  
  
    } catch (error) {
    console.error('Error:', error);
    }
  });

  </script>
  