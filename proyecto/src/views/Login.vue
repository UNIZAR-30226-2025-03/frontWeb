<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Bienvenido a GoBeat</h2>

      <label for="email">Correo Electrónico</label>
      <input type="email"  v-model="email" placeholder="Introduce tu correo" name="email" required />

      <label for="password">Contraseña</label>
      <input type="password" v-model="password" placeholder="Introduce tu contraseña" name="password" required />

      <div class="forgot-container">
        <a href="/Pwd" class="forgot-password">He olvidado mi contraseña</a>
      </div>

      <button @click="handleLogin" class="login-btn">INICIA SESIÓN</button>
      <button @click="handleRegister" class="register-btn">REGÍSTRATE</button>
    </div>
    <div v-if="showPopup" :class="popupType" class="popup">
        {{ popupMessage }}
    </div>
  </div>
</template>

<script setup>
import {inject, ref} from "vue";
import { useRouter } from 'vue-router';

const email = ref("");
const password = ref("");
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
  }, 3000);
};

const handleRegister = () => {
  router.push('/Signin');
};

const handleLogin = async () => {
  if (!email.value.trim() || !password.value.trim()) {
    showPopupMessage("Correo y contraseña son obligatorios", "popup-error");
    return;
  }

  try {
    // 1️⃣ Verificar si el correo está registrado buscando el nickname
    const userResponse = await fetch(
      `http://48.209.24.188:3000/users/nick?userEmail=${encodeURIComponent(email.value)}`
    );

    if (!userResponse.ok) {
      throw new Error("No existe una cuenta con este correo.");
    }

    const userData = await userResponse.json();

    if (!userData || !userData.Nick) {
      throw new Error("No existe una cuenta con este correo.");
    }

    // 2️⃣ Si existe el nickname, proceder con el login
    const loginResponse = await fetch("http://48.209.24.188:3000/auth/login", {
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

    showPopupMessage(`Bienvenido, ${userData.Nick}!`, "popup-success");

    // Redirigir al usuario al home
    setTimeout(() => {
      router.push("/home");
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
  background-color: #1a1a1a; 
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

input[type="email"], input[type="password"] {
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
  color: #ffa500;
  text-decoration: underline;
  font-size: 0.9rem;
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
  
