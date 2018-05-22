import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_auth/index';

import { HomeComponent } from './home/home.component';
import { ApiComponent } from './api/api.component';
import { OssComponent } from './oss/oss.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { SignupComponent } from './signup/signup.component';
import { DomainsComponent } from './domains/domains.component';
import { CommentsComponent } from './comments/comments.component';
import { NotFoundComponent } from './not-found/not-found.component';


export const ROUTES: Routes = [
    {path: '', component: HomeComponent},
    {path: 'api', component: ApiComponent},
    {path: 'oss', component: OssComponent},
    {path: 'login', redirectTo: 'login/new', pathMatch: 'full'},
    {path: 'login/:id', component: LoginComponent},
    {path: 'logout', component: LogoutComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'dashboard', redirectTo: 'domains/overview', pathMatch: 'full'},
    {path: 'domains/:id', component: DomainsComponent, canActivate: [AuthGuard]},
    {path: 'comments/:id', component: CommentsComponent, canActivate: [AuthGuard]},
    {path: '404', component: NotFoundComponent},
    {path: '**', component: NotFoundComponent}
];

export const ROUTING: ModuleWithProviders = RouterModule.forRoot(ROUTES);
