<script setup>
import { useSupabaseCrud } from '@/shared/composables/useSupabaseCrud';
import { supabase } from '@/supabase'; // Import supra
import { FilterMatchMode } from '@primevue/core/api'; // Import filtros corregido
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n();

// Usamos el composable pero sobreescribimos la carga
const { items: payments, loading } = useSupabaseCrud('payments');
const toast = useToast();
const router = useRouter();

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    payment_method: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const paymentMethods = computed(() => [
    { label: t('invoices.method_transfer'), value: 'Transfer' },
    { label: t('invoices.method_card'), value: 'Credit Card' },
    { label: t('invoices.method_cash'), value: 'Cash' },
    { label: t('invoices.method_check'), value: 'Check' }
]);
const statuses = ['Completed', 'Pending', 'Failed', 'Refunded'];

onMounted(() => {
    fetchPaymentsCustom();
});

const fetchPaymentsCustom = async () => {
    loading.value = true;
    try {
        // Carga personalizada con Join a Invoices para saber si está cancelada
        const { data, error } = await supabase
            .from('payments')
            .select('*, invoice:invoices(status, invoice_number)')
            .order('payment_date', { ascending: false });
            
        if (error) throw error;
        payments.value = data || [];
    } catch (e) {
        console.error(e);
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('payments.load_error'), life: 3000 });
    } finally {
        loading.value = false;
    }
}

const formatCurrency = (value) => {
    return (value || 0).toLocaleString(locale.value === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' });
};
// ... rest of functions
const formatDate = (dateStr) => {
    if(!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusColor = (status) => {
    switch(status) {
        case 'Completed': return 'success';
        case 'Pending': return 'warn';
        case 'Failed': return 'danger';
        default: return 'info';
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
                        <span class="block text-surface-500 dark:text-surface-400 font-medium mb-4">{{ $t('payments.total_revenue') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ formatCurrency(totalAmount) }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-primary rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-primary-contrast text-xl" />
                    </div>
                </div>
                <span class="text-primary font-medium">{{ $t('payments.all_time') }} </span>
                <span class="text-surface-500">{{ $t('payments.received_payments') }}</span>
            </div>
        </div>
        
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
             <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-surface-500 dark:text-surface-400 font-medium mb-4">{{ $t('payments.transactions') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ payments.length }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-receipt text-blue-500 text-xl" />
                    </div>
                </div>
                <span class="text-green-500 font-medium">{{ $t('payments.synced') }} </span>
                <span class="text-surface-500">{{ $t('payments.with_supabase') }}</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4 flex items-center justify-end">
             <!-- Espacio vacio o mas stats -->
        </div>

        <!-- Main List Area -->
        <div class="col-span-12">
            <div class="card">
                <div class="flex flex-col md:flex-row gap-4 mb-4 justify-between">
                    <h5 class="text-xl font-semibold m-0 self-center">{{ $t('payments.history') }}</h5>
                    <div class="flex gap-2">
                         <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" :placeholder="$t('payments.search_placeholder')" />
                        </IconField>
                        <Select v-model="filters['payment_method'].value" :options="paymentMethods" optionLabel="label" optionValue="value" showClear :placeholder="$t('payments.method_placeholder')" class="w-40" />
                    </div>
                </div>
                
                <DataTable 
                    :value="payments" 
                    :loading="loading" 
                    stripedRows 
                    paginator 
                    :rows="10" 
                    v-model:filters="filters"
                    :globalFilterFields="['client_name', 'invoice.invoice_number', 'description']"
                >
                    <Column field="description" :header="$t('invoices.description')">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <span class="font-medium" :class="{'line-through text-surface-500': data.invoice?.status === 'Cancelled'}">{{ data.description }}</span>
                                <i v-if="data.invoice?.status === 'Cancelled'" 
                                   class="pi pi-exclamation-circle text-orange-500 cursor-help"
                                   v-tooltip.top="$t('payments.tooltip_cancelled', { number: data.invoice?.invoice_number || 'N/A' })">
                                </i>
                            </div>
                            <div class="text-sm text-surface-500">{{ data.client_name }}</div>
                        </template>
                    </Column>
                    <Column :header="$t('invoices.invoice_number')">
                         <template #body="{ data }">
                            <span v-if="!data.invoice_id" class="text-surface-500">-</span>
                             <a v-else 
                                href="#" 
                                class="text-primary hover:underline font-medium"
                                @click.prevent="router.push(`/invoices/${data.invoice_id}`)">
                                {{ data.invoice?.invoice_number || 'View' }}
                            </a>
                        </template>
                    </Column>
                    <Column field="payment_date" :header="$t('invoices.date')">
                        <template #body="{ data }">
                            {{ formatDate(data.payment_date) }}
                        </template>
                    </Column>
                    <Column field="payment_method" :header="$t('payments.method_placeholder')">
                        <template #body="{ data }">
                            <i class="pi pi-credit-card mr-2 text-surface-500"></i>
                            {{ $t(`invoices.method_${data.payment_method.toLowerCase().replace(' ', '')}`) }}
                        </template>
                    </Column>
                    <Column field="status" :header="$t('invoices.status')">
                        <template #body="{ data }">
                            <Tag :value="$t(`payments.status.${data.status.toLowerCase()}`)" :severity="getStatusColor(data.status)" rounded />
                        </template>
                    </Column>
                    <Column field="amount" :header="$t('invoices.total')" alignFrozen="right" frozen>
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

    </div>
</template>
