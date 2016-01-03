### Sorta Real Test

    module.exports = (CoffeeTable) ->
      describe "CoffeeTable...", ->
        table = new CoffeeTable {}
        it "has a Baobab", ->
          table.tree.should.respondTo "serialize"
          table.tree.should.respondTo "select"
