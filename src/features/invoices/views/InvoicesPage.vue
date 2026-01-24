<script setup>
import GenericCrud from '@/shared/components/GenericCrud.vue';
import { useSupabaseCrud } from '@/shared/composables/useSupabaseCrud';
import { supabase } from '@/supabase';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Usamos el composable conectado a la tabla 'invoices'
const { items, loading, fetchAll, create, update, remove } = useSupabaseCrud('invoices');
const toast = useToast();
const router = useRouter();

// Estado local para clientes
const clients = ref([]);
const invoiceLineItems = ref([]);
const formSubmitted = ref(false);

onMounted(async () => {
    fetchAll();
    loadClients();
});

const loadClients = async () => {
    const { data } = await supabase.from('clients').select('id, name, company');
    clients.value = data || [];
};

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
    { label: 'Sent', value: 'Sent' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Partial Payment', value: 'Partial Payment' },
    { label: 'Overdue', value: 'Overdue' },
    { label: 'Cancelled', value: 'Cancelled' }
]);

const generateInvoiceNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${random}`;
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};

// --- Manejo de Items de Factura ---

const addLineItem = () => {
    invoiceLineItems.value.push({
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0
    });
};

const removeLineItem = (index) => {
    invoiceLineItems.value.splice(index, 1);
    calculateTotal(null); // Recalcular total invoice
};

const updateLineTotal = (item) => {
    item.total = (item.quantity || 0) * (item.unit_price || 0);
    // Necesitamos recalcular el total de la factura. 
    // Como no tenemos acceso directo al objeto 'item' del formulario desde aquí fácilmente sin inyectarlo,
    // usaremos un watcher o un evento. Pero GenericCrud no expone el 'item' reactivo hacia arriba fácilmente fuera del slot.
    // Hack: El slot padre pasa 'item'. Podemos inyectar una función en el slot que actualice el item padre.
};

// Esta función será llamada desde el template, recibe el 'invoiceItem' (padre) y actualiza su total
const calculateInvoiceTotal = (invoiceItem) => {
    const total = invoiceLineItems.value.reduce((acc, curr) => acc + curr.total, 0);
    invoiceItem.total = total;
};

// Cuando abrimos el diálogo (via GenericCrud), queremos resetear items.
// GenericCrud no emite evento 'open', pero podemos observar 'items' o limpiar tras guardar.

const handleSave = async (item) => {
    formSubmitted.value = true;
    
    // Extraer función de callback (si GenericCrud nos la envía)
    const { _closeDialog, ...payload } = item;
    
    try {
        let isValid = true;
        let errorMsg = '';

        // 1. Validar Cliente
        if (!payload.client_name) {
            isValid = false;
            errorMsg = 'Client is required';
        }
        
        // 2. Validar Fecha Vencimiento
        else if (!payload.due_date) {
            isValid = false;
            errorMsg = 'Due Date is required';
        } 
        else if (new Date(payload.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) {
             isValid = false;
             errorMsg = 'Due Date must be today or in the future';
        }

        // 3. Validar Items
        else if (invoiceLineItems.value.length === 0) {
            isValid = false;
            errorMsg = 'At least one item is required';
        } else {
            // Validar items individuales
            for (const line of invoiceLineItems.value) {
                if (!line.description || !line.description.trim()) {
                    isValid = false;
                    errorMsg = 'Check item descriptions';
                    break;
                }
                if (!line.quantity || line.quantity <= 0) {
                    isValid = false;
                    errorMsg = 'Quantity must be > 0';
                    break;
                }
                if (line.unit_price === null || line.unit_price <= 0) {
                    isValid = false;
                    errorMsg = 'Price must be greater than 0';
                    break;
                }
            }
        }

        if (!isValid) {
             toast.add({ severity: 'error', summary: 'Validation Error', detail: errorMsg, life: 3000 });
             return; // Detenemos aquí. El dialogo NO se cierra porque _closeDialog no se llama.
        }
        
        // Manejar Status
        if (payload.status && typeof payload.status === 'object') {
             payload.status = payload.status.value;
        }

        if (payload.client_name && typeof payload.client_name === 'object') {
            payload.client_name = payload.client_name.name;
        }
        
        if (!payload.status) payload.status = 'Sent';

        let invoiceId = payload.id;

        if (invoiceId) {
            await update(invoiceId, payload);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoice Updated', life: 3000 });
        } else {
            if (!payload.invoice_number) payload.invoice_number = generateInvoiceNumber();
            
            const newInvoice = await create(payload);
            invoiceId = newInvoice.id;
            
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Invoice Created', life: 3000 });
        }

        // Guardar Items
        if (invoiceLineItems.value.length > 0 && invoiceId) {
            const itemsToInsert = invoiceLineItems.value.map(li => ({
                invoice_id: invoiceId,
                description: li.description,
                quantity: li.quantity,
                unit_price: li.unit_price
            }));

            if (!payload.id) { 
                 const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsToInsert);
                 if (itemsErr) console.error('Error saving items', itemsErr);
            }
        }
        
        // Limpiar y cerrar dialogo SOLO al final exitoso
        invoiceLineItems.value = [];
        formSubmitted.value = false;
        if (_closeDialog) _closeDialog();

    } catch (e) {
        console.error(e);
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
        :showEdit="false"
        :manualClose="true"
        @save="handleSave"
        @delete="handleDelete"
        @delete-selected="handleDeleteSelected"
    >
        <!-- Custom Status Badge -->
        <template #col-status="{ data }">
             <Tag :value="data.status" :severity="getStatusSeverity(data.status)" rounded />
        </template>

        <!-- Botón de detalle -->
        <template #actions-start="{ data }">
            <Button icon="pi pi-eye" outlined rounded severity="info" class="mr-2" @click="router.push(`/invoices/${data.id}`)" />
        </template>
        
        <template #col-created_at="{ data }">
             {{ formatDate(data.created_at) }}
        </template>
        <template #col-due_date="{ data }">
             {{ formatDate(data.due_date) }}
        </template>

        <!-- Formulario personalizado -->
        <template #form="{ item, submitted }">
             <div v-if="item.id">
                <label class="block font-bold mb-3">Invoice Number</label>
                <InputText v-model="item.invoice_number" disabled fluid class="bg-surface-100" />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Cliente Select -->
                <div>
                     <label for="client_name" class="block font-bold mb-3">Client</label>
                     <Select id="client_name" v-model="item.client_name" :options="clients" optionLabel="name" placeholder="Select Client" filter fluid :invalid="submitted && !item.client_name" />
                     <small v-if="submitted && !item.client_name" class="text-red-500">Client is required.</small>
                </div>

                 <div>
                     <label for="due_date" class="block font-bold mb-3">Due Date</label>
                     <DatePicker id="due_date" v-model="item.due_date" showIcon fluid :showOnFocus="false" :invalid="submitted && (!item.due_date || new Date(item.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0))" />
                     <small v-if="submitted && !item.due_date" class="text-red-500 block">Due Date is required.</small>
                     <small v-else-if="submitted && new Date(item.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)" class="text-red-500 block">Date cannot be in the past.</small>
                </div>
            </div>

            <!-- Items Section -->
             <div class="border rounded-lg p-4 mt-2 surface-ground" :class="{'border-red-500': formSubmitted && invoiceLineItems.length === 0}">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-bold">Items</span>
                    <Button icon="pi pi-plus" size="small" label="Add Item" outlined @click="addLineItem" />
                </div>
                
                <div v-if="invoiceLineItems.length === 0" class="text-center text-sm text-surface-500 py-2">
                    <span v-if="formSubmitted" class="text-red-500 font-bold">At least one item is required.</span>
                    <span v-else>No items added yet.</span>
                </div>

                <div v-else class="flex flex-col gap-3">
                    <div v-for="(line, index) in invoiceLineItems" :key="index" class="grid grid-cols-12 gap-2 items-end pb-3 border-b border-surface-200">
                        <div class="col-span-5">
                            <label class="text-xs mb-1 block" v-if="index===0">Description</label>
                            <InputText v-model="line.description" placeholder="Product/Service" fluid size="small" :invalid="formSubmitted && !line.description" />
                            <small v-if="formSubmitted && !line.description" class="text-red-500 text-xs">Description required</small>
                        </div>
                        <div class="col-span-2">
                             <label class="text-xs mb-1 block" v-if="index===0">Qty</label>
                            <InputNumber v-model="line.quantity" size="small" fluid @input="(e) => { line.quantity = e.value; updateLineTotal(line); calculateInvoiceTotal(item); }" :invalid="formSubmitted && (!line.quantity || line.quantity <= 0)" />
                            <small v-if="formSubmitted && (!line.quantity || line.quantity <= 0)" class="text-red-500 text-xs">Qty > 0</small>
                        </div>
                        <div class="col-span-2">
                             <label class="text-xs mb-1 block" v-if="index===0">Price</label>
                            <InputNumber v-model="line.unit_price" mode="currency" currency="USD" locale="en-US" size="small" fluid @input="(e) => { line.unit_price = e.value; updateLineTotal(line); calculateInvoiceTotal(item); }" :invalid="formSubmitted && (line.unit_price === null || line.unit_price <= 0)" />
                            <small v-if="formSubmitted && (line.unit_price === null || line.unit_price <= 0)" class="text-red-500 text-xs text-nowrap block">Price > 0</small>
                        </div>
                        <div class="col-span-2">
                             <label class="text-xs mb-1 block" v-if="index===0">Total</label>
                            <span class="block py-2 font-bold text-right">{{ (line.total || 0).toLocaleString('en-US', {style:'currency', currency:'USD'}) }}</span>
                        </div>
                        <div class="col-span-1 flex justify-end">
                            <Button icon="pi pi-trash" text severity="danger" @click="() => { removeLineItem(index); calculateInvoiceTotal(item); }" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-2">
                <div class="text-right">
                    <span class="block text-surface-500 text-sm">Grand Total</span>
                    <span class="block text-2xl font-bold text-primary">{{ (item.total || 0).toLocaleString('en-US', {style:'currency', currency:'USD'}) }}</span>
                </div>
            </div>
            
           
            <div class="mt-4">
                <label for="status" class="block font-bold mb-3">Save As</label>
                <div class="flex gap-4">
                     <RadioButton v-model="item.status" inputId="statusSent" name="status" value="Sent" />
                    <label for="statusSent" class="cursor-pointer">Send Immediately (Default)</label>

                    <RadioButton v-model="item.status" inputId="statusDraft" name="status" value="Draft" />
                    <label for="statusDraft" class="cursor-pointer">Save as Draft</label>
                </div>
            </div>
        </template>
    </GenericCrud>
</template>
