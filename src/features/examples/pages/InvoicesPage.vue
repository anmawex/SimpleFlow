<script setup>
import { useSupabaseCrud } from '@/composables/useSupabaseCrud';
import GenericCrud from '@/shared/components/GenericCrud.vue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

// Usamos el composable conectado a la tabla 'invoices'
const { items, loading, fetchAll, create, update, remove } = useSupabaseCrud('invoices');
const toast = useToast();

onMounted(() => {
    fetchAll();
});

// Configuración de las columnas para la tabla
const columns = [
    { field: 'invoice_number', header: 'Invoice #', sortable: true, style: 'min-width: 10rem' },
    { field: 'client_name', header: 'Client', sortable: true, style: 'min-width: 12rem' },
    { field: 'date', header: 'Date', sortable: true, style: 'min-width: 10rem' },
    { field: 'status', header: 'Status', sortable: true, style: 'min-width: 10rem' },
    { field: 'total', header: 'Total', sortable: true, type: 'currency', style: 'min-width: 10rem' }
];

const statuses = ref([
    { label: 'Draft', value: 'Draft' },
    { label: 'Sent', value: 'Sent' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Overdue', value: 'Overdue' }
]);

// Manejadores de eventos del GenericCrud
const handleSave = async (item) => {
    try {
        // Asegurarse de formatear la fecha si es necesario, o guardarla tal cual
        // PrimeVue DatePicker devuelve un objeto Date
        if (item.status && typeof item.status === 'object') {
             item.status = item.status.value;
        }

        if (item.id) {
            await update(item.id, item);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoice Updated', life: 3000 });
        } else {
            await create(item);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoice Created', life: 3000 });
        }
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
    }
};

const handleDelete = async (item) => {
    try {
        await remove(item.id);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoice Deleted', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 });
    }
};

const handleDeleteSelected = async (selectedItems) => {
    try {
        for (const item of selectedItems) {
            await remove(item.id);
        }
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoices Deleted', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Batch delete failed', life: 3000 });
    }
};
</script>

<template>
    <GenericCrud
        title="Manage Invoices"
        entityName="Invoice"
        displayField="invoice_number"
        :items="items"
        :loading="loading"
        :columns="columns"
        @save="handleSave"
        @delete="handleDelete"
        @delete-selected="handleDeleteSelected"
    >
        <!-- Formulario personalizado para Facturas -->
        <template #form="{ item, submitted }">
             <div>
                <label for="invoice_number" class="block font-bold mb-3">Invoice Number</label>
                <InputText id="invoice_number" v-model.trim="item.invoice_number" required="true" autofocus :invalid="submitted && !item.invoice_number" fluid />
                <small v-if="submitted && !item.invoice_number" class="text-red-500">Invoice Number is required.</small>
            </div>
            <div>
                <label for="client_name" class="block font-bold mb-3">Client Name</label>
                <InputText id="client_name" v-model.trim="item.client_name" required="true" :invalid="submitted && !item.client_name" fluid />
                <small v-if="submitted && !item.client_name" class="text-red-500">Client Name is required.</small>
            </div>
             <div>
                <label for="date" class="block font-bold mb-3">Date</label>
                <DatePicker id="date" v-model="item.date" showIcon fluid :showOnFocus="false" />
            </div>
             <div>
                <label for="status" class="block font-bold mb-3">Status</label>
                <Select id="status" v-model="item.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select a Status" fluid />
            </div>
            <div>
                <label for="total" class="block font-bold mb-3">Total Amount</label>
                <InputNumber id="total" v-model="item.total" mode="currency" currency="USD" locale="en-US" fluid />
            </div>
        </template>
    </GenericCrud>
</template>
