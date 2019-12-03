export default function getHostInfo(req) {
  let host, protocol, subdomain;

  host = req.headers["x-forwarded-host"];
  protocol = req.headers["x-forwarded-proto"];

  if (host) {
    const hostParts = host.split(".");
    if (hostParts.length === (host.includes("localhost:") ? 2 : 3)) {
      subdomain = hostParts[0];
    }
  }

  return {
    subdomain,
    host,
    protocol
  };
}
