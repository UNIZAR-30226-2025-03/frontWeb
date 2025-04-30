
<template>
   <div class="user-container">
      <div class="user-box">
         <div class="back-btn-container">
            <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
         </div>
         <h2>Perfil de usuario</h2>
         
         <div class="profile-container">
            <img :src="user.perfil" alt="profile" />
            
            <!-- Desplegable para elegir entre subir o seleccionar una imagen predeterminada -->
            <!-- Cambiar perfil solo se muestra cuando se hace clic -->
            <label for="profile-action" @click="toggleProfileActionVisibility">Cambiar perfil</label>
            <!-- Mostrar el select solo si profileActionVisible es verdadero -->
            <div v-if="profileActionVisible">
               <select id="profile-action" v-model="profileAction">
                  <option disabled value="">Selecciona una opción</option>
                  <option value="upload">Subir nueva imagen</option>
                  <option value="select">Elegir predeterminada</option>
               </select>
            </div>

            <!-- Si elige 'upload' se muestra el input para subir una imagen -->
            <div v-if="profileAction === 'upload'">
               <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" />
            </div>

            <!-- Si elige 'select' se muestra el modal para elegir una imagen predeterminada -->
            <div v-if="profileAction === 'select'" class="image-selection-modal">
               <h3>Selecciona una imagen</h3>
               <div class="image-grid">
                  <img 
                     v-for="image in defaultImages" :key="image" :src="image" @click="selectDefaultImage(image)" class="selectable-image"
                  />
               </div>
               <button class="close-btn" @click="closeImageSelection">Cerrar</button>
            </div>
         </div>

         <label for="name">Nombre</label>
         <div class="nickname-container">
            <input v-if="editingFields.nombre" v-model="user.nombre" class="nickname-input" />
            <span v-else>{{ user.nombre }}</span>
            <button class="change-btn" @click="toggleEdit('nombre')">
               {{ editingFields.nombre ? "Guardar" : "Cambiar" }}
            </button>
         </div>

         <label for="nick">Nickname</label>
         <div class="nickname-container">
            <input v-if="editingFields.nick" v-model="user.nick" class="nickname-input" />
            <span v-else>{{ user.nick }}</span>
            <button class="change-btn" @click="toggleEdit('nick')">
               {{ editingFields.nick ? "Guardar" : "Cambiar" }}
            </button>
         </div>
         
         <label for="born">Fecha de nacimiento</label>
         <div class="nickname-container">
            <input v-if="editingFields.nacimiento" v-model="formattedNacimiento" type="date" class="nickname-input" @change="updateNacimiento"/>
            <span v-else>{{ user.nacimiento }}</span>
            <button class="change-btn" @click="toggleEdit('nacimiento')">
               {{ editingFields.nacimiento ? "Guardar" : "Cambiar" }}
            </button>
         </div>
         
         <label for="privacidad">Privacidad</label>
         <select v-model="user.privacidad" required>
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
            <option value="protegido">Protegido</option>
         </select>

         <button class="gender-btn" @click="handleChangeGender">CAMBIAR PREFERENCIAS DE GÉNERO</button>
         <button class="buttons save" @click="handleSave">GUARDAR CAMBIOS</button>
         <button class="buttons logout" @click="logout">CERRAR SESIÓN</button>
      </div>
      <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
   </div>
</template>
  
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from 'vue-router';

/**
 * Correo electrónico del usuario obtenido del almacenamiento local.
 * @type {string|null}
 */
const email = localStorage.getItem("email");

/**
 * Referencia al input de archivo.
 * @type {Ref<HTMLElement|null>}
 */
const fileInput = ref(null);

/**
 * Referencia al archivo seleccionado.
 * @type {Ref<File|null>}
 */
const selectedFile = ref(null);

/**
 * Acción de perfil seleccionada (subir imagen o elegir predeterminada).
 * @type {Ref<string>}
 */
const profileAction = ref(""); // Acción seleccionada (subir imagen o elegir predeterminada)

/**
 * Controla la visibilidad del modal para seleccionar imagen predeterminada.
 * @type {Ref<boolean>}
 */
const showImageSelection = ref(false); // Modal para seleccionar imagen predeterminada

/**
 * Controla la visibilidad del selector de acción de perfil.
 * @type {Ref<boolean>}
 */
const profileActionVisible = ref(false);

/**
 * Almacena las imágenes predeterminadas obtenidas.
 * @type {Ref<Array>}
 */
const defaultImages = ref([]);  // Aquí se guardarán las imágenes predeterminadas

/**
 * Instancia del router para la navegación.
 * @type {object}
 */
const router = useRouter();

/**
 * Estado reactivo que controla la visualización del popup de mensajes.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo que almacena el mensaje que se mostrará en el popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo que define el tipo del popup ("popup-error" o "popup-success").
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/**
 * Función para mostrar un popup con un mensaje y tipo específico.
 * El popup se cierra automáticamente después de 3 segundos.
 *
 * @param {string} message - Mensaje a mostrar.
 * @param {string} type - Tipo del popup ("popup-error" o "popup-success").
 */
const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
         showPopup.value = false;
   }, 3000); // Cierra el popup después de 3 segundos
};

/**
 * Datos del usuario reactivo.
 * @type {Ref<Object>}
 * @property {string} nombre - Nombre completo del usuario.
 * @property {string} nick - Apodo del usuario.
 * @property {string} perfil - URL de la foto de perfil del usuario.
 * @property {string} nacimiento - Fecha de nacimiento del usuario (formateada).
 * @property {string} privacidad - Configuración de privacidad del usuario.
 */
const user = ref({
   nombre: '',
   nick: '',
   perfil: '',
   nacimiento: '',
   privacidad: ''
});

/**
 * Copia inicial de los datos del usuario para comparación.
 * @type {Ref<Object>}
 */
let initialUser = ref({}); // Copia inicial de los datos del usuario

/**
 * Estado reactivo que controla el modo de edición para múltiples campos.
 * @type {Ref<Object>}
 * @property {boolean} nombre - Estado de edición para el campo nombre.
 * @property {boolean} nick - Estado de edición para el campo nick.
 * @property {boolean} nacimiento - Estado de edición para el campo nacimiento.
 */
const editingFields = ref({
   nombre: false,
   nick: false,
   nacimiento: false
});

/**
 * Función para navegar a la ruta '/home' usando el router.
 */
const goBack = () => {
   router.push('/home');
};

/**
 * Función genérica para alternar el estado de edición de un campo específico.
 *
 * @param {string} field - El nombre del campo a alternar.
 */
const toggleEdit = (field) => {
   editingFields.value[field] = !editingFields.value[field];

   if (!editingFields.value[field]) {
      console.log(`Nuevo ${field}:`, user.value[field]);
   }
};

/**
 * Función que verifica si hay cambios en los datos del usuario.
 *
 * @returns {boolean} - Retorna true si hay diferencias con la copia inicial.
 */
const hasChanges = () => {
   return (
      user.value.nick !== initialUser.value.nick || 
      user.value.privacidad !== initialUser.value.privacidad ||
      user.value.nombre != initialUser.value.nombre ||
      user.value.nacimiento != initialUser.value.nacimiento 
   );
};

/**
 * Función para navegar a la ruta '/genres' con una query específica.
 */
const handleChangeGender = () => {
   router.push({ path: "/genres", query: { from: "user" } });
};

/**
 * Función para alternar la visibilidad del selector de acción de perfil.
 * Si se oculta el selector, también se ocultan el input de archivo y el modal.
 */
const toggleProfileActionVisibility = () => {
   // Alternar visibilidad del select
   profileActionVisible.value = !profileActionVisible.value;

   // Ocultar el input de archivo o el modal si se estaban mostrando
   if (!profileActionVisible.value) {
      profileAction.value = "";               // Esto oculta tanto el input como el modal
      showImageSelection.value = false;       // Asegura que el modal se cierre
   }
};

/**
 * Función para formatear una cadena de fecha a formato "dd/mm/yyyy".
 *
 * @param {string} dateString - Fecha en formato reconocible por Date.
 * @returns {string} - La fecha formateada o una cadena vacía si la entrada es nula.
 */
const formatDate = (dateString) => {
   if (!dateString) return '';  // Evita errores si la fecha es nula

   const date = new Date(dateString);
   const day = String(date.getDate()).padStart(2, '0');
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const year = date.getFullYear();

   return `${day}/${month}/${year}`; // Formato dd-mm-yyyy
};

/**
 * Propiedad computada para formatear la fecha de nacimiento.
 * Al obtener: convierte de "dd/mm/yyyy" a "yyyy-mm-dd".
 * Al establecer: convierte de "yyyy-mm-dd" a "dd/mm/yyyy".
 *
 * @type {import("vue").ComputedRef<string>}
 */
const formattedNacimiento = computed({
   get() {
      if (!user.value.nacimiento) return "";
      const [day, month, year] = user.value.nacimiento.split("/");
      return `${year}-${month}-${day}`; // Convertir dd/mm/yyyy ➝ yyyy-mm-dd
   },
   set(value) {
      if (!value) return;
      const [year, month, day] = value.split("-");
      user.value.nacimiento = `${day}/${month}/${year}`; // Convertir yyyy-mm-dd ➝ dd/mm/yyyy
   }
});

/**
 * Función para actualizar la fecha de nacimiento del usuario en base al valor del input.
 *
 * @param {Event} event - Evento del cambio de input.
 */
const updateNacimiento = (event) => {
   formattedNacimiento.value = event.target.value;
};

/**
 * Función para manejar la selección de un archivo.
 * Genera una vista previa de la imagen y la asigna al perfil del usuario.
 *
 * @param {Event} event - Evento al cambiar el input de archivo.
 */
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

/**
 * Función para seleccionar una imagen predeterminada.
 * Asigna la URL de la imagen seleccionada al perfil del usuario y restablece la acción de perfil.
 *
 * @param {string} imageUrl - URL de la imagen predeterminada.
 */
const selectDefaultImage = (imageUrl) => {
   user.value.perfil = imageUrl;
   profileAction.value = ''; // Vuelve a la opción de 'Subir nueva imagen'
};

/**
 * Función para cerrar el modal de selección de imagen predeterminada.
 * Restablece la acción de perfil y oculta el modal.
 */
const closeImageSelection = () => {
   showImageSelection.value = false;
   profileAction.value = "";
};

/**
 * Función que se ejecuta al montar el componente.
 * Obtiene los datos del usuario y las imágenes predeterminadas desde la API.
 */
onMounted(async () => {
   try { 
      const userResponse = await fetch(`https://echobeatapi.duckdns.org/users/get-user?userEmail=${encodeURIComponent(email)}`);
      if (!userResponse.ok) throw new Error('Error al obtener los datos del usuario');

      const userData = await userResponse.json();

      // Extraer los datos de la respuesta
      const userName = userData.NombreCompleto;
      const UserNick = userData.Nick;
      const UserNacimiento = formatDate(userData.FechaNacimiento); 
      const UserPerfil = userData.LinkFoto;
      const UserPrivacidad = userData.Privacidad;

      // Asignar los datos a las variables reactivas
      user.value = {
         nombre: userName,
         nick: UserNick,
         nacimiento: UserNacimiento,
         perfil: UserPerfil,
         privacidad: UserPrivacidad
      };

      initialUser.value = JSON.parse(JSON.stringify(user.value)); // Copia inicial de los datos del usuario

      console.log('Datos de usuario:', user.value);

      const ImageResponse = await fetch("https://echobeatapi.duckdns.org/users/default-photos");
      if (!ImageResponse.ok) throw new Error("Error al cargar imágenes predeterminadas");
      defaultImages.value = await ImageResponse.json();
      console.log('Canciones predeterminadas', defaultImages.value);
   
   } catch (error) {
      console.error('Error:', error);
   }
});

/**
 * Función asíncrona para guardar los cambios del usuario.
 * Realiza actualizaciones condicionales para foto de perfil, nickname, privacidad, nombre completo y fecha de nacimiento.
 */
const handleSave = async () => {
   if (!hasChanges() && !selectedFile.value && user.value.perfil === initialUser.value.perfil) {
      showPopupMessage("No hay cambios para guardar", "popup-error");
      return;
   }
   else {
      let hasError = false;
      try {
         if (selectedFile.value) {
            const formData = new FormData();
            formData.append('Email', email);
            formData.append('file', selectedFile.value);

            console.log("Archivo a subir:", selectedFile.value);

            const profileResponse = await fetch("https://echobeatapi.duckdns.org/users/update-photo", { 
               method: "POST",
               headers: {},
               body: formData,
            });
            
            if (!profileResponse.ok) {
               const errorData = await profileResponse.text(); // Ver el error en texto
               throw new Error("Error al subir la imagen");
            }

            console.log("Imagen actualizada con éxito");
         }
         else if (user.value.perfil !== initialUser.value.perfil) {

            console.log("Archivo a subir:", user.value.perfil);
            const profileResponse = await fetch("https://echobeatapi.duckdns.org/users/update-photo-default", {
               method: 'POST',
               headers: {
                  'Accept': '*/*', 
                  'Content-Type': 'application/json',  
               },
               body: JSON.stringify({
                  userEmail: email,  
                  imageUrl: user.value.perfil 
               })
            });

            if (!profileResponse.ok) {
               console.log("Error con la imagen predeterminada");
               throw new Error("Error al actualizar la imagen ");
            }

            console.log("Imagen predeterminada actualizada correctamente");
            initialUser.value.perfil = user.value.perfil;
         }
         
         if (user.value.nick !== initialUser.value.nick) {
            const response = await fetch(`https://echobeatapi.duckdns.org/users/change-nick?userEmail=${encodeURIComponent(email)}&Nick=${encodeURIComponent(user.value.nick)}`, {
               method: 'POST',
               headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
               },
            });

            if (!response.ok) throw new Error("Error al actualizar el nickname");

            console.log("Nickname actualizado con éxito");
            initialUser.value.nick = user.value.nick; // Actualizar el estado inicial
         }

         if (user.value.privacidad !== initialUser.value.privacidad) {
            const privacyResponse = await fetch("https://echobeatapi.duckdns.org/users/update-privacy", { 
               method: "POST",
               headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
               },
               body: JSON.stringify({
                  Email: email,
                  Privacy: user.value.privacidad
               })
            });
            
            if (!privacyResponse.ok) throw new Error("Error al actualizar privacidad");

            const privacyData = await privacyResponse.json();
            user.value.privacidad = privacyData.newPrivacy;
            initialUser.value.privacidad = user.value.privacidad; // Actualizar el estado inicial

            console.log(privacyData.message);
         }

         if (user.value.nombre !== initialUser.value.nombre) {
            const nameResponse = await fetch("https://echobeatapi.duckdns.org/users/update-fullname", { 
               method: "POST",
               headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
               },
               body: JSON.stringify({
                  userEmail: email,
                  nombreReal: user.value.nombre
               })
            });
            
            if (!nameResponse.ok) throw new Error("Error al actualizar el nombre completo");

            const nameData = await nameResponse.json();
            user.value.nombre = nameData.NombreCompleto;
            initialUser.value.nombre = user.value.NombreCompleto; // Actualizar el estado inicial

            console.log(nameData.message);
         }

         if (user.value.nacimiento !== initialUser.value.nacimiento) {
            const formattedDateForAPI = formattedNacimiento.value; // Esto ya está en yyyy-mm-dd
            console.log('Fecha de nacimiento: ', formattedDateForAPI);
            const birthResponse = await fetch("https://echobeatapi.duckdns.org/users/update-birthdate", { 
               method: "POST",
               headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json"
               },
               body: JSON.stringify({
                  userEmail: email,
                  birthdate: formattedDateForAPI // Enviar el formato correcto
               })
            });

            if (!birthResponse.ok) throw new Error("Error al actualizar la fecha de nacimiento");

            const birthData = await birthResponse.json();
            user.value.nacimiento = formatDate(birthData.FechaNacimiento); // Convertir de vuelta a dd/mm/yyyy
            initialUser.value.nacimiento = user.value.nacimiento;          // Actualizar el estado inicial

            console.log(birthData.message);
         }

      } catch (error) {
         hasError = true;
         showPopupMessage(error.message, "popup-error");
      }
      if (!hasError) {
         showPopupMessage("Cambios guardados con éxito", "popup-success");
         initialUser.value = JSON.parse(JSON.stringify(user.value));
         selectedFile.value = null; // Resetear el archivo seleccionado
      }
   }
};

/**
 * Función para cerrar sesión.
 * Elimina la información del usuario del almacenamiento local y redirige al login.
 */
const logout = () => {
  localStorage.clear(); // 🔹 Eliminar el token
  window.location.href = "/"; // 🔹 Redirigir al login
  sessionStorage.removeItem('home-song-loaded')
};
</script>

<style scoped>

.user-container {
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
   padding: 10px; 
}
  
.user-box {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 20px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 100%;
   max-width: 500px;
   max-height: 88vh; /* Ajuste para scroll */
   overflow-y: scroll; /* Mantiene el scroll */
   
}

/* Para Webkit (Chrome, Safari, Edge) */
.user-box::-webkit-scrollbar {
   width: 0px; /* Hace la barra de desplazamiento invisible */
}

.user-box::-webkit-scrollbar-thumb {
   background: transparent; /* También puedes ocultar el "thumb" (parte movible) */
}
  
h2 {
   color: #ffa500;
   margin-bottom: 1rem;
}
  
label {
   color: #ffa500;
   text-align: left;
   display: block;
   margin-top: 0.5rem;
}

span {
   text-align: left;
   display: block;
   margin-top: 10px;
}
  
input, select {
   width: 100%;
   padding: 10px;
   margin-top: 10px;
   margin-bottom: 10px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
   box-sizing: border-box;
}

.nickname-container {
   display: flex;
   justify-content: space-between;
   align-items: center;
   width: 100%;
}

.nickname-input {
   flex: 1;
   padding: 5px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: white;
}

.profile-container {
   display: flex;
   flex-direction: column;
   align-items: center;
   text-align: center;
   margin-top: 20px;
}

.profile-container img {
   width: 120px; 
   height: 120px;
   border-radius: 50%; 
   object-fit: cover;
   border: 2px solid #ffa500; 
}

.profile-container label {
   color: #ffa500; /* Color inicial */
   text-align: left;
   display: block;
   margin-top: 0.5rem;
   cursor: pointer; /* Cambia el cursor para indicar que es interactivo */
   transition: color 0.3s ease, text-decoration 0.3s ease; /* Transición suave */
}

.profile-container label:hover {
   opacity: 0.8;
   text-decoration: underline; /* Subraya el texto al pasar el ratón */
}

.change-btn {
   margin-left: 10px;
   background-color: #ff5722;
   color: white;
   border: none;
   padding: 8px 12px;
   border-radius: 4px;
   cursor: pointer;
   font-weight: bold;
}

input[type="date"]::-webkit-calendar-picker-indicator {
   filter: invert(1); /* Invierte el color del icono */
   cursor: pointer;
}

.buttons {
   width: 100%;
   padding: 12px;
   margin-top: 1rem;
   border: none;
   border-radius: 4px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
   background-color: #ff5722;
}

.buttons.logout {
   background-color: #ff5722;
}

.buttons.save {
   background-color: #ffc107;
}

.gender-btn {
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: white;
   color: black;
   font-weight: bold;
   border: 1px solid #ccc;
   padding: 12px;
   border-radius: 4px;
   cursor: pointer;
   width: 100%;
   margin-top: 1rem;
}
  
button:hover {
   opacity: 0.8;
}

.image-selection-modal {
   position: fixed;
   top: 35%;
   left: 50%;
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
   gap: 10px;
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
}

.selectable-image:hover {
   transform: scale(1.1);
   border: 2px solid #ffa500;
}

.back-btn-container {
   display: flex;
   justify-content: flex-start;
   margin-top: -1rem; 
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

.close-btn {
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

.close-btn:hover {
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