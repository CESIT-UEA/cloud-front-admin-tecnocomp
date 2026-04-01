import { MeusModulosComponent } from './components/meus-modulos/meus-modulos.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard, resetPasswordGuard } from './auth/auth.guard';
import { CadastroUsuarioComponent } from './components/cadastro-usuario/cadastro-usuario.component';
import { CadastroPlataformaComponent } from './components/cadastro-plataforma/cadastro-plataforma.component';
import { CadastroModuloComponent } from './components/cadastro-modulo/cadastro-modulo.component';
import { CadastrosPageComponent } from './pages/cadastros-page/cadastros-page.component';
import { LayoutMenuComponent } from './pages/layout-menu/layout-menu.component';
import { UsuariosPageComponent } from './pages/usuarios-page/usuarios-page.component';
import { EditarUsuarioComponent } from './components/editar-usuario/editar-usuario.component';
import { RegistroModuloComponent } from './components/registro-modulo/registro-modulo.component';
import { ModulosPageComponent } from './pages/modulos-page/modulos-page.component';
import { ModuloUnicoComponent } from './pages/modulo-unico/modulo-unico.component';
import { EditarModuloComponent } from './components/editar-modulo/editar-modulo.component';
import { CadastroTopicoComponent } from './components/cadastro-topico/cadastro-topico.component';
import { EditarTopicoComponent } from './components/editar-topico/editar-topico.component';
import { PlataformaPageComponent } from './pages/plataforma-page/plataforma-page.component';
import { EditarPlataformaComponent } from './components/editar-plataforma/editar-plataforma.component';
import { MeuPerfilPageComponent } from './pages/meu-perfil-page/meu-perfil-page.component';
import { EditarPerfilComponent } from './components/editar-perfil/editar-perfil.component';
import { GerenciarFichaTecnicaComponent } from './components/gerenciar-ficha-tecnica/gerenciar-ficha-tecnica.component';
import { GerenciarVantagensComponent } from './components/gerenciar-vantagens/gerenciar-vantagens.component';
import { GerenciarReferenciasComponent } from './components/gerenciar-referencias/gerenciar-referencias.component';
import { roleGuard } from './auth/role.guard';
import { MinhasPlataformasComponent } from './components/minhas-plataformas/minhas-plataformas.component';
import { TemplatesComponent } from './components/templates/templates.component';
import { ModuloComponent } from './pages/ver-ao-vivo/modulo/modulo.component';
import { SobreComponent } from './pages/ver-ao-vivo/sobre/sobre.component';
import { FichaTecnicaComponent } from './pages/ver-ao-vivo/ficha-tecnica/ficha-tecnica.component';
import { TopicoComponent } from './pages/ver-ao-vivo/topico/topico.component';
import { ReferenciasComponent } from './pages/ver-ao-vivo/referencias/referencias.component';
import { SaibaMaisComponent } from './pages/ver-ao-vivo/saiba-mais/saiba-mais.component';
import { SlideComponent } from './pages/ver-ao-vivo/slide/slide.component';
import { AtividadeComponent } from './pages/ver-ao-vivo/atividade/atividade.component';
import { GerenciarAlunosComponent } from './components/gerenciar-alunos/gerenciar-alunos.component';

import { AutoCadastroComponent } from './components/auto-cadastro/auto-cadastro.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ConfirmacaoAutoCadastroComponent } from './components/confirmacao-auto-cadastro/confirmacao-auto-cadastro.component';
import { TopicosModuloUnicoComponent } from './pages/topicos-modulo-unico/topicos-modulo-unico.component';
import { PerfilVisitaComponent } from './pages/perfil-visita/perfil-visita.component';
import { ClonarFichaTecnicaComponent } from './components/clonar-ficha-tecnica/clonar-ficha-tecnica.component';
  
import { CadastrarCodigoComponent } from './pages/cadastrar-codigo/cadastrar-codigo.component';
const routes: Routes = [
 
  { path: 'login', component: LoginComponent },
  { path: 'cadastrar', component: AutoCadastroComponent},
  { path: 'cadastrar/teste', component: ConfirmacaoAutoCadastroComponent},
  { path: 'cadastrar/codigo', component: CadastrarCodigoComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [resetPasswordGuard]},
  {
    path: 'tecnocomp',
    component: LayoutMenuComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'cadastros',
        component: CadastrosPageComponent,
        data: { title: 'Cadastrar' },
      },
      {
        path: 'meu-perfil',
        canActivate: [roleGuard],
        component: MeuPerfilPageComponent,
        data: { title: 'Meu Perfil', roles: ['professor', 'adm'] },
      },
      {
        path: 'ver-perfil/:id',
        canActivate: [roleGuard],
        component: PerfilVisitaComponent,
        data: { title: 'Perfil Visita', roles: ['adm'] }
      },
      {
        path: 'meus-modulos',
        canActivate: [roleGuard],
        component: MeusModulosComponent,
        data: { title: 'Módulos', roles: ['professor'] },
      },
      {
        path: 'minhas-plataformas',
        canActivate: [roleGuard],
        component: MinhasPlataformasComponent,
        data: { title: 'Plataforma', roles: ['professor'] },
      },
      {
        path: 'templates',
        canActivate: [roleGuard],
        component: TemplatesComponent,
        data: { title: 'Templates', roles: ['professor', 'adm'] },
      },
      {
        path: 'usuarios',
        component: UsuariosPageComponent,
        canActivate: [roleGuard],
        data: { title: 'Usuarios', roles: ['adm'] },
      },
      {
        path: 'modulos',
        component: ModulosPageComponent,
        canActivate: [roleGuard],
        data: { title: 'Modulos', roles: ['adm'] },
      },
      {
        path: 'plataformas',
        component: PlataformaPageComponent,
        canActivate: [roleGuard],
        data: { title: 'Plataformas', roles: ['adm'] },
      },
    ],
  },
  {
    path: 'tecnocomp/cadastros/cadastro-usuario',
    canActivate: [authGuard],
    component: CadastroUsuarioComponent,
  },
  {
    path: 'tecnocomp/cadastros/cadastro-plataforma',
    canActivate: [authGuard],
    component: CadastroPlataformaComponent,
  },
  {
    path: 'tecnocomp/cadastros/registrar-modulo',
    canActivate: [authGuard],
    component: RegistroModuloComponent,
  },
  {
    path: 'tecnocomp/editar-plataforma/:id',
    canActivate: [authGuard],
    component: EditarPlataformaComponent,
  },
  {
    path: 'tecnocomp/editar-perfil',
    canActivate: [authGuard],
    component: EditarPerfilComponent,
  },

  {
    path: 'modulos/:id',
    canActivate: [authGuard],
    component: ModuloUnicoComponent,
  },
  {
    path: 'modulo/clonar-ficha-tecnica/:id',
    canActivate: [authGuard],
    component: ClonarFichaTecnicaComponent
  },
  {
    path: 'modulo/topicos',
    canActivate: [authGuard],
    component: TopicosModuloUnicoComponent
  },
  {
    path: 'modulos/:id/gerenciar-ficha-tecnica',
    canActivate: [authGuard],
    component: GerenciarFichaTecnicaComponent,
  },
  {
    path: 'modulos/:id/gerenciar-vantagens',
    canActivate: [authGuard],
    component: GerenciarVantagensComponent,
  },
  {
    path: 'modulos/:id/gerenciar-alunos',
    canActivate: [authGuard],
    component: GerenciarAlunosComponent,
  },
  {
    path: 'modulos/:id/gerenciar-referencias',
    canActivate: [authGuard],
    component: GerenciarReferenciasComponent,
  },
  {
    path: 'editar-topico/:id',
    canActivate: [authGuard],
    component: EditarTopicoComponent,
  },
  {
    path: 'tecnocomp/editar-modulo/:id',
    canActivate: [authGuard],
    component: EditarModuloComponent,
  },
  {
    path: 'cadastrar-topico',
    canActivate: [authGuard],
    component: CadastroTopicoComponent,
  },
  {
    path: 'tecnocomp/editar-usuario/:id',
    canActivate: [authGuard],
    component: EditarUsuarioComponent,
  },
  {
    path: 'ver-ao-vivo',
    canActivate: [authGuard],
    children: [
      { path: ':id_modulo', component: ModuloComponent },
      { path: ':id_modulo/sobre', component: SobreComponent },
      { path: ':id_modulo/ficha-tecnica', component: FichaTecnicaComponent },
      { path: ':id_modulo/topicos', component: TopicoComponent },
      {
        path: ':id_modulo/topicos/referencias',
        component: ReferenciasComponent,
      },
      { path: ':id_modulo/topicos/saiba-mais', component: SaibaMaisComponent },
      { path: ':id_modulo/topicos/slide', component: SlideComponent },
      { path: ':id_modulo/topicos/exercicios', component: AtividadeComponent },
      { path: '**', redirectTo: ':id_modulo' },
    ],
  },
   { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
