<!-- Lo que hay dentro del template es el html, siempre es necesario
html normal, pero con ayudas:-->
<template>
    <h1 v-bind:style="color">
        <!-- dentro de las etiquetas, no se puede usar "" por que es para el script-->
        Hola {{miNombre}} con edad {{edad}}!
    </h1>
    <!-- un boton saludar que hace la funcion saludar-->
    <h1> FUNCION </h1>
    <button @click="saludar"> saludar</button>
    
    <!--Varaiables reactivas-->
    <h1> VARIABLE REACTIVAS</h1>
    <button @click="resta">-</button>
    <span :class="miColor"> {{ contador }}</span>
    <button @click="suma">+</button>
    <div v-if="contador < 0">Escribe una cantidad mayor a 0 </div>
    <!--sin .value -->
</template>

<!-- style - css -->
<style scoped>
span {
    padding: 0 5px;
}

.rojo {
    color: red;
}

.verde {
    color: green;
}
</style>

<!-- Parte del js, ademas poner set up ahorra codigo como la exportación -->
<script setup>
//Varaiables reactivas
import { ref } from "vue"; //para poder hacer una varaible reactiva
const contador = ref(0); //ref() para indicar reactiva
const miColor = ref("verde")
// necesidad de hacer selece by id
const miNombre = "prueba"
const edad = "23"
const color = "color:blue"


//V-bind o : : permite modificar el atributo despues de los : en una etiqueta
//V-on o @; define el evento a ejecutar 
const saludar = () => {
    console.log("hola")
}


const resta = () => {
    contador.value -= 1; // value tmabien es necesario para que sea reactiva
    if (contador.value < 0) {
        miColor.value = "rojo";
    }
}

const suma = () => {
    contador.value += 1; // value tmabien es necesario para que sea reactiva
    if (contador.value > 0) {
        miColor.value = "verde";
    }
}
</script>