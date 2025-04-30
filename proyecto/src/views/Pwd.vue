<template>
   <div class="pwd-container">
      <div class="pwd-box">
         <div class="back-btn-container">
            <button @click="goBack" class="back-btn">&#8592; VOLVER</button>
         </div>
         <img class="logo" :src="logo" alt="Logo"/>
         <h2>Recuperar contraseña</h2>
         <span>Intrduce tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña </span>

         <input type="email" v-model="email" placeholder="Introduce tu correo" name="email" required />

         <button @click="handlerPwd">ENVIAR</button>
      </div>
      <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
  </div>
</template>
  
<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png';

/**
 * Estado reactivo para almacenar el correo electrónico ingresado por el usuario.
 * @type {Ref<string>}
 */
const email = ref("");

/**
 * Instancia del router para navegación programática.
 * @type {object}
 */
const router = useRouter();

/**
 * Estado reactivo que controla la visualización del popup.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo para almacenar el mensaje que se mostrará en el popup.
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
 * Función asíncrona que maneja el proceso de solicitud de recuperación de contraseña.
 *
 * Realiza lo siguiente:
 *  - Envía una petición POST a la API para iniciar el proceso de "forgot-password" usando el correo del usuario.
 *  - Si la petición es exitosa, muestra un mensaje de éxito y redirige al usuario a la página de login.
 *  - Si ocurre algún error, muestra un mensaje de error.
 *
 * @async
 */
const handlerPwd = async () => {
   try {
      const response = await fetch('https://echobeatapi.duckdns.org/auth/forgot-password', {
         method: 'POST',
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            Email: email.value
         })
      });

      if (!response.ok) {
         throw new Error('Error en la solicitud');
      }

      showPopupMessage("Solicitud enviada con éxito", "popup-success");
      setTimeout(() => {
         router.push("/");
      }, 2000);

   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};
</script>

  
<style scoped>
.pwd-container {
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

.pwd-box {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 25px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 100%;
   max-width: 500px;
}

h2 {
   color: #ffa500;
   margin-bottom: 1.5rem;
   }
  
input {
   width: 95%;
   padding: 10px;
   margin-top: 25px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
}

input::placeholder {
   color: #ababa5;
}

button {
   width: 50%;
   padding: 12px;
   margin-top: 2rem;
   border: none;
   border-radius: 10px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
   background-color: #ffc107;
}

button:hover {
   opacity: 0.8;
}

.back-btn-container {
   display: flex;
   justify-content: flex-start;
   margin-bottom: 2rem;
   margin-top: -2rem; 
}

.back-btn {
   background-color: transparent;
   border: 1px solid #ffa500;
   color: #ffa500;
   padding: 4px 10px;           
   font-size: 0.8rem;           
   border-radius: 6px;
   font-weight: bold;
   cursor: pointer;
   transition: background-color 0.3s ease;
   max-width: 100px;
}

.back-btn:hover {
   background-color: rgba(255, 165, 0, 0.2);
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
  