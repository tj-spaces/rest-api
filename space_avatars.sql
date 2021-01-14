CREATE TABLE IF NOT EXISTS `space_avatars` (
	`space_id` VARCHAR(256),
	`user_id` VARCHAR(256),

	`nickname` VARCHAR(256),
	`color` VARCHAR(32),

	PRIMARY KEY (`space_id`, `user_id`),

	CONSTRAINT `fk_space_avatar_user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)	
				ON DELETE CASCADE,

	CONSTRAINT `fk_space_avatar_space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE
);
