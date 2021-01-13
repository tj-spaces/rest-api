CREATE TABLE IF NOT EXISTS `space_member_roles` (
	`role_id` VARCHAR(256),
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

	PRIMARY KEY (`role_id`, `space_id`, `user_id`)
);