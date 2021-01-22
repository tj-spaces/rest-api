import * as twilio from "twilio";

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const { TWILIO_ACCOUNT_SID, TWILIO_API_SID, TWILIO_API_SECRET } = process.env;

export default function createTwilioGrantJwt(
  userID: string,
  spaceID: string
): string {
  if (TWILIO_ACCOUNT_SID && TWILIO_API_SID && TWILIO_API_SECRET) {
    // create a VideoGrant so they can join the room with Twilio
    const accessToken = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_SID,
      TWILIO_API_SECRET,
      { identity: userID }
    );

    accessToken.addGrant(new VideoGrant({ room: spaceID }));

    return accessToken.toJwt();
  } else {
    throw new Error("Twilio credentials not found");
  }
}
