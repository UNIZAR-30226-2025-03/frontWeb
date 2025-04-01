import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import { compile } from 'vue';
import Signin from '../views/Signin.vue';
import Pwd from '../views/Pwd.vue';
import Prueba from '../views/prueba.vue';
import Change_pwd from '../views/Change_pwd.vue';
import createList from '../views/createList.vue';
import User from '../views/User.vue';
import Playlist from '../views/Playlist.vue';
import autenticacion from '../views/autenticacion.vue';
import Generos from '../views/Generos.vue';
import Favs from '../views/Favs.vue';
import Artist from '../views/Artist.vue';


const routes = [
  { path: '/', component: Login }, // Ruta principal
  { path: '/home', component: Home,  meta: { requiresAuth: true }},
  { path: '/signin', component: Signin},
  { path: '/pwd', component: Pwd},
  { path: '/test', component: Prueba},
  { path: '/reset-password', component: Change_pwd},
  { path: '/createList', component: createList},
  { path: '/user', component: User},
  { path: '/playlist', component: Playlist, props: true },
  { path: '/auth/callback', component: autenticacion},
  { path: '/genres', component: Generos},
  { path: '/favs', component: Favs},
  { path: '/artist/:artistName', component: Artist, props: true }, // Ruta dinámica para el artista
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔹 Proteger rutas antes de entrar
router.beforeEach((to, from, next) => {
   const token = localStorage.getItem("token"); // O usa cookies si es más seguro
   console.log('El token es: ', token);   
   if (to.matched.some(record => record.meta.requiresAuth) && !token) { 
     next("/"); // 🔹 Si no tiene token, lo manda al login
   } else {
     next(); // 🔹 Si tiene token, lo deja entrar
   }
 });

export default router;
