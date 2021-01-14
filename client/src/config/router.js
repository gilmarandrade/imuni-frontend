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
import MigrarUnidade from '@/components/administrador/MigrarUnidade'
import ConvidarUsuario from '@/components/administrador/ConvidarUsuario'
import IdososPorUsuario from '@/components/administrador/IdososPorUsuario'
import Auth from '@/components/auth/Auth'
import ForgotPassword from '@/components/auth/ForgotPassword'
import ResetPassword from '@/components/auth/ResetPassword'
import AcceptInvitation from '@/components/auth/AcceptInvitation'
import Administradores from '@/components/administrador/Administradores'
import ConvidarAdministrador from '@/components/administrador/ConvidarAdministrador'
import CadastrarIdoso from '@/components/administrador/CadastrarIdoso'
import Idoso from '@/components/idoso/Idoso'
import Atendimento from '@/components/atendimento/Atendimento'
import Listar from '@/components/avalins/Listar'
import Novo from '@/components/avalins/Novo'
import Detalhar from '@/components/avalins/Detalhar'
import CadastrarAtendimento from '@/components/atendimento/CadastrarAtendimento'

Vue.use(VueRouter);

const routes = [
    {
        name: 'Detalharavalins',
        path: '/avalins/detalhar/:atendimentoId',
        component: Detalhar
    },
    {
        name: 'Novoavalins',
        path: '/avalins/novo',
        component: Novo
    },
    {
        name: 'avalins',
        path: '/avalins',
        component: Listar
    },
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
        path: '/meusIdosos/:tab',
        component: VigilanteHome,
    },
    {
        name: 'idososPorUsuario',
        path: '/unidades/:unidadeId/usuarios/:usuarioId/idosos/:tab',
        component: IdososPorUsuario,
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
        path: '/unidades/:unidadeId/addUsuario',
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
        name: 'atendimento',
        path: '/unidades/:unidadeId/atendimentos/:atendimentoId',
        component: Atendimento,
    },
    {
        name: 'cadastrarAtendimento',
        path: '/unidades/:unidadeId/cadastrarAtendimento',
        component: CadastrarAtendimento,
    },
    {
        name: 'idoso',
        path: '/unidades/:unidadeId/idosos/:idosoId',
        component: Idoso,
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
        name: 'migrarUnidade',
        path: '/migrarUnidade',
        component: MigrarUnidade,
        meta: { requiresAdmin: true }
    },
    {
        name: 'administradores',
        path: '/administradores',
        component: Administradores,
        meta: { requiresAdmin: true }
    },
    {
        name: 'cadastrarIdoso',
        path: '/unidades/:unidadeId/cadastrarIdoso',
        component: CadastrarIdoso,
        meta: { requiresPreceptor: true }
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
    } else if(to.matched.some(record => record.meta.requiresPreceptor)) {
        const user = JSON.parse(json);
        user && (user.role === 'ADMINISTRADOR' || user.role === 'PRECEPTOR') ? next() : next({ path: '/' })
    } else {
        next()
    }
})

export default router;
