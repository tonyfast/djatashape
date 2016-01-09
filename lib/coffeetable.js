(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Baobab, d3;

Baobab = require("baobab");

d3 = require("d3");


/*
interactive tabular data, optimized for the browser

@example Create a new interactive CoffeeTable
  table = new CoffeeTable
    name: "Polygon"
    readme: "A rectangle"
    metadata: {x:'horizontal direction',y:'vertical direction'}
    columns: ['x', 'y']
    values: [[1, 3],[2, 8],[3,13]]

@example Add a column of data with Concat
  table.concat
    columns:
      z: [5, 4, 3]

@example Add two rows of data with Concat
  table.concat
    values: [
      [4, 18, 2]
      [5, 23, 1]
    ]

@example Add a new column that is a function of existing columns x and y
  table.transform
    t: 'x', 'y', (x, y)->
      d3.zip(x, y).map (v)-> Math.tan v[1]/ v[0]

@example Make a checkpoint or store the current state of the columns and values to reuse later.
  table.compute()

@example Create a new copy with the x and angle columns
  vectors = table.projection 'x','t'
    .copy()

The state of the table  is still the project of x and t.

@example Revert the table back to the last checkpoint.
  table.rewind()

Now the table has for columns

  alert table.name() + ' has ' + table.index().length + ' row  and the fields: ' + table.columns().join(', ')[..-2]

@example Add a categorical columns
  table.transform
      'color': 'y', (y)-> y.map (v)-> ['red','green','blue'][v %% 10]
    .compute()


@example Separate the red and the greens.
  green = table.filter 'color', (color)-> color in ['green']
    .copy()
  red = table.rewind().filter 'color', (color)-> color in ['red']
    .copy()

Separating compute from the values.

CoffeeTable stores a history of the transformations

@example Show Table Expression history
  table.history()
  table.expression()

in the next example an expression is created on the green the table and its
expressions are applied to the red table.  Methods are chainable.

@example Apply expressions to green then use the expressions on red
  green.sort 'x'
    .unique()
    .transform
      prod: 'x', 'y', (x,y)-> d3.zip(x,y).map (v)-> v[1]*v[0]

  red.evaluate green.history()


> Non-column/other cursor content is an array.
 */

window.CoffeeTable = (function() {
  function CoffeeTable(url) {
    this.url = url;
    d3.json(this.url, function(d) {
      return CoffeeTable.__super__.constructor.call(this, d);
    });
  }

  CoffeeTable.prototype.version = '0.1.0';

  return CoffeeTable;

})();

CoffeeTable.Interactive = require('./interactive');

CoffeeTable.InteractiveGraph = require('./interactive');

window.table = new CoffeeTable.Interactive({
  columns: ['x', 'y'],
  values: [[1, 2], [3, 8], [-1, 4], [5, 7]]
});

window.square = new CoffeeTable.Interactive({
  columns: ['x', 'y'],
  values: [[1, 1], [7, 7]]
});

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./interactive":8,"baobab":"baobab","d3":"d3"}],2:[function(require,module,exports){
var Baobab, DataSource, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

d3 = require('d3');

Baobab = require("baobab");

Interactive = require('./index');

DataSource = require('./data');

Interactive.ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource(values, columns) {
    this._cds = this.cursor.select('column_data_source');
    ColumnDataSource.__super__.constructor.call(this, values, columns);
    columns.map((function(_this) {
      return function(column_name) {
        return _this.apply(column_name);
      };
    })(this));
  }


  /* Create a new interactive data source
  table.apply 'mean', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
  table.projection()
   */

  ColumnDataSource.prototype.apply = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return this._add_derived_column.apply(this, args);
  };


  /*
  Create a new interactive cursor that defines a new Column Data Source
   */

  ColumnDataSource.prototype._add_derived_column = function(name, cursors, fn) {
    if (cursors == null) {
      cursors = [['columns', 0], ['values'], ['.', 'name']];
    }
    if (fn == null) {
      fn = function(columns, values, column_name) {
        var column_index;
        column_index = columns.indexOf(column_name);
        return values.map(function(row_values) {
          return row_values[column_index];
        });
      };
    }
    this._cds.set(name, {
      name: name,
      values: Baobab.monkey.apply(Baobab, slice.call(cursors).concat([fn]))
    });

    /* Always push derived columns to second part of columns */
    if (indexOf.call(['index'].concat(slice.call(this.derived())), name) < 0) {
      return this._columns.select(1).push(name);
    }
  };


  /* Append columns or rows without monkeys */

  ColumnDataSource.prototype.concat = function(arg) {
    var columns, values;
    columns = arg.columns, values = arg.values;
    if (columns != null) {
      d3.entries(columns).forEach((function(_this) {
        return function(arg1) {
          var key, value;
          key = arg1.key, value = arg1.value;

          /* Append the value to the raw columns */
          _this._columns.select(0).push(key);
          _this._values.set(_this.values().map(function(row, i) {
            return slice.call(row).concat([value[i]]);
          }));
          return _this._add_derived_column(key);
        };
      })(this));
    }
    return ColumnDataSource.__super__.concat.call(this, values);
  };

  ColumnDataSource.prototype.column_data_source = function() {
    var columns;
    columns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (columns.length === 0) {
      columns = this.derived();
    }
    return d3.zip.apply(d3, columns.map((function(_this) {
      return function(c) {
        return _this._cds.get(c, 'values');
      };
    })(this)));
  };

  return ColumnDataSource;

})(DataSource);

module.exports = Interactive.ColumnDataSource;


},{"./data":5,"./index":8,"baobab":"baobab","d3":"d3"}],3:[function(require,module,exports){
var Expression, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('d3');

Interactive = require('./index');

Expression = require('./expression');

Interactive.Column = (function(superClass) {
  extend(Column, superClass);

  Column.prototype.columns = function() {
    return d3.merge(this._columns.get());
  };

  Column.prototype.raw = function() {
    return this._columns.get(0);
  };

  Column.prototype.derived = function() {
    return this._columns.get(1);
  };

  function Column(columns) {
    var ref;
    this._columns = this.cursor.select('columns');
    this._columns.set((ref = [columns, []]) != null ? ref : [[], []]);

    /* update the values when the raw_columns change
    @_columns.select(1).on 'update', (event)=>
      [event.data.previousData...].filter (d)=> not d in event.data.currentData
        .forEach (column_name)-> @_cds[column_name].release()
     */
    Column.__super__.constructor.call(this);
  }

  return Column;

})(Expression);

module.exports = Interactive.Column;


},{"./expression":6,"./index":8,"d3":"d3"}],4:[function(require,module,exports){
var Interactive, d3;

d3 = require("d3");

Interactive = require('./index');

Interactive.Compute = (function() {
  function Compute() {}

  Compute.prototype.compute = function() {

    /* Compute changes the state of the data tree */
    this._checkpoint.deepMerge({
      name: this.name(),
      index: this.index(),
      readme: this.readme(),
      values: this.column_data_source(),
      metadata: this.metadata(),
      columns: [this.derived(), this.derived()]
    });

    /* TODO Remove old columns */
    return this;
  };

  Compute.prototype.rewind = function() {
    this.cursor.deepMerge({
      index: this._checkpoint.get('index'),
      columns: this._checkpoint.get('columns'),
      values: this._checkpoint.get('values'),
      metadata: this._checkpoint.get('metadata')
    });
    this._columns.select(0).set(this._checkpoint.get('columns'));
    return this;
  };

  return Compute;

})();

module.exports = Interactive.Compute;


},{"./index":8,"d3":"d3"}],5:[function(require,module,exports){
var Interactive, Row,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Row = require('./rows');

Interactive.DataSource = (function(superClass) {
  extend(DataSource, superClass);

  DataSource.prototype.values = function() {
    return this._values.get();
  };

  function DataSource(values, columns) {
    this._values = this.cursor.select('values');
    this._values.set(values != null ? values : []);
    DataSource.__super__.constructor.call(this, values, columns);
  }

  DataSource.prototype.concat = function(values) {
    var ref;
    if (values != null) {
      values.forEach((function(_this) {
        return function(row) {
          return _this._values.push(row);
        };
      })(this));
    }
    DataSource.__super__.concat.call(this, (ref = values != null ? values.length : void 0) != null ? ref : 0);
    return this;
  };

  return DataSource;

})(Row);

module.exports = Interactive.DataSource;


},{"./index":8,"./rows":9}],6:[function(require,module,exports){
var History, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Interactive = require('./index');

History = require('./history');

Interactive.Expression = (function(superClass) {
  extend(Expression, superClass);

  Expression.prototype.expression = function() {
    return this._expression.get();
  };

  function Expression() {
    this.expressions = [];
    this._expression = this.cursor.select('expression');
    this._expression.set([]);
    Expression.__super__.constructor.call(this);
  }

  Expression.prototype.execute = function(expressions) {
    expressions.forEach((function(_this) {
      return function(expression, expression_count) {
        return _this[expression[0]].apply(_this, expression.slice(1));
      };
    })(this));
    return this.compute();
  };

  Expression.prototype.get = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this.cursor).get.apply(ref, args);
  };

  Expression.prototype.set = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this.cursor).set.apply(ref, args);
  };

  return Expression;

})(History);

module.exports = Interactive.Expression;


},{"./history":7,"./index":8}],7:[function(require,module,exports){
var Compute, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Compute = require('./compute');

Interactive.History = (function(superClass) {
  extend(History, superClass);

  function History() {
    this._checkpoint = this.cursor.select('checkpoint');
    this._checkpoint.set({});
    this._expression.startRecording(20);
    History.__super__.constructor.call(this);
  }

  History.prototype.history = function() {
    return this._expression.getHistory();
  };

  History.prototype.clear_history = function() {
    return this._expression.clearHistory();
  };

  History.prototype.record = function(expression) {
    return this.expressions.push(expression);
  };

  return History;

})(Compute);

module.exports = Interactive.History;


},{"./compute":4,"./index":8}],8:[function(require,module,exports){
var Baobab, Interactive, Table, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

Baobab = require('baobab');

d3 = require('d3');

Table = require('./table');


/*
An Interactive Table uses immutable cursor trees to track the evolution history at a table state.
  It is similar to a DataFrame because it's rows and columns can be accessed independently.  The
state of the table can be used to publish data-driven content to a webpage.  Most
data that is generated from an API endpoint can be represented as a table; more
complex scenarios can be decoupled to independent tables.  Decoupled tables can manipulated
independently and joined with other tables.
 */

Interactive = (function(superClass) {
  extend(Interactive, superClass);


  /* Table name Baobab cursor */

  Interactive.prototype.name = function() {
    return this._name.get();
  };


  /* Table information in readme Baobab cursor */

  Interactive.prototype.readme = function() {
    return this._readme.get();
  };


  /* Reset the Table back to state when the last new class was instantiated */

  Interactive.prototype.reset = function() {
    this.cursor.deepMerge(this._init.get());
    return this;
  };


  /*
  Create a new interactive table.
  
  @param [{columns, values, readme, metadata}] record_orient_data Record orient data contains the columns and
  values.
  
  @example Create a new interactive table
    table = new CoffeeTable
      columns: ['x', 'y']
      values: [
        [1, 2]
        [3, 8]
        [-1,4]
        [5,7]
      ]
   */

  function Interactive(record_orient_data) {
    var ref;
    this.tree = new Baobab(record_orient_data);
    this.cursor = this.tree.select(0);
    this._init = this.cursor.select('init');
    this._init.set(record_orient_data);
    this._readme = this.cursor.select('readme');
    this._readme.set((ref = record_orient_data.readme) != null ? ref : "");
    Interactive.__super__.constructor.call(this, this.cursor.project({
      name: ['name'],
      values: ['values'],
      columns: ['columns'],
      metadata: ['metadata']
    }));
    this.tree.on('write', function(event) {
      var new_index, old_index, ref1, values;
      if (indexOf.call(event.data.path, 'index') >= 0 && event.data.path.length === 1) {
        values = this.get('values');
        new_index = this.get('index');
        old_index = (ref1 = this.select('index').getHistory(1)[0]) != null ? ref1 : d3.range(new_index.length);
        return this.set('values', new_index.map((function(_this) {
          return function(i) {
            return values[old_index.indexOf(i)];
          };
        })(this)));
      }
    });
    this.compute();
  }


  /*
  Project selects a subset of columns
  @example Selection the index, x, and y
    table.projection 'index','x','y'
   */

  Interactive.prototype.projection = function() {
    var columns;
    columns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this._values.set(this.column_data_source.apply(this, columns));
    this._columns.select(0).set(this.derived());
    this._expression.push(['projection'].concat(slice.call(columns)));
    return this;
  };


  /*
  Transform adds named columns to the table
  @param [Object] transformers is an object of named columns.  The new columns
  are defined by ``cursors`` and a function ``fn``.
  @example Create two new columns mean and std.
    table.transform
      mean: { cursors: ['x','y'], fn: (x,y)-> (x+y)/2 }
      std: { cursors: ['x','y'], fn: require('d3').deviation }
   */

  Interactive.prototype.transform = function(transformers) {
    d3.entries(transformers).forEach((function(_this) {
      return function(arg1) {
        var cursors, fn, j, key, value;
        key = arg1.key, value = arg1.value;
        cursors = 2 <= value.length ? slice.call(value, 0, j = value.length - 1) : (j = 0, []), fn = value[j++];
        return _this._add_derived_column(key, cursors.map(function(col) {
          return ['column_data_source', col, 'values'];
        }), fn);
      };
    })(this));
    this._expression.push(['transform', transformers]);
    return this;
  };


  /*
  Filter elements columns based on a predicate function.
  @param [String] columns a list of columns to include in the predicate function
  @param [Function] fn a predicate function with access to each of the columns.
  
  @example Filter columns ``x`` and ``y``
    table.filter 'x','y', (x,y)-> x > 0 and y < 5
   */

  Interactive.prototype.filter = function() {
    var columns, fn, j, new_values, values;
    columns = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), fn = arguments[j++];
    values = this.column_data_source.apply(this, columns);
    new_values = values.filter(fn);
    this.index.set(new_values.map((function(_this) {
      return function(v) {
        return values.indexOf(v);
      };
    })(this)));
    this.values.set(values);
    this._expression.push(['filter'].concat(slice.call(columns), [fn.toString()]));
    return this;
  };


  /*
  Concatenate new values to the table.
  @param [Object] new_values responds to the keys ``columns`` and ``values`` to
  append in the column direction or row direction, respectively.
  @example Add a Two Rows
    table.concat
      values: [
        [-3,4]
        [1,9]
      ]
  @example Add One Column.  The Array has a length of six because two rows were just added.
    table.concat
      columns:
        z: [-3,4,1,9,6,-4]
   */

  Interactive.prototype.concat = function(value_object) {
    Interactive.__super__.concat.call(this, value_object);
    this._expression.push(['concat', value_object]);
    return this;
  };


  /*
  Apply a function to a column
  @example Apply a function to x depending on y
    table.apply 'x', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
   */

  Interactive.prototype.apply = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    Interactive.__super__.apply.apply(this, args);
    return this._expression.push([
      'apply', args.map(function(arg) {
        return JSON.parse(JSON.stringify(arg));
      })
    ]);
  };

  return Interactive;

})(Table);

module.exports = Interactive;


},{"./table":10,"baobab":"baobab","d3":"d3"}],9:[function(require,module,exports){
var Baobab, Column, Interactive, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Baobab = require('baobab');

d3 = require('d3');

Interactive = require('./index');

Column = require('./columns');

Interactive.Row = (function(superClass) {
  extend(Row, superClass);

  Row.prototype.length = function() {
    return this.cursor.get('length') - 1;
  };

  Row.prototype.index = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this._index).get.apply(ref, args);
  };

  function Row(values, columns) {
    this._index = this.cursor.select('index');
    this._index.startRecording(1);

    /*@_index.on 'update', (event)=>
      new_index = event.data.currentData
      if event.data.previousData?
        alert 1
        old_index = event.data.previousData
        new_index = new_index.map (i)=> old_index.indexOf i
        values = @values()
        @_values.set new_index.map (i)=> values[i]
        @tree.commit()
     */
    this._length = this.cursor.select('length');
    this._length.set(Baobab.monkey(['values'], function(values) {
      return values.length;
    }));
    this._index.set(d3.range(values.length));
    Row.__super__.constructor.call(this, columns);
    this._add_derived_column('index', [['index']], function(index) {
      return index;
    });
  }


  /* Function to reorder the table elements when the index is updated */

  Row.prototype.update_index_and_values = function(new_index) {
    return new_index = new_index.map((function(_this) {
      return function(i) {
        return old_index.indexOf(i);
      };
    })(this));
  };


  /*
  Update the index when a row is concatenated.
   */

  Row.prototype.concat = function(length) {
    var i, k, max, ref, results;
    i = this.index();
    max = Math.max.apply(Math, i) + 1;
    return (function() {
      results = [];
      for (var k = 0, ref = length - 1; 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map((function(_this) {
      return function(j) {
        return _this._index.push(max + j);
      };
    })(this));
  };


  /*
  table.iloc [2,3]
  table._index.set [2,3,0,1]
  table.iloc [2,3]
  @param [Array] selection selection of the indices of the rows.
   */

  Row.prototype.iloc = function(selection) {
    var index, values;
    index = this.index();
    values = this.values();
    if (selection != null) {
      values = selection.map((function(_this) {
        return function(i) {
          return values[i];
        };
      })(this));
    }
    return values;
  };


  /*
  table.loc [2,3]
  table._index.set [2,3,0,1]
  table.loc [2,3]
  @param [Array] selection selection of the ids of the rows.
   */

  Row.prototype.loc = function(selection) {
    var index, values;
    index = this.index();
    values = this.values();
    if (selection != null) {
      values = selection.map((function(_this) {
        return function(i) {
          return values[index.indexOf(i)];
        };
      })(this));
    }
    return values;
  };

  Row.prototype.update = function() {};

  return Row;

})(Column);

module.exports = Interactive.Row;


},{"./columns":3,"./index":8,"baobab":"baobab","d3":"d3"}],10:[function(require,module,exports){
var ColumnDataSource, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

ColumnDataSource = require('./column_data_source');

Interactive.Table = (function(superClass) {
  extend(Table, superClass);


  /* Return the metadata of the columns */

  Table.prototype.metadata = function(args) {
    var tmp;
    if (args != null) {
      tmp = {};
      args.forEach((function(_this) {
        return function(arg) {
          return tmp[arg] = arg;
        };
      })(this));
      return this._metadata.project(tmp);
    } else {
      return this._metadata.get;
    }
  };

  function Table(arg1) {
    var columns, metadata, name, ref, values;
    name = arg1.name, values = arg1.values, columns = arg1.columns, metadata = arg1.metadata;
    this._name = this.cursor.select('name');
    this._name.set(name != null ? name : "Some name");

    /* Metadata is at the table level, because it sets types of the table */
    this._metadata = this.cursor.select('metadata');
    this._metadata.set((ref = this._metadata.get()) != null ? ref : metadata);
    Table.__super__.constructor.call(this, values, columns);
    this.compute();
  }

  return Table;

})(ColumnDataSource);


/*
A formatted string of the table.
 */

Interactive.Table.prototype.to_string = function() {};


/*
JSONify the current state of the table.

@param [Boolean] index True includes the index in the JSON string.
 */

Interactive.Table.prototype.to_json = function() {
  return JSON.stringify({
    columns: this.derived(),
    values: this.column_data_source.apply(this, this.derived())
  });
};

module.exports = Interactive.Table;


},{"./column_data_source":2,"./index":8}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaW5kZXguY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3Jvd3MuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3RhYmxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7O0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErRU0sTUFBTSxDQUFDO0VBS0UscUJBQUMsR0FBRDtJQUFDLElBQUMsQ0FBQSxNQUFEO0lBQVEsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFDLENBQUEsR0FBVCxFQUFjLFNBQUMsQ0FBRDthQUFNLDZDQUFNLENBQU47SUFBTixDQUFkO0VBQVQ7O3dCQUNiLE9BQUEsR0FBUzs7Ozs7O0FBRVgsV0FBVyxDQUFDLFdBQVosR0FBMEIsT0FBQSxDQUFRLGVBQVI7O0FBQzFCLFdBQVcsQ0FBQyxnQkFBWixHQUErQixPQUFBLENBQVEsZUFBUjs7QUFHL0IsTUFBTSxDQUFDLEtBQVAsR0FBbUIsSUFBQSxXQUFXLENBQUMsV0FBWixDQUNqQjtF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QUE7U0FDM0IsSUFBSSxDQUFDLFNBQUwsQ0FDRTtJQUFBLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVQ7SUFDQSxNQUFBLEVBQVEsSUFBQyxDQUFBLGtCQUFELGFBQW9CLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBcEIsQ0FEUjtHQURGO0FBRDJCOztBQUs3QixNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFXLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5kMyA9IHJlcXVpcmUgXCJkM1wiXG4jIyNcbmludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuXG5AZXhhbXBsZSBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgQ29mZmVlVGFibGVcbiAgdGFibGUgPSBuZXcgQ29mZmVlVGFibGVcbiAgICBuYW1lOiBcIlBvbHlnb25cIlxuICAgIHJlYWRtZTogXCJBIHJlY3RhbmdsZVwiXG4gICAgbWV0YWRhdGE6IHt4Oidob3Jpem9udGFsIGRpcmVjdGlvbicseTondmVydGljYWwgZGlyZWN0aW9uJ31cbiAgICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gICAgdmFsdWVzOiBbWzEsIDNdLFsyLCA4XSxbMywxM11dXG5cbkBleGFtcGxlIEFkZCBhIGNvbHVtbiBvZiBkYXRhIHdpdGggQ29uY2F0XG4gIHRhYmxlLmNvbmNhdFxuICAgIGNvbHVtbnM6XG4gICAgICB6OiBbNSwgNCwgM11cblxuQGV4YW1wbGUgQWRkIHR3byByb3dzIG9mIGRhdGEgd2l0aCBDb25jYXRcbiAgdGFibGUuY29uY2F0XG4gICAgdmFsdWVzOiBbXG4gICAgICBbNCwgMTgsIDJdXG4gICAgICBbNSwgMjMsIDFdXG4gICAgXVxuXG5AZXhhbXBsZSBBZGQgYSBuZXcgY29sdW1uIHRoYXQgaXMgYSBmdW5jdGlvbiBvZiBleGlzdGluZyBjb2x1bW5zIHggYW5kIHlcbiAgdGFibGUudHJhbnNmb3JtXG4gICAgdDogJ3gnLCAneScsICh4LCB5KS0+XG4gICAgICBkMy56aXAoeCwgeSkubWFwICh2KS0+IE1hdGgudGFuIHZbMV0vIHZbMF1cblxuQGV4YW1wbGUgTWFrZSBhIGNoZWNrcG9pbnQgb3Igc3RvcmUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGNvbHVtbnMgYW5kIHZhbHVlcyB0byByZXVzZSBsYXRlci5cbiAgdGFibGUuY29tcHV0ZSgpXG5cbkBleGFtcGxlIENyZWF0ZSBhIG5ldyBjb3B5IHdpdGggdGhlIHggYW5kIGFuZ2xlIGNvbHVtbnNcbiAgdmVjdG9ycyA9IHRhYmxlLnByb2plY3Rpb24gJ3gnLCd0J1xuICAgIC5jb3B5KClcblxuVGhlIHN0YXRlIG9mIHRoZSB0YWJsZSAgaXMgc3RpbGwgdGhlIHByb2plY3Qgb2YgeCBhbmQgdC5cblxuQGV4YW1wbGUgUmV2ZXJ0IHRoZSB0YWJsZSBiYWNrIHRvIHRoZSBsYXN0IGNoZWNrcG9pbnQuXG4gIHRhYmxlLnJld2luZCgpXG5cbk5vdyB0aGUgdGFibGUgaGFzIGZvciBjb2x1bW5zXG5cbiAgYWxlcnQgdGFibGUubmFtZSgpICsgJyBoYXMgJyArIHRhYmxlLmluZGV4KCkubGVuZ3RoICsgJyByb3cgIGFuZCB0aGUgZmllbGRzOiAnICsgdGFibGUuY29sdW1ucygpLmpvaW4oJywgJylbLi4tMl1cblxuQGV4YW1wbGUgQWRkIGEgY2F0ZWdvcmljYWwgY29sdW1uc1xuICB0YWJsZS50cmFuc2Zvcm1cbiAgICAgICdjb2xvcic6ICd5JywgKHkpLT4geS5tYXAgKHYpLT4gWydyZWQnLCdncmVlbicsJ2JsdWUnXVt2ICUlIDEwXVxuICAgIC5jb21wdXRlKClcblxuXG5AZXhhbXBsZSBTZXBhcmF0ZSB0aGUgcmVkIGFuZCB0aGUgZ3JlZW5zLlxuICBncmVlbiA9IHRhYmxlLmZpbHRlciAnY29sb3InLCAoY29sb3IpLT4gY29sb3IgaW4gWydncmVlbiddXG4gICAgLmNvcHkoKVxuICByZWQgPSB0YWJsZS5yZXdpbmQoKS5maWx0ZXIgJ2NvbG9yJywgKGNvbG9yKS0+IGNvbG9yIGluIFsncmVkJ11cbiAgICAuY29weSgpXG5cblNlcGFyYXRpbmcgY29tcHV0ZSBmcm9tIHRoZSB2YWx1ZXMuXG5cbkNvZmZlZVRhYmxlIHN0b3JlcyBhIGhpc3Rvcnkgb2YgdGhlIHRyYW5zZm9ybWF0aW9uc1xuXG5AZXhhbXBsZSBTaG93IFRhYmxlIEV4cHJlc3Npb24gaGlzdG9yeVxuICB0YWJsZS5oaXN0b3J5KClcbiAgdGFibGUuZXhwcmVzc2lvbigpXG5cbmluIHRoZSBuZXh0IGV4YW1wbGUgYW4gZXhwcmVzc2lvbiBpcyBjcmVhdGVkIG9uIHRoZSBncmVlbiB0aGUgdGFibGUgYW5kIGl0c1xuZXhwcmVzc2lvbnMgYXJlIGFwcGxpZWQgdG8gdGhlIHJlZCB0YWJsZS4gIE1ldGhvZHMgYXJlIGNoYWluYWJsZS5cblxuQGV4YW1wbGUgQXBwbHkgZXhwcmVzc2lvbnMgdG8gZ3JlZW4gdGhlbiB1c2UgdGhlIGV4cHJlc3Npb25zIG9uIHJlZFxuICBncmVlbi5zb3J0ICd4J1xuICAgIC51bmlxdWUoKVxuICAgIC50cmFuc2Zvcm1cbiAgICAgIHByb2Q6ICd4JywgJ3knLCAoeCx5KS0+IGQzLnppcCh4LHkpLm1hcCAodiktPiB2WzFdKnZbMF1cblxuICByZWQuZXZhbHVhdGUgZ3JlZW4uaGlzdG9yeSgpXG5cblxuPiBOb24tY29sdW1uL290aGVyIGN1cnNvciBjb250ZW50IGlzIGFuIGFycmF5LlxuXG4jIyNcbmNsYXNzIHdpbmRvdy5Db2ZmZWVUYWJsZVxuICAjIENvbnN0cnVjdCBhIGNvbGxlY3Rpb24gb2YgQ29mZmVlVGFibGUgYm9va3MuXG4gICMgQHBhcmFtIFtPYmplY3RdIGNvbnRlbnQgY29udGFpbnMgbWFueSBUYWJ1bGFyIGRhdGFzZXRzXG4gICMgQHBhcmFtIFtPYmplY3RdIHB1Ymxpc2hlciBjb250YWlucyBtYW55IERPTSBzZWxlY3Rpb25zXG4gICMgQHBhcmFtIFtPYmplY3RdIGJvb2sgdXNlIHB1Ymxpc2hlcnMgdG8gcHJlc2VudCBhbmQgdXBkYXRlIGNvbnRlZW50XG4gIGNvbnN0cnVjdG9yOiAoQHVybCktPiBkMy5qc29uIEB1cmwsIChkKS0+IHN1cGVyIGRcbiAgdmVyc2lvbjogJzAuMS4wJ1xuXG5Db2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5Db2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZUdyYXBoID0gcmVxdWlyZSAnLi9pbnRlcmFjdGl2ZSdcblxuXG53aW5kb3cudGFibGUgPSBuZXcgQ29mZmVlVGFibGUuSW50ZXJhY3RpdmVcbiAgY29sdW1uczogWyd4JywgJ3knXVxuICB2YWx1ZXM6IFtcbiAgICBbMSwgMl1cbiAgICBbMywgOF1cbiAgICBbLTEsNF1cbiAgICBbNSw3XVxuICBdXG53aW5kb3cuc3F1YXJlID0gbmV3IENvZmZlZVRhYmxlLkludGVyYWN0aXZlXG4gIGNvbHVtbnM6IFsneCcsICd5J11cbiAgdmFsdWVzOiBbXG4gICAgWzEsIDFdXG4gICAgWzcsN11cbiAgXVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvZmZlZVRhYmxlXG4gIGQzXG4gIEJhb2JhYlxufVxuIiwiZDMgPSByZXF1aXJlICdkMydcbkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vZGF0YSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZSBleHRlbmRzIERhdGFTb3VyY2VcbiAgY29uc3RydWN0b3I6ICh2YWx1ZXMsIGNvbHVtbnMpLT5cbiAgICBAX2NkcyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5fZGF0YV9zb3VyY2UnXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG4gICAgY29sdW1ucy5tYXAgKGNvbHVtbl9uYW1lKT0+IEBhcHBseSBjb2x1bW5fbmFtZVxuXG4gICMjIyBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VcbiAgdGFibGUuYXBwbHkgJ21lYW4nLCBbJ3gnLCd5J10sICh4LHkpLT4gZDMuemlwKHgseSkubWFwICh2KS0+IGQzLm1lYW4gdlxuICB0YWJsZS5wcm9qZWN0aW9uKClcbiAgIyMjXG4gIGFwcGx5OiAoYXJncy4uLiktPiBAX2FkZF9kZXJpdmVkX2NvbHVtbiBhcmdzLi4uXG5cbiAgIyMjXG4gIENyZWF0ZSBhIG5ldyBpbnRlcmFjdGl2ZSBjdXJzb3IgdGhhdCBkZWZpbmVzIGEgbmV3IENvbHVtbiBEYXRhIFNvdXJjZVxuICAjIyNcbiAgX2FkZF9kZXJpdmVkX2NvbHVtbjogKG5hbWUsIGN1cnNvcnMsIGZuKS0+XG4gICAgY3Vyc29ycyA/PSBbWydjb2x1bW5zJywwXSxbJ3ZhbHVlcyddLFsnLicsJ25hbWUnXV1cbiAgICBmbiA/PSAoY29sdW1ucyx2YWx1ZXMsY29sdW1uX25hbWUpLT5cbiAgICAgIGNvbHVtbl9pbmRleCA9IGNvbHVtbnMuaW5kZXhPZiBjb2x1bW5fbmFtZVxuICAgICAgdmFsdWVzLm1hcCAocm93X3ZhbHVlcyktPiByb3dfdmFsdWVzW2NvbHVtbl9pbmRleF1cbiAgICBAX2Nkcy5zZXQgbmFtZSxcbiAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB2YWx1ZXM6IEJhb2JhYi5tb25rZXkgY3Vyc29ycy4uLiwgZm5cbiAgICAjIyMgQWx3YXlzIHB1c2ggZGVyaXZlZCBjb2x1bW5zIHRvIHNlY29uZCBwYXJ0IG9mIGNvbHVtbnMgIyMjXG4gICAgdW5sZXNzIG5hbWUgaW4gWydpbmRleCcsQGRlcml2ZWQoKS4uLl1cbiAgICAgIEBfY29sdW1ucy5zZWxlY3QoMSkucHVzaCBuYW1lXG5cblxuICAjIyMgQXBwZW5kIGNvbHVtbnMgb3Igcm93cyB3aXRob3V0IG1vbmtleXMgIyMjXG4gIGNvbmNhdDogKHtjb2x1bW5zLHZhbHVlc30pLT5cbiAgICBpZiBjb2x1bW5zP1xuICAgICAgI2FsZXJ0IEpTT04uc3RyaW5naWZ5IGNvbHVtbnNcbiAgICAgIGQzLmVudHJpZXMoY29sdW1ucykuZm9yRWFjaCAoe2tleSwgdmFsdWV9KT0+XG4gICAgICAgICMjIyBBcHBlbmQgdGhlIHZhbHVlIHRvIHRoZSByYXcgY29sdW1ucyAjIyNcbiAgICAgICAgQF9jb2x1bW5zLnNlbGVjdCgwKS5wdXNoIGtleVxuICAgICAgICBAX3ZhbHVlcy5zZXQgQHZhbHVlcygpLm1hcCAocm93LGkpPT4gW3Jvdy4uLix2YWx1ZVtpXV1cbiAgICAgICAgQF9hZGRfZGVyaXZlZF9jb2x1bW4ga2V5XG4gICAgc3VwZXIgdmFsdWVzXG5cblxuICBjb2x1bW5fZGF0YV9zb3VyY2U6IChjb2x1bW5zLi4uKS0+XG4gICAgaWYgY29sdW1ucy5sZW5ndGggPT0gMCB0aGVuIGNvbHVtbnMgPSBAZGVyaXZlZCgpXG4gICAgZDMuemlwIGNvbHVtbnMubWFwKCAoYykgPT4gQF9jZHMuZ2V0KGMsJ3ZhbHVlcycpKS4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtbkRhdGFTb3VyY2VcbiIsImQzID0gcmVxdWlyZSAnZDMnXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5FeHByZXNzaW9uID0gcmVxdWlyZSAnLi9leHByZXNzaW9uJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db2x1bW4gZXh0ZW5kcyBFeHByZXNzaW9uXG4gIGNvbHVtbnM6ICgpLT4gZDMubWVyZ2UgQF9jb2x1bW5zLmdldCgpXG5cbiAgcmF3OiAoKS0+IEBfY29sdW1ucy5nZXQgMFxuICBkZXJpdmVkOiAoKS0+IEBfY29sdW1ucy5nZXQgMVxuXG4gIGNvbnN0cnVjdG9yOiAoY29sdW1ucyktPlxuICAgIEBfY29sdW1ucyA9IEBjdXJzb3Iuc2VsZWN0ICdjb2x1bW5zJ1xuICAgICMgW3Jhd19jb2x1bW5zLCBkZXJpdmVkX2NvbHVtbnNdXG4gICAgQF9jb2x1bW5zLnNldCBbY29sdW1ucyxbXV0gPyBbW10sW11dXG4gICAgIyMjIHVwZGF0ZSB0aGUgdmFsdWVzIHdoZW4gdGhlIHJhd19jb2x1bW5zIGNoYW5nZVxuICAgIEBfY29sdW1ucy5zZWxlY3QoMSkub24gJ3VwZGF0ZScsIChldmVudCk9PlxuICAgICAgW2V2ZW50LmRhdGEucHJldmlvdXNEYXRhLi4uXS5maWx0ZXIgKGQpPT4gbm90IGQgaW4gZXZlbnQuZGF0YS5jdXJyZW50RGF0YVxuICAgICAgICAuZm9yRWFjaCAoY29sdW1uX25hbWUpLT4gQF9jZHNbY29sdW1uX25hbWVdLnJlbGVhc2UoKVxuICAgICMjI1xuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5cbiIsImQzID0gcmVxdWlyZSBcImQzXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29tcHV0ZVxuICBjb21wdXRlOiAoKS0+XG4gICAgIyMjIENvbXB1dGUgY2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhlIGRhdGEgdHJlZSAjIyNcbiAgICBAX2NoZWNrcG9pbnQuZGVlcE1lcmdlXG4gICAgICBuYW1lOiBAbmFtZSgpXG4gICAgICBpbmRleDogQGluZGV4KClcbiAgICAgIHJlYWRtZTogQHJlYWRtZSgpXG4gICAgICB2YWx1ZXM6IEBjb2x1bW5fZGF0YV9zb3VyY2UoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBbQGRlcml2ZWQoKSwgQGRlcml2ZWQoKV1cblxuICAgICMjIyBUT0RPIFJlbW92ZSBvbGQgY29sdW1ucyAjIyNcbiAgICB0aGlzXG5cbiAgcmV3aW5kOiAoKS0+XG4gICAgQGN1cnNvci5kZWVwTWVyZ2VcbiAgICAgIGluZGV4OiBAX2NoZWNrcG9pbnQuZ2V0ICdpbmRleCdcbiAgICAgIGNvbHVtbnM6IEBfY2hlY2twb2ludC5nZXQgJ2NvbHVtbnMnXG4gICAgICB2YWx1ZXM6IEBfY2hlY2twb2ludC5nZXQgJ3ZhbHVlcydcbiAgICAgIG1ldGFkYXRhOiBAX2NoZWNrcG9pbnQuZ2V0ICdtZXRhZGF0YSdcbiAgICBAX2NvbHVtbnMuc2VsZWN0KDApLnNldCBAX2NoZWNrcG9pbnQuZ2V0ICdjb2x1bW5zJ1xuICAgIHRoaXNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbXB1dGVcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcblJvdyA9IHJlcXVpcmUgJy4vcm93cydcblxuY2xhc3MgSW50ZXJhY3RpdmUuRGF0YVNvdXJjZSBleHRlbmRzIFJvd1xuICB2YWx1ZXM6ICgpLT4gQF92YWx1ZXMuZ2V0KClcbiAgY29uc3RydWN0b3I6ICh2YWx1ZXMsIGNvbHVtbnMpLT5cbiAgICBAX3ZhbHVlcyA9IEBjdXJzb3Iuc2VsZWN0ICd2YWx1ZXMnXG4gICAgQF92YWx1ZXMuc2V0IHZhbHVlcyA/IFtdXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG5cbiAgY29uY2F0OiAodmFsdWVzKS0+XG4gICAgdmFsdWVzPy5mb3JFYWNoIChyb3cpPT4gQF92YWx1ZXMucHVzaCByb3dcbiAgICBzdXBlciB2YWx1ZXM/Lmxlbmd0aCA/IDBcbiAgICB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuRGF0YVNvdXJjZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuSGlzdG9yeSA9IHJlcXVpcmUgJy4vaGlzdG9yeSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuRXhwcmVzc2lvbiBleHRlbmRzIEhpc3RvcnlcbiAgZXhwcmVzc2lvbjogKCktPiBAX2V4cHJlc3Npb24uZ2V0KClcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBAX2V4cHJlc3Npb24uc2V0IFtdXG4gICAgc3VwZXIoKVxuXG4gIGV4ZWN1dGU6IChleHByZXNzaW9ucyktPlxuICAgIGV4cHJlc3Npb25zLmZvckVhY2ggIChleHByZXNzaW9uLGV4cHJlc3Npb25fY291bnQpPT5cbiAgICAgIEBbZXhwcmVzc2lvblswXV0gZXhwcmVzc2lvblsxLi5dLi4uXG4gICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MuLi4pLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzLi4uKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2NoZWNrcG9pbnQuc2V0IHt9XG4gICAgQF9leHByZXNzaW9uLnN0YXJ0UmVjb3JkaW5nIDIwXG4gICAgc3VwZXIoKVxuICBoaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uZ2V0SGlzdG9yeSgpXG4gIGNsZWFyX2hpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5jbGVhckhpc3RvcnkoKVxuICByZWNvcmQ6IChleHByZXNzaW9uKS0+XG4gICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkhpc3RvcnlcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcbmQzID0gcmVxdWlyZSAnZDMnXG5UYWJsZSA9IHJlcXVpcmUgJy4vdGFibGUnXG5cbiMjI1xuQW4gSW50ZXJhY3RpdmUgVGFibGUgdXNlcyBpbW11dGFibGUgY3Vyc29yIHRyZWVzIHRvIHRyYWNrIHRoZSBldm9sdXRpb24gaGlzdG9yeSBhdCBhIHRhYmxlIHN0YXRlLlxuICBJdCBpcyBzaW1pbGFyIHRvIGEgRGF0YUZyYW1lIGJlY2F1c2UgaXQncyByb3dzIGFuZCBjb2x1bW5zIGNhbiBiZSBhY2Nlc3NlZCBpbmRlcGVuZGVudGx5LiAgVGhlXG5zdGF0ZSBvZiB0aGUgdGFibGUgY2FuIGJlIHVzZWQgdG8gcHVibGlzaCBkYXRhLWRyaXZlbiBjb250ZW50IHRvIGEgd2VicGFnZS4gIE1vc3RcbmRhdGEgdGhhdCBpcyBnZW5lcmF0ZWQgZnJvbSBhbiBBUEkgZW5kcG9pbnQgY2FuIGJlIHJlcHJlc2VudGVkIGFzIGEgdGFibGU7IG1vcmVcbmNvbXBsZXggc2NlbmFyaW9zIGNhbiBiZSBkZWNvdXBsZWQgdG8gaW5kZXBlbmRlbnQgdGFibGVzLiAgRGVjb3VwbGVkIHRhYmxlcyBjYW4gbWFuaXB1bGF0ZWRcbmluZGVwZW5kZW50bHkgYW5kIGpvaW5lZCB3aXRoIG90aGVyIHRhYmxlcy5cblxuIyMjXG5jbGFzcyBJbnRlcmFjdGl2ZSBleHRlbmRzIFRhYmxlXG4gICMjIyBUYWJsZSBuYW1lIEJhb2JhYiBjdXJzb3IgIyMjXG4gIG5hbWU6ICgpLT4gQF9uYW1lLmdldCgpXG4gICMjIyBUYWJsZSBpbmZvcm1hdGlvbiBpbiByZWFkbWUgQmFvYmFiIGN1cnNvciAjIyNcbiAgcmVhZG1lOiAoKS0+IEBfcmVhZG1lLmdldCgpXG4gICMjIyBSZXNldCB0aGUgVGFibGUgYmFjayB0byBzdGF0ZSB3aGVuIHRoZSBsYXN0IG5ldyBjbGFzcyB3YXMgaW5zdGFudGlhdGVkICAjIyNcbiAgcmVzZXQ6ICgpLT5cbiAgICBAY3Vyc29yLmRlZXBNZXJnZSBAX2luaXQuZ2V0KClcbiAgICB0aGlzXG5cbiAgIyMjXG4gIENyZWF0ZSBhIG5ldyBpbnRlcmFjdGl2ZSB0YWJsZS5cblxuICBAcGFyYW0gW3tjb2x1bW5zLCB2YWx1ZXMsIHJlYWRtZSwgbWV0YWRhdGF9XSByZWNvcmRfb3JpZW50X2RhdGEgUmVjb3JkIG9yaWVudCBkYXRhIGNvbnRhaW5zIHRoZSBjb2x1bW5zIGFuZFxuICB2YWx1ZXMuXG5cbiAgQGV4YW1wbGUgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIHRhYmxlXG4gICAgdGFibGUgPSBuZXcgQ29mZmVlVGFibGVcbiAgICAgIGNvbHVtbnM6IFsneCcsICd5J11cbiAgICAgIHZhbHVlczogW1xuICAgICAgICBbMSwgMl1cbiAgICAgICAgWzMsIDhdXG4gICAgICAgIFstMSw0XVxuICAgICAgICBbNSw3XVxuICAgICAgXVxuICAjIyNcbiAgY29uc3RydWN0b3I6IChyZWNvcmRfb3JpZW50X2RhdGEpLT5cblxuICAgIEB0cmVlID0gbmV3IEJhb2JhYiByZWNvcmRfb3JpZW50X2RhdGFcbiAgICBAY3Vyc29yID0gQHRyZWUuc2VsZWN0IDBcblxuICAgIEBfaW5pdCA9IEBjdXJzb3Iuc2VsZWN0ICdpbml0J1xuICAgIEBfaW5pdC5zZXQgcmVjb3JkX29yaWVudF9kYXRhXG5cbiAgICBAX3JlYWRtZSA9IEBjdXJzb3Iuc2VsZWN0ICdyZWFkbWUnXG4gICAgQF9yZWFkbWUuc2V0IHJlY29yZF9vcmllbnRfZGF0YS5yZWFkbWUgPyBcIlwiXG5cbiAgICBzdXBlciBAY3Vyc29yLnByb2plY3RcbiAgICAgIG5hbWU6IFsnbmFtZSddXG4gICAgICB2YWx1ZXM6IFsndmFsdWVzJ11cbiAgICAgIGNvbHVtbnM6IFsnY29sdW1ucyddXG4gICAgICBtZXRhZGF0YTogWydtZXRhZGF0YSddXG5cbiAgICBAdHJlZS5vbiAnd3JpdGUnLCAoZXZlbnQpLT5cbiAgICAgICMgVGhpcyBpcyB0aGUgY3Vyc29yIHRyZWUgY29udGV4dFxuICAgICAgaWYgJ2luZGV4JyBpbiBldmVudC5kYXRhLnBhdGggYW5kIGV2ZW50LmRhdGEucGF0aC5sZW5ndGggPT0gMVxuICAgICAgICB2YWx1ZXMgPSBAZ2V0ICd2YWx1ZXMnXG4gICAgICAgIG5ld19pbmRleCA9IEBnZXQgJ2luZGV4J1xuICAgICAgICBvbGRfaW5kZXggPSBAc2VsZWN0KCdpbmRleCcpLmdldEhpc3RvcnkoMSlbMF0gPyBkMy5yYW5nZSBuZXdfaW5kZXgubGVuZ3RoXG4gICAgICAgIEBzZXQgJ3ZhbHVlcycsIG5ld19pbmRleC5tYXAgKGkpPT4gdmFsdWVzW29sZF9pbmRleC5pbmRleE9mIGldXG4gICAgQGNvbXB1dGUoKVxuXG4gICMjI1xuICBQcm9qZWN0IHNlbGVjdHMgYSBzdWJzZXQgb2YgY29sdW1uc1xuICBAZXhhbXBsZSBTZWxlY3Rpb24gdGhlIGluZGV4LCB4LCBhbmQgeVxuICAgIHRhYmxlLnByb2plY3Rpb24gJ2luZGV4JywneCcsJ3knXG4gICMjI1xuICBwcm9qZWN0aW9uOiAoY29sdW1ucy4uLiktPlxuICAgIEBfdmFsdWVzLnNldCBAY29sdW1uX2RhdGFfc291cmNlIGNvbHVtbnMuLi5cbiAgICBAX2NvbHVtbnMuc2VsZWN0KDApLnNldCBAZGVyaXZlZCgpXG4gICAgQF9leHByZXNzaW9uLnB1c2ggWydwcm9qZWN0aW9uJywgY29sdW1ucy4uLl1cbiAgICB0aGlzXG5cbiAgIyMjXG4gIFRyYW5zZm9ybSBhZGRzIG5hbWVkIGNvbHVtbnMgdG8gdGhlIHRhYmxlXG4gIEBwYXJhbSBbT2JqZWN0XSB0cmFuc2Zvcm1lcnMgaXMgYW4gb2JqZWN0IG9mIG5hbWVkIGNvbHVtbnMuICBUaGUgbmV3IGNvbHVtbnNcbiAgYXJlIGRlZmluZWQgYnkgYGBjdXJzb3JzYGAgYW5kIGEgZnVuY3Rpb24gYGBmbmBgLlxuICBAZXhhbXBsZSBDcmVhdGUgdHdvIG5ldyBjb2x1bW5zIG1lYW4gYW5kIHN0ZC5cbiAgICB0YWJsZS50cmFuc2Zvcm1cbiAgICAgIG1lYW46IHsgY3Vyc29yczogWyd4JywneSddLCBmbjogKHgseSktPiAoeCt5KS8yIH1cbiAgICAgIHN0ZDogeyBjdXJzb3JzOiBbJ3gnLCd5J10sIGZuOiByZXF1aXJlKCdkMycpLmRldmlhdGlvbiB9XG4gICMjI1xuICB0cmFuc2Zvcm06ICh0cmFuc2Zvcm1lcnMpLT5cbiAgICBkMy5lbnRyaWVzIHRyYW5zZm9ybWVyc1xuICAgICAgLmZvckVhY2ggKHtrZXksdmFsdWV9KT0+XG4gICAgICAgIFtjdXJzb3JzLi4uLGZuXSA9IHZhbHVlXG4gICAgICAgIEBfYWRkX2Rlcml2ZWRfY29sdW1uIGtleSwgY3Vyc29ycy5tYXAoKGNvbCktPlsnY29sdW1uX2RhdGFfc291cmNlJyxjb2wsJ3ZhbHVlcyddKSwgZm5cbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ3RyYW5zZm9ybScsIHRyYW5zZm9ybWVyc11cbiAgICB0aGlzXG5cbiAgIyMjXG4gIEZpbHRlciBlbGVtZW50cyBjb2x1bW5zIGJhc2VkIG9uIGEgcHJlZGljYXRlIGZ1bmN0aW9uLlxuICBAcGFyYW0gW1N0cmluZ10gY29sdW1ucyBhIGxpc3Qgb2YgY29sdW1ucyB0byBpbmNsdWRlIGluIHRoZSBwcmVkaWNhdGUgZnVuY3Rpb25cbiAgQHBhcmFtIFtGdW5jdGlvbl0gZm4gYSBwcmVkaWNhdGUgZnVuY3Rpb24gd2l0aCBhY2Nlc3MgdG8gZWFjaCBvZiB0aGUgY29sdW1ucy5cblxuICBAZXhhbXBsZSBGaWx0ZXIgY29sdW1ucyBgYHhgYCBhbmQgYGB5YGBcbiAgICB0YWJsZS5maWx0ZXIgJ3gnLCd5JywgKHgseSktPiB4ID4gMCBhbmQgeSA8IDVcbiAgIyMjXG4gIGZpbHRlcjogKGNvbHVtbnMuLi4sIGZuKS0+XG4gICAgdmFsdWVzID0gQGNvbHVtbl9kYXRhX3NvdXJjZSBjb2x1bW5zLi4uXG4gICAgbmV3X3ZhbHVlcyA9IHZhbHVlcy5maWx0ZXIgZm5cbiAgICBAaW5kZXguc2V0IG5ld192YWx1ZXMubWFwICh2KT0+IHZhbHVlcy5pbmRleE9mIHZcbiAgICBAdmFsdWVzLnNldCB2YWx1ZXNcbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ2ZpbHRlcicsIGNvbHVtbnMuLi4sIGZuLnRvU3RyaW5nKCldXG4gICAgdGhpc1xuXG4gICMjI1xuICBDb25jYXRlbmF0ZSBuZXcgdmFsdWVzIHRvIHRoZSB0YWJsZS5cbiAgQHBhcmFtIFtPYmplY3RdIG5ld192YWx1ZXMgcmVzcG9uZHMgdG8gdGhlIGtleXMgYGBjb2x1bW5zYGAgYW5kIGBgdmFsdWVzYGAgdG9cbiAgYXBwZW5kIGluIHRoZSBjb2x1bW4gZGlyZWN0aW9uIG9yIHJvdyBkaXJlY3Rpb24sIHJlc3BlY3RpdmVseS5cbiAgQGV4YW1wbGUgQWRkIGEgVHdvIFJvd3NcbiAgICB0YWJsZS5jb25jYXRcbiAgICAgIHZhbHVlczogW1xuICAgICAgICBbLTMsNF1cbiAgICAgICAgWzEsOV1cbiAgICAgIF1cbiAgQGV4YW1wbGUgQWRkIE9uZSBDb2x1bW4uICBUaGUgQXJyYXkgaGFzIGEgbGVuZ3RoIG9mIHNpeCBiZWNhdXNlIHR3byByb3dzIHdlcmUganVzdCBhZGRlZC5cbiAgICB0YWJsZS5jb25jYXRcbiAgICAgIGNvbHVtbnM6XG4gICAgICAgIHo6IFstMyw0LDEsOSw2LC00XVxuICAjIyNcbiAgY29uY2F0OiAodmFsdWVfb2JqZWN0KS0+XG4gICAgc3VwZXIgdmFsdWVfb2JqZWN0XG4gICAgQF9leHByZXNzaW9uLnB1c2ggWydjb25jYXQnLHZhbHVlX29iamVjdF1cbiAgICB0aGlzXG5cbiAgIyMjXG4gIEFwcGx5IGEgZnVuY3Rpb24gdG8gYSBjb2x1bW5cbiAgQGV4YW1wbGUgQXBwbHkgYSBmdW5jdGlvbiB0byB4IGRlcGVuZGluZyBvbiB5XG4gICAgdGFibGUuYXBwbHkgJ3gnLCBbJ3gnLCd5J10sICh4LHkpLT4gZDMuemlwKHgseSkubWFwICh2KS0+IGQzLm1lYW4gdlxuICAjIyNcbiAgYXBwbHk6IChhcmdzLi4uKS0+XG4gICAgc3VwZXIgYXJncyAuLi5cbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ2FwcGx5JyxhcmdzLm1hcCAoYXJnKS0+IEpTT04ucGFyc2UgSlNPTi5zdHJpbmdpZnkgYXJnXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlXG4iLCJCYW9iYWIgPSByZXF1aXJlICdiYW9iYWInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuQ29sdW1uID0gcmVxdWlyZSAnLi9jb2x1bW5zJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Sb3cgZXh0ZW5kcyBDb2x1bW5cbiAgbGVuZ3RoOiAoKS0+IEBjdXJzb3IuZ2V0KCdsZW5ndGgnKSAtIDFcbiAgaW5kZXg6IChhcmdzLi4uKS0+IEBfaW5kZXguZ2V0IGFyZ3MuLi5cbiAgY29uc3RydWN0b3I6ICh2YWx1ZXMsIGNvbHVtbnMpLT5cbiAgICBAX2luZGV4ID0gQGN1cnNvci5zZWxlY3QgJ2luZGV4J1xuICAgIEBfaW5kZXguc3RhcnRSZWNvcmRpbmcgMVxuICAgICMjI0BfaW5kZXgub24gJ3VwZGF0ZScsIChldmVudCk9PlxuICAgICAgbmV3X2luZGV4ID0gZXZlbnQuZGF0YS5jdXJyZW50RGF0YVxuICAgICAgaWYgZXZlbnQuZGF0YS5wcmV2aW91c0RhdGE/XG4gICAgICAgIGFsZXJ0IDFcbiAgICAgICAgb2xkX2luZGV4ID0gZXZlbnQuZGF0YS5wcmV2aW91c0RhdGFcbiAgICAgICAgbmV3X2luZGV4ID0gbmV3X2luZGV4Lm1hcCAoaSk9PiBvbGRfaW5kZXguaW5kZXhPZiBpXG4gICAgICAgIHZhbHVlcyA9IEB2YWx1ZXMoKVxuICAgICAgICBAX3ZhbHVlcy5zZXQgbmV3X2luZGV4Lm1hcCAoaSk9PiB2YWx1ZXNbaV1cbiAgICAgICAgQHRyZWUuY29tbWl0KClcbiAgICAjIyNcbiAgICBAX2xlbmd0aCA9IEBjdXJzb3Iuc2VsZWN0ICdsZW5ndGgnXG4gICAgQF9sZW5ndGguc2V0IEJhb2JhYi5tb25rZXkgWyd2YWx1ZXMnXSwgKHZhbHVlcyktPiB2YWx1ZXMubGVuZ3RoXG4gICAgQF9pbmRleC5zZXQgZDMucmFuZ2UgdmFsdWVzLmxlbmd0aFxuXG4gICAgc3VwZXIgY29sdW1uc1xuICAgIEBfYWRkX2Rlcml2ZWRfY29sdW1uICdpbmRleCcsIFtbJ2luZGV4J11dLCAoaW5kZXgpLT4gaW5kZXhcblxuXG4gICMjIyBGdW5jdGlvbiB0byByZW9yZGVyIHRoZSB0YWJsZSBlbGVtZW50cyB3aGVuIHRoZSBpbmRleCBpcyB1cGRhdGVkICMjI1xuICB1cGRhdGVfaW5kZXhfYW5kX3ZhbHVlczogKG5ld19pbmRleCktPlxuICAgIG5ld19pbmRleCA9IG5ld19pbmRleC5tYXAgKGkpPT4gb2xkX2luZGV4LmluZGV4T2YgaVxuXG4gICMjI1xuICBVcGRhdGUgdGhlIGluZGV4IHdoZW4gYSByb3cgaXMgY29uY2F0ZW5hdGVkLlxuICAjIyNcbiAgY29uY2F0OiAobGVuZ3RoKS0+XG4gICAgaSA9IEBpbmRleCgpXG4gICAgbWF4ID0gTWF0aC5tYXgoaS4uLikgKyAxXG4gICAgWzAuLmxlbmd0aC0xXS5tYXAgKGopPT4gQF9pbmRleC5wdXNoIG1heCArIGpcblxuXG4gICMjI1xuICB0YWJsZS5pbG9jIFsyLDNdXG4gIHRhYmxlLl9pbmRleC5zZXQgWzIsMywwLDFdXG4gIHRhYmxlLmlsb2MgWzIsM11cbiAgQHBhcmFtIFtBcnJheV0gc2VsZWN0aW9uIHNlbGVjdGlvbiBvZiB0aGUgaW5kaWNlcyBvZiB0aGUgcm93cy5cbiAgIyMjXG4gIGlsb2M6ICAoc2VsZWN0aW9uKS0+XG4gICAgaW5kZXggPSBAaW5kZXgoKVxuICAgIHZhbHVlcyA9IEB2YWx1ZXMoKVxuICAgIGlmIHNlbGVjdGlvbj9cbiAgICAgIHZhbHVlcyA9IHNlbGVjdGlvbi5tYXAgKGkpPT4gdmFsdWVzW2ldXG4gICAgdmFsdWVzXG4gICMjI1xuICB0YWJsZS5sb2MgWzIsM11cbiAgdGFibGUuX2luZGV4LnNldCBbMiwzLDAsMV1cbiAgdGFibGUubG9jIFsyLDNdXG4gIEBwYXJhbSBbQXJyYXldIHNlbGVjdGlvbiBzZWxlY3Rpb24gb2YgdGhlIGlkcyBvZiB0aGUgcm93cy5cbiAgIyMjXG4gIGxvYzogKHNlbGVjdGlvbiktPlxuICAgIGluZGV4ID0gQGluZGV4KClcbiAgICB2YWx1ZXMgPSBAdmFsdWVzKClcbiAgICBpZiBzZWxlY3Rpb24/XG4gICAgICB2YWx1ZXMgPSBzZWxlY3Rpb24ubWFwIChpKT0+IHZhbHVlc1tpbmRleC5pbmRleE9mIGldXG4gICAgdmFsdWVzXG4gIHVwZGF0ZTogLT5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Sb3dcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbHVtbkRhdGFTb3VyY2UgPSByZXF1aXJlICcuL2NvbHVtbl9kYXRhX3NvdXJjZSdcblxuIyBUYWJsZSBhc3NpZ25zIG1ldGFkYXRhIHRvIHRoZSBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuIyBBIHRhYmxlIGlzIGRlc2NyaWJlIGJ5OlxuIyAqIF92YWx1ZXNfIC0gQSBsaXN0IG9mIGxpc3RzIGNvbnRhaW5pbmcgdGhlIHJvdyBlbnRyaWVzIGluIHRoZSB0YWJsZS5cbiMgKiBfY29sdW1uc18gLSBUaGUgY29sdW1uIG5hbWVzIGluIHRoZSB0YWJsZSwgdGhlIGNvbHVtbiBuYW1lcyBtYXAgdGhlIGVudHJpZXMgaW4gZWFjaCByb3dcbiMgKiBfbWV0YWRhdGFfIC1cbiMgVGhlIHRhYmxlIGtleXMgIG5hbWluZyBpcyBpbnNwaXJlZCBieSBgYHBhbmRhcy5EYXRhRnJhbWUudG9fZGljdChvcmllbnQ9J3JlY29yZHMnKS5cblxuY2xhc3MgSW50ZXJhY3RpdmUuVGFibGUgZXh0ZW5kcyBDb2x1bW5EYXRhU291cmNlXG4gICMjIyBSZXR1cm4gdGhlIG1ldGFkYXRhIG9mIHRoZSBjb2x1bW5zICMjI1xuICBtZXRhZGF0YTogKGFyZ3MpLT5cbiAgICBpZiBhcmdzP1xuICAgICAgdG1wID0ge31cbiAgICAgIGFyZ3MuZm9yRWFjaCAoYXJnKT0+IHRtcFthcmddID0gYXJnXG4gICAgICBAX21ldGFkYXRhLnByb2plY3QgdG1wXG4gICAgZWxzZVxuICAgICAgQF9tZXRhZGF0YS5nZXRcblxuICAjIEBwYXJhbSBbQXJyYXldIGNvbHVtbnMgVGhlIG5hbWUgb2YgdGhlIHRhYmxlIGNvbHVtbnNcbiAgIyBAcGFyYW0gW0FycmF5XSB2YWx1ZXMgVGhlIHZhbHVlcyBvZiB0aGUgdGFibGUuXG4gICMgQHBhcmFtIFtPYmplY3RdIG1ldGFkYXRhIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjb2x1bW5zXG4gIGNvbnN0cnVjdG9yOiAoe25hbWUsIHZhbHVlcywgY29sdW1ucywgbWV0YWRhdGF9KS0+XG4gICAgIyMgVGhlIHRhYmxlIGNhbiBiZSByZW5hbWVkICMjI1xuICAgIEBfbmFtZSA9IEBjdXJzb3Iuc2VsZWN0ICduYW1lJ1xuICAgIEBfbmFtZS5zZXQgbmFtZSA/IFwiU29tZSBuYW1lXCJcblxuICAgICMjIyBNZXRhZGF0YSBpcyBhdCB0aGUgdGFibGUgbGV2ZWwsIGJlY2F1c2UgaXQgc2V0cyB0eXBlcyBvZiB0aGUgdGFibGUgIyMjXG4gICAgQF9tZXRhZGF0YSA9IEBjdXJzb3Iuc2VsZWN0ICdtZXRhZGF0YSdcbiAgICBAX21ldGFkYXRhLnNldCBAX21ldGFkYXRhLmdldCgpID8gbWV0YWRhdGFcblxuICAgIHN1cGVyIHZhbHVlcywgY29sdW1uc1xuICAgIEBjb21wdXRlKClcbiMjI1xuQSBmb3JtYXR0ZWQgc3RyaW5nIG9mIHRoZSB0YWJsZS5cbiMjI1xuSW50ZXJhY3RpdmUuVGFibGU6OnRvX3N0cmluZyA9IC0+XG4jIyNcbkpTT05pZnkgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHRhYmxlLlxuXG5AcGFyYW0gW0Jvb2xlYW5dIGluZGV4IFRydWUgaW5jbHVkZXMgdGhlIGluZGV4IGluIHRoZSBKU09OIHN0cmluZy5cbiMjI1xuSW50ZXJhY3RpdmUuVGFibGU6OnRvX2pzb24gPSAoKS0+XG4gIEpTT04uc3RyaW5naWZ5XG4gICAgY29sdW1uczogQGRlcml2ZWQoKVxuICAgIHZhbHVlczogQGNvbHVtbl9kYXRhX3NvdXJjZShAZGVyaXZlZCgpLi4uKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iXX0=
