
DROP TABLE IF EXISTS `space_roles`;
CREATE TABLE `space_roles` (
	`id` VARCHAR(36),
	`space_id` VARCHAR(36),
	`name` VARCHAR(256),
	`color` VARCHAR(32),

	CONSTRAINT `fk_space_role__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`, `space_id`)
);