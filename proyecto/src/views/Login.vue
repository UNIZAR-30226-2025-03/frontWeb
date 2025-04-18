<template>
   <!-- Muestra un spinner de carga mientras se verifica el token -->
   <div v-if="isLoading" class="loading-spinner">
      <div >Cargando...</div>
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
import googleLogo from '@/assets/Google_logo.svg';
import logo from '@/assets/logo.png';

const email = ref("");
const password = ref("");
const router = useRouter();

const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("popup-error");

// Estado de carga
const isLoading = ref(true);
const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
      showPopup.value = false;
   }, 3000);
};

// Función para verificar el token
const validateToken = async (token) => {
   console.log("Validando token...");
   try {
      const response = await fetch("https://echobeatapi.duckdns.org/auth/validate-token", {
         method: "POST",
         headers: {
            "Content-Type": "application/json"
         },
         body: JSON.stringify({ token }) // Enviamos el token en el body
      });
      console.log(response);
      if (!response.status === 201) {
         throw new Error("Token inválido o caducado.");
      }

      const data = await response.json();
      console.log("Data:");
      console.log(data);
      return data; // Token válido
   } catch (error) {
      console.error(error);
      return null; // Token inválido
   }
};

const handleRegister = () => {
   router.push('/Signin');
};

const handleLogin = async () => {
   // Si no hay token o el token es inválido, proceder con el login normal
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

      // 2️⃣ Si existe el nickname, proceder con el login
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
      localStorage.setItem("token", Data.accessToken);
      localStorage.setItem("email", Data.Email);
      console.log(Data.Email);
      showPopupMessage(`Bienvenido, ${userData.Nick}!`, "popup-success");

      // Redirigir al usuario al home
      setTimeout(() => {
         router.push("/home");
      }, 2000);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};

const loginWithGoogle = () => {
   window.location.href = "https://echobeatapi.duckdns.org/auth/google"; // 🔹 Redirige al backend
};

// Usamos onMounted para verificar el token cuando se monta el componente
onMounted(async () => {
   const token = localStorage.getItem("token");

   // Verificar si hay un token
   if (token) {
      // Si hay token, validamos si es válido
      const tokenValid = await validateToken(token);
      if (tokenValid.message === 'Token válido') {
         console.log(tokenValid);
         // Si el token es válido, redirigimos al home
         console.log("Token válido. Redirigiendo al home...");
         router.push("/home");
      } else {
         // Si el token no es válido (caducado), elimina el token
         localStorage.removeItem("token");
         // Redirigir a la página de login ("/")
         router.push("/"); 
      }
   } else {
      // Si no hay token, seguimos en la página de login
      isLoading.value = false;
   }

   // Después de verificar el token, actualizamos isLoading a false para renderizar el contenido
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

.loading-spinner{ 
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
   font-size: larger;

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
  
