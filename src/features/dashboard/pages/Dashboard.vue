<script setup>
import { useLayout } from '@/app/layout/composables/layout';
import { supabase } from '@/supabase';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const loading = ref(true);
const totalReceivable = ref(0);
const collectedThisMonth = ref(0);
const activeClients = ref(0);
const totalClients = ref(0);
const invoiceStatusCounts = ref({});

const chartData = ref(null);
const chartOptions = ref(null);
const pieData = ref(null);
const pieOptions = ref(null);

onMounted(async () => {
    loading.value = true;
    await Promise.all([
        loadFinancials(),
        loadClients(),
        loadInvoiceStats()
    ]);
    initCharts();
    loading.value = false;
});

// React to theme or locale changes for charts
watch([getPrimary, getSurface, isDarkTheme, locale], () => {
    initCharts();
});

const loadFinancials = async () => {
    // 1. Cobrado Este Mes (Payments)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .gte('payment_date', firstDay);

    collectedThisMonth.value = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    // 2. Por Cobrar (Invoices Pendientes)
    // Aproximación: Total de facturas NO pagadas ni canceladas. 
    // Idealmente restaríamos lo pagado parcialmente, pero para MVP sumaremos el total de facturas abiertas.
    // Si queremos precisión: Traer facturas con sus pagos.
    const { data: invoices } = await supabase
        .from('invoices')
        .select('total, status, payments(amount)')
        .neq('status', 'Paid')
        .neq('status', 'Cancelled');

    let receivable = 0;
    if (invoices) {
        invoices.forEach(inv => {
            const paid = inv.payments?.reduce((s, p) => s + (Number(p.amount) || 0), 0) || 0;
            const pending = Math.max(0, (inv.total || 0) - paid);
            receivable += pending;
        });
    }
    totalReceivable.value = receivable;
};

const loadClients = async () => {
    const { count: total } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    totalClients.value = total || 0;

    // Clientes Activos: Aquellos con status = 'Active' (si existe el campo) o con facturas recientes
    // Asumiremos que tenemos un campo 'status' en clientes o usaremos el total por ahora si no.
    // Revisando ClientsPage, si hay status.
    const { count: active } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active'); // Case sensitive? Revisar en DB si es 'Active' o 'active'

    activeClients.value = active || 0;
};

const loadInvoiceStats = async () => {
    const { data: invoices } = await supabase.from('invoices').select('status');
    const counts = { Paid: 0, Pending: 0, Overdue: 0, Draft: 0, Cancelled: 0 };
    
    if (invoices) {
        invoices.forEach(inv => {
            // Normalizar status
            let s = inv.status;
            if (s === 'Sent' || s === 'Partial Payment') s = 'Pending'; // Agrupar para grafico simple
            if (counts[s] !== undefined) counts[s]++;
            else counts['Pending']++; 
        });
    }
    invoiceStatusCounts.value = counts;
};

const initCharts = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    
    // Bar Chart: Invoice Status
    chartData.value = {
        labels: [
            t('dashboard.status.paid'), 
            t('dashboard.status.pending'), 
            t('dashboard.status.overdue'), 
            t('dashboard.status.draft'), 
            t('dashboard.status.cancelled')
        ],
        datasets: [
            {
                label: 'Invoices',
                data: [
                    invoiceStatusCounts.value.Paid,
                    invoiceStatusCounts.value.Pending,
                    invoiceStatusCounts.value.Overdue,
                    invoiceStatusCounts.value.Draft,
                    invoiceStatusCounts.value.Cancelled
                ],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-green-500'),
                    documentStyle.getPropertyValue('--p-cyan-500'), // Pending
                    documentStyle.getPropertyValue('--p-red-500'),
                    documentStyle.getPropertyValue('--p-gray-500'),
                    documentStyle.getPropertyValue('--p-orange-500')
                ],
                borderRadius: 6
            }
        ]
    };

    chartOptions.value = {
        plugins: {
            legend: {
                labels: { color: textColor }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: textColor },
                grid: { color: surfaceBorder, drawBorder: false }
            },
            x: {
                ticks: { color: textColor },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        }
    };

    // Doughnut: Paid vs Pending (Simple Ratio)
    pieData.value = {
        labels: [t('dashboard.status.paid'), t('dashboard.status.pending'), t('dashboard.status.overdue')],
        datasets: [
            {
                data: [
                    invoiceStatusCounts.value.Paid,
                    invoiceStatusCounts.value.Pending,
                    invoiceStatusCounts.value.Overdue
                ],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-green-500'),
                    documentStyle.getPropertyValue('--p-cyan-500'),
                    documentStyle.getPropertyValue('--p-red-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-green-400'),
                    documentStyle.getPropertyValue('--p-cyan-400'),
                    documentStyle.getPropertyValue('--p-red-400')
                ]
            }
        ]
    };

    pieOptions.value = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { usePointStyle: true, color: textColor }
            }
        }
    };
};

const formatCurrency = (val) => (val || 0).toLocaleString(locale.value === 'en' ? 'en-US' : 'es-ES', { style: 'currency', currency: 'USD' });

</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        
        <!-- 1. Total por Cobrar (Receivable) -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 h-full flex flex-col shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="text-surface-500 dark:text-surface-400 font-medium mb-4 block">{{ $t('dashboard.totalReceivable') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ formatCurrency(totalReceivable) }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wallet text-orange-500 text-xl" />
                    </div>
                </div>
                <div class="mt-auto">
                    <span class="text-orange-500 font-medium">{{ $t('dashboard.outstandingBalance').split(' ')[0] }} </span>
                    <span class="text-surface-500 dark:text-surface-400">{{ $t('dashboard.outstandingBalance').split(' ').slice(1).join(' ') }}</span>
                </div>
            </div>
        </div>

        <!-- 2. Cobrado Este Mes -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 h-full flex flex-col shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="text-surface-500 dark:text-surface-400 font-medium mb-4 block">{{ $t('dashboard.collectedThisMonth') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ formatCurrency(collectedThisMonth) }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-circle text-green-500 text-xl" />
                    </div>
                </div>
                <div class="mt-auto">
                    <span class="text-green-500 font-medium">{{ $t('dashboard.syncedWithPayments').split(' ')[0] }} </span>
                    <span class="text-surface-500 dark:text-surface-400">{{ $t('dashboard.syncedWithPayments').split(' ').slice(1).join(' ') }}</span>
                </div>
            </div>
        </div>

        <!-- 3. Clientes Activos -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 h-full flex flex-col shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="text-surface-500 dark:text-surface-400 font-medium mb-4 block">{{ $t('dashboard.activeClients') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ activeClients }} / {{ totalClients }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 text-xl" />
                    </div>
                </div>
                <div class="mt-auto">
                    <ProgressBar :value="totalClients > 0 ? (activeClients / totalClients) * 100 : 0" :showValue="false" style="height: 6px" />
                    <span class="text-sm text-surface-500 dark:text-surface-400 mt-2 block">{{ $t('dashboard.engagementRate') }}</span>
                </div>
            </div>
        </div>

        <!-- 4. Facturas Totales (Simple Count) -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0 h-full flex flex-col shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="text-surface-500 dark:text-surface-400 font-medium mb-4 block">{{ $t('dashboard.pendingInvoices') }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl">{{ invoiceStatusCounts.Pending || 0 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file text-purple-500 text-xl" />
                    </div>
                </div>
                <div class="mt-auto">
                    <span class="text-purple-500 font-medium">{{ $t('dashboard.actionNeeded') }} </span>
                    <span class="text-surface-500 dark:text-surface-400">{{ $t('dashboard.immediately') }}</span>
                </div>
            </div>
        </div>

        <!-- Invoice Status Breakdown Cards -->
        <div class="col-span-12 xl:col-span-6">
            <div class="card h-full">
                <h5 class="text-lg font-semibold mb-6">{{ $t('dashboard.statusDistribution') }}</h5>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <!-- Paid -->
                    <div class="flex flex-col p-4 border rounded-xl bg-green-50 dark:bg-green-400/10 border-green-200 dark:border-green-800">
                        <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-check-circle text-green-500 text-xl"></i>
                            <span class="font-medium text-green-700 dark:text-green-300">{{ $t('dashboard.status.paid') }}</span>
                        </div>
                        <span class="text-3xl font-bold text-green-700 dark:text-green-200">{{ invoiceStatusCounts.Paid || 0 }}</span>
                    </div>

                    <!-- Pending -->
                    <div class="flex flex-col p-4 border rounded-xl bg-cyan-50 dark:bg-cyan-400/10 border-cyan-200 dark:border-cyan-800">
                        <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-clock text-cyan-500 text-xl"></i>
                            <span class="font-medium text-cyan-700 dark:text-cyan-300">{{ $t('dashboard.status.pending') }}</span>
                        </div>
                        <span class="text-3xl font-bold text-cyan-700 dark:text-cyan-200">{{ invoiceStatusCounts.Pending || 0 }}</span>
                    </div>

                    <!-- Overdue -->
                    <div class="flex flex-col p-4 border rounded-xl bg-red-50 dark:bg-red-400/10 border-red-200 dark:border-red-800">
                        <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                            <span class="font-medium text-red-700 dark:text-red-300">{{ $t('dashboard.status.overdue') }}</span>
                        </div>
                        <span class="text-3xl font-bold text-red-700 dark:text-red-200">{{ invoiceStatusCounts.Overdue || 0 }}</span>
                    </div>

                    <!-- Draft -->
                    <div class="flex flex-col p-4 border rounded-xl bg-surface-100 dark:bg-surface-700/30 border-surface-200 dark:border-surface-700">
                        <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-file-edit text-surface-500 text-xl"></i>
                            <span class="font-medium text-surface-700 dark:text-surface-300">{{ $t('dashboard.status.draft') }}</span>
                        </div>
                        <span class="text-3xl font-bold text-surface-800 dark:text-surface-100">{{ invoiceStatusCounts.Draft || 0 }}</span>
                    </div>

                    <!-- Cancelled -->
                    <div class="flex flex-col p-4 border rounded-xl bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-800">
                        <div class="flex items-center gap-3 mb-2">
                            <i class="pi pi-times-circle text-orange-500 text-xl"></i>
                            <span class="font-medium text-orange-700 dark:text-orange-300">{{ $t('dashboard.status.cancelled') }}</span>
                        </div>
                        <span class="text-3xl font-bold text-orange-700 dark:text-orange-200">{{ invoiceStatusCounts.Cancelled || 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-span-12 xl:col-span-6">
            <div class="card flex flex-col items-center h-full">
                <h5 class="text-lg font-semibold mb-6 self-start w-full">{{ $t('dashboard.paidVsPending') }}</h5>
                <div class="flex justify-center w-full h-[20rem]">
                    <Chart type="doughnut" :data="pieData" :options="pieOptions" class="w-full h-full" />
                </div>
            </div>
        </div>
    </div>
</template>
