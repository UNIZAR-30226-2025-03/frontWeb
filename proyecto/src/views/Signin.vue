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
import {ref} from "vue";
import { useRouter } from 'vue-router';
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const name = ref("");
const user = ref("");
const fecha = ref("");

const router = useRouter();

const showPopup = ref(false);
const popupMessage = ref("");
const popupType = ref("popup-error");

const showPopupMessage = (message, type) => {
   popupMessage.value = message;
   popupType.value = type;
   showPopup.value = true;

   setTimeout(() => {
   showPopup.value = false;
   }, 3000); // Cierra el popup después de 3 segundos
};

const goBack = () => {
   router.back();
};
  
const handleRegister = async () => {
   if (!email.value.trim() || !password.value.trim() || !confirmPassword.value.trim() || !user.value.trim() || !fecha.value.trim() || !name.value.trim()){
      showPopupMessage("Todos los campos son obligatorios", "popup-error");
      return;
   }

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
      localStorage.setItem("email", email.value);

      showPopupMessage("Registro exitoso", "popup-success");

      // Redirigir al usuario al inicio de sesión
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
