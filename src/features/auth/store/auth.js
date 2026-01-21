import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { supabase } from '../../../supabase'; // Importamos el cliente de supabase

/**
 * @typedef {import('@supabase/supabase-js').User} SupabaseUser
 * @typedef {import('@supabase/supabase-js').Session} SupabaseSession
 */

/**
 * Pinia Store para gestionar la autenticación con Supabase.
 *
 * Sigue el setup style de Pinia (usando una función arrow).
 * https://pinia.vuejs.org/core-concepts/#setup-stores
 */
export const useAuthStore = defineStore('auth', () => {
    // --- State ---

    /**
     * El usuario autenticado de Supabase.
     * Es reactivo y su valor inicial es null.
     * @type {import('vue').Ref<SupabaseUser|null>}
     */
    const user = ref(null);

    /**
     * La sesión activa de Supabase. Contiene el token de acceso.
     * @type {import('vue').Ref<SupabaseSession|null>}
     */
    const session = ref(null);

    /**
     * Indica si una operación de autenticación está en curso.
     * @type {import('vue').Ref<boolean>}
     */
    const loading = ref(false);

    /**
     * Almacena cualquier mensaje de error de las operaciones de autenticación.
     * @type {import('vue').Ref<string|null>}
     */
    const error = ref(null);

    // --- Getters (Computed) ---

    /**
     * Propiedad computada que devuelve `true` si hay un usuario autenticado.
     * @type {import('vue').ComputedRef<boolean>}
     */
    const isAuthenticated = computed(() => !!user.value);

    /**
     * Propiedad computada para acceder fácilmente a los datos del usuario.
     * @type {import('vue').ComputedRef<SupabaseUser|null>}
     */
    const currentUser = computed(() => user.value);

    // --- Actions ---

    /**
     * Inicia sesión de un usuario con email y contraseña.
     * @param {string} email
     * @param {string} password
     */
    const login = async (email, password) => {
        loading.value = true;
        error.value = null;
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            // El estado se actualizará automáticamente gracias a `onAuthStateChange`.
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Registra un nuevo usuario.
     * @param {string} email
     * @param {string} password
     */
    const signup = async (email, password) => {
        loading.value = true;
        error.value = null;
        try {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) throw signUpError;
            // El estado se actualizará si la configuración de Supabase requiere confirmación por email o no.
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Cierra la sesión del usuario actual.
     */
    const logout = async () => {
        loading.value = true;
        error.value = null;
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
            // El estado se limpiará automáticamente gracias a `onAuthStateChange`.
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    // --- Sincronización con Supabase y LocalStorage ---

    /**
     * Escucha los cambios en el estado de autenticación de Supabase.
     * Esta es la pieza clave para la reactividad y la persistencia.
     *
     * Se ejecuta cuando:
     * 1. El usuario inicia sesión (SIGNED_IN).
     * 2. El usuario cierra sesión (SIGNED_OUT).
     * 3. El token del usuario se actualiza en segundo plano (TOKEN_REFRESHED).
     * 4. La sesión se recupera al cargar la página.
     */
    supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('Supabase auth event:', event);

        // Actualiza el estado del store
        session.value = newSession;
        user.value = newSession?.user ?? null;
        loading.value = false;

        // Persistencia en localStorage
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            localStorage.setItem('supabase.session', JSON.stringify(newSession));
        } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('supabase.session');
        }
    });

    /**
     * Intenta recuperar la sesión del localStorage al iniciar el store.
     * Esto previene un "parpadeo" en la UI mientras Supabase verifica la sesión.
     */
    const initializeFromLocalStorage = () => {
        const storedSession = localStorage.getItem('supabase.session');
        if (storedSession) {
            try {
                const parsedSession = JSON.parse(storedSession);
                session.value = parsedSession;
                user.value = parsedSession.user ?? null;
            } catch (e) {
                console.error('Error parsing session from localStorage', e);
                localStorage.removeItem('supabase.session');
            }
        }
    };

    // Llama a la inicialización para cargar el estado guardado al momento de crear el store.
    initializeFromLocalStorage();

    // Exponer el estado, getters y acciones para que puedan ser utilizados por los componentes.
    return {
        user,
        session,
        loading,
        error,
        isAuthenticated,
        currentUser,
        login,
        signup,
        logout
    };
});
