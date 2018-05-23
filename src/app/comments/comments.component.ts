import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.version = params['id'];
      if (this.version === 'overview') {
        document.title = "All // Comments // Threads";
        this.commentsDisp = true;
        this.notFound = false;
        this.comments();
        return;
      } else {
        document.title = "404 Not Found // Comments // Threads";
        this.commentsDisp = false;
        this.notFound = true;
        this.currentURL = this.router.url;
      }
    });
  }
  
  version; sub; commentsDisp; currentURL; notFound; alertCenterSuccess = false; alertSuccessText; alertCenterDanger = false; alertDangerText; commentData; commentDates; commentNumber = 0; commentEmpty = false; commentDeleted; commentLoading = true; error = "No errors received."; errorDisp = false; credentials = JSON.parse(localStorage.getItem("currentUser")); editPencilModal = false; deleteCommentModal = false; commentContentForModal = "Waiting"; commentDateForModal = "waiting"; commentURLForModal = "threads.ml";
  
  comments() {
    this.commentLoading = true; this.alertCenterDanger = false;
    this.http.get(`https://api.threads.ml/v1/?ui=true&get=uiComments&email=${this.credentials.email}&pass=${this.credentials.pass}`).subscribe(
      data => {
        if (data["response"] === "success") {
          this.commentData = data[0].reverse();
          if (this.commentData.length > 0) {
            this.commentEmpty = false;
          } else {
            this.commentEmpty = true;
          }
          this.commentDates = new Array(); this.commentDeleted = new Array();
          for (let item of data[0]) {
            this.commentDates.push(new Date(item["data"]["date"] + " GMT").toLocaleString());
            if (item["data"]["email"] === "deleted@domain.tld") {
              this.commentDeleted.push(true);
            } else {
              this.commentDeleted.push(false);
            }
          }
          this.commentLoading = false;
        } if (data["response"]["mismatch"]) {
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
        this.commentLoading = false;
      }
    )
  }

  editComment(i) {
    this.editPencilModal = true; this.commentNumber = i;
    this.commentContentForModal = this.commentData[i]["data"]["comment"];
    this.commentURLForModal = this.commentData[i]['domain'] + this.commentData[i]['data']['url'] + "#thread-comment-" + this.commentData[i]['data']['thread'];
  }
  
  editForm = new FormGroup({
    editTo: new FormControl('', Validators.compose([Validators.required]))
  });
  
  confirmEdit(i, form) {
    this.http.get(`https://api.threads.ml/v1/?edit=comment&email=${this.credentials.email}&pass=${this.credentials.pass}&thread=${this.commentData[i]['data']['thread']}&comment=${form.editTo}&url=https://${this.commentURLForModal}`).subscribe(
      data => {
        if (data["response"] === "success") {
          this.editPencilModal = false;
          this.alertSuccessText = "Comment was edited."; this.alertCenterSuccess = true; this.editForm.reset(); console.log(form.editTo);
          setTimeout(() => { this.alertCenterSuccess = false; }, 5000);
          this.comments();
        } if (data["response"] === "mismatch") {
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
        this.commentLoading = false;
      }
    )
  }
  
  deleteComment(i) {
    this.deleteCommentModal = true; this.commentNumber = i;
    this.commentContentForModal = this.commentData[i]["data"]["comment"];
    this.commentDateForModal = this.commentDates[i];
    this.commentURLForModal = this.commentData[i]['domain'] + this.commentData[i]['data']['url'] + "#thread-comment-" + this.commentData[i]['data']['thread'];
  }
  
  confirmDelete(i) {
    this.http.get(`https://api.threads.ml/v1/?delete=comment&mode=user&email=${this.credentials.email}&pass=${this.credentials.pass}&thread=${this.commentData[i]['data']['thread']}&url=https://${this.commentURLForModal}`).subscribe(
      data => {
        if (data["response"] === "success") {
          this.deleteCommentModal = false;
          this.alertSuccessText = "Comment was deleted."; this.alertCenterSuccess = true;
          setTimeout(() => { this.alertCenterSuccess = false; }, 5000);
          this.comments();
        } if (data["response"] === "mismatch") {
          localStorage.removeItem('currentUser');
          this.router.navigate(["/login", "unauthorized"]);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong on your side. Are you online? If you have a AdBlocker, try turning it off.";
        } else {
          this.alertCenterDanger = true; this.alertDangerText = "Something is wrong with the server. Try again later.";
        }
        this.commentLoading = false;
      }
    )
  }
}
