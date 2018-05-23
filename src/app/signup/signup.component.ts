import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

interface response {
  email: string,
  name: string,
  response: string
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }

  errorMsg = "No errors recieved";
  errorDisplay = "inactive";
  
  ngOnInit() {
    document.title = "Sign up // Threads";
    if (localStorage.getItem("currentUser") !== null) {
      this.router.navigate(["/comments", "overview"]);
    }
  }
  
  signup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
    password: new FormControl('', Validators.required)
  });
  
  signupstatus = "Signup";
  
  signUpUser(credentials) {
    this.signupstatus = "Contacting server...";
    this.http.get<response>(`https://api.threads.ml/v1/?signup=true&name=${credentials.name}&email=${credentials.email}&pass=${credentials.password}`).subscribe(
      data => {
        if (data.response === "exists") {
          this.errorMsg = "An account with that email already exist."
          this.errorDisplay = "active";
          this.signupstatus = "Sign up";
        } if (data.response === "success") {
          this.errorMsg = "You must verify your email."
          this.errorDisplay = "active";
          this.signupstatus = "Sign up";
          this.router.navigate(["/login", "verify"]);
        } if (data.response === "error") {
          this.errorMsg = "Something is wrong with the server. Try again later."
          this.errorDisplay = "active";
          this.signupstatus = "Sign up";
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.errorMsg = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off."
          this.errorDisplay = "active";
          this.signupstatus = "Sign up";
        } else {
          this.errorMsg = "Something is wrong with the server. Try again later."
          this.errorDisplay = "active";
          this.signupstatus = "Sign up";
        }
      }
    )
  }

}
