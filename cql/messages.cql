CREATE KEYSPACE IF NOT EXISTS "messages"
WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 };

CREATE TABLE "messages" (
	"id" BIGINT NOT NULL,
	"channel_id" BIGINT,
	"cluster_id" BIGINT,
	"author_id" BIGINT NOT NULL,

	"content" VARCHAR(1023) NOT NULL,
	"sent_at" TIMESTAMP NOT NULL,
	"edited_at" TIMESTAMP,
	"unsent_at" TIMESTAMP,
	"pinned" BOOLEAN NOT NULL,
	"vanishes" BOOLEAN NOT NULL,
	"reply_to_id" BIGINT
);
