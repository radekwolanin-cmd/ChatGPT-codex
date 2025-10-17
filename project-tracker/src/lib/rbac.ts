import type { Role } from "@prisma/client";

export type Ability = "read" | "write" | "comment" | "admin";

const roleAbilities: Record<Role, Ability[]> = {
  OWNER: ["admin", "write", "read", "comment"],
  MEMBER: ["write", "read", "comment"],
  GUEST: ["read", "comment"],
};

export function can(role: Role, ability: Ability) {
  return roleAbilities[role]?.includes(ability) ?? false;
}

export function assertCan(role: Role, ability: Ability) {
  if (!can(role, ability)) {
    throw new Error(`Role ${role} lacks ${ability} permission`);
  }
}
