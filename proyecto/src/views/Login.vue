<template>
   <!-- Muestra el spinner de carga con el texto -->
   <div v-if="isLoading" class="loading-spinner">
      <!-- Contenedor con texto y el SVG debajo -->
      <div class="loading-content">
         <div class="loading-text">Cargando...</div>

         <!-- SVG cargando (con un timer) debajo del texto -->
         <div class="spinner-container">
            <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="#ffffff">
               <path d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Z"/>
            </svg>
         </div>
      </div>
   </div>

   <!-- Si isLoading es false, renderiza la pantalla de login -->
   <div v-else class="login-container">
      <div class="login-box">
         <img class="logo" :src="logo" alt="Logo"/>
         <h2>Bienvenido a EchoBeat</h2>

         <label for="email">Correo Electrónico</label>
         <input type="email"  v-model="email" placeholder="Introduce tu correo" name="email" required />

         <label for="password">Contraseña</label>
         <input type="password" v-model="password" placeholder="Introduce tu contraseña" name="password" required />

         <div class="forgot-container">
         <a href="/Pwd" class="forgot-password">He olvidado mi contraseña</a>
         </div>

         <button @click="handleLogin" class="login-btn">INICIA SESIÓN</button>
         <button @click="loginWithGoogle" class="google-btn">
            <img :src="googleLogo" alt="Google Logo"/>
            CONTINUAR CON GOOGLE
         </button>
         <button @click="handleRegister" class="register-btn">REGÍSTRATE</button>
      </div>
      <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
   </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { emitter } from '@/js/event-bus';
import googleLogo from '@/assets/Google_logo.svg';
import logo from '@/assets/logo.png';

/**
 * Estado reactivo para almacenar el correo electrónico introducido por el usuario.
 * @type {Ref<string>}
 */
const email = ref("");

/**
 * Estado reactivo para almacenar la contraseña introducida por el usuario.
 * @type {Ref<string>}
 */
const password = ref("");

/**
 * Instancia del router para la navegación programática.
 * @type {object}
 */
const router = useRouter();

/**
 * Estado reactivo que controla la visibilidad del popup de mensajes.
 * @type {Ref<boolean>}
 */
const showPopup = ref(false);

/**
 * Estado reactivo que almacena el mensaje a mostrar en el popup.
 * @type {Ref<string>}
 */
const popupMessage = ref("");

/**
 * Estado reactivo que define el tipo de popup ("popup-error" o "popup-success").
 * @type {Ref<string>}
 */
const popupType = ref("popup-error");

/**
 * Estado reactivo que controla la carga de la página.
 * @type {Ref<boolean>}
 */
const isLoading = ref(true);

/**
 * Estado reactivo que controla el estado de admin.
 * @type {Ref<boolean>}
 */
 const isAdmin = ref(true);

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
   }, 3000);
};

/**
 * Función asíncrona para validar un token.
 * Envía una petición a la API para validar el token proporcionado y retorna la respuesta.
 *
 * @async
 * @param {string} token - Token a validar.
 * @returns {object|null} Datos del token si es válido o null si no lo es.
 * @throws {Error} Si ocurre un fallo en la petición a la API.
 */
const validateToken = async (token) => {
   console.log("Validando token...");
   try {
      const response = await fetch("https://echobeatapi.duckdns.org/auth/validate-token", {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({ token }) // Enviamos el token en el cuerpo de la petición
      });
      console.log(response);
      // Si la respuesta no es 201, se considera un error en la validación
      if (!response.status === 201) {
         throw new Error("Token inválido o caducado.");
      }
      const data = await response.json();
      console.log("Data:");
      console.log(data);
      return data; // Retorna los datos del token si es válido
   } catch (error) {
      console.error(error);
      return null; // Retorna null si el token es inválido
   }
};

/**
 * Función que redirige al usuario a la página de registro.
 */
const handleRegister = () => {
   router.push('/Signin');
};

/**
 * Función asíncrona que maneja el proceso de login.
 * Realiza las siguientes acciones:
 * 1. Verifica que el correo y la contraseña no estén vacíos.
 * 2. Solicita el nick del usuario mediante su correo.
 * 3. Procede con el login enviando las credenciales.
 * 4. Guarda el token y el correo en el localStorage y redirige al usuario al home.
 *
 * @async
 */
const handleLogin = async () => {
   // Verificar que el correo y la contraseña no sean cadenas vacías
   if (!email.value.trim() || !password.value.trim()) {
      showPopupMessage("Correo y contraseña son obligatorios", "popup-error");
      return;
   }

   try {
      // 1️⃣ Verificar si el correo está registrado buscando el nickname
      const userResponse = await fetch(
         `https://echobeatapi.duckdns.org/users/nick?userEmail=${encodeURIComponent(email.value)}`
      );

      if (!userResponse.ok) {
         throw new Error("No existe una cuenta con este correo.");
      }

      const userData = await userResponse.json();

      if (!userData || !userData.Nick) {
         throw new Error("No existe una cuenta con este correo.");
      }

      // 2️⃣ Si se obtiene el nickname, proceder con el login
      const loginResponse = await fetch("https://echobeatapi.duckdns.org/auth/login", {
         method: "POST",
         headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
            Email: email.value,
            Password: password.value
         })
      });

      if (!loginResponse.ok) {
         throw new Error("Credenciales incorrectas. Verifica tu correo y contraseña.");
      }

      const Data = await loginResponse.json();

      // 3. Almacenamiento en localStorage (siempre en string)
      localStorage.setItem('token', Data.accessToken);
      localStorage.setItem('email', Data.Email);
      localStorage.setItem('isAdmin', JSON.stringify(Data.esAdmin));
      localStorage.setItem("isAdmin", Data.esAdmin.toString());
      console.log(Data.Email);
      console.log(Data.esAdmin);

      // 4. Mensaje de bienvenida
      showPopupMessage(`Bienvenido, ${userData.Nick}!`, 'popup-success');
      emitter.emit('user-logged-in', email);
      isAdmin.value = Data.esAdmin;
      // 5. Espera 2 segundos para que el usuario vea el popup
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 6. Redirección según rol
      if (Data.esAdmin) {
         router.push('/admin');
      } else {
         router.push('/home');
      }
   } catch (error) {
   showPopupMessage(error.message, "popup-error");
  }
};

/**
 * Función para iniciar el proceso de autenticación mediante Google.
 * Redirige al usuario al backend para la autenticación con Google.
 */
const loginWithGoogle = () => {
   window.location.href = "https://echobeatapi.duckdns.org/auth/google"; // Redirige al backend
};

/**
 * Hook de ciclo de vida: onMounted.
 * Se ejecuta al montar el componente para verificar la validez del token.
 * Si el token es válido, redirige al usuario al home; de lo contrario, elimina el token y redirige al login.
 */
onMounted(async () => {
   const token = localStorage.getItem("token");

   // Verificar si hay un token en el localStorage
   if (token) {
      // Valida el token obtenido
      const tokenValid = await validateToken(token);
      if (tokenValid.message === 'Token válido') {
         console.log(tokenValid);
         // Si el token es válido, redirige al home
         console.log("Token válido. Redirigiendo al home...");
         router.push("/home");
      } else {
         // Si el token es inválido o ha caducado, elimínalo y redirige al login
         localStorage.removeItem("token");
         router.push("/");
      }
   } else {
      // Si no hay token, permanece en la página de login y marca la carga como finalizada
      isLoading.value = false;
   }

   // Actualiza el estado de carga a false para renderizar el contenido correctamente
   isLoading.value = false;
});
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
   border-radius: 25px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 90%;
   max-width: 450px;
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
   margin-top: 8px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
}

input::placeholder {
   color: #ababa5;
}

.forgot-container {
   text-align: right; 
   width: 100%;
}

.forgot-password {
   display: inline-block;
   text-align: right;
   margin-top: 0.5rem;
   color: #ffa500;
   text-decoration: underline;
   font-size: 0.9rem;
}

.forgot-password::after {
   content: "";
   position: absolute;
   left: 0;
   bottom: -2px;
   width: 100%;
   height: 2px;
   background-color: #ffa500;
   transform-origin: left;
   transition: transform 0.3s ease-in-out;
   cursor: pointer;
   margin-top: 8px;
}

.forgot-password:hover {
   color: #ffcc00;
}

button {
   width: 100%;
   padding: 12px;
   margin-top: 1rem;
   border: none;
   border-radius: 4px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
}

.login-btn {
   background-color: #ffc107;
}

.register-btn {
   background-color: #ff5722;
}

.google-btn {
   display: flex;
   align-items: center;
   justify-content: center;
   background-color: white;
   color: black;
   font-weight: bold;
   border: 1px solid #ccc;
   padding: 1px;
   border-radius: 4px;
   cursor: pointer;
   width: 100%;
   margin-top: 1rem;
}

button:hover {
   opacity: 0.8;
}

.logo {
   width: 100px;
}

.loading-spinner {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999999;

  display: flex;
  justify-content: center; /* centra horizontalmente */
  align-items: center;     /* centra verticalmente */
}

.loading-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-text {
  font-size: 36px; 
  color: #ffffff;
  margin-bottom: 10px; 
}

.spinner-container {
  margin-top: 10px; /* Separación entre el texto y el spinner */
}

.spinner-container svg {
  animation: spin 2s linear infinite; /* Animación de rotación */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  
