import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { LoginComponent } from './features/auth/login/login';
import { ProfileComponent } from './features/user/profile/profile';
import { OnboardingComponent } from './features/auth/onboarding/onboarding';
import { UserProvisioningComponent } from './features/admin/user-provisioning/user-provisioning';
import { authGuard } from './core/guards/auth-guard';
import { EventPublishComponent } from './features/events/event-publish/event-publish';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Ruta por defecto
      { path: '', redirectTo: 'login', pathMatch: 'full'},

      // Ruta pública, cualquiera puede entrar
      { path: 'login', component: LoginComponent }, // Ruta login

      // Rutas privadas, solo entran si tienen token
      { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
      { path: 'usuarios', component: UserProvisioningComponent, canActivate: [authGuard] },
      { path: 'publicar', component: EventPublishComponent, canActivate: [authGuard] },
    ]
  }
];