import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    
  }

  sub;

  ngOnInit() {
    document.title = "Logout // Threads";
    localStorage.removeItem("currentUser");
    this.router.navigate(["/login", "loggedout"]);
  }

}
