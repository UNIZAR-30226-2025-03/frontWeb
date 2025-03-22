<template>
  <div>
    <h1>Test de Streaming de Audio - Canción Específica</h1>
    <div style="align-items: center;">
      <input class="search-bar" type="text" placeholder="¿Qué quieres reproducir?" v-model="currentSearch" @input="fetchResults"/>
      <div class="search-results" v-if="currentSearch && !isLoading">
            <div v-if="results?.canciones.length">
                <div v-for="cancion in results.canciones" :key="cancion.Nombre" class="result-item">
                  <img :src="cancion.Portada || 'ruta/a/imagen/default.jpg'" alt="Canción" />
                  <div class="song-quest-info">
                      <span>{{ cancion.Nombre }} ({{ formatTime(cancion.Duracion) }})</span>
                      <!-- Botón para agregar la canción seleccionada -->
                      <button @click="startStreamSong(cancion.Id,cancion.Nombre)">play</button>
                  </div>
                </div>
            </div>

            <div v-else class="no-results">
                ❌ Sin resultados
            </div>
        </div>
    </div>
    <button @click="stopCurrentStream">PARAR</button>
    <div>Estado: {{ connectionStatus }}</div>
    <audio ref="player" controls @error="onPlayerError"></audio>
    <div id="log">
      <div v-for="(entry, index) in logs" :key="index" :class="entry.type">
        [{{ entry.time }}] {{ entry.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { io } from 'socket.io-client'
defineExpose({ startStreamSong, stopCurrentStream });

const connectionStatus = ref('Desconectado')
const logs = ref([])
const player = ref(null)

const isLoading = ref(false);
const currentSearch = ref('');

const results = ref({
  artistas: [], 
  canciones: [],
  albums: [],
  listas: []
});

let mediaSource = null
let mediaSourceURL = null
let sourceBuffer = null
let queue = []
let currentSong = null
let expectedDuration = 0
let hasStartedPlaying = false
let streamingActive = false
const MIN_BUFFERED_SECONDS = 3
let bufferCheckInterval = null


function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

const fetchResults = async () => {
   
   if (!currentSearch.value.trim()) {
      results.value.canciones = [];
      return;
   }

   isLoading.value = true;
   console.log("Texto de búsqueda:", currentSearch.value);

   try { 
      const response = await fetch(`https://echobeatapi.duckdns.org/search/?q=${encodeURIComponent(currentSearch.value)}&tipo=canciones`);
      if (!response.ok) throw new Error('Error al obtener los datos de búsqueda');

      results.value = await response.json();
      console.log("Respuesta de la API:", results.value);

   } catch (error) {
      console.error('Error:', error);

   } finally {
      isLoading.value = false; 
   }
};



const socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] })

function log(message, type = 'normal') {
  logs.value.push({
    time: new Date().toISOString().slice(11, 19),
    message,
    type
  })
  nextTick(() => {
    const el = document.getElementById('log')
    if (el) el.scrollTop = el.scrollHeight
  })
}

function onPlayerError() {
  if (player.value?.error) {
    log(`Media Error: code=${player.value.error.code} - ${player.value.error.message}`, 'error')
    setTimeout(() => {
      log('Reiniciando stream automáticamente...', 'info')
      startStreamSong(currentSong === 'New_Bitch' ? 30 : 30, 'New_Bitch')
    }, 2000)
  }
}

socket.on('connect', () => {
  connectionStatus.value = 'Conectado'
  log('Conectado al servidor: ' + socket.id, 'success')
})

socket.on('disconnect', () => {
  connectionStatus.value = 'Desconectado'
  log('Desconectado del servidor', 'error')
})

socket.on('error', (error) => {
  log('Error de Socket.IO: ' + error, 'error')
})

socket.on('audioChunk', (data) => {
  if (!streamingActive || player.value?.error) return

  const binary = atob(data.data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const chunkBuffer = bytes.buffer

  if (sourceBuffer && !sourceBuffer.updating) {
    try {
      sourceBuffer.appendBuffer(chunkBuffer)
      log('Chunk añadido al buffer')
    } catch (err) {
      log('Error al añadir chunk, se agrega a la cola: ' + err, 'error')
      queue.push(chunkBuffer)
    }
  } else {
    queue.push(chunkBuffer)
    log('Chunk en cola para ser añadido')
  }
})

socket.on('streamComplete', () => {
  log('Streaming completado desde el servidor', 'success')
  streamingActive = false
  if (bufferCheckInterval) clearInterval(bufferCheckInterval)

  const checkAndEnd = setInterval(() => {
    if (sourceBuffer && !sourceBuffer.updating) {
      try {
        mediaSource.endOfStream()
        log('MediaSource marcado como ended', 'info')
      } catch (err) {
        log('Error al hacer endOfStream: ' + err, 'error')
      }
      clearInterval(checkAndEnd)
    }
  }, 100)
})

function listBlobs() {
  log('Solicitando lista de blobs...')
  socket.emit('listBlobs')
}

socket.on('blobList', (blobs) => {
  log('Blobs disponibles:', 'info')
  blobs.forEach(blob => log(`- ${blob}`, 'info'))
})

function initMediaSource() {
  queue = []
  hasStartedPlaying = false
  mediaSource = new MediaSource()
  mediaSourceURL = URL.createObjectURL(mediaSource)
  if (player.value) player.value.src = mediaSourceURL
  mediaSource.addEventListener('sourceopen', onSourceOpen)
}

function onSourceOpen() {
  log('MediaSource abierto', 'info')
  try {
    sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')
  } catch (err) {
    log('Error al crear SourceBuffer: ' + err, 'error')
    return
  }
  sourceBuffer.addEventListener('updateend', () => {
    if (!hasStartedPlaying && player.value) {
      const buffered = player.value.buffered
      if (buffered.length > 0) {
        const bufferedSeconds = buffered.end(0) - buffered.start(0)
        if (bufferedSeconds >= MIN_BUFFERED_SECONDS) {
          hasStartedPlaying = true
          player.value.play().catch(err => log('El navegador bloqueó la reproducción automática: ' + err, 'error'))
          log('Reproducción iniciada con ' + bufferedSeconds.toFixed(2) + ' segundos buffer', 'info')
          if (bufferCheckInterval) clearInterval(bufferCheckInterval)
        } else {
          log('Esperando a acumular ' + MIN_BUFFERED_SECONDS + 's. Actualmente: ' + bufferedSeconds.toFixed(2) + 's', 'info')
        }
      }
    }
    while (queue.length > 0 && !sourceBuffer.updating) {
      try {
        const nextChunk = queue.shift()
        sourceBuffer.appendBuffer(nextChunk)
      } catch (err) {
        log('Error al reintentar appendBuffer: ' + err, 'error')
        queue.unshift(nextChunk)
        break
      }
    }
  })
  sourceBuffer.addEventListener('error', (e) => {
    log('Error en el SourceBuffer: ' + e, 'error')
    stopCurrentStream()
  })

  if (!bufferCheckInterval) {
    bufferCheckInterval = setInterval(() => {
      if (!hasStartedPlaying && player.value) {
        const buffered = player.value.buffered
        if (buffered.length > 0) {
          const bufferedSeconds = buffered.end(0) - buffered.start(0)
          if (bufferedSeconds >= MIN_BUFFERED_SECONDS) {
            hasStartedPlaying = true
            player.value.play().catch(err => log('El navegador bloqueó la reproducción automática: ' + err, 'error'))
            log('Reproducción iniciada con ' + bufferedSeconds.toFixed(2) + ' segundos buffer', 'info')
            clearInterval(bufferCheckInterval)
            bufferCheckInterval = null
          }
        }
      }
    }, 250)
  }
}

async function fetchSongDuration(songId) {
  const url = `https://echobeatapi.duckdns.org/api/getSongLength?songId=${songId}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('No se pudo obtener la duración de la canción')
    const data = await res.json()
    return data.duration
  } catch (error) {
    log('Error al obtener la duración de la canción: ' + error, 'error')
    return 0
  }
}

function stopCurrentStream() {
  if (streamingActive) log('Deteniendo streaming anterior...', 'info')
  streamingActive = false
  if (bufferCheckInterval) {
    clearInterval(bufferCheckInterval)
    bufferCheckInterval = null
  }
  if (mediaSource?.readyState === 'open') {
    try {
      if (sourceBuffer && !sourceBuffer.updating) sourceBuffer.abort()
    } catch (err) {
      log('Error al abortar SourceBuffer: ' + err, 'error')
    }
    try {
      mediaSource.endOfStream()
    } catch (err) {
      log('Error al hacer endOfStream: ' + err, 'error')
    }
  }
  if (player.value?.src) {
    URL.revokeObjectURL(player.value.src)
  }
  if (player.value) {
    player.value.pause()
    player.value.removeAttribute('src')
    player.value.load()
  }
  mediaSource = null
  mediaSourceURL = null
  sourceBuffer = null
  queue = []
  hasStartedPlaying = false
}

async function startStreamSong(songId, songName) {
  stopCurrentStream()
  currentSong = songName
  streamingActive = true
  expectedDuration = await fetchSongDuration(songId)
  initMediaSource()
  log(`Solicitando inicio de streaming para la canción '${songName}' (ID ${songId})...`)
  socket.emit('startStream', { songId })
}
</script>

<style scoped>
#error {
  color: red;
}
.success {
  color: green;
}
.info {
  color: blue;
}
#log {
  height: 300px;
  width: 100%;
  border: 1px solid #ccc;
  overflow-y: scroll;
  padding: 10px;
  font-family: monospace;
  margin-top: 10px;
}


.search-results {
  width: 430px;
  background-color: #333;
  color: white;
  border-radius: 8px;
  border-width: 10px;
  border-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  margin-top: 5px;
  margin-left: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  scrollbar-width: none;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  position: relative;
}

.result-item img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.result-item:hover {
  background-color: #555;
}

.result-item button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}

.result-item button img {
  width: 25px;
  height: 25px;
  filter: brightness(0) invert(1);
  transition: transform 0.2s ease-in-out;
}

.result-item button:hover img {
  transform: scale(1.2);
}

.song-quest-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1; 
}

.no-results {
  padding: 15px;
  text-align: center;
  color: #bbb;
  font-size: 16px;
}
</style>
