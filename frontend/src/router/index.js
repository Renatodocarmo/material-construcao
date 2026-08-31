import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/ProductListView.vue'),
        meta: { roles: ['ESTOQUISTA', 'GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'sales',
        name: 'Sales',
        component: () => import('@/views/sales/SaleListView.vue'),
        meta: { roles: ['VENDEDOR', 'GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'sales/new',
        name: 'NewSale',
        component: () => import('@/views/sales/SaleFormView.vue'),
        meta: { roles: ['VENDEDOR', 'GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/customers/CustomerListView.vue'),
        meta: { roles: ['VENDEDOR', 'GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'cash',
        name: 'Cash',
        component: () => import('@/views/cash/CashView.vue'),
        meta: { roles: ['GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/ReportsView.vue'),
        meta: { roles: ['GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('@/views/suppliers/SupplierListView.vue'),
        meta: { roles: ['GERENTE', 'ADMINISTRADOR'] }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserManagementView.vue'),
        meta: { roles: ['ADMINISTRADOR'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Se a rota requer autenticação e o usuário não está logado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Se o usuário está logado e tenta acessar a página de login
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // Verificar permissões de cargo
  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router