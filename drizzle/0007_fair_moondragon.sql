CREATE TABLE `sphere_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sphereId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sphere_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spheres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `spheres_id` PRIMARY KEY(`id`),
	CONSTRAINT `spheres_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `sphere_members` ADD CONSTRAINT `sphere_members_sphereId_spheres_id_fk` FOREIGN KEY (`sphereId`) REFERENCES `spheres`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sphere_members` ADD CONSTRAINT `sphere_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `spheres` ADD CONSTRAINT `spheres_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;