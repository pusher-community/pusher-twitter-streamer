# Pusher Twitter Streamer

A small tool that takes tweets from the Twitter stream and triggers Pusher events.

## Prerequisites

- a [Twitter application](https://apps.twitter.com/) 
- a [free Pusher account](https://www.pusher.com/signup)

## Usage

```bash
npm install --save pusher-twitter-streamer
```

```js
var Streamer = require('pusher-twitter-streamer');
var streamer = new Streamer({
  twitter: {
    consumerKey: ...,
    consumerSecret: ...,
    accessTokenKey: ...,
    accessTokenSecret: ...
  },
  pusher: {
    appId: '123456',
    appKey: 'abc123',
    appSecret: 'def456',
    channelName: 'tweets',
    eventName: 'new_tweet'
  }
});

streamer.stream('javascript', 'ruby', 'python');
```

## Filtering

Not all tweets that match the filter are sent to Pusher by default, we filter to only include English tweets. Additionally, we only push a subset of the tweet data to the client.

If you'd like to overrride this, you should redefine `Streamer.prototype.publishFilter`. This is expected to return `undefined` if you do not wish to use that tweet, or an object representing the tweet if you do.

## Fake Stream

The Twitter streamer also has a file with ~3000 tweets that it can send to you at the rate of 1 a second, for those times when the internet is failing during your demo. To do this replace the call to `streamer.stream` with `streamer.streamFake()`.
