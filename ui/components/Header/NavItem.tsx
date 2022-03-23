import Link from "next/link";

const NavItem = ({
  onClick,
  href,
  currentPath = "",
  className,
  children,
  primary,
  roundColor,
  external,
}: any) => {
  const active = currentPath === href;

  const regularClasses = `ring-transparent text-gray-800 hover:bg-gray-300`;
  const primaryClasses = `ring-anthracit hover:bg-anthracit-dark hover:text-gray-200`;
  const regularRoundClasses = `ring-transparent text-white hover:bg-${roundColor}-dark`;
  const primaryRoundClasses = `ring-white text-white hover:bg-white hover:text-${roundColor}`;
  const roundActiveClasses = `ring-transparent bg-${roundColor}-dark text-white`;

  const colorsClasses = roundColor
    ? primary
      ? primaryRoundClasses
      : active
      ? roundActiveClasses
      : regularRoundClasses
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
