<script setup>
import GenericCrud from '@/shared/components/GenericCrud.vue';
import { useSupabaseCrud } from '@/shared/composables/useSupabaseCrud';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Usamos el composable conectado a la tabla 'clients'
const { items, loading, fetchAll, create, update, remove } = useSupabaseCrud('clients');
const toast = useToast();
const router = useRouter();

const statuses = computed(() => [
    { label: t('clients.active'), value: 'Active' },
    { label: t('clients.inactive'), value: 'Inactive' }
]);

onMounted(() => {
    fetchAll();
});

// Configuración de las columnas para la tabla
const columns = computed(() => [
    { field: 'name', header: t('clients.name'), sortable: true, style: 'min-width: 12rem' },
    { field: 'email', header: t('clients.email'), sortable: true, style: 'min-width: 12rem' },
    { field: 'company', header: t('clients.company'), sortable: true, style: 'min-width: 10rem' },
    { field: 'status', header: t('clients.status'), sortable: true, style: 'min-width: 8rem' }
]);

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
            toast.add({ severity: 'success', summary: t('common.successful'), detail: t('clients.updated'), life: 3000 });
        } else {
            await create(payload);
            toast.add({ severity: 'success', summary: t('common.successful'), detail: t('clients.created'), life: 3000 });
        }
    } catch (e) {
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.operation_failed'), life: 3000 });
    }
};

const handleDelete = async (item) => {
    try {
        await remove(item.id);
        toast.add({ severity: 'success', summary: t('common.successful'), detail: t('clients.deleted'), life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.delete_failed'), life: 3000 });
    }
};

const handleDeleteSelected = async (selectedItems) => {
    try {
        for (const item of selectedItems) {
            await remove(item.id);
        }
        toast.add({ severity: 'success', summary: t('common.successful'), detail: t('clients.batch_deleted'), life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.batch_delete_failed'), life: 3000 });
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
        :title="$t('clients.title')"
        :entityName="$t('clients.entityName')"
        displayField="name"
        :items="items"
        :loading="loading"
        :columns="columns"
        :confirmDeleteMessage="(item) => $t('clients.confirm_delete', { name: item.name })"
        :confirmDeleteSelectedMessage="$t('clients.confirm_delete_selected')"
        @save="handleSave"
        @delete="handleDelete"
        @delete-selected="handleDeleteSelected"
    >
        <!-- Slot para status badge en la tabla -->
        <template #col-status="{ data }">
             <Tag :value="$t(`clients.${data.status.toLowerCase()}`)" :severity="getStatusSeverity(data.status)" rounded />
        </template>

        <!-- Botón de detalle extra en las acciones -->
        <template #actions-start="{ data }">
            <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2" @click="router.push(`/clients/${data.id}`)" />
        </template>

        <!-- Formulario personalizado para Clientes -->
        <template #form="{ item, submitted }">
             <div>
                <label for="name" class="block font-bold mb-3">{{ $t('clients.name') }}</label>
                <InputText id="name" v-model.trim="item.name" required="true" autofocus :invalid="submitted && !item.name" fluid />
                <small v-if="submitted && !item.name" class="text-red-500">{{ $t('clients.name_required') }}</small>
            </div>
            <div>
                <label for="email" class="block font-bold mb-3">{{ $t('clients.email') }}</label>
                <InputText id="email" v-model.trim="item.email" required="true" :invalid="submitted && !item.email" fluid />
                <small v-if="submitted && !item.email" class="text-red-500">{{ $t('clients.email_required') }}</small>
            </div>
             <div>
                <label for="phone" class="block font-bold mb-3">{{ $t('clients.phone') }}</label>
                <InputText id="phone" v-model.trim="item.phone" fluid />
            </div>
             <div>
                <label for="company" class="block font-bold mb-3">{{ $t('clients.company') }}</label>
                <InputText id="company" v-model.trim="item.company" fluid />
            </div>
            <div>
                <label for="status" class="block font-bold mb-3">{{ $t('clients.status') }}</label>
                <Select id="status" v-model="item.status" :options="statuses" optionLabel="label" optionValue="value" :placeholder="$t('clients.select_status')" fluid />
            </div>
        </template>
    </GenericCrud>
</template>
