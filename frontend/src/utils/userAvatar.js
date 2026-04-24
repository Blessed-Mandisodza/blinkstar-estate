export const getUserAvatarSrc = (user) => user?.avatarUrl || "";

export const getUserInitial = (user) =>
  (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
