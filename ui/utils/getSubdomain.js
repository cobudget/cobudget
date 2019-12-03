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
    const hostParts = host.split(".");
    if (hostParts.length === (host.includes("localhost:") ? 2 : 3)) {
      return hostParts[0];
    } else {
      return null;
    }
  }
}
