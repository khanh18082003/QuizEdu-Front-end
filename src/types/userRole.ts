// Role options
export const UserRole = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
