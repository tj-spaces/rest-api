-- Connections between groups and group members

DROP TABLE IF EXISTS `group_members`;
CREATE TABLE `group_members` (
	`user_id` VARCHAR(36),
	`group_id` VARCHAR(36),
	`user_type` ENUM('member', 'admin') DEFAULT 'member',

	CONSTRAINT `fk_group_member__user`
		FOREIGN KEY (`user_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT `fk_group_member__group`
		FOREIGN KEY (`group_id`)
			REFERENCES `groups`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`user_id`, `group_id`)
);