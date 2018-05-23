<?php

ob_start();
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
date_default_timezone_set('UTC');

connect();

function connect() {
    try {
        global $conn; global $env;
        $GLOBALS["env"] = json_decode(file_get_contents(".env.json"), true);
        $GLOBALS["conn"] = new PDO("mysql:host=" . $GLOBALS["env"]["host"] . ";dbname=" . $GLOBALS["env"]["dbname"], $GLOBALS["env"]["username"], $GLOBALS["env"]["pass"]);
        $GLOBALS["conn"]->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        if ($_GET["signup"] === "true") {
            signUp();
        } if ($_GET["login"] === "true") {
            login();
        } if ($_GET["verify"] === "user") {
            verifyUser();
        } if ($_GET["add"] === "domain") {
            addDomain();
        } if ($_GET["verify"] === "domain") {
            verifyDomain();
        } if ($_GET["add"] === "comment") {
            addComment();
        } if ($_GET["add"] === "reply") {
            addReply();
        } if ($_GET["get"] === "comments") {
            getComments();
        } if ($_GET["delete"] === "comment") {
            deleteComment();
        } if ($_GET["edit"] === "comment") {
            editComment();
        } if ($_GET["ui"] === "true") {
            if ($_GET["get"] === "domains") {
                getDomains();
            } if ($_GET["get"] === "uiComments") {
				getCommentsForUI();
			} if ($_GET["get"] === "pages") {
			    getDomainPages();
			}
        } else {
			header("Location: https://threads.ml/api");
		}
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            connect();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage(),
            );
            echo json_encode($response);
            exit;
        }
    }
}

function signUp() {
    try {
        $email = strtolower($_GET['email']);
        $pass = password_hash($_GET["pass"], PASSWORD_BCRYPT, ['salt' => mcrypt_create_iv(22, MCRYPT_DEV_URANDOM)]);
        $name = $_GET["name"];
        $hash = hash('sha512', uniqid());
        
        $GLOBALS['conn']->exec("CREATE TABLE IF NOT EXISTS `$email` (
            `domain` varchar(255) NOT NULL,
            `name` varchar(255) NOT NULL,
            `status` int(255) NOT NULL,
            PRIMARY KEY (`domain`),
            UNIQUE KEY `domain` (`domain`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8;");
        
        // STATUSES: 0-email_verification_pending; 1-domain_verification_pending; 2-active; 3-suspended;
        
        $email_comments = $email . "_comments";
        
        $GLOBALS['conn']->exec("CREATE TABLE IF NOT EXISTS `$email_comments` (
            `id` int NOT NULL AUTO_INCREMENT,
            `url` varchar(255) NOT NULL,
            `thread` varchar(255) NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `id` (`id`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8;");
        
        $GLOBALS['conn']->exec("INSERT INTO `$email`(`domain`, `name`, `status`) VALUES ('$email', '$name;$hash', 0)");
        $GLOBALS['conn']->exec("INSERT INTO `users`(`email`, `pass`, `name`) VALUES ('$email', '$pass', '$name')");
        
        $params = array(
            'api_user' => $GLOBALS["env"]["sendgrid_username"],
            'api_key' => $GLOBALS["env"]["sendgrid_pass"],
            'to' => $_GET["email"],
            'subject' => "Verify your email for Threads",
            'html' => '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Verify your email - Threads</title></head><body><div class="body"><p>Hey ' . $name . ',<br>Lets get your account verified so that you can use Threads. You can do that by clicking the link below. Also, if you didn’t signup, you can ignore this email or go <a href="https://threads.akaanksh.ga/">checkout Threads</a>.</p><p><a href="https://threads.ml/login/' . $email . '%5B~%5D' . $hash . '">Verify Email</a></p></div></body></html>',
            'text' => "Verify your email so we can finish setting up your account.",
            'from' => 'threads@akaanksh.ga',
        );
        
        $ch = curl_init('https://api.sendgrid.com/api/mail.send.json');
        curl_setopt ($ch, CURLOPT_POST, true);
        curl_setopt ($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $sendgridResponse = json_decode(curl_exec($ch), true);
        curl_close($ch);
        
        if ($sendgridResponse["message"] === "success") {
            $response = array(
                'response' => 'success'
            );
    		echo json_encode($response);
            exit;
        } else {
            $sendgridResponse = array(
                'response' => 'error',
                'more' => json_encode($sendgridResponse)
            );
    		echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            signUp();
        } if ((int)$e->getCode() === 23000) {
            $response = array(
                'response' => 'exists'
			);
			echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function login() {
    try {
        $email = strtolower($_GET['email']);
        $pass = $_GET['pass'];
        $dbPass = $GLOBALS['conn']->query("SELECT pass FROM `users` WHERE email='$email'")->fetchColumn();
            
        if ($dbPass === null) {
            $response = array(
                'response' => 'mismatch'
            );
            echo json_encode($response);
            exit;
        } else {
            if (password_verify($pass, $dbPass)) {
                if ((int)$GLOBALS['conn']->query("SELECT status FROM `$email` WHERE domain='$email'")->fetchColumn() !== 2) {
                    $response = array(
                        'response' => 'verify'
                    );
                    echo json_encode($response);
                    exit;
                } else {
                    $response = array(
                        'response' => 'success',
                        'name' => $GLOBALS['conn']->query("SELECT name FROM `users` WHERE email='$email'")->fetchColumn()
                    );
                    echo json_encode($response);
                    exit;
                }
            } else {
                $response = array(
                    'response' => 'mismatch'
                );
                echo json_encode($response);
                exit;
            }
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            login();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function returnLogin() {
    try {
        $email = strtolower($_GET['email']);
        $pass = $_GET['pass'];
        $dbPass = $GLOBALS['conn']->query("SELECT pass FROM `users` WHERE email='$email'")->fetchColumn();
            
        if ($dbPass === null) {
            $response = array(
                'response' => 'mismatch'
            );
            return "mismatch";
            exit;
        } else {
            if (password_verify($pass, $dbPass)) {
                if ((int)$GLOBALS['conn']->query("SELECT status FROM `$email` WHERE domain='$email'")->fetchColumn() !== 2) {
                    return "verify";
                    exit;
                } else {
                    return "success";
                    exit;
                }
            } else {
                return "mismatch";
                exit;
            }
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            returnLogin();
        } else {
            return "error";
            exit;
        }
    }
}

function verifyUser() {
    try {
        $email = strtolower($_GET['email']);
        $hash = $_GET["hash"];
        $dbHash = explode(";", $GLOBALS['conn']->query("SELECT `name` FROM `$email` WHERE domain='$email'")->fetchColumn());
        if ($dbHash[1] === null) {
			$response = array(
				'response' => 'success'
			);
			echo json_encode($response);
			exit;
		} else {
			if ($dbHash[1] === $hash) {
				$GLOBALS['conn']->prepare("UPDATE `$email` SET `name`='$dbHash[0]', `status`=2 WHERE domain='$email'")->execute();
				$response = array(
					'response' => 'success'
				);
				echo json_encode($response);
				exit;
			} else {
				$response = array(
					'response' => 'mismatch'
				);
				echo json_encode($response);
				exit;
			}
		}
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            verifyUser();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function addDomain() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET['pass'];
        $domain = parse_url($_GET["domain"])["host"];
        $name = $_GET["name"];
        $login = returnLogin();
        $hash = hash('sha512', uniqid());
        
        if ($login === "success") {
            $GLOBALS['conn']->exec("INSERT INTO `$email`(`domain`, `name`, `status`) VALUES ('$domain', '$name;$hash', 1)");
            $GLOBALS['conn']->exec("CREATE TABLE IF NOT EXISTS `$domain` (
                `id` int NOT NULL AUTO_INCREMENT,
                `date` timestamp DEFAULT CURRENT_TIMESTAMP,
                `thread` varchar(255) NOT NULL,
                `email` varchar(255) NOT NULL,
                `name` varchar(255) NOT NULL,
                `url` longtext NOT NULL,
                `comment` longtext NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `id` (`id`)
            ) ENGINE=MyISAM DEFAULT CHARSET=utf8;");
            $response = array(
                'response' => 'verify',
                'hash' => $hash
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            addDomain();
        } else if ((int)$e->getCode() === 23000) {
            $response = array(
                'response' => 'exists',
				'hash' => explode(";", $GLOBALS['conn']->query("SELECT `name` FROM `$email` WHERE domain='$domain'")->fetchColumn())[1]
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function verifyDomain() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET['pass'];
        $domain = parse_url($_GET["domain"])["host"];
        $login = returnLogin();
        $dbHash = explode(";", $GLOBALS['conn']->query("SELECT `name` FROM `$email` WHERE domain='$domain'")->fetchColumn());
        
        if ((int)$GLOBALS['conn']->query("SELECT status FROM `$email` WHERE domain='$domain'")->fetchColumn() !== 2) {
            if ($login === "success") {
                foreach (dns_get_record($domain, DNS_TXT)[0]["entries"] as $record) {
                    if ($record === $dbHash[1]) {
                        $hashResult = true;
                        break;
                    }
                }
                if ($hashResult) {
                    $GLOBALS['conn']->prepare("UPDATE `$email` SET `name`='$dbHash[0]', `status`=2 WHERE domain='$domain'")->execute();
                    $GLOBALS['conn']->exec("INSERT INTO `domains`(`domain`, `email`) VALUES ('$domain', '$email')");
                    $response = array(
                        'response' => 'success'
                    );
                    echo json_encode($response);
                    exit;
                } else {
                    $response = array(
                        'response' => 'mismatch'
                    );
                    echo json_encode($response);
                    exit;
                }
            } else {
                $response = array(
                    'response' => 'success'
                );
                echo json_encode($response);
                exit;
            }
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            verifyDomain();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function addComment() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET["pass"];
        $comment = str_replace("'", "\'", urldecode($_GET["comment"]));
        $domain = parse_url($_GET["url"])["host"];
        $url = parse_url($_GET["url"])["path"];
        $login = returnLogin();
        
        if ($login === "success") {
            $name = $GLOBALS['conn']->query("SELECT name FROM `users` WHERE email='$email'")->fetchColumn();
            $dbThreads = $GLOBALS['conn']->query("SELECT thread FROM `$domain` WHERE url='$url'")->fetchAll();
            $thread = array_map('intval', explode(".", $dbThreads[sizeof($dbThreads)-1]["thread"]))[0] + 1 . ".1";
            $date = new \DateTime(); $time = date_format($date, 'Y-m-d H:i:s'); $GLOBALS['conn']->exec("INSERT INTO `$domain`(`date`, `thread`, `email`, `name`, `url`, `comment`) VALUES ('$time', '$thread', '$email', '$name', '$url', '$comment')");
            $email = $email . "_comments"; $domain = $_GET["url"];
            $GLOBALS['conn']->exec("INSERT INTO `$email`(`url`, `thread`) VALUES ('$domain', '$thread')");
            $response = array(
                'response' => 'success',
                'thread' => $thread
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => $login,
                'type' => 'login'
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            addComment();
        } else if ($e->getCode() === "42S02") {
            $response = array(
                'response' => 'verify',
                'type' => 'domain'
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function addReply() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET["pass"];
        $comment = str_replace("'", "\'", urldecode($_GET["comment"]));
        $replyTo = $_GET["thread"];
        $domain = parse_url($_GET["url"])["host"];
        $url = parse_url($_GET["url"])["path"];
        $login = returnLogin();
        
        if ($login === "success") {
            $name = $GLOBALS['conn']->query("SELECT name FROM `users` WHERE email='$email'")->fetchColumn(); $thread;
            $dbThreads = $GLOBALS['conn']->query("SELECT thread FROM `$domain` WHERE url='$url' and thread LIKE '$replyTo%' ORDER BY id ASC")->fetchAll(); $i = 0;
            foreach ($dbThreads as $dbThread) {
                if (strlen($replyTo)+2 < strlen($dbThread["thread"])) {
                    unset($dbThreads[$i]);
                }
                $i++;
            }
            if (sizeof($dbThreads) === 1) {
                $thread = $dbThreads[0]["thread"] . ".1";
            } else {
                $dbThreads = array_map('intval', explode(".", end($dbThreads)["thread"]));
                if (sizeof($dbThreads) === 1) {
                    $thread = implode(".", $dbThreads) . ".1";
                } else {
                    $dbThreads[sizeof($dbThreads)-1] = $dbThreads[sizeof($dbThreads)-1]+1;
                    $thread = implode(".", $dbThreads);
                }
            }
            $date = new \DateTime(); $time = date_format($date, 'Y-m-d H:i:s'); $GLOBALS['conn']->exec("INSERT INTO `$domain`(`date`, `thread`, `email`, `name`, `url`, `comment`) VALUES ('$time', '$thread', '$email', '$name', '$url', '$comment')");
            $email = strtolower($_GET["email"]) . "_comments"; $domain = $_GET["url"];
            $GLOBALS['conn']->exec("INSERT INTO `$email`(`url`, `thread`) VALUES ('$domain', '$thread')");
            $response = array(
                'response' => 'success',
                'thread' => $thread
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => $login,
                'type' => 'login'
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            addReply();
        } else if ($e->getCode() === "42S02") {
            $response = array(
                'response' => 'verify',
                'type' => 'domain'
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function getComments() {
    try {
        $domain = parse_url($_GET["url"])["host"];
        $url = parse_url($_GET["url"])["path"];
        
        $sth = $GLOBALS['conn']->query("SELECT * FROM `$domain` WHERE `url`='$url' ORDER BY thread ASC");
        $response = array(
            'response' => 'success',
            'count' => (int)$GLOBALS['conn']->query("SELECT COUNT(*) FROM `$domain` WHERE `url`='$url'")->fetchColumn(),
            'admin' => $GLOBALS['conn']->query("SELECT email FROM domains WHERE `domain`='$domain'")->fetchColumn()
        );
        while($r = $sth->fetch(PDO::FETCH_ASSOC)) {
            $rows[] = $r;
        }
        if ($rows === null) {
            $response[] = array();
            echo json_encode($response);
            exit;
        } else {
            $response[] = $rows;
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            getComments();
        } else if ($e->getCode() === "42S02") {
            $response = array(
                'response' => 'verify'
            );
            $response[] = array();
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function deleteComment() {
    try {
        $email = $_GET["email"];
        $pass = $_GET["pass"];
        $thread = $_GET["thread"];
        $domain = parse_url($_GET["url"])["host"];
        $url = parse_url($_GET["url"])["path"];
        $mode = $_GET["mode"];
        $login = returnLogin();
        
        if ($login === "success") {
            if ($mode === "user") {
                if ($GLOBALS['conn']->query("SELECT email FROM `$domain` WHERE email='$email' and `thread`='$thread' and `url`='$url'")->fetchColumn() === $email) {
				    $GLOBALS['conn']->prepare("UPDATE `$domain` SET `email`='deleted@domain.tld', `comment`='Comment was deleted.', `name`='Deleted Comment' WHERE email='$email' and `thread`='$thread' and `url`='$url'")->execute();
                    $response = array(
                        'response' => 'success'
                    );
                    echo json_encode($response);
                    exit;
                } else {
                    $response = array(
                        'response' => 'mismatch'
                    );
                    echo json_encode($response);
                    exit;
                }
            } if ($mode === "admin") {
                if ($GLOBALS['conn']->query("SELECT domain FROM `$email` WHERE domain='$domain'")->fetchColumn() === $domain) {
				    $GLOBALS['conn']->prepare("UPDATE `$domain` SET `email`='deleted@domain.tld', `comment`='Comment was deleted by the admin.', `name`='Deleted Comment' WHERE `thread`='$thread' and `url`='$url'")->execute();
                    $response = array(
                        'response' => 'success'
                    );
                    echo json_encode($response);
                    exit;
                } else {
                    $response = array(
                        'response' => 'mismatch'
                    );
                    echo json_encode($response);
                    exit;
                }
            }
            $response = array(
                'response' => 'success',
                'thread' => $thread
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            deleteComment();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function editComment() {
    try {
        $email = $_GET["email"];
        $pass = $_GET["pass"];
        $thread = $_GET["thread"];
        $domain = parse_url($_GET["url"])["host"];
        $comment = str_replace("'", "\'", urldecode($_GET["comment"]));
        $url = parse_url($_GET["url"])["path"];
        $login = returnLogin();
        
        if ($login === "success") {
		    $GLOBALS['conn']->prepare("UPDATE `$domain` SET `comment`='[Edited]<br>$comment' WHERE email='$email' and `thread`='$thread' and `url`='$url'")->execute();
            $response = array(
                'response' => 'success'
            );
            echo json_encode($response);
            exit;
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            editComment();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function getDomains() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET["pass"];
        $login = returnLogin();
        
        if ($login === "success") {
            $sth = $GLOBALS['conn']->query("SELECT * FROM `$email` WHERE `domain` <> '$email'");
            $response = array(
                'response' => 'success'
            );
            while($r = $sth->fetch(PDO::FETCH_ASSOC)) {
				$r["count"] = (int)$GLOBALS['conn']->query("SELECT COUNT(*) FROM `" . $r['domain'] . "`")->fetchColumn();
                $rows[] = $r;
            }
            if ($rows === null) {
                $response[] = array();
                echo json_encode($response);
                exit;
            } else {
                $response[] = $rows;
                echo json_encode($response);
                exit;
            }
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            getDomains();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function getCommentsForUI() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET["pass"];
        $login = returnLogin();
        
        if ($login === "success") {
            $emailComments = $email . "_comments";
            $sth = $GLOBALS['conn']->query("SELECT * FROM `$emailComments`");
            $response = array(
                'response' => 'success',
                'count' => (int)$GLOBALS['conn']->query("SELECT COUNT(*) FROM `$emailComments`")->fetchColumn()
            );
            while($r = $sth->fetch(PDO::FETCH_ASSOC)) {
                $domain = parse_url($r["url"])["host"]; $url = parse_url($r["url"])["path"]; $thread = $r["thread"];
                $beforeRows = array(
                    'data' => $GLOBALS['conn']->query("SELECT * FROM `$domain` WHERE url='$url' and thread='$thread'")->fetch(PDO::FETCH_ASSOC),
                    'domain' => $domain
                );
                $rows[] = $beforeRows;
            }
            if ($rows === null) {
                $response[] = array();
                echo json_encode($response);
                exit;
            } else {
                $response[] = $rows;
                echo json_encode($response);
                exit;
            }
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            getCommentsForUI();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage()
            );
            echo json_encode($response);
            exit;
        }
    }
}

function getDomainPages() {
    try {
        $email = strtolower($_GET["email"]);
        $pass = $_GET["pass"];
        $domain = parse_url($_GET["url"])["host"];
        $login = returnLogin();
        
        if ($login === "success") {
            $pages = array_unique($GLOBALS['conn']->query("SELECT `url` FROM `$domain`")->fetchAll());
            $response = array(
                'response' => 'success'
            );
            foreach ($pages as $page) {
                $page = $page["url"];
                $beforeRows["url"] = $page;
                $beforeRows["count"] = (int)$GLOBALS['conn']->query("SELECT COUNT(*) FROM `$domain` WHERE url='$page'")->fetchColumn();
                $rows[] = $beforeRows;
            }
            if ($rows === null) {
                $response[] = array();
                echo json_encode($response);
                exit;
            } else {
                $response[] = $rows;
                echo json_encode($response);
                exit;
            }
        } else {
            $response = array(
                'response' => $login
            );
            echo json_encode($response);
            exit;
        }
        
    } catch (PDOException $e) {
        if ((int)$e->getCode() === 1203) {
            getDomainPages();
        } else {
            $response = array(
                'response' => 'error',
                'more' => $e->getMessage(),
                'code' => $e->getLine()
            );
            echo json_encode($response);
            exit;
        }
    }
}

?>