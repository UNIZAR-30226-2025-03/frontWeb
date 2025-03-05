<template>
    <div class="user-container">
        <div class="user-box">
            <h2>Perfil de usuario</h2>
            <div class="profile-container">
                <img :src="user.perfil" alt="profile" />
                <a>Cambiar perfil</a>
            </div>
            <label for="nick">Nickname</label>
            <div class="nickname-container">
                <input v-if="editing" v-model="user.nick" class="nickname-input" />
                <span v-else>{{ user.nick }}</span>
                <button class="change-btn" @click="toggleEdit">{{ editing ? "Guardar" : "Cambiar" }}</button>
            </div>
            <label for="born">Fecha de nacimiento</label>
            <span>{{ user.nacimiento }}</span>

            <label for="privacidad">Privacidad</label>
            <select v-model="privacidad" required>
                <option value="public">Público</option>
                <option value="private">Privado</option>
                <option value="protected">Protegido</option>
            </select>

            <button class="buttons save" @click="handleSave">GUARDAR CAMBIOS</button>
            <button class="buttons logout" @click="handleLogout">CERRAR SESIÓN</button>
            
        </div>
        <div v-if="showPopup" :class="popupType" class="popup">
            {{ popupMessage }}
        </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from "vue";
  import { useRouter } from "vue-router";
  
  const router = useRouter();
  const nombre = ref("");
  const privacidad = ref("public");
  const email = 'a@gmail.com'; // adaptar al email con la sesión iniciada
  
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
  
  const user = ref({
    nick: '',
    perfil: '',
    nacimiento: '',
    privacidad: false
});

const editing = ref(false);

const toggleEdit = () => {
  if (editing.value) {
    console.log("Nuevo nickname:", user.value.nick);
  }
  editing.value = !editing.value;
};

onMounted(async () => {
    try {
        const userResponse = await fetch(`http://48.209.24.188:3000/users/get-user?userEmail=${encodeURIComponent(email)}`);
        if (!userResponse.ok) throw new Error('Error al obtener los datos del usuario');

        const userData = await userResponse.json();

        // Extraer los datos de la respuesta
        const UserNick = userData.Nick;
        const UserNacimiento = userData.FechaNacimiento;
        const UserPerfil = userData.LinkFoto;
        const UserPrivacidad = userData.BooleanPrivacidad

        // Asignar los datos a las variables reactivas
        user.value = {
            nick: UserNick,
            nacimiento: UserNacimiento,
            perfil: UserPerfil,
            privacidad: UserPrivacidad
        };

        console.log('Datos de usuario:', user.value);
        } catch (error) {
        console.error('Error:', error);
        }
});


const handleSave = async () => {
  try {
    const nuevoNick = user.value.nick;
    const response = await fetch(`http://48.209.24.188:3000/users/change-nick?userEmail=${encodeURIComponent(email)}&Nick=${encodeURIComponent(nuevoNick)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Error al cambiar el nickname");
    }

    console.log("Nickname cambiado exitosamente:", data);
    showPopupMessage("Nickname actualizado con éxito", "popup-success");
    editing.value = false; // Desactivar modo edición después de guardar

} catch (error) {
    console.error("Error al actualizar nickname:", error);
    showPopupMessage("Error al actualizar el nickname", "popup-error");
}
};
</script>
  
<style scoped>
.user-container {
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
  
.user-box {
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

span {
    text-align: left;
    display: block;
    margin-top: 10px;
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

.nickname-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.nickname-input {
    flex: 1;
    padding: 5px;
    border: 1px solid #ffa500;
    border-radius: 4px;
    background-color: #2a2a2a;
    color: white;
}

.profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 20px;
}

.profile-container img {
    width: 120px; 
    height: 120px;
    border-radius: 50%; 
    object-fit: cover;
    border: 2px solid #ffa500; 
}

.profile-container a {
    margin-top: 10px;
    color: #ffa500; 
    font-weight: bold;
    cursor: pointer;
    text-decoration: none; 
}

.profile-container a:hover {
    text-decoration: underline; 
}


.change-btn {
    margin-left: 10px;
    background-color: #ff5722;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.buttons {
    width: 100%;
    padding: 12px;
    margin-top: 1rem;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    background-color: #ff5722;
}

.buttons.logout {
    background-color: #ff5722;
}

.buttons.save {
    background-color: #ffc107;
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