<template>
   <div class="genres-container">
     <h2>🎶 Elige hasta 3 géneros musicales:</h2>
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
   background-color: #1a1a1a; 
   z-index: 9999; 
   display: flex;
   justify-content: center;
   align-items: center;
}
 
 .genres-list {
   text-align: center;
   background-color: #1a1a1a;
   padding: 2rem;
   border-radius: 20px;
   box-shadow: 0 0 20px rgba(255, 165, 0, 0.5);
   width: 100%;
   max-width: 500px;
 }
 
 .genre-item {
   background-color: #2a2a2a;
   color: white;
   padding: 10px 15px;
   border-radius: 10px;
   cursor: pointer;
   border: 2px solid #ffa500;
   transition: all 0.3s ease-in-out;
 }
 
 .genre-item:hover {
   background-color: #ff5722;
 }
 
 .genre-item.selected {
   background-color: #ff5722;
   border-color: #ff5722;
   color: white;
   font-weight: bold;
 }
 
 .selected-info {
   margin-top: 20px;
   font-weight: bold;
   color: #fff;
 }
 </style>
 