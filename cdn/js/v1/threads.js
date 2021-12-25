// ThreadsJS v0.8.0-15
// github.com/itsmadebyark/threads
// (c) Akaanksh Raj -- ark.name

const threads = {

    about: function() {
        console.log("ThreadsJS v0.8.0\nhttps://github.com/itsmadebyark/threads\n(c) Akaanksh Raj -- https://akaanksh.ga/\n\nAvailable functions:\nthreads.init();\nthreads.signup();\nthreads.login();\nthreads.addComment();\nthreads.reply(thread);\nthreads.delete(thread, mode);\nthreads.edit(thread);\nthreads.logout();\n\nhttps://threads.ark.black/api");
    },

    init: function() {
        let loggedIn = "threadsNotLoggedIn";
        let user;
        if (window.localStorage.getItem('threadsCurrentUser') !== null) {
            user = JSON.parse(window.localStorage.getItem('threadsCurrentUser'));
            if (user.expires <= Date.now()) {
                window.localStorage.removeItem('threadsCurrentUser');
                loggedIn = "threadsNotLoggedIn";
            }
            else {
                loggedIn = "threadsLoggedIn";
            }
        }
        else {
            user = {};
            user.email = "none";
            user.name = "none";
        }
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                if (response.response === "success") {
                    let mode; let showEdit; let showDelete;
                    if (user.email === response.admin) { mode = "admin" } else { mode = "user" }
                    let html = `<input type="checkbox" id="thread-login-modal-toggle"><input type="checkbox" id="thread-signup-modal-toggle"><div class="header"><h2>Comments &mdash; ${response.count}</h2><div class="${loggedIn}-modal-toogle"><a href="#thread-login-modal"><label for="thread-login-modal-toggle">Login</label></a> // <a href="#thread-signup-modal"><label for="thread-signup-modal-toggle">Signup</label></a> // Powered by <a href="https://threads.ark.black" target="_blank">Threads</a></div><div class="${loggedIn}-user-info">Logged in as ${user.email} (${user.name}) // <a href="#thread-comments" id="thread-logout" onclick="threads.logout()">Logout</a> // Powered by <a href="https://threads.ark.black" target="_blank">Threads</a></div></div><form onsubmit="threads.addComment();return false" action="#" class="addComment ${loggedIn}"><h3>Add Comment</h3><p><textarea placeholder="Comment content" required id="thread-add-comment-textarea"></textarea></p><button id="thread-add-comment-button" type="submit">Add Comment</button><p id="thread-add-comment-message"></p></form><div class="comments">`;
                    let admin; let comments = response[0];
                    comments.forEach(function(comment) {
                        if (response.admin === comment.email) { admin = "admin" } else { admin = "notAdmin" }
                        if (comment.email === user.email) { showEdit = "inline-block"; showDelete = "inline-block" } else { showEdit = "none"; showDelete = "none"; }
                        if (mode === "admin") { showDelete = "inline-block" }
                        html += `<div class="comment comment-${comment.thread.split(".").length} ${admin}" style="padding-left:${comment.thread.split(".").length*.75}rem" id="thread-comment-${comment.thread}"><p class="comment-content">${comment.comment.replace(/\n/g, "<br>")}</p><p class="about">By ${comment.name} <span class="${admin}">Admin</span> on ${new Date(comment.date).toLocaleString()}</p><p class="${loggedIn}-actions actions"><span style="display: ${showEdit}"><a href="#thread-edit" onclick="document.getElementById('thread-edit-${comment.thread}').style.display = 'block'">Edit</a> //</span> <span style="display: ${showDelete}"><a id="thread-delete-${comment.thread}" href="#thread-delete-${comment.thread}" onclick="threads.delete('${comment.thread}', '${mode}')">Delete</a> //</span> <a href="#thread-reply" onclick="document.getElementById('thread-reply-${comment.thread}').style.display = 'block'">Reply</a></p><p id="thread-delete-message-${comment.thread}"></p><div class="reply" id="thread-edit-${comment.thread}"><form onsubmit="threads.edit('${comment.thread}');return false" action="#"><p><label for="thread-edit-textarea-${comment.thread}">Edit Comment to</label><br><textarea required placeholder="Edited comment here" id="thread-edit-textarea-${comment.thread}"></textarea></p><button type="button" id="thread-edit-cancel-button-${comment.thread}" onclick="document.getElementById('thread-edit-${comment.thread}').style.display = 'none'">Cancel</button><button type="submit" id="thread-edit-button-${comment.thread}">Submit Edits</button><p id="thread-edit-message-${comment.thread}"></p></form></div><div class="reply" id="thread-reply-${comment.thread}"><form onsubmit="threads.reply('${comment.thread}');return false" action="#"><p><label for="thread-reply-textarea-${comment.thread}">Reply</label><br><textarea required placeholder="Reply here" id="thread-reply-textarea-${comment.thread}"></textarea></p><button type="button" id="thread-reply-cancel-button-${comment.thread}" onclick="document.getElementById('thread-reply-${comment.thread}').style.display = 'none'">Cancel</button><button type="submit" id="thread-reply-button-${comment.thread}">Reply</button><p id="thread-reply-message-${comment.thread}"></p></form></div></div>`;
                    });
                    html += `</div><div class="modal" id="thread-login-modal"><div class="inner"><div class="content"><div class="header"><div><h2>Login to Threads</h2><span>Lets get you commenting!</span></div><p><label id="thread-login-modal-close" for="thread-login-modal-toggle"><svg version="1.1" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" focusable="false" aria-hidden="true" role="img"><path d="M19.41,18l7.29-7.29a1,1,0,0,0-1.41-1.41L18,16.59,10.71,9.29a1,1,0,0,0-1.41,1.41L16.59,18,9.29,25.29a1,1,0,1,0,1.41,1.41L18,19.41l7.29,7.29a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline clr-i-outline-path-1"></path></svg></label></p></div><form onsubmit="threads.login();return false" action="#"><p><label for="thread-login-email">Email</label><br><input required type="email" id="thread-login-email"></p><p><label for="thread-login-password">Password</label><br><input required type="password" id="thread-login-password"></p><button id="thread-login-button" type="submit">Login</button><p id="thread-login-message"></p></form></div></div></div><div class="modal" id="thread-signup-modal"><div class="inner"><div class="content"><div class="header"><div><h2>Signup for Threads</h2><span>One account, all of Threads</span></div><p><label id="thread-signup-modal-close" for="thread-signup-modal-toggle"><svg version="1.1" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" focusable="false" aria-hidden="true" role="img"><path d="M19.41,18l7.29-7.29a1,1,0,0,0-1.41-1.41L18,16.59,10.71,9.29a1,1,0,0,0-1.41,1.41L16.59,18,9.29,25.29a1,1,0,1,0,1.41,1.41L18,19.41l7.29,7.29a1,1,0,0,0,1.41-1.41Z" class="clr-i-outline clr-i-outline-path-1"></path></svg></label></p></div><form onsubmit="threads.signup();return false" action="#"><p><label for="thread-signup-name">Name</label><br><input required type="text" id="thread-signup-name"></p><p><label for="thread-signup-email">Email</label><br><input required type="email" id="thread-signup-email"></p><p><label for="thread-signup-password">Password</label><br><input required type="password" id="thread-signup-password"></p><button id="thread-signup-button" type="submit">Signup</button><p id="thread-signup-message"></p></form></div></div></div>`;
                    document.querySelector('#thread-comments').innerHTML = html;
                    if (window.location.hash.includes("#thread-comment")) {
                        setTimeout(function() { document.getElementById(window.location.hash.slice(1)).scrollIntoView(true) }, 500);
                    }
                }
                if (response.response === "verify") {
                    let html = `<h3>Could not load <a href="https://threads.ark.black/" target="_blank">Threads</a> because the admin has not finished setting up this domain. Sorry.</h3>`;
                    document.querySelector('#thread-comments').innerHTML = html;
                }
                if (response.response === "error") {
                    let html = `<h3>Could not load <a href="https://threads.ark.black/" target="_blank">Threads</a> because of a server-side error. Sorry.</h3>`;
                    document.querySelector('#thread-comments').innerHTML = html;
                }
            }
        };
        xhttp.open("GET", `https://api-threads.ark.black/v1/?get=comments&url=${window.location.href}`, true);
        xhttp.send();
    },

    signup: function() {
        document.querySelector('#thread-signup-button').innerText = "Contacting server...";
        document.querySelector('#thread-signup-modal-close').style.display = "none";
        document.querySelector('#thread-signup-name').setAttribute('disabled', true);
        document.querySelector('#thread-signup-email').setAttribute('disabled', true);
        document.querySelector('#thread-signup-password').setAttribute('disabled', true);
        document.querySelector('#thread-signup-button').setAttribute('disabled', true);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                document.querySelector('#thread-signup-button').innerText = "Signup";
                document.querySelector('#thread-signup-modal-close').style.display = "block";
                document.querySelector('#thread-signup-name').removeAttribute('disabled');
                document.querySelector('#thread-signup-name').value = null;
                document.querySelector('#thread-signup-email').removeAttribute('disabled');
                document.querySelector('#thread-signup-email').value = null;
                document.querySelector('#thread-signup-password').removeAttribute('disabled');
                document.querySelector('#thread-signup-password').value = null;
                document.querySelector('#thread-signup-button').removeAttribute('disabled');
                if (response.response === "success") {
                    document.querySelector('#thread-signup-message').innerHTML = "You&rsquo;ve signed up successfully. Please check your email to confirm your email and finish signing up.";
                }
                if (response.response === "exists") {
                    document.querySelector('#thread-signup-message').innerHTML = "Looks like you already have an account. Try logging in.";
                }
                if (response.response === "error") {
                    document.querySelector('#thread-signup-message').innerHTML = "Something is wrong with our servers. Try again later.";
                }
                setTimeout(function() { document.querySelector('#thread-signup-message').innerHTML = "" }, 5000);
            }
        };
        xhttp.open("GET", `https://api-threads.ark.black/v1/?signup=true&email=${document.querySelector('#thread-signup-email').value}&pass=${document.querySelector('#thread-signup-password').value}&name=${document.querySelector('#thread-signup-name').value}`, true);
        xhttp.send();
    },

    login: function() {
        document.querySelector('#thread-login-button').innerText = "Contacting server...";
        document.querySelector('#thread-login-modal-close').style.display = "none";
        document.querySelector('#thread-login-email').setAttribute('disabled', true);
        document.querySelector('#thread-login-password').setAttribute('disabled', true);
        document.querySelector('#thread-login-button').setAttribute('disabled', true);
        let email = document.querySelector('#thread-login-email').value;
        let pass = document.querySelector('#thread-login-password').value;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                document.querySelector('#thread-login-button').innerText = "Login";
                document.querySelector('#thread-login-modal-close').style.display = "block";
                document.querySelector('#thread-login-email').removeAttribute('disabled');
                document.querySelector('#thread-login-email').value = null;
                document.querySelector('#thread-login-password').removeAttribute('disabled');
                document.querySelector('#thread-login-password').value = null;
                document.querySelector('#thread-login-button').removeAttribute('disabled');
                document.querySelector('#thread-login-button').value = null;
                if (response.response === "success") {
                    window.localStorage.setItem("threadsCurrentUser", JSON.stringify({ email: email, pass: pass, name: response.name, expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getTime() }))
                    document.querySelector('#thread-login-message').innerHTML = `Logged in successfully. Welcome back, ${response.name}. We&rsquo;ll refresh your comments view ASAP.`;
                    threads.init();
                }
                if (response.response === "mismatch") {
                    document.querySelector('#thread-login-message').innerHTML = "The password or email is incorrect. Try again.";
                }
                if (response.response === "verify") {
                    document.querySelector('#thread-login-message').innerHTML = "You still haven&rsquo;t verified your email. Please login again once you&rsquo;ve verified your email.";
                }
                if (response.response === "error") {
                    document.querySelector('#thread-login-message').innerHTML = "Something is wrong with our servers. Try again later."
                }
                setTimeout(function() { document.querySelector('#thread-login-message').innerHTML = "" }, 5000);
            }
        };
        xhttp.open("GET", `https://api-threads.ark.black/v1/?login=true&email=${email}&pass=${pass}`, true);
        xhttp.send();
    },

    addComment: function() {
        let user = JSON.parse(window.localStorage.getItem('threadsCurrentUser'));
        let comment = encodeURIComponent(document.getElementById(`thread-add-comment-textarea`).value);
        document.getElementById(`thread-add-comment-button`).innerText = "Adding Comment...";
        document.getElementById(`thread-add-comment-textarea`).setAttribute('disabled', true);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                if (response.response === "success") {
                    document.getElementById(`thread-add-comment-button`).innerText = "Add Comment";
                    document.getElementById(`thread-add-comment-message`).innerText = "Commented Successfully. Refreshing...";
                    threads.init();
                }
            }
        }
        xhttp.open("GET", `https://api-threads.ark.black/v1/?add=comment&email=${user.email}&pass=${user.pass}&comment=${comment}&url=${window.location.href}`, true);
        xhttp.send();
    },

    reply: function(thread) {
        let user = JSON.parse(window.localStorage.getItem('threadsCurrentUser'));
        let comment = encodeURIComponent(document.getElementById(`thread-reply-textarea-${thread}`).value);
        document.getElementById(`thread-reply-button-${thread}`).innerText = "Replying...";
        document.getElementById(`thread-reply-cancel-button-${thread}`).setAttribute('disabled', true);
        document.getElementById(`thread-reply-button-${thread}`).setAttribute('disabled', true);
        document.getElementById(`thread-reply-textarea-${thread}`).setAttribute('disabled', true);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                if (response.response === "success") {
                    document.getElementById(`thread-reply-message-${thread}`).innerText = "Replied Successfully. Refreshing...";
                    threads.init();
                }
            }
        }
        xhttp.open("GET", `https://api-threads.ark.black/v1/?add=reply&email=${user.email}&pass=${user.pass}&thread=${thread}&comment=${comment}&url=${window.location.href}`, true);
        xhttp.send();
    },

    delete: function(thread, mode) {
        let user = JSON.parse(window.localStorage.getItem('threadsCurrentUser'));
        document.getElementById(`thread-delete-${thread}`).innerText = "Deleting...";
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                if (response.response === "success") {
                    document.getElementById(`thread-delete-${thread}`).innerText = "Deleted Successfully. Refreshing...";
                    threads.init();
                }
            }
        }
        xhttp.open("GET", `https://api-threads.ark.black/v1/?delete=comment&email=${user.email}&pass=${user.pass}&thread=${thread}&mode=${mode}&url=${window.location.href}`, true);
        xhttp.send();
    },

    edit: function(thread) {
        let user = JSON.parse(window.localStorage.getItem('threadsCurrentUser'));
        let comment = encodeURIComponent(document.getElementById(`thread-edit-textarea-${thread}`).value);
        document.getElementById(`thread-edit-button-${thread}`).innerText = "Editing...";
        document.getElementById(`thread-edit-cancel-button-${thread}`).setAttribute('disabled', true);
        document.getElementById(`thread-edit-button-${thread}`).setAttribute('disabled', true);
        document.getElementById(`thread-edit-textarea-${thread}`).setAttribute('disabled', true);
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhttp.responseText);
                if (response.response === "success") {
                    document.getElementById(`thread-reply-message-${thread}`).innerText = "Edited Successfully. Refreshing...";
                    threads.init();
                }
            }
        }
        xhttp.open("GET", `https://api-threads.ark.black/v1/?edit=comment&email=${user.email}&pass=${user.pass}&thread=${thread}&comment=${comment}&url=${window.location.href}`, true);
        xhttp.send();
    },

    logout: function() {
        document.querySelector('#thread-logout').innerText = "Logging out...";
        window.localStorage.removeItem('threadsCurrentUser');
        threads.init();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    threads.init();
});