<template>
  <!-- Repasar css -->
  <div class="login-container">
    <div class="login-box">
      <h2>Crear cuenta</h2>

      <label for="name">Nombre y apellidos</label>
      <input type="name" placeholder="Introduce tu nombre y apellidos" name="name" required />

      <label for="email">Correo Electrónico</label>
      <input type="email" placeholder="Introduce tu correo" name="email" required />

      <label for="user">Usuario</label>
      <input type="user" placeholder="Introduce tu nombre de usuario" name="user" required />

      <label for="born">Fecha de nacimiento</label>
      <input type="born" placeholder="Introduce tu fecha de nacimiento" name="born" required />

      <label for="pwd">Contraseña </label>
      <input type="pwd" placeholder="Introduce tu contraseña" name="pwd" required />

      <label for="confirm_pwd">Confirmar contraseña </label>
      <input type="confirm_pwd" placeholder="Confirma tu contraseña" name="confirm_pwd" required />


      <button class="register-btn">REGISTRAR</button>
      
    </div>
  </div>
</template>
  
  <script setup>
  import xicon from '@/assets/x.svg';
  import {inject} from "vue";
  import { useRouter } from 'vue-router';

  const router = useRouter();

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

.forgot-password {
  display: block;
  text-align: right;
  margin-top: 0.5rem;
  color: #ffa500;
  text-decoration: none;
  font-size: 0.9rem;
}

button {
  width: 60%;
  padding: 12px;
  margin-top: 1.25rem;
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
