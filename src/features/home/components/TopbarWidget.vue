<script setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

const { t, locale } = useI18n();

const languageOptions = ref([
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
]);

function smoothScroll(id) {
    document.body.click();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}
</script>

<template>
    <a class="flex items-center" href="#">
        <svg
            viewBox="0 0 54 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 mr-2"
        >
            <!-- Tarjeta de crédito -->
            <rect
                x="2"
                y="6"
                width="40"
                height="26"
                rx="4"
                fill="var(--primary-color)"
                opacity="0.18"
            />

            <!-- Banda magnética -->
            <rect
                x="2"
                y="11"
                width="40"
                height="4"
                fill="var(--primary-color)"
                opacity="0.45"
            />

            <!-- Chip -->
            <rect
                x="6"
                y="18"
                width="8"
                height="6"
                rx="1.2"
                fill="var(--primary-color)"
                opacity="0.65"
            />

            <!-- Moneda frontal -->
            <circle
                cx="38"
                cy="22"
                r="10"
                fill="var(--primary-color)"
            />

            <!-- Borde interno moneda -->
            <circle
                cx="38"
                cy="22"
                r="7"
                fill="none"
                stroke="white"
                stroke-width="1.5"
                opacity="0.9"
            />

            <!-- Símbolo de dinero -->
            <path
                d="M38 17V27M35.5 19.5H40.5M35.5 24.5H40.5"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
            />
        </svg>

        <span class="text-surface-900 dark:text-surface-0 font-medium text-2xl leading-normal mr-20">SEIKYU</span>
    </a>
    <Button
        class="lg:hidden!"
        text
        severity="secondary"
        rounded
        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
    >
        <i class="pi pi-bars text-2xl!"></i>
    </Button>
    <div class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border">
        <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
            <li>
                <a @click="smoothScroll('home')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                    <span>{{ t('menu.home') }}</span>
                </a>
            </li>
            <li>
                <a @click="smoothScroll('features')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                    <span>{{ t('landing.features.title') }}</span>
                </a>
            </li>
            <li>
                <a @click="smoothScroll('highlights')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                    <span>{{ t('landing.highlights.title') }}</span>
                </a>
            </li>
            <li>
                <a @click="smoothScroll('pricing')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl">
                    <span>{{ t('landing.pricing.title') }}</span>
                </a>
            </li>
        </ul>
        <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2 items-center">
            <Select v-model="locale" :options="languageOptions" optionLabel="label" optionValue="value" class="w-32 mr-4" />
            <Button :label="t('menu.login')" text as="router-link" to="/login" rounded></Button>
            <Button :label="t('menu.register')" as="router-link" to="/login" rounded></Button>
        </div>
    </div>
</template>
