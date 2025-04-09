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

const router = useRouter();
const nombre = ref("");
const descripcion = ref("");
const privacidad = ref("");
const email =  localStorage.getItem("email");
const file = ref('');

const selectedFile = ref(null);
const profileAction = ref(""); // Acción seleccionada (subir imagen o elegir predeterminada)
const showImageSelection = ref(false); // Modal para seleccionar imagen predeterminada
const defaultImages = ref([]);  // Aquí se guardarán las imágenes predeterminadas
const selectedDefaultImage = ref(null);

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

const goBack = () => {
   router.back();
};

// Función para manejar la selección de un archivo
const handleFileChange = (event) => {
   const file = event.target.files[0];
   if (!file) return;

   selectedFile.value = file;

   // Generar vista previa de la imagen
   const reader = new FileReader();
   reader.onload = (e) => {
      user.value.perfil = e.target.result;
   };
   reader.readAsDataURL(file);
};

//  Función para seleccionar una imagen predeterminada
const selectDefaultImage = (imageUrl) => {
   file.value = imageUrl;
   selectedDefaultImage.value = imageUrl;
};


//  Cerrar el modal de selección de imagen
const closeImageSelection = () => {
   showImageSelection.value = false;
   profileAction.value = "";
};

onMounted(async () => {
   try { 
      const ImageResponse = await fetch("https://echobeatapi.duckdns.org/playlists/default-photos");
      if (!ImageResponse.ok) throw new Error("Error al cargar imágenes predeterminadas");
      defaultImages.value = await ImageResponse.json();
      console.log('Canciones predeterminadas', defaultImages.value)
   
   } catch (error) {
      console.error('Error:', error);
   }
});


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
            body: 
               formData,
            })
         
         if (!response.ok) {
            const errorData = await response.text(); // Ver el error en texto
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
   margin-top: 2rem;
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
   position: absolute;
   top: 20px;
   left: 510px;
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
