<script setup>
import { supabase } from '@/supabase';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const invoice = ref({});
const client = ref({});
const invoiceItems = ref([]); // Items de la factura
const payments = ref([]);     // Pagos realizados a esta factura

const invoiceId = route.params.id;

onMounted(async () => {
    await loadInvoiceData();
});

const loadInvoiceData = async () => {
    loading.value = true;
    try {
        // 1. Cargar Factura
        const { data: invData, error: invError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();

        if (invError) throw invError;
        invoice.value = invData;

        // 2. Cargar Cliente (Asumiendo que 'client_name' es el link, idealmente client_id)
        // Intentamos buscar por nombre ya que por ahora no tenemos client_id FK estricto
        if (invData.client_name) {
             const { data: clientData } = await supabase
                .from('clients')
                .select('*')
                .eq('name', invData.client_name)
                .maybeSingle(); // maybeSingle para no lanzar error si no existe
             
             if (clientData) client.value = clientData;
             else client.value = { name: invData.client_name }; // Fallback
        }

        // 3. Cargar Items de Factura
        const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoiceId);
            
        if (!itemsError) invoiceItems.value = itemsData || [];

        // 4. Cargar Pagos relacionados
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('invoice_id', invoiceId);

        if (!paymentsError) payments.value = paymentsData || [];

    } catch (error) {
        console.error('Error loading invoice:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Could not load invoice details', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// --- Computed Financials ---

const totalAmount = computed(() => Number(invoice.value.total) || 0);

const totalPaid = computed(() => {
    return payments.value.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
});

const remainingBalance = computed(() => {
    return Math.max(0, totalAmount.value - totalPaid.value);
});

const progressPercentage = computed(() => {
    if (totalAmount.value === 0) return 0;
    const pct = (totalPaid.value / totalAmount.value) * 100;
    return Math.min(100, Math.round(pct));
});

// --- Formatters ---

const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Mismo fix seguro que usamos antes
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
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

const goBack = () => router.push('/invoices');

</script>

<template>
    <div v-if="loading" class="flex justify-center items-center h-[50vh]">
        <ProgressSpinner />
    </div>

    <div v-else class="flex flex-col gap-6 fade-in-up">
        <!-- Header -->
        <div>
            <Button label="Back to Invoices" icon="pi pi-arrow-left" text @click="goBack" class="mb-4" />
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card mb-0">
                <div>
                     <span class="text-surface-500 block mb-1">Invoice #</span>
                    <h1 class="text-3xl font-bold m-0 text-primary">{{ invoice.invoice_number }}</h1>
                </div>
                 <div class="flex items-center gap-3">
                    <div class="text-right">
                        <span class="block text-sm text-surface-500">Status</span>
                        <Tag :value="invoice.status" :severity="getStatusSeverity(invoice.status)" class="text-base px-3 py-1" />
                    </div>
                     <div class="text-right border-l pl-4 border-surface-200">
                        <span class="block text-sm text-surface-500">Due Date</span>
                        <span class="font-bold block" :class="{'text-red-500': invoice.status === 'Overdue'}">
                            {{ formatDate(invoice.due_date) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-6">
            
            <!-- Left Column: Client & Items -->
            <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <!-- Client Info Card -->
                <Card>
                    <template #title>Client Details</template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span class="text-surface-500 text-sm block">Name</span>
                                <span class="font-medium text-lg">{{ client.name }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500 text-sm block">Company</span>
                                <span class="font-medium text-lg">{{ client.company || '-' }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500 text-sm block">Email</span>
                                <span class="font-medium">{{ client.email || '-' }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500 text-sm block">Invoice Date</span>
                                <span class="font-medium">{{ formatDate(invoice.created_at) }}</span>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Invoice Items Table -->
                <Card>
                    <template #title>Items</template>
                    <template #content>
                        <DataTable :value="invoiceItems" size="small" stripedRows showGridlines v-if="invoiceItems.length > 0">
                            <Column field="description" header="Description"></Column>
                            <Column field="quantity" header="Qty" style="width: 5rem" class="text-center"></Column>
                            <Column field="unit_price" header="Price" style="width: 8rem">
                                <template #body="{ data }">{{ formatCurrency(data.unit_price) }}</template>
                            </Column>
                            <Column field="total" header="Total" style="width: 8rem" class="text-right font-bold">
                                <template #body="{ data }">{{ formatCurrency(data.total) }}</template>
                            </Column>
                        </DataTable>
                        <div v-else class="text-center py-4 text-surface-500 italic">
                            No items found for this invoice.
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Right Column: Financial Summary & Payments -->
            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
                
                <!-- Financial Summary -->
                <div class="card bg-surface-900 text-surface-0 p-6 flex flex-col gap-6">
                    <div>
                        <span class="text-surface-400 block mb-1">Total Amount</span>
                        <span class="text-4xl font-bold text-white">{{ formatCurrency(totalAmount) }}</span>
                    </div>

                    <!-- Progress Bar -->
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-surface-300">Paid: {{ formatCurrency(totalPaid) }}</span>
                            <span class="text-surface-300">{{ progressPercentage }}%</span>
                        </div>
                        <ProgressBar :value="progressPercentage" :showValue="false" style="height: 10px; background-color: rgba(255,255,255,0.2)" />
                    </div>

                    <div class="perm-divider border-t border-surface-700 my-2"></div>

                    <div class="flex justify-between items-center">
                        <span class="text-surface-200">Remaining Balance</span>
                        <span class="text-2xl font-bold" :class="remainingBalance > 0 ? 'text-orange-400' : 'text-green-400'">
                            {{ formatCurrency(remainingBalance) }}
                        </span>
                    </div>
                </div>

                <!-- Payment History -->
                <Card>
                    <template #title>Payment History</template>
                    <template #content>
                        <div v-if="payments.length > 0" class="flex flex-col gap-4">
                             <div v-for="pay in payments" :key="pay.id" class="flex items-center justify-between p-3 border rounded-lg border-surface-200">
                                <div>
                                    <span class="block font-medium">{{ formatDate(pay.payment_date) }}</span>
                                    <span class="text-xs text-surface-500">{{ pay.payment_method }}</span>
                                </div>
                                <span class="font-bold text-primary">{{ formatCurrency(pay.amount) }}</span>
                            </div>
                        </div>
                        <div v-else class="text-center py-4 text-surface-500 italic">
                            No payments recorded yet.
                        </div>
                    </template>
                </Card>

            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
