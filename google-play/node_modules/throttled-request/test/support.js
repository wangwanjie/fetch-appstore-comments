var chai = require("chai")
,   spies = require("chai-spies");

chai.use(spies);

global.chai = chai;
global.expect = chai.expect;