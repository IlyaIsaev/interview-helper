DELETE FROM `session` WHERE `userId` IN (SELECT `id` FROM `user` WHERE `email` LIKE 'demo-user-%@demo.com');
--> statement-breakpoint
DELETE FROM `account` WHERE `userId` IN (SELECT `id` FROM `user` WHERE `email` LIKE 'demo-user-%@demo.com');
--> statement-breakpoint
DELETE FROM `question` WHERE `userId` IN (SELECT `id` FROM `user` WHERE `email` LIKE 'demo-user-%@demo.com');
--> statement-breakpoint
DELETE FROM `user` WHERE `email` LIKE 'demo-user-%@demo.com';
