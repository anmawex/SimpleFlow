<script setup>
import GenericCrud from '@/shared/components/GenericCrud.vue';
import { useSupabaseCrud } from '@/shared/composables/useSupabaseCrud';
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
    { field: 'created_at', header: 'Date', sortable: true, style: 'min-width: 10rem' },
    { field: 'due_date', header: 'Due Date', sortable: true, style: 'min-width: 10rem' },
    { field: 'status', header: 'Status', sortable: true, style: 'min-width: 10rem' },
    { field: 'total', header: 'Total', sortable: true, type: 'currency', style: 'min-width: 10rem' }
];

const statuses = ref([
    { label: 'Paid', value: 'Paid' },
    { label: 'Partial Payment', value: 'Partial Payment' },
    { label: 'Overdue', value: 'Overdue' },
    { label: 'Sent', value: 'Sent' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Cancelled', value: 'Cancelled' }
]);

const generateInvoiceNumber = () => {
    // Simple random generator: INV-XXXX
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${random}`;
};

const formatDate = (value) => {
    if (!value) return '-';
    // Parse fecha segura
    const date = new Date(value);
    // Usar Intl para formato local robusto
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date); // Resultado: 22/01/2026
};

// Manejadores de eventos del GenericCrud
const handleSave = async (item) => {
    try {
        const payload = { ...item };
        
        // Manejar Status si viene de objeto
        if (payload.status && typeof payload.status === 'object') {
             payload.status = payload.status.value;
        }

        if (payload.id) {
            await update(payload.id, payload);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoice Updated', life: 3000 });
        } else {
            // Generar número automático si es creación
            if (!payload.invoice_number) {
                payload.invoice_number = generateInvoiceNumber();
            }
            
            await create(payload);
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

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Paid': return 'success';
        case 'Sent': return 'info';
        case 'Overdue': return 'danger';
        case 'Partial Payment': return 'warn';
        case 'Cancelled': return 'contrast';
        default: return 'secondary';
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
        <!-- Custom Status Badge -->
        <template #col-status="{ data }">
             <Tag :value="data.status" :severity="getStatusSeverity(data.status)" rounded />
        </template>
        
        <!-- Custom Date Formatting (Optional override) -->
         <template #col-created_at="{ data }">
             {{ formatDate(data.created_at) }}
        </template>
        <template #col-due_date="{ data }">
             {{ formatDate(data.due_date) }}
        </template>


        <!-- Formulario personalizado para Facturas -->
        <template #form="{ item, submitted }">
             <div v-if="item.id">
                <label class="block font-bold mb-3">Invoice Number</label>
                <InputText v-model="item.invoice_number" disabled fluid class="bg-surface-100" />
            </div>
            
            <div>
                <label for="client_name" class="block font-bold mb-3">Client Name</label>
                <InputText id="client_name" v-model.trim="item.client_name" required="true" :invalid="submitted && !item.client_name" fluid autofocus />
                <small v-if="submitted && !item.client_name" class="text-red-500">Client Name is required.</small>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label for="due_date" class="block font-bold mb-3">Due Date</label>
                    <DatePicker id="due_date" v-model="item.due_date" showIcon fluid :showOnFocus="false" />
                </div>
                 <div>
                    <label for="status" class="block font-bold mb-3">Status</label>
                    <Select id="status" v-model="item.status" :options="statuses" optionLabel="label" optionValue="value" placeholder="Select a Status" fluid />
                </div>
            </div>

            <div>
                <label for="total" class="block font-bold mb-3">Total Amount</label>
                <InputNumber id="total" v-model="item.total" mode="currency" currency="USD" locale="en-US" fluid />
            </div>
        </template>
    </GenericCrud>
</template>
