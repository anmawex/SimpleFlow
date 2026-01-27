<script setup>
import { supabase } from '@/supabase';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t, locale } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const loading = ref(true);
const invoice = ref({});
const client = ref({});
const invoiceItems = ref([]);
const payments = ref([]);

// Payment Dialog State
const paymentDialog = ref(false);
const paymentLoading = ref(false);
const newPayment = ref({
    amount: 0,
    payment_method: 'Transfer',
    payment_date: new Date(),
    description: t('invoices.register_payment')
});
const paymentMethods = computed(() => [
    { label: t('invoices.method_transfer'), value: 'Transfer' },
    { label: t('invoices.method_cash'), value: 'Cash' },
    { label: t('invoices.method_card'), value: 'Credit Card' },
    { label: t('invoices.method_check'), value: 'Check' },
    { label: t('invoices.method_other'), value: 'Other' }
]);

const invoiceId = route.params.id;

onMounted(async () => {
    await loadInvoiceData();
});

const loadInvoiceData = async () => {
    loading.value = true;
    try {
        // 1. Invoice
        const { data: invData, error: invError } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
        if (invError) throw invError;
        invoice.value = invData;

        // 2. Client
        if (invData.client_name) {
             const { data: clientData } = await supabase.from('clients').select('*').eq('name', invData.client_name).maybeSingle();
             client.value = clientData || { name: invData.client_name };
        }

        // 3. Items
        const { data: itemsData } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId);
        invoiceItems.value = itemsData || [];

        // 4. Payments
        const { data: paymentsData } = await supabase.from('payments').select('*').eq('invoice_id', invoiceId).order('payment_date', { ascending: false });
        payments.value = paymentsData || [];

    } catch (error) {
        console.error('Error loading invoice:', error);
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('invoices.load_error'), life: 3000 });
    } finally {
        loading.value = false;
    }
};

// --- Financials ---
const totalAmount = computed(() => Number(invoice.value.total) || 0);
const totalPaid = computed(() => payments.value.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
const remainingBalance = computed(() => Math.max(0, totalAmount.value - totalPaid.value));
const progressPercentage = computed(() => {
    if (totalAmount.value === 0) return 0;
    const pct = (totalPaid.value / totalAmount.value) * 100;
    return Math.min(100, Math.round(pct));
});

// --- Actions ---

const openPaymentDialog = () => {
    newPayment.value = {
        amount: remainingBalance.value,
        payment_method: 'Transfer',
        payment_date: new Date(),
        description: t('invoices.payment_description', { number: invoice.value.invoice_number })
    };
    paymentDialog.value = true;
};

const registerPayment = async () => {
    if (newPayment.value.amount <= 0) {
        toast.add({ severity: 'warn', summary: t('common.error'), detail: t('invoices.validation.price_positive'), life: 3000 });
        return;
    }

    paymentLoading.value = true;
    try {
        const payload = {
            invoice_id: invoiceId,
            amount: newPayment.value.amount,
            payment_method: newPayment.value.payment_method,
            payment_date: newPayment.value.payment_date, // Date object is fine for supabase js
            description: newPayment.value.description,
            client_name: client.value.name, // Denormalize for payments list view
            status: 'Completed'
        };

        const { error } = await supabase.from('payments').insert(payload);
        if (error) throw error;

        // Refresh Data locally
        await loadInvoiceData();

        // Check Logic for Updating Status
        // Re-calculate based on new data
        const newTotalPaid = payments.value.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        let newStatus = invoice.value.status;

        if (newTotalPaid >= totalAmount.value - 0.01) { // Tolerance for float
             newStatus = 'Paid';
        } else if (newTotalPaid > 0) {
             newStatus = 'Partial Payment';
        }

        if (newStatus !== invoice.value.status) {
            await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
            invoice.value.status = newStatus;
            toast.add({ severity: 'info', summary: t('invoices.status_updated'), detail: t(`dashboard.status.${newStatus.toLowerCase().replace(' ', '') === 'partialpayment' ? 'pending' : newStatus.toLowerCase()}`), life: 3000 });
        }

        toast.add({ severity: 'success', summary: t('invoices.payment_registered'), detail: t('common.successful'), life: 3000 });
        paymentDialog.value = false;

    } catch (e) {
        console.error(e);
        toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.operation_failed'), life: 3000 });
    } finally {
        paymentLoading.value = false;
    }
};

const confirmCancelInvoice = () => {
    confirm.require({
        message: t('invoices.confirm_cancel'),
        header: t('invoices.cancel_invoice'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await supabase.from('invoices').update({ status: 'Cancelled' }).eq('id', invoiceId);
                invoice.value.status = 'Cancelled';
                toast.add({ severity: 'success', summary: t('invoices.invoice_cancelled'), detail: t('common.successful'), life: 3000 });
            } catch (e) {
                toast.add({ severity: 'error', summary: t('common.error'), detail: t('common.operation_failed'), life: 3000 });
            }
        }
    });
};

// --- Formatters ---
const formatCurrency = (val) => (val || 0).toLocaleString(locale.value === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' });
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
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
            <Button :label="$t('invoices.back_to_invoices')" icon="pi pi-arrow-left" text @click="goBack" class="mb-4" />
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card mb-0">
                <div>
                     <span class="text-surface-500 block mb-1">{{ $t('invoices.invoice_number') }}</span>
                    <h1 class="text-3xl font-bold m-0 text-primary">{{ invoice.invoice_number }}</h1>
                </div>
                 <div class="flex items-center gap-3">
                     <!-- Action Buttons -->
                     <div class="flex gap-2 mr-4" v-if="invoice.status !== 'Cancelled'">
                         <Button v-if="invoice.status !== 'Paid'" :label="$t('invoices.add_payment')" icon="pi pi-plus" severity="success" @click="openPaymentDialog" />
                         <Button :label="$t('common.cancel')" icon="pi pi-times" severity="danger" outlined @click="confirmCancelInvoice" />
                     </div>

                    <div class="text-right">
                        <span class="block text-sm text-surface-500">{{ $t('invoices.status') }}</span>
                        <Tag :value="$t(`dashboard.status.${invoice.status.toLowerCase().replace(' ', '_')}`)" :severity="getStatusSeverity(invoice.status)" class="text-base px-3 py-1" />
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-6">
            <!-- Left Column -->
            <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
                <!-- Client Info Card -->
                <Card>
                    <template #title>{{ $t('invoices.client_details') }}</template>
                    <template #content>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span class="text-surface-500 text-sm block">{{ $t('clients.name') }}</span>
                                <span class="font-medium text-lg">{{ client.name }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500 text-sm block">{{ $t('clients.company') }}</span>
                                <span class="font-medium text-lg">{{ client.company || '-' }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500 text-sm block">{{ $t('clients.email') }}</span>
                                <span class="font-medium">{{ client.email || '-' }}</span>
                            </div>
                            <div>
                                <span class="text-surface-500 text-sm block">{{ $t('invoices.date') }}</span>
                                <span class="font-medium">{{ formatDate(invoice.created_at) }}</span>
                            </div>
                             <div>
                                <span class="text-surface-500 text-sm block">{{ $t('invoices.due_date') }}</span>
                                <span class="font-medium" :class="{'text-red-500': invoice.status === 'Overdue'}">{{ formatDate(invoice.due_date) }}</span>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Invoice Items Table -->
                <Card>
                    <template #title>{{ $t('invoices.items') }}</template>
                    <template #content>
                        <DataTable :value="invoiceItems" size="small" stripedRows showGridlines v-if="invoiceItems.length > 0">
                            <Column field="description" :header="$t('invoices.description')"></Column>
                            <Column field="quantity" :header="$t('invoices.qty')" style="width: 5rem" class="text-center"></Column>
                            <Column field="unit_price" :header="$t('invoices.price')" style="width: 8rem">
                                <template #body="{ data }">{{ formatCurrency(data.unit_price) }}</template>
                            </Column>
                            <Column field="total" :header="$t('invoices.total')" style="width: 8rem" class="text-right font-bold">
                                <template #body="{ data }">{{ formatCurrency(data.total) }}</template>
                            </Column>
                        </DataTable>
                        <div v-else class="text-center py-4 text-surface-500 italic">
                            {{ $t('invoices.no_items') }}
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Right Column -->
            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <!-- Financial Summary -->
                <div class="card p-6 flex flex-col gap-6 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
                    <div>
                        <span class="text-surface-500 dark:text-surface-400 block mb-1">{{ $t('invoices.total_amount') }}</span>
                        <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ formatCurrency(totalAmount) }}</span>
                    </div>

                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-surface-500 dark:text-surface-400 font-medium">{{ $t('invoices.paid') }}: {{ formatCurrency(totalPaid) }}</span>
                            <span class="text-surface-500 dark:text-surface-400 font-medium">{{ progressPercentage }}%</span>
                        </div>
                        <ProgressBar :value="progressPercentage" :showValue="false" style="height: 10px;" />
                    </div>

                    <div class="perm-divider border-t border-surface-200 dark:border-surface-600 my-2"></div>

                    <div class="flex justify-between items-center">
                        <span class="text-surface-500 dark:text-surface-400 font-medium">{{ $t('invoices.remaining_balance') }}</span>
                        <span class="text-2xl font-bold" :class="remainingBalance > 0 ? 'text-orange-500' : 'text-green-500'">
                            {{ formatCurrency(remainingBalance) }}
                        </span>
                    </div>
                </div>

                <!-- Payment History -->
                <Card>
                    <template #title>{{ $t('invoices.payment_history') }}</template>
                    <template #content>
                        <div v-if="payments.length > 0" class="flex flex-col gap-4">
                             <div v-for="pay in payments" :key="pay.id" class="flex items-center justify-between p-3 border rounded-lg border-surface-200">
                                <div>
                                    <span class="block font-medium">{{ formatDate(pay.payment_date) }}</span>
                                    <span class="text-xs text-surface-500">{{ $t(`invoices.method_${pay.payment_method.toLowerCase().replace(' ', '')}`) }}</span>
                                    <div class="text-xs text-surface-400 text-ellipsis overflow-hidden w-40 whitespace-nowrap">{{ pay.description }}</div>
                                </div>
                                <span class="font-bold text-primary">{{ formatCurrency(pay.amount) }}</span>
                            </div>
                        </div>
                        <div v-else class="text-center py-4 text-surface-500 italic">
                            {{ $t('invoices.no_payments') }}
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Payment Dialog -->
        <Dialog v-model:visible="paymentDialog" :header="$t('invoices.register_payment')" modal class="p-fluid" :style="{ width: '400px' }">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="font-bold block mb-2">{{ $t('invoices.amount') }}</label>
                    <InputNumber v-model="newPayment.amount" mode="currency" currency="USD" :locale="locale === 'en' ? 'en-US' : 'es-ES'" :max="remainingBalance" />
                    <small class="text-surface-500">{{ $t('invoices.max') }}: {{ formatCurrency(remainingBalance) }}</small>
                </div>
                <div>
                    <label class="font-bold block mb-2">{{ $t('invoices.date') }}</label>
                    <DatePicker v-model="newPayment.payment_date" showIcon fluid />
                </div>
                 <div>
                    <label class="font-bold block mb-2">{{ $t('invoices.method') }}</label>
                    <Select v-model="newPayment.payment_method" :options="paymentMethods" optionLabel="label" optionValue="value" />
                </div>
                 <div>
                    <label class="font-bold block mb-2">{{ $t('invoices.note') }}</label>
                    <InputText v-model="newPayment.description" />
                </div>
            </div>
            <template #footer>
                <Button :label="$t('common.cancel')" text @click="paymentDialog = false" />
                <Button :label="$t('invoices.save_payment')" icon="pi pi-check" @click="registerPayment" :loading="paymentLoading" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.fade-in-up {
    animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
