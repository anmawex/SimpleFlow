<script setup lang="ts">
import FeaturesWidget from '@/features/home/components/FeaturesWidget.vue';
import FooterWidget from '@/features/home/components/FooterWidget.vue';
import HeroWidget from '@/features/home/components/HeroWidget.vue';
import HighlightsWidget from '@/features/home/components/HighlightsWidget.vue';
import PricingWidget from '@/features/home/components/PricingWidget.vue';
import TopbarWidget from '@/features/home/components/TopbarWidget.vue';
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900">
        <div id="home" class="landing-wrapper overflow-hidden">
            <div class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
                <TopbarWidget />
            </div>
            <HeroWidget />
            <FeaturesWidget />
            <HighlightsWidget />
            <PricingWidget />
            <FooterWidget />
        </div>
    </div>
</template>
