CREATE TABLE IF NOT EXISTS `space_invite_links` (
	`id` VARCHAR(256),
	`slug` VARCHAR(256), -- The display text of the channel
	`space_id` VARCHAR(256),

	
	CONSTRAINT `fk_space_invite_link_space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);