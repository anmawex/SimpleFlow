<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, tm, rt } = useI18n();

const showContactModal = ref(false);
const selectedPlan = ref(null);

const plans = ['beta', 'custom'];
const planImages = {
    beta: '/demo/images/landing/free.svg',
    custom: '/demo/images/landing/enterprise.svg'
};

function openContactModal(plan) {
    selectedPlan.value = plan;
    showContactModal.value = true;
}

function confirmContact() {
    const email = 'angelcordero1003@gmail.com';
    const plan = selectedPlan.value;
    const subject = plan === 'beta' ? t('landing.email.betaSubject') : t('landing.email.customSubject');
    const body = t('landing.email.body');
    
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    showContactModal.value = false;
}
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
                        <Button :label="plan === 'beta' ? t('menu.getStarted') : t('footer.contact')" @click="openContactModal(plan)" class="p-button-rounded border-0 font-light leading-tight bg-primary text-white px-6 py-3 mt-4"></Button>
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

        <Dialog v-model:visible="showContactModal" modal :header="t('landing.contactModal.header')" :style="{ width: '35rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <div class="flex flex-col gap-4">
                <p class="text-surface-600 dark:text-surface-200 text-lg leading-relaxed whitespace-pre-line">
                    {{ t('landing.contactModal.message') }}
                </p>
                <div class="flex justify-end gap-3 mt-4">
                    <Button type="button" :label="t('common.cancel')" severity="secondary" @click="showContactModal = false" class="px-6"></Button>
                    <Button type="button" :label="t('common.confirm')" @click="confirmContact" class="px-6"></Button>
                </div>
            </div>
        </Dialog>
    </div>
</template>
