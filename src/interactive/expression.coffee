Interactive = require './index'
History = require './history'

class Interactive.Expression extends History
  expression: ()-> @_expression.get()
  constructor: ->
    @expressions = []
    @_expression = @cursor.select 'expression'
    @_expression.set []
    super()

  execute: (expressions)->
    expressions.forEach  (expression,expression_count)=>
      @[expression[0]] expression[1..]...
    @compute()

  get: (args...)-> @cursor.get args...
  set: (args...)-> @cursor.set args...

module.exports = Interactive.Expression
