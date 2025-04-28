<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'
import { emitter } from '@/js/event-bus'

const socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] })
const player = ref(null)

// Estados reactivos
const connectionStatus = ref('Desconectado')
const isLoading = ref(false)

// Segundo al que saltar al iniciar (por defecto 0)
const startAt = ref(0)

// Bandera para controlar el primer autoplay
let isFirstLoad = true

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
    const blob = new Blob(fullAudioChunks, { type: 'audio/mpeg' })
    fullAudioChunks = []
    if (currentBlobURL) URL.revokeObjectURL(currentBlobURL)
    currentBlobURL = URL.createObjectURL(blob)

    if (player.value) {
      player.value.src = currentBlobURL

      // Cuando metadata y buffer estén listos:
      player.value.addEventListener('canplaythrough', () => {
        isLoading.value = false

        // Saltar al segundo deseado antes de reproducir
        player.value.currentTime = startAt.value

        if (!isFirstLoad) {
          player.value.play().catch(err => console.error('Reproducción fallida:', err))
        }
        isFirstLoad = false
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

/**
 * Inicia el stream de la canción.
 * @param {string} songId 
 * @param {string} songName 
 * @param {string} email 
 * @param {number} [sec=0] Segundo al que saltar tras carga.
 */
function startStreamSong(songId, songName, email, sec = 0) {
  if (isLoading.value) {
    console.log('Ya cargando, espera hasta completar el stream')
    return
  }
  // Guardamos el segundo de inicio
  startAt.value = sec

  stopCurrentStream()
  isLoading.value = true
  fullAudioChunks = []
  console.log(`Iniciando stream de '${songName}' y saltando a ${sec}s`)
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
