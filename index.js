var Twit = require('twit');
var Pusher = require('pusher');
var chalk = require('chalk');
var _ = require('lodash');
var fs = require('fs');

var Streamer = function(config) {
  this.twitterConfig = config.twitter;
  this.pusherConfig = config.pusher;
  this.streamRetryCount = 0;
  this.streamRetryLimit = 10;
  this.streamRetryDelay = 1000;
  this.isRestartingStream = false;
};

Streamer.prototype.log = function(/*keywords*/) {
  var args = Array.prototype.slice.call(arguments);
  console.log.apply(console, [chalk.blue('streamer-debug')].concat(args));
}

Streamer.prototype.streamFake = function(index) {
  this.pusher = this._createPusher();
  var tweets = require('./tweets.json');
  var tweetIndex = index || 0;
  if (tweetIndex < tweets.length) {
    this.processTweet(tweets[tweetIndex]);
    setTimeout(function() {
      this.streamFake(++tweetIndex);
    }.bind(this), 5000);
  }
}

Streamer.prototype.stream = function(/*keywords*/) {
  this.pusher = this._createPusher();

  var keywords = Array.prototype.slice.call(arguments).join(',');
  var twitter = this._createTwitter();
  this.stream = twitter.stream('statuses/filter', { track: keywords });

  this.log('Stream started. Waiting for tweets...');

  this.stream.on('tweet', function (tweet) {
    if (this.streamRetryCount > 0) {
      this.streamRetryCount = 0;
    }

    this.processTweet(tweet);
  }.bind(this));

  this.stream.on("error", function(error) {
    console.log("Error");
    console.log(error);

    setImmediate(this.restartStream.bind(this));
  }.bind(this));

  this.stream.on("disconnect", function(response) {
    this.log('Stream disconnected');
    setImmediate(this.restartStream.bind(this));
  }.bind(this));
}

Streamer.prototype.restartStream = function() {
  if (this.restartingStream) {
    this.log("Aborting stream retry as it is already being restarted");
  }

  this.log("Aborting previous stream");
  if (this.stream) {
    this.stream.stop();
  }

  this.streamRetryCount += 1;
  this.restartingStream = true;

  if (this.streamRetryCount >= this.streamRetryLimit) {
    this.log("Aborting stream retry after too many attempts");
    return;
  }

  setTimeout(function() {
    restartingStream = false;
    this.stream.start();
  }.bind(this), this.streamRetryDelay * (this.streamRetryCount * 2));
};

Streamer.prototype.processTweet = function(tweet) {
  var sendData = this.publishFilter(tweet);
  if (sendData) {
    this.log('Tweet triggered', this.pusherConfig.channelName, this.pusherConfig.eventName);

    this.pusher.trigger(this.pusherConfig.channelName, this.pusherConfig.eventName, sendData);
  }
};

Streamer.prototype.publishFilter = function(tweet) {
  if (!tweet || tweet.lang !== 'en') return;

  return _.pick(tweet, [
    'user', 'geo', 'place', 'id_str', 'created_at', 'timestamp_ms', 'text'
  ]);
}

Streamer.prototype._createPusher = function() {
  if (this._pusherInstance) {
    return this._pusherInstance;
  } else {
    this._pusherInstance = new Pusher({
      appId: this.pusherConfig.appId,
      key: this.pusherConfig.appKey,
      secret: this.pusherConfig.appSecret,
    });

    return this._pusherInstance;
  }
}

Streamer.prototype._createTwitter = function() {
  return new Twit({
    consumer_key: this.twitterConfig.consumerKey,
    consumer_secret: this.twitterConfig.consumerSecret,
    access_token: this.twitterConfig.accessTokenKey,
    access_token_secret: this.twitterConfig.accessTokenSecret
  });
}



module.exports = Streamer;
