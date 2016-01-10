(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Baobab, CoffeeTable, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

CoffeeTable = (function(superClass) {
  extend(CoffeeTable, superClass);

  CoffeeTable.prototype.version = '0.1.0';

  function CoffeeTable(url_or_record_array, done) {
    var ref;
    if ((ref = typeof url_or_record_array) === 'string') {
      d3.json(url_or_record_array, (function(_this) {
        return function(d) {
          CoffeeTable.__super__.constructor.call(_this, d);
          return _this.cursor.set('url', url_or_record_array);
        };
      })(this));
    } else {
      CoffeeTable.__super__.constructor.call(this, url_or_record_array);
    }
  }

  return CoffeeTable;

})(require('./interactive'));

window.table = new CoffeeTable({
  columns: ['x', 'y'],
  values: [[1, 2], [3, 8], [-1, 4], [5, 7]]
});

window.square = new CoffeeTable({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaW5kZXguY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3Jvd3MuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3RhYmxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsdUJBQUE7RUFBQTs7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7O0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErRU07Ozt3QkFDSixPQUFBLEdBQVM7O0VBSUkscUJBQUMsbUJBQUQsRUFBc0IsSUFBdEI7QUFDWCxRQUFBO0lBQUEsV0FBRyxPQUFPLG9CQUFQLEtBQWdDLFFBQW5DO01BQ0UsRUFBRSxDQUFDLElBQUgsQ0FBUSxtQkFBUixFQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtVQUMzQiw4Q0FBTSxDQUFOO2lCQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLEtBQVosRUFBbUIsbUJBQW5CO1FBRjJCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixFQURGO0tBQUEsTUFBQTtN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LFNBQW5CLEdBQStCLFNBQUEsR0FBQTs7O0FBQy9COzs7Ozs7QUFLQSxXQUFXLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxPQUFuQixHQUE2QixTQUFBO1NBQzNCLElBQUksQ0FBQyxTQUFMLENBQ0U7SUFBQSxPQUFBLEVBQVMsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFUO0lBQ0EsTUFBQSxFQUFRLElBQUMsQ0FBQSxrQkFBRCxhQUFvQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQXBCLENBRFI7R0FERjtBQUQyQjs7QUFLN0IsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuZDMgPSByZXF1aXJlIFwiZDNcIlxuIyMjXG5pbnRlcmFjdGl2ZSB0YWJ1bGFyIGRhdGEsIG9wdGltaXplZCBmb3IgdGhlIGJyb3dzZXJcblxuQGV4YW1wbGUgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIENvZmZlZVRhYmxlXG4gIHRhYmxlID0gbmV3IENvZmZlZVRhYmxlXG4gICAgbmFtZTogXCJQb2x5Z29uXCJcbiAgICByZWFkbWU6IFwiQSByZWN0YW5nbGVcIlxuICAgIG1ldGFkYXRhOiB7eDonaG9yaXpvbnRhbCBkaXJlY3Rpb24nLHk6J3ZlcnRpY2FsIGRpcmVjdGlvbid9XG4gICAgY29sdW1uczogWyd4JywgJ3knXVxuICAgIHZhbHVlczogW1sxLCAzXSxbMiwgOF0sWzMsMTNdXVxuXG5AZXhhbXBsZSBBZGQgYSBjb2x1bW4gb2YgZGF0YSB3aXRoIENvbmNhdFxuICB0YWJsZS5jb25jYXRcbiAgICBjb2x1bW5zOlxuICAgICAgejogWzUsIDQsIDNdXG5cbkBleGFtcGxlIEFkZCB0d28gcm93cyBvZiBkYXRhIHdpdGggQ29uY2F0XG4gIHRhYmxlLmNvbmNhdFxuICAgIHZhbHVlczogW1xuICAgICAgWzQsIDE4LCAyXVxuICAgICAgWzUsIDIzLCAxXVxuICAgIF1cblxuQGV4YW1wbGUgQWRkIGEgbmV3IGNvbHVtbiB0aGF0IGlzIGEgZnVuY3Rpb24gb2YgZXhpc3RpbmcgY29sdW1ucyB4IGFuZCB5XG4gIHRhYmxlLnRyYW5zZm9ybVxuICAgIHQ6ICd4JywgJ3knLCAoeCwgeSktPlxuICAgICAgZDMuemlwKHgsIHkpLm1hcCAodiktPiBNYXRoLnRhbiB2WzFdLyB2WzBdXG5cbkBleGFtcGxlIE1ha2UgYSBjaGVja3BvaW50IG9yIHN0b3JlIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBjb2x1bW5zIGFuZCB2YWx1ZXMgdG8gcmV1c2UgbGF0ZXIuXG4gIHRhYmxlLmNvbXB1dGUoKVxuXG5AZXhhbXBsZSBDcmVhdGUgYSBuZXcgY29weSB3aXRoIHRoZSB4IGFuZCBhbmdsZSBjb2x1bW5zXG4gIHZlY3RvcnMgPSB0YWJsZS5wcm9qZWN0aW9uICd4JywndCdcbiAgICAuY29weSgpXG5cblRoZSBzdGF0ZSBvZiB0aGUgdGFibGUgIGlzIHN0aWxsIHRoZSBwcm9qZWN0IG9mIHggYW5kIHQuXG5cbkBleGFtcGxlIFJldmVydCB0aGUgdGFibGUgYmFjayB0byB0aGUgbGFzdCBjaGVja3BvaW50LlxuICB0YWJsZS5yZXdpbmQoKVxuXG5Ob3cgdGhlIHRhYmxlIGhhcyBmb3IgY29sdW1uc1xuXG4gIGFsZXJ0IHRhYmxlLm5hbWUoKSArICcgaGFzICcgKyB0YWJsZS5pbmRleCgpLmxlbmd0aCArICcgcm93ICBhbmQgdGhlIGZpZWxkczogJyArIHRhYmxlLmNvbHVtbnMoKS5qb2luKCcsICcpWy4uLTJdXG5cbkBleGFtcGxlIEFkZCBhIGNhdGVnb3JpY2FsIGNvbHVtbnNcbiAgdGFibGUudHJhbnNmb3JtXG4gICAgICAnY29sb3InOiAneScsICh5KS0+IHkubWFwICh2KS0+IFsncmVkJywnZ3JlZW4nLCdibHVlJ11bdiAlJSAxMF1cbiAgICAuY29tcHV0ZSgpXG5cblxuQGV4YW1wbGUgU2VwYXJhdGUgdGhlIHJlZCBhbmQgdGhlIGdyZWVucy5cbiAgZ3JlZW4gPSB0YWJsZS5maWx0ZXIgJ2NvbG9yJywgKGNvbG9yKS0+IGNvbG9yIGluIFsnZ3JlZW4nXVxuICAgIC5jb3B5KClcbiAgcmVkID0gdGFibGUucmV3aW5kKCkuZmlsdGVyICdjb2xvcicsIChjb2xvciktPiBjb2xvciBpbiBbJ3JlZCddXG4gICAgLmNvcHkoKVxuXG5TZXBhcmF0aW5nIGNvbXB1dGUgZnJvbSB0aGUgdmFsdWVzLlxuXG5Db2ZmZWVUYWJsZSBzdG9yZXMgYSBoaXN0b3J5IG9mIHRoZSB0cmFuc2Zvcm1hdGlvbnNcblxuQGV4YW1wbGUgU2hvdyBUYWJsZSBFeHByZXNzaW9uIGhpc3RvcnlcbiAgdGFibGUuaGlzdG9yeSgpXG4gIHRhYmxlLmV4cHJlc3Npb24oKVxuXG5pbiB0aGUgbmV4dCBleGFtcGxlIGFuIGV4cHJlc3Npb24gaXMgY3JlYXRlZCBvbiB0aGUgZ3JlZW4gdGhlIHRhYmxlIGFuZCBpdHNcbmV4cHJlc3Npb25zIGFyZSBhcHBsaWVkIHRvIHRoZSByZWQgdGFibGUuICBNZXRob2RzIGFyZSBjaGFpbmFibGUuXG5cbkBleGFtcGxlIEFwcGx5IGV4cHJlc3Npb25zIHRvIGdyZWVuIHRoZW4gdXNlIHRoZSBleHByZXNzaW9ucyBvbiByZWRcbiAgZ3JlZW4uc29ydCAneCdcbiAgICAudW5pcXVlKClcbiAgICAudHJhbnNmb3JtXG4gICAgICBwcm9kOiAneCcsICd5JywgKHgseSktPiBkMy56aXAoeCx5KS5tYXAgKHYpLT4gdlsxXSp2WzBdXG5cbiAgcmVkLmV2YWx1YXRlIGdyZWVuLmhpc3RvcnkoKVxuXG5cbj4gTm9uLWNvbHVtbi9vdGhlciBjdXJzb3IgY29udGVudCBpcyBhbiBhcnJheS5cblxuIyMjXG5jbGFzcyBDb2ZmZWVUYWJsZSBleHRlbmRzIHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG4gIHZlcnNpb246ICcwLjEuMCdcbiAgIyBDb25zdHJ1Y3QgYSBjb2xsZWN0aW9uIG9mIENvZmZlZVRhYmxlIGJvb2tzLlxuICAjIEBwYXJhbSBbU3RyaW5nXSB1cmxfb3JfcmVjb3JkX2FycmF5IEEgdXJsIHRvIGEgcmVtb3RlIHJlc291cmNlXG4gICMgQHBhcmFtIFt7bmFtZSxtZXRhZGF0YSxyZWFkbWUsY29sdW1ucyx2YWx1ZXN9XSB1cmxfb3JfcmVjb3JkX2FycmF5IGEgc3RydWN0dXJlZCBvYmplY3QgdG8gY3JlYXRlIGEgbmV3IHRhYmxlXG4gIGNvbnN0cnVjdG9yOiAodXJsX29yX3JlY29yZF9hcnJheSwgZG9uZSktPlxuICAgIGlmIHR5cGVvZih1cmxfb3JfcmVjb3JkX2FycmF5KSBpbiBbJ3N0cmluZyddXG4gICAgICBkMy5qc29uIHVybF9vcl9yZWNvcmRfYXJyYXksIChkKT0+XG4gICAgICAgIHN1cGVyIGRcbiAgICAgICAgQGN1cnNvci5zZXQgJ3VybCcsIHVybF9vcl9yZWNvcmRfYXJyYXlcbiAgICBlbHNlXG4gICAgICBzdXBlciB1cmxfb3JfcmVjb3JkX2FycmF5XG5cbndpbmRvdy50YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZVxuICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gIHZhbHVlczogW1xuICAgIFsxLCAyXVxuICAgIFszLCA4XVxuICAgIFstMSw0XVxuICAgIFs1LDddXG4gIF1cbndpbmRvdy5zcXVhcmUgPSBuZXcgQ29mZmVlVGFibGVcbiAgY29sdW1uczogWyd4JywgJ3knXVxuICB2YWx1ZXM6IFtcbiAgICBbMSwgMV1cbiAgICBbNyw3XVxuICBdXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29mZmVlVGFibGVcbiAgZDNcbiAgQmFvYmFiXG59XG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuQmFvYmFiID0gcmVxdWlyZSBcImJhb2JhYlwiXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5EYXRhU291cmNlID0gcmVxdWlyZSAnLi9kYXRhJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db2x1bW5EYXRhU291cmNlIGV4dGVuZHMgRGF0YVNvdXJjZVxuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIEBfY2RzID0gQGN1cnNvci5zZWxlY3QgJ2NvbHVtbl9kYXRhX3NvdXJjZSdcbiAgICBzdXBlciB2YWx1ZXMsIGNvbHVtbnNcbiAgICBjb2x1bW5zLm1hcCAoY29sdW1uX25hbWUpPT4gQGFwcGx5IGNvbHVtbl9uYW1lXG5cbiAgIyMjIENyZWF0ZSBhIG5ldyBpbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuICB0YWJsZS5hcHBseSAnbWVhbicsIFsneCcsJ3knXSwgKHgseSktPiBkMy56aXAoeCx5KS5tYXAgKHYpLT4gZDMubWVhbiB2XG4gIHRhYmxlLnByb2plY3Rpb24oKVxuICAjIyNcbiAgYXBwbHk6IChhcmdzLi4uKS0+IEBfYWRkX2Rlcml2ZWRfY29sdW1uIGFyZ3MuLi5cblxuICAjIyNcbiAgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIGN1cnNvciB0aGF0IGRlZmluZXMgYSBuZXcgQ29sdW1uIERhdGEgU291cmNlXG4gICMjI1xuICBfYWRkX2Rlcml2ZWRfY29sdW1uOiAobmFtZSwgY3Vyc29ycywgZm4pLT5cbiAgICBjdXJzb3JzID89IFtbJ2NvbHVtbnMnLDBdLFsndmFsdWVzJ10sWycuJywnbmFtZSddXVxuICAgIGZuID89IChjb2x1bW5zLHZhbHVlcyxjb2x1bW5fbmFtZSktPlxuICAgICAgY29sdW1uX2luZGV4ID0gY29sdW1ucy5pbmRleE9mIGNvbHVtbl9uYW1lXG4gICAgICB2YWx1ZXMubWFwIChyb3dfdmFsdWVzKS0+IHJvd192YWx1ZXNbY29sdW1uX2luZGV4XVxuICAgIEBfY2RzLnNldCBuYW1lLFxuICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIHZhbHVlczogQmFvYmFiLm1vbmtleSBjdXJzb3JzLi4uLCBmblxuICAgICMjIyBBbHdheXMgcHVzaCBkZXJpdmVkIGNvbHVtbnMgdG8gc2Vjb25kIHBhcnQgb2YgY29sdW1ucyAjIyNcbiAgICB1bmxlc3MgbmFtZSBpbiBbJ2luZGV4JyxAZGVyaXZlZCgpLi4uXVxuICAgICAgQF9jb2x1bW5zLnNlbGVjdCgxKS5wdXNoIG5hbWVcblxuXG4gICMjIyBBcHBlbmQgY29sdW1ucyBvciByb3dzIHdpdGhvdXQgbW9ua2V5cyAjIyNcbiAgY29uY2F0OiAoe2NvbHVtbnMsdmFsdWVzfSktPlxuICAgIGlmIGNvbHVtbnM/XG4gICAgICAjYWxlcnQgSlNPTi5zdHJpbmdpZnkgY29sdW1uc1xuICAgICAgZDMuZW50cmllcyhjb2x1bW5zKS5mb3JFYWNoICh7a2V5LCB2YWx1ZX0pPT5cbiAgICAgICAgIyMjIEFwcGVuZCB0aGUgdmFsdWUgdG8gdGhlIHJhdyBjb2x1bW5zICMjI1xuICAgICAgICBAX2NvbHVtbnMuc2VsZWN0KDApLnB1c2gga2V5XG4gICAgICAgIEBfdmFsdWVzLnNldCBAdmFsdWVzKCkubWFwIChyb3csaSk9PiBbcm93Li4uLHZhbHVlW2ldXVxuICAgICAgICBAX2FkZF9kZXJpdmVkX2NvbHVtbiBrZXlcbiAgICBzdXBlciB2YWx1ZXNcblxuXG4gIGNvbHVtbl9kYXRhX3NvdXJjZTogKGNvbHVtbnMuLi4pLT5cbiAgICBpZiBjb2x1bW5zLmxlbmd0aCA9PSAwIHRoZW4gY29sdW1ucyA9IEBkZXJpdmVkKClcbiAgICBkMy56aXAgY29sdW1ucy5tYXAoIChjKSA9PiBAX2Nkcy5nZXQoYywndmFsdWVzJykpLi4uXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29sdW1uRGF0YVNvdXJjZVxuIiwiZDMgPSByZXF1aXJlICdkMydcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkV4cHJlc3Npb24gPSByZXF1aXJlICcuL2V4cHJlc3Npb24nXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbiBleHRlbmRzIEV4cHJlc3Npb25cbiAgY29sdW1uczogKCktPiBkMy5tZXJnZSBAX2NvbHVtbnMuZ2V0KClcblxuICByYXc6ICgpLT4gQF9jb2x1bW5zLmdldCAwXG4gIGRlcml2ZWQ6ICgpLT4gQF9jb2x1bW5zLmdldCAxXG5cbiAgY29uc3RydWN0b3I6IChjb2x1bW5zKS0+XG4gICAgQF9jb2x1bW5zID0gQGN1cnNvci5zZWxlY3QgJ2NvbHVtbnMnXG4gICAgIyBbcmF3X2NvbHVtbnMsIGRlcml2ZWRfY29sdW1uc11cbiAgICBAX2NvbHVtbnMuc2V0IFtjb2x1bW5zLFtdXSA/IFtbXSxbXV1cbiAgICAjIyMgdXBkYXRlIHRoZSB2YWx1ZXMgd2hlbiB0aGUgcmF3X2NvbHVtbnMgY2hhbmdlXG4gICAgQF9jb2x1bW5zLnNlbGVjdCgxKS5vbiAndXBkYXRlJywgKGV2ZW50KT0+XG4gICAgICBbZXZlbnQuZGF0YS5wcmV2aW91c0RhdGEuLi5dLmZpbHRlciAoZCk9PiBub3QgZCBpbiBldmVudC5kYXRhLmN1cnJlbnREYXRhXG4gICAgICAgIC5mb3JFYWNoIChjb2x1bW5fbmFtZSktPiBAX2Nkc1tjb2x1bW5fbmFtZV0ucmVsZWFzZSgpXG4gICAgIyMjXG4gICAgc3VwZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkNvbHVtblxuIiwiZDMgPSByZXF1aXJlIFwiZDNcIlxuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Db21wdXRlXG4gIGNvbXB1dGU6ICgpLT5cbiAgICAjIyMgQ29tcHV0ZSBjaGFuZ2VzIHRoZSBzdGF0ZSBvZiB0aGUgZGF0YSB0cmVlICMjI1xuICAgIEBfY2hlY2twb2ludC5kZWVwTWVyZ2VcbiAgICAgIG5hbWU6IEBuYW1lKClcbiAgICAgIGluZGV4OiBAaW5kZXgoKVxuICAgICAgcmVhZG1lOiBAcmVhZG1lKClcbiAgICAgIHZhbHVlczogQGNvbHVtbl9kYXRhX3NvdXJjZSgpXG4gICAgICBtZXRhZGF0YTogQG1ldGFkYXRhKClcbiAgICAgIGNvbHVtbnM6IFtAZGVyaXZlZCgpLCBAZGVyaXZlZCgpXVxuXG4gICAgIyMjIFRPRE8gUmVtb3ZlIG9sZCBjb2x1bW5zICMjI1xuICAgIHRoaXNcblxuICByZXdpbmQ6ICgpLT5cbiAgICBAY3Vyc29yLmRlZXBNZXJnZVxuICAgICAgaW5kZXg6IEBfY2hlY2twb2ludC5nZXQgJ2luZGV4J1xuICAgICAgY29sdW1uczogQF9jaGVja3BvaW50LmdldCAnY29sdW1ucydcbiAgICAgIHZhbHVlczogQF9jaGVja3BvaW50LmdldCAndmFsdWVzJ1xuICAgICAgbWV0YWRhdGE6IEBfY2hlY2twb2ludC5nZXQgJ21ldGFkYXRhJ1xuICAgIEBfY29sdW1ucy5zZWxlY3QoMCkuc2V0IEBfY2hlY2twb2ludC5nZXQgJ2NvbHVtbnMnXG4gICAgdGhpc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuQ29tcHV0ZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuUm93ID0gcmVxdWlyZSAnLi9yb3dzJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5EYXRhU291cmNlIGV4dGVuZHMgUm93XG4gIHZhbHVlczogKCktPiBAX3ZhbHVlcy5nZXQoKVxuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIEBfdmFsdWVzID0gQGN1cnNvci5zZWxlY3QgJ3ZhbHVlcydcbiAgICBAX3ZhbHVlcy5zZXQgdmFsdWVzID8gW11cbiAgICBzdXBlciB2YWx1ZXMsIGNvbHVtbnNcblxuICBjb25jYXQ6ICh2YWx1ZXMpLT5cbiAgICB2YWx1ZXM/LmZvckVhY2ggKHJvdyk9PiBAX3ZhbHVlcy5wdXNoIHJvd1xuICAgIHN1cGVyIHZhbHVlcz8ubGVuZ3RoID8gMFxuICAgIHRoaXNcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5EYXRhU291cmNlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5IaXN0b3J5ID0gcmVxdWlyZSAnLi9oaXN0b3J5J1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uIGV4dGVuZHMgSGlzdG9yeVxuICBleHByZXNzaW9uOiAoKS0+IEBfZXhwcmVzc2lvbi5nZXQoKVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZXhwcmVzc2lvbnMgPSBbXVxuICAgIEBfZXhwcmVzc2lvbiA9IEBjdXJzb3Iuc2VsZWN0ICdleHByZXNzaW9uJ1xuICAgIEBfZXhwcmVzc2lvbi5zZXQgW11cbiAgICBzdXBlcigpXG5cbiAgZXhlY3V0ZTogKGV4cHJlc3Npb25zKS0+XG4gICAgZXhwcmVzc2lvbnMuZm9yRWFjaCAgKGV4cHJlc3Npb24sZXhwcmVzc2lvbl9jb3VudCk9PlxuICAgICAgQFtleHByZXNzaW9uWzBdXSBleHByZXNzaW9uWzEuLl0uLi5cbiAgICBAY29tcHV0ZSgpXG5cbiAgZ2V0OiAoYXJncy4uLiktPiBAY3Vyc29yLmdldCBhcmdzLi4uXG4gIHNldDogKGFyZ3MuLi4pLT4gQGN1cnNvci5zZXQgYXJncy4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkV4cHJlc3Npb25cbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbXB1dGUgPSByZXF1aXJlICcuL2NvbXB1dGUnXG5cbmNsYXNzIEludGVyYWN0aXZlLkhpc3RvcnkgZXh0ZW5kcyBDb21wdXRlXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfY2hlY2twb2ludCA9IEBjdXJzb3Iuc2VsZWN0ICdjaGVja3BvaW50J1xuICAgIEBfY2hlY2twb2ludC5zZXQge31cbiAgICBAX2V4cHJlc3Npb24uc3RhcnRSZWNvcmRpbmcgMjBcbiAgICBzdXBlcigpXG4gIGhpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5nZXRIaXN0b3J5KClcbiAgY2xlYXJfaGlzdG9yeTogLT4gQF9leHByZXNzaW9uLmNsZWFySGlzdG9yeSgpXG4gIHJlY29yZDogKGV4cHJlc3Npb24pLT5cbiAgICBAZXhwcmVzc2lvbnMucHVzaCBleHByZXNzaW9uXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuSGlzdG9yeVxuIiwiQmFvYmFiID0gcmVxdWlyZSAnYmFvYmFiJ1xuZDMgPSByZXF1aXJlICdkMydcblRhYmxlID0gcmVxdWlyZSAnLi90YWJsZSdcblxuIyMjXG5BbiBJbnRlcmFjdGl2ZSBUYWJsZSB1c2VzIGltbXV0YWJsZSBjdXJzb3IgdHJlZXMgdG8gdHJhY2sgdGhlIGV2b2x1dGlvbiBoaXN0b3J5IGF0IGEgdGFibGUgc3RhdGUuXG4gIEl0IGlzIHNpbWlsYXIgdG8gYSBEYXRhRnJhbWUgYmVjYXVzZSBpdCdzIHJvd3MgYW5kIGNvbHVtbnMgY2FuIGJlIGFjY2Vzc2VkIGluZGVwZW5kZW50bHkuICBUaGVcbnN0YXRlIG9mIHRoZSB0YWJsZSBjYW4gYmUgdXNlZCB0byBwdWJsaXNoIGRhdGEtZHJpdmVuIGNvbnRlbnQgdG8gYSB3ZWJwYWdlLiAgTW9zdFxuZGF0YSB0aGF0IGlzIGdlbmVyYXRlZCBmcm9tIGFuIEFQSSBlbmRwb2ludCBjYW4gYmUgcmVwcmVzZW50ZWQgYXMgYSB0YWJsZTsgbW9yZVxuY29tcGxleCBzY2VuYXJpb3MgY2FuIGJlIGRlY291cGxlZCB0byBpbmRlcGVuZGVudCB0YWJsZXMuICBEZWNvdXBsZWQgdGFibGVzIGNhbiBtYW5pcHVsYXRlZFxuaW5kZXBlbmRlbnRseSBhbmQgam9pbmVkIHdpdGggb3RoZXIgdGFibGVzLlxuXG4jIyNcbmNsYXNzIEludGVyYWN0aXZlIGV4dGVuZHMgVGFibGVcbiAgIyMjIFRhYmxlIG5hbWUgQmFvYmFiIGN1cnNvciAjIyNcbiAgbmFtZTogKCktPiBAX25hbWUuZ2V0KClcbiAgIyMjIFRhYmxlIGluZm9ybWF0aW9uIGluIHJlYWRtZSBCYW9iYWIgY3Vyc29yICMjI1xuICByZWFkbWU6ICgpLT4gQF9yZWFkbWUuZ2V0KClcbiAgIyMjIFJlc2V0IHRoZSBUYWJsZSBiYWNrIHRvIHN0YXRlIHdoZW4gdGhlIGxhc3QgbmV3IGNsYXNzIHdhcyBpbnN0YW50aWF0ZWQgICMjI1xuICByZXNldDogKCktPlxuICAgIEBjdXJzb3IuZGVlcE1lcmdlIEBfaW5pdC5nZXQoKVxuICAgIHRoaXNcblxuICAjIyNcbiAgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIHRhYmxlLlxuXG4gIEBwYXJhbSBbe2NvbHVtbnMsIHZhbHVlcywgcmVhZG1lLCBtZXRhZGF0YX1dIHJlY29yZF9vcmllbnRfZGF0YSBSZWNvcmQgb3JpZW50IGRhdGEgY29udGFpbnMgdGhlIGNvbHVtbnMgYW5kXG4gIHZhbHVlcy5cblxuICBAZXhhbXBsZSBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgdGFibGVcbiAgICB0YWJsZSA9IG5ldyBDb2ZmZWVUYWJsZVxuICAgICAgY29sdW1uczogWyd4JywgJ3knXVxuICAgICAgdmFsdWVzOiBbXG4gICAgICAgIFsxLCAyXVxuICAgICAgICBbMywgOF1cbiAgICAgICAgWy0xLDRdXG4gICAgICAgIFs1LDddXG4gICAgICBdXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKHJlY29yZF9vcmllbnRfZGF0YSktPlxuXG4gICAgQHRyZWUgPSBuZXcgQmFvYmFiIHJlY29yZF9vcmllbnRfZGF0YVxuICAgIEBjdXJzb3IgPSBAdHJlZS5zZWxlY3QgMFxuXG4gICAgQF9pbml0ID0gQGN1cnNvci5zZWxlY3QgJ2luaXQnXG4gICAgQF9pbml0LnNldCByZWNvcmRfb3JpZW50X2RhdGFcblxuICAgIEBfcmVhZG1lID0gQGN1cnNvci5zZWxlY3QgJ3JlYWRtZSdcbiAgICBAX3JlYWRtZS5zZXQgcmVjb3JkX29yaWVudF9kYXRhLnJlYWRtZSA/IFwiXCJcblxuICAgIHN1cGVyIEBjdXJzb3IucHJvamVjdFxuICAgICAgbmFtZTogWyduYW1lJ11cbiAgICAgIHZhbHVlczogWyd2YWx1ZXMnXVxuICAgICAgY29sdW1uczogWydjb2x1bW5zJ11cbiAgICAgIG1ldGFkYXRhOiBbJ21ldGFkYXRhJ11cblxuICAgIEB0cmVlLm9uICd3cml0ZScsIChldmVudCktPlxuICAgICAgIyBUaGlzIGlzIHRoZSBjdXJzb3IgdHJlZSBjb250ZXh0XG4gICAgICBpZiAnaW5kZXgnIGluIGV2ZW50LmRhdGEucGF0aCBhbmQgZXZlbnQuZGF0YS5wYXRoLmxlbmd0aCA9PSAxXG4gICAgICAgIHZhbHVlcyA9IEBnZXQgJ3ZhbHVlcydcbiAgICAgICAgbmV3X2luZGV4ID0gQGdldCAnaW5kZXgnXG4gICAgICAgIG9sZF9pbmRleCA9IEBzZWxlY3QoJ2luZGV4JykuZ2V0SGlzdG9yeSgxKVswXSA/IGQzLnJhbmdlIG5ld19pbmRleC5sZW5ndGhcbiAgICAgICAgQHNldCAndmFsdWVzJywgbmV3X2luZGV4Lm1hcCAoaSk9PiB2YWx1ZXNbb2xkX2luZGV4LmluZGV4T2YgaV1cbiAgICBAY29tcHV0ZSgpXG5cbiAgIyMjXG4gIFByb2plY3Qgc2VsZWN0cyBhIHN1YnNldCBvZiBjb2x1bW5zXG4gIEBleGFtcGxlIFNlbGVjdGlvbiB0aGUgaW5kZXgsIHgsIGFuZCB5XG4gICAgdGFibGUucHJvamVjdGlvbiAnaW5kZXgnLCd4JywneSdcbiAgIyMjXG4gIHByb2plY3Rpb246IChjb2x1bW5zLi4uKS0+XG4gICAgQF92YWx1ZXMuc2V0IEBjb2x1bW5fZGF0YV9zb3VyY2UgY29sdW1ucy4uLlxuICAgIEBfY29sdW1ucy5zZWxlY3QoMCkuc2V0IEBkZXJpdmVkKClcbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ3Byb2plY3Rpb24nLCBjb2x1bW5zLi4uXVxuICAgIHRoaXNcblxuICAjIyNcbiAgVHJhbnNmb3JtIGFkZHMgbmFtZWQgY29sdW1ucyB0byB0aGUgdGFibGVcbiAgQHBhcmFtIFtPYmplY3RdIHRyYW5zZm9ybWVycyBpcyBhbiBvYmplY3Qgb2YgbmFtZWQgY29sdW1ucy4gIFRoZSBuZXcgY29sdW1uc1xuICBhcmUgZGVmaW5lZCBieSBgYGN1cnNvcnNgYCBhbmQgYSBmdW5jdGlvbiBgYGZuYGAuXG4gIEBleGFtcGxlIENyZWF0ZSB0d28gbmV3IGNvbHVtbnMgbWVhbiBhbmQgc3RkLlxuICAgIHRhYmxlLnRyYW5zZm9ybVxuICAgICAgbWVhbjogeyBjdXJzb3JzOiBbJ3gnLCd5J10sIGZuOiAoeCx5KS0+ICh4K3kpLzIgfVxuICAgICAgc3RkOiB7IGN1cnNvcnM6IFsneCcsJ3knXSwgZm46IHJlcXVpcmUoJ2QzJykuZGV2aWF0aW9uIH1cbiAgIyMjXG4gIHRyYW5zZm9ybTogKHRyYW5zZm9ybWVycyktPlxuICAgIGQzLmVudHJpZXMgdHJhbnNmb3JtZXJzXG4gICAgICAuZm9yRWFjaCAoe2tleSx2YWx1ZX0pPT5cbiAgICAgICAgW2N1cnNvcnMuLi4sZm5dID0gdmFsdWVcbiAgICAgICAgQF9hZGRfZGVyaXZlZF9jb2x1bW4ga2V5LCBjdXJzb3JzLm1hcCgoY29sKS0+Wydjb2x1bW5fZGF0YV9zb3VyY2UnLGNvbCwndmFsdWVzJ10pLCBmblxuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsndHJhbnNmb3JtJywgdHJhbnNmb3JtZXJzXVxuICAgIHRoaXNcblxuICAjIyNcbiAgRmlsdGVyIGVsZW1lbnRzIGNvbHVtbnMgYmFzZWQgb24gYSBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gIEBwYXJhbSBbU3RyaW5nXSBjb2x1bW5zIGEgbGlzdCBvZiBjb2x1bW5zIHRvIGluY2x1ZGUgaW4gdGhlIHByZWRpY2F0ZSBmdW5jdGlvblxuICBAcGFyYW0gW0Z1bmN0aW9uXSBmbiBhIHByZWRpY2F0ZSBmdW5jdGlvbiB3aXRoIGFjY2VzcyB0byBlYWNoIG9mIHRoZSBjb2x1bW5zLlxuXG4gIEBleGFtcGxlIEZpbHRlciBjb2x1bW5zIGBgeGBgIGFuZCBgYHlgYFxuICAgIHRhYmxlLmZpbHRlciAneCcsJ3knLCAoeCx5KS0+IHggPiAwIGFuZCB5IDwgNVxuICAjIyNcbiAgZmlsdGVyOiAoY29sdW1ucy4uLiwgZm4pLT5cbiAgICB2YWx1ZXMgPSBAY29sdW1uX2RhdGFfc291cmNlIGNvbHVtbnMuLi5cbiAgICBuZXdfdmFsdWVzID0gdmFsdWVzLmZpbHRlciBmblxuICAgIEBpbmRleC5zZXQgbmV3X3ZhbHVlcy5tYXAgKHYpPT4gdmFsdWVzLmluZGV4T2YgdlxuICAgIEB2YWx1ZXMuc2V0IHZhbHVlc1xuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsnZmlsdGVyJywgY29sdW1ucy4uLiwgZm4udG9TdHJpbmcoKV1cbiAgICB0aGlzXG5cbiAgIyMjXG4gIENvbmNhdGVuYXRlIG5ldyB2YWx1ZXMgdG8gdGhlIHRhYmxlLlxuICBAcGFyYW0gW09iamVjdF0gbmV3X3ZhbHVlcyByZXNwb25kcyB0byB0aGUga2V5cyBgYGNvbHVtbnNgYCBhbmQgYGB2YWx1ZXNgYCB0b1xuICBhcHBlbmQgaW4gdGhlIGNvbHVtbiBkaXJlY3Rpb24gb3Igcm93IGRpcmVjdGlvbiwgcmVzcGVjdGl2ZWx5LlxuICBAZXhhbXBsZSBBZGQgYSBUd28gUm93c1xuICAgIHRhYmxlLmNvbmNhdFxuICAgICAgdmFsdWVzOiBbXG4gICAgICAgIFstMyw0XVxuICAgICAgICBbMSw5XVxuICAgICAgXVxuICBAZXhhbXBsZSBBZGQgT25lIENvbHVtbi4gIFRoZSBBcnJheSBoYXMgYSBsZW5ndGggb2Ygc2l4IGJlY2F1c2UgdHdvIHJvd3Mgd2VyZSBqdXN0IGFkZGVkLlxuICAgIHRhYmxlLmNvbmNhdFxuICAgICAgY29sdW1uczpcbiAgICAgICAgejogWy0zLDQsMSw5LDYsLTRdXG4gICMjI1xuICBjb25jYXQ6ICh2YWx1ZV9vYmplY3QpLT5cbiAgICBzdXBlciB2YWx1ZV9vYmplY3RcbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ2NvbmNhdCcsdmFsdWVfb2JqZWN0XVxuICAgIHRoaXNcblxuICAjIyNcbiAgQXBwbHkgYSBmdW5jdGlvbiB0byBhIGNvbHVtblxuICBAZXhhbXBsZSBBcHBseSBhIGZ1bmN0aW9uIHRvIHggZGVwZW5kaW5nIG9uIHlcbiAgICB0YWJsZS5hcHBseSAneCcsIFsneCcsJ3knXSwgKHgseSktPiBkMy56aXAoeCx5KS5tYXAgKHYpLT4gZDMubWVhbiB2XG4gICMjI1xuICBhcHBseTogKGFyZ3MuLi4pLT5cbiAgICBzdXBlciBhcmdzIC4uLlxuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsnYXBwbHknLGFyZ3MubWFwIChhcmcpLT4gSlNPTi5wYXJzZSBKU09OLnN0cmluZ2lmeSBhcmddXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmVcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcbmQzID0gcmVxdWlyZSAnZDMnXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Db2x1bW4gPSByZXF1aXJlICcuL2NvbHVtbnMnXG5cbmNsYXNzIEludGVyYWN0aXZlLlJvdyBleHRlbmRzIENvbHVtblxuICBsZW5ndGg6ICgpLT4gQGN1cnNvci5nZXQoJ2xlbmd0aCcpIC0gMVxuICBpbmRleDogKGFyZ3MuLi4pLT4gQF9pbmRleC5nZXQgYXJncy4uLlxuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIEBfaW5kZXggPSBAY3Vyc29yLnNlbGVjdCAnaW5kZXgnXG4gICAgQF9pbmRleC5zdGFydFJlY29yZGluZyAxXG4gICAgIyMjQF9pbmRleC5vbiAndXBkYXRlJywgKGV2ZW50KT0+XG4gICAgICBuZXdfaW5kZXggPSBldmVudC5kYXRhLmN1cnJlbnREYXRhXG4gICAgICBpZiBldmVudC5kYXRhLnByZXZpb3VzRGF0YT9cbiAgICAgICAgYWxlcnQgMVxuICAgICAgICBvbGRfaW5kZXggPSBldmVudC5kYXRhLnByZXZpb3VzRGF0YVxuICAgICAgICBuZXdfaW5kZXggPSBuZXdfaW5kZXgubWFwIChpKT0+IG9sZF9pbmRleC5pbmRleE9mIGlcbiAgICAgICAgdmFsdWVzID0gQHZhbHVlcygpXG4gICAgICAgIEBfdmFsdWVzLnNldCBuZXdfaW5kZXgubWFwIChpKT0+IHZhbHVlc1tpXVxuICAgICAgICBAdHJlZS5jb21taXQoKVxuICAgICMjI1xuICAgIEBfbGVuZ3RoID0gQGN1cnNvci5zZWxlY3QgJ2xlbmd0aCdcbiAgICBAX2xlbmd0aC5zZXQgQmFvYmFiLm1vbmtleSBbJ3ZhbHVlcyddLCAodmFsdWVzKS0+IHZhbHVlcy5sZW5ndGhcbiAgICBAX2luZGV4LnNldCBkMy5yYW5nZSB2YWx1ZXMubGVuZ3RoXG5cbiAgICBzdXBlciBjb2x1bW5zXG4gICAgQF9hZGRfZGVyaXZlZF9jb2x1bW4gJ2luZGV4JywgW1snaW5kZXgnXV0sIChpbmRleCktPiBpbmRleFxuXG5cbiAgIyMjIEZ1bmN0aW9uIHRvIHJlb3JkZXIgdGhlIHRhYmxlIGVsZW1lbnRzIHdoZW4gdGhlIGluZGV4IGlzIHVwZGF0ZWQgIyMjXG4gIHVwZGF0ZV9pbmRleF9hbmRfdmFsdWVzOiAobmV3X2luZGV4KS0+XG4gICAgbmV3X2luZGV4ID0gbmV3X2luZGV4Lm1hcCAoaSk9PiBvbGRfaW5kZXguaW5kZXhPZiBpXG5cbiAgIyMjXG4gIFVwZGF0ZSB0aGUgaW5kZXggd2hlbiBhIHJvdyBpcyBjb25jYXRlbmF0ZWQuXG4gICMjI1xuICBjb25jYXQ6IChsZW5ndGgpLT5cbiAgICBpID0gQGluZGV4KClcbiAgICBtYXggPSBNYXRoLm1heChpLi4uKSArIDFcbiAgICBbMC4ubGVuZ3RoLTFdLm1hcCAoaik9PiBAX2luZGV4LnB1c2ggbWF4ICsgalxuXG5cbiAgIyMjXG4gIHRhYmxlLmlsb2MgWzIsM11cbiAgdGFibGUuX2luZGV4LnNldCBbMiwzLDAsMV1cbiAgdGFibGUuaWxvYyBbMiwzXVxuICBAcGFyYW0gW0FycmF5XSBzZWxlY3Rpb24gc2VsZWN0aW9uIG9mIHRoZSBpbmRpY2VzIG9mIHRoZSByb3dzLlxuICAjIyNcbiAgaWxvYzogIChzZWxlY3Rpb24pLT5cbiAgICBpbmRleCA9IEBpbmRleCgpXG4gICAgdmFsdWVzID0gQHZhbHVlcygpXG4gICAgaWYgc2VsZWN0aW9uP1xuICAgICAgdmFsdWVzID0gc2VsZWN0aW9uLm1hcCAoaSk9PiB2YWx1ZXNbaV1cbiAgICB2YWx1ZXNcbiAgIyMjXG4gIHRhYmxlLmxvYyBbMiwzXVxuICB0YWJsZS5faW5kZXguc2V0IFsyLDMsMCwxXVxuICB0YWJsZS5sb2MgWzIsM11cbiAgQHBhcmFtIFtBcnJheV0gc2VsZWN0aW9uIHNlbGVjdGlvbiBvZiB0aGUgaWRzIG9mIHRoZSByb3dzLlxuICAjIyNcbiAgbG9jOiAoc2VsZWN0aW9uKS0+XG4gICAgaW5kZXggPSBAaW5kZXgoKVxuICAgIHZhbHVlcyA9IEB2YWx1ZXMoKVxuICAgIGlmIHNlbGVjdGlvbj9cbiAgICAgIHZhbHVlcyA9IHNlbGVjdGlvbi5tYXAgKGkpPT4gdmFsdWVzW2luZGV4LmluZGV4T2YgaV1cbiAgICB2YWx1ZXNcbiAgdXBkYXRlOiAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlJvd1xuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuQ29sdW1uRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4vY29sdW1uX2RhdGFfc291cmNlJ1xuXG4jIFRhYmxlIGFzc2lnbnMgbWV0YWRhdGEgdG8gdGhlIEludGVyYWN0aXZlIGRhdGEgc291cmNlXG4jIEEgdGFibGUgaXMgZGVzY3JpYmUgYnk6XG4jICogX3ZhbHVlc18gLSBBIGxpc3Qgb2YgbGlzdHMgY29udGFpbmluZyB0aGUgcm93IGVudHJpZXMgaW4gdGhlIHRhYmxlLlxuIyAqIF9jb2x1bW5zXyAtIFRoZSBjb2x1bW4gbmFtZXMgaW4gdGhlIHRhYmxlLCB0aGUgY29sdW1uIG5hbWVzIG1hcCB0aGUgZW50cmllcyBpbiBlYWNoIHJvd1xuIyAqIF9tZXRhZGF0YV8gLVxuIyBUaGUgdGFibGUga2V5cyAgbmFtaW5nIGlzIGluc3BpcmVkIGJ5IGBgcGFuZGFzLkRhdGFGcmFtZS50b19kaWN0KG9yaWVudD0ncmVjb3JkcycpLlxuXG5jbGFzcyBJbnRlcmFjdGl2ZS5UYWJsZSBleHRlbmRzIENvbHVtbkRhdGFTb3VyY2VcbiAgIyMjIFJldHVybiB0aGUgbWV0YWRhdGEgb2YgdGhlIGNvbHVtbnMgIyMjXG4gIG1ldGFkYXRhOiAoYXJncyktPlxuICAgIGlmIGFyZ3M/XG4gICAgICB0bXAgPSB7fVxuICAgICAgYXJncy5mb3JFYWNoIChhcmcpPT4gdG1wW2FyZ10gPSBhcmdcbiAgICAgIEBfbWV0YWRhdGEucHJvamVjdCB0bXBcbiAgICBlbHNlXG4gICAgICBAX21ldGFkYXRhLmdldFxuXG4gICMgQHBhcmFtIFtBcnJheV0gY29sdW1ucyBUaGUgbmFtZSBvZiB0aGUgdGFibGUgY29sdW1uc1xuICAjIEBwYXJhbSBbQXJyYXldIHZhbHVlcyBUaGUgdmFsdWVzIG9mIHRoZSB0YWJsZS5cbiAgIyBAcGFyYW0gW09iamVjdF0gbWV0YWRhdGEgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNvbHVtbnNcbiAgY29uc3RydWN0b3I6ICh7bmFtZSwgdmFsdWVzLCBjb2x1bW5zLCBtZXRhZGF0YX0pLT5cbiAgICAjIyBUaGUgdGFibGUgY2FuIGJlIHJlbmFtZWQgIyMjXG4gICAgQF9uYW1lID0gQGN1cnNvci5zZWxlY3QgJ25hbWUnXG4gICAgQF9uYW1lLnNldCBuYW1lID8gXCJTb21lIG5hbWVcIlxuXG4gICAgIyMjIE1ldGFkYXRhIGlzIGF0IHRoZSB0YWJsZSBsZXZlbCwgYmVjYXVzZSBpdCBzZXRzIHR5cGVzIG9mIHRoZSB0YWJsZSAjIyNcbiAgICBAX21ldGFkYXRhID0gQGN1cnNvci5zZWxlY3QgJ21ldGFkYXRhJ1xuICAgIEBfbWV0YWRhdGEuc2V0IEBfbWV0YWRhdGEuZ2V0KCkgPyBtZXRhZGF0YVxuXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG4gICAgQGNvbXB1dGUoKVxuIyMjXG5BIGZvcm1hdHRlZCBzdHJpbmcgb2YgdGhlIHRhYmxlLlxuIyMjXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fc3RyaW5nID0gLT5cbiMjI1xuSlNPTmlmeSB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgdGFibGUuXG5cbkBwYXJhbSBbQm9vbGVhbl0gaW5kZXggVHJ1ZSBpbmNsdWRlcyB0aGUgaW5kZXggaW4gdGhlIEpTT04gc3RyaW5nLlxuIyMjXG5JbnRlcmFjdGl2ZS5UYWJsZTo6dG9fanNvbiA9ICgpLT5cbiAgSlNPTi5zdHJpbmdpZnlcbiAgICBjb2x1bW5zOiBAZGVyaXZlZCgpXG4gICAgdmFsdWVzOiBAY29sdW1uX2RhdGFfc291cmNlKEBkZXJpdmVkKCkuLi4pXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuVGFibGVcbiJdfQ==
