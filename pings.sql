-- A "ping" is a message broadcast to a channel. It disappears after five minutes

CREATE TABLE IF NOT EXISTS `pings` (
	`id` BIGINT(8),
	`channel_id` BIGINT(8),
	`sender_id` BIGINT(8),
	`content` VARCHAR(256),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT `fk_ping__channel`
		FOREIGN KEY (`channel_id`)
			REFERENCES `channels`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);