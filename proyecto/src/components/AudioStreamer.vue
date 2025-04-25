<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { emitter } from '@/js/event-bus'

// Conexión Socket.IO
const socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] })

// Exponer funciones al padre
defineExpose({ startStreamSong, stopCurrentStream, socket })

// Referencia al reproductor global
const player = ref(null)

// Estado de streaming y almacenamiento de datos completos
let fullAudioChunks = []
let streamingActive = false
let currentBlobURL = null

const connectionStatus = ref('Desconectado')

onMounted(() => {
  // Asignar player global
  const externalPlayer = document.querySelector('audio#app-player')
  if (externalPlayer) player.value = externalPlayer

  // Eventos de socket
  socket.on('connect', () => {
    connectionStatus.value = 'Conectado'
  })
  socket.on('disconnect', () => {
    connectionStatus.value = 'Desconectado'
  })
  socket.on('error', console.error)

  // Recibir chunks: almacenar pero no reproducir hasta completo
  socket.on('audioChunk', ({ data }) => {
    if (!streamingActive) return
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    fullAudioChunks.push(bytes.buffer)
  })

  // Al completarse el streaming, montar Blob y reproducir
  socket.on('streamComplete', () => {
    streamingActive = false
    // Combinar todos los ArrayBuffers en un Blob
    const blob = new Blob(fullAudioChunks, { type: 'audio/mpeg' })
    fullAudioChunks = []
    // Revocar anterior URL si existe
    if (currentBlobURL) URL.revokeObjectURL(currentBlobURL)
    currentBlobURL = URL.createObjectURL(blob)
    if (player.value) {
      player.value.src = currentBlobURL
      player.value.play().catch(err => console.error('Reproducción fallida:', err))
      // Notificar carga completa
      emitter.emit('audio-buffer-ready')
      socket.emit('audio-buffer-ready')
    }
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('audio-buffer-ready', () => {})
  // Desconectar socket y limpiar
  socket.disconnect()
  stopCurrentStream()
})

/**
 * Inicia la descarga completa de la canción antes de reproducir
 */
async function startStreamSong(songId, songName, email, options = {}) {
  stopCurrentStream()
  streamingActive = true
  fullAudioChunks = []

  console.log(`Iniciando stream completo de '${songName}' (ID ${songId})`)
  socket.emit('startStream', { songId, userId: email })
}

/**
 * Detiene cualquier descarga o reproducción en curso
 */
function stopCurrentStream() {
  streamingActive = false
  fullAudioChunks = []
  if (player.value) {
    player.value.pause()
    player.value.removeAttribute('src')
    player.value.load()
  }
  if (currentBlobURL) {
    URL.revokeObjectURL(currentBlobURL)
    currentBlobURL = null
  }
}
</script>
