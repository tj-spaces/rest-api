CREATE TABLE IF NOT EXISTS `space_avatars` (
	`space_id` VARCHAR(36),
	`user_id` VARCHAR(36),

	`nickname` VARCHAR(256),
	`color` VARCHAR(32),

	PRIMARY KEY (`space_id`, `user_id`),

	CONSTRAINT `fk_space_avatar__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)	
				ON DELETE CASCADE,

	CONSTRAINT `fk_space_avatar__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE
);
