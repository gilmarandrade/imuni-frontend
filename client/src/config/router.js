import Vue from 'vue'
import VueRouter from 'vue-router'

import { userKey } from '@/global';

import Home from '@/components/home/Home'
import IdososSpreadsheet from '@/components/googlesheets/idosos/IdososSpreadsheet'
import GerenciamentoSpreadsheet from '@/components/googlesheets/gerenciamento/GerenciamentoSpreadsheet'
import VigilanteHome from '@/components/vigilante/VigilanteHome'
import Unidades from '@/components/administrador/Unidades'
import Unidade from '@/components/administrador/Unidade'
import AdicionarUnidade from '@/components/administrador/AdicionarUnidade'
import ConvidarUsuario from '@/components/administrador/ConvidarUsuario'
import IdososPorVigilante from '@/components/administrador/IdososPorVigilante'
import Auth from '@/components/auth/Auth'
import ForgotPassword from '@/components/auth/ForgotPassword'
import ResetPassword from '@/components/auth/ResetPassword'
import AcceptInvitation from '@/components/auth/AcceptInvitation'
import Administradores from '@/components/administrador/Administradores'
import ConvidarAdministrador from '@/components/administrador/ConvidarAdministrador'

Vue.use(VueRouter);

const routes = [
    {
        name: 'home',
        path: '/',
        component: Home
    },
    {
        name: 'idososSpreadsheet',
        path: '/googlesheets/idosos',
        component: IdososSpreadsheet,
    },
    {
        name: 'gerenciamentoSpreadsheet',
        path: '/googlesheets/gerenciamento',
        component: GerenciamentoSpreadsheet,
    },
    {
        name: 'meusIdosos',
        path: '/meusIdosos',
        component: VigilanteHome,
    },
    {
        name: 'idososPorVigilante',
        path: '/unidades/:unidadePrefix/:unidadeNome/vigilantes/:vigilanteNome',
        component: IdososPorVigilante,
        meta: { requiresAdmin: true }
    },
    {
        name: 'auth',
        path: '/auth',
        component: Auth,
    },
    {
        name: 'forgotPassword',
        path: '/forgot',
        component: ForgotPassword,
    },
    {
        name: 'resetPassword',
        path: '/reset/:id/:token',
        component: ResetPassword,
    },
    {
        name: 'convidarUsuarioDaUnidade',
        path: '/unidades/:id/:unidadeNome/addUsuario',
        component: ConvidarUsuario,
        meta: { requiresAdmin: true }
    },
    {
        name: 'convidarAdministrador',
        path: '/administradores/addUsuario',
        component: ConvidarAdministrador,
        meta: { requiresAdmin: true }
    },
    {
        name: 'acceptInvitation',
        path: '/acceptInvitation/:id/:token',
        component: AcceptInvitation,
    },
    {
        name: 'unidade',
        path: '/unidades/:id',
        component: Unidade,
        meta: { requiresAdmin: true }
    },
    {
        name: 'unidades',
        path: '/unidades',
        component: Unidades,
        meta: { requiresAdmin: true }
    },
    {
        name: 'adicionarUnidade',
        path: '/adicionarUnidade',
        component: AdicionarUnidade,
        meta: { requiresAdmin: true }
    },
    {
        name: 'administradores',
        path: '/administradores',
        component: Administradores,
        meta: { requiresAdmin: true }
    },
]

const router = new VueRouter({
    mode: 'history',
    routes,
})

router.beforeEach((to, from, next) => {
    const json = localStorage.getItem(userKey);//TODO fazer uma chamada ao backend para checar o role do usuario 

    if(to.matched.some(record => record.meta.requiresAdmin)) {
        const user = JSON.parse(json);
        user && user.role === 'ADMINISTRADOR' ? next() : next({ path: '/' })
    } else {
        next()
    }
})

export default router;
