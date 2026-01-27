<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const features = computed(() => [
    {
        title: t('docs.features.auth.title'),
        icon: 'pi pi-lock',
        color: 'blue',
        description: t('docs.features.auth.desc'),
        status: t('docs.status.operational')
    },
    {
        title: t('docs.features.dashboard.title'),
        icon: 'pi pi-chart-bar',
        color: 'purple',
        description: t('docs.features.dashboard.desc'),
        status: t('docs.status.operational')
    },
    {
        title: t('docs.features.crm.title'),
        icon: 'pi pi-users',
        color: 'cyan',
        description: t('docs.features.crm.desc'),
        status: t('docs.status.operational')
    },
    {
        title: t('docs.features.invoicing.title'),
        icon: 'pi pi-file-pdf',
        color: 'orange',
        description: t('docs.features.invoicing.desc'),
        status: t('docs.status.operational')
    },
    {
        title: t('docs.features.payments.title'),
        icon: 'pi pi-money-bill',
        color: 'green',
        description: t('docs.features.payments.desc'),
        status: t('docs.status.operational')
    }
]);

const architecture = computed(() => [
    {
        label: 'GenericCrud.vue',
        detail: t('docs.architecture.generic'),
        icon: 'pi pi-box'
    },
    {
        label: 'useSupabaseCrud.js',
        detail: t('docs.architecture.composable'),
        icon: 'pi pi-database'
    },
    {
        label: 'Auth Store (Pinia)',
        detail: t('docs.architecture.pinia'),
        icon: 'pi pi-shield'
    }
]);
</script>

<template>
    <div class="card overflow-hidden">
        <!-- Header -->
        <div class="relative p-8 mb-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl text-white">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 class="text-4xl font-bold mb-2">{{ $t('docs.title') }}</h1>
                    <p class="text-lg opacity-90 max-w-2xl" v-html="$t('docs.subtitle')"></p>
                </div>
                <div class="hidden md:block">
                    <i class="pi pi-directions text-8xl opacity-20"></i>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-8">
            <!-- Functional Modules -->
            <div class="col-span-12 lg:col-span-8">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                    <i class="pi pi-th-large text-primary"></i>
                    {{ $t('docs.functional_core') }}
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div v-for="f in features" :key="f.title" class="p-4 border border-surface-200 dark:border-surface-700 rounded-xl hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-3 mb-3">
                            <div :class="`bg-${f.color}-100 dark:bg-${f.color}-400/10 p-2 rounded-lg`">
                                <i :class="[f.icon, `text-${f.color}-500`]"></i>
                            </div>
                            <span class="font-bold text-lg">{{ f.title }}</span>
                        </div>
                        <p class="text-surface-600 dark:text-surface-400 text-sm leading-relaxed mb-4">
                            {{ f.description }}
                        </p>
                        <div class="flex justify-between items-center">
                            <Tag :value="f.status" severity="success" rounded />
                            <i class="pi pi-arrow-right text-xs opacity-50"></i>
                        </div>
                    </div>
                </div>

                <!-- Pattern Documentation -->
                <div class="mt-12">
                    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                        <i class="pi pi-code text-primary"></i>
                        {{ $t('docs.developer_guide') }}
                    </h2>
                    <div class="card bg-surface-50 dark:bg-surface-800/50 border-none">
                        <p class="mb-4" v-html="$t('docs.pattern_description')"></p>
                        <pre class="app-code bg-surface-950 text-surface-0 p-4 rounded-lg overflow-x-auto text-sm">
<code>// {{ $t('docs.steps_example') }}
const { items, fetchAll } = useSupabaseCrud('my_table');
onMounted(fetchAll);

&lt;GenericCrud 
    title="My Entities" 
    :items="items" 
    @save="handleSave"
&gt;
    &lt;template #form="{ item }"&gt;
        &lt;InputText v-model="item.name" /&gt;
    &lt;/template&gt;
&lt;/GenericCrud&gt;</code></pre>
                    </div>
                </div>
            </div>

            <!-- Technical Stack & Sidebar -->
            <div class="col-span-12 lg:col-span-4">
                <div class="sticky top-8">
                    <h3 class="text-xl font-bold mb-4">{{ $t('docs.core_components') }}</h3>
                    <div class="flex flex-col gap-4 mb-8">
                        <div v-for="item in architecture" :key="item.label" class="flex gap-4 p-4 bg-surface-50 dark:bg-surface-800/30 rounded-xl">
                            <i :class="[item.icon, 'text-primary text-xl mt-1']"></i>
                            <div>
                                <div class="font-bold mb-1">{{ item.label }}</div>
                                <div class="text-xs text-surface-500">{{ item.detail }}</div>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-xl font-bold mb-4">{{ $t('docs.stack_tech') }}</h3>
                    <ul class="list-none p-0 m-0">
                        <li class="flex items-center gap-3 p-3 border-b border-surface-200 dark:border-surface-700">
                            <img src="https://vuejs.org/logo.svg" width="20" height="20" alt="Vue" />
                            <span class="font-medium text-sm">Vue 3 (Composition API)</span>
                        </li>
                        <li class="flex items-center gap-3 p-3 border-b border-surface-200 dark:border-surface-700">
                            <i class="pi pi-prime text-green-500"></i>
                            <span class="font-medium text-sm">PrimeVue 4 + Tailwind CSS</span>
                        </li>
                        <li class="flex items-center gap-3 p-3 border-b border-surface-200 dark:border-surface-700">
                            <i class="pi pi-bolt text-yellow-500"></i>
                            <span class="font-medium text-sm">Supabase (PostgreSQL + Auth)</span>
                        </li>
                        <li class="flex items-center gap-3 p-3">
                            <i class="pi pi-external-link text-blue-500"></i>
                            <span class="font-medium text-sm">Pinia (State Management)</span>
                        </li>
                    </ul>

                    <div class="mt-8 p-6 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800">
                        <div class="flex items-center gap-2 mb-2">
                             <i class="pi pi-info-circle text-primary"></i>
                             <span class="font-bold">{{ $t('docs.pro_tip') }}</span>
                        </div>
                        <p class="text-sm text-surface-600 dark:text-surface-400" v-html="$t('docs.rls_tip')"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.app-code {
    font-family: 'Courier New', Courier, monospace;
}
</style>
