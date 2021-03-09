/*
  Copyright (C) Michael Fatemi - All Rights Reserved.
  Unauthorized copying of this file via any medium is strictly prohibited.
  Proprietary and confidential.
  Written by Michael Fatemi <myfatemi04@gmail.com>, February 2021.
*/

/**
 * This is where the typings for our session go.
 */
export interface SessionData {
  accountID: string;
}

declare global {
  namespace Express {
    interface Request {
      session: SessionData;
    }
  }
}
