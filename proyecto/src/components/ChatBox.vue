<template>
  <div class="chat-box">
    <div class="chat-header">
      <h2>Chat del Administrador</h2>
    </div>
    <div class="chat-body">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['chat-message', msg.sender]"
      >
        <div class="chat-bubble">
          <!-- Para los mensajes del usuario se muestra el texto tal cual -->
          <p v-if="msg.sender === 'user'">{{ msg.text }}</p>
          <!-- Para los mensajes del bot se formatea el contenido con Markdown -->
          <p v-else v-html="formatMarkdown(msg.text)"></p>
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <textarea
        v-model="chatInput"
        placeholder="Escribe tu mensaje..."
        :disabled="isLoading"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !chatInput.trim()">
        {{ isLoading ? 'Enviando...' : 'Enviar' }}
      </button>
    </div>
  </div>
</template>

<script>
import { marked } from "marked";

export default {
  name: "ChatBox",
  data() {
    return {
      chatInput: "",
      isLoading: false,
      // Inicializa el historial del chat con un mensaje del bot.
      messages: [
        { sender: "bot", text: "¡Bienvenido! ¿En qué puedo ayudarte?" }
      ],
    };
  },
  methods: {
    async sendMessage() {
      if (!this.chatInput.trim() || this.isLoading) return;
      const userMsg = this.chatInput;
      // Añade el mensaje del usuario al historial.
      this.messages.push({ sender: "user", text: userMsg });
      this.chatInput = "";
      this.isLoading = true;
      try {
        // Llama a la API de Gemini
        const response = await fetch("https://echobeatapi.duckdns.org/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: userMsg })
        });
        if (!response.ok) {
          throw new Error(`Error en la consulta: ${response.status}`);
        }
        const data = await response.json();
        // Se asume que la respuesta tiene la estructura especificada
        let botResponse = "No se recibió respuesta del chatbot.";
        if (
          data &&
          data.candidates &&
          data.candidates.length > 0 &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0 &&
          data.candidates[0].content.parts[0].text
        ) {
          botResponse = data.candidates[0].content.parts[0].text;
        }
        this.messages.push({ sender: "bot", text: botResponse });
      } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        this.messages.push({ sender: "bot", text: "Ocurrió un error al obtener la respuesta del chatbot." });
      } finally {
        this.isLoading = false;
      }
    },
    // Método que transforma texto Markdown a HTML usando marked.
    formatMarkdown(text) {
      return marked(text);
    }
  },
};
</script>

<style scoped>
.chat-box {
  background: linear-gradient(135deg, #1a1a1a, #333);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
  max-width: 575px;
  width: 100%;
  margin: 50px auto;
}
.chat-header {
  text-align: center;
  margin-bottom: 1rem;
}
.chat-header h2 {
  color: #ffa500;
}
.chat-body {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  margin-bottom: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
.chat-message {
  display: flex;
  margin-bottom: 0.5rem;
}
.chat-message.user {
  justify-content: flex-end;
}
.chat-message.bot {
  justify-content: flex-start;
}
.chat-bubble {
  max-width: 80%;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background-color: #555;
  color: #fff;
}
.chat-message.user .chat-bubble {
  background-color: #ffa500;
  color: #000;
}
.chat-footer {
  display: flex;
  flex-direction: column;
}
.chat-footer textarea {
  width: 100%;
  height: 60px;
  padding: 0.5rem;
  resize: none;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
}
.chat-footer button {
  background-color: #ffa500;
  border: none;
  color: #000;
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.chat-footer button:hover {
  opacity: 0.9;
}
.chat-footer textarea:disabled,
.chat-footer button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
