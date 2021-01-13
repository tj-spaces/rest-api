CREATE TABLE IF NOT EXISTS `space_members` (
	`space_id` VARCHAR(256),
	`user_id` VARCHAR(256),

	CONSTRAINT 
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`space_id`, `user_id`)
);