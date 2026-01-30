<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const features = [
    {
        key: 'clients',
        icon: 'pi pi-users',
        color: 'yellow',
        bg: 'bg-yellow-200',
        text: 'text-yellow-700'
    },
    {
        key: 'invoices',
        icon: 'pi pi-file-edit',
        color: 'cyan',
        bg: 'bg-cyan-200',
        text: 'text-cyan-700'
    },
    {
        key: 'payments',
        icon: 'pi pi-money-bill',
        color: 'indigo',
        bg: 'bg-indigo-200',
        text: 'text-indigo-700'
    },
    {
        key: 'dashboard',
        icon: 'pi pi-chart-bar',
        color: 'slate',
        bg: 'bg-slate-200',
        text: 'text-slate-700'
    },
    {
        key: 'security',
        icon: 'pi pi-shield',
        color: 'orange',
        bg: 'bg-orange-200',
        text: 'text-orange-700'
    },
    {
        key: 'ui',
        icon: 'pi pi-mobile',
        color: 'pink',
        bg: 'bg-pink-200',
        text: 'text-pink-700'
    }
];
</script>

<template>
    <div id="features" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20">
        <div class="grid grid-cols-12 gap-4 justify-center">
            <div class="col-span-12 text-center mt-20 mb-6">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">{{ t('landing.features.title') }}</div>
                <span class="text-muted-color text-2xl">{{ t('landing.features.subtitle') }}</span>
            </div>

            <div v-for="feature in features" :key="feature.key" class="col-span-12 md:col-span-12 lg:col-span-4 mt-6 lg:mt-0">
                <div class="h-full" style="padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full flex flex-col" style="border-radius: 8px">
                        <div :class="['flex items-center justify-center mb-4', feature.bg]" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i :class="['pi pi-fw text-2xl!', feature.icon, feature.text]"></i>
                        </div>
                        <h5 class="mb-2 text-surface-900 dark:text-surface-0">{{ t(`landing.features.${feature.key}.title`) }}</h5>
                        <span class="text-surface-600 dark:text-surface-200">{{ t(`landing.features.${feature.key}.desc`) }}</span>
                    </div>
                </div>
            </div>

            <!-- <div
                class="col-span-12 mt-20 mb-20 p-2 md:p-20"
                style="border-radius: 20px; background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%)"
            >
                <div class="flex flex-col justify-center items-center text-center px-4 py-4 md:py-0">
                    <div class="text-gray-900 mb-2 text-3xl font-semibold">{{ t('landing.testimonials.one.name') }}</div>
                    <span class="text-gray-600 text-2xl">{{ t('landing.testimonials.one.company') }}</span>
                    <p class="text-gray-900 sm:line-height-2 md:line-height-4 text-2xl mt-6" style="max-width: 800px">
                        “{{ t('landing.testimonials.one.text') }}”
                    </p>
                </div>
            </div> -->
        </div>
    </div>
</template>
