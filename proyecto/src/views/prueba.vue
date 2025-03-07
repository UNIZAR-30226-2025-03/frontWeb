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
          <div v-for="(playlist, index) in playlists" :key="index" class="playlist-item">
            <div class="playlist-image">
              <img :src="playlist.avatar" alt="Portada de {{ playlist.first_name }}">
            </div>
            <div class="playlist-info">
              <p class="playlist-title">{{ playlist.first_name }}</p>
            </div>
          </div>
        </div>
      </section>
      <!-- Sección Recomendaciones -->
      <section class="recommendations">
          <h2>Recomendaciones</h2>
          <div id="recomendations-container">
              <!-- Aquí se insertarán dinámicamente las recomendaciones -->
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
  overflow-y: auto;
  
}
.playlist-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  justify-content: flex-start;
  gap: 2vh 5vw;
}

.playlist-item {
  display: grid;
  grid-template-columns: 60px auto; /* 🔥 Columna fija para la imagen, la otra ocupa el resto */
  align-items: center;
  width: 14vw;
  height: 5.7vh;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  transition: box-shadow 0.3s ease-in-out;
  cursor: pointer;
  overflow: hidden;
  padding: 0; /* 🔥 Asegura que no haya espacio extra */
  /*background: linear-gradient(135deg, #ffaa33, #cc5500);*/
}

.playlist-item:hover {
  box-shadow: 0px 0px 8px rgba(255, 165, 0, 0.8);
}

.playlist-image {
  width: 100%; /* La imagen ocupa toda su celda */
  height: 100%;
  border-radius: 10px 0 0 10px; /* 🔥 Bordes redondeados solo en la izquierda */
  overflow: hidden;
}

.playlist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 🔥 Se asegura de que la imagen llene el espacio */
  display: block;
}

.playlist-info {
  padding-left: 10px; /* Espaciado entre imagen y texto */
  display: flex;
  align-items: center;
  
}

.playlist-title {
  font-size: 14px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
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


/* Mantiene la estructura de 4 columnas */
#recomendations-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px 20px;
    padding: 10px;
    justify-items: center;
    align-items: center;
}

/* Diseño del item de la recomendación */
:deep(.recomendations-item) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 180px; /* Tamaño uniforme */
    height: auto;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    box-shadow: 0px 6px 10px rgba(204, 85, 0, 0.5), 
            0px 3px 6px rgba(255, 170, 51, 0.4);
}

:deep(.recomendations-item:hover) {
    transform: translate(-2px,-4px);
    box-shadow: 10px 10px 15px rgba(204, 85, 0, 0.4), 
            5px 5px 6px rgba(255, 170, 51, 0.4);
    transition: 0.2s ease-in-out;
}

/* Imagen de la portada */
:deep(.recomendations-cover) {
    width: 100%;
    height: 180px; /* Altura fija para uniformidad */
    display: block;
    border-top-right-radius: 16px;
    border-top-left-radius: 16px;
    object-fit: cover;
    flex: 1;
}

/* Título sobre la imagen */
:deep(.recomendations-title) {
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 8px;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
    color: #212121;
    background: linear-gradient(135deg, #ffaa33, #cc5500);
    border-radius: 0 0 12px 12px;
    text-align: center;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}

/* Responsividad */
@media (max-width: 1024px) {
    #recomendations-container {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    #recomendations-container {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .recomendations-title {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    #recomendations-container {
        grid-template-columns: repeat(1, 1fr);
    }
}



</style>


<script setup>
  import { ref, onMounted } from 'vue';
  
  const email = 'a@gmail.com';
  const playlists = ref([]);//Playlist propias del usario
  const lastSong = ref([]);
  //Recoge datos referentes a playlists y cancion
 
  onMounted(async () => {
    try {
      
      const playlistResponse = await fetch("https://reqres.in/api/users?page=1&per_page=12");
      if (!playlistResponse.ok) throw new Error('Error al obtener las playlist del usuario');
      
      const playlistData = await playlistResponse.json();
      playlists.value = Array.isArray(playlistData.data) ? playlistData.data : [playlistData.data];
    

      console.log("playlist data: ",playlists.value); // 🔥 Ver en la consola


       // Obtener recomendaciones
      const container = document.getElementById("recomendations-container");
      const response = await fetch("https://reqres.in/api/users?page=1&per_page=12");
      const data = await response.json();

      data.data.forEach(user => {
          const listElement = document.createElement("div");
          listElement.classList.add("recomendations-item");

          const imgElement = document.createElement("img");
          imgElement.src = user.avatar;
          imgElement.alt = `${user.first_name} ${user.last_name}`;
          imgElement.classList.add("recomendations-cover");

          const titleElement = document.createElement("p");
          titleElement.textContent = `${user.first_name} ${user.last_name}`;
          titleElement.classList.add("recomendations-title");

          listElement.appendChild(imgElement);
          listElement.appendChild(titleElement);
          container.appendChild(listElement);
      });

  


    } catch (error) {
    console.error('Error:', error);
    }
  });

  </script>
  