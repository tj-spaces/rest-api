import { sub } from "../redis";

export type SubscriberCallback = (message: string) => void;

/**
 * This stores the number of sockets that reference a certain channel.
 * When a socket first subscribes to a channel, its refcount is 1. As
 * more sockets connect, the refcount increases. When a socket disconnects,
 * its refcount decreases by 1. When the refcount reaches 0, we unsubscribe
 * from the channel.
 */
const channelCallbacks: Record<string, Set<SubscriberCallback>> = {};

sub.on("message", (channel, message) => {
  if (channel in channelCallbacks) {
    channelCallbacks[channel].forEach((callback) => {
      callback(message);
    });
  }
});

export async function subscribe(
  channelID: string,
  onMessage: (message: string) => void
): Promise<void> {
  if (!(channelID in channelCallbacks)) {
    channelCallbacks[channelID] = new Set();
    channelCallbacks[channelID].add(onMessage);

    return new Promise<void>((resolve, reject) => {
      sub.subscribe(channelID, (err, reply) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } else {
    channelCallbacks[channelID].add(onMessage);
  }
}

export async function unsubscribe(
  channelID: string,
  onMessage: (message: string) => void
): Promise<void> {
  if (!(channelID in channelCallbacks)) {
    console.error(
      "Invariant: Calling unsubscribe when there is no subscription."
    );
  } else {
    channelCallbacks[channelID].delete(onMessage);

    if (channelCallbacks[channelID].size === 0) {
      // There are no refs left, so we fully unsubscribe
      delete channelCallbacks[channelID];

      return new Promise<void>((resolve, reject) => {
        sub.unsubscribe(channelID, (err, reply) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}
