Tree = require './index' 

class Tree.History extends require './compute'
  constructor: ->
    @new_major_cursor 'checkpoint', {}
    super()
  history: -> @expression.getHistory()
  clear_history: -> @expression.clearHistory()
  record: (expression)->
    @expression.push expression

module.exports = Tree.History
