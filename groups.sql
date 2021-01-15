-- These are different from Spaces: it's a single channel that only a certain group of people is a part of
-- This is why channels aren't directly associated with spaces: so the table can be used for groups as well

CREATE TABLE IF NOT EXISTS `groups` (
	`id` BIGINT(8),
	`name` VARCHAR(256),
	`picture` VARCHAR(1024),

	PRIMARY KEY (`id`)
);