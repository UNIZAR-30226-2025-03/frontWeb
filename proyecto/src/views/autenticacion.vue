<template>

</template>

<script>
import { useRoute, useRouter } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 🔹 Capturar el token desde la URL
    const token = route.query.token;
    const email = route.query.email;

    if (token) {
      localStorage.setItem("token", token); 
      localStorage.setItem("email", email); 
      router.push("/home"); // 🔹 Redirigir al home
    } else {
      router.push("/"); // 🔹 Si falla, volver al login
    }
  },
};
</script>

<style scoped>

</style>