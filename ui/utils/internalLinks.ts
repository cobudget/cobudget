import isURL from "validator/lib/isURL";


const { DEPLOY_URL = "localhost:3000" } = process.env;


/** Depending on prod/dev, might return e.g. "https://cobudget.com"
 *
 * Note there's no trailing slash (because there shouldn't be one in the DEPLOY_URL env var)
 */
function appDomain(): string {
  const protocol = process.env.NODE_ENV == "production" ? "https" : "http";
  return `${protocol}://${DEPLOY_URL}`;
}

/** For linking inside the app
 *
 * `path` including leading slash */
export function appLink(path: string): string {
  const url = `${appDomain()}${path}`;
  if (!isURL(url, { host_whitelist: [DEPLOY_URL.split(":")[0]] }))
    throw new Error(`Invalid link: ${url}`);
  return url;
}
