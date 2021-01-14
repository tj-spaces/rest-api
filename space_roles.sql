CREATE TABLE IF NOT EXISTS `space_roles` (
	`id` BIGINT(8),
	`space_id` BIGINT(8),
	`name` VARCHAR(256),
	`color` VARCHAR(32),

	CONSTRAINT `fk_space_role__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`, `space_id`)
);