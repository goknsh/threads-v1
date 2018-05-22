import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss']
})
export class DomainsComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
  }

  alertCenterSuccess = false; domainInfoData; currentURL; notFound = false; domain; domainInfoDisp = false; domainInfoEmpty = false; domainInfoLoading = false; alertSuccessText; alertCenterDanger = false; alertDangerText; sub; version; overviewDisp; overviewData; overviewEmpty; overviewLoading = true; addDisp = false; verifyDisp = false; credentials = JSON.parse(localStorage.getItem("currentUser")); errorDisp = false; error; errorDisplay = "inactive"; errorMsg = "No errors received."; addDomainSite; addDomainStatus = "Add Domain"; addDomainHash = null; txtStatus = "Check TXT Record"; errorTXTDisplay = "inactive"; errorTXTMsg = "No errors received.";
  
  ngOnInit() {
    document.title = "Domains // Threads";
    this.sub = this.route.params.subscribe(params => {
      this.version = params['id'];
      if (this.version === 'overview') {
        document.title = "Overview // Domains // Threads";
        this.overviewDisp = true;
        this.addDisp = false;
        this.verifyDisp = false;
        this.domainInfoDisp = false;
        this.notFound = false;
        this.overview();
        return;
      } if (this.version === 'add') {
        document.title = "Add // Domains // Threads";
        this.overviewDisp = false;
        this.addDisp = true;
        this.verifyDisp = false;
        this.domainInfoDisp = false;
        this.notFound = false;
        return;
      } if (this.version === 'verify') {
        if (this.addDomainHash === null) {
          this.router.navigate(["/domains", "add"]);
        } else {
          document.title = "Verify Domain // Domains // Threads";
          this.overviewDisp = false;
          this.addDisp = false;
          this.verifyDisp = true;
          this.domainInfoDisp = false;
          this.notFound = false;
        }
        return;
      } if (this.version.includes(".")) {
          document.title = this.version + " // Domains // Threads";
          this.overviewDisp = false;
          this.addDisp = false;
          this.verifyDisp = false;
          this.domainInfoDisp = true;
          this.domainInfo(this.version);
          this.notFound = false;
          return;
      } else {
          document.title = "All // Domains // Threads";
          this.overviewDisp = false;
          this.addDisp = false;
          this.verifyDisp = false;
          this.domainInfoDisp = false;
          this.notFound = true;
          this.currentURL = this.router.url;
      }
    });
  }
  
  overview() {
    this.overviewLoading = true; this.alertCenterDanger = false;
    this.http.get(`https://api.threads.ml/v1/?ui=true&get=domains&email=${this.credentials.email}&pass=${this.credentials.pass}`).subscribe(
      data => {
        this.errorDisplay = "inactive";
        this.errorMsg = "No errors received.";
        if (data["response"] === "success") {
          this.overviewData = data[0];
          if (this.overviewData.length > 0) {
            this.overviewEmpty = false;
          } else {
            this.overviewEmpty = true;
          }
        } if (data["response"] === "mismatch") {
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
        }
        this.overviewLoading = false;
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
        this.overviewLoading = false;
      }
    )
  }
  
  domainInfo(domain) {
    this.domainInfoLoading = true; this.alertCenterDanger = false;
    this.http.get(`https://api.threads.ml/v1/?ui=true&get=pages&email=${this.credentials.email}&pass=${this.credentials.pass}&url=https://${domain}`).subscribe(
      data => {
        this.domain = domain;
        if (data["response"] === "success") {
          this.domainInfoData = data[0];
          if (this.domainInfoData.length > 0) {
            this.domainInfoEmpty = false;
          } else {
            this.domainInfoEmpty = true;
          }
        } if (data["response"] === "mismatch") {
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
        }
        this.domainInfoLoading = false;
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
        this.domainInfoLoading = false;
      }
    )
    
  }
  
  add = new FormGroup({
    url: new FormControl('', Validators.compose([Validators.required, Validators.pattern("https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)")])),
    name: new FormControl('', Validators.compose([Validators.required]))
  });
  
  addDomain(info) {
    this.addDomainStatus = "Contacting Server...";
    this.http.get(`https://api.threads.ml/v1/?add=domain&email=${this.credentials.email}&pass=${this.credentials.pass}&domain=${info.url}&name=${info.name}`).subscribe(
      data => {
        if (data["response"] === "verify" || data["response"] === "exists") {
          this.addDomainSite = info.url;
          this.addDomainHash = data["hash"];
          this.addDomainStatus = "Successful. Redirecting...";
          setTimeout(() => { this.add.reset(); this.addDomainStatus = "Add Domain"; this.router.navigate(["/domains", "verify"]); }, 300);
        } if (data["response"] === "mismatch") {
          this.errorMsg = "Unauthorized";
          this.errorDisplay = "active";
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
        } if (data["response"] === "error") {
          this.errorMsg = "Something is wrong with the server. Try again later.";
          this.errorDisplay = "active";
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
      }
    )
  }
  
  checkTXTRecord() {
    this.txtStatus = "Contacting Server...";
    this.http.get(`https://api.threads.ml/v1/?verify=domain&email=${this.credentials.email}&pass=${this.credentials.pass}&domain=${this.addDomainSite}`).subscribe(
      data => {
        if (data["response"] === "success") {
          this.txtStatus = "Successful. Redirecting...";
          setTimeout(() => { this.router.navigate(["/domains", this.addDomainSite.replace(/https:\/\//g, "").replace(/http:\/\//g, "")]); this.addDomainSite = null; this.addDomainHash = null; this.txtStatus = "Check TXT Record"; }, 600);
        } if (data["response"] === "mismatch") {
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
          setTimeout(() => { this.errorTXTDisplay = "inactive"; }, 3000);
        } if (data["response"] === "error") {
          this.txtStatus = "Check TXT Record";
          this.errorTXTMsg = "Something is wrong with the server. Try again later.";
          this.errorTXTDisplay = "active";
          setTimeout(() => { this.errorTXTDisplay = "inactive"; }, 3000);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
      }
    )
  }

}
