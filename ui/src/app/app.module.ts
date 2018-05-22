import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { ClarityModule } from '@clr/angular';
import { AppComponent } from './app.component';
import { AuthGuard } from './_auth/index';
import { ROUTING } from "./app.routing";
import { HomeComponent } from "./home/home.component";
import { ApiComponent } from './api/api.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OssComponent } from './oss/oss.component';
import { LogoutComponent } from './logout/logout.component';
import { DomainsComponent } from './domains/domains.component';
import { CommentsComponent } from './comments/comments.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        ApiComponent,
        LoginComponent,
        SignupComponent,
        NotFoundComponent,
        OssComponent,
        LogoutComponent,
        DomainsComponent,
        CommentsComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        ClarityModule,
        ROUTING
    ],
    providers: [
        AuthGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
