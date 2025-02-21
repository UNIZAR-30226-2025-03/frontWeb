<template>
  <!-- Repasar css -->
  <div class="login-container" @click="closeLogin" >
    <div class="login-box" @click.stop >
      <h2 style="color:black">  Crea una cuenta</h2>
      <!-- Sección de Nombre y Apellidos en la misma línea -->
      <div class="row">
        <div class="input-group">
          <label  for="name" ><b>Nombre</b></label>
          <input type="text" placeholder="Nombre" name="name" required>
        </div>

        <div class="input-group">
          <label for="apellidos"><b>Apellidos</b></label>
          <input type="text" placeholder="Apellidos" name="apellidos" required>
        </div>
      </div>

      <!-- Correo Electrónico en una sola línea -->
      <div class="input-group full-width">
        <label for="correo"><b>Correo electrónico</b></label>
        <input type="text" placeholder="Correo" name="correo" required>
      </div>

      <!-- Usuario (medio div) -->
      <div class="input-group half-width">
        <label for="uname"><b>Nombre de usuario</b></label>
        <input type="text" placeholder="Usuario" name="uname" required>
      </div>

      <!-- Contraseñas en la misma línea -->
      
        <div class="input-group">
          <label for="psw"><b>Contraseña</b></label>
          <input type="password" placeholder="Contraseña" name="psw" required>
        </div>

        <div class="input-group">
          <label for="confirm_psw"><b>Confirmar contraseña</b></label>
          <input type="password" placeholder="Confirmar contraseña" name="confirm_psw" required>
        </div>
      

        <button type="submit">Aceptar</button>
        <label style="color: black;">
          <input type="checkbox" checked="checked" name="remember"> Remember me
        </label>
        
        <span class="psw"><a href="#">Has olvidado la contraseña?</a></span>
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
/* Estilo para las filas */
.row {
  display: flex;
  justify-content: space-between;
  gap: 15px; /* Espaciado entre elementos */
  width: 100%;
}

/* Grupo de inputs */
.input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Input que ocupa el 100% */
.full-width {
  width: 100%;
}

/* Input que ocupa la mitad */
.half-width {
  width: 48%;
  align-self: flex-start;
}

/* Separador entre secciones */
.separator {
  border: none;
  height: 1px;
  background-color: #ddd;
  margin: 15px 0;
}


/* Responsivo: Ajuste en pantallas pequeñas */
@media screen and (max-width: 400px) {
  .login-box {
    width: 90%;
  }
  .row {
    flex-direction: column;
  }
  .half-width {
    width: 100%;
  }
}

  
  </style>
  