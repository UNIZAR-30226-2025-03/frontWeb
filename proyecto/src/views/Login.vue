<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Bienvenido a GoBeat</h2>

      <label for="email">Correo Electrónico</label>
      <input type="email" placeholder="Introduce tu correo" name="email" required />

      <label for="password">Contraseña</label>
      <input type="password" placeholder="Introduce tu contraseña" name="password" required />

      <a href="/Pwd" class="forgot-password">He olvidado mi contraseña</a>

      <button class="login-btn">INICIA SESIÓN</button>
      <button @click="handleRegister" class="register-btn">REGÍSTRATE</button>
      <!-- BORRAR CUANDO SE IMPLEMENTE EL LOG IN-->
      <router-link to="/home"> 
          <span>Boton temporal home</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogin = () => {
  // Lógica de autenticación
};

const handleRegister = () => {
  router.push('/Signin');
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
  border-radius: 12px;
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
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid #ffa500;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #fff;
}

input::placeholder {
  color: #ccc;
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
