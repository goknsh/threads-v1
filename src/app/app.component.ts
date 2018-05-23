import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(private router: Router) {
        router.events.subscribe((val) => {
            if (localStorage.getItem("currentUser")) {
                this.loggedIn = true;
                this.name = JSON.parse(localStorage.getItem("currentUser"))['name']; 
            } else {
                this.loggedIn = false;
                this.name = "Dashboard";
            }
        });
    }
    
    loggedIn; name;
    
    ngOnInit() {
    }
}
