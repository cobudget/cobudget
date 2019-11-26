export default function getSubdomain(req) {
  let host;
  let sub;
  if (req && req.headers.host) {
    host = req.headers["x-forwarded-host"] || req.headers.host;
  }
  if (typeof window !== "undefined") {
    host = window.location.host;
  }
  if (host) {
    sub = host.split("localhost:5000")[0];
    if (sub) {
      return sub.split(".")[0];
    }
    // add logic to determine if it is actually a subdomain or not here
  }
}
