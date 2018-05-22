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

-- CREATE TABLE IF NOT EXISTS `$email` (
--     `domain` varchar(255) NOT NULL,
--     `name` varchar(255) NOT NULL,
--     `status` int(255) NOT NULL,
--     PRIMARY KEY (`domain`),
--     UNIQUE KEY `domain` (`domain`)
-- ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- CREATE TABLE IF NOT EXISTS `$email_comments` (
--     `id` int NOT NULL AUTO_INCREMENT,
--     `url` varchar(255) NOT NULL,
--     `thread` varchar(255) NOT NULL,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `id` (`id`)
-- ) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- CREATE TABLE IF NOT EXISTS `$domain` (
--     `id` int NOT NULL AUTO_INCREMENT,
--     `date` timestamp DEFAULT CURRENT_TIMESTAMP,
--     `thread` varchar(255) NOT NULL,
--     `email` varchar(255) NOT NULL,
--     `name` varchar(255) NOT NULL,
--     `url` longtext NOT NULL,
--     `comment` longtext NOT NULL,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `id` (`id`)
-- ) ENGINE=MyISAM DEFAULT CHARSET=utf8;