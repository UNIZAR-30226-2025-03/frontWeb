<template>
   <div class="pwd-container">
      <div v-if="!showPopupSuccess" class="pwd-box">
         <img class="logo" :src="logo" alt="Logo"/>
         <h2>Cambiar contraseña</h2>
         <span>Introduce tu nueva contraseña y confírmala </span>
         
         <label for="pwd">Nueva contraseña</label>
         <input type="password" v-model="password" placeholder="Introduce tu nueva contraseña" name="pwd" required />
         
         <label for="confirm_pwd">Confirmar contraseña</label>
         <input type="password" v-model="confirmPassword" placeholder="Confirma tu nueva contraseña" name="confirm_pwd" required />
         
         <button @click="handlerPwd">CONFIRMAR</button>
      </div>

      <div v-if="showPopup && !showPopupSuccess" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>

      <!-- Popup de éxito que se muestra en el centro y oculta el resto -->
      <div v-if="showPopupSuccess" class="popup-success-container">
         <div class="popup-success">
            {{ popupMessage }}
         </div>
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from 'vue-router';
import logo from '@/assets/logo.png';  // Recurso gráfico: logo

/**
 * Instancia del router para la navegación programática.
 * @type {object}
 */
const router = useRouter();

/**
 * Objeto reactivo que representa la ruta actual.
 * @type {object}
 */
const route = useRoute();

/**
 * Estado reactivo para almacenar la nueva contraseña ingresada por el usuario.
 * @type {Ref<string>}
 */
const password = ref("");

/**
 * Estado reactivo para almacenar la confirmación de la nueva contraseña.
 * @type {Ref<string>}
 */
const confirmPassword = ref("");

/**
 * Estado reactivo para almacenar el token recibido por query parameters.
 * @type {Ref<string>}
 */
const token = ref("");

/**
 * Estado reactivo que controla la visibilidad del popup de error.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo que controla la visibilidad del popup de éxito.
 * @type {Ref<boolean>}
 */
const showPopupSuccess = ref(false);

/**
 * Estado reactivo que almacena el mensaje a mostrar en el popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo que define el tipo del popup ('popup-error' o 'popup-success').
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/**
 * Muestra un popup con el mensaje y tipo especificado.
 *
 * Además, activa el popup de éxito si el tipo es "popup-success" o cierra el popup de error después de 3 segundos.
 *
 * @param {string} message - Mensaje a mostrar en el popup.
 * @param {string} type - Tipo del popup ("popup-error" o "popup-success").
 */
const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;
   showPopupSuccess.value = false;

   if (type === "popup-success") {
      showPopupSuccess.value = true;
   }

   if (type !== "popup-success") {
      setTimeout(() => {
         showPopup.value = false;
      }, 3000);
   }
};

/**
 * Función para cerrar el popup de éxito.
 */
const closePopupSuccess = () => {
   showPopupSuccess.value = false;
};

/**
 * Hook de ciclo de vida: onMounted.
 *
 * Se ejecuta cuando el componente se ha montado. Se extrae el token de la query de la URL y se almacena en el estado reactivo.
 */
onMounted(() => {
   token.value = route.query.token;
   console.log('Token recibido:', token.value);
});

/**
 * Función que maneja el cambio de contraseña.
 *
 * Realiza las siguientes tareas:
 * - Verifica que ambos campos de contraseña no estén vacíos.
 * - Verifica que la contraseña y su confirmación coincidan.
 * - Realiza la petición a la API para restablecer la contraseña.
 * - Muestra un popup con el mensaje de error o éxito según corresponda.
 *
 * @async
 * @throws {Error} Si la respuesta de la API no es exitosa.
 */
const handlerPwd = async () => {
   if (!password.value.trim() || !confirmPassword.value.trim()) {
      showPopupMessage("Introduce las dos contraseñas", "popup-error");
      return;
   } else if (password.value !== confirmPassword.value) {
      showPopupMessage("Las contraseñas no coinciden", "popup-error");
      return;
   }
   try {
      const response = await fetch('https://echobeatapi.duckdns.org/auth/reset-password', {
         method: 'POST',
         headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            Token: token.value,
            NewPassword: password.value 
         })
      });

      if (!response.ok) {
         throw new Error('Error en el cambio de contraseña');
      }

      showPopupMessage("Contraseña cambiada con éxito. Continúa al inicio de sesión", "popup-success");
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
   background-color: #1a1a1a;
   z-index: 9999; 
   display: flex;
   justify-content: center;
   align-items: center;
}

.pwd-box {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 12px;
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

input {
   width: 95%;
   padding: 10px;
   margin-top: 10px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
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

.logo {
   width: 100px;
}

/* Popup error */
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

.popup-success-container {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
   background-color: #1a1a1a;
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 10000;
}

.popup-success {
   background-color: rgba(76, 175, 80, 0.9);
   color: white;
   padding: 55px 110px;
   font-size: 2rem;
   font-weight: bold;
   border-radius: 20px;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.close-btn {
   background-color: transparent;
   color: white;
   border: none;
   font-size: 1rem;
   margin-top: 10px;
   cursor: pointer;
   font-weight: normal;
}
</style>
