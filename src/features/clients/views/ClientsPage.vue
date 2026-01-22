<script setup>
import GenericCrud from '@/shared/components/GenericCrud.vue';
import { useSupabaseCrud } from '@/shared/composables/useSupabaseCrud';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Usamos el composable conectado a la tabla 'clients'
const { items, loading, fetchAll, create, update, remove } = useSupabaseCrud('clients');
const toast = useToast();
const router = useRouter();

const statuses = ref([
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
]);

onMounted(() => {
    fetchAll();
});

// Configuración de las columnas para la tabla
const columns = [
    { field: 'name', header: 'Name', sortable: true, style: 'min-width: 12rem' },
    { field: 'email', header: 'Email', sortable: true, style: 'min-width: 12rem' },
    { field: 'company', header: 'Company', sortable: true, style: 'min-width: 10rem' },
    { field: 'status', header: 'Status', sortable: true, style: 'min-width: 8rem' }
];

// Manejadores de eventos del GenericCrud
const handleSave = async (item) => {
    try {
        // Aseguramos que status sea un string simple si viene de un objeto select
        const payload = { ...item };
        if (payload.status && typeof payload.status === 'object') {
            payload.status = payload.status.value;
        }

        if (payload.id) {
            await update(payload.id, payload);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Client Updated', life: 3000 });
        } else {
            await create(payload);
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
        for (const item of selectedItems) {
            await remove(item.id);
        }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Clients Deleted', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Batch delete failed', life: 3000 });
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Active': return 'success';
        case 'Inactive': return 'danger';
        default: return 'info';
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
        <!-- Slot para status badge en la tabla -->
        <template #col-status="{ data }">
             <Tag :value="data.status" :severity="getStatusSeverity(data.status)" rounded />
        </template>

        <!-- Botón de detalle extra en las acciones -->
        <template #actions-start="{ data }">
            <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2" @click="router.push(`/clients/${data.id}`)" />
        </template>

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
                <label for="company" class="block font-bold mb-3">Company</label>
                <InputText id="company" v-model.trim="item.company" fluid />
            </div>
            <div>
                <label for="status" class="block font-bold mb-3">Status</label>
                <Select id="status" v-model="item.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select a Status" fluid />
            </div>
        </template>
    </GenericCrud>
</template>
