require ['d3','baobab'], (d3,Baobab)->
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
      sorted = sorted.sort (a,b)=> @multi_sort a,b,direction
      @update_index sorted.map((value)=> value[columns.length]), 
        method: 'sort'
        args: [columns,direction]

    Expressions::unique = (columns)->
      columns = @_column_name_array columns ? @columns()
      previous_index = @index()
      values = @column_data_source columns
      unique_id = values.reduce (p,n,i)->
            unless n in p['values']
              p['values'].push n
              p['id'].push previous_index[i]
            p
        , 
          values: []
          id: []
      @update_index unique_id['id'],
        method: 'unique'
        args: [columns]

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
      @stage
          columns: columns
          column_data_source: cds
          values: d3.merge @values(), monkey_function cursor_columns.map((c)=>@column_data_source c)...,i
        , 
          method: 'transform'
          args: [name, cursor_columns, monkey_function]


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

    Expressions::loc= (index)->
      ###
      data.loc [1,2]
        [[4.,5,'b'],[-3.,11,'b']]
      ###
      @update_index index

    Expressions::iloc= (index)->
      ###
      data.sort('x').iloc [0,1]
        [[-3.,11,'b'],[1.,2,'a']]
      ###
      old_index = @index()
      @update_index index.map((i)=> old_index[i])

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
        checkpoint: -> @_checkpoint.get()
        index: -> @_index.get()

        init: ->
            @_columns = @data.select 'columns'
            @_values = @data.select 'values'
            @_metadata = @data.select 'metadata'
            @_checkpoint = @data.select 'checkpoint'
            @_index = @data.select 'index'
            @_cds = @data.select 'column_data_source'
            @_cds.set {}
            cds = 
              index:
                name: 'index'
                values: Baobab.monkey ['index'], (index)-> index
            columns = Array @columns()...
            columns.forEach (column,column_index)=>
              ### Create Dynamic Nodes for Each Column Data Source ###
              cds[column] =
                name: column
                values: Baobab.monkey ['columns'],['values'],['.','name'], (columns,values,column_name)->
                    column_index = columns.indexOf column_name
                    console.log column_index, values,columns,column_name
                    values.map (row_values)=> row_values[column_index]
            @stage
                column_data_source: cds
              , null


        copy: ->
          ### Copy the current Blaze object and reset the indices ###
          new Blaze
            values: @values()
            columns: @columns()
            metadata: @metadata()

        to_string: (checkpoint=false)->
          columns = if checkpoint then @_checkpoint.get 'columns' else @columns()
          values = if checkpoint then @_checkpoint.get 'values' else @values()
          s = "i,#{columns.toString()}\n"
          values.forEach (line,i)=> s+= "#{@_index.get i},#{line.toString()}\n"
          s

        console: -> console.log @to_string()
        alert: -> alert @to_string()

        split_merge_object: ( merge_data, path=[], monkeys=[] )->
          ### Prune and set the Baobab monkeys and return only the values compliant with deepMerge ###
          d3.entries merge_data
            .forEach (entry)=>
              if Array.isArray(entry.value) 
                ### do nothing ###
              else if typeof(entry.value) in ['object']
                if merge_data[entry.key]['hasDynamicPaths']?
                  monkeys.push 
                    path: [path...,entry.key]
                    value: entry.value
                  delete merge_data[entry.key]                  
                else
                  @split_merge_object merge_data[entry.key], [path...,entry.key], monkeys
          [merge_data,monkeys]
        
        stage: (merge_data, expression=null)->
          ###
          Compute changes the state of the data tree
          ###
          [merge_data,monkeys] = @split_merge_object merge_data
          @data.deepMerge merge_data
          if monkeys.length > 0
            for monkey in monkeys
              @data.set monkey.path, monkey.value
          unless expression? then @compute() else @expressions.push expression
          this
 
        compute: (merge_data, expression=null)->
          ###
          Compute changes the state of the data tree
          ###
          @_expressions.set @expressions.filter((v)->v?).map (v)->
            v['args'] = v['args'].map (v)-> if typeof(v) in ['function'] then v.toString() else v
            v
          @expressions = []          
          @_checkpoint.deepMerge
            values: @values()
            index: @index()
            metadata: @metadata()
            columns: @columns()
                
        update_index: (new_index, expression=null)->
            ###
            Update indices and values
            data.update_index [1,0]
              [[4.,5,'b'],[1.,2,'a']]
            ###
            old_index = @index()
            values = @values()
            @stage
                values: new_index.map (value) -> 
                    values[old_index.indexOf value]
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
      
      expression: -> @_expressions.get()
      history: -> @_expressions.getHistory()
      clear_history: -> @_expressions.clearHistory()

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
        @data = @tree.select 0
        @_checkpoint = @data.select 'checkpoint'
        @_expressions = @data.select 'expressions'
        @_expressions.startRecording 20
        @expressions = []
        @init @_raw
        
      init: (data)->
        if typeof(data) in ['string'] 
          @load data
        else 
          @stage 
              values: data.values
              columns: data.columns
              metadata: data.metadata
              index: d3.range data.values.length
              checkpoint:
                values: data.values
                columns: data.columns
                metadata: data.metadata
            , 
                method: 'init'
                args: [data]
        super()
        
      reset: -> @init @data.get 'checkpoint'
      reset_hard: -> @init @_raw

      clone: -> 
        ### Basically reset the indice and create a new copy ###
        new Blaze
            columns: @columns()
            values: @values()
            metadata: @metadata()
            index: @metadata()
            expressions getHistory()

      load: (url)->
        ### Load data from a url ###
        d3.json url, (table_data)=>
          table_data['raw'] = url
          table_data['index'] = d3.range table_data.length
          @stage table_data, 
            method: 'load'
            args: [url]

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