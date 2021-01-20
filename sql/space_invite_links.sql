
DROP TABLE IF EXISTS `space_invite_links`;
CREATE TABLE `space_invite_links` (
	`id` VARCHAR(36),
	`slug` VARCHAR(256), -- The display text of the channel
	`space_id` VARCHAR(36),

	
	CONSTRAINT `fk_space_invite_link__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);