<template>
  <div v-if="authorized" class="admin-container">
    <div class="admin-inner">
      <h1 class="admin-title">Panel de Administración</h1>

      <!-- Fila 1: Chat + Usuarios -->
      <div class="admin-row">
        <!-- Chat -->
        <div class="chat-wrapper">
          <ChatBox />
        </div>

        <!-- Eliminar Usuarios -->
        <section class="admin-section users-section">
          <div class="section-header">
            <h2>Eliminar Usuarios</h2>
          </div>
          <div class="user-search">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar usuario por email..."
            />
          </div>
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
      </div>

      <!-- Fila 2: Listas -->
      <section class="admin-section playlists-section full-width" ref="listsSection">
        <div class="section-header">
          <h2>Listas Disponibles</h2>
          <button class="primary-btn" @click="crearLista">Crear Lista</button>
        </div>
        <div class="playlists-container">
          <ul class="playlists-scroll">
            <li
              v-for="lista in adminListas"
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
        </div>
      </section>
    </div>

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
      authorized: false
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
      return this.allUsers.filter(u => u.email.toLowerCase().includes(term));
    }
  },
  methods: {
    onImageError(e) {
      e.target.src =
        'https://via.placeholder.com/150/FF0000/FFFFFF?text=No+Image';
    },
    async verificarAcceso() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No se encontró el token.');

        const res = await fetch(
          'https://echobeatapi.duckdns.org/admin/playlists',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok)
          throw new Error('Error al cargar las listas de administración');

        this.adminListas = await res.json();
        await this.cargarUsuarios();
        this.authorized = true;
      } catch (err) {
        console.error(err);
        this.$router.push('/');
      }
    },
    crearLista() {
      this.$router.push('/createList');
    },
    irADetalleLista(id) {
      this.$router.push({ path: '/playlist', query: { id } });
    },
    async cargarUsuarios() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No se encontró el token.');

        const res = await fetch('https://echobeatapi.duckdns.org/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar la lista de usuarios');
        this.allUsers = await res.json();
      } catch (err) {
        console.error(err);
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
        if (!token) throw new Error('No se encontró el token.');

        const res = await fetch(
          `https://echobeatapi.duckdns.org/admin/users/${this.userToDelete.email}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error('Error al eliminar el usuario');
        await this.cargarUsuarios();
      } catch (err) {
        console.error(err);
      }
      this.cancelModal();
    }
  }
};
</script>

<style scoped>
:deep(header, .main-navbar, .app-header) {
  display: none !important;
}

/* 🔷 CONTENEDOR GENERAL */
.admin-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom, #111, #552300 40%, #b66520 80%);
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-inner {
  width: 100%;
  max-width: 1100px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.admin-title {
  font-size: 1.8rem;
  color: #fff;
  text-align: center;
  margin-bottom: 0.5rem;
}

/* 🔷 PRIMERA FILA: CHAT Y USUARIOS */
.admin-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  height: 400px;
}

.chat-wrapper,
.users-section {
  flex: 1;
  max-width: 48%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  overflow: hidden;
}

/* 🔷 USUARIOS */
.user-search {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.user-search input {
  width: 100%;
  max-width: 350px;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.users-grid {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.users-grid::-webkit-scrollbar {
  width: 6px;
}
.users-grid::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 6px;
}

.user-card {
  background: #222;
  color: #fff;
  padding: 0.7rem;
  border-radius: 6px;
  text-align: center;
  font-size: 0.85rem;
  transition: transform 0.2s;
}
.user-card:hover {
  transform: translateY(-4px);
  background: #333;
}

/* 🔷 PLAYLISTS */
.full-width {
  width: 100%;
  margin-top: 0.5rem;
}

.admin-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.primary-btn {
  background: #ffa500;
  border: none;
  color: #111;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
}
.primary-btn:hover {
  opacity: 0.9;
}

.playlists-container {
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.playlists-scroll {
  display: flex;
  gap: 1rem;
  justify-content: center;
  scrollbar-width: thin;
}

.playlist-card {
  background: #222;
  border-radius: 8px;
  overflow: hidden;
  min-width: 180px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.playlist-card:hover {
  transform: translateY(-6px) scale(1.03);
}

.playlist-cover {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.playlist-title {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: #ffb347;
  text-align: center;
}
.playlist-info {
  font-size: 0.85rem;
  color: #ddd;
  text-align: center;
  margin-bottom: 0.5rem;
}

/* 🔷 MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1e1e1e;
  color: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);
  animation: fadeInScale 0.3s ease;
}

.modal h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #ffa500;
}

.modal p {
  font-size: 1rem;
  line-height: 1.5;
  color: #ddd;
}
.modal strong {
  color: #ff5555;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.confirm-btn,
.cancel-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease-in-out;
}

.confirm-btn {
  background: #d9534f;
  color: #fff;
}
.confirm-btn:hover {
  background: #c9302c;
}

.cancel-btn {
  background: #5bc0de;
  color: #fff;
}
.cancel-btn:hover {
  background: #31b0d5;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 🔷 LOADING */
.loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
  color: #fff;
  font-size: 1.2rem;
}


</style>
