import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { LoginComponent } from './features/auth/login/login';
import { ProfileComponent } from './features/user/profile/profile';
import { OnboardingComponent } from './features/auth/onboarding/onboarding';
import { UserProvisioningComponent } from './features/admin/user-provisioning/user-provisioning';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent }, // Ruta login
      { path: 'perfil', component: ProfileComponent },
      { path: 'onboarding', component: OnboardingComponent },
      { path: 'usuarios', component: UserProvisioningComponent },
    ]
  }
];