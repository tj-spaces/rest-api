
DROP TABLE IF EXISTS `cluster_avatars`;
CREATE TABLE `cluster_avatars` (
	`cluster_id` VARCHAR(36),
	`user_id` VARCHAR(36),

	`nickname` VARCHAR(256),
	`color` VARCHAR(32),

	PRIMARY KEY (`cluster_id`, `user_id`),

	CONSTRAINT `fk_cluster_avatar__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)	
				ON DELETE CASCADE,

	CONSTRAINT `fk_cluster_avatar__cluster`
		FOREIGN KEY (`cluster_id`)
			REFERENCES `clusters`(`id`)
				ON DELETE CASCADE
);
