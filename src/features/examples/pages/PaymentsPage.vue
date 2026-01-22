<script setup>
import { useSupabaseCrud } from '@/composables/useSupabaseCrud';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Reutilizamos la lógica de conexión a datos (el composable), pero NO el componente visual GenericCrud
const { items: payments, loading, fetchAll, create } = useSupabaseCrud('payments');
const toast = useToast();

const showSidebar = ref(false);
const newPayment = ref({
    description: '',
    amount: null,
    client_name: '',
    payment_method: 'Transfer',
    status: 'Completed',
    payment_date: new Date()
});

const paymentMethods = ref(['Transfer', 'Credit Card', 'Cash', 'Check']);
const statuses = ref(['Completed', 'Pending', 'Failed', 'Refunded']);

onMounted(() => {
    fetchAll();
});

const formatCurrency = (value) => {
    return value ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00';
};

const formatDate = (dateStr) => {
    if(!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusColor = (status) => {
    switch(status) {
        case 'Completed': return 'success';
        case 'Pending': return 'warn';
        case 'Failed': return 'danger';
        default: return 'info';
    }
};

const savePayment = async () => {
    try {
        await create({
            ...newPayment.value,
            // Asegurar que guardamos la fecha en formato correcto si es objeto
            payment_date: newPayment.value.payment_date 
        });
        toast.add({ severity: 'success', summary: 'Success', detail: 'Payment registered', life: 3000 });
        showSidebar.value = false;
        // Reset form
        newPayment.value = { description: '', amount: null, client_name: '', payment_method: 'Transfer', status: 'Completed', payment_date: new Date() };
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Could not register payment', life: 3000 });
    }
};

const totalAmount = computed(() => {
    return payments.value.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <!-- Header Cards (Stats) -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
            <div class="card mb-0 bg-primary/10 border-primary/20 border">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-surface-500 font-medium mb-4">Total Revenue</span>
                        <div class="text-surface-900 font-bold text-3xl">{{ formatCurrency(totalAmount) }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-primary rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-primary-contrast text-xl" />
                    </div>
                </div>
                <span class="text-primary font-medium">All time </span>
                <span class="text-surface-500">received payments</span>
            </div>
        </div>
        
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
             <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-surface-500 font-medium mb-4">Transactions</span>
                        <div class="text-surface-900 font-bold text-3xl">{{ payments.length }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-receipt text-blue-500 text-xl" />
                    </div>
                </div>
                <span class="text-green-500 font-medium">Synced </span>
                <span class="text-surface-500">with Supabase</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4 flex items-center justify-end">
             <Button label="New Payment" icon="pi pi-plus" size="large" @click="showSidebar = true" />
        </div>

        <!-- Main List Area -->
        <div class="col-span-12">
            <div class="card">
                <h5 class="mb-4 text-xl font-semibold">Payment History</h5>
                
                <DataTable :value="payments" :loading="loading" stripedRows paginator :rows="5">
                    <Column field="description" header="Description">
                        <template #body="{ data }">
                            <span class="font-medium">{{ data.description }}</span>
                            <div class="text-sm text-surface-500">{{ data.client_name }}</div>
                        </template>
                    </Column>
                    <Column field="payment_date" header="Date">
                        <template #body="{ data }">
                            {{ formatDate(data.payment_date) }}
                        </template>
                    </Column>
                    <Column field="payment_method" header="Method">
                        <template #body="{ data }">
                            <i class="pi pi-credit-card mr-2 text-surface-500"></i>
                            {{ data.payment_method }}
                        </template>
                    </Column>
                    <Column field="status" header="Status">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="getStatusColor(data.status)" rounded />
                        </template>
                    </Column>
                    <Column field="amount" header="Amount" alignFrozen="right" frozen>
                        <template #body="{ data }">
                            <span class="font-bold text-lg" :class="{'text-green-600': data.status === 'Completed'}">
                                {{ formatCurrency(data.amount) }}
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        
        <!-- Sidebar for New Payment -->
        <Sidebar v-model:visible="showSidebar" position="right" class="w-full md:w-[400px]" header="Register Payment">
            <div class="flex flex-col gap-6 mt-4">
                <div class="flex flex-col gap-2">
                    <label class="font-bold">Description</label>
                    <InputText v-model="newPayment.description" placeholder="e.g. Graphic Design Service" fluid />
                </div>
                
                <div class="flex flex-col gap-2">
                    <label class="font-bold">Amount</label>
                    <InputNumber v-model="newPayment.amount" mode="currency" currency="USD" locale="en-US" placeholder="0.00" fluid class="p-inputtext-lg" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold">Date</label>
                    <DatePicker v-model="newPayment.payment_date" showIcon fluid />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold">Client</label>
                    <InputText v-model="newPayment.client_name" placeholder="Client Name" fluid />
                </div>

                 <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Method</label>
                        <Select v-model="newPayment.payment_method" :options="paymentMethods" fluid />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Status</label>
                        <Select v-model="newPayment.status" :options="statuses" fluid />
                    </div>
                </div>

                <Button label="Register Payment" icon="pi pi-check" class="mt-4" @click="savePayment" :loading="loading" />
            </div>
        </Sidebar>
    </div>
</template>
