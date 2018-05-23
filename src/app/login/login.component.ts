import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

interface response {
  name: string,
  response: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }

  loginDisplay; unverifiedDisplay; errorMsg = "No errors recieved."; errorDisplay = "inactive"; loginstatus = "Login"; verifyDisplay; verifyEmailStatus = "Verifying email..."; lastStepDisplay; sub; version; userStatus = JSON.parse(localStorage.getItem("currentUser"));
  
  ngOnInit() {
    document.title = "Login // Threads";
    if (localStorage.getItem("currentUser") !== null) {
      this.router.navigate(["/comments", "overview"]);
    }
    this.sub = this.route.params.subscribe(params => {
       this.version = params['id'];
        if (this.version === 'unauthorized') {
          document.title = "Login // Threads";
          this.loginDisplay = true;
          this.verifyDisplay = false;
          this.unverifiedDisplay = false;
          this.lastStepDisplay = false;
          this.errorDisplay = "active";
          this.errorMsg = "You don’t have access to that page. Try logging in.";
        } if (this.version === 'loggedout') {
          document.title = "Login // Threads";
          this.loginDisplay = true;
          this.verifyDisplay = false;
          this.unverifiedDisplay = false;
          this.lastStepDisplay = false;
          this.errorDisplay = "active";
          this.errorMsg = "You’ve logged out successfully.";
        } if (this.version === 'new') {
          document.title = "Login // Threads";
          this.loginDisplay = true;
          this.verifyDisplay = false;
          this.unverifiedDisplay = false;
          this.lastStepDisplay = false;
          this.errorDisplay = "inactive";
          this.errorMsg = "No errors recieved.";
        } if (this.version === 'unverified') {
          document.title = "Verify Email // Threads";
          this.loginDisplay = false;
          this.verifyDisplay = false;
          this.unverifiedDisplay = true;
          this.lastStepDisplay = false;
          this.errorDisplay = "inactive";
          this.errorMsg = "No errors recieved.";
        } if (this.version === 'verify') {
          document.title = "Verify Email // Threads";
          this.loginDisplay = false;
          this.verifyDisplay = true;
          this.unverifiedDisplay = false;
          this.lastStepDisplay = false;
          this.errorDisplay = "inactive";
          this.errorMsg = "No errors recieved.";
        } if (this.version.length > 25) {
          document.title = "Verify Email // Threads";
          this.loginDisplay = false;
          this.verifyDisplay = false;
          this.unverifiedDisplay = false;
          this.lastStepDisplay = true;
          this.errorDisplay = "inactive";
          this.errorMsg = "No errors recieved.";
          this.verifyEmail(this.version);
        }
      });
  }
  
  login = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    password: new FormControl('', Validators.compose([Validators.required]))
  });
  
  verifyEmail(credentials) {
    this.loginstatus = "Contacting server...";
    this.http.get<response>(`https://api.threads.ml/v1/?verify=user&email=${credentials.split("[~]")[0]}&hash=${credentials.split("[~]")[1]}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.verifyEmailStatus = "Incorrect hash. Try again later, or email: threads@akaanksh.ga"
        } if (data.response === "success") {
          this.verifyEmailStatus = "Successful. Redirecting you...";
          setTimeout(() => { this.loginstatus = "Login"; this.router.navigate(["/login", "new"]); }, 300);
        } if (data.response === "error") {
          this.verifyEmailStatus = "Something is wrong with the server. Try again later."
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.verifyEmailStatus = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.verifyEmailStatus = "Something is wrong with the server. Try again later.";
        }
      }
    )
  }
  
  loginUser(credentials) {
    this.loginstatus = "Contacting server...";
    this.http.get<response>(`https://api.threads.ml/v1/?login=true&email=${credentials.email}&pass=${credentials.password}`).subscribe(
      data => {
        if (data.response === "mismatch") {
          this.errorMsg = "Incorrect email or password or account does not exist."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        } if (data.response === "success") {
          localStorage.setItem('currentUser', JSON.stringify({ email: credentials.email, name: data.name, pass: credentials.password }));
          this.loginstatus = "Successful. Redirecting you...";
          setTimeout(() => { this.loginstatus = "Login"; this.router.navigate(["/comments", "overview"]); }, 300);
        } if (data.response === "verify") {
          this.loginstatus = "There’s a problem...";
          this.router.navigate(["/login", "unverified"]);
          setTimeout(() => { this.loginstatus = "Login"; this.login.reset(); }, 300);
        }  if (data.response === "error") {
          this.errorMsg = "Something is wrong with the server. Try again later."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsg = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        } else {
          this.errorMsg = "Something is wrong with the server. Try again later."
          this.errorDisplay = "active";
          this.loginstatus = "Login";
        }
      }
    )
  }
}
