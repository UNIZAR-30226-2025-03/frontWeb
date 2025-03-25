  <script setup>
  import { ref, onMounted } from 'vue'
  import { io } from 'socket.io-client'

  const socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] })

  defineExpose({ startStreamSong, stopCurrentStream,resumeCurrentStream,socket })

  const connectionStatus = ref('Desconectado')
  const MIN_BUFFERED_SECONDS = 3
  let mediaSource = null
  let mediaSourceURL = null
  let sourceBuffer = null
  let queue = []
  let currentSong = null
  let expectedDuration = 0
  let hasStartedPlaying = false
  let streamingActive = false
  let bufferCheckInterval = null
  const player = ref()

  let fullAudioChunks = [] // Guardará los chunks completos en orden


  onMounted(() => {
    const externalPlayer = document.querySelector('audio#app-player')
    if (externalPlayer) {
      player.value = externalPlayer
    } else {
      console.log('[error] No se encontró el reproductor global')
    }
  })

  socket.on('connect', () => {
    connectionStatus.value = 'Conectado'
    console.log('[success] Conectado al servidor: ' + socket.id)
  })

  socket.on('disconnect', () => {
    connectionStatus.value = 'Desconectado'
    console.log('[error] Desconectado del servidor')
  })

  socket.on('error', (error) => {
    console.log('[error] Error de Socket.IO: ' + error)
  })

  socket.on('blobList', (blobs) => {
    console.log('[info] Blobs disponibles:')
    blobs.forEach(blob => console.log(`[info] - ${blob}`))
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

  socket.on('streamComplete', () => {
    console.log('[success] Streaming completado desde el servidor')
    streamingActive = false
    if (bufferCheckInterval) clearInterval(bufferCheckInterval)

    const checkAndEnd = setInterval(() => {
      if (sourceBuffer && !sourceBuffer.updating) {
        try {
          mediaSource.endOfStream()
          console.log('[info] MediaSource marcado como ended')
        } catch (err) {
          console.log('[error] Error al hacer endOfStream: ' + err)
        }
        clearInterval(checkAndEnd)
      }
    }, 100)
  })

  async function startStreamSong(songId, songName, email) {
    console.log("id:",songId);
    console.log("name:",songName);
    console.log("email:",email),
    stopCurrentStream()
    currentSong = songName
    streamingActive = true
    initMediaSource()
    console.log(`[info] Solicitando inicio de streaming para la canción '${songName}' (ID ${songId})...`)
    socket.emit('startStream', { songId:songId, userId: email })
  }

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


  function resumeCurrentStream(songId, songName,email, startSeconds) {
    currentSong = songName
    streamingActive = true
    initMediaSource()
    console.log(`[info] Reanudando streaming para '${songName}' desde ${startSeconds}s (ID ${songId})...`)

    socket.emit('startStream', {
      songId: songId,
      userId: email,
      startSeconds
    })
  }

  function initMediaSource() {
    queue = []
    hasStartedPlaying = false
    mediaSource = new MediaSource()
    mediaSourceURL = URL.createObjectURL(mediaSource)
    if (player.value) player.value.src = mediaSourceURL
    mediaSource.addEventListener('sourceopen', onSourceOpen)
  }

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

  async function fetchSongDuration(songId) {
    const url = `https://echobeatapi.duckdns.org/api/getSongLength?songId=${songId}`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('No se pudo obtener la duración de la canción')
      const data = await res.json()
      return data.duration
    } catch (error) {
      console.log('[error] Error al obtener la duración de la canción: ' + error)
      return 0
    }
  } 
  </script>