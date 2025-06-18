import { OAuth2Client } from "google-auth-library";

export const googleVerify = (req, res) => {
  const { token } = req.body;
  console.log(token)
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  (async () => {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
  })();
};
