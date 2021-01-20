
DROP TABLE IF EXISTS `channels`;
CREATE TABLE `channels` (
	`id` VARCHAR(36),
	`name` VARCHAR(256),
	`color` VARCHAR(32),
	`type` ENUM('direct', 'group', 'space'),

	-- Can be NULL
	`space_id` VARCHAR(36),

	-- Can be NULL
	`group_id` VARCHAR(36),

	-- Can be NULL
	-- These won't have foreign key constraints
	-- This channel won't be deleted until both users are deleted
	`user_a_id` VARCHAR(36),
	`user_b_id` VARCHAR(36),

	CONSTRAINT `fk_channel__space`
		FOREIGN KEY (`space_id`)
			REFERENCES `spaces`(`id`)
				ON DELETE CASCADE,

	CONSTRAINT `fk_channel__group`
		FOREIGN KEY (`group_id`)
			REFERENCES `groups`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);