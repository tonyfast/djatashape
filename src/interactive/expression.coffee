History = require './history'

class ExpressionBase extends History

class Expression extends ExpressionBase
  expression: (args)-> @_expression.get args...
  constructor: ->
    @expressions = []
    @_expression = @cursor.select 'expression'
    super()

  execute: (expressions...)->
    expressions.forEach  (expression,expression_count)->
      if expression.method in d3.keys @Expression.prototype
        computed_state = this.Expression[expression.method] expression.args...
      else if expression.method in d3.keys @prototype
        computed_state = this[expression.method] expression.args...
      else
        assert "#{JSON.stringify expressions} is not understood."
      @stage computed_state
      @compute()

  get: (args)-> @cursor.get args...
  set: (args)-> @cursor.set args...

module.exports = Expression
