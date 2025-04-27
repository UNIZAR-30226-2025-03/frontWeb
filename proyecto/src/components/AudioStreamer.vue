<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { emitter } from '@/js/event-bus'

const socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] })
const player = ref(null)

// Estados reactivos
const connectionStatus = ref('Desconectado')
const isLoading = ref(false)

let fullAudioChunks = []
let currentBlobURL = null

onMounted(() => {
  player.value = document.querySelector('audio#app-player') || null

  socket.on('connect',    () => connectionStatus.value = 'Conectado')
  socket.on('disconnect', () => connectionStatus.value = 'Desconectado')
  socket.on('error',      console.error)

  socket.on('audioChunk', ({ data }) => {
    if (!isLoading.value) return
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    fullAudioChunks.push(bytes.buffer)
  })

  socket.on('streamComplete', () => {
    // Crear y asignar Blob
    const blob = new Blob(fullAudioChunks, { type: 'audio/mpeg' })
    fullAudioChunks = []
    if (currentBlobURL) URL.revokeObjectURL(currentBlobURL)
    currentBlobURL = URL.createObjectURL(blob)

    if (player.value) {
      player.value.src = currentBlobURL

      // Al poder reproducir, desactivamos carga y lanzamos play
      player.value.addEventListener('canplaythrough', () => {
        isLoading.value = false
        player.value.play().catch(err => console.error('Reproducción fallida:', err))
      }, { once: true })

      emitter.emit('audio-buffer-ready')
      socket.emit('audio-buffer-ready')
    }
  })
})

onBeforeUnmount(() => {
  socket.disconnect()
  stopCurrentStream()
})

function startStreamSong(songId, songName, email) {
  // Protección: si ya estamos cargando, ignoramos llamadas repetidas
  if (isLoading.value) {
    console.log('Ya cargando, espera hasta completar el stream')
    return
  }
  stopCurrentStream()
  isLoading.value = true
  fullAudioChunks = []
  console.log(`Iniciando stream de '${songName}'`)
  socket.emit('startStream', { songId, userId: email })
}

function stopCurrentStream() {
  isLoading.value = false
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

// Exponemos start/stop y el estado de carga
defineExpose({ startStreamSong, stopCurrentStream, socket, isLoading })
</script>
