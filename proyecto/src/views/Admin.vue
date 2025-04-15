<template>
  <div v-if="authorized" class="admin-container">
    <!-- Agregar el componente ChatBox en la parte superior -->
    <ChatBox />

    <h1>Panel de Administración</h1>

    <!-- Sección de Listas -->
    <section class="admin-section">
      <h2>Gestión de Listas Predefinidas</h2>
      <div class="admin-actions">
        <button @click="crearLista">Crear Lista</button>
      </div>
    </section>

    <!-- Sección de Listas Disponibles -->
    <section class="admin-section">
      <h2>Listas Disponibles</h2>
      <ul class="playlists-scroll">
        <li
          v-for="(lista, index) in adminListas"
          :key="lista.id"
          class="playlist-card"
          @click="irADetalleLista(lista.id)"
        >
          <img
            :src="lista.coverImage"
            alt="Playlist Cover"
            class="playlist-cover"
            @error="onImageError"
          />
          <h3 class="playlist-title">{{ lista.name }}</h3>
          <p class="playlist-info">Canciones: {{ lista.totalSongs }}</p>
          <p class="playlist-info">Género: {{ lista.genre }}</p>
        </li>
      </ul>
    </section>

    <!-- Sección para Eliminar Usuarios -->
    <section class="admin-section">
      <h2>Eliminar Usuarios</h2>
      <div class="user-search">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Buscar usuario por email..."
        />
      </div>
      <!-- Grid de usuarios -->
      <div class="users-grid">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
          @click="abrirModal(user)"
        >
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Nombre:</strong> {{ user.name }}</p>
        </div>
      </div>
    </section>

    <!-- Modal de confirmación -->
    <div v-if="modalVisible" class="modal-overlay">
      <div class="modal">
        <h3>Confirmar eliminación</h3>
        <p>
          ¿Estás seguro de que deseas eliminar al usuario
          <strong>{{ userToDelete.email }}</strong>? Esta acción no se puede deshacer.
        </p>
        <div class="modal-actions">
          <button class="confirm-btn" @click="confirmModal">Confirmar</button>
          <button class="cancel-btn" @click="cancelModal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <p>Cargando ...</p>
  </div>
</template>

<script>
import ChatBox from '@/components/ChatBox.vue';

export default {
  name: 'AdminView',
  components: { ChatBox },
  data() {
    return {
      email: null,
      adminListas: [],
      allUsers: [],
      searchTerm: '',
      modalVisible: false,
      userToDelete: {},
      authorized: false // Controla si se muestra la página
    };
  },
  created() {
    this.email = localStorage.getItem('email') || '';
    this.verificarAcceso();
  },
  computed: {
    filteredUsers() {
      if (!this.searchTerm) return this.allUsers;
      const term = this.searchTerm.toLowerCase();
      return this.allUsers.filter(user =>
        user.email.toLowerCase().includes(term)
      );
    }
  },
  methods: {
    onImageError(e) {
      e.target.src = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=No+Image';
    },
    async verificarAcceso() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación.');
        }
        const response = await fetch('https://echobeatapi.duckdns.org/admin/playlists', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          this.adminListas = await response.json();
          await this.cargarUsuarios();
          this.authorized = true;
        } else {
          throw new Error('Error al cargar las listas de administración');
        }
      } catch (error) {
        console.error('Error en la verificación de acceso:', error);
        this.$router.push('/');
      }
    },
    crearLista() {
      this.$router.push('/createList');
    },
    irADetalleLista(idLista) {
      this.$router.push({ path: '/playlist', query: { id: idLista } });
    },
    async cargarUsuarios() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación.');
        }
        const response = await fetch('https://echobeatapi.duckdns.org/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Error al cargar la lista de usuarios');
        }
        this.allUsers = await response.json();
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },
    abrirModal(user) {
      this.userToDelete = user;
      this.modalVisible = true;
    },
    cancelModal() {
      this.modalVisible = false;
      this.userToDelete = {};
    },
    async confirmModal() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación.');
        }
        const response = await fetch(`https://echobeatapi.duckdns.org/admin/users/${this.userToDelete.email}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Error al eliminar el usuario');
        }
        await this.cargarUsuarios();
        console.log(`Usuario ${this.userToDelete.email} eliminado correctamente`);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
      this.cancelModal();
    }
  }
};
</script>

<style scoped>
/* Actualización para habilitar scroll en la página de administración */
.admin-container {
  min-height: 100vh;
  overflow-y: scroll; /* en lugar de auto */
  -webkit-overflow-scrolling: touch;
}


/* Resto de estilos de AdminView */
.admin-section {
  margin-bottom: 1.5rem;
}
.admin-actions button {
  background-color: #ffa500;
  border: none;
  color: #000;
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.admin-actions button:hover {
  opacity: 0.8;
}
.playlists-scroll {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem 0;
  scrollbar-width: thin;
}
.playlist-card {
  min-width: 160px;
  background-color: #333;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
  text-align: center;
}
.playlist-card:hover {
  transform: scale(1.05);
  background-color: #444;
}
.playlist-cover {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}
.playlist-title {
  font-size: 1rem;
  color: #ffb347;
  margin-bottom: 0.3rem;
}
.playlist-info {
  font-size: 0.85rem;
  color: #ccc;
  margin: 0;
}
.user-search {
  margin: 0.5rem 0;
}
.user-search input {
  padding: 0.5rem;
  width: 100%;
  max-width: 300px;
}
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}
.user-card {
  background-color: #333;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
}
.user-card:hover {
  background-color: #444;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background-color: #fff;
  color: #000;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}
.modal h3 {
  margin-top: 0;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
}
.confirm-btn {
  background-color: #d9534f;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
.cancel-btn {
  background-color: #5bc0de;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}
.confirm-btn:hover,
.cancel-btn:hover {
  opacity: 0.9;
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
  background-color: #000;
}
</style>
