<script setup>
import FooterWidget from '@/features/home/components/FooterWidget.vue';
import TopbarWidget from '@/features/home/components/TopbarWidget.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900 min-h-screen">
        <div class="landing-wrapper overflow-hidden">
            <div class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
                <TopbarWidget />
            </div>

            <div class="py-12 px-6 lg:px-20 mx-0 md:mx-12 lg:mx-20">
                <div class="text-center mb-12">
                    <h1 class="text-6xl font-bold text-gray-900 leading-tight mb-2">{{ t('terms.title') }}</h1>
                    <span class="text-muted-color text-xl">{{ t('terms.lastUpdated') }}</span>
                </div>

                <div class="max-w-4xl mx-auto bg-surface-50 dark:bg-surface-800 p-8 rounded-xl shadow-sm">
                    <p class="text-2xl text-surface-700 dark:text-surface-100 mb-8 leading-relaxed">
                        {{ t('terms.overview') }}
                    </p>

                    <div class="space-y-8">
                        <section>
                            <h2 class="text-3xl font-semibold mb-4 text-primary">{{ t('terms.usage.title') }}</h2>
                            <p class="text-xl text-surface-600 dark:text-surface-200 leading-relaxed">
                                {{ t('terms.usage.content') }}
                            </p>
                        </section>

                        <section>
                            <h2 class="text-3xl font-semibold mb-4 text-primary">{{ t('terms.beta.title') }}</h2>
                            <p class="text-xl text-surface-600 dark:text-surface-200 leading-relaxed">
                                {{ t('terms.beta.content') }}
                            </p>
                        </section>

                        <section>
                            <h2 class="text-3xl font-semibold mb-4 text-primary">{{ t('terms.account.title') }}</h2>
                            <p class="text-xl text-surface-600 dark:text-surface-200 leading-relaxed">
                                {{ t('terms.account.content') }}
                            </p>
                        </section>
                    </div>

                    <div class="mt-12 flex justify-center">
                        <Button label="Back to Home" as="router-link" to="/" icon="pi pi-arrow-left" severity="secondary" rounded></Button>
                    </div>
                </div>
            </div>

            <FooterWidget />
        </div>
    </div>
</template>
