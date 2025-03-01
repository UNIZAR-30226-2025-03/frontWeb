<template>
    <div class="pwd-container">
      <div class="pwd-box">
        <h2>Recuperar contraseña</h2>
        <span>Intrduce tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña </span>
  
        <input type="email" v-model="email" placeholder="Introduce tu correo" name="email" required />
  
        <button @click="handlerPwd">ENVIAR</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import {ref} from "vue";
  import { useRouter } from 'vue-router';
  const email = ref("");
  
  const errorMessage = ref("");
  const router = useRouter();
  
  const handlerPwd = async () => {
  try {
    const response = await fetch('http://48.209.24.188:3000/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Email: email.value // 🔹 Accedemos correctamente al valor
        
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }

    console.log('solicitud exitosa:', data);
    errorMessage.value = 'error';
    router.push('/');

  } catch (error) {
    console.error('Error:', error);
}}
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
    border-radius: 25px;
    box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
    width: 100%;
    max-width: 500px;
  }
  
  h2 {
    color: #ffa500;
    margin-bottom: 1.5rem;
  }
  
  
  input[type="email"] {
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
    margin-top: 1rem;
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
  
  </style>
  