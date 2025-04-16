<template>
   <div class="login-container">
      <div class="login-box">
         <div class="back-btn-container">
            <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
         </div>
         <h2>Crear cuenta</h2>

         <label for="name">Nombre</label>
         <input type="name" v-model="name"placeholder="Introduce tu nombre" name="name" required />

         <label for="email">Correo Electrónico</label>
         <input type="email" v-model="email"placeholder="Introduce tu correo" name="email" required />

         <label for="user">Usuario</label>
         <input type="user" v-model="user" placeholder="Introduce tu nombre de usuario" name="user" required />

         <label for="born">Fecha de nacimiento</label>
         <input type="date" v-model="fecha" name="born" required/>

         <label for="pwd">Contraseña </label>
         <input type="password" v-model="password" placeholder="Introduce tu contraseña" name="pwd" required />

         <label for="confirm_pwd">Confirmar contraseña </label>
         <input type="password" v-model="confirmPassword" placeholder="Confirma tu contraseña" name="confirm_pwd" required />

         <button @click="handleRegister" class="register-btn">REGISTRAR</button>
         
      </div>
      <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
   </div>
</template>
  
<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';

/**
 * Estado reactivo para el correo electrónico ingresado por el usuario.
 * @type {Ref<string>}
 */
const email = ref("");

/**
 * Estado reactivo para la contraseña ingresada por el usuario.
 * @type {Ref<string>}
 */
const password = ref("");

/**
 * Estado reactivo para la confirmación de la contraseña.
 * @type {Ref<string>}
 */
const confirmPassword = ref("");

/**
 * Estado reactivo para el nombre completo del usuario.
 * @type {Ref<string>}
 */
const name = ref("");

/**
 * Estado reactivo para el apodo (nickname) que el usuario desea registrar.
 * @type {Ref<string>}
 */
const user = ref("");

/**
 * Estado reactivo para la fecha de nacimiento del usuario.
 * @type {Ref<string>}
 */
const fecha = ref("");

/**
 * Instancia del router para la navegación programática.
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
 * Función para regresar a la página anterior utilizando el router.
 */
const goBack = () => {
   router.back();
};

/**
 * Función asíncrona para manejar el registro del usuario.
 * Realiza las siguientes acciones:
 * 1. Valida que todos los campos obligatorios estén completos.
 * 2. Verifica que las contraseñas coincidan.
 * 3. Comprueba si el correo ya está registrado.
 * 4. Si el correo no existe, envía una petición POST a la API para registrar el usuario.
 * 5. En caso de éxito, almacena el correo en el localStorage y redirige al usuario a la página de preferencias de géneros.
 *
 * @async
 */
const handleRegister = async () => {
   // Validación de campos vacíos
   if (
      !email.value.trim() || 
      !password.value.trim() || 
      !confirmPassword.value.trim() || 
      !user.value.trim() || 
      !fecha.value.trim() || 
      !name.value.trim()
   ) {
      showPopupMessage("Todos los campos son obligatorios", "popup-error");
      return;
   }
   // Verifica que las contraseñas coincidan
   else if (password.value !== confirmPassword.value) {
      showPopupMessage("Las contraseñas no coinciden", "popup-error");
      return;
   }
   try {
      // 1️⃣ Verificar si el correo ya está registrado
      const userResponse = await fetch(
         `https://echobeatapi.duckdns.org/users/nick?userEmail=${encodeURIComponent(email.value)}`
      );

      if (userResponse.ok) {
         const userData = await userResponse.json();
         if (userData?.Nick) {
            throw new Error("Ya existe una cuenta con este correo.");
         }
      }

      // 2️⃣ Si el usuario no existe, proceder con el registro
      const response = await fetch("https://echobeatapi.duckdns.org/users/register", {
         method: "POST",
         headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            Email: email.value,
            Password: password.value,
            Nick: user.value,
            FechaNacimiento: fecha.value,
            NombreCompleto: name.value
         }),
      });

      if (!response.ok) {
         throw new Error("Error en el registro");
      }
      // Guarda el correo del usuario en el localStorage después de un registro exitoso
      localStorage.setItem("email", email.value);

      showPopupMessage("Registro exitoso", "popup-success");

      // Redirige al usuario a la página de selección de géneros después de 2 segundos
      setTimeout(() => {
         router.push({ path: "/genres", query: { from: "register" } });
      }, 2000);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};
</script>

  

<style scoped>
.login-container {
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

.login-box {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 20px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 90%;
   max-width: 450px;
   max-height: 85vh;
}

h2 {
   color: #ffa500;
   margin-bottom: 1.25rem;
}

label {
   color: #ffa500;
   text-align: left;
   display: block;
   margin-top: 1rem;
}


/* Cambiar el icono del calendario */
input[type="date"]::-webkit-calendar-picker-indicator {
   filter: invert(1); /* Invierte el color del icono */
   cursor: pointer;
}

input{
   width: 95%;
   padding: 10px;
   margin-top: 8px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
}

input::placeholder {
   color: #ababa5;
}

button {
   width: 60%;
   padding: 12px;
   margin-top: 1.25rem;
   border: none;
   border-radius: 10px;
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
   left: 530px;
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
