<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div
        id="hero"
        class="flex flex-col pt-6 px-6 lg:px-20 overflow-hidden"
        style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(238, 239, 175) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)"
    >
        <div class="mx-6 md:mx-20 mt-0 md:mt-6">
            <h1 class="text-6xl font-bold text-gray-900! dark:text-gray-900! leading-tight">
                <span class="font-light block text-gray-900! dark:text-gray-900!">{{ t('landing.hero.title') }}</span>
                {{ t('landing.hero.subtitle') }}
            </h1>
            <p class="font-normal text-2xl leading-normal md:mt-4 text-gray-700! dark:text-gray-700!">
                {{ t('landing.hero.description') }}
            </p>
            <div class="flex gap-4">
                <Button :label="t('landing.hero.getStarted')" as="router-link" to="/login" rounded class="text-xl! mt-8 px-4!"></Button>
                <Button :label="t('landing.hero.learnMore')" as="router-link" to="/documentation" variant="text" rounded class="text-xl! mt-8 px-4!"></Button>
            </div>
        </div>
        <div class="flex justify-center md:justify-end">
            <img src="/demo/images/landing/screen-1.png" alt="Hero Image" class="w-9/12" />
        </div>
    </div>
</template>
