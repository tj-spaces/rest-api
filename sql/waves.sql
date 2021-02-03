DROP TABLE IF EXISTS `waves`;
CREATE TABLE `waves` (
	`id` VARCHAR(36),
	`space_id` VARCHAR(36),
	`sender_id` VARCHAR(36),
	`content` VARCHAR(256),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT `fk_wave__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);