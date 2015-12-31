class Expressions
    _column_name_array: (columns)-> if not Array.isArray columns then [columns] else columns

Expressions::multi_sort = (a,b,direction='ascending',i=0)->
  ### Multisorting function in d3 ###
  [a[i],b[i]] = [parseFloat(a[i]),parseFloat(b[i])]
  if a[i] == b[i] then MultiSort a, b, direction, i+1
  d3[direction] a[i],b[i]

Expressions::sort = (columns,direction='ascending')->
  ### Multisort on an  ###
  columns = @_column_name_array columns ? @_columns.get 0
  sorted = d3.zip columns.map((c)=> @column_data_source c)..., @column_data_source 'index'
      .sort (a,b)=> @multi_sort a,b,direction
  @update_index sorted.map((value)=> value[columns.length]), ['sort',columns, direction]

Expressions::unique = (columns)->
  columns = @_column_name_array columns ? @columns()
  previous_index = @index()
  values = @column_data_source columns
  unique_values = d3.unique values
  @update_index unique_values.map (i)=> previous_index.indexOf i, 1
    , ['unique', columns]

Expressions::transform = (name, cursor_columns, monkey_function )->
  ###
  data.transform 'mean'
  ###
  cds = {}
  columns = @columns()
  columns.push name

  cds[name] =
    name: name
    values: Baobab.monkey cursor_columns.map((c)=>['..',c,'values'])..., monkey_function
  console.log cds
  @compute
      columns: columns
      column_data_source: cds
      values: d3.merge @values(), monkey_function cursor_columns.map((c)=>@column_data_source c)...,i
    , ['transform', name, cursor_column, monkey_function.toString()]


Expressions::selection = (columns, filter_function)->
  ###
  data.selection ['x','z'], (x,z,i)-> x < 2.
      [[1.,2,'a'],[-3.,11,'b']]
  data.selection ['y','z']
      [[2,'a'],[5,'b'],[11,'b']]
  ###
  columns = @_column_name_array columns ? @columns()
  if filter_function?
    selection_index = @column_data_source columns...,'index'
        .filter (row_values)=>
          filter_function row_values...
        .map (row_values)=> row_values.slice(-1)[0]
      @update_index selection_index, ['selection', columns, filter_function.toString()]
  else
    column_index = columns.map (c)=> @columns().indexOf c
    @compute
      columns: columns
      values: @values().map (row_values)=>row_values[col...]

    loc: (index)->
      ###
      data.loc [1,2]
        [[4.,5,'b'],[-3.,11,'b']]
      ###
      @update_index index, ['index_selection']

    iloc: (index)->
      ###
      data.sort('x').iloc [0,1]
        [[-3.,11,'b'],[1.,2,'a']]
      ###
      old_index = @index()
      @update_index index.map((i)=> old_index[i]), ['integer_index_selection']

Expressions::head= (n)-> @iloc d3.range n
Expressions::tail= (n)-> @iloc d3.range
Expressions::order= ()-> @sort('index')

for reduction in 'min,max,sum,mean,median,variance,deviation'.split(',')
  Expressions.prototype[reduction] = (column_data...)->
    column_data.map (column_values)-> d3[reduction] column_values

class BlazeBase extends Expressions
    values: -> @_values.get()
    columns: -> @_columns.get()
    metadata: -> @_metadata.get()
    index: -> @_index.get()

    constructor: ->
        @_columns = @data.select 'columns'
        @_values = @data.select 'values'
        @_metadata = @data.select 'metadata'

        @_index = @data.select 'index'
        @_cds = @data.select 'column_data_source'
        cds = {}
        for column,column_index in @columns()
          ### Create Dynamic Nodes for Each Column Data Source ###
          cds[name] =
            name: name
            values: Baobab.monkey ['columns'],['values'],['.','name'], (columns,values,name)->
                column_index = columns.indexof name
                values.map (row_values)-> row_values[column_index]
        @compute
            column_data_source: cds
          , null

    copy: ->
      ### Copy the current Blaze object and reset the indices ###
      new Blaze
        values: @values()
        columns: @columns()
        metadata: @metadata()

    to_string: ->
      s = "#{@columns().toString()}\n"
      @values().forEach (line)=> s+= "#{line.toString()}\n"

    split_merge_object: ( obj, path=[],clean_obj={} )->
      ### Prune and set the Baobab monkeys and return only the values compliant with deepMerge ###
      d3.entries obj
        .forEach (entry)=>
          if typeof(entry.value) in ['object'] and not Array.isArray entry.value
            if entry.value['hasDynamicPaths']?
              @data.set [path...,d.key], d.value
            else
              @split_merge_object entry.value, [path...,entry.key], clean_obj
          else
            clean_obj[entry.key] = entry.value
      clean_obj

    compute: (merge_data, expression=null)->
      ###
      Compute changes the state of the data tree
      ###
      if expression? then merge_object['expression'] = expression
      @data.deepMerge @split_merge_object merge_data
      this


    update_index: (new_index,expression)->
        ###
        Update indices and values
        data.update_index [1,0]
          [[4.,5,'b'],[1.,2,'a']]
        ###
        expression ?= ['rearrange']
        old_index = @index()
        values = @values()
        @compute
            values: new_index.map (value) => values[old_index.indexOf value, 1]
            index: new_index
          , expression

    column_data_source: (columns)->
      ###
      data.column_data_source 'x'
        [1.,4.]
      data.column_data_source ['x','z']
        [[1.,'a'],[4.,'b']]
      ###
      columns = @_column_name_array columns

      if columns.length > 1
        d3.zip columns.map( (c) => @_cds.get(c,'values') )...
      else
        @_cds.get(columns[0],'values')

class Blaze extends BlazeBase

  expression: -> @_expression.get()
  history: -> @_expression.getHistory()

  constructor: (data=null,url=null)->
    ###
    data = new Blaze http://localhost:8000/dataset/1

    http://localhost:8000/dataset/1 returns json
      values: [[1.,2,'a'],[4.,5,'b'],[-3.,11,'b']]
      columns: ['x','y','z']
      metadata:
        x:
          type: 'float'
        y:
          type: 'int'
        z:
          type: 'string'
    ####
    @tree = new Baobab {}
    @data = @tree.select 0
    @_expression = @data.select 'expression'
    @_expression.startRecording 20
    if url?
      @load url
    else if data?
      data['index'] = d3.range data['values'].length
      @compute data, ['raw']
    super()

  load: (url)->
    ### Load data from a url ###
    d3.json url, (table_data)=>
      table_data['url'] = url
      table_data['index'] = d3.range table_data.length
      @compute table_data, ['load',url]

window.Table = new Blaze
  values: [[1,2,'a'],[4,5,'b'],[-3,11,'b']]
  columns: ['x','y','z']
  metadata:
    x:
      type: 'float'
    y:
      type: 'int'
    z:
      type: 'string'

d3.select '#a'
  .text 'hi'
