var ThrottledRequest = require("../")
,   nock = require("nock")
,   sinon = require("sinon")
,   async = require("async");

describe("ThrottledRequest", function () {
  var clock;

  nock.disableNetConnect();

  function mockTimes (times) {
    //Mock end server
    nock("http://ping.com")
      .filteringPath(/.+/, "/")
      .get("/")
      .times(times)
      .reply(200, "pong");
  };

  beforeEach(function () {
    this.request = chai.spy(require("request"));
    this.throttledRequest = ThrottledRequest(this.request);
  });

  describe("throttling", function () {
    beforeEach(function () {
      clock = sinon.useFakeTimers(Date.now());
    });
    
    afterEach(function() {
      clock.restore();
    });

    it("sends 3 requests every half a second", function (done) {
      var self = this;

      //Configure throttledRequest
      this.throttledRequest.configure({
        requests: 3,
        milliseconds: 500
      });

      //Prepare 7 requests
      var requests = [];
      for (var i = 0; i < 7; i++) {
        requests.push(function (callback) {
          self.throttledRequest({uri: "http://ping.com"}, function (error, response, body) {
            if (error) return done(error);
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal("pong");
            callback();
          });
        });
      };

      //Mock 7 calls to the server
      mockTimes(7);

      //Send 7 requests at the same time
      async.parallel(requests, onEnd);

      expect(this.request).to.have.been.called.exactly(3);

      //After half a second
      clock.tick(500);

      expect(self.request).to.have.been.called.exactly(6);

      //After another half a second      
      clock.tick(500);
      
      //When all requests have finished
      function onEnd (error) {
        if (error) return done(error);
        expect(self.request).to.have.been.called.exactly(7);
        done();
      };
    });
  });


  describe("use cases", function () {
    beforeEach(function () {
      clock = sinon.useFakeTimers(Date.now());

      //Mock 2 calls to the server
      mockTimes(2);

      //Configure throttledRequest
      this.throttledRequest.configure({
        requests: 1,
        milliseconds: 100
      });
    });

    afterEach(function() {
      clock.restore();
    });

    it("allows to use request with callback", function (done) {
      this.throttledRequest("http://ping.com", function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal("pong");
      });
      
      this.throttledRequest({uri: "http://ping.com"}, function (error, response, body) {
        if (error) return done(error);
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal("pong");
        done();
      });

      clock.tick(100);
    });

    it("allows to use request as a stream", function (done) {
      var requestOne = this.throttledRequest({uri: "http://ping.com"})
      ,   requestTwo = this.throttledRequest("http://ping.com")
      ,   dataOne = ""
      ,   dataTwo = "";

      expect(requestOne).to.be.an.instanceOf(require("request").Request);
      expect(requestTwo).to.be.an.instanceOf(require("../lib/request-middleware"));

      requestOne.on("error", function (error) {
        done(error);
      });
      requestOne.on("data", function (data) {
        dataOne += data;
      });
      requestOne.on("end", function () {
        expect(dataOne).to.equal("pong");
      });

      requestTwo.on("error", function (error) {
        done(error);
      });
      requestTwo.on("data", function (data) {
        dataTwo += data;
      });
      requestTwo.on("end", function () {
        expect(dataTwo).to.equal("pong");
        done();
      });
      
      clock.tick(100);
    });
  });

  describe("configurable delay", function() {
    beforeEach(function () {
      clock = sinon.useFakeTimers(Date.now());

      //Mock 2 calls to the server
      mockTimes(3);

      var delay = [1000, 2000, 3000];

      //Configure throttledRequest
      this.throttledRequest.configure({
        requests: 1,
        milliseconds: function() {
          return delay.shift();
        }
      });
    });

    afterEach(function() {
      clock.restore();
    });

    it("allows configurable delay via provided user function", function(done) {
      var self = this;

      var requests = [];
      for (var i = 0; i < 4; i++) {
        requests.push(function (callback) {
          self.throttledRequest({uri: "http://ping.com"}, function (error, response, body) {
            if (error) return done(error);
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal("pong");
            callback();
          });
        });
      };

      //Mock 3 calls to the server
      mockTimes(4);

      //Send 3 requests at the same time
      async.parallel(requests, onEnd);

      expect(this.request).to.have.been.called.exactly(1);

      //After one second
      clock.tick(1000);
      expect(self.request).to.have.been.called.exactly(2);

      //After another two seconds
      clock.tick(2000);
      expect(self.request).to.have.been.called.exactly(3);
      
      //Finally, after another 3 seconds
      clock.tick(3000);
      expect(self.request).to.have.been.called.exactly(4);

      //When all requests have finished
      function onEnd (error) {
        if (error) return done(error);
        expect(self.request).to.have.been.called.exactly(4);
        done();
      };
    });
  });

  describe("handling errors", function () {
    before(function () {
      nock.enableNetConnect("127.0.0.1");
    });

    it("calls callback with error", function (done) {
      this.throttledRequest({
        uri: "http://ping.com",
        proxy: "http://127.0.0.1:5000"
      }, function (error, response, body) {
        expect(error).to.exist;
        done();
      });
    });

    it("emits the 'error' event", function (done) {
      this.throttledRequest({
        uri: "http://ping.com",
        proxy: "http://127.0.0.1:5000"
      }).on("error", function (error) {
        expect(error).to.exist;
        done();
      });
    });
  });
});