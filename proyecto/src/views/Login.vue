<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Bienvenido a GoBeat</h2>

      <label for="email">Correo Electrónico</label>
      <input type="email"  v-model="email" placeholder="Introduce tu correo" name="email" required />

      <label for="password">Contraseña</label>
      <input type="password" v-model="password" placeholder="Introduce tu contraseña" name="password" required />

      <a href="/Pwd" class="forgot-password">He olvidado mi contraseña</a>

      <button @click="handleLogin" class="login-btn">INICIA SESIÓN</button>
      <button @click="handleRegister" class="register-btn">REGÍSTRATE</button>

    </div>
  </div>
</template>

<script setup>
import {inject, ref} from "vue";
import { useRouter } from 'vue-router';

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();



const handleRegister = () => {
  router.push('/Signin');
};

//login
  const handleLogin = async () => {
  try {
    const response = await fetch('http://48.209.24.188:3000/auth/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Email: email.value, // 🔹 Accedemos correctamente al valor
        Password: password.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la autenticación');
    }

    console.log('Login exitoso:', data);
    errorMessage.value = 'error';
    router.push('/home');

  } catch (error) {
    console.error('Error:', error);
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

.forgot-password {
  display: block;
  text-align: right;
  margin-top: 0.5rem;
  color: #ffa500;
  text-decoration: none;
  font-size: 0.9rem;
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

</style>
