<template>
   <div class="create-list-container">
      <div class="create-list-box">
         <div class="back-btn-container">
            <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
         </div>
         <img class="logo" :src="logo" alt="Logo"/>
         <h2>Crear Nueva Lista</h2>
         <span>Rellena los siguientes campos para crear tu lista de reproducción</span>

         <label for="list-name">Nombre de la Lista</label>
         <input type="text" v-model="nombre" placeholder="Introduce el nombre de la lista" required />

         <label for="list-description">Descripción</label>
         <input type="text" v-model="descripcion" placeholder="Breve descripción de la lista" required />

         <label for="privacidad">Privacidad</label>
         <select v-model="privacidad" required>
            <option disabled value=""> Selecciona para quién será visible la lista </option>
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
            <option value="protegido">Protegido</option>
         </select>

         <label for="image">Portada</label>
         <select id="profile-action" v-model="profileAction">
            <option disabled value="">Selecciona una opción</option>
            <option value="upload">Subir nueva imagen</option>
            <option value="select">Elegir predeterminada</option>
         </select>

         <!-- Si elige 'upload' se muestra el input para subir una imagen -->
         <div v-if="profileAction === 'upload'">
            <input class="profileInput" type="file" ref="fileInput" @change="handleFileChange" accept="image/*" />
         </div>

         <!-- Si elige 'select' se muestra el modal para elegir una imagen predeterminada -->
         <div v-if="profileAction === 'select'" class="image-selection-modal">
            <h3>Selecciona una imagen</h3>
            <div class="image-grid">
               <img 
                  v-for="image in defaultImages" :key="image" :src="image" @click="selectDefaultImage(image)" class="selectable-image" :class="{ selected: selectedDefaultImage === image }"/>
            </div>
            <button @click="closeImageSelection">Cerrar</button>
         </div>

         <button @click="handleCreateList">CREAR</button>
      </div>

      <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
   </div>
</template>
  
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import logo from '@/assets/logo.png';

/**
 * Instancia del router para navegación programática.
 * @type {object}
 */
const router = useRouter();

/**
 * Estado reactivo para el nombre de la playlist.
 * @type {Ref<string>}
 */
const nombre = ref("");

/**
 * Estado reactivo para la descripción de la playlist.
 * @type {Ref<string>}
 */
const descripcion = ref("");

/**
 * Estado reactivo para la privacidad de la playlist.
 * @type {Ref<string>}
 */
const privacidad = ref("");

/**
 * Email del usuario, obtenido del localStorage.
 * @type {string|null}
 */
const email = localStorage.getItem("email");

/**
 * Estado reactivo para almacenar la URL de la imagen en caso de usar imagen predeterminada.
 * @type {Ref<string>}
 */
const file = ref('');

/**
 * Estado reactivo para el archivo seleccionado por el usuario.
 * @type {Ref<File|null>}
 */
const selectedFile = ref(null);

/**
 * Estado reactivo que almacena la acción de perfil seleccionada,
 * determinando si el usuario va a subir una imagen o escoger una predeterminada.
 * @type {Ref<string>}
 */
const profileAction = ref(""); 

/**
 * Estado reactivo para mostrar el modal de selección de imagen predeterminada.
 * @type {Ref<boolean>}
 */
const showImageSelection = ref(false);

/**
 * Estado reactivo para almacenar la lista de imágenes predeterminadas disponibles.
 * @type {Ref<Array>}
 */
const defaultImages = ref([]);

/**
 * Estado reactivo para almacenar la imagen predeterminada seleccionada.
 * @type {Ref<string|null>}
 */
const selectedDefaultImage = ref(null);

/**
 * Estado reactivo que controla la visualización del popup.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo para el mensaje que se mostrará en el popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo para definir el tipo de popup ('popup-error' o 'popup-success').
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/**
 * Función para mostrar un popup con un mensaje y tipo determinado.
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
 * Función para manejar la selección de un archivo.
 * Actualiza el estado reactivo selectedFile y genera una vista previa de la imagen.
 *
 * @param {Event} event - Evento del input file.
 */
const handleFileChange = (event) => {
   const file = event.target.files[0];
   if (!file) return;

   selectedFile.value = file;

   // Genera una vista previa de la imagen usando FileReader.
   const reader = new FileReader();
   reader.onload = (e) => {
      user.value.perfil = e.target.result; // Se asigna la imagen al perfil del usuario.
   };
   reader.readAsDataURL(file);
};

/**
 * Función para seleccionar una imagen predeterminada.
 * Actualiza el estado reactivo "file" y "selectedDefaultImage" con la URL de la imagen seleccionada.
 *
 * @param {string} imageUrl - URL de la imagen predeterminada seleccionada.
 */
const selectDefaultImage = (imageUrl) => {
   file.value = imageUrl;
   selectedDefaultImage.value = imageUrl;
};

/**
 * Función para cerrar el modal de selección de imagen predeterminada.
 * Reinicia la acción de perfil y oculta el modal.
 */
const closeImageSelection = () => {
   showImageSelection.value = false;
   profileAction.value = "";
   selectedDefaultImage.value = '';
};

/**
 * Hook de ciclo de vida: onMounted.
 * Al montar el componente, realiza una petición para obtener imágenes predeterminadas.
 */
onMounted(async () => {
   try { 
      const ImageResponse = await fetch("https://echobeatapi.duckdns.org/playlists/default-photos");
      if (!ImageResponse.ok) throw new Error("Error al cargar imágenes predeterminadas");
      defaultImages.value = await ImageResponse.json();
      console.log('Canciones predeterminadas', defaultImages.value);
   
   } catch (error) {
      console.error('Error:', error);
   }
});

/**
 * Función para manejar la creación de una playlist.
 *
 * Realiza lo siguiente:
 * - Valida que todos los campos obligatorios estén completos.
 * - Si hay un archivo seleccionado, lo envía mediante FormData a la API.
 * - Si no hay archivo seleccionado, envía la URL de la imagen predeterminada.
 * - Muestra un popup de éxito o error según corresponda.
 * - Redirige al usuario al home tras crear la playlist con éxito.
 *
 * @async
 * @throws {Error} Si falla la petición a la API.
 */
const handleCreateList = async () => {
   if (!nombre.value.trim() || !descripcion.value.trim() || !profileAction.value.trim() || !privacidad.value.trim()) {
      showPopupMessage("Todos los campos son obligatorios.", "popup-error");
      return;
   }

   try {
      if (selectedFile.value) {
         const formData = new FormData();
         formData.append('emailUsuario', email);
         formData.append('nombrePlaylist', nombre.value);
         formData.append('descripcionPlaylist', descripcion.value);
         formData.append('tipoPrivacidad', privacidad.value);
         formData.append('file', selectedFile.value);

         console.log("Archivo a subir:", selectedFile.value);
         console.log("FormData:", formData);

         const response = await fetch("https://echobeatapi.duckdns.org/playlists/create", {
            method: "POST",
            headers: {},
            body: formData,
         });
         
         if (!response.ok) {
            const errorData = await response.text(); // Captura el error como texto.
            throw new Error("Error al subir la imagen: ");
         }
      
         showPopupMessage("Lista creada con éxito", "popup-success");

         setTimeout(() => {
            router.push("/home"); 
         }, 2000);
      }
      else {
         console.log("Archivo a subir:", file.value);
         const response = await fetch(`https://echobeatapi.duckdns.org/playlists/create-with-url/`, {
            method: 'POST',
            headers: {
               'Accept': '*/*', 
               'Content-Type': 'application/json',  
            },
            body: JSON.stringify({
               emailUsuario: email,  
               nombrePlaylist: nombre.value,
               descripcionPlaylist: descripcion.value,
               tipoPrivacidad: privacidad.value,
               imageUrl: file.value
            })
         });

         if (!response.ok) {
            throw new Error('Error al subir la imagen predeterminada');
         }

         showPopupMessage("Lista creada con éxito", "popup-success");
         setTimeout(() => {
            router.push("/home"); 
         }, 2000);
      }
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};
</script>

<style scoped>
.create-list-container {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
   background: linear-gradient(180deg, #141414 15%, #4a1e04 40%, #8a3a10 60%, #ffb347 100%);
   z-index: 9999; 
   display: flex;
   justify-content: center;
   align-items: center;
   overflow-y: auto;
}

.create-list-box {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 20px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 100%;
   max-width: 500px;
}

h2 {
   color: #ffa500;
   margin-bottom: 1.5rem;
}

label {
   color: #ffa500;
   text-align: left;
   display: block;
   margin-top: 1rem;
}

input, select {
   width: 100%;
   padding: 10px;
   margin-top: 10px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
   box-sizing: border-box;
}


input::placeholder {
   color: #ccc;
}

button {
   width: 60%;
   padding: 12px;
   margin-top: 1.5rem;
   border: none;
   border-radius: 4px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
   background-color: #ff5722;
}

button:hover {
   opacity: 0.8;
}

.image-selection-modal {
   position: fixed;
   top: 65%;
   left: 80%;
   transform: translate(-50%, -50%);
   background: #1a1a1a;
   padding: 20px;
   border-radius: 10px;
   box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
   text-align: center;
   z-index: 1000;
}

.image-grid {
   display: flex;
   gap: 15px;
   flex-wrap: wrap;
   justify-content: center;
   margin: 10px 0;
}

.selectable-image {
   width: 80px;
   height: 80px;
   border-radius: 50%;
   cursor: pointer;
   transition: 0.3s;
   object-fit: cover;
   border: 2px solid #ffa500;
}

.selectable-image:hover {
   transform: scale(1.1);
}

.selectable-image.selected {
  border: 3px solid #4caf50;
  box-shadow: 0 0 10px #4caf50;
}

.back-btn-container {
   display: flex;
   justify-content: flex-start;
   margin-top: -2rem;
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
   max-width: 100px;
}

.back-btn:hover {
   background-color: rgba(255, 165, 0, 0.2);
}

.profileInput {
   width: 50%;
   padding: 10px;
   margin-top: 15px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
   box-sizing: border-box;
}

.logo {
   width: 100px;
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
