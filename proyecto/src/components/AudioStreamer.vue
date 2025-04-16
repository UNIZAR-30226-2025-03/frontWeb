
<script setup>
// Importa las funciones reactivas y el hook onMounted de Vue
import { ref, onMounted } from 'vue'
// Importa la función io para la conexión de Socket.IO
import { io } from 'socket.io-client'
// Importa el emisor de eventos desde un módulo local
import { emitter } from '@/js/event-bus'

/**
 * Socket conectado al servidor especificado.
 * @constant {Socket} socket
 */
const socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] })

/**
 * Expone las funciones startStreamSong, stopCurrentStream y la variable socket al exterior.
 */
defineExpose({ startStreamSong, stopCurrentStream, socket })

/**
 * Estado reactivo que almacena el estado de la conexión.
 * @type {Ref<string>}
 */
const connectionStatus = ref('Desconectado')
/**
 * Mínimo de segundos requeridos en el buffer para iniciar la reproducción.
 * @constant {number}
 */
const MIN_BUFFERED_SECONDS = 3
/**
 * Objeto MediaSource utilizado para generar el flujo de datos de audio.
 * @type {MediaSource|null}
 */
let mediaSource = null
/**
 * URL asociada al objeto mediaSource.
 * @type {string|null}
 */
let mediaSourceURL = null
/**
 * Objeto SourceBuffer para administrar la adición de datos al MediaSource.
 * @type {SourceBuffer|null}
 */
let sourceBuffer = null
/**
 * Cola para almacenar los chunks de datos de audio que se deben agregar al buffer.
 * @type {Array<ArrayBuffer>}
 */
let queue = []
/**
 * Representa la canción actual en streaming.
 * @type {string|null}
 */
let currentSong = null
/**
 * Duración esperada de la canción actual.
 * @type {number}
 */
let expectedDuration = 0
/**
 * Indica si se ha iniciado la reproducción.
 * @type {boolean}
 */
let hasStartedPlaying = false
/**
 * Indica si el streaming está activo.
 * @type {boolean}
 */
let streamingActive = false
/**
 * Intervalo utilizado para verificar el buffer.
 * @type {number|null}
 */
let bufferCheckInterval = null
/**
 * Referencia al reproductor de audio.
 * @type {Ref<HTMLAudioElement|null>}
 */
const player = ref()

/**
 * Almacena los chunks completos del audio en orden.
 * @type {Array<ArrayBuffer>}
 */
let fullAudioChunks = [] // Guardará los chunks completos en orden

/**
 * Hook onMounted que busca el elemento de audio global para asignarlo a la variable player.
 */
onMounted(() => {
  const externalPlayer = document.querySelector('audio#app-player')
  if (externalPlayer) {
    player.value = externalPlayer
  } else {
    console.log('[error] No se encontró el reproductor global')
  }
})

/**
 * Evento Socket.IO que se activa cuando la conexión se establece exitosamente.
 */
socket.on('connect', () => {
  connectionStatus.value = 'Conectado'
  console.log('[success] Conectado al servidor: ' + socket.id)
})

/**
 * Evento Socket.IO que se activa cuando se pierde la conexión.
 */
socket.on('disconnect', () => {
  connectionStatus.value = 'Desconectado'
  console.log('[error] Desconectado del servidor')
})

/**
 * Evento Socket.IO para manejar errores de conexión.
 * @param {Error|string} error - Error recibido.
 */
socket.on('error', (error) => {
  console.log('[error] Error de Socket.IO: ' + error)
})

/**
 * Evento Socket.IO que muestra la lista de blobs disponibles en el servidor.
 * @param {Array<string>} blobs - Lista de blobs.
 */
socket.on('blobList', (blobs) => {
  console.log('[info] Blobs disponibles:')
  blobs.forEach(blob => console.log(`[info] - ${blob}`))
})

/**
 * Evento Socket.IO que recibe actualizaciones de progreso desde el cliente.
 * @param {Object} data - Datos de progreso.
 */
socket.on('progressUpdate', (data) => {
 console.log('📥 Recibido progressUpdate del cliente:', data);
})

/**
 * Evento Socket.IO que recibe un chunk de audio para procesarlo y agregarlo al buffer.
 * @param {Object} data - Objeto con la propiedad data codificada en base64.
 */
socket.on('audioChunk', (data) => {
  if (!streamingActive || player.value?.error) return

  const binary = atob(data.data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const chunkBuffer = bytes.buffer

  if (sourceBuffer && !sourceBuffer.updating) {
    try {
      sourceBuffer.appendBuffer(chunkBuffer)
      console.log('Chunk añadido al buffer')
    } catch (err) {
      console.log('[error] Error al añadir chunk, se agrega a la cola: ' + err)
      queue.push(chunkBuffer)
    }
  } else {
    queue.push(chunkBuffer)
    console.log('Chunk en cola para ser añadido')
  }
})

/**
 * Evento Socket.IO que se dispara cuando el streaming se completa.
 */
socket.on('streamComplete', () => {
  console.log('[success] Streaming completado desde el servidor')
  streamingActive = false
  if (bufferCheckInterval) clearInterval(bufferCheckInterval)

  const checkAndEnd = setInterval(() => {
    if (sourceBuffer && !sourceBuffer.updating) {
      try {
        mediaSource.endOfStream()
        console.log('[info] MediaSource marcado como ended')
        // ✅ Emitir evento para notificar que todo está cargado
        socket.emit('audio-buffer-ready')
        document.dispatchEvent(new CustomEvent('audio-buffer-ready'))
        console.log('✅ [evento] audio-buffer-ready emitido')
      } catch (err) {
        console.log('[error] Error al hacer endOfStream: ' + err)
      }
      clearInterval(checkAndEnd)
    }
  }, 100)
})

/**
 * Inicia el streaming de una canción, solicitando el inicio al servidor a través de Socket.IO.
 * @async
 * @function startStreamSong
 * @param {string} songId - ID de la canción a transmitir.
 * @param {string} songName - Nombre de la canción.
 * @param {string} email - Email del usuario que solicita el streaming.
 */
async function startStreamSong(songId, songName, email) {
  console.log("id:", songId);
  console.log("name:", songName);
  console.log("email:", email),
  stopCurrentStream()
  currentSong = songName
  streamingActive = true
  initMediaSource()
  console.log(`[info] Solicitando inicio de streaming para la canción '${songName}' (ID ${songId})...`)
  socket.emit('startStream', { songId: songId, userId: email })
}

/**
 * Detiene el streaming actual, aborta el SourceBuffer, finaliza el MediaSource y limpia recursos.
 * @function stopCurrentStream
 */
function stopCurrentStream() {
  if (streamingActive) console.log('[info] Deteniendo streaming anterior...')
  streamingActive = false
  if (bufferCheckInterval) {
    clearInterval(bufferCheckInterval)
    bufferCheckInterval = null
  }
  if (mediaSource?.readyState === 'open') {
    try {
      if (sourceBuffer && !sourceBuffer.updating) sourceBuffer.abort()
    } catch (err) {
      console.log('[error] Error al abortar SourceBuffer: ' + err)
    }
    try {
      mediaSource.endOfStream()
    } catch (err) {
      console.log('[error] Error al hacer endOfStream: ' + err)
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

/**
 * Inicializa el MediaSource, genera un objeto URL y lo asigna al reproductor.
 * @function initMediaSource
 */
function initMediaSource() {
  queue = []
  hasStartedPlaying = false
  mediaSource = new MediaSource()
  mediaSourceURL = URL.createObjectURL(mediaSource)
  if (player.value) player.value.src = mediaSourceURL
  mediaSource.addEventListener('sourceopen', onSourceOpen)
}

/**
 * Maneja el evento 'sourceopen' del MediaSource, creando un SourceBuffer y configurando sus eventos.
 * @function onSourceOpen
 */
function onSourceOpen() {
  console.log('[info] MediaSource abierto')
  try {
    sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg')
  } catch (err) {
    console.log('[error] Error al crear SourceBuffer: ' + err)
    return
  }
  sourceBuffer.addEventListener('updateend', () => {
    if (!hasStartedPlaying && player.value) {
      const buffered = player.value.buffered
      if (buffered.length > 0) {
        const bufferedSeconds = buffered.end(0) - buffered.start(0)
        if (bufferedSeconds >= MIN_BUFFERED_SECONDS) {
          hasStartedPlaying = true
          player.value.play().catch(err => console.log('[error] El navegador bloqueó la reproducción automática: ' + err))
          console.log(`[info] Reproducción iniciada con ${bufferedSeconds.toFixed(2)} segundos buffer`)

          if (bufferCheckInterval) clearInterval(bufferCheckInterval)
        } else {
          console.log(`[info] Esperando a acumular ${MIN_BUFFERED_SECONDS}s. Actualmente: ${bufferedSeconds.toFixed(2)}s`)
        }
      }
    }
    while (queue.length > 0 && !sourceBuffer.updating) {
      try {
        const nextChunk = queue.shift()
        sourceBuffer.appendBuffer(nextChunk)
      } catch (err) {
        console.log('[error] Error al reintentar appendBuffer: ' + err)
        queue.unshift(nextChunk)
        break
      }
    }
  })
  sourceBuffer.addEventListener('error', (e) => {
    console.log('[error] Error en el SourceBuffer: ' + e)
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
            player.value.play().catch(err => console.log('[error] El navegador bloqueó la reproducción automática: ' + err))
            console.log(`[info] Reproducción iniciada con ${bufferedSeconds.toFixed(2)} segundos buffer`)
            clearInterval(bufferCheckInterval)
            bufferCheckInterval = null
          }
        }
      }
    }, 250)
  }
}

</script>
