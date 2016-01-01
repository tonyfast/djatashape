class CoffeeTable
  add: (them...) -> them.reduce (a, b) -> a + b

module.exports = {
  CoffeeTable
}
