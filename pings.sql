-- A "ping" is a message broadcast to a channel. It disappears after five minutes

CREATE TABLE IF NOT EXISTS `pings` (
	`id` VARCHAR(36),
	`channel_id` VARCHAR(36),
	`sender_id` VARCHAR(36),
	`content` VARCHAR(256),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT `fk_ping__channel`
		FOREIGN KEY (`channel_id`)
			REFERENCES `channels`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);