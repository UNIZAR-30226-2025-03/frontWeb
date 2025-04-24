<template>
  <div class="header">
    <h1>Panel de administración</h1>
    <button class="logout-btn" @click="logout">Cerrar sesión</button>
  </div>
  <div v-if="authorized" class="admin-container">
    <button class="logout-btn" @click="logout">Cerrar sesión</button>
    <div class="admin-inner">
      <div class="section chat-wrapper">
        <ChatBox />
      </div>
      <section class="section playlists-section">
        <div class="section-header">
          <h2>Listas Disponibles</h2>
          <button class="primary-btn" @click="crearLista"><span class="btn-icon">＋</span>Crear Lista</button>
        </div>
        <div class="playlist-search">
          <input v-model="playlistSearch" type="text" placeholder="Buscar lista..." />
        </div>
        <div class="playlists-container custom-scrollbar">
          <ul class="playlists-scroll">
            <li v-for="lista in filteredPlaylists" :key="lista.id" class="playlist-card" @click="irADetalleLista(lista.id)">
              <img :src="lista.coverImage" alt="Playlist Cover" class="playlist-cover" @error="onImageError" />
              <div class="playlist-text">
                <h3 class="playlist-title">{{ lista.name }}</h3>
                <div class="playlist-meta"><span>🎵 {{ lista.totalSongs }}</span><span>• {{ lista.genre }}</span></div>
              </div>
            </li>
            <li v-for="n in 5" :key="'placeholder-' + n" class="playlist-card placeholder"></li>
          </ul>
        </div>
      </section>
      <section class="section users-section">
        <div class="section-header"><h2>Eliminar Usuarios</h2></div>
        <div class="user-search"><input v-model="searchTerm" type="text" placeholder="Buscar usuario por email..." /></div>
        <div class="users-grid custom-scrollbar">
          <div v-for="user in filteredUsers" :key="user.id" class="user-card" @click="abrirModal(user)">
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Nombre:</strong> {{ user.name }}</p>
          </div>
        </div>
      </section>
      <div v-if="modalVisible" class="modal-overlay">
        <div class="modal">
          <h3>Confirmar eliminación</h3>
          <p>¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete.email }}</strong>? Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="confirm-btn" @click="confirmModal">Confirmar</button>
            <button class="cancel-btn" @click="cancelModal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading"><p>Cargando ...</p></div>
</template>

<script>
import { onMounted } from 'vue';
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
      playlistSearch: '',
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
      const term = this.searchTerm.toLowerCase();
      return term ? this.allUsers.filter(u => u.email.toLowerCase().includes(term)) : this.allUsers;
    },
    filteredPlaylists() {
      const term = this.playlistSearch.toLowerCase();
      return term ? this.adminListas.filter(p => p.name.toLowerCase().includes(term)) : this.adminListas;
    }
  },
  methods: {
    onImageError(e) {
      e.target.src = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=No+Image';
    },
    async verificarAcceso() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error();
        const res = await fetch('https://echobeatapi.duckdns.org/admin/playlists', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        this.adminListas = await res.json();
        await this.cargarUsuarios();
        this.authorized = true;
      } catch {
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
        if (!token) throw new Error();
        const res = await fetch('https://echobeatapi.duckdns.org/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        this.allUsers = await res.json();
      } catch {}
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
        if (!token) throw new Error();
        const res = await fetch(`https://echobeatapi.duckdns.org/admin/users/${this.userToDelete.email}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        await this.cargarUsuarios();
      } catch {}
      this.cancelModal();
    },
    logout() {
      localStorage.clear();
      sessionStorage.removeItem('home-song-loaded');
      window.location.href = '/';
    }
  }

  
};

  onMounted(() => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true';
  console.log("isAdmin: ", isAdmin.value);
  window.addEventListener('storage', syncAdmin);
});


<style scoped>
:deep(header, .main-navbar, .app-header) { display: none !important; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding:0 1rem; background:rgba(0,0,0,.3); border-radius:8px; }
.logout-btn { background:#d9534f; border:none; color:#fff; padding:.6rem 1.4rem; border-radius:6px; font-weight:700; cursor:pointer; transition:.2s; }
.logout-btn:hover { opacity:.9; transform:scale(.97); }
.admin-container { height:100vh; overflow:hidden; }
.admin-inner { display:flex; gap:1rem; height:100%; padding:1rem; overflow-x:auto; background:linear-gradient(to bottom,#111,#552300 40%,#b66520 80%); }
.section { background:rgba(0,0,0,.3); border-radius:10px; padding:1rem; min-width:600px; max-width:900px; height:100%; display:flex; flex-direction:column; flex:0 0 auto; }
.chat-wrapper { flex:1; overflow-y:auto; }
.section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
.primary-btn { display:flex; align-items:center; gap:.4rem; background:linear-gradient(90deg,#ffb347,#ff7747); border:none; color:#111; padding:.5rem 1.4rem; border-radius:9999px; font-weight:700; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.3); transition:.2s; }
.primary-btn:hover { transform:translateY(-2px); }
.btn-icon { font-size:1.2rem; }
.playlist-search input, .user-search input { width:100%; padding:.45rem .6rem; border:none; border-radius:4px; }
.playlists-container, .users-grid { flex:1; overflow-y:auto; }
.playlists-scroll { display:flex; flex-direction:column; gap:1rem; }
.playlist-card { display:flex; align-items:center; background:#2c2c2c; border-left:5px solid #ff8c42; border-radius:8px; overflow:hidden; cursor:pointer; transition:.2s; box-shadow:0 3px 6px rgba(0,0,0,.25); }
.playlist-card:hover { transform:scale(1.02); box-shadow:0 4px 10px rgba(0,0,0,.4); }
.playlist-cover { width:110px; height:110px; object-fit:cover; }
.playlist-text { padding:.8rem 1rem; }
.playlist-title { color:#fff; font-weight:700; font-size:1.1rem; margin-bottom:.3rem; }
.playlist-meta { color:#bbb; font-size:.9rem; display:flex; gap:.6rem; }
.placeholder { opacity:0; pointer-events:none; height:118px; border:none; box-shadow:none; }
.user-card { background:#222; color:#fff; padding:.7rem; border-radius:6px; transition:.2s; }
.user-card:hover { transform:translateY(-4px); background:#333; }
.custom-scrollbar { scrollbar-width:thin; scrollbar-color:#ff8c42 #2b2b2b; }
.custom-scrollbar::-webkit-scrollbar { width:6px; }
.custom-scrollbar::-webkit-scrollbar-track { background:#2b2b2b; border-radius:4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background:#ff8c42; border-radius:4px; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal { background:#1e1e1e; color:#fff; padding:2rem; border-radius:8px; max-width:400px; width:90%; text-align:center; animation:fadeInScale .3s ease; }
.confirm-btn, .cancel-btn { padding:.5rem 1.2rem; border-radius:4px; font-weight:700; border:none; cursor:pointer; margin:0 .5rem; }
.confirm-btn { background:#d9534f; color:#fff; }
.cancel-btn { background:#5bc0de; color:#fff; }
@keyframes fadeInScale { from { opacity:0; transform:scale(.8); } to { opacity:1; transform:scale(1); } }
.loading { height:100vh; display:flex; align-items:center; justify-content:center; background:#111; color:#fff; font-size:1.2rem; }
</style>
