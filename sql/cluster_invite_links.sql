
DROP TABLE IF EXISTS `cluster_invite_links`;
CREATE TABLE `cluster_invite_links` (
	`id` VARCHAR(36),
	`slug` VARCHAR(256), -- The display text of the space
	`cluster_id` VARCHAR(36),

	
	CONSTRAINT `fk_cluster_invite_link__cluster`
		FOREIGN KEY (`cluster_id`)
			REFERENCES `clusters`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`)
);