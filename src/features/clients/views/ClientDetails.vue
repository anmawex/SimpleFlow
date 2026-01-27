<script setup>
import { supabase } from '@/supabase';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const client = ref({});
const invoices = ref([]);
const payments = ref([]);

const clientId = route.params.id;

onMounted(async () => {
    await fetchClientData();
});

const fetchClientData = async () => {
    loading.value = true;
    try {
        // 1. Get Client Details
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single();

        if (clientError) throw clientError;
        client.value = clientData;

        // 2. Get Related Invoices (Linked by Name for this MVP)
        // Note: In a production app, we should use client_id foreign keys.
        if (clientData.name) {
            const { data: invoicesData, error: invoicesError } = await supabase
                .from('invoices')
                .select('*')
                .eq('client_name', clientData.name);
            
            if (invoicesError) console.error('Error fetching invoices:', invoicesError);
            else invoices.value = invoicesData || [];

            // 3. Get Related Payments
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('payments')
                .select('*')
                .eq('client_name', clientData.name);

            if (paymentsError) console.error('Error fetching payments:', paymentsError);
            else payments.value = paymentsData || [];
        }

    } catch (error) {
        console.error('Error loading client:', error);
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('clients.load_error'), life: 3000 });
        // Optional: router.push('/clients');
    } finally {
        loading.value = false;
    }
};

const totalInvoiced = computed(() => {
    return invoices.value.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
});

const totalPaid = computed(() => {
    return payments.value.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
});

const totalDue = computed(() => {
    // Simple calculation: Invoiced - Paid
    return totalInvoiced.value - totalPaid.value;
});

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const formatCurrency = (value) => {
    return (value || 0).toLocaleString(locale.value === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' });
};

const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
        case 'active': return 'success';
        case 'inactive': return 'danger';
        default: return 'info';
    }
};

const goBack = () => {
    router.push('/clients');
};
</script>

<template>
    <div v-if="loading" class="flex justify-center items-center h-[50vh]">
        <ProgressSpinner />
    </div>

    <div v-else class="flex flex-col gap-6 fade-in-up">
        <!-- Header / Actions -->
        <div>
            <Button :label="$t('clients.back_to_clients')" icon="pi pi-arrow-left" text @click="goBack" class="mb-4" />
            
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 card">
                <div class="flex items-center gap-4">
                    <Avatar :label="client.name ? client.name[0].toUpperCase() : '-'" size="xlarge" shape="circle" class="bg-primary text-primary-contrast" />
                    <div>
                        <h1 class="text-3xl font-bold m-0">{{ client.name }}</h1>
                        <div class="flex items-center gap-2 mt-2 text-surface-500">
                             <i class="pi pi-calendar"></i>
                             <span>{{ $t('clients.client_since', { date: formatDate(client.created_at) }) }}</span>
                        </div>
                    </div>
                </div>
                <div>
                     <Tag :value="$t(`clients.${(client.status || 'Active').toLowerCase()}`)" :severity="getStatusSeverity(client.status)" class="text-base px-4 py-2" rounded />
                </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-6">
            <!-- Contact Info Card -->
            <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <Card class="h-full">
                    <template #title>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-id-card text-primary"></i>
                            <span>{{ $t('clients.contact_info') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <ul class="list-none p-0 m-0 flex flex-col gap-4">
                            <li class="flex items-center gap-3">
                                <span class="bg-surface-100 p-2 rounded-full">
                                    <i class="pi pi-envelope text-surface-600"></i>
                                </span>
                                <div>
                                    <span class="block text-sm text-surface-500">{{ $t('clients.email') }}</span>
                                    <span class="font-medium word-break">{{ client.email || '-' }}</span>
                                </div>
                            </li>
                             <li class="flex items-center gap-3">
                                <span class="bg-surface-100 p-2 rounded-full">
                                    <i class="pi pi-phone text-surface-600"></i>
                                </span>
                                <div>
                                    <span class="block text-sm text-surface-500">{{ $t('clients.phone') }}</span>
                                    <span class="font-medium">{{ client.phone || '-' }}</span>
                                </div>
                            </li>
                             <li class="flex items-center gap-3">
                                <span class="bg-surface-100 p-2 rounded-full">
                                    <i class="pi pi-building text-surface-600"></i>
                                </span>
                                <div>
                                    <span class="block text-sm text-surface-500">{{ $t('clients.company') }}</span>
                                    <span class="font-medium">{{ client.company || '-' }}</span>
                                </div>
                            </li>
                        </ul>
                    </template>
                </Card>
            </div>

            <!-- Financial Summary Card -->
            <div class="col-span-12 md:col-span-6 lg:col-span-8">
                <Card class="h-full">
                    <template #title>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-chart-line text-primary"></i>
                            <span>{{ $t('clients.financial_summary') }}</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <!-- Total Invoiced -->
                            <div class="surface-ground p-4 rounded-lg flex flex-col gap-2 border border-surface-200">
                                <span class="text-surface-500 font-medium text-sm">{{ $t('clients.total_invoiced') }}</span>
                                <span class="text-2xl font-bold">{{ formatCurrency(totalInvoiced) }}</span>
                                <span class="text-xs text-surface-500">{{ $t('clients.invoices_generated', { count: invoices.length }) }}</span>
                            </div>

                             <!-- Total Collected -->
                            <div class="surface-ground p-4 rounded-lg flex flex-col gap-2 border border-surface-200">
                                <span class="text-surface-500 font-medium text-sm">{{ $t('clients.total_collected') }}</span>
                                <span class="text-2xl font-bold text-green-600">{{ formatCurrency(totalPaid) }}</span>
                                <span class="text-xs text-surface-500">{{ $t('clients.payments_received', { count: payments.length }) }}</span>
                            </div>

                             <!-- Total Due -->
                            <div class="surface-ground p-4 rounded-lg flex flex-col gap-2 border border-surface-200">
                                <span class="text-surface-500 font-medium text-sm">{{ $t('dashboard.outstandingBalance') }}</span>
                                <span class="text-2xl font-bold" :class="totalDue > 0 ? 'text-red-500' : 'text-surface-900'">
                                    {{ formatCurrency(totalDue) }}
                                </span>
                                <span class="text-xs text-surface-500">{{ $t('clients.pending_payment') }}</span>
                            </div>
                        </div>

                         <!-- Mini Invoice History (Optional - First 3 items) -->
                         <div class="mt-6" v-if="invoices.length > 0">
                            <span class="text-lg font-semibold block mb-3">{{ $t('clients.recent_invoices') }}</span>
                            <DataTable :value="invoices.slice(0, 3)" size="small">
                                <Column field="invoice_number" :header="$t('clients.invoice_number')"></Column>
                                <Column field="date" :header="$t('clients.date')">
                                    <template #body="{ data }">{{ formatDate(data.date) }}</template>
                                </Column>
                                <Column field="total" :header="$t('clients.amount')">
                                    <template #body="{ data }">{{ formatCurrency(data.total) }}</template>
                                </Column>
                            </DataTable>
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
