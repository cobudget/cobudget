import isURL from "validator/lib/isURL";

/** Depending on prod/dev, might return e.g. "https://cobudget.com"
 *
 * Note there's no trailing slash (because there shouldn't be one in the DEPLOY_URL env var)
 */
function appDomain(): string {
  const protocol = process.env.NODE_ENV == "production" ? "https" : "http";
  return `${protocol}://${process.env.DEPLOY_URL}`;
}

/** For linking inside the app
 *
 * `path` including leading slash */
export function appLink(path: string): string {
  const url = `${appDomain()}${path}`;
  if (!isURL(url, { host_whitelist: [process.env.DEPLOY_URL.split(":")[0]] }))
    throw new Error(`Invalid link: ${url}`);
  return url;
}
