<script setup>
import { useAuthStore } from '@/features/auth/store/auth';
import FloatingConfigurator from '@/shared/utilities/FloatingConfigurator.vue';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const authError = ref(null);
const emailError = ref('');
const passwordError = ref('');
const touched = ref({ email: false, password: false });

// Regex para validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 6;

// Observa si hay un error en el store y lo muestra localmente
watch(
    () => authStore.error,
    (newError) => {
        authError.value = newError;
    }
);

// Validar email
const validateEmail = () => {
    if (!touched.value.email) return;
    
    if (!email.value) {
        emailError.value = 'El email es requerido';
    } else if (!emailRegex.test(email.value)) {
        emailError.value = 'El formato del email no es válido';
    } else {
        emailError.value = '';
    }
};

// Validar password
const validatePassword = () => {
    if (!touched.value.password) return;
    
    if (!password.value) {
        passwordError.value = 'La contraseña es requerida';
    } else if (password.value.length < minPasswordLength) {
        passwordError.value = `La contraseña debe tener al menos ${minPasswordLength} caracteres`;
    } else {
        passwordError.value = '';
    }
};

// Marcar campo como tocado y validar
const handleEmailBlur = () => {
    touched.value.email = true;
    validateEmail();
};

const handlePasswordBlur = () => {
    touched.value.password = true;
    validatePassword();
};

// Validar mientras escribe (solo si ya fue tocado)
watch(email, () => {
    if (touched.value.email) {
        validateEmail();
    }
});

watch(password, () => {
    if (touched.value.password) {
        validatePassword();
    }
});

// Validar todo el formulario antes de enviar
const validateForm = () => {
    touched.value.email = true;
    touched.value.password = true;
    validateEmail();
    validatePassword();
    
    return !emailError.value && !passwordError.value;
};

const handleLogin = async () => {
    authError.value = null; // Limpia errores previos
    
    // Validar formulario
    if (!validateForm()) {
        return;
    }
    
    await authStore.login(email.value, password.value);

    if (authStore.isAuthenticated) {
        // Redirigir a la página original o al dashboard
        const redirectPath = router.currentRoute.value.query.redirect || '/dashboard';
        router.push(redirectPath);
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <svg
    viewBox="0 0 54 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="h-16 w-auto mx-auto mb-4"
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
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">¡Bienvenido a SEIKYU!</div>
                        <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText 
                            id="email1" 
                            type="text" 
                            placeholder="Correo electrónico" 
                            class="w-full md:w-[30rem]" 
                            :class="{ 'mb-2': emailError, 'mb-8': !emailError }"
                            v-model="email" 
                            @keyup.enter="handleLogin"
                            @blur="handleEmailBlur"
                            :invalid="!!emailError"
                        />
                        <small v-if="emailError" class="text-red-500 block mb-6">{{ emailError }}</small>

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password 
                            id="password1" 
                            v-model="password" 
                            placeholder="Contraseña" 
                            :toggleMask="true" 
                            class="mb-2" 
                            fluid 
                            :feedback="false" 
                            @keyup.enter="handleLogin"
                            @blur="handlePasswordBlur"
                            :invalid="!!passwordError"
                        ></Password>
                        <small v-if="passwordError" class="text-red-500 block mb-4">{{ passwordError }}</small>
                        <div v-else class="mb-4"></div>

                        <!-- Mensaje de Error de Autenticación -->
                        <div v-if="authError" class="text-red-500 text-center mb-4">{{ authError }}</div>

                        <Button 
                            :label="authStore.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'" 
                            class="w-full" 
                            @click="handleLogin" 
                            :disabled="authStore.loading || !email || !password"
                        ></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
