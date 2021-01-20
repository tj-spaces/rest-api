CREATE TABLE IF NOT EXISTS `space_members` (
	`space_id` VARCHAR(36),
	`user_id` VARCHAR(36),

	CONSTRAINT `fk_space_member__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT `fk_space_member__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`space_id`, `user_id`)
);