<template>
  <div class="admin-page">
    <header class="header">
      <h1>Panel de administración</h1>
      <div class="header-actions">
        <button class="primary-btn" @click="openAddSongModal">
          Añadir Canción
        </button>
        <button class="primary-btn" @click="openAddArtistModal">
          Crear Artista
        </button>
        <button class="logout-btn" @click="logout">
          Cerrar sesión
        </button>
      </div>
    </header>

    <div v-if="authorized" class="admin-container">
      <div class="admin-inner">
        <!-- Chat Section -->
        <section class="section chat-wrapper">
          <ChatBox />
        </section>

        <!-- Playlists Section -->
        <section class="section playlists-section">
          <div class="section-header">
            <h2>Listas Disponibles</h2>
            <button class="primary-btn" @click="crearLista">
              <span class="btn-icon">＋</span>
              Crear Lista
            </button>
          </div>
          <div class="playlist-search">
            <input
              v-model="playlistSearch"
              type="text"
              placeholder="Buscar lista..."
            />
          </div>
          <div class="playlists-container custom-scrollbar">
            <ul class="playlists-scroll">
              <li
                v-for="lista in filteredPlaylists"
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
                <div class="playlist-text">
                  <h3 class="playlist-title">{{ lista.name }}</h3>
                  <div class="playlist-meta">
                    <span>🎵 {{ lista.totalSongs }}</span>
                    <span>• {{ lista.genre }}</span>
                  </div>
                </div>
              </li>
              <li
                v-for="n in 5"
                :key="`placeholder-${n}`"
                class="playlist-card placeholder"
              ></li>
            </ul>
          </div>
        </section>

        <!-- Users Section -->
        <section class="section users-section">
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
          <div class="users-grid custom-scrollbar">
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

      <!-- Delete User Modal -->
      <div v-if="modalVisible" class="modal-overlay">
        <div class="modal">
          <h3>Confirmar eliminación</h3>
          <p>
            ¿Estás seguro de que deseas eliminar al usuario
            <strong>{{ userToDelete.email }}</strong>? Esta acción no se puede deshacer.
          </p>
          <div class="modal-actions">
            <button class="confirm-btn" @click="confirmModal">
              Confirmar
            </button>
            <button class="cancel-btn" @click="cancelModal">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Add Song Modal -->
      <div v-if="addSongModal" class="modal-overlay">
        <div class="modal">
          <h3>Añadir Nueva Canción</h3>
          <form @submit.prevent="submitNewSong" class="add-song-form">
            <div class="form-group">
              <label for="artist">Artista</label>
              <input id="artist" v-model="newSong.artist" type="text" required />
            </div>
            <div class="form-group">
              <label for="title">Nombre de la Canción</label>
              <input id="title" v-model="newSong.title" type="text" required />
            </div>
            <div class="form-group">
              <label for="genre">Género</label>
              <select id="genre" v-model="newSong.genre" required>
                <option
                  v-for="g in genres"
                  :key="g.NombreGenero"
                  :value="g.NombreGenero"
                >
                  {{ g.NombreGenero }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="mp3">Archivo MP3</label>
              <input
                id="mp3"
                type="file"
                accept="audio/mp3"
                @change="onFileChange($event, 'file')"
                required
              />
            </div>
            <div class="form-group">
              <label for="cover">Portada (JPG)</label>
              <input
                id="cover"
                type="file"
                accept="image/jpeg"
                @change="onFileChange($event, 'coverFile')"
                required
              />
            </div>
            <div class="modal-actions">
              <button class="confirm-btn" type="submit">Guardar</button>
              <button class="cancel-btn" type="button" @click="closeAddSongModal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Artist Modal -->
      <div v-if="addArtistModal" class="modal-overlay">
        <div class="modal">
          <h3>Crear Nuevo Artista</h3>
          <form @submit.prevent="submitNewArtist" class="add-artist-form">
            <div class="form-group">
              <label for="artist-name">Nombre</label>
              <input
                id="artist-name"
                v-model="newArtist.nombre"
                type="text"
                required
              />
            </div>
            <div class="form-group">
              <label for="artist-bio">Biografía</label>
              <textarea
                id="artist-bio"
                v-model="newArtist.biografia"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="artist-photo">Foto de Perfil</label>
              <input
                id="artist-photo"
                type="file"
                accept="image/*"
                @change="onFileChangeArtist"
                required
              />
            </div>
            <div class="modal-actions">
              <button class="confirm-btn" type="submit">Guardar</button>
              <button class="cancel-btn" type="button" @click="closeAddArtistModal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <p>Cargando ...</p>
    </div>
  </div>
</template>

<script>
import ChatBox from '@/components/ChatBox.vue'

export default {
  name: 'AdminView',
  components: { ChatBox },
  data() {
    return {
      email: '',
      adminListas: [],
      allUsers: [],
      searchTerm: '',
      playlistSearch: '',
      modalVisible: false,
      userToDelete: {},
      authorized: false,
      genres: [],
      addSongModal: false,
      addArtistModal: false,
      newSong: {
        artist: '',
        title: '',
        genre: '',
        file: null,
        coverFile: null,
      },
      newArtist: {
        nombre: '',
        biografia: '',
        foto: null,
      },
    }
  },
  computed: {
    filteredUsers() {
      const term = this.searchTerm.toLowerCase()
      return term
        ? this.allUsers.filter(u => u.email.toLowerCase().includes(term))
        : this.allUsers
    },
    filteredPlaylists() {
      const term = this.playlistSearch.toLowerCase()
      return term
        ? this.adminListas.filter(p => p.name.toLowerCase().includes(term))
        : this.adminListas
    },
  },
  methods: {
    onImageError(e) {
      e.target.src = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=No+Image'
    },
    onFileChange(event, field) {
      this.newSong[field] = event.target.files[0]
    },
    onFileChangeArtist(event) {
      this.newArtist.foto = event.target.files[0]
    },

    async submitNewSong() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token en localStorage')

        const form = new FormData()
        form.append('artist', this.newSong.artist)
        form.append('title', this.newSong.title)
        form.append('genre', this.newSong.genre)
        form.append('file', this.newSong.file)
        form.append('cover', this.newSong.coverFile)

        const res = await fetch(
          'https://echobeatapi.duckdns.org/admin/canciones',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
          }
        )
        if (!res.ok) throw new Error('Error añadiendo canción')
        this.closeAddSongModal()
      } catch (err) {
        console.error('Error en submitNewSong:', err)
      }
    },

    async submitNewArtist() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token en localStorage')

        const form = new FormData()
        form.append('nombre', this.newArtist.nombre)
        form.append('biografia', this.newArtist.biografia)
        form.append('foto', this.newArtist.foto)

        const res = await fetch(
          'https://echobeatapi.duckdns.org/admin/artistas',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
          }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error creando artista')
        this.closeAddArtistModal()
      } catch (err) {
        console.error('Error en submitNewArtist:', err)
      }
    },

    openAddSongModal() {
      this.addSongModal = true
    },
    closeAddSongModal() {
      this.addSongModal = false
      this.newSong = { artist: '', title: '', genre: '', file: null, coverFile: null }
    },
    openAddArtistModal() {
      this.addArtistModal = true
    },
    closeAddArtistModal() {
      this.addArtistModal = false
      this.newArtist = { nombre: '', biografia: '', foto: null }
    },

    async verificarAcceso() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token en localStorage')

        const res = await fetch('https://echobeatapi.duckdns.org/admin/playlists', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('No autorizado')

        this.adminListas = await res.json()
        await this.cargarUsuarios()
        await this.fetchGenres()
        this.authorized = true
      } catch {
        this.$router.push('/')
      }
    },

    async fetchGenres() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token en localStorage')

        const res = await fetch(
          'https://echobeatapi.duckdns.org/genero?userEmail=admin',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!res.ok) throw new Error('Error cargando géneros')
        this.genres = await res.json()
      } catch (err) {
        console.error('Error cargando géneros:', err)
      }
    },

    crearLista() {
      this.$router.push('/createList')
    },
    irADetalleLista(id) {
      this.$router.push({ path: '/playlist', query: { id } })
    },

    async cargarUsuarios() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token en localStorage')

        const res = await fetch('https://echobeatapi.duckdns.org/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Error cargando usuarios')
        this.allUsers = await res.json()
      } catch (err) {
        console.error('Error cargando usuarios:', err)
      }
    },

    abrirModal(user) {
      this.userToDelete = user
      this.modalVisible = true
    },
    cancelModal() {
      this.modalVisible = false
      this.userToDelete = {}
    },

    async confirmModal() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token en localStorage')

        const res = await fetch(
          `https://echobeatapi.duckdns.org/admin/users/${this.userToDelete.email}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (!res.ok) throw new Error('Error eliminando usuario')
        await this.cargarUsuarios()
      } catch (err) {
        console.error('Error eliminando usuario:', err)
      } finally {
        this.cancelModal()
      }
    },

    logout() {
      localStorage.clear()
      sessionStorage.removeItem('home-song-loaded')
      window.location.href = '/'
    },
  },
  created() {
    this.verificarAcceso()
  },
}
</script>


<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 19vh);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0,0,0,0.3);
}

.header-actions button {
  margin-left: 0.5rem;
}

.primary-btn {
  background: linear-gradient(90deg,#ffb347,#ff7747);
  border: none;
  color: #111;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 700;
  cursor: pointer;
}

.logout-btn {
  background: #d9534f;
  border: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn:hover,
.logout-btn:hover {
  opacity: 0.8;
}

.admin-container {
  flex: 1;
  overflow: hidden;
}

.admin-inner {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  height: calc(100vh - 19vh);
  padding: 1rem;
  background: linear-gradient(to bottom,#111,#552300 40%,#b66520 80%);
}

.section {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 1rem;
  flex: 0 0 auto;
  min-width: 600px;
  height: calc(100vh - 42vh);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.playlist-search input,
.user-search input {
  width: 95%;
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
}

.playlists-container,
.users-grid {
  flex: 1;
  overflow-y: auto;
  cursor: pointer;
}

.playlists-scroll {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playlist-card {
  display: flex;
  align-items: center;
  background: #2c2c2c;
  border-left: 5px solid #ff8c42;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  padding: 0.5rem;
}

.playlist-card:hover {
  background: #3a3a3a;
}

.playlist-cover {
  width: 110px;
  height: 110px;
  object-fit: cover;
}

/* Separadores entre tarjetas de usuario */
.user-card {
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  background: rgba(0,0,0,0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #1e1e1e;
  color: #fff;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.confirm-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  background: #28a745; /* verde */
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  background: #d9534f; /* rojo */
}

.confirm-btn:hover,
.cancel-btn:hover {
  opacity: 0.8;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #111;
  color: #fff;
}
</style>
