
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
	`id` VARCHAR(36) PRIMARY KEY,
	`email` VARCHAR(256),
	`verified_email` BOOL,
	`name` VARCHAR(256),
	`given_name` VARCHAR(256),
	`family_name` VARCHAR(256),
	`picture` VARCHAR(1024),
	`locale` VARCHAR(32)
);