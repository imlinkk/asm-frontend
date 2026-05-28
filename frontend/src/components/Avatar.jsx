const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl"
};

const Avatar = ({ user, size = "md" }) => {
  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || "User avatar"}
        className={`${sizes[size]} rounded-full border border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white shadow-sm`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

export default Avatar;
