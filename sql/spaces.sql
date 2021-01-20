
DROP TABLE IF EXISTS `spaces`;
CREATE TABLE `spaces` (
	`id` VARCHAR(36),
	`name` VARCHAR(256),
	`color` VARCHAR(32),
	`type` ENUM('group', 'cluster'),

	-- Can be NULL
	`cluster_id` VARCHAR(36),

	-- Can be NULL
	`group_id` VARCHAR(36),

	CONSTRAINT `fk_space__cluster`
		FOREIGN KEY (`cluster_id`)
			REFERENCES `clusters`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT `fk_space__group`
		FOREIGN KEY (`group_id`)
			REFERENCES `groups`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);