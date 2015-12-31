chai = require "chai"
chai.should()

describe "foo", ->
  foo = "foo"
  it "should be a string", -> foo.should.be.a "string"
