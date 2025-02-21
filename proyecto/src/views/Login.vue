<template>
  <!-- Repasar css -->
  <div class="login-container" @click="closeLogin" >
    <div class="login-box" @click.stop >
      
      <label for="uname"><b>Username</b></label>
      <input type="text" placeholder="Usuario" name="uname" required>

      <label for="psw"><b>Password</b></label>
      <input type="password" placeholder="Contraseña" name="psw" required>

      <button type="submit">Aceptar</button>
      <label style="color: black;">
        <input type="checkbox" checked="checked" name="remember"> Remember me
      </label>
      
      <span class="psw"> <a href="#">Has olvidado la contraseña?</a></span>
      <router-link to="/signin" >
        <span class="link" > Registrarse </span>
      </router-link>

     
 
      
      <!-- Revisar si se quiere con boton o sin el -->
      <img 
          class= "closebtn"
          :src="xicon" 
          alt="salir" 
          @click="closeLogin"
        />
        
    </div>

   
  </div>
  </template>
  
  <script setup>
  import xicon from '@/assets/x.svg';
  import {inject} from "vue";
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const isLoginOpen=inject('LoginOpen')

  const closeLogin=()=>{
    isLoginOpen.value=false;
    router.push('/');
  }
  </script>
  
  <style scoped>
 /* Contenedor que centra el login en la pantalla */
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ocupar toda la pantalla */
  background: rgba(0, 0, 0, 0.5);
  z-index: 1101;
  
}

/* Caja del formulario */
.login-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  width: 100%;
  max-width: 400px; /* Ajusta el tamaño del formulario */
  background: white;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  
}

/* Ajusta los inputs */
input[type=text], input[type=password] {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

/* Botón de login */
button {
  background-color: #04AA6D;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
}

/* Estilos del botón de cancelar */
.closebtn {
  position: absolute;
  top: 62vh; /* Ajusta según sea necesario */
  right: 40vw;
  width: 40px;
  height: auto;
  cursor: pointer;
  
}

/* Ajuste para el texto de "Forgot password" */
span.psw {
  float: right;
  padding-top: 16px;
}
a{
  color: #0b57d0;
}
.link{
  text-decoration: underline;
  color:#0b57d0;
}

/* Responsivo: Ajuste en pantallas pequeñas */
@media screen and (max-width: 400px) {
  .login-box {
    width: 90%;
  }
}

  
  </style>
  