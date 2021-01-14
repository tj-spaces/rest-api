CREATE TABLE IF NOT EXISTS `spaces` (
	`id` BIGINT(8),
	`creator_id` BIGINT(8), -- References `users`
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