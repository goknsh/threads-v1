import { Component, OnInit } from '@angular/core';

@Component({
    styleUrls: ['./home.component.scss'],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    constructor() { }
    
    ngOnInit() {
        document.title = "Home // Threads";
    }
}
