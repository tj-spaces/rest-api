
DROP TABLE IF EXISTS `cluster_roles`;
CREATE TABLE `cluster_roles` (
	`id` VARCHAR(36),
	`cluster_id` VARCHAR(36),
	`name` VARCHAR(256),
	`color` VARCHAR(32),

	CONSTRAINT `fk_cluster_role__cluster`
		FOREIGN KEY (`cluster_id`)
			REFERENCES `clusters`(`id`)
				ON DELETE CASCADE,

	PRIMARY KEY (`id`, `cluster_id`)
);