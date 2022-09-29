export default function reportError(error: Error) {
  const { message, stack } = error;
  const hookUrl = process.env.ERROR_REPORTING_WEBHOOK;
  if (hookUrl) {
    const content = JSON.stringify({
      error,
      message,
      stack,
      url: window?.location,
    });

    const fd = new FormData();
    fd.append("content", "APP CRASH NOTIFICATION");
    fd.append(
      "file",
      new Blob([content], { type: "text/plain" }),
      "log-" + Date.now() + ".json"
    );
    fd.append("avatar_url", "https://cobudget.com/favicon.ico");

    fetch(hookUrl, {
      method: "POST",
      body: fd,
    });
  }
}
