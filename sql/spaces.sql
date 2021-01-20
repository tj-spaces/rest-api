
DROP TABLE IF EXISTS `spaces`;
CREATE TABLE `spaces` (
	`id` VARCHAR(36),
	`creator_id` VARCHAR(36), -- References `users`
	`name` VARCHAR(256),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`visibility` ENUM('public', 'unlisted'),

	CONSTRAINT `fk_space__creator_id`
		FOREIGN KEY (`creator_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);