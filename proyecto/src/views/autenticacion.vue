<template>

</template>

<script>
import { useRoute, useRouter } from "vue-router";

export default {
  /**
   * Componente de redirección basado en parámetros URL.
   * Se encarga de capturar el token y el email desde la query de la URL, almacenarlos en localStorage
   * y redirigir al usuario al home o al login según corresponda.
   *
   * @returns {undefined}
   */
  setup() {
    // Objeto reactivo que contiene la información de la ruta actual
    const route = useRoute();
    // Instancia del router para la navegación programática
    const router = useRouter();

    // 🔹 Capturar el token,el email y si es nuevo desde la URL a través de la query
    const token = route.query.token;
    const email = route.query.email;
    const isNew = route.query.isNew === "true";

    console.log("Token:", token);
    console.log("Email:", email);
    console.log("isNew:", isNew);


    if (token) {
      // Almacena el token y email en localStorage si se encuentran en la URL
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      if (isNew) {
        router.push("/genres");
      } else {
        router.push("/home");
      }
      
    } else {
      // 🔹 Si no se encuentra un token, redirige al usuario a la ruta raíz (login)
      router.push("/");
    }
  },
};
</script>


<style scoped>

</style>