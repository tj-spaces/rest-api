CREATE TABLE IF NOT EXISTS `space_invite_links` (
	`id` BIGINT(8),
	`slug` VARCHAR(256), -- The display text of the channel
	`space_id` BIGINT(8),

	
	CONSTRAINT `fk_space_invite_link__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);