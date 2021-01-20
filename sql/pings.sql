-- A "ping" is a message broadcast to a space. It disappears after five minutes

DROP TABLE IF EXISTS `pings`;
CREATE TABLE `pings` (
	`id` VARCHAR(36),
	`space_id` VARCHAR(36),
	`sender_id` VARCHAR(36),
	`content` VARCHAR(256),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT `fk_ping__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);