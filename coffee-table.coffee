require ['d3','baobab'], (d3,Baobab)->
    class History
        constructor: ()->
            @_checkpoint = @data.select 'checkpoint'
            @_expression = @data.select 'expressions'
            @_expression.startRecording 20
        expression: -> @_expression.get()
        expressions: []
        history: -> @_expression.getHistory()
        clear_history: -> @_expression.clearHistory()
        record: (expression)->
            @expressions.push expression

    class ColumnExpression extends History
        columns: -> @_columns.get()
        metadata: -> @_metadata.get()
        constructor: ()-> 
            @_columns = @data.select 'columns'
            @_metadata = @data.select 'metadata'
            super()
            
    class RowExpression extends ColumnExpression
        index: -> @_index.get()
        constructor: ()->
            @_index = @data.select 'index'
            super()
            
        update_index: (new_index, expression=null)->
            ###
            Update indices and values
            data.update_index [1,0]
              [[4.,5,'b'],[1.,2,'a']]
            ###
            old_index = @index()
            values = @values()
            @stage
                values: new_index.map (value) -> values[old_index.indexOf value]
                index: new_index
              , expression 

        loc: (index)->
          ###
          data.loc [1,2]
            [[4.,5,'b'],[-3.,11,'b']]
          ###
          @update_index index

        iloc: (index)->
          ###
          data.sort('x').iloc [0,1]
            [[-3.,11,'b'],[1.,2,'a']]
          ###
          old_index = @index()
          @update_index index.map((i)=> old_index[i])
        head: (n)-> @iloc d3.range n
        #tail: (n)-> @iloc d3.range 

    for reduction in 'min,max,sum,mean,median,variance,deviation'.split(',')
      ColumnExpression.prototype[reduction] = (column_data...)->
        column_data.map (column_values)-> d3[reduction] column_values

    class TableExpression extends RowExpression
        values: -> @_values.get()
        constructor: ()-> 
            @_values = @data.select 'values'
            super()
    
    TableExpression::multi_sort = (a,b,direction='ascending',i=0)->
      ### Multisorting function in d3 ###
      [a[i],b[i]] = [parseFloat(a[i]),parseFloat(b[i])]
      if a[i] == b[i] then MultiSort a, b, direction, i+1
      d3[direction] a[i],b[i]

    TableExpression::sort = (columns,direction='ascending')->
      ### Multisort on an  ###
      columns = @_column_name_array columns ? @_columns.get 0
      sorted = d3.zip columns.map((c)=> @column_data_source c)..., @column_data_source 'index'
      sorted = sorted.sort (a,b)=> @multi_sort a,b,direction
      @update_index sorted.map((value)=> value[columns.length]), 
        method: 'sort'
        args: [columns,direction]

    TableExpression::unique = (columns)->
      columns = @_column_name_array columns ? @columns()
      previous_index = @index()
      values = @column_data_source columns, true
      unique_id = values.reduce (p,n,i)->
            unless n in p['values']
              p['values'].push n
              p['id'].push previous_index[i]
            p
        , 
          values: []
          id: []
      alert JSON.stringify unique_id
      @update_index unique_id['id'],
        method: 'unique'
        args: [columns]

    TableExpression::transform = (name, cursor_columns, monkey_function )->
      ###
      data.transform 'mean'
      ###
      cds = {}
      columns = @columns()
      columns.push name
      cds[name] =
        name: name
        values: Baobab.monkey cursor_columns.map((c)=>['..',c,'values'])..., monkey_function
      @stage
          columns: columns
          column_data_source: cds
          values: d3.merge @values(), monkey_function cursor_columns.map((c)=>@column_data_source c)...,i
        , 
          method: 'transform'
          args: [name, cursor_columns, monkey_function]


    TableExpression::filter = (columns, filter_function)->
      ###
      data.filter ['x','z'], (x,z,i)-> x < 2.
          [[1.,2,'a'],[-3.,11,'b']]
      data.filter ['y','z']
          [[2,'a'],[5,'b'],[11,'b']]
      ###
      columns = @_column_name_array columns ? @columns()
      if filter_function?
        selection_index = @column_data_source(Array(columns...,'index'),true)
            .filter (row_values)=>
              filter_function row_values...
            .map (row_values)=> row_values.slice(-1)[0]
          @update_index selection_index,
            method: 'selection'
            args: [columns, filter_function]
      else
        column_index = columns.map (c)=> @columns().indexOf c
        @stage
            columns: columns
            values: @values().map (row_values)=>row_values[col...]
          , 
            method: 'selection'
            args: [columns], 
    TableExpression::order= ()-> @sort('index')

    class ColumnDataSource extends TableExpression
        columns: -> @_columns.get()
        constructor: ->
            @_cds = @data.select 'column_data_source'
            @_columns = @data.select 'columns'
            super()
            
        init: ->
            cds = @_add_column_data_source 'index', {}, Baobab.monkey ['index'], (index)-> index
            columns = Array @columns()...
            columns.forEach (column,column_index)=>
              ### Create Dynamic Nodes for Each Column Data Source ###
              cds = @_add_column_data_source column, cds
            @stage cds
            

        _column_name_array: (columns)-> if not Array.isArray columns then [columns] else columns
        
        _add_column_data_source: (column,tmp={},monkey)->
            unless tmp['column_data_source']?
                tmp['column_data_source'] = {}
            
            monkey ?= Baobab.monkey ['columns'],['values'],['.','name'], (columns,values,column_name)->
                    column_index = columns.indexOf column_name
                    values.map (row_values)=> row_values[column_index]
            tmp['column_data_source'][column] =                
                name: column
                values: monkey
            tmp

        column_data_source: (columns,force_array=false)->
          ###
          data.column_data_source 'x'
            [1.,4.]
          data.column_data_source ['x','z']
            [[1.,'a'],[4.,'b']]
          ###
          columns = @_column_name_array columns

          if columns.length > 1 or force_array
            d3.zip columns.map( (c) => @_cds.get(c,'values') )...
          else
            @_cds.get(columns[0],'values')


    class BlazeBase extends ColumnDataSource
        constructor: ->
            @data = @tree.select 0
            super()
        init: -> super()
        copy: ->
          ### Copy the current Blaze object and reset the indices ###
          new Blaze
            values: @values()
            columns: @columns()
            metadata: @metadata()

        stage: (payload, expression=null)->
          ###Compute changes the state of the data tree###
          [payload,monkeys] = @_split_merge_object payload
          @data.deepMerge payload
          if monkeys.length > 0
            for monkey in monkeys
              @data.set monkey.path, monkey.value
          unless expression? then @compute()  else @record expression
          this
 
        compute: ()->
          ### Compute changes the state of the data tree ###          
          @_checkpoint.deepMerge
            values: @values()
            index: @index()
            metadata: @metadata()
            columns: @columns()
          this
        
        _split_merge_object: ( payload, path=[], monkeys=[] )->
            ### Prune and set the Baobab monkeys and return only the values compliant with deepMerge ###
            d3.entries payload
                .forEach (entry)=>
                  if Array.isArray(entry.value) 
                    ### do nothing ###
                  else if typeof(entry.value) in ['object']
                    if payload[entry.key]['hasDynamicPaths']?
                      monkeys.push 
                        path: [path...,entry.key]
                        value: entry.value
                      delete payload[entry.key]                  
                    else
                      @_split_merge_object payload[entry.key], [path...,entry.key], monkeys
            [payload,monkeys]

    
    class BlazeView extends BlazeBase
        constructor: -> super()
        init: -> super()
        to_string: (checkpoint=false)->
          columns = if checkpoint then @_checkpoint.get 'columns' else @columns()
          values = if checkpoint then @_checkpoint.get 'values' else @values()
          s = "i,#{columns.toString()}\n"
          values.forEach (line,i)=> s+= "#{@_index.get i},#{line.toString()}\n"
          s
        console: -> console.log @to_string()
        alert: -> alert @to_string()        
    class Interactive extends BlazeView
        constructor: -> super()
        init: -> super()

    class Blaze extends BlazeView
      ### Main object ###
      constructor: (@_raw)->
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
        ###
        @tree = new Baobab {}
        super()
        @init()
        
      
      init: ()-> 
            if typeof(@_raw) in ['string'] 
                d3.json data, (table_data)=>
                  table_data['url'] = @_raw
                  @stage
                        raw: table_data                            
                        index: d3.range table_data.length
                    ,
                        method: 'init'
                        args: [data]
                  @compute()
                  super()
            else 
                data = @_raw
                obj =             
                    values: data.values
                    columns: data.columns
                    metadata: data.metadata
                    index: d3.range data.values.length
                    checkpoint:
                        values: data.values
                        columns: data.columns
                        metadata: data.metadata
                @stage obj, 
                        method: 'record'
                        args: [data]
                super()
        
      reset: -> @stage @data.get 'checkpoint'
      reset_hard: -> @init 
        values: @_raw.values
        metadata: @_raw.metadata
        columns: @_raw.columns

      clone: -> 
        ### Basically reset the indice and create a new copy ###
        new Blaze
            columns: @columns()
            values: @values()
            metadata: @metadata()
            index: @metadata()
            expressions: getHistory()

      load: (url)->
        ### Load data from a url ###

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
    ###
    Table.sort('x','descending')
    Table.unique('z').sort('y')
    Table.to_string()
    ###