import type { UserPublic } from "@/api/model";

export function isCurrentAdminUser(
	user: UserPublic,
	currentUserId: string | undefined,
) {
	return currentUserId === user.id;
}

export function isUserInactive(user: UserPublic) {
	return user.is_active !== true;
}

export function canDeleteAdminUser(
	user: UserPublic,
	currentUserId: string | undefined,
) {
	return !isCurrentAdminUser(user, currentUserId);
}

export function getUserRoleLabel(user: UserPublic) {
	return user.is_superuser ? "Superuser" : "User";
}

export function getUserStatusLabel(user: UserPublic) {
	return user.is_active ? "Active" : "Inactive";
}
