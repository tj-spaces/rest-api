
DROP TABLE IF EXISTS `cluster_member_roles`;
CREATE TABLE `cluster_member_roles` (
	`role_id` VARCHAR(36),
	`cluster_id` VARCHAR(36),
	`user_id` VARCHAR(36),

	CONSTRAINT `fk_cluster_member_role__cluster`
		FOREIGN KEY (`cluster_id`)
			REFERENCES `clusters`(`id`)
				ON DELETE CASCADE,
				
	CONSTRAINT `fk_cluster_member_role__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`role_id`, `cluster_id`, `user_id`)
);