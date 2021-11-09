import Link from "next/link";

const NavItem = ({
  onClick,
  href,
  currentPath = "",
  className,
  children,
  primary,
  eventColor,
  external,
}) => {
  const active = currentPath === href;

  const regularClasses = `ring-transparent text-gray-800 hover:bg-gray-300`;
  const primaryClasses = `ring-anthracit hover:bg-anthracit-dark hover:text-gray-200`;
  const regularEventClasses = `ring-transparent text-white hover:bg-${eventColor}-dark`;
  const primaryEventClasses = `ring-white text-white hover:bg-white hover:text-${eventColor}`;
  const eventActiveClasses = `ring-transparent bg-${eventColor}-dark text-white`;

  const colorsClasses = eventColor
    ? primary
      ? primaryEventClasses
      : active
      ? eventActiveClasses
      : regularEventClasses
    : primary
    ? primaryClasses
    : regularClasses;

  const classes = `my-1 mx-1 px-3 py-1 sm:my-0 block rounded focus:outline-none font-medium transitions-colors transitions-opacity duration-75 ring-2 ring-inset ${colorsClasses} ${className}`;

  if (onClick) {
    return (
      <button className={classes} onClick={onClick}>
        {children}
      </button>
    );
  }
  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href}>
      <a className={classes}>{children}</a>
    </Link>
  );
};

export default NavItem;
