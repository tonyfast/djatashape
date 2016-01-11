Tree = require('./index')

class Tree.Expression extends require './history'
  constructor: ->
    @new_major_cursor 'expression'
    @expression.set []
    @expression.startRecording 20
    super()

  execute: (expressions)->
    expressions.forEach  (expression,expression_count)=>
      @[expression[0]] expression[1..]...
    @compute()

  get: (args...)-> @cursor.get args...
  set: (args...)-> @cursor.set args...

module.exports = Tree.Expression
