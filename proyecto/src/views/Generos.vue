<template>
   <div class="genres-container">
     <h2 class="title">🎶 Elige hasta 3 géneros musicales:</h2>
     <div class="genres-list">
      <div 
         v-for="genre in genres" 
         :key="genre.NombreGenero" 
         :class="{ 'selected': genre.seleccionado }" 
         class="genre-item" 
         @click="toggleGenre(genre.NombreGenero)"
         >
         {{ genre.NombreGenero }}
      </div>
     </div>
     <p class="selected-info" v-if="selectedGenres.length > 0">
       Seleccionados: <span>{{ selectedGenres.join(", ") }}</span>
     </p>
     <button @click="handleSave">GUARDAR CAMBIOS</button>
     <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
   </div>
 </template>
 
<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const email =  localStorage.getItem("email");
const router = useRouter();
const route = useRoute();
// Inicializamos los géneros y las selecciones
const genres = ref([]);
const selectedGenres = ref([]);
const initialGenres = ref([]);
const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("popup-error");

const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
         showPopup.value = false;
   }, 3000);
};


// Función para alternar la selección de géneros
const toggleGenre = (genreName) => {
const genre = genres.value.find(g => g.NombreGenero === genreName);
if (!genre) return;

if (selectedGenres.value.includes(genreName)) {
   // Quitar selección
   selectedGenres.value = selectedGenres.value.filter(g => g !== genreName);
   genre.seleccionado = false; // Actualizamos el objeto directamente
} else if (selectedGenres.value.length < 3) {
   // Agregar selección si hay espacio
   selectedGenres.value.push(genreName);
   genre.seleccionado = true; // Actualizamos el objeto directamente
}
};

 // Cargar los géneros desde la API y establecer los géneros seleccionados
 onMounted(async () => {
  try {
   console.log('Correo: ', email);
    const genderResponse = await fetch(`https://echobeatapi.duckdns.org/genero?userEmail=${encodeURIComponent(email)}`);
    if (!genderResponse.ok) throw new Error("Error al cargar los géneros");

    const data = await genderResponse.json();
    genres.value = data;
    console.log("Géneros cargados:", genres.value);

    // Guardamos los géneros iniciales
    initialGenres.value = genres.value
      .filter(g => g.seleccionado)
      .map(g => g.NombreGenero);

    // Establecemos los géneros seleccionados iniciales
    selectedGenres.value = [...initialGenres.value];

    console.log("Géneros seleccionados al inicio:", selectedGenres.value);

  } catch (error) {
    console.error('Error:', error);
  }
});

 // Función para guardar los cambios
const handleSave = async () => {
   const currentSelectedGenres = genres.value.filter(g => g.seleccionado).map(g => g.NombreGenero);

  // Comparación de arrays sin importar el orden
   const hasChanges = currentSelectedGenres.length !== initialGenres.value.length ||
      currentSelectedGenres.some(genre => !initialGenres.value.includes(genre));

   if (hasChanges) {
      try {
         const response = await fetch(`https://echobeatapi.duckdns.org/genero/add`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userEmail: email, generos: currentSelectedGenres })
         });

         if (response.ok) {
         console.log("Géneros actualizados correctamente");

         // Actualizamos `initialGenres` después del éxito
         initialGenres.value = [...currentSelectedGenres];

         showPopupMessage('Preferencias actualizadas correctamente', 'popup-success');

         // Redirigir según el origen
         setTimeout(() => {
           if (route.query.from === 'register') {
             router.push("/");
           } else {
             router.push("/user");
           }
         }, 2000);
         
         } else {
         showPopupMessage('Error al actualizar los géneros', 'popup-error');
         }
      } catch (error) {
         console.log('Error al guardar los géneros');
         showPopupMessage('Error de conexión', 'popup-error');
      }
   } else {
      showPopupMessage('No ha habido cambios para guardar', 'popup-error');
   }
};


</script>
 
 <style scoped>
 .genres-container {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
   background-color: #121212; 
   z-index: 9999;
   display: flex;
   flex-direction: column; 
   justify-content: center;
   align-items: center;
   font-family: 'Arial', sans-serif; 
   color: #fff;
 }
 
 .title {
   font-size: 1.8rem;
   margin-bottom: 1.5rem;
   color: #ffa500; /* Color de texto llamativo */
   font-weight: 600;
   text-align: center;
 }
 
 .genres-list {
   text-align: center;
   background-color: #1f1f1f; /* Fondo ligeramente más claro para contrastar */
   padding: 2rem;
   border-radius: 15px;
   box-shadow: 0 0 30px rgba(255, 165, 0, 0.7);
   width: 100%;
   max-width: 610px; /* Mayor ancho para más comodidad */
   transition: all 0.3s ease-in-out;
 }
 
 .genres-list:hover {
   transform: scale(1.05); /* Efecto de expansión suave */
 }
 
 .genre-item {
   background-color: #333;
   color: white;
   padding: 12px 20px;
   border-radius: 25px;
   cursor: pointer;
   border: 2px solid #ffa500;
   margin-top: 10px;
   margin-left: 10px;
   font-size: 1.1rem;
   transition: all 0.3s ease-in-out;
   display: inline-block;
   width: 100%;
   max-width: 250px;
   text-align: center;
 }
 
 .genre-item:hover {
   background-color: #ff5722;
   transform: translateY(-3px); /* Efecto de movimiento al pasar el ratón */
 }
 
 .genre-item.selected {
   background-color: #ff5722;
   border-color: #ff5722;
   color: white;
   font-weight: bold;
   box-shadow: 0 0 10px rgba(255, 87, 34, 0.8); /* Sombra más intensa */
 }
 
 .selected-info {
   margin-top: 25px;
   font-size: 1.2rem;
   color: #fff;
   font-weight: 500;
   text-align: center;
 }
 
 .selected-info span {
   font-weight: bold;
   color: #ffa500; /* Resaltar los géneros seleccionados */
 }

 button {
   width: 25%;
   padding: 12px;
   margin-top: 1rem;
   border: none;
   border-radius: 20px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
   background-color: #ff5722;
 }

 button:hover {
   opacity: 0.8;
}

/* Mensaje emergente */
.popup {
   position: fixed;
   top: 20px;
   left: 50%;
   transform: translateX(-50%);
   color: white;
   padding: 10px 20px;
   border-radius: 8px;
   font-weight: bold;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
   animation: fadeInOut 3s ease-in-out;
}

.popup-error {
   background: rgba(255, 87, 34, 0.9);
}

.popup-success {
   background: rgba(76, 175, 80, 0.9);
}

@keyframes fadeInOut {
   0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
   10% { opacity: 1; transform: translateX(-50%) translateY(0); }
   90% { opacity: 1; }
   100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

 </style>
