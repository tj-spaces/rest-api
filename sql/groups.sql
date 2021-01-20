-- These are different from Clusters: it's a single space that only a certain group of people is a part of
-- This is why spaces aren't directly associated with clusters: so the table can be used for groups as well

DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
	`id` VARCHAR(36),
	`name` VARCHAR(256),
	`picture` VARCHAR(1024),

	PRIMARY KEY (`id`)
);