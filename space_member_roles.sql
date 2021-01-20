CREATE TABLE IF NOT EXISTS `space_member_roles` (
	`role_id` VARCHAR(36),
	`space_id` VARCHAR(36),
	`user_id` VARCHAR(36),

	CONSTRAINT `fk_space_member_role__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,
				
	CONSTRAINT `fk_space_member_role__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`role_id`, `space_id`, `user_id`)
);