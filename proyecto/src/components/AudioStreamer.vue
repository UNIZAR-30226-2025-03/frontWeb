<template>
   <div>
     <audio ref="player" controls></audio> <!-- El reproductor de audio -->
     <div v-for="(message, index) in logMessages" :key="index" :class="message.type">
       {{ message.text }}
     </div>
   </div>
 </template>
 
 <script>
 import { defineComponent, ref, onMounted, onUnmounted, defineExpose } from 'vue';
 import { io } from 'socket.io-client';
 
 export default defineComponent({
   name: 'AudioStreamer',
   setup() {
     const status = ref('Desconectado');
     const logMessages = ref([]);
     const player = ref(null);
     let mediaSource = null;
     let sourceBuffer = null;
     let queue = [];
     let streamingActive = false;
     let socket = null;
 
     const log = (message, type = 'normal') => {
       logMessages.value.push({ text: `[${new Date().toISOString().slice(11, 19)}] ${message}`, type });
     };
 
     const initSocket = () => {
       socket = io('https://echobeatapi.duckdns.org', { transports: ['websocket'] });
 
       socket.on('connect', () => {
         status.value = 'Conectado';
         console.log('Conectado al servidor', 'success');
       });
 
       socket.on('disconnect', () => {
         status.value = 'Desconectado';
         console.log('Desconectado del servidor', 'error');
       });
 
       // Escuchar el evento de los chunks de audio
       socket.on('audioChunk', (data) => {
         console.log('¡Evento audioChunk recibido!', data);
         handleAudioChunk(data);  // Llamar al handler de los chunks
      });

 
       socket.on('streamComplete', handleStreamComplete);
     };
 
     const handleAudioChunk = (data) => {
      if (!streamingActive) return;
      try {
         const chunkBuffer = new Uint8Array(data.data).buffer;
         console.log('Chunk recibido:', chunkBuffer);

         // Si el sourceBuffer está listo para recibir más datos
         if (sourceBuffer && !sourceBuffer.updating) {
            sourceBuffer.appendBuffer(chunkBuffer);
            log('Chunk añadido al buffer');
            
            // Intentar reproducir solo cuando el buffer esté listo
            if (player.value && !player.value.paused) {
            player.value.play();  // Intentar reproducir el audio.
            log('Reproduciendo audio');
            }
         } else {
            queue.push(chunkBuffer);
            log('Chunk en cola');
         }
      } catch (err) {
         log(`Error: ${err}`, 'error');
      }
      };
 
     const handleStreamComplete = () => {
       console.log('Streaming completado', 'success');
       streamingActive = false;
       if (mediaSource && mediaSource.readyState === 'open') {
         try {
            sourceBuffer.abort(); // Aborta cualquier operación pendiente en el buffer
            mediaSource.endOfStream(); // Cierra el stream correctamente
         } catch (err) {
            log(`Error al finalizar el stream: ${err}`, 'error');
         }

       }
     };
 
     const startStreamSong = (songId, songName) => {
       stopCurrentStream();
       streamingActive = true;
       initMediaSource();
       console.log(`Solicitando streaming de '${songName}'`);
       console.log('Tipo de dato de songId:', typeof songId);
       console.log("Id canción: ", songId);
       socket.emit('startStream', { songId });
     };
 
     const stopCurrentStream = () => {
       streamingActive = false;
       if (mediaSource && mediaSource.readyState === 'open') {
         try {
           sourceBuffer.abort();
           mediaSource.endOfStream();
         } catch (err) {
           console.log(`Error al detener: ${err}`, 'error');
         }
       }
       if (player.value) {
         player.value.pause();
         player.value.removeAttribute('src');
         player.value.load();
       }
       queue = [];
       mediaSource = null;
     };
 
     const initMediaSource = () => {
       queue = [];
       mediaSource = new MediaSource();
       if (player.value) {
         player.value.src = URL.createObjectURL(mediaSource);
         mediaSource.addEventListener('sourceopen', () => {
           try {
            console.log('MediaSource abierto');
             sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg'); // O el tipo MIME adecuado
             sourceBuffer.addEventListener('updateend', processQueue);
           } catch (err) {
             console.log(`Error en MediaSource: ${err}`, 'error');
           }
         });
       }
     };
 
     const processQueue = () => {
      while (queue.length > 0 && sourceBuffer && !sourceBuffer.updating) {
         const nextChunk = queue.shift();
         try {
            console.log('Procesando siguiente chunk de la cola');
            sourceBuffer.appendBuffer(nextChunk);
         } catch (err) {
            log(`Error al procesar la cola: ${err}`, 'error');
         }
      }
   };
 
     onMounted(() => {
       initSocket();
     });
 
     onUnmounted(() => {
       if (socket) socket.disconnect();
     });
 
     // Exponer funciones para ser accesibles desde App.vue
     defineExpose({ startStreamSong, stopCurrentStream });
 
     return {
       status,
       logMessages,
       player,
       startStreamSong,
       stopCurrentStream
     };
   }
 });
 </script>
 
 <style scoped>
 /* Estilos aquí */
 </style>
 