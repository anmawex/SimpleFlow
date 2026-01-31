<script setup>
import { useI18n } from 'vue-i18n';

const { t, tm, rt } = useI18n();

const plans = ['beta', 'custom'];
const planImages = {
    beta: '/demo/images/landing/free.svg',
    custom: '/demo/images/landing/enterprise.svg'
};
</script>

<template>
    <div id="pricing" class="py-6 px-6 lg:px-20 my-2 md:my-6">
        <div class="text-center mb-6">
            <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">{{ t('landing.pricing.title') }}</div>
            <span class="text-muted-color text-2xl">{{ t('landing.pricing.subtitle') }}</span>
        </div>

        <div class="flex flex-wrap justify-center gap-8 mt-20 md:mt-0">
            <div v-for="plan in plans" :key="plan" class="w-full md:w-[450px] p-0 md:p-4">
                <div class="p-4 flex flex-col border-surface-200 dark:border-surface-600 pricing-card cursor-pointer border-2 hover:border-primary duration-300 transition-all h-full" style="border-radius: 10px">
                    <div class="text-surface-900 dark:text-surface-0 text-center my-8 text-3xl font-bold">{{ t(`landing.pricing.${plan}.title`) }}</div>
                    <img :src="planImages[plan]" class="w-10/12 mx-auto" :alt="plan" style="max-height: 200px; width: auto;" />
                    <div class="my-8 flex flex-col items-center gap-4">
                        <div class="flex flex-col items-center">
                            <span class="text-5xl font-bold text-primary">{{ t(`landing.pricing.${plan}.price`) }}</span>
                            <span class="text-surface-600 dark:text-surface-200 mt-1">{{ t(`landing.pricing.${plan}.period`) }}</span>
                        </div>
                        <Button :label="plan === 'beta' ? t('menu.getStarted') : t('footer.contact')" as="a" :href="plan === 'beta' ? '/login' : 'https://www.linkedin.com/in/angelcordero1003/'" :target="plan === 'beta' ? '_self' : '_blank'" class="p-button-rounded border-0 font-light leading-tight bg-primary text-white px-6 py-3 mt-4"></Button>
                    </div>
                    <Divider class="w-full bg-surface-200"></Divider>
                    <ul class="my-8 list-none p-0 flex text-surface-900 dark:text-surface-0 flex-col px-8">
                        <li v-for="feature in tm(`landing.pricing.${plan}.features`)" :key="feature" class="py-2 flex items-start">
                            <i class="pi pi-fw pi-check-circle text-xl text-green-500 mr-3 mt-1"></i>
                            <span class="text-xl leading-normal">{{ rt(feature) }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
