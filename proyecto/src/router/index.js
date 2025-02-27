import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import { compile } from 'vue';
import Signin from '../views/Signin.vue';
import Pwd from '../views/Pwd.vue';
import Prueba from '../views/prueba.vue';

const routes = [
  { path: '/', component: Login }, // Ruta principal
  { path: '/home', component: Home},
  { path: '/signin', component: Signin},
  { path: '/pwd', component: Pwd},
  { path: '/test', component: Prueba}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
