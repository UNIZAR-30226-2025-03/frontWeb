<template>
   <div class="create-list-container">
      <div class="create-list-box">
         <h2>Crear Nueva Lista</h2>
         <span>Rellena los siguientes campos para crear tu lista de reproducción</span>

         <label for="list-name">Nombre de la Lista</label>
         <input type="text" v-model="nombre" placeholder="Introduce el nombre de la lista" required />

         <label for="list-description">Descripción</label>
         <input type="text" v-model="descripcion" placeholder="Breve descripción de la lista" required />
         
         <label for="genero">Género</label>
         <select v-model="genero" required>
            <option disabled value="">Selecciona un género</option>
            <option value="Rock">Rock</option>
            <option value="Reggaeton">Reggaeton</option>
            <option value="Jazz">Jazz</option>
            <option value="Pop">Pop</option>
         </select>

         <label for="privacidad">Privacidad</label>
         <select v-model="privacidad" required>
            <option disabled value=""> Selecciona para quién será visible la lista </option>
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
            <option value="protegido">Protegido</option>
         </select>

         <button @click="handleCreateList">CREAR</button>
      </div>

      <div v-if="showPopup" :class="popupType" class="popup">
         {{ popupMessage }}
      </div>
   </div>
</template>
  
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const nombre = ref("");
const descripcion = ref("");
const genero = ref("");
const privacidad = ref("");

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

const handleCreateList = async () => {
   if (!nombre.value.trim() || !descripcion.value.trim() || !genero.value || !privacidad.value) {
      showPopupMessage("Todos los campos son obligatorios.", "popup-error");
      return;
   }

   try {
      const response = await fetch("https://echobeatapi.duckdns.org/playlists", {
      method: "POST",
      headers: {
         "Accept": "application/json",
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
         nombre: nombre.value,
         descripcion: descripcion.value,
         genero: genero.value,
         privacidad: privacidad.value
      })
      });

      if (!response.ok) {
      throw new Error("Error al crear la lista");
      }

      showPopupMessage("Lista creada con éxito", "popup-success");

      setTimeout(() => {
      router.push("/home"); 
      }, 2000);
   } catch (error) {
      showPopupMessage(error.message, "popup-error");
   }
};
</script>
  
<style scoped>
.create-list-container {
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

.create-list-box {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 20px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 100%;
   max-width: 500px;
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

input, select {
   width: 100%;
   padding: 10px;
   margin-top: 10px;
   border: 1px solid #ffa500;
   border-radius: 4px;
   background-color: #2a2a2a;
   color: #fff;
   box-sizing: border-box;
}


input::placeholder {
   color: #ccc;
}

button {
   width: 60%;
   padding: 12px;
   margin-top: 2rem;
   border: none;
   border-radius: 4px;
   color: #fff;
   font-weight: bold;
   cursor: pointer;
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
