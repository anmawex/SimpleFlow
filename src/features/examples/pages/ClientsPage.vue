<script setup>
import { useSupabaseCrud } from '@/composables/useSupabaseCrud';
import GenericCrud from '@/shared/components/GenericCrud.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted } from 'vue';

// Usamos el composable conectado a la tabla 'clients'
const { items, loading, fetchAll, create, update, remove } = useSupabaseCrud('clients');
const toast = useToast();

onMounted(() => {
    fetchAll();
});

// Configuración de las columnas para la tabla
const columns = [
    { field: 'name', header: 'Name', sortable: true, style: 'min-width: 12rem' },
    { field: 'email', header: 'Email', sortable: true, style: 'min-width: 12rem' },
    { field: 'phone', header: 'Phone', sortable: false, style: 'min-width: 10rem' }
];

// Manejadores de eventos del GenericCrud
const handleSave = async (item) => {
    try {
        if (item.id) {
            await update(item.id, item);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Client Updated', life: 3000 });
        } else {
            await create(item);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Client Created', life: 3000 });
        }
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
    }
};

const handleDelete = async (item) => {
    try {
        await remove(item.id);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Client Deleted', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 });
    }
};

const handleDeleteSelected = async (selectedItems) => {
    try {
        // En una app real, usarías una función RPC o un 'in' filter en Supabase para borrar en lote
        // Aquí iteramos por simplicidad
        for (const item of selectedItems) {
            await remove(item.id);
        }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Clients Deleted', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Batch delete failed', life: 3000 });
    }
};
</script>

<template>
    <GenericCrud
        title="Manage Clients"
        entityName="Client"
        displayField="name"
        :items="items"
        :loading="loading"
        :columns="columns"
        @save="handleSave"
        @delete="handleDelete"
        @delete-selected="handleDeleteSelected"
    >
        <!-- Formulario personalizado para Clientes -->
        <template #form="{ item, submitted }">
             <div>
                <label for="name" class="block font-bold mb-3">Name</label>
                <InputText id="name" v-model.trim="item.name" required="true" autofocus :invalid="submitted && !item.name" fluid />
                <small v-if="submitted && !item.name" class="text-red-500">Name is required.</small>
            </div>
            <div>
                <label for="email" class="block font-bold mb-3">Email</label>
                <InputText id="email" v-model.trim="item.email" required="true" :invalid="submitted && !item.email" fluid />
                <small v-if="submitted && !item.email" class="text-red-500">Email is required.</small>
            </div>
             <div>
                <label for="phone" class="block font-bold mb-3">Phone</label>
                <InputText id="phone" v-model.trim="item.phone" fluid />
            </div>
             <div>
                <label for="address" class="block font-bold mb-3">Address</label>
                <Textarea id="address" v-model="item.address" rows="3" cols="20" fluid />
            </div>
        </template>
    </GenericCrud>
</template>
