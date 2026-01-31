<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div class="py-6 px-6 mx-0 mt-20 lg:mx-20">
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-2">
                <a class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-4 cursor-pointer">
                    <svg
                        viewBox="0 0 54 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-12 mr-2"
                    >
                        <rect x="2" y="6" width="40" height="26" rx="4" fill="var(--primary-color)" opacity="0.18" />
                        <rect x="2" y="11" width="40" height="4" fill="var(--primary-color)" opacity="0.45" />
                        <rect x="6" y="18" width="8" height="6" rx="1.2" fill="var(--primary-color)" opacity="0.65" />
                        <circle cx="38" cy="22" r="10" fill="var(--primary-color)" />
                        <circle cx="38" cy="22" r="7" fill="none" stroke="white" stroke-width="1.5" opacity="0.9" />
                        <path d="M38 17V27M35.5 19.5H40.5M35.5 24.5H40.5" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                    <h4 class="font-medium text-3xl text-surface-900 dark:text-surface-0">SEIKYU</h4>
                </a>
            </div>

            <div class="col-span-12 md:col-span-10">
                <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                    <div class="col-span-12 md:col-span-4">
                        <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">{{ t('footer.developer') }}</h4>
                        <!-- Deja campo abierto para tus contactos -->
                        <a href="https://anmawex.vercel.app" target="_blank" class="leading-normal text-xl block w-fit mx-auto md:mx-0 cursor-pointer mb-2 text-surface-700 dark:text-surface-100">{{ t('footer.portfolio') }}</a>
                        <a href="https://www.linkedin.com/in/angelcordero1003/" target="_blank" class="leading-normal text-xl block w-fit mx-auto md:mx-0 cursor-pointer mb-2 text-surface-700 dark:text-surface-100">{{ t('footer.linkedin') }}</a>
                        <a href="https://github.com/anmawex" target="_blank" class="leading-normal text-xl block w-fit mx-auto md:mx-0 cursor-pointer mb-2 text-surface-700 dark:text-surface-100">{{ t('footer.github') }}</a>
                    </div>

                    <div class="col-span-12 md:col-span-4">
                        <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">{{ t('footer.resources') }}</h4>
                        <span v-tooltip="t('footer.inProgress')" class="leading-normal text-xl block w-fit mx-auto md:mx-0 mb-2 text-surface-500 dark:text-surface-400 cursor-not-allowed opacity-60">
                            {{ t('menu.documentation') }}
                        </span>
                    </div>

                    <div class="col-span-12 md:col-span-4">
                        <h4 class="font-medium text-2xl leading-normal mb-4 text-surface-900 dark:text-surface-0">{{ t('footer.legal') }}</h4>
                        <router-link to="/privacy" class="leading-normal text-xl block w-fit mx-auto md:mx-0 cursor-pointer mb-2 text-surface-700 dark:text-surface-100">{{ t('footer.privacy') }}</router-link>
                        <router-link to="/terms" class="leading-normal text-xl block w-fit mx-auto md:mx-0 cursor-pointer text-surface-700 dark:text-surface-100">{{ t('footer.terms') }}</router-link>
                    </div>
                </div>
            </div>
            <div class="col-span-12 text-center mt-8 border-t border-surface-200 dark:border-surface-700 pt-8">
                <span class="text-surface-600 dark:text-surface-200">
                    {{ t('footer.text') }} - {{ t('footer.by') }} <b>anmawex</b>. {{ t('footer.rights') }}
                </span>
            </div>
        </div>
    </div>
</template>
