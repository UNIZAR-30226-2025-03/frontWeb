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


const routes = [
  { path: '/', component: Login }, // Ruta principal
  { path: '/home', component: Home},
  { path: '/signin', component: Signin},
  { path: '/pwd', component: Pwd},
  { path: '/test', component: Prueba},
  { path: '/reset-password', component: Change_pwd},
  { path: '/createList', component: createList},
  { path: '/user', component: User},

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
