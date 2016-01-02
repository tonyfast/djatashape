Compute = require './compute'

class History extends Compute
  constructor: ->
    @_checkpoint = @cursor.select 'checkpoint'
    @_expression.startRecording 20
    super()
  history: -> @_expression.getHistory()
  clear_history: -> @_expression.clearHistory()
  record: (expression)->
      @expressions.push expression

module.exports = { History }
