<template>
   <div class="genres-container">
     <h2 class="title">🎶 Elige hasta 3 géneros musicales:</h2>
     <div class="genres-list">
       <div 
         v-for="genre in genres" 
         :key="genre" 
         :class="{ 'selected': selectedGenres.includes(genre) }" 
         class="genre-item" 
         @click="toggleGenre(genre)"
       >
         {{ genre }}
       </div>
     </div>
     <p class="selected-info" v-if="selectedGenres.length > 0">
       Seleccionados: <span>{{ selectedGenres.join(", ") }}</span>
     </p>
   </div>
 </template>
 
 <script setup>
 import { ref } from 'vue';
 
 const genres = ref([
   "Rock", "Pop", "Jazz", "Reggaetón", "Hip-Hop", 
   "Clásica", "Electrónica", "Metal", "Salsa"
 ]);
 
 const selectedGenres = ref([]);
 
 const toggleGenre = (genre) => {
   if (selectedGenres.value.includes(genre)) {
     selectedGenres.value = selectedGenres.value.filter(g => g !== genre);
   } else if (selectedGenres.value.length < 3) {
     selectedGenres.value.push(genre);
   }
 };
 </script>
 
 <style scoped>
 .genres-container {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100vh;
   background-color: #121212; /* Color de fondo oscuro */
   z-index: 9999;
   display: flex;
   flex-direction: column; /* Cambio para apilar el título y la lista */
   justify-content: center;
   align-items: center;
   font-family: 'Arial', sans-serif; /* Fuente más moderna */
   color: #fff;
   padding-top: 20px; /* Espacio superior para el título */
 }
 
 .title {
   font-size: 1.8rem;
   margin-bottom: 1.5rem;
   color: #ffa500; /* Color de texto llamativo */
   font-weight: 600;
   text-align: center;
 }
 
 .genres-list {
   text-align: center;
   background-color: #1f1f1f; /* Fondo ligeramente más claro para contrastar */
   padding: 2rem;
   border-radius: 15px;
   box-shadow: 0 0 30px rgba(255, 165, 0, 0.7);
   width: 100%;
   max-width: 600px; /* Mayor ancho para más comodidad */
   transition: all 0.3s ease-in-out;
 }
 
 .genres-list:hover {
   transform: scale(1.05); /* Efecto de expansión suave */
 }
 
 .genre-item {
   background-color: #333;
   color: white;
   padding: 12px 20px;
   border-radius: 25px;
   cursor: pointer;
   border: 2px solid #ffa500;
   margin: 10px 0;
   font-size: 1.1rem;
   transition: all 0.3s ease-in-out;
   display: inline-block;
   width: 100%;
   max-width: 250px;
   text-align: center;
 }
 
 .genre-item:hover {
   background-color: #ff5722;
   transform: translateY(-3px); /* Efecto de movimiento al pasar el ratón */
 }
 
 .genre-item.selected {
   background-color: #ff5722;
   border-color: #ff5722;
   color: white;
   font-weight: bold;
   box-shadow: 0 0 10px rgba(255, 87, 34, 0.8); /* Sombra más intensa */
 }
 
 .selected-info {
   margin-top: 25px;
   font-size: 1.2rem;
   color: #fff;
   font-weight: 500;
   text-align: center;
 }
 
 .selected-info span {
   font-weight: bold;
   color: #ffa500; /* Resaltar los géneros seleccionados */
 }
 </style>
 