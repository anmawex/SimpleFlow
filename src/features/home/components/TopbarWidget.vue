<script setup>
import { useLayout } from '@/app/layout/composables/layout';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const { toggleDarkMode, isDarkTheme } = useLayout();

const showAccessModal = ref(false);

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

function handleRegister() {
    showAccessModal.value = true;
}

function closeAndScroll() {
    // Aseguramos que el modal esté cerrado antes de hacer el scroll
    showAccessModal.value = false;
    // Un pequeño delay para que el DOM se estabilice tras cerrar el modal
    setTimeout(() => {
        smoothScroll('pricing');
    }, 100);
}
</script>

<template>
    <a class="flex items-center cursor-pointer" @click="smoothScroll('home')">
        <svg
            viewBox="0 0 54 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 mr-2"
        >
            <!-- Tarjeta de crédito -->
            <rect x="2" y="6" width="40" height="26" rx="4" fill="var(--primary-color)" opacity="0.18" />
            <rect x="2" y="11" width="40" height="4" fill="var(--primary-color)" opacity="0.45" />
            <rect x="6" y="18" width="8" height="6" rx="1.2" fill="var(--primary-color)" opacity="0.65" />
            <circle cx="38" cy="22" r="10" fill="var(--primary-color)" />
            <circle cx="38" cy="22" r="7" fill="none" stroke="white" stroke-width="1.5" opacity="0.9" />
            <path d="M38 17V27M35.5 19.5H40.5M35.5 24.5H40.5" stroke="white" stroke-width="1.5" stroke-linecap="round" />
        </svg>

        <span class="text-surface-900 dark:text-surface-0 font-medium text-xl leading-normal mr-20">SEIKYU</span>
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
                <a @click="smoothScroll('home')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-base">
                    <span>{{ t('menu.home') }}</span>
                </a>
            </li>
            <li>
                <a @click="smoothScroll('features')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-base">
                    <span>{{ t('landing.features.title') }}</span>
                </a>
            </li>
            <li>
                <a @click="smoothScroll('highlights')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-base">
                    <span>{{ t('landing.highlights.title') }}</span>
                </a>
            </li>
            <li>
                <a @click="smoothScroll('pricing')" class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-base">
                    <span>{{ t('landing.pricing.title') }}</span>
                </a>
            </li>
        </ul>
        <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2 items-center">
            <Button type="button" @click="toggleDarkMode" rounded :icon="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" variant="text" />
            <Select v-model="locale" :options="languageOptions" optionLabel="label" optionValue="value" class="w-32 mr-4" />
            <Button :label="t('menu.login')" text as="router-link" to="/login" rounded></Button>
            <Button :label="t('menu.register')" @click="handleRegister" rounded></Button>
        </div>
    </div>

    <!-- Modal de Solicitud de Acceso -->
    <Dialog v-model:visible="showAccessModal" modal :header="t('landing.accessModal.header')" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" @hide="closeAndScroll">
        <div class="flex flex-col gap-4">
            <p class="text-surface-600 dark:text-surface-200 text-lg leading-relaxed mb-4">
                {{ t('landing.accessModal.message') }}
            </p>
            <div class="flex justify-end gap-2">
                <Button type="button" :label="t('common.confirm')" @click="showAccessModal = false" class="px-6"></Button>
            </div>
        </div>
    </Dialog>
</template>
