import handler from "../../../../server/api-handler";
import magicLink from "../../../../server/passport/magicLink";

export default handler().post(async (req: any, res: any) => {
  // const { captchaToken } = req.body;

  // if (!captchaToken) {
  //   res.status(400).send({ error: "No captcha token" });
  //   return;
  // }

  // const captchaVerificationResponse = await fetch(
  //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
  //   {
  //     method: "POST",
  //   }
  // );
  // const captchaVerification = await captchaVerificationResponse.json();

  // if (captchaVerification.success === true) {
    return magicLink.send(req, res);
  // } else {
  //   res.status(400).send({ error: "Invalid captcha token" });
  //   return;
  // }
});
