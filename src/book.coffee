Manager = require './manager'

###
table = new CoffeeTable
table.books.register
###
class Book extends Manager
  _base_class: require './interactive'
  constructor: (data,to_register=[])->
    data ?= {}
    super
      values: data.values ? [[]]
      columns: data.columns ? ['content','publisher']
      metadata: data.metadata ? id:
        description: "The name of a template in an environment."
      readme: "How can I import a readme file"
    to_register.forEach (value)=>
      @register value.name, value.args

module.exports = Book
