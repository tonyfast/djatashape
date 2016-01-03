d3 = require "d3"
Interactive = require '../interactive'

class Interactive.Compute
  compute: ()->
    ### Compute changes the state of the data tree ###
    console.log 1,
      values: @values()
      index: @index()
      metadata: @metadata()
      columns: @columns()
      readme: @readme()

    @_checkpoint.deepMerge
      values: @values()
      index: @index()
      metadata: @metadata()
      columns: @columns()
      readme: @readme()
    this

  stage: (new_state,expression=null)->
    [update_state, monkeys] = @_split_update_object new_state
    @cursor.deepMerge update_state
    if monkeys.length > 0
      for monkey in monkeys
        @cursor.set monkey.path, monkey.value
    this

  _split_update_object: ( updated_state, path=[], monkeys=[] )->
    ### Prune and set the Baobab monkeys and return only the values compliant with deepMerge ###
    d3.entries updated_state
        .forEach (entry)=>
          if Array.isArray(entry.value)
            ### do nothing ###
          else if typeof(entry.value) in ['object']
            if updated_state[entry.key]['hasDynamicPaths']?
              monkeys.push
                path: [path...,entry.key]
                value: entry.value
              delete updated_state[entry.key]
            else
              @_split_update_object updated_state[entry.key], [path...,entry.key], monkeys
    [updated_state,monkeys]

module.exports = Interactive.Compute
