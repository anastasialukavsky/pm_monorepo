export function exclude<
  User extends Record<string, any>,
  Key extends (keyof User)[],
>(user: User, keys: Key): Omit<User, Key[number]> {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key as keyof User)),
  ) as Omit<User, Key[number]>;
}
