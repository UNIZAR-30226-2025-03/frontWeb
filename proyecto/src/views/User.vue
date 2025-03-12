
<template>
   <div class="user-container">
      <div class="user-box">
         <h2>Perfil de usuario</h2>
         
         <div class="profile-container">
            <img :src="user.perfil" alt="profile" />
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" hidden />
            <a @click="triggerFileInput">Cambiar perfil</a>
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

const email = 'diego@gmail.com'; // adaptar al email con la sesión iniciada

const fileInput = ref(null);
const selectedFile = ref(null);

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

const user = ref({
   nombre: '',
   nick: '',
   perfil: '',
   nacimiento: '',
   privacidad: ''
});

let initialUser = ref({}); // Copia inicial de los datos del usuario

// Estado de edición para múltiples campos
const editingFields = ref({
   nombre: false,
   nick: false,
   nacimiento: false
});

// Función genérica para alternar el estado de edición
const toggleEdit = (field) => {
   editingFields.value[field] = !editingFields.value[field];

   if (!editingFields.value[field]) {
      console.log(`Nuevo ${field}:`, user.value[field]);
   }
};

const hasChanges = () => {
   return (
      user.value.nick !== initialUser.value.nick || 
      user.value.privacidad !== initialUser.value.privacidad 
   );
};

const formatDate = (dateString) => {
   if (!dateString) return '';  // Evita errores si la fecha es nula

   const date = new Date(dateString);
   const day = String(date.getDate()).padStart(2, '0');
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const year = date.getFullYear();

   return `${day}/${month}/${year}`; // 🔹 Formato dd-mm-yyyy
};

const formattedNacimiento = computed({
   get() {
      if (!user.value.nacimiento) return "";
      const [day, month, year] = user.value.nacimiento.split("/");
      return `${year}-${month}-${day}`; // 🔹 Convertimos dd/mm/yyyy ➝ yyyy-mm-dd
   },
   set(value) {
      if (!value) return;
      const [year, month, day] = value.split("-");
      user.value.nacimiento = `${day}/${month}/${year}`; // 🔹 Convertimos yyyy-mm-dd ➝ dd/mm/yyyy
   }
});

// Función para actualizar `user.nacimiento` cuando cambia el input
const updateNacimiento = (event) => {
   formattedNacimiento.value = event.target.value;
};


// Función para abrir el selector de archivos
const triggerFileInput = () => {
   fileInput.value.click();
};

// Función para manejar la selección de un archivo
const handleFileChange = (event) => {
   const file = event.target.files[0];
   if (file) {
      selectedFile.value = file;

      // Vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = (e) => {
         user.value.perfil = e.target.result;
      };
      reader.readAsDataURL(file);
   }
};



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
      const UserPrivacidad = userData.Privacidad

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
   } catch (error) {
      console.error('Error:', error);
   }
});


const handleSave = async () => {
   if (!hasChanges() && !selectedFile.value) {
      showPopupMessage("No hay cambios para guardar", "popup-error");
      return;
   }
   else {
      try {
         if (selectedFile.value) {
         
            const formData = new FormData();
            formData.append('Email', email);
            formData.append('file', selectedFile.value );

            console.log("Archivo a subir:", selectedFile.value);
            console.log("FormData:", formData);


            const profileResponse = await fetch("https://echobeatapi.duckdns.org/users/update-photo", { 
               method: "POST",
               headers: {},
               body: 
                  formData,
               })
            
            if (!profileResponse.ok) {
               const errorData = await profileResponse.text(); // Ver el error en texto
               throw new Error("Error al subir la imagen: " + errorData);
            }

            const profiledata = await profileResponse.json();
            // user.value.perfil = profiledata.imageUrl; // Actualizar la imagen de perfil con la nueva URL
            // initialUser.value.perfil = data.imageUrl; 

            console.log("Imagen actualizada con éxito");

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


      } catch (error) {
         showPopupMessage(error.message, "popup-error");
      }
      showPopupMessage("Cambios guardados con éxito", "popup-success")
   }
};


const logout = () => {
  localStorage.removeItem("token"); // 🔹 Eliminar el token
  window.location.href = "/"; // 🔹 Redirigir al login
};
</script>
  
<style scoped>
.user-container {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
   background-color: #1a1a1a; 
   z-index: 9999; 
   display: flex;
   justify-content: center;
   align-items: center;
}
  
.user-box {
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

.profile-container a {
   margin-top: 10px;
   color: #ffa500; 
   font-weight: bold;
   cursor: pointer;
   text-decoration: none; 
}

.profile-container a:hover {
   text-decoration: underline; 
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
   margin-top: 10px;
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