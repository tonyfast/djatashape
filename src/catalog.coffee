Manager = require './manager'

class CatalogBase extends Manager
  _base_class: require './interactive'
  _column_index = 'selector'
class Catalog extends CatalogBase
  constructor: (to_register=[])->
    super
      # Values of the catalog
      values: data.values ? [[]]
      # features in the catalog
      columns: data.columns ? ['selector']
      # augmented column information
      metadata: data.metadata ?
        id:
          description: "The name of an interactive table in the catalog."
      readme: "How can I import a readme file"
    to_register.forEach (value)=>
      @register value.name, value.args

module.exports = {
  Catalog
}
