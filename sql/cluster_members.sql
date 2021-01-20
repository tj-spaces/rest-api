
DROP TABLE IF EXISTS `cluster_members`;
CREATE TABLE `cluster_members` (
	`cluster_id` VARCHAR(36),
	`user_id` VARCHAR(36),

	CONSTRAINT `fk_cluster_member__cluster`
		FOREIGN KEY (`cluster_id`)
			REFERENCES `clusters`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT `fk_cluster_member__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`cluster_id`, `user_id`)
);