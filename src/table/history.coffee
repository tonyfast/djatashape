module.exports = class require('./index').History extends require './compute'
  constructor: ->
    @new_major_cursor 'checkpoint', {}
    super()
  history: -> @expression.getHistory()
  clear_history: -> @expression.clearHistory()
  record: (expression)->
    @expression.push expression
