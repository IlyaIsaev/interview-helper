CREATE TABLE `published_question` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `published_question` (`id`, `question`, `answer`)
SELECT `question`.`id`, `question`.`question`, `question`.`answer`
FROM `question`
INNER JOIN `user` ON `user`.`id` = `question`.`userId`
WHERE `user`.`email` = 'iaisaev@pm.me';
