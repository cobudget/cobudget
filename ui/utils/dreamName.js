function capitalize(str) {
  const lower = str.toLowerCase();
  return str.charAt(0).toUpperCase() + lower.slice(1);
}

// quick hack to change the word dream to bucket for the cobudget org
export default (org, shouldCapitalize) => {
  const name =
    org?.subdomain === "cobudget" ||
    org?.subdomain === "grassrootsfund" ||
    org?.subdomain === "c3"
      ? "bucket"
      : "dream";
  if (shouldCapitalize) return capitalize(name);
  return name;
};
