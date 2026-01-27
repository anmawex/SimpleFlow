<script setup>
import { useLayout } from '@/app/layout/composables/layout';
import { useAuthStore } from '@/features/auth/store/auth';
import { useConfirm } from 'primevue/useconfirm';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const { locale, t } = useI18n();

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const router = useRouter();
const confirm = useConfirm();

// Obtener información del usuario
const userEmail = computed(() => authStore.currentUser?.email || t('topbar.user'));
const userInitials = computed(() => {
    const email = authStore.currentUser?.email || '';
    return email.charAt(0).toUpperCase();
});

// Función para cerrar sesión con confirmación
const handleLogout = () => {
    confirm.require({
        message: t('topbar.logoutConfirmMessage'),
        header: t('topbar.logoutConfirmHeader'),
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: t('topbar.cancel'),
        acceptLabel: t('topbar.logout'),
        rejectClass: 'p-button-secondary p-button-outlined',
        acceptClass: 'p-button-danger',
        accept: async () => {
            await authStore.logout();
            router.push('/');
        },
        reject: () => {
            // Usuario canceló el logout
        }
    });
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
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


                <span>SEIKYU</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveToClass: 'hidden', leaveActiveClass: 'p-anchored-overlay-leave-active', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveToClass: 'hidden', leaveActiveClass: 'p-anchored-overlay-leave-active', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:flex">
                <div class="layout-topbar-menu-content">
                    <!-- Información del Usuario -->
                    <div class="layout-topbar-action" style="cursor: default; gap: 0.75rem;">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-contrast font-semibold">
                            {{ userInitials }}
                        </div>
                        <span class="font-medium">{{ userEmail }}</span>
                    </div>
                    
                    <!-- Botón de Logout -->
                    <button type="button" class="layout-topbar-action" @click="handleLogout" :title="$t('topbar.logout')">
                        <i class="pi pi-sign-out"></i>
                        <span>{{ $t('topbar.logout') }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
</template>
