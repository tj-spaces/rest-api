
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
	`id` VARCHAR(36),
	`space_id` VARCHAR(36),
	`sender_id` VARCHAR(36),
	`content` VARCHAR(4096),
	`sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	-- no default here; if null, it is unedited
	`edited_at` TIMESTAMP,

	-- if a message is unsent, its content will not be sent to the client
	-- however, it can still be used in a report
	`was_unsent` BOOL,

	CONSTRAINT `fk_message__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	-- no foreign key for user, we want the messages to stay even if they delete their account
	-- their name will no longer be associated with it, however

	PRIMARY KEY (`id`)
);