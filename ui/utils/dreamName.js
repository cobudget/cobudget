function capitalize(str) {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
}

export default (org, shouldCapitalize) => {
  const name = "bucket";
  if (shouldCapitalize) return capitalize(name);
  return name;
};
