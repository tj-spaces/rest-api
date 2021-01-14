-- This denotes a link between a Space and a channel

CREATE TABLE IF NOT EXISTS `space_channels` (
	`channel_id` BIGINT(8),
	`space_id` BIGINT(8),

	CONSTRAINT `fk_space_channel__channel`
		FOREIGN KEY (`channel_id`)
			REFERENCES `channels`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT `fk_space_channel__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`channel_id`, `space_id`)
);