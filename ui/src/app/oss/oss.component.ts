import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-oss',
  templateUrl: './oss.component.html',
  styleUrls: ['./oss.component.scss']
})
export class OssComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    document.title = "Open Source // Threads";
  }

}
