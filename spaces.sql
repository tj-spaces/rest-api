CREATE TABLE IF NOT EXISTS `spaces` (
	`id` VARCHAR(256) PRIMARY KEY,
	`creator_id` VARCHAR(256), -- References `users`
	`name` VARCHAR(256),
	`created_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_on` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT `fk_space__creator_id`
		FOREIGN KEY (`creator_id`)
			REFERENCES `users`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);