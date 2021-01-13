CREATE TABLE IF NOT EXISTS `users` (
	`id` VARCHAR(256),
	`email` VARCHAR(256),
	`verifiedEmail` BOOL,
	`name` VARCHAR(256),
	`givenName` VARCHAR(256),
	`familyName` VARCHAR(256),
	`picture` VARCHAR(1024),
	`locale` VARCHAR(32)
);