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
          <div id="playlist-container">
              <!-- Aquí se insertarán dinámicamente las playlists -->
          </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
/* Mantiene la estructura de 4 columnas */
#playlist-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px 20px;
    padding: 10px;
    justify-items: center;
    align-items: center;
}

/* Diseño del item de la playlist */
:deep(.playlist-item) {
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

:deep(.playlist-item:hover) {
   
    transform: translate(-2px,-4px);
    
    box-shadow: 10px 10px 15px rgba(204, 85, 0, 0.4), 
            5px 5px 6px rgba(255, 170, 51, 0.4);

    transition: 0.2s ease-in-out;
  
}

/* Imagen de la portada */
:deep(.playlist-cover) {
    width: 100%;
    height: 180px; /* Altura fija para uniformidad */
    display: block;
    border-top-right-radius: 16px;
    border-top-left-radius: 16px ;
    object-fit: cover; /* Recortar imágenes para mantener proporciones */
    flex: 1;
    object-fit: cover;


}

/* Título sobre la imagen, estilo Mix Diario */
:deep(.playlist-title) {
    bottom: 0;
    left: 0;
    width: 100%;
    margin: 0;
    padding: 8px;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    text-align: left;
    color: #212121 ;
    /*background: linear-gradient(90deg, #ffa500,#ff7514,rgba(255, 69, 0, 0.5)); /* Naranja con ligera transparencia */
    background: linear-gradient(135deg, #ffaa33, #cc5500);
  

    border-radius: 0 0 12px 12px;
    text-align: center;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);

}

/* Variaciones de color para los títulos */
.mix-1 { background: linear-gradient(to right, cyan, blue); }
.mix-2 { background: linear-gradient(to right, yellow, lime); }
.mix-3 { background: linear-gradient(to right, red, orange); }
.mix-4 { background: linear-gradient(to right, pink, purple); }
.mix-5 { background: linear-gradient(to right, green, lightgreen); }

/* Responsividad */
@media (max-width: 1024px) {
    #playlist-container {
        grid-template-columns: repeat(3, 1fr); /* 3 columnas en pantallas medianas */
    }
}

@media (max-width: 768px) {
    #playlist-container {
        grid-template-columns: repeat(2, 1fr); /* 2 columnas en tablets */
    }
    
    .playlist-title {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    #playlist-container {
        grid-template-columns: repeat(1, 1fr); /* 1 columna en móviles */
    }
}




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
      const container = document.getElementById("playlist-container");
      const response = await fetch("https://reqres.in/api/users?page=1&per_page=12");
      const data = await response.json();

      data.data.forEach(user => {
          const listElement = document.createElement("div");
          listElement.classList.add("playlist-item");

          const imgElement = document.createElement("img");
          imgElement.src = user.avatar;
          imgElement.alt = `${user.first_name} ${user.last_name}`;
          imgElement.classList.add("playlist-cover");

          const titleElement = document.createElement("p");
          titleElement.textContent = `${user.first_name} ${user.last_name}`;
          titleElement.classList.add("playlist-title");

          listElement.appendChild(imgElement);
          listElement.appendChild(titleElement);
          container.appendChild(listElement);
      });

      // Verifica si la API devuelve un array o un objeto
      playlists.value = Array.isArray(data) ? data : [data];
  
      console.log(playlists.value); // 🔥 Ver en la consola

      // Obtener recomendaciones
      const recomendationsResponse = await fetch(`http://48.209.24.188:3000/genero/preferencia?userEmail=${encodeURIComponent(email)}`);
      if (!recomendationsResponse.ok) throw new Error('Error al obtener datos de la última canción');
      
      const recomendationsData = await recomendationsResponse.json();
      recomendations.value = Array.isArray(recomendationsData) ? recomendationsData : [recomendationsData];

      console.log('Recomendaciones:', recomendations.value);
  
    
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
  