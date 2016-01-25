Baobab = try
  require 'baobab'
catch
  try
    require 'Baobab'
  catch
    window.Baobab

d3 = try
  require 'd3'
catch
  window.d3


module.exports = {
  Baobab
  d3
}
