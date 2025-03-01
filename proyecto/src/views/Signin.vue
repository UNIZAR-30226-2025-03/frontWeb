<template>
  <!-- Repasar css -->
  <div class="login-container">
    <div class="login-box">
      <h2>Crear cuenta</h2>

      <label for="email">Correo Electrónico</label>
      <input type="email" v-model="email"placeholder="Introduce tu correo" name="email" required />

      <label for="user">Usuario</label>
      <input type="user" v-model="user" placeholder="Introduce tu nombre de usuario" name="user" required />

      <label for="born">Fecha de nacimiento</label>
      <input type="born" v-model="fecha" placeholder="Introduce tu fecha de nacimiento" name="born" required />

      <label for="pwd">Contraseña </label>
      <input type="password" v-model="password" placeholder="Introduce tu contraseña" name="pwd" required />

      <label for="confirm_pwd">Confirmar contraseña </label>
      <input type="password" placeholder="Confirma tu contraseña" name="confirm_pwd" required />


      <button @click="handleRegister" class="register-btn">REGISTRAR</button>
      
    </div>
  </div>
</template>
  
  <script setup>
  import {ref} from "vue";
  import { useRouter } from 'vue-router';
  const email = ref("");
  const password = ref("");
  const user = ref("");
  const fecha = ref("");
  
  const errorMessage = ref("");
  const router = useRouter();
  
  const handleRegister = async () => {
  try {
    const response = await fetch('http://48.209.24.188:3000/users/register', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Email: email.value, // 🔹 Accedemos correctamente al valor
        Password: password.value,
        Nick: user.value,
        FechaNacimiento: fecha.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro');
    }

    console.log('Registro exitoso:', data);
    errorMessage.value = 'error';
    router.push('/');

  } catch (error) {
    console.error('Error:', error);
}}
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
