var Streamer = require('./index');
var streamer = new Streamer({
  twitter: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessTokenKey: process.env.TWITTER_ACCESS_TOKEN_KEY,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  pusher: {
    appId: process.env.PUSHER_APP_ID,
    appKey: process.env.PUSHER_KEY,
    appSecret: process.env.PUSHER_SECRET,
    channelName: 'tweets',
    eventName: 'new-tweet'
  },
});

streamer.stream('javascript', 'ruby', 'python');
