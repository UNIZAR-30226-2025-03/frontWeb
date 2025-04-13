<template>
    <div class="admin-container">
        <h1>Panel de Administración</h1>
        <section class="admin-section">
            <h2>Gestión de Listas Predefinidas</h2>
            <div class="admin-actions">
                <button>Crear Lista</button>
                <button>Eliminar Lista</button>
                <button>Modificar Lista</button>
            </div>
        </section>

        <section class="admin-section">
            <h2>Gestión de Canciones en Listas</h2>
            <div class="admin-actions">
                <button>Añadir Canción</button>
                <button>Eliminar Canción</button>
            </div>
        </section>
    </div>
</template>

<script>
export default {
    name: 'AdminView',
    data() {
        return {};
    },
    methods: {}
};
</script>

<style scoped>
.admin-container {
    background-color: #000;
    color: #fff;
    padding: 1rem;
}

.admin-section {
    margin-bottom: 1.5rem;
}

.admin-actions button {
    background-color: #ffa500;
    border: none;
    color: #000;
    margin-right: 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.admin-actions button:hover {
    opacity: 0.8;
}
</style>