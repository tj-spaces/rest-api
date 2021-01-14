CREATE TABLE IF NOT EXISTS `space_roles` (
	`id` VARCHAR(256),
	`space_id` VARCHAR(256),
	`name` VARCHAR(256),
	`color` VARCHAR(32),

	CONSTRAINT `fk_space_role_space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`, `space_id`)
);