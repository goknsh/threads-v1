# Threads
Simple Comments API

UI coming soon.

## Self Hosting
To host on your own servers:

1. Clone repo to server.
2. Create `.env.json` with:

    ```json
    {
        "host": "mysql_database_host",
        "dbname": "mysql_database_database_name",
        "username": "mysql_database_username",
        "pass": "mysql_database_password",
        "sendgrid_username": "sendgrid_username",
        "sendgrid_pass": "sendgrid_pass"
    }
    ```
3. Execute this in your database:

    ```sql
    CREATE TABLE IF NOT EXISTS `users` (
        `id` int NOT NULL AUTO_INCREMENT,
        `email` varchar(255) NOT NULL,
        `pass` longtext NOT NULL,
        `name` varchar(255) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `email` (`email`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    
    CREATE TABLE IF NOT EXISTS `domains` (
        `id` int NOT NULL AUTO_INCREMENT,
        `domain` varchar(255) NOT NULL,
        `email` varchar(255) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `domain` (`domain`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    
    CREATE TABLE IF NOT EXISTS `deleted@domain.tld` (
        `domain` varchar(255) NOT NULL,
        `name` varchar(255) NOT NULL,
        `status` int(255) NOT NULL,
        PRIMARY KEY (`domain`),
        UNIQUE KEY `domain` (`domain`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    
    INSERT INTO `deleted@domain.tld`(`domain`, `name`, `status`) VALUES ('deleted@domain.tld', 'Deleted Comment', 2);
    INSERT INTO `users`(`email`, `pass`, `name`) VALUES ('deleted@domain.tld', 'Deleted', 'Deleted Comment');
    ```

## API Usage
No API key required.

### Signup with:
```
https://api.threads.ml/v1/?signup=true&email=example@example.com&pass=example&name=Example User
```
You'll get an email from `threads@akaanksh.ga` to verify your email.

### Verify email with:
```
https://api.akaanksh.ga/threads/api/v1/?verify=user&email=example@example.com&hash=hashFromEmail
```

### Login with:
```
https://api.threads.ml/v1/?login=true&email=example@example.com&pass=example
```

### Add Domain with:
```
https://api.threads.ml/v1/?add=domain&email=example@example.com&pass=example&domain=https://blog.example.com/&name=Blog
```
The returned `hash` field should be the content of a TXT Record for the domain. Ex: `TXT    blog.example.com    hash`

### Verify Domain with:
```
https://api.threads.ml/v1/?verify=domain&email=example@example.com&pass=example&domain=https://blog.example.com/
```

### Add Comment with:
```
https://api.threads.ml/v1/?add=comment&url=https://blog.example.com/post/one&email=example@example.com&pass=example&comment=comment content
```

### Edit Comment with:
```
https://api.threads.ml/v1/?edit=comment&url=https://blog.example.com/post/one&email=example@example.com&pass=example&thread=1.1&comment=comment content
```

### Reply to comment with:
```
https://api.threads.ml/v1/?add=reply&url=https://blog.example.com/post/one&email=example@example.com&pass=example&thread=1.1&comment=reply to comment
```

### Delete Comment/Reply with:
User deletion:
```
https://api.threads.ml/v1/?delete=comment&mode=user&url=https://blog.example.com/post/one&email=example@example.com&pass=example&thread=1.1
```

Admin deletion:
```
https://api.threads.ml/v1/?delete=comment&mode=admin&url=https://blog.example.com/post/one&email=example@example.com&pass=example&thread=1.1
```

### Get comments with:
```
https://api.threads.ml/v1/?get=comments&url=https://blog.example.com/post/one
```

## Adding Threads to your domain
Checkout the [demo](https://threads.ml/cdn/js/v1/demo).

IMPORTANT: FILE EXTENSIONS AFFECT WHICH COMMENTS ARE LOADED. Example: `/path/to/file.html` and `/path/to/file` WILL load different comments!

Add this to your domains:

```html
<head>
    <link rel="stylesheet" href="https://threads.ml/cdn/js/v1/threads.css">
    <script type="text/javascript" src="https://threads.ml/cdn/js/v1/threads.js"></script>
    <!-- YOUR STUFF -->
</head>
<body>
    <!-- YOUR STUFF -->
    
    <div id="thread-comments">
        Loading Threads...
    </div>
    
    <!-- YOUR STUFF -->
</body>
```


## Roadmap
* Finish UI (domain management, account management)
* Likes/Dislikes
* Scalability