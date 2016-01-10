d3 = require 'd3'

module.exports = (transformers)->
  d3.entries transformers
    .forEach ({key,value})=>
      [cursors...,fn] = value ? []
      if cursors.length == 0  then cursors = null
      smart_cursor = cursors?.map((col)=> if typeof col in ['string'] then ['column_source',col,'values'] else col) ? []
      @_add_derived_column key, smart_cursor, fn
