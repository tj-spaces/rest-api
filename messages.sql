CREATE TABLE IF NOT EXISTS `messages` (
	`id` BIGINT(8),
	`channel_id` BIGINT(8),
	`sender_id` BIGINT(8),
	`content` VARCHAR(4096),
	`sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	-- no default here; if null, it is unedited
	`edited_at` TIMESTAMP,

	-- if a message is unsent, its content will not be sent to the client
	-- however, it can still be used in a report
	`was_unsent` BOOL,

	CONSTRAINT `fk_message__channel`
		FOREIGN KEY (`channel_id`)
			REFERENCES `channels`(`id`)
				ON DELETE CASCADE,

	-- no foreign key for user, we want the messages to stay even if they delete their account
	-- their name will no longer be associated with it, however

	PRIMARY KEY (`id`)
);