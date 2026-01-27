<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppMenuItem from './AppMenuItem.vue';

const { t } = useI18n();

const model = computed(() => [
    {
        label: t('menu.home'),
        items: [
            {
                label: t('menu.dashboard'),
                icon: 'pi pi-fw pi-home',
                to: '/dashboard'
            },
            {
                label: t('menu.clients'),
                icon: 'pi pi-fw pi-users',
                to: '/clients'
            },
            {
                label: t('menu.invoices'),
                icon: 'pi pi-fw pi-money-bill',
                to: '/invoices'
            },
            {
                label: t('menu.payments'),
                icon: 'pi pi-fw pi-wallet',
                to: '/payments'
            }
        ]
    },
    {
        label: t('menu.getStarted'),
        path: '/start',
        items: [
            {
                label: t('menu.documentation'),
                icon: 'pi pi-fw pi-book',
                to: '/start/documentation'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
