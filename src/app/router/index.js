import AppLayout from '@/app/layout/AppLayout.vue';
import { useAuthStore } from '@/features/auth/store/auth';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('@/features/auth/pages/Login.vue')
        },
        {
            path: '/dashboard', // Nuevo prefijo para las rutas de la aplicación
            component: AppLayout, // El layout principal de la aplicación
            meta: { requiresAuth: true }, // Requiere autenticación
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/features/dashboard/pages/Dashboard.vue')
                },
                {
                    path: '/clients',
                    name: 'clients',
                    component: () => import('@/features/examples/pages/ClientsPage.vue')
                },
                {
                    path: '/invoices',
                    name: 'invoices',
                    component: () => import('@/features/examples/pages/InvoicesPage.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/shared/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/shared/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/shared/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/shared/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/shared/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/shared/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/shared/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/shared/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/shared/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/shared/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/shared/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/shared/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/shared/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/shared/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/shared/uikit/TimelineDoc.vue')
                },
                {
                    path: '/blocks/free',
                    name: 'blocks',
                    meta: {
                        breadcrumb: ['Prime Blocks', 'Free Blocks']
                    },
                    component: () => import('@/shared/utilities/Blocks.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/app/layout/EmptyLayout.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/features/examples/pages/Crud.vue')
                },
                {
                    path: '/start/documentation',
                    name: 'documentation',
                    component: () => import('@/features/docs/pages/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/features/home/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/app/pages/NotFound.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/features/auth/pages/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/features/auth/pages/Error.vue')
        }
    ]
});

// Navigation Guard - Protección de rutas
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    if (requiresAuth && !authStore.isAuthenticated) {
        // Si la ruta requiere auth y el usuario no está autenticado, redirigir al login
        console.log('[ROUTER] Access denied. Redirecting to login.');
        next({ name: 'login', query: { redirect: to.fullPath } });
    } else if (to.name === 'login' && authStore.isAuthenticated) {
        // Si el usuario ya está autenticado e intenta ir al login, redirigir al dashboard
        console.log('[ROUTER] User already authenticated. Redirecting to dashboard.');
        next({ name: 'dashboard' });
    } else {
        // Permitir la navegación
        next();
    }
});

export default router;
