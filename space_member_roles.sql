CREATE TABLE IF NOT EXISTS `space_member_roles` (
	`role_id` BIGINT(8),
	`space_id` BIGINT(8),
	`user_id` BIGINT(8),

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