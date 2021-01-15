CREATE TABLE IF NOT EXISTS `channels` (
	`id` BIGINT(8),
	`name` VARCHAR(256),
	`color` VARCHAR(32),
	`type` ENUM('direct', 'group', 'space'),

	-- Can be NULL
	`space_id` BIGINT(8),

	-- Can be NULL
	`group_id` BIGINT(8),

	-- Can be NULL
	-- These won't have foreign key constraints
	-- This channel won't be deleted until both users are deleted
	`user_a_id` BIGINT(8),
	`user_b_id` BIGINT(8),

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