<template>
   <div class="genres-container">
      <div class="back-btn-container">
         <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
      </div>
     <h2 class="title">🎶 Elige un mínimo de 4 géneros musicales:</h2>
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
 
 /**
  * Email del usuario obtenido del localStorage.
  * @type {string|null}
  */
 const email = localStorage.getItem("email");
 
 /**
  * Instancia del router para navegación programática.
  * @type {object}
  */
 const router = useRouter();
 
 /**
  * Objeto de la ruta actual, que contiene parámetros de la URL.
  * @type {object}
  */
 const route = useRoute();
 
 // Estados reactivos para los géneros y sus selecciones
 
 /**
  * Array reactivo que almacena todos los géneros obtenidos desde la API.
  * @type {Ref<Array>}
  */
 const genres = ref([]);
 
 /**
  * Array reactivo que almacena los nombres de los géneros seleccionados.
  * @type {Ref<Array>}
  */
 const selectedGenres = ref([]);
 
 /**
  * Array reactivo para guardar los géneros seleccionados inicialmente.
  * @type {Ref<Array>}
  */
 const initialGenres = ref([]);
 
 /**
  * Estado reactivo para controlar la visibilidad del popup.
  * @type {Ref<boolean>}
  */
 const showPopup = ref(false);
 
 /**
  * Estado reactivo que almacena el mensaje a mostrar en el popup.
  * @type {Ref<string>}
  */
 const popupMessage = ref("");
 
 /**
  * Estado reactivo que define el tipo del popup ("popup-error" o "popup-success").
  * @type {Ref<string>}
  */
 const popupType = ref("popup-error");
 
 /**
  * Función para mostrar un popup con un mensaje y tipo especificado.
  * El popup se oculta automáticamente después de 3 segundos.
  *
  * @param {string} message - Mensaje a mostrar.
  * @param {string} type - Tipo de popup ("popup-error" o "popup-success").
  */
 const showPopupMessage = (message, type) => {
    popupMessage.value = message;
    popupType.value = type;
    showPopup.value = true;
 
    setTimeout(() => {
          showPopup.value = false;
    }, 3000);
 };
 
 /**
  * Función para regresar a la página anterior utilizando el router.
  */
 const goBack = () => {
    router.back();
 };
 
 /**
  * Función para alternar la selección de un género.
  * Si el género ya estaba seleccionado, se deselecciona; si no, se añade a la lista de géneros seleccionados (máximo 8).
  *
  * @param {string} genreName - Nombre del género a alternar.
  */
 const toggleGenre = (genreName) => {
    // Buscar el género en el array de géneros
    const genre = genres.value.find(g => g.NombreGenero === genreName);
    if (!genre) return;
 
    if (selectedGenres.value.includes(genreName)) {
       // Quitar la selección
       selectedGenres.value = selectedGenres.value.filter(g => g !== genreName);
       genre.seleccionado = false; // Actualizamos el objeto del género directamente
    } else if (selectedGenres.value.length < 8) {
       // Agregar la selección si se tiene espacio (máximo 8 géneros)
       selectedGenres.value.push(genreName);
       genre.seleccionado = true; // Actualizamos el objeto del género directamente
    }
 };
 
 /**
  * Hook de ciclo de vida: onMounted.
  * Se ejecuta al montar el componente y realiza las siguientes acciones:
  * - Obtiene los géneros desde la API.
  * - Guarda los géneros iniciales que ya estaban seleccionados.
  * - Establece los géneros seleccionados inicialmente.
  */
 onMounted(async () => {
    try {
       console.log('Correo: ', email);
       const genderResponse = await fetch(`https://echobeatapi.duckdns.org/genero?userEmail=${encodeURIComponent(email)}`);
       if (!genderResponse.ok) throw new Error("Error al cargar los géneros");
 
       const data = await genderResponse.json();
       genres.value = data;
       console.log("Géneros cargados:", genres.value);
 
       // Guardamos los géneros iniciales: aquellos que ya estaban seleccionados
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
 
 /**
  * Función asíncrona para guardar los cambios en la selección de géneros.
  * Compara la selección actual con la inicial y si hay cambios y al menos 4 géneros seleccionados,
  * envía los cambios a la API. Después, redirige al usuario según su origen (registro o usuario).
  *
  * @async
  */
 const handleSave = async () => {
    // Extrae los géneros actualmente seleccionados
    const currentSelectedGenres = genres.value.filter(g => g.seleccionado).map(g => g.NombreGenero);
 
    // Compara arrays sin importar el orden para detectar cambios
    const hasChanges = currentSelectedGenres.length !== initialGenres.value.length ||
    currentSelectedGenres.some(genre => !initialGenres.value.includes(genre));
    console.log(currentSelectedGenres);
 
    // Solo se guarda si hay cambios y se han seleccionado al menos 4 géneros
    if (hasChanges && currentSelectedGenres.length >= 4) {
       try {
          const response = await fetch(`https://echobeatapi.duckdns.org/genero/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: email, generos: currentSelectedGenres })
          });
 
          if (response.ok) {
          console.log("Géneros actualizados correctamente");
 
          // Actualiza los géneros iniciales después del éxito en la actualización
          initialGenres.value = [...currentSelectedGenres];
 
          showPopupMessage('Preferencias actualizadas correctamente', 'popup-success');
 
          // Redirige al usuario según el origen (registro o ya usuario)
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
   background: linear-gradient(180deg, #141414 15%, #4a1e04 40%, #8a3a10 60%, #ffb347 100%); 
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

.back-btn-container {
   position: absolute;
   top: 20px;
   left: 10px;
   display: flex;
   justify-content: flex-start;
}

.back-btn {
   background-color: transparent;
   border: 1px solid #ffa500;
   color: #ffa500;
   padding: 6px 12px;
   border-radius: 6px;
   font-weight: bold;
   cursor: pointer;
   transition: background-color 0.3s ease;
   min-width: 100px;
}

.back-btn:hover {
   background-color: rgba(255, 165, 0, 0.2);
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
