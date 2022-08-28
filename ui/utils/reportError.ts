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
    fd.append(
      "avatar_url",
      "https://media3.giphy.com/media/cLqxgg4nke0iu8UpzD/giphy.gif"
    );

    fetch(hookUrl, {
      method: "POST",
      body: fd,
    });
  }
}
