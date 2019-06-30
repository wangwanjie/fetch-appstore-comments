#throttled-request
Node.js module to easily throttle HTTP requests.

##How it works
This tool was made to work with the popular [request](https://github.com/request/request) module, which simplifies the HTTP requests in Node.js. Therefore, this must be consireded a wrapper around **request**.

First, you instantiate a **throttledRequest** instance by passing a **request** function, which is going to act as the requester - you still need to `$npm install request` independently. - After this you can configure the throttle rate *(number of requests / time)*, then you're able to use **throttled-request** to perform your HTTP requests.

##Installation
Install it using [npm](https://www.npmjs.com/)
```
$ npm install throttled-request
```

##Usage
First, you must set it up:
```javascript
var request = require('request')
,   throttledRequest = require('throttled-request')(request);

throttledRequest.configure({
  requests: 5,
  milliseconds: 1000
});//This will throttle the requests so no more than 5 are made every second
```

Or you may use a configurable throttle by providing a function that returns the next delay, in milliseconds:
```javascript
var request = require('request')
,   throttledRequest = require('throttled-request')(request);

throttledRequest.configure({
  requests: 1,
  milliseconds: function() {
    var minSeconds = 5, maxSeconds = 15;
    return Math.floor((Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000);  // in milliseconds
  }
});//This will throttle the requests so no more than 1 is made every 5 to 15 seconds (random delay)
```

Then you can use `throttledRequest` just as you use [request](https://github.com/request/request): passing a callback, or as a stream.

###Passing a callback
```javascript
throttledRequest(options, function (error, response, body) {
    if (error) {
        //Handle request error
    }
    //Do what you need with `response` and `body`
});
```

###As a stream
```javascript
throttledRequest(options).pipe(someWriteStream);
```

##The `request` event
`throttledRequest` emits a `request` event just after each actual request is made.

##Full example
```javascript
var request = require('request')
,   throttledRequest = require('throttled-request')(request)
,   startedAt = Date.now();

throttledRequest.configure({
  requests: 2,
  milliseconds: 1000
});

throttledRequest.on('request', function () {
  console.log('Making a request. Elapsed time: %d ms', Date.now() - startedAt);
});

//Throttle 10 requests in parallel
for (var i = 0; i < 10; i++) {
  throttledRequest('https://www.google.com/')
    .on('response', function () {
      console.log('Got response. Elapsed time: %d ms', Date.now() - startedAt);
    });
}

/*Output:
Making a request. Elapsed time: 3 ms
Making a request. Elapsed time: 5 ms
Got response. Elapsed time: 488 ms
Got response. Elapsed time: 509 ms
Making a request. Elapsed time: 1002 ms
Making a request. Elapsed time: 1003 ms
Got response. Elapsed time: 1450 ms
Got response. Elapsed time: 1513 ms
Making a request. Elapsed time: 2003 ms
Making a request. Elapsed time: 2003 ms
Got response. Elapsed time: 2431 ms
Got response. Elapsed time: 2470 ms
Making a request. Elapsed time: 3004 ms
Making a request. Elapsed time: 3005 ms
Got response. Elapsed time: 3446 ms
Got response. Elapsed time: 3451 ms
Making a request. Elapsed time: 4007 ms
Making a request. Elapsed time: 4007 ms
Got response. Elapsed time: 4440 ms
Got response. Elapsed time: 4783 ms
*/
```

##Can I use everything that comes with **request**?
No, there's some things you can't use. For example, the shortcut functions `.get`, `.post`, `.put`, etc. are not available. If you'd like to have them, this is a great opportunity to contribute!

##Running tests
Run the tests with npm
```
$ npm test
```

##License (MIT)
