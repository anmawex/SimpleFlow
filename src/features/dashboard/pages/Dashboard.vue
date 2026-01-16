<script setup>
import BestSellingWidget from '../components/BestSellingWidget.vue';
import NotificationsWidget from '../components/NotificationsWidget.vue';
import RecentSalesWidget from '../components/RecentSalesWidget.vue';
import RevenueStreamWidget from '../components/RevenueStreamWidget.vue';
import StatsWidget from '../components/StatsWidget.vue';
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <RecentSalesWidget />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
            <NotificationsWidget />
        </div>
    </div>
</template>
