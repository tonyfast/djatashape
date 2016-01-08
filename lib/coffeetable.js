(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Baobab, d3;

Baobab = require("baobab");

d3 = require("d3");


/*
interactive tabular data, optimized for the browser

@example A complete example.
      d3.select('body').html('').append('div').attr 'id','table'
      d3.select('body').append('div').append('span').attr 'id','text'

      books = new CoffeeTable
          rectangle:
            columns: ['x', 'y']
            values: [[1, 2],[3, 8]]
        , [['table','#table'],['text','#text']]
        , [['table','rectangle','table'],['text','rectangle','text']]

      books.book['table'].render 'tr.values>th.index', (()->@index()), 'left'
      books.book['table'].render 'tr.values>td.values', (()->@columns())
      books.book['table'].render 'tr.columns>th.columns', (()->[null, @columns()...]),  'up'
      books.book['table'].glue
        content:
          index: (index)=> books.book['table'].render 'tr.values>th.index'
          values: (values)=> books.book['table'].render 'tr.values > td.values', values
        browser:
          th.columns:
            click: (data)-> @sort data
            mouseon: (data)-> console.log data
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

  ColumnDataSource.prototype.concat = function(append_values) {
    if (append_values.columns != null) {
      d3.entries(append_values.columns).forEach((function(_this) {
        return function(arg) {
          var cursors, fn, name;
          name = arg.name, cursors = arg.cursors, fn = arg.fn;
          _this._columns.push(name);
          return _this._values.set(_this.values().map(function(row, i) {
            return row.push(new_value[i]);
          }));
        };
      })(this));
    }
    ColumnDataSource.__super__.concat.call(this, append_values);
    return this;
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
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

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
    this._columns.select(1).on('update', (function(_this) {
      return function(event) {
        console.log(event);
        return slice.call(event.data.previousData).filter(function(d) {
          var ref1;
          return ref1 = !d, indexOf.call(event.data.currentData, ref1) >= 0;
        }).forEach(function(column_name) {
          return this._cds[column_name].release();
        });
      };
    })(this));
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
      values: this.column_data_source(),
      metadata: this.metadata(),
      columns: [this.derived(), this.derived()]
    });
    return this;
  };

  Compute.prototype.rewind = function() {
    this.cursor.deepMerge({
      values: this._checkpoint.get('values'),
      metadata: this._checkpoint.get('metadata')
    });
    this.columns.select(0).set(this._checkpoint.get('columns'));
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

  DataSource.prototype.concat = function(append_rows) {
    var ref;
    if ((ref = append_rows.values) != null) {
      ref.forEach((function(_this) {
        return function(row) {
          return _this._values.push(row);
        };
      })(this));
    }
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
  slice = [].slice;

Baobab = require('baobab');

d3 = require('d3');

Table = require('./table');


/*
An Interactive Table uses immutable cursor trees to track the evolution of
tabular data.
 */

Interactive = (function(superClass) {
  extend(Interactive, superClass);


  /* Table name Baobab cursor */

  Interactive.prototype.name = function() {
    return this.cursor.get('name');
  };


  /* Table information in readme Baobab cursor */

  Interactive.prototype.readme = function() {
    return this.cursor.get('readme');
  };


  /* Reset the Table back to its initial state */

  Interactive.prototype.reset = function() {
    this.cursor.deepMerge(this.cursor.get('init'));
    return this;
  };


  /*
  Create a new interactive table.  An Interactive Table is similar to a DataFrame
  in that it is both a list and column data source.  Rows and columns can be
  accessed independently.  Operations can be applied to both rows and columns.
  
  @param [Object] record_orient_data Record orient data contains the columns and
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
    this.cursor.set('init', record_orient_data);
    this._readme = this.cursor.select('readme');
    this._readme.set((ref = this._readme.get()) != null ? ref : "");
    Interactive.__super__.constructor.call(this, this.cursor.project({
      values: ['values'],
      columns: ['columns'],
      metadata: ['metadata']
    }));
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
        var cursors, fn, key, value;
        key = arg1.key, value = arg1.value;
        cursors = value.cursors, fn = value.fn;
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
    var columns, fn, i, new_values, values;
    columns = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), fn = arguments[i++];
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

  Interactive.prototype.concat = function(new_values) {
    Interactive.__super__.concat.call(this, new_values);
    return this._expression.push(['concat', new_values]);
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
    return this.cursor.get('length');
  };

  Row.prototype.index = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this._index).get.apply(ref, args);
  };

  function Row(values, columns) {
    this._index = this.cursor.select('index');
    this._index.set(d3.range(values.length));
    this._length = this.cursor.select('length');
    this._length.set('length', Baobab.monkey(['values'], function(values) {
      return values.length;
    }));
    this._index.on('update', (function(_this) {
      return function(event) {
        var new_index, old_index;
        new_index = event.data.currentData;
        if (event.data.previousData != null) {
          old_index = event.data.previousData;
          new_index = new_index.map(function(i) {
            return old_index.indexOf(i);
          });
          values = _this.values();
          return _this._values.set(new_index.map(function(i) {
            return values[i];
          }));
        }
      };
    })(this));
    Row.__super__.constructor.call(this, columns);
    this._add_derived_column('index', [['index']], function(index) {
      return index;
    });
  }


  /*
  table.iloc [2,3]
  table._index.set [2,3,0,1]
  table.iloc [2,3]
   */

  Row.prototype.iloc = function(selection) {
    var index, values;
    index = this.index();
    values = this.values();
    if (selection != null) {
      return values = selection.map((function(_this) {
        return function(i) {
          return values[i];
        };
      })(this));
    }
  };


  /*
  table.loc [2,3]
  table._index.set [2,3,0,1]
  table.loc [2,3]
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
    var columns, metadata, ref, values;
    values = arg1.values, columns = arg1.columns, metadata = arg1.metadata;
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

Interactive.Table.prototype.to_json = function(index) {
  var cursors;
  if (index == null) {
    index = true;
  }
  cursors = {
    columns: ['columns'],
    values: ['values']
  };
  if (index) {
    cursors['index'] = ['index'];
  }
  return JSON.stringify(this.cursor.project(cursors));
};

module.exports = Interactive.Table;


},{"./column_data_source":2,"./index":8}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29mZmVldGFibGUuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL2NvbHVtbl9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29sdW1ucy5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvY29tcHV0ZS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZGF0YS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvZXhwcmVzc2lvbi5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaGlzdG9yeS5jb2ZmZWUiLCJzcmMvaW50ZXJhY3RpdmUvaW5kZXguY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3Jvd3MuY29mZmVlIiwic3JjL2ludGVyYWN0aXZlL3RhYmxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztBQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7O0FBQ0w7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCTSxNQUFNLENBQUM7RUFLRSxxQkFBQyxHQUFEO0lBQUMsSUFBQyxDQUFBLE1BQUQ7SUFBUSxFQUFFLENBQUMsSUFBSCxDQUFRLElBQUMsQ0FBQSxHQUFULEVBQWMsU0FBQyxDQUFEO2FBQU0sNkNBQU0sQ0FBTjtJQUFOLENBQWQ7RUFBVDs7d0JBRWIsT0FBQSxHQUFTOzs7Ozs7QUFFWCxXQUFXLENBQUMsV0FBWixHQUEwQixPQUFBLENBQVEsZUFBUjs7QUFDMUIsV0FBVyxDQUFDLGdCQUFaLEdBQStCLE9BQUEsQ0FBUSxlQUFSOztBQUcvQixNQUFNLENBQUMsS0FBUCxHQUFtQixJQUFBLFdBQVcsQ0FBQyxXQUFaLENBQ2pCO0VBQUEsT0FBQSxFQUFTLENBQUMsR0FBRCxFQUFNLEdBQU4sQ0FBVDtFQUNBLE1BQUEsRUFB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QUxXOzs7O0dBYmlCOzs7QUFvQmhDOzs7O0FBR0EsV0FBVyxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsU0FBbkIsR0FBK0IsU0FBQSxHQUFBOzs7QUFDL0I7Ozs7OztBQUtBLFdBQVcsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLE9BQW5CLEdBQTZCLFNBQUMsS0FBRDtBQUMzQixNQUFBOztJQUQ0QixRQUFNOztFQUNsQyxPQUFBLEdBQ0U7SUFBQSxPQUFBLEVBQVMsQ0FBQyxTQUFELENBQVQ7SUFDQSxNQUFBLEVBQVEsQ0FBQyxRQUFELENBRFI7O0VBRUYsSUFBRyxLQUFIO0lBQWMsT0FBUSxDQUFBLE9BQUEsQ0FBUixHQUFtQixDQUFDLE9BQUQsRUFBakM7O1NBQ0EsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsQ0FBZjtBQUwyQjs7QUFPN0IsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkJhb2JhYiA9IHJlcXVpcmUgXCJiYW9iYWJcIlxuZDMgPSByZXF1aXJlIFwiZDNcIlxuIyMjXG5pbnRlcmFjdGl2ZSB0YWJ1bGFyIGRhdGEsIG9wdGltaXplZCBmb3IgdGhlIGJyb3dzZXJcblxuQGV4YW1wbGUgQSBjb21wbGV0ZSBleGFtcGxlLlxuICAgICAgZDMuc2VsZWN0KCdib2R5JykuaHRtbCgnJykuYXBwZW5kKCdkaXYnKS5hdHRyICdpZCcsJ3RhYmxlJ1xuICAgICAgZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdkaXYnKS5hcHBlbmQoJ3NwYW4nKS5hdHRyICdpZCcsJ3RleHQnXG5cbiAgICAgIGJvb2tzID0gbmV3IENvZmZlZVRhYmxlXG4gICAgICAgICAgcmVjdGFuZ2xlOlxuICAgICAgICAgICAgY29sdW1uczogWyd4JywgJ3knXVxuICAgICAgICAgICAgdmFsdWVzOiBbWzEsIDJdLFszLCA4XV1cbiAgICAgICAgLCBbWyd0YWJsZScsJyN0YWJsZSddLFsndGV4dCcsJyN0ZXh0J11dXG4gICAgICAgICwgW1sndGFibGUnLCdyZWN0YW5nbGUnLCd0YWJsZSddLFsndGV4dCcsJ3JlY3RhbmdsZScsJ3RleHQnXV1cblxuICAgICAgYm9va3MuYm9va1sndGFibGUnXS5yZW5kZXIgJ3RyLnZhbHVlcz50aC5pbmRleCcsICgoKS0+QGluZGV4KCkpLCAnbGVmdCdcbiAgICAgIGJvb2tzLmJvb2tbJ3RhYmxlJ10ucmVuZGVyICd0ci52YWx1ZXM+dGQudmFsdWVzJywgKCgpLT5AY29sdW1ucygpKVxuICAgICAgYm9va3MuYm9va1sndGFibGUnXS5yZW5kZXIgJ3RyLmNvbHVtbnM+dGguY29sdW1ucycsICgoKS0+W251bGwsIEBjb2x1bW5zKCkuLi5dKSwgICd1cCdcbiAgICAgIGJvb2tzLmJvb2tbJ3RhYmxlJ10uZ2x1ZVxuICAgICAgICBjb250ZW50OlxuICAgICAgICAgIGluZGV4OiAoaW5kZXgpPT4gYm9va3MuYm9va1sndGFibGUnXS5yZW5kZXIgJ3RyLnZhbHVlcz50aC5pbmRleCdcbiAgICAgICAgICB2YWx1ZXM6ICh2YWx1ZXMpPT4gYm9va3MuYm9va1sndGFibGUnXS5yZW5kZXIgJ3RyLnZhbHVlcyA+IHRkLnZhbHVlcycsIHZhbHVlc1xuICAgICAgICBicm93c2VyOlxuICAgICAgICAgIHRoLmNvbHVtbnM6XG4gICAgICAgICAgICBjbGljazogKGRhdGEpLT4gQHNvcnQgZGF0YVxuICAgICAgICAgICAgbW91c2VvbjogKGRhdGEpLT4gY29uc29sZS5sb2cgZGF0YVxuXG5cbiMjI1xuY2xhc3Mgd2luZG93LkNvZmZlZVRhYmxlXG4gICMgQ29uc3RydWN0IGEgY29sbGVjdGlvbiBvZiBDb2ZmZWVUYWJsZSBib29rcy5cbiAgIyBAcGFyYW0gW09iamVjdF0gY29udGVudCBjb250YWlucyBtYW55IFRhYnVsYXIgZGF0YXNldHNcbiAgIyBAcGFyYW0gW09iamVjdF0gcHVibGlzaGVyIGNvbnRhaW5zIG1hbnkgRE9NIHNlbGVjdGlvbnNcbiAgIyBAcGFyYW0gW09iamVjdF0gYm9vayB1c2UgcHVibGlzaGVycyB0byBwcmVzZW50IGFuZCB1cGRhdGUgY29udGVlbnRcbiAgY29uc3RydWN0b3I6IChAdXJsKS0+IGQzLmpzb24gQHVybCwgKGQpLT4gc3VwZXIgZFxuXG4gIHZlcnNpb246ICcwLjEuMCdcblxuQ29mZmVlVGFibGUuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2ludGVyYWN0aXZlJ1xuQ29mZmVlVGFibGUuSW50ZXJhY3RpdmVHcmFwaCA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG5cblxud2luZG93LnRhYmxlID0gbmV3IENvZmZlZVRhYmxlLkludGVyYWN0aXZlXG4gIGNvbHVtbnM6IFsneCcsICd5J11cbiAgdmFsdWVzOiBbXG4gICAgWzEsIDJdXG4gICAgWzMsIDhdXG4gICAgWy0xLDRdXG4gICAgWzUsN11cbiAgXVxud2luZG93LnNxdWFyZSA9IG5ldyBDb2ZmZWVUYWJsZS5JbnRlcmFjdGl2ZVxuICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gIHZhbHVlczogW1xuICAgIFsxLCAxXVxuICAgIFs3LDddXG4gIF1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb2ZmZWVUYWJsZVxuICBkM1xuICBCYW9iYWJcbn1cbiIsImQzID0gcmVxdWlyZSAnZDMnXG5CYW9iYWIgPSByZXF1aXJlIFwiYmFvYmFiXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkRhdGFTb3VyY2UgPSByZXF1aXJlICcuL2RhdGEnXG5cbmNsYXNzIEludGVyYWN0aXZlLkNvbHVtbkRhdGFTb3VyY2UgZXh0ZW5kcyBEYXRhU291cmNlXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zKS0+XG4gICAgQF9jZHMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1uX2RhdGFfc291cmNlJ1xuICAgIHN1cGVyIHZhbHVlcywgY29sdW1uc1xuICAgIGNvbHVtbnMubWFwIChjb2x1bW5fbmFtZSk9PiBAYXBwbHkgY29sdW1uX25hbWVcblxuICAjIyMgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIGRhdGEgc291cmNlXG4gIHRhYmxlLmFwcGx5ICdtZWFuJywgWyd4JywneSddLCAoeCx5KS0+IGQzLnppcCh4LHkpLm1hcCAodiktPiBkMy5tZWFuIHZcbiAgdGFibGUucHJvamVjdGlvbigpXG4gICMjI1xuICBhcHBseTogKGFyZ3MuLi4pLT4gQF9hZGRfZGVyaXZlZF9jb2x1bW4gYXJncy4uLlxuICAjIyNcbiAgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIGN1cnNvciB0aGF0IGRlZmluZXMgYSBuZXcgQ29sdW1uIERhdGEgU291cmNlXG4gICMjI1xuICBfYWRkX2Rlcml2ZWRfY29sdW1uOiAobmFtZSwgY3Vyc29ycywgZm4pLT5cbiAgICBjdXJzb3JzID89IFtbJ2NvbHVtbnMnLDBdLFsndmFsdWVzJ10sWycuJywnbmFtZSddXVxuICAgIGZuID89IChjb2x1bW5zLHZhbHVlcyxjb2x1bW5fbmFtZSktPlxuICAgICAgY29sdW1uX2luZGV4ID0gY29sdW1ucy5pbmRleE9mIGNvbHVtbl9uYW1lXG4gICAgICB2YWx1ZXMubWFwIChyb3dfdmFsdWVzKS0+IHJvd192YWx1ZXNbY29sdW1uX2luZGV4XVxuICAgIEBfY2RzLnNldCBuYW1lLFxuICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIHZhbHVlczogQmFvYmFiLm1vbmtleSBjdXJzb3JzLi4uLCBmblxuICAgICMjIyBBbHdheXMgcHVzaCBkZXJpdmVkIGNvbHVtbnMgdG8gc2Vjb25kIHBhcnQgb2YgY29sdW1ucyAjIyNcbiAgICB1bmxlc3MgbmFtZSBpbiBbJ2luZGV4JyxAZGVyaXZlZCgpLi4uXVxuICAgICAgQF9jb2x1bW5zLnNlbGVjdCgxKS5wdXNoIG5hbWVcblxuXG4gICMjIyBBcHBlbmQgY29sdW1ucyBvciByb3dzIHdpdGhvdXQgbW9ua2V5cyAjIyNcbiAgY29uY2F0OiAoYXBwZW5kX3ZhbHVlcyktPlxuICAgIGlmIGFwcGVuZF92YWx1ZXMuY29sdW1ucz9cbiAgICAgIGQzLmVudHJpZXMoYXBwZW5kX3ZhbHVlcy5jb2x1bW5zKS5mb3JFYWNoICh7bmFtZSxjdXJzb3JzLGZufSk9PlxuICAgICAgICBAX2NvbHVtbnMucHVzaCBuYW1lXG4gICAgICAgIEBfdmFsdWVzLnNldCBAdmFsdWVzKCkubWFwIChyb3csaSk9PiByb3cucHVzaCBuZXdfdmFsdWVbaV1cbiAgICBzdXBlciBhcHBlbmRfdmFsdWVzXG4gICAgdGhpc1xuXG5cbiAgY29sdW1uX2RhdGFfc291cmNlOiAoY29sdW1ucy4uLiktPlxuICAgIGlmIGNvbHVtbnMubGVuZ3RoID09IDAgdGhlbiBjb2x1bW5zID0gQGRlcml2ZWQoKVxuICAgIGQzLnppcCBjb2x1bW5zLm1hcCggKGMpID0+IEBfY2RzLmdldChjLCd2YWx1ZXMnKSkuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5EYXRhU291cmNlXG4iLCJkMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuRXhwcmVzc2lvbiA9IHJlcXVpcmUgJy4vZXhwcmVzc2lvbidcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29sdW1uIGV4dGVuZHMgRXhwcmVzc2lvblxuICBjb2x1bW5zOiAoKS0+IGQzLm1lcmdlIEBfY29sdW1ucy5nZXQoKVxuXG4gIHJhdzogKCktPiBAX2NvbHVtbnMuZ2V0IDBcbiAgZGVyaXZlZDogKCktPiBAX2NvbHVtbnMuZ2V0IDFcblxuICBjb25zdHJ1Y3RvcjogKGNvbHVtbnMpLT5cbiAgICBAX2NvbHVtbnMgPSBAY3Vyc29yLnNlbGVjdCAnY29sdW1ucydcbiAgICAjIFtyYXdfY29sdW1ucywgZGVyaXZlZF9jb2x1bW5zXVxuICAgIEBfY29sdW1ucy5zZXQgW2NvbHVtbnMsW11dID8gW1tdLFtdXVxuICAgICMgdXBkYXRlIHRoZSB2YWx1ZXMgd2hlbiB0aGUgcmF3X2NvbHVtbnMgY2hhbmdlXG4gICAgQF9jb2x1bW5zLnNlbGVjdCgxKS5vbiAndXBkYXRlJywgKGV2ZW50KT0+XG4gICAgICBjb25zb2xlLmxvZyBldmVudFxuICAgICAgW2V2ZW50LmRhdGEucHJldmlvdXNEYXRhLi4uXS5maWx0ZXIgKGQpPT4gbm90IGQgaW4gZXZlbnQuZGF0YS5jdXJyZW50RGF0YVxuICAgICAgICAuZm9yRWFjaCAoY29sdW1uX25hbWUpLT4gQF9jZHNbY29sdW1uX25hbWVdLnJlbGVhc2UoKVxuICAgIHN1cGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db2x1bW5cbiIsImQzID0gcmVxdWlyZSBcImQzXCJcbkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcblxuY2xhc3MgSW50ZXJhY3RpdmUuQ29tcHV0ZVxuICBjb21wdXRlOiAoKS0+XG4gICAgIyMjIENvbXB1dGUgY2hhbmdlcyB0aGUgc3RhdGUgb2YgdGhlIGRhdGEgdHJlZSAjIyNcbiAgICBAX2NoZWNrcG9pbnQuZGVlcE1lcmdlXG4gICAgICB2YWx1ZXM6IEBjb2x1bW5fZGF0YV9zb3VyY2UoKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YSgpXG4gICAgICBjb2x1bW5zOiBbQGRlcml2ZWQoKSwgQGRlcml2ZWQoKV1cbiAgICB0aGlzXG5cbiAgcmV3aW5kOiAoKS0+XG4gICAgQGN1cnNvci5kZWVwTWVyZ2VcbiAgICAgIHZhbHVlczogQF9jaGVja3BvaW50LmdldCAndmFsdWVzJ1xuICAgICAgbWV0YWRhdGE6IEBfY2hlY2twb2ludC5nZXQgJ21ldGFkYXRhJ1xuICAgIEBjb2x1bW5zLnNlbGVjdCgwKS5zZXQgQF9jaGVja3BvaW50LmdldCAnY29sdW1ucydcbiAgICB0aGlzXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Db21wdXRlXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Sb3cgPSByZXF1aXJlICcuL3Jvd3MnXG5cbmNsYXNzIEludGVyYWN0aXZlLkRhdGFTb3VyY2UgZXh0ZW5kcyBSb3dcbiAgdmFsdWVzOiAoKS0+IEBfdmFsdWVzLmdldCgpXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zKS0+XG4gICAgQF92YWx1ZXMgPSBAY3Vyc29yLnNlbGVjdCAndmFsdWVzJ1xuICAgIEBfdmFsdWVzLnNldCB2YWx1ZXMgPyBbXVxuICAgIHN1cGVyIHZhbHVlcywgY29sdW1uc1xuXG4gIGNvbmNhdDogKGFwcGVuZF9yb3dzKS0+XG4gICAgYXBwZW5kX3Jvd3MudmFsdWVzPy5mb3JFYWNoIChyb3cpPT4gQF92YWx1ZXMucHVzaCByb3dcbiAgICB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJhY3RpdmUuRGF0YVNvdXJjZVxuIiwiSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuSGlzdG9yeSA9IHJlcXVpcmUgJy4vaGlzdG9yeSdcblxuY2xhc3MgSW50ZXJhY3RpdmUuRXhwcmVzc2lvbiBleHRlbmRzIEhpc3RvcnlcbiAgZXhwcmVzc2lvbjogKCktPiBAX2V4cHJlc3Npb24uZ2V0KClcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGV4cHJlc3Npb25zID0gW11cbiAgICBAX2V4cHJlc3Npb24gPSBAY3Vyc29yLnNlbGVjdCAnZXhwcmVzc2lvbidcbiAgICBAX2V4cHJlc3Npb24uc2V0IFtdXG4gICAgc3VwZXIoKVxuXG4gIGV4ZWN1dGU6IChleHByZXNzaW9ucyktPlxuICAgIGV4cHJlc3Npb25zLmZvckVhY2ggIChleHByZXNzaW9uLGV4cHJlc3Npb25fY291bnQpPT5cbiAgICAgIEBbZXhwcmVzc2lvblswXV0gZXhwcmVzc2lvblsxLi5dLi4uXG4gICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MuLi4pLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzLi4uKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5FeHByZXNzaW9uXG4iLCJJbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW5kZXgnXG5Db21wdXRlID0gcmVxdWlyZSAnLi9jb21wdXRlJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5IaXN0b3J5IGV4dGVuZHMgQ29tcHV0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX2NoZWNrcG9pbnQgPSBAY3Vyc29yLnNlbGVjdCAnY2hlY2twb2ludCdcbiAgICBAX2NoZWNrcG9pbnQuc2V0IHt9XG4gICAgQF9leHByZXNzaW9uLnN0YXJ0UmVjb3JkaW5nIDIwXG4gICAgc3VwZXIoKVxuICBoaXN0b3J5OiAtPiBAX2V4cHJlc3Npb24uZ2V0SGlzdG9yeSgpXG4gIGNsZWFyX2hpc3Rvcnk6IC0+IEBfZXhwcmVzc2lvbi5jbGVhckhpc3RvcnkoKVxuICByZWNvcmQ6IChleHByZXNzaW9uKS0+XG4gICAgQGV4cHJlc3Npb25zLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLkhpc3RvcnlcbiIsIkJhb2JhYiA9IHJlcXVpcmUgJ2Jhb2JhYidcbmQzID0gcmVxdWlyZSAnZDMnXG5UYWJsZSA9IHJlcXVpcmUgJy4vdGFibGUnXG5cbiMjI1xuQW4gSW50ZXJhY3RpdmUgVGFibGUgdXNlcyBpbW11dGFibGUgY3Vyc29yIHRyZWVzIHRvIHRyYWNrIHRoZSBldm9sdXRpb24gb2ZcbnRhYnVsYXIgZGF0YS5cbiMjI1xuY2xhc3MgSW50ZXJhY3RpdmUgZXh0ZW5kcyBUYWJsZVxuICAjIyMgVGFibGUgbmFtZSBCYW9iYWIgY3Vyc29yICMjI1xuICBuYW1lOiAoKS0+IEBjdXJzb3IuZ2V0ICduYW1lJ1xuICAjIyMgVGFibGUgaW5mb3JtYXRpb24gaW4gcmVhZG1lIEJhb2JhYiBjdXJzb3IgIyMjXG4gIHJlYWRtZTogKCktPiBAY3Vyc29yLmdldCAncmVhZG1lJ1xuICAjIyMgUmVzZXQgdGhlIFRhYmxlIGJhY2sgdG8gaXRzIGluaXRpYWwgc3RhdGUgICMjI1xuICByZXNldDogKCktPlxuICAgIEBjdXJzb3IuZGVlcE1lcmdlIEBjdXJzb3IuZ2V0ICdpbml0J1xuICAgIHRoaXNcbiAgIyMjXG4gIENyZWF0ZSBhIG5ldyBpbnRlcmFjdGl2ZSB0YWJsZS4gIEFuIEludGVyYWN0aXZlIFRhYmxlIGlzIHNpbWlsYXIgdG8gYSBEYXRhRnJhbWVcbiAgaW4gdGhhdCBpdCBpcyBib3RoIGEgbGlzdCBhbmQgY29sdW1uIGRhdGEgc291cmNlLiAgUm93cyBhbmQgY29sdW1ucyBjYW4gYmVcbiAgYWNjZXNzZWQgaW5kZXBlbmRlbnRseS4gIE9wZXJhdGlvbnMgY2FuIGJlIGFwcGxpZWQgdG8gYm90aCByb3dzIGFuZCBjb2x1bW5zLlxuXG4gIEBwYXJhbSBbT2JqZWN0XSByZWNvcmRfb3JpZW50X2RhdGEgUmVjb3JkIG9yaWVudCBkYXRhIGNvbnRhaW5zIHRoZSBjb2x1bW5zIGFuZFxuICB2YWx1ZXMuXG5cbiAgQGV4YW1wbGUgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIHRhYmxlXG4gICAgdGFibGUgPSBuZXcgQ29mZmVlVGFibGVcbiAgICAgIGNvbHVtbnM6IFsneCcsICd5J11cbiAgICAgIHZhbHVlczogW1xuICAgICAgICBbMSwgMl1cbiAgICAgICAgWzMsIDhdXG4gICAgICAgIFstMSw0XVxuICAgICAgICBbNSw3XVxuICAgICAgXVxuICAjIyNcbiAgY29uc3RydWN0b3I6IChyZWNvcmRfb3JpZW50X2RhdGEpLT5cbiAgICBAdHJlZSA9IG5ldyBCYW9iYWIgcmVjb3JkX29yaWVudF9kYXRhXG4gICAgQGN1cnNvciA9IEB0cmVlLnNlbGVjdCAwXG4gICAgQGN1cnNvci5zZXQgJ2luaXQnLCByZWNvcmRfb3JpZW50X2RhdGFcbiAgICBAX3JlYWRtZSA9IEBjdXJzb3Iuc2VsZWN0ICdyZWFkbWUnXG4gICAgQF9yZWFkbWUuc2V0IEBfcmVhZG1lLmdldCgpID8gXCJcIlxuICAgIHN1cGVyIEBjdXJzb3IucHJvamVjdFxuICAgICAgdmFsdWVzOiBbJ3ZhbHVlcyddXG4gICAgICBjb2x1bW5zOiBbJ2NvbHVtbnMnXVxuICAgICAgbWV0YWRhdGE6IFsnbWV0YWRhdGEnXVxuICAgIEBjb21wdXRlKClcblxuICAjIyNcbiAgUHJvamVjdCBzZWxlY3RzIGEgc3Vic2V0IG9mIGNvbHVtbnNcbiAgQGV4YW1wbGUgU2VsZWN0aW9uIHRoZSBpbmRleCwgeCwgYW5kIHlcbiAgICB0YWJsZS5wcm9qZWN0aW9uICdpbmRleCcsJ3gnLCd5J1xuICAjIyNcbiAgcHJvamVjdGlvbjogKGNvbHVtbnMuLi4pLT5cbiAgICBAX3ZhbHVlcy5zZXQgQGNvbHVtbl9kYXRhX3NvdXJjZSBjb2x1bW5zLi4uXG4gICAgQF9jb2x1bW5zLnNlbGVjdCgwKS5zZXQgQGRlcml2ZWQoKVxuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsncHJvamVjdGlvbicsIGNvbHVtbnMuLi5dXG4gICAgdGhpc1xuXG4gICMjI1xuICBUcmFuc2Zvcm0gYWRkcyBuYW1lZCBjb2x1bW5zIHRvIHRoZSB0YWJsZVxuICBAcGFyYW0gW09iamVjdF0gdHJhbnNmb3JtZXJzIGlzIGFuIG9iamVjdCBvZiBuYW1lZCBjb2x1bW5zLiAgVGhlIG5ldyBjb2x1bW5zXG4gIGFyZSBkZWZpbmVkIGJ5IGBgY3Vyc29yc2BgIGFuZCBhIGZ1bmN0aW9uIGBgZm5gYC5cbiAgQGV4YW1wbGUgQ3JlYXRlIHR3byBuZXcgY29sdW1ucyBtZWFuIGFuZCBzdGQuXG4gICAgdGFibGUudHJhbnNmb3JtXG4gICAgICBtZWFuOiB7IGN1cnNvcnM6IFsneCcsJ3knXSwgZm46ICh4LHkpLT4gKHgreSkvMiB9XG4gICAgICBzdGQ6IHsgY3Vyc29yczogWyd4JywneSddLCBmbjogcmVxdWlyZSgnZDMnKS5kZXZpYXRpb24gfVxuICAjIyNcbiAgdHJhbnNmb3JtOiAodHJhbnNmb3JtZXJzKS0+XG4gICAgZDMuZW50cmllcyB0cmFuc2Zvcm1lcnNcbiAgICAgIC5mb3JFYWNoICh7a2V5LHZhbHVlfSk9PlxuICAgICAgICB7Y3Vyc29ycywgZm59ID0gdmFsdWVcbiAgICAgICAgQF9hZGRfZGVyaXZlZF9jb2x1bW4ga2V5LCBjdXJzb3JzLm1hcCgoY29sKS0+Wydjb2x1bW5fZGF0YV9zb3VyY2UnLGNvbCwndmFsdWVzJ10pLCBmblxuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsndHJhbnNmb3JtJywgdHJhbnNmb3JtZXJzXVxuICAgIHRoaXNcblxuICAjIyNcbiAgRmlsdGVyIGVsZW1lbnRzIGNvbHVtbnMgYmFzZWQgb24gYSBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gIEBwYXJhbSBbU3RyaW5nXSBjb2x1bW5zIGEgbGlzdCBvZiBjb2x1bW5zIHRvIGluY2x1ZGUgaW4gdGhlIHByZWRpY2F0ZSBmdW5jdGlvblxuICBAcGFyYW0gW0Z1bmN0aW9uXSBmbiBhIHByZWRpY2F0ZSBmdW5jdGlvbiB3aXRoIGFjY2VzcyB0byBlYWNoIG9mIHRoZSBjb2x1bW5zLlxuXG4gIEBleGFtcGxlIEZpbHRlciBjb2x1bW5zIGBgeGBgIGFuZCBgYHlgYFxuICAgIHRhYmxlLmZpbHRlciAneCcsJ3knLCAoeCx5KS0+IHggPiAwIGFuZCB5IDwgNVxuICAjIyNcbiAgZmlsdGVyOiAoY29sdW1ucy4uLiwgZm4pLT5cbiAgICB2YWx1ZXMgPSBAY29sdW1uX2RhdGFfc291cmNlIGNvbHVtbnMuLi5cbiAgICBuZXdfdmFsdWVzID0gdmFsdWVzLmZpbHRlciBmblxuICAgIEBpbmRleC5zZXQgbmV3X3ZhbHVlcy5tYXAgKHYpPT4gdmFsdWVzLmluZGV4T2YgdlxuICAgIEB2YWx1ZXMuc2V0IHZhbHVlc1xuICAgIEBfZXhwcmVzc2lvbi5wdXNoIFsnZmlsdGVyJywgY29sdW1ucy4uLiwgZm4udG9TdHJpbmcoKV1cbiAgICB0aGlzXG4gICMjI1xuICBDb25jYXRlbmF0ZSBuZXcgdmFsdWVzIHRvIHRoZSB0YWJsZS5cbiAgQHBhcmFtIFtPYmplY3RdIG5ld192YWx1ZXMgcmVzcG9uZHMgdG8gdGhlIGtleXMgYGBjb2x1bW5zYGAgYW5kIGBgdmFsdWVzYGAgdG9cbiAgYXBwZW5kIGluIHRoZSBjb2x1bW4gZGlyZWN0aW9uIG9yIHJvdyBkaXJlY3Rpb24sIHJlc3BlY3RpdmVseS5cbiAgQGV4YW1wbGUgQWRkIGEgVHdvIFJvd3NcbiAgICB0YWJsZS5jb25jYXRcbiAgICAgIHZhbHVlczogW1xuICAgICAgICBbLTMsNF1cbiAgICAgICAgWzEsOV1cbiAgICAgIF1cbiAgQGV4YW1wbGUgQWRkIE9uZSBDb2x1bW4uICBUaGUgQXJyYXkgaGFzIGEgbGVuZ3RoIG9mIHNpeCBiZWNhdXNlIHR3byByb3dzIHdlcmUganVzdCBhZGRlZC5cbiAgICB0YWJsZS5jb25jYXRcbiAgICAgIGNvbHVtbnM6XG4gICAgICAgIHo6IFstMyw0LDEsOSw2LC00XVxuICAjIyNcbiAgY29uY2F0OiAobmV3X3ZhbHVlcyktPlxuICAgIHN1cGVyIG5ld192YWx1ZXNcbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ2NvbmNhdCcsbmV3X3ZhbHVlc11cbiAgIyMjXG4gIEFwcGx5IGEgZnVuY3Rpb24gdG8gYSBjb2x1bW5cbiAgQGV4YW1wbGUgQXBwbHkgYSBmdW5jdGlvbiB0byB4IGRlcGVuZGluZyBvbiB5XG4gICAgdGFibGUuYXBwbHkgJ3gnLCBbJ3gnLCd5J10sICh4LHkpLT4gZDMuemlwKHgseSkubWFwICh2KS0+IGQzLm1lYW4gdlxuICAjIyNcbiAgYXBwbHk6IChhcmdzLi4uKS0+XG4gICAgc3VwZXIgYXJncyAuLi5cbiAgICBAX2V4cHJlc3Npb24ucHVzaCBbJ2FwcGx5JyxhcmdzLm1hcCAoYXJnKS0+IEpTT04ucGFyc2UgSlNPTi5zdHJpbmdpZnkgYXJnXVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlXG4iLCJCYW9iYWIgPSByZXF1aXJlICdiYW9iYWInXG5kMyA9IHJlcXVpcmUgJ2QzJ1xuSW50ZXJhY3RpdmUgPSByZXF1aXJlICcuL2luZGV4J1xuQ29sdW1uID0gcmVxdWlyZSAnLi9jb2x1bW5zJ1xuXG5jbGFzcyBJbnRlcmFjdGl2ZS5Sb3cgZXh0ZW5kcyBDb2x1bW5cbiAgbGVuZ3RoOiAoKS0+IEBjdXJzb3IuZ2V0ICdsZW5ndGgnXG4gIGluZGV4OiAoYXJncy4uLiktPiBAX2luZGV4LmdldCBhcmdzLi4uXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zKS0+XG4gICAgQF9pbmRleCA9IEBjdXJzb3Iuc2VsZWN0ICdpbmRleCdcbiAgICBAX2luZGV4LnNldCBkMy5yYW5nZSB2YWx1ZXMubGVuZ3RoXG4gICAgQF9sZW5ndGggPSBAY3Vyc29yLnNlbGVjdCAnbGVuZ3RoJ1xuICAgIEBfbGVuZ3RoLnNldCAnbGVuZ3RoJywgQmFvYmFiLm1vbmtleSBbJ3ZhbHVlcyddLCAodmFsdWVzKS0+IHZhbHVlcy5sZW5ndGhcbiAgICBAX2luZGV4Lm9uICd1cGRhdGUnLCAoZXZlbnQpPT5cbiAgICAgIG5ld19pbmRleCA9IGV2ZW50LmRhdGEuY3VycmVudERhdGFcbiAgICAgIGlmIGV2ZW50LmRhdGEucHJldmlvdXNEYXRhP1xuICAgICAgICBvbGRfaW5kZXggPSBldmVudC5kYXRhLnByZXZpb3VzRGF0YVxuICAgICAgICBuZXdfaW5kZXggPSBuZXdfaW5kZXgubWFwIChpKT0+IG9sZF9pbmRleC5pbmRleE9mIGlcbiAgICAgICAgdmFsdWVzID0gQHZhbHVlcygpXG4gICAgICAgIEBfdmFsdWVzLnNldCBuZXdfaW5kZXgubWFwIChpKT0+IHZhbHVlc1tpXVxuICAgIHN1cGVyIGNvbHVtbnNcbiAgICBAX2FkZF9kZXJpdmVkX2NvbHVtbiAnaW5kZXgnLCBbWydpbmRleCddXSwgKGluZGV4KS0+IGluZGV4XG5cbiAgIyMjXG4gIHRhYmxlLmlsb2MgWzIsM11cbiAgdGFibGUuX2luZGV4LnNldCBbMiwzLDAsMV1cbiAgdGFibGUuaWxvYyBbMiwzXVxuICAjIyNcbiAgaWxvYzogIChzZWxlY3Rpb24pLT5cbiAgICBpbmRleCA9IEBpbmRleCgpXG4gICAgdmFsdWVzID0gQHZhbHVlcygpXG4gICAgaWYgc2VsZWN0aW9uP1xuICAgICAgdmFsdWVzID0gc2VsZWN0aW9uLm1hcCAoaSk9PiB2YWx1ZXNbaV1cbiAgIyMjXG4gIHRhYmxlLmxvYyBbMiwzXVxuICB0YWJsZS5faW5kZXguc2V0IFsyLDMsMCwxXVxuICB0YWJsZS5sb2MgWzIsM11cbiAgIyMjXG4gIGxvYzogKHNlbGVjdGlvbiktPlxuICAgIGluZGV4ID0gQGluZGV4KClcbiAgICB2YWx1ZXMgPSBAdmFsdWVzKClcbiAgICBpZiBzZWxlY3Rpb24/XG4gICAgICB2YWx1ZXMgPSBzZWxlY3Rpb24ubWFwIChpKT0+IHZhbHVlc1tpbmRleC5pbmRleE9mIGldXG4gICAgdmFsdWVzXG4gIHVwZGF0ZTogLT5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5Sb3dcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkNvbHVtbkRhdGFTb3VyY2UgPSByZXF1aXJlICcuL2NvbHVtbl9kYXRhX3NvdXJjZSdcblxuIyBUYWJsZSBhc3NpZ25zIG1ldGFkYXRhIHRvIHRoZSBJbnRlcmFjdGl2ZSBkYXRhIHNvdXJjZVxuIyBBIHRhYmxlIGlzIGRlc2NyaWJlIGJ5OlxuIyAqIF92YWx1ZXNfIC0gQSBsaXN0IG9mIGxpc3RzIGNvbnRhaW5pbmcgdGhlIHJvdyBlbnRyaWVzIGluIHRoZSB0YWJsZS5cbiMgKiBfY29sdW1uc18gLSBUaGUgY29sdW1uIG5hbWVzIGluIHRoZSB0YWJsZSwgdGhlIGNvbHVtbiBuYW1lcyBtYXAgdGhlIGVudHJpZXMgaW4gZWFjaCByb3dcbiMgKiBfbWV0YWRhdGFfIC1cbiMgVGhlIHRhYmxlIGtleXMgIG5hbWluZyBpcyBpbnNwaXJlZCBieSBgYHBhbmRhcy5EYXRhRnJhbWUudG9fZGljdChvcmllbnQ9J3JlY29yZHMnKS5cblxuY2xhc3MgSW50ZXJhY3RpdmUuVGFibGUgZXh0ZW5kcyBDb2x1bW5EYXRhU291cmNlXG4gICMjIyBSZXR1cm4gdGhlIG1ldGFkYXRhIG9mIHRoZSBjb2x1bW5zICMjI1xuICBtZXRhZGF0YTogKGFyZ3MpLT5cbiAgICBpZiBhcmdzP1xuICAgICAgdG1wID0ge31cbiAgICAgIGFyZ3MuZm9yRWFjaCAoYXJnKT0+IHRtcFthcmddID0gYXJnXG4gICAgICBAX21ldGFkYXRhLnByb2plY3QgdG1wXG4gICAgZWxzZVxuICAgICAgQF9tZXRhZGF0YS5nZXRcblxuICAjIEBwYXJhbSBbQXJyYXldIGNvbHVtbnMgVGhlIG5hbWUgb2YgdGhlIHRhYmxlIGNvbHVtbnNcbiAgIyBAcGFyYW0gW0FycmF5XSB2YWx1ZXMgVGhlIHZhbHVlcyBvZiB0aGUgdGFibGUuXG4gICMgQHBhcmFtIFtPYmplY3RdIG1ldGFkYXRhIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjb2x1bW5zXG4gIGNvbnN0cnVjdG9yOiAoe3ZhbHVlcywgY29sdW1ucywgbWV0YWRhdGF9KS0+XG4gICAgIyMgVGhlIHRhYmxlIGNhbiBiZSByZW5hbWVkICMjI1xuICAgIEBfbWV0YWRhdGEgPSBAY3Vyc29yLnNlbGVjdCAnbWV0YWRhdGEnXG4gICAgQF9tZXRhZGF0YS5zZXQgQF9tZXRhZGF0YS5nZXQoKSA/IG1ldGFkYXRhXG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG4gICAgQGNvbXB1dGUoKVxuXG4jIyNcbkEgZm9ybWF0dGVkIHN0cmluZyBvZiB0aGUgdGFibGUuXG4jIyNcbkludGVyYWN0aXZlLlRhYmxlOjp0b19zdHJpbmcgPSAtPlxuIyMjXG5KU09OaWZ5IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSB0YWJsZS5cblxuQHBhcmFtIFtCb29sZWFuXSBpbmRleCBUcnVlIGluY2x1ZGVzIHRoZSBpbmRleCBpbiB0aGUgSlNPTiBzdHJpbmcuXG4jIyNcbkludGVyYWN0aXZlLlRhYmxlOjp0b19qc29uID0gKGluZGV4PW9uKS0+XG4gIGN1cnNvcnMgPVxuICAgIGNvbHVtbnM6IFsnY29sdW1ucyddXG4gICAgdmFsdWVzOiBbJ3ZhbHVlcyddXG4gIGlmIGluZGV4IHRoZW4gY3Vyc29yc1snaW5kZXgnXSA9IFsnaW5kZXgnXVxuICBKU09OLnN0cmluZ2lmeSBAY3Vyc29yLnByb2plY3QgY3Vyc29yc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyYWN0aXZlLlRhYmxlXG4iXX0=
