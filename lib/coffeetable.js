(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.coffeetable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Baobab Data Structure
 * ======================
 *
 * A handy data tree with cursors.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _emmett = require('emmett');

var _emmett2 = _interopRequireDefault(_emmett);

var _cursor = require('./cursor');

var _cursor2 = _interopRequireDefault(_cursor);

var _monkey = require('./monkey');

var _watcher = require('./watcher');

var _watcher2 = _interopRequireDefault(_watcher);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _update2 = require('./update');

var _update3 = _interopRequireDefault(_update2);

var _helpers = require('./helpers');

var helpers = _interopRequireWildcard(_helpers);

var arrayFrom = helpers.arrayFrom;
var coercePath = helpers.coercePath;
var deepFreeze = helpers.deepFreeze;
var getIn = helpers.getIn;
var makeError = helpers.makeError;
var deepMerge = helpers.deepMerge;
var shallowClone = helpers.shallowClone;
var shallowMerge = helpers.shallowMerge;
var uniqid = helpers.uniqid;

/**
 * Baobab defaults
 */
var DEFAULTS = {

  // Should the tree handle its transactions on its own?
  autoCommit: true,

  // Should the transactions be handled asynchronously?
  asynchronous: true,

  // Should the tree's data be immutable?
  immutable: true,

  // Should the monkeys be lazy?
  lazyMonkeys: true,

  // Should the tree be persistent?
  persistent: true,

  // Should the tree's update be pure?
  pure: true,

  // Validation specifications
  validate: null,

  // Validation behavior 'rollback' or 'notify'
  validationBehavior: 'rollback'
};

/**
 * Function returning a string hash from a non-dynamic path expressed as an
 * array.
 *
 * @param  {array}  path - The path to hash.
 * @return {string} string - The resultant hash.
 */
function hashPath(path) {
  return 'λ' + path.map(function (step) {
    if (_type2['default']['function'](step) || _type2['default'].object(step)) return '#' + uniqid() + '#';

    return step;
  }).join('λ');
}

/**
 * Baobab class
 *
 * @constructor
 * @param {object|array} [initialData={}]    - Initial data passed to the tree.
 * @param {object}       [opts]              - Optional options.
 * @param {boolean}      [opts.autoCommit]   - Should the tree auto-commit?
 * @param {boolean}      [opts.asynchronous] - Should the tree's transactions
 *                                             handled asynchronously?
 * @param {boolean}      [opts.immutable]    - Should the tree be immutable?
 * @param {boolean}      [opts.persistent]   - Should the tree be persistent?
 * @param {boolean}      [opts.pure]         - Should the tree be pure?
 * @param {function}     [opts.validate]     - Validation function.
 * @param {string}       [opts.validationBehaviour] - "rollback" or "notify".
 */

var Baobab = (function (_Emitter) {
  _inherits(Baobab, _Emitter);

  function Baobab(initialData, opts) {
    var _this = this;

    _classCallCheck(this, Baobab);

    _get(Object.getPrototypeOf(Baobab.prototype), 'constructor', this).call(this);

    // Setting initialData to an empty object if no data is provided by use
    if (arguments.length < 1) initialData = {};

    // Checking whether given initial data is valid
    if (!_type2['default'].object(initialData) && !_type2['default'].array(initialData)) throw makeError('Baobab: invalid data.', { data: initialData });

    // Merging given options with defaults
    this.options = shallowMerge({}, DEFAULTS, opts);

    // Disabling immutability & persistence if persistence if disabled
    if (!this.options.persistent) {
      this.options.immutable = false;
      this.options.pure = false;
    }

    // Privates
    this._identity = '[object Baobab]';
    this._cursors = {};
    this._future = null;
    this._transaction = [];
    this._affectedPathsIndex = {};
    this._monkeys = {};
    this._previousData = null;
    this._data = initialData;

    // Properties
    this.root = new _cursor2['default'](this, [], 'λ');
    delete this.root.release;

    // Does the user want an immutable tree?
    if (this.options.immutable) deepFreeze(this._data);

    // Bootstrapping root cursor's getters and setters
    var bootstrap = function bootstrap(name) {
      _this[name] = function () {
        var r = this.root[name].apply(this.root, arguments);
        return r instanceof _cursor2['default'] ? this : r;
      };
    };

    ['apply', 'concat', 'deepMerge', 'exists', 'get', 'push', 'merge', 'project', 'serialize', 'set', 'splice', 'unset', 'unshift'].forEach(bootstrap);

    // Registering the initial monkeys
    this._refreshMonkeys();

    // Initial validation
    var validationError = this.validate();

    if (validationError) throw Error('Baobab: invalid data.', { error: validationError });
  }

  /**
   * Creating statics
   */

  /**
   * Internal method used to refresh the tree's monkey register on every
   * update.
   * Note 1) For the time being, placing monkeys beneath array nodes is not
   * allowed for performance reasons.
   *
   * @param  {mixed}   node      - The starting node.
   * @param  {array}   path      - The starting node's path.
   * @param  {string}  operation - The operation that lead to a refreshment.
   * @return {Baobab}            - The tree instance for chaining purposes.
   */

  _createClass(Baobab, [{
    key: '_refreshMonkeys',
    value: function _refreshMonkeys(node, path, operation) {
      var _this2 = this;

      var clean = function clean(data) {
        var p = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        if (data instanceof _monkey.Monkey) {
          data.release();
          (0, _update3['default'])(_this2._monkeys, p, { type: 'unset' }, {
            immutable: false,
            persistent: false,
            pure: false
          });

          return;
        }

        if (_type2['default'].object(data)) {
          for (var k in data) {
            clean(data[k], p.concat(k));
          }
        }
      };

      var register = [];

      var walk = function walk(data) {
        var p = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        // Should we sit a monkey in the tree?
        if (data instanceof _monkey.MonkeyDefinition || data instanceof _monkey.Monkey) {
          var monkey = new _monkey.Monkey(_this2, p, data instanceof _monkey.Monkey ? data.definition : data);

          register.push(monkey);

          (0, _update3['default'])(_this2._monkeys, p, { type: 'set', value: monkey }, {
            immutable: false,
            persistent: false,
            pure: false
          });

          return;
        }

        // Object iteration
        if (_type2['default'].object(data)) {
          for (var k in data) {
            walk(data[k], p.concat(k));
          }
        }
      };

      // Walking the whole tree
      if (!arguments.length) {
        walk(this._data);
        register.forEach(function (m) {
          return m.checkRecursivity();
        });
      } else {
        var monkeysNode = getIn(this._monkeys, path).data;

        // Is this required that we clean some already existing monkeys?
        if (monkeysNode) clean(monkeysNode, path);

        // Let's walk the tree only from the updated point
        if (operation !== 'unset') {
          walk(node, path);
          register.forEach(function (m) {
            return m.checkRecursivity();
          });
        }
      }

      return this;
    }

    /**
     * Method used to validate the tree's data.
     *
     * @return {boolean} - Is the tree valid?
     */
  }, {
    key: 'validate',
    value: function validate(affectedPaths) {
      var _options = this.options;
      var validate = _options.validate;
      var behavior = _options.validationBehavior;

      if (typeof validate !== 'function') return null;

      var error = validate.call(this, this._previousData, this._data, affectedPaths || [[]]);

      if (error instanceof Error) {

        if (behavior === 'rollback') {
          this._data = this._previousData;
          this._affectedPathsIndex = {};
          this._transaction = [];
          this._previousData = this._data;
        }

        this.emit('invalid', { error: error });

        return error;
      }

      return null;
    }

    /**
     * Method used to select data within the tree by creating a cursor. Cursors
     * are kept as singletons by the tree for performance and hygiene reasons.
     *
     * Arity (1):
     * @param {path}    path - Path to select in the tree.
     *
     * Arity (*):
     * @param {...step} path - Path to select in the tree.
     *
     * @return {Cursor}      - The resultant cursor.
     */
  }, {
    key: 'select',
    value: function select(path) {

      // If no path is given, we simply return the root
      path = path || [];

      // Variadic
      if (arguments.length > 1) path = arrayFrom(arguments);

      // Checking that given path is valid
      if (!_type2['default'].path(path)) throw makeError('Baobab.select: invalid path.', { path: path });

      // Casting to array
      path = [].concat(path);

      // Computing hash (done here because it would be too late to do it in the
      // cursor's constructor since we need to hit the cursors' index first).
      var hash = hashPath(path);

      // Creating a new cursor or returning the already existing one for the
      // requested path.
      var cursor = this._cursors[hash];

      if (!cursor) {
        cursor = new _cursor2['default'](this, path, hash);
        this._cursors[hash] = cursor;
      }

      // Emitting an event to notify that a part of the tree was selected
      this.emit('select', { path: path, cursor: cursor });
      return cursor;
    }

    /**
     * Method used to update the tree. Updates are simply expressed by a path,
     * dynamic or not, and an operation.
     *
     * This is where path solving should happen and not in the cursor.
     *
     * @param  {path}   path      - The path where we'll apply the operation.
     * @param  {object} operation - The operation to apply.
     * @return {mixed} - Return the result of the update.
     */
  }, {
    key: 'update',
    value: function update(path, operation) {
      var _this3 = this;

      // Coercing path
      path = coercePath(path);

      if (!_type2['default'].operationType(operation.type)) throw makeError('Baobab.update: unknown operation type "' + operation.type + '".', { operation: operation });

      // Solving the given path

      var _getIn = getIn(this._data, path);

      var solvedPath = _getIn.solvedPath;
      var exists = _getIn.exists;

      // If we couldn't solve the path, we throw
      if (!solvedPath) throw makeError('Baobab.update: could not solve the given path.', {
        path: solvedPath
      });

      // Read-only path?
      var monkeyPath = _type2['default'].monkeyPath(this._monkeys, solvedPath);
      if (monkeyPath && solvedPath.length > monkeyPath.length) throw makeError('Baobab.update: attempting to update a read-only path.', {
        path: solvedPath
      });

      // We don't unset irrelevant paths
      if (operation.type === 'unset' && !exists) return;

      // If we merge data, we need to acknowledge monkeys
      var realOperation = operation;
      if (/merge/.test(operation.type)) {
        var monkeysNode = getIn(this._monkeys, solvedPath).data;

        if (_type2['default'].object(monkeysNode)) {
          realOperation = shallowClone(realOperation);

          if (/deep/.test(realOperation.type)) realOperation.value = deepMerge({}, monkeysNode, realOperation.value);else realOperation.value = shallowMerge({}, monkeysNode, realOperation.value);
        }
      }

      // Stashing previous data if this is the frame's first update
      if (!this._transaction.length) this._previousData = this._data;

      // Applying the operation
      var result = (0, _update3['default'])(this._data, solvedPath, realOperation, this.options);

      var data = result.data;
      var node = result.node;

      // If because of purity, the update was moot, we stop here
      if (!('data' in result)) return node;

      // If the operation is push, the affected path is slightly different
      var affectedPath = solvedPath.concat(operation.type === 'push' ? node.length - 1 : []);

      var hash = hashPath(affectedPath);

      // Updating data and transaction
      this._data = data;
      this._affectedPathsIndex[hash] = true;
      this._transaction.push(_extends({}, operation, { path: affectedPath }));

      // Updating the monkeys
      this._refreshMonkeys(node, solvedPath, operation.type);

      // Emitting a `write` event
      this.emit('write', { path: affectedPath });

      // Should we let the user commit?
      if (!this.options.autoCommit) return node;

      // Should we update asynchronously?
      if (!this.options.asynchronous) {
        this.commit();
        return node;
      }

      // Updating asynchronously
      if (!this._future) this._future = setTimeout(function () {
        return _this3.commit();
      }, 0);

      // Finally returning the affected node
      return node;
    }

    /**
     * Method committing the updates of the tree and firing the tree's events.
     *
     * @return {Baobab} - The tree instance for chaining purposes.
     */
  }, {
    key: 'commit',
    value: function commit() {

      // Clearing timeout if one was defined
      if (this._future) this._future = clearTimeout(this._future);

      var affectedPaths = Object.keys(this._affectedPathsIndex).map(function (h) {
        return h !== 'λ' ? h.split('λ').slice(1) : [];
      });

      // Is the tree still valid?
      var validationError = this.validate(affectedPaths);

      if (validationError) return this;

      // Caching to keep original references before we change them
      var transaction = this._transaction,
          previousData = this._previousData;

      this._affectedPathsIndex = {};
      this._transaction = [];
      this._previousData = this._data;

      // Emitting update event
      this.emit('update', {
        paths: affectedPaths,
        currentData: this._data,
        transaction: transaction,
        previousData: previousData
      });

      return this;
    }

    /**
     * Method used to watch a collection of paths within the tree. Very useful
     * to bind UI components and such to the tree.
     *
     * @param  {object} mapping - Mapping of paths to listen.
     * @return {Cursor}         - The created watcher.
     */
  }, {
    key: 'watch',
    value: function watch(mapping) {
      return new _watcher2['default'](this, mapping);
    }

    /**
     * Method releasing the tree and its attached data from memory.
     */
  }, {
    key: 'release',
    value: function release() {
      var k = undefined;

      this.emit('release');

      delete this.root;

      delete this._data;
      delete this._previousData;
      delete this._transaction;
      delete this._affectedPathsIndex;
      delete this._monkeys;

      // Releasing cursors
      for (k in this._cursors) this._cursors[k].release();
      delete this._cursors;

      // Killing event emitter
      this.kill();
    }

    /**
     * Overriding the `toJSON` method for convenient use with JSON.stringify.
     *
     * @return {mixed} - Data at cursor.
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.serialize();
    }

    /**
     * Overriding the `toString` method for debugging purposes.
     *
     * @return {string} - The baobab's identity.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return this._identity;
    }
  }]);

  return Baobab;
})(_emmett2['default']);

exports['default'] = Baobab;
Baobab.monkey = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (!args.length) throw new Error('Baobab.monkey: missing definition.');

  if (args.length === 1) return new _monkey.MonkeyDefinition(args[0]);

  return new _monkey.MonkeyDefinition(args);
};
Baobab.dynamicNode = Baobab.monkey;

/**
 * Exposing some internals for convenience
 */
Baobab.Cursor = _cursor2['default'];
Baobab.MonkeyDefinition = _monkey.MonkeyDefinition;
Baobab.Monkey = _monkey.Monkey;
Baobab.type = _type2['default'];
Baobab.helpers = helpers;

/**
 * Version
 */
Object.defineProperty(Baobab, 'version', {
  value: '2.2.1'
});

/**
 * Exporting
 */
exports['default'] = Baobab;
module.exports = exports['default'];
},{"./cursor":2,"./helpers":3,"./monkey":4,"./type":5,"./update":6,"./watcher":7,"emmett":8}],2:[function(require,module,exports){
/**
 * Baobab Cursors
 * ===============
 *
 * Cursors created by selecting some data within a Baobab tree.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _emmett = require('emmett');

var _emmett2 = _interopRequireDefault(_emmett);

var _monkey = require('./monkey');

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _helpers = require('./helpers');

/**
 * Traversal helper function for dynamic cursors. Will throw a legible error
 * if traversal is not possible.
 *
 * @param {string} method     - The method name, to create a correct error msg.
 * @param {array}  solvedPath - The cursor's solved path.
 */
function checkPossibilityOfDynamicTraversal(method, solvedPath) {
  if (!solvedPath) throw (0, _helpers.makeError)('Baobab.Cursor.' + method + ': ' + ('cannot use ' + method + ' on an unresolved dynamic path.'), { path: solvedPath });
}

/**
 * Cursor class
 *
 * @constructor
 * @param {Baobab} tree   - The cursor's root.
 * @param {array}  path   - The cursor's path in the tree.
 * @param {string} hash   - The path's hash computed ahead by the tree.
 */

var Cursor = (function (_Emitter) {
  _inherits(Cursor, _Emitter);

  function Cursor(tree, path, hash) {
    var _this = this;

    _classCallCheck(this, Cursor);

    _get(Object.getPrototypeOf(Cursor.prototype), 'constructor', this).call(this);

    // If no path were to be provided, we fallback to an empty path (root)
    path = path || [];

    // Privates
    this._identity = '[object Cursor]';
    this._archive = null;

    // Properties
    this.tree = tree;
    this.path = path;
    this.hash = hash;

    // State
    this.state = {
      killed: false,
      recording: false,
      undoing: false
    };

    // Checking whether the given path is dynamic or not
    this._dynamicPath = _type2['default'].dynamicPath(this.path);

    // Checking whether the given path will meet a monkey
    this._monkeyPath = _type2['default'].monkeyPath(this.tree._monkeys, this.path);

    if (!this._dynamicPath) this.solvedPath = this.path;else this.solvedPath = (0, _helpers.getIn)(this.tree._data, this.path).solvedPath;

    /**
     * Listener bound to the tree's writes so that cursors with dynamic paths
     * may update their solved path correctly.
     *
     * @param {object} event - The event fired by the tree.
     */
    this._writeHandler = function (_ref) {
      var data = _ref.data;

      if (_this.state.killed || !(0, _helpers.solveUpdate)([data.path], _this._getComparedPaths())) return;

      _this.solvedPath = (0, _helpers.getIn)(_this.tree._data, _this.path).solvedPath;
    };

    /**
     * Function in charge of actually trigger the cursor's updates and
     * deal with the archived records.
     *
     * @note: probably should wrap the current solvedPath in closure to avoid
     * for tricky cases where it would fail.
     *
     * @param {mixed} previousData - the tree's previous data.
     */
    var fireUpdate = function fireUpdate(previousData) {
      var self = _this;

      var eventData = Object.defineProperties({}, {
        previousData: {
          get: function get() {
            return (0, _helpers.getIn)(previousData, self.solvedPath).data;
          },
          configurable: true,
          enumerable: true
        },
        currentData: {
          get: function get() {
            return self.get();
          },
          configurable: true,
          enumerable: true
        }
      });

      if (_this.state.recording && !_this.state.undoing) _this.archive.add(eventData.previousData);

      _this.state.undoing = false;

      return _this.emit('update', eventData);
    };

    /**
     * Listener bound to the tree's updates and determining whether the
     * cursor is affected and should react accordingly.
     *
     * Note that this listener is lazily bound to the tree to be sure
     * one wouldn't leak listeners when only creating cursors for convenience
     * and not to listen to updates specifically.
     *
     * @param {object} event - The event fired by the tree.
     */
    this._updateHandler = function (event) {
      if (_this.state.killed) return;

      var _event$data = event.data;
      var paths = _event$data.paths;
      var previousData = _event$data.previousData;
      var update = fireUpdate.bind(_this, previousData);
      var comparedPaths = _this._getComparedPaths();

      if ((0, _helpers.solveUpdate)(paths, comparedPaths)) return update();
    };

    // Lazy binding
    var bound = false;
    this._lazyBind = function () {
      if (bound) return;

      bound = true;

      if (_this._dynamicPath) _this.tree.on('write', _this._writeHandler);

      return _this.tree.on('update', _this._updateHandler);
    };

    // If the path is dynamic, we actually need to listen to the tree
    if (this._dynamicPath) {
      this._lazyBind();
    } else {

      // Overriding the emitter `on` and `once` methods
      this.on = (0, _helpers.before)(this._lazyBind, this.on.bind(this));
      this.once = (0, _helpers.before)(this._lazyBind, this.once.bind(this));
    }
  }

  /**
   * Method used to allow iterating over cursors containing list-type data.
   *
   * e.g. for(let i of cursor) { ... }
   *
   * @returns {object} -  Each item sequentially.
   */

  /**
   * Internal helpers
   * -----------------
   */

  /**
   * Method returning the paths of the tree watched over by the cursor and that
   * should be taken into account when solving a potential update.
   *
   * @return {array} - Array of paths to compare with a given update.
   */

  _createClass(Cursor, [{
    key: '_getComparedPaths',
    value: function _getComparedPaths() {

      // Checking whether we should keep track of some dependencies
      var additionalPaths = this._monkeyPath ? (0, _helpers.getIn)(this.tree._monkeys, this._monkeyPath).data.relatedPaths() : [];

      return [this.solvedPath].concat(additionalPaths);
    }

    /**
     * Predicates
     * -----------
     */

    /**
     * Method returning whether the cursor is at root level.
     *
     * @return {boolean} - Is the cursor the root?
     */
  }, {
    key: 'isRoot',
    value: function isRoot() {
      return !this.path.length;
    }

    /**
     * Method returning whether the cursor is at leaf level.
     *
     * @return {boolean} - Is the cursor a leaf?
     */
  }, {
    key: 'isLeaf',
    value: function isLeaf() {
      return _type2['default'].primitive(this._get().data);
    }

    /**
     * Method returning whether the cursor is at branch level.
     *
     * @return {boolean} - Is the cursor a branch?
     */
  }, {
    key: 'isBranch',
    value: function isBranch() {
      return !this.isRoot() && !this.isLeaf();
    }

    /**
     * Traversal Methods
     * ------------------
     */

    /**
     * Method returning the root cursor.
     *
     * @return {Baobab} - The root cursor.
     */
  }, {
    key: 'root',
    value: function root() {
      return this.tree.select();
    }

    /**
     * Method selecting a subpath as a new cursor.
     *
     * Arity (1):
     * @param  {path} path    - The path to select.
     *
     * Arity (*):
     * @param  {...step} path - The path to select.
     *
     * @return {Cursor}       - The created cursor.
     */
  }, {
    key: 'select',
    value: function select(path) {
      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      return this.tree.select(this.path.concat(path));
    }

    /**
     * Method returning the parent node of the cursor or else `null` if the
     * cursor is already at root level.
     *
     * @return {Baobab} - The parent cursor.
     */
  }, {
    key: 'up',
    value: function up() {
      if (!this.isRoot()) return this.tree.select(this.path.slice(0, -1));

      return null;
    }

    /**
     * Method returning the child node of the cursor.
     *
     * @return {Baobab} - The child cursor.
     */
  }, {
    key: 'down',
    value: function down() {
      checkPossibilityOfDynamicTraversal('down', this.solvedPath);

      if (!(this._get().data instanceof Array)) throw Error('Baobab.Cursor.down: cannot go down on a non-list type.');

      return this.tree.select(this.solvedPath.concat(0));
    }

    /**
     * Method returning the left sibling node of the cursor if this one is
     * pointing at a list. Returns `null` if this cursor is already leftmost.
     *
     * @return {Baobab} - The left sibling cursor.
     */
  }, {
    key: 'left',
    value: function left() {
      checkPossibilityOfDynamicTraversal('left', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.left: cannot go left on a non-list type.');

      return last ? this.tree.select(this.solvedPath.slice(0, -1).concat(last - 1)) : null;
    }

    /**
     * Method returning the right sibling node of the cursor if this one is
     * pointing at a list. Returns `null` if this cursor is already rightmost.
     *
     * @return {Baobab} - The right sibling cursor.
     */
  }, {
    key: 'right',
    value: function right() {
      checkPossibilityOfDynamicTraversal('right', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.right: cannot go right on a non-list type.');

      if (last + 1 === this.up()._get().data.length) return null;

      return this.tree.select(this.solvedPath.slice(0, -1).concat(last + 1));
    }

    /**
     * Method returning the leftmost sibling node of the cursor if this one is
     * pointing at a list.
     *
     * @return {Baobab} - The leftmost sibling cursor.
     */
  }, {
    key: 'leftmost',
    value: function leftmost() {
      checkPossibilityOfDynamicTraversal('leftmost', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.leftmost: cannot go left on a non-list type.');

      return this.tree.select(this.solvedPath.slice(0, -1).concat(0));
    }

    /**
     * Method returning the rightmost sibling node of the cursor if this one is
     * pointing at a list.
     *
     * @return {Baobab} - The rightmost sibling cursor.
     */
  }, {
    key: 'rightmost',
    value: function rightmost() {
      checkPossibilityOfDynamicTraversal('rightmost', this.solvedPath);

      var last = +this.solvedPath[this.solvedPath.length - 1];

      if (isNaN(last)) throw Error('Baobab.Cursor.rightmost: cannot go right on a non-list type.');

      var list = this.up()._get().data;

      return this.tree.select(this.solvedPath.slice(0, -1).concat(list.length - 1));
    }

    /**
     * Method mapping the children nodes of the cursor.
     *
     * @param  {function} fn      - The function to map.
     * @param  {object}   [scope] - An optional scope.
     * @return {array}            - The resultant array.
     */
  }, {
    key: 'map',
    value: function map(fn, scope) {
      checkPossibilityOfDynamicTraversal('map', this.solvedPath);

      var array = this._get().data,
          l = arguments.length;

      if (!_type2['default'].array(array)) throw Error('baobab.Cursor.map: cannot map a non-list type.');

      return array.map(function (item, i) {
        return fn.call(l > 1 ? scope : this, this.select(i), i, array);
      }, this);
    }

    /**
     * Getter Methods
     * ---------------
     */

    /**
     * Internal get method. Basically contains the main body of the `get` method
     * without the event emitting. This is sometimes needed not to fire useless
     * events.
     *
     * @param  {path}   [path=[]]       - Path to get in the tree.
     * @return {object} info            - The resultant information.
     * @return {mixed}  info.data       - Data at path.
     * @return {array}  info.solvedPath - The path solved when getting.
     */
  }, {
    key: '_get',
    value: function _get() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      if (!_type2['default'].path(path)) throw (0, _helpers.makeError)('Baobab.Cursor.getters: invalid path.', { path: path });

      if (!this.solvedPath) return { data: undefined, solvedPath: null, exists: false };

      return (0, _helpers.getIn)(this.tree._data, this.solvedPath.concat(path));
    }

    /**
     * Method used to check whether a certain path exists in the tree starting
     * from the current cursor.
     *
     * Arity (1):
     * @param  {path}   path           - Path to check in the tree.
     *
     * Arity (2):
     * @param {..step}  path           - Path to check in the tree.
     *
     * @return {boolean}               - Does the given path exists?
     */
  }, {
    key: 'exists',
    value: function exists(path) {
      path = (0, _helpers.coercePath)(path);

      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      return this._get(path).exists;
    }

    /**
     * Method used to get data from the tree. Will fire a `get` event from the
     * tree so that the user may sometimes react upon it to fetch data, for
     * instance.
     *
     * Arity (1):
     * @param  {path}   path           - Path to get in the tree.
     *
     * Arity (2):
     * @param  {..step} path           - Path to get in the tree.
     *
     * @return {mixed}                 - Data at path.
     */
  }, {
    key: 'get',
    value: function get(path) {
      path = (0, _helpers.coercePath)(path);

      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      var _get2 = this._get(path);

      var data = _get2.data;
      var solvedPath = _get2.solvedPath;

      // Emitting the event
      this.tree.emit('get', { data: data, solvedPath: solvedPath, path: this.path.concat(path) });

      return data;
    }

    /**
     * Method used to return raw data from the tree, by carefully avoiding
     * computed one.
     *
     * @todo: should be more performant as the cloning should happen as well as
     * when dropping computed data.
     *
     * Arity (1):
     * @param  {path}   path           - Path to serialize in the tree.
     *
     * Arity (2):
     * @param  {..step} path           - Path to serialize in the tree.
     *
     * @return {mixed}                 - The retrieved raw data.
     */
  }, {
    key: 'serialize',
    value: function serialize(path) {
      path = (0, _helpers.coercePath)(path);

      if (arguments.length > 1) path = (0, _helpers.arrayFrom)(arguments);

      if (!_type2['default'].path(path)) throw (0, _helpers.makeError)('Baobab.Cursor.getters: invalid path.', { path: path });

      if (!this.solvedPath) return undefined;

      var fullPath = this.solvedPath.concat(path);

      var data = (0, _helpers.deepClone)((0, _helpers.getIn)(this.tree._data, fullPath).data),
          monkeys = (0, _helpers.getIn)(this.tree._monkeys, fullPath).data;

      var dropComputedData = function dropComputedData(d, m) {
        if (!_type2['default'].object(m) || !_type2['default'].object(d)) return;

        for (var k in m) {
          if (m[k] instanceof _monkey.Monkey) delete d[k];else dropComputedData(d[k], m[k]);
        }
      };

      dropComputedData(data, monkeys);
      return data;
    }

    /**
     * Method used to project some of the data at cursor onto a map or a list.
     *
     * @param  {object|array} projection - The projection's formal definition.
     * @return {object|array}            - The resultant map/list.
     */
  }, {
    key: 'project',
    value: function project(projection) {
      if (_type2['default'].object(projection)) {
        var data = {};

        for (var k in projection) {
          data[k] = this.get(projection[k]);
        }return data;
      } else if (_type2['default'].array(projection)) {
        var data = [];

        for (var i = 0, l = projection.length; i < l; i++) {
          data.push(this.get(projection[i]));
        }return data;
      }

      throw (0, _helpers.makeError)('Baobab.Cursor.project: wrong projection.', { projection: projection });
    }

    /**
     * History Methods
     * ----------------
     */

    /**
     * Methods starting to record the cursor's successive states.
     *
     * @param  {integer} [maxRecords] - Maximum records to keep in memory. Note
     *                                  that if no number is provided, the cursor
     *                                  will keep everything.
     * @return {Cursor}               - The cursor instance for chaining purposes.
     */
  }, {
    key: 'startRecording',
    value: function startRecording(maxRecords) {
      maxRecords = maxRecords || Infinity;

      if (maxRecords < 1) throw (0, _helpers.makeError)('Baobab.Cursor.startRecording: invalid max records.', {
        value: maxRecords
      });

      this.state.recording = true;

      if (this.archive) return this;

      // Lazy binding
      this._lazyBind();

      this.archive = new _helpers.Archive(maxRecords);
      return this;
    }

    /**
     * Methods stopping to record the cursor's successive states.
     *
     * @return {Cursor} - The cursor instance for chaining purposes.
     */
  }, {
    key: 'stopRecording',
    value: function stopRecording() {
      this.state.recording = false;
      return this;
    }

    /**
     * Methods undoing n steps of the cursor's recorded states.
     *
     * @param  {integer} [steps=1] - The number of steps to rollback.
     * @return {Cursor}            - The cursor instance for chaining purposes.
     */
  }, {
    key: 'undo',
    value: function undo() {
      var steps = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      if (!this.state.recording) throw new Error('Baobab.Cursor.undo: cursor is not recording.');

      var record = this.archive.back(steps);

      if (!record) throw Error('Baobab.Cursor.undo: cannot find a relevant record.');

      this.state.undoing = true;
      this.set(record);

      return this;
    }

    /**
     * Methods returning whether the cursor has a recorded history.
     *
     * @return {boolean} - `true` if the cursor has a recorded history?
     */
  }, {
    key: 'hasHistory',
    value: function hasHistory() {
      return !!(this.archive && this.archive.get().length);
    }

    /**
     * Methods returning the cursor's history.
     *
     * @return {array} - The cursor's history.
     */
  }, {
    key: 'getHistory',
    value: function getHistory() {
      return this.archive ? this.archive.get() : [];
    }

    /**
     * Methods clearing the cursor's history.
     *
     * @return {Cursor} - The cursor instance for chaining purposes.
     */
  }, {
    key: 'clearHistory',
    value: function clearHistory() {
      if (this.archive) this.archive.clear();
      return this;
    }

    /**
     * Releasing
     * ----------
     */

    /**
     * Methods releasing the cursor from memory.
     */
  }, {
    key: 'release',
    value: function release() {

      // Removing listeners on parent
      if (this._dynamicPath) this.tree.off('write', this._writeHandler);

      this.tree.off('update', this._updateHandler);

      // Unsubscribe from the parent
      if (this.hash) delete this.tree._cursors[this.hash];

      // Dereferencing
      delete this.tree;
      delete this.path;
      delete this.solvedPath;
      delete this.archive;

      // Killing emitter
      this.kill();
      this.state.killed = true;
    }

    /**
     * Output
     * -------
     */

    /**
     * Overriding the `toJSON` method for convenient use with JSON.stringify.
     *
     * @return {mixed} - Data at cursor.
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.serialize();
    }

    /**
     * Overriding the `toString` method for debugging purposes.
     *
     * @return {string} - The cursor's identity.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return this._identity;
    }
  }]);

  return Cursor;
})(_emmett2['default']);

exports['default'] = Cursor;
if (typeof Symbol === 'function' && typeof Symbol.iterator !== 'undefined') {
  Cursor.prototype[Symbol.iterator] = function () {
    var array = this._get().data;

    if (!_type2['default'].array(array)) throw Error('baobab.Cursor.@@iterate: cannot iterate a non-list type.');

    var i = 0;

    var cursor = this,
        length = array.length;

    return {
      next: function next() {
        if (i < length) {
          return {
            value: cursor.select(i++)
          };
        }

        return {
          done: true
        };
      }
    };
  };
}

/**
 * Setter Methods
 * ---------------
 *
 * Those methods are dynamically assigned to the class for DRY reasons.
 */

/**
 * Function creating a setter method for the Cursor class.
 *
 * @param {string}   name          - the method's name.
 * @param {function} [typeChecker] - a function checking that the given value is
 *                                   valid for the given operation.
 */
function makeSetter(name, typeChecker) {

  /**
   * Binding a setter method to the Cursor class and having the following
   * definition.
   *
   * Note: this is not really possible to make those setters variadic because
   * it would create an impossible polymorphism with path.
   *
   * @todo: perform value validation elsewhere so that tree.update can
   * beneficiate from it.
   *
   * Arity (1):
   * @param  {mixed} value - New value to set at cursor's path.
   *
   * Arity (2):
   * @param  {path}  path  - Subpath to update starting from cursor's.
   * @param  {mixed} value - New value to set.
   *
   * @return {mixed}       - Data at path.
   */
  Cursor.prototype[name] = function (path, value) {

    // We should warn the user if he applies to many arguments to the function
    if (arguments.length > 2) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': too many arguments.');

    // Handling arities
    if (arguments.length === 1 && name !== 'unset') {
      value = path;
      path = [];
    }

    // Coerce path
    path = (0, _helpers.coercePath)(path);

    // Checking the path's validity
    if (!_type2['default'].path(path)) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': invalid path.', { path: path });

    // Checking the value's validity
    if (typeChecker && !typeChecker(value)) throw (0, _helpers.makeError)('Baobab.Cursor.' + name + ': invalid value.', { path: path, value: value });

    var fullPath = this.solvedPath.concat(path);

    // Filing the update to the tree
    return this.tree.update(fullPath, {
      type: name,
      value: value
    });
  };
}

/**
 * Making the necessary setters.
 */
makeSetter('set');
makeSetter('unset');
makeSetter('apply', _type2['default']['function']);
makeSetter('push');
makeSetter('concat', _type2['default'].array);
makeSetter('unshift');
makeSetter('splice', _type2['default'].splicer);
makeSetter('merge', _type2['default'].object);
makeSetter('deepMerge', _type2['default'].object);
module.exports = exports['default'];
},{"./helpers":3,"./monkey":4,"./type":5,"emmett":8}],3:[function(require,module,exports){
(function (global){
/* eslint eqeqeq: 0 */

/**
 * Baobab Helpers
 * ===============
 *
 * Miscellaneous helper functions.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.arrayFrom = arrayFrom;
exports.before = before;
exports.coercePath = coercePath;
exports.getIn = getIn;
exports.makeError = makeError;
exports.solveRelativePath = solveRelativePath;
exports.solveUpdate = solveUpdate;
exports.splice = splice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _monkey = require('./monkey');

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

/**
 * Noop function
 */
var noop = Function.prototype;

/**
 * Function returning the index of the first element of a list matching the
 * given predicate.
 *
 * @param  {array}     a  - The target array.
 * @param  {function}  fn - The predicate function.
 * @return {mixed}        - The index of the first matching item or -1.
 */
function index(a, fn) {
  var i = undefined,
      l = undefined;
  for (i = 0, l = a.length; i < l; i++) {
    if (fn(a[i])) return i;
  }
  return -1;
}

/**
 * Efficient slice function used to clone arrays or parts of them.
 *
 * @param  {array} array - The array to slice.
 * @return {array}       - The sliced array.
 */
function slice(array) {
  var newArray = new Array(array.length);

  var i = undefined,
      l = undefined;

  for (i = 0, l = array.length; i < l; i++) newArray[i] = array[i];

  return newArray;
}

/**
 * Archive abstraction
 *
 * @constructor
 * @param {integer} size - Maximum number of records to store.
 */

var Archive = (function () {
  function Archive(size) {
    _classCallCheck(this, Archive);

    this.size = size;
    this.records = [];
  }

  /**
   * Function creating a real array from what should be an array but is not.
   * I'm looking at you nasty `arguments`...
   *
   * @param  {mixed} culprit - The culprit to convert.
   * @return {array}         - The real array.
   */

  /**
   * Method retrieving the records.
   *
   * @return {array} - The records.
   */

  _createClass(Archive, [{
    key: 'get',
    value: function get() {
      return this.records;
    }

    /**
     * Method adding a record to the archive
     *
     * @param {object}  record - The record to store.
     * @return {Archive}       - The archive itself for chaining purposes.
     */
  }, {
    key: 'add',
    value: function add(record) {
      this.records.unshift(record);

      // If the number of records is exceeded, we truncate the records
      if (this.records.length > this.size) this.records.length = this.size;

      return this;
    }

    /**
     * Method clearing the records.
     *
     * @return {Archive} - The archive itself for chaining purposes.
     */
  }, {
    key: 'clear',
    value: function clear() {
      this.records = [];
      return this;
    }

    /**
     * Method to go back in time.
     *
     * @param {integer} steps - Number of steps we should go back by.
     * @return {number}       - The last record.
     */
  }, {
    key: 'back',
    value: function back(steps) {
      var record = this.records[steps - 1];

      if (record) this.records = this.records.slice(steps);
      return record;
    }
  }]);

  return Archive;
})();

exports.Archive = Archive;

function arrayFrom(culprit) {
  return slice(culprit);
}

/**
 * Function decorating one function with another that will be called before the
 * decorated one.
 *
 * @param  {function} decorator - The decorating function.
 * @param  {function} fn        - The function to decorate.
 * @return {function}           - The decorated function.
 */

function before(decorator, fn) {
  return function () {
    decorator.apply(null, arguments);
    fn.apply(null, arguments);
  };
}

/**
 * Function cloning the given regular expression. Supports `y` and `u` flags
 * already.
 *
 * @param  {RegExp} re - The target regular expression.
 * @return {RegExp}    - The cloned regular expression.
 */
function cloneRegexp(re) {
  var pattern = re.source;

  var flags = '';

  if (re.global) flags += 'g';
  if (re.multiline) flags += 'm';
  if (re.ignoreCase) flags += 'i';
  if (re.sticky) flags += 'y';
  if (re.unicode) flags += 'u';

  return new RegExp(pattern, flags);
}

/**
 * Function cloning the given variable.
 *
 * @todo: implement a faster way to clone an array.
 *
 * @param  {boolean} deep - Should we deep clone the variable.
 * @param  {mixed}   item - The variable to clone
 * @return {mixed}        - The cloned variable.
 */
function cloner(deep, item) {
  if (!item || typeof item !== 'object' || item instanceof Error || item instanceof _monkey.MonkeyDefinition || 'ArrayBuffer' in global && item instanceof ArrayBuffer) return item;

  // Array
  if (_type2['default'].array(item)) {
    if (deep) {
      var a = [];

      var i = undefined,
          l = undefined;

      for (i = 0, l = item.length; i < l; i++) a.push(cloner(true, item[i]));
      return a;
    }

    return slice(item);
  }

  // Date
  if (item instanceof Date) return new Date(item.getTime());

  // RegExp
  if (item instanceof RegExp) return cloneRegexp(item);

  // Object
  if (_type2['default'].object(item)) {
    var o = {};

    var k = undefined;

    // NOTE: could be possible to erase computed properties through `null`.
    for (k in item) {
      if (_type2['default'].lazyGetter(item, k)) {
        Object.defineProperty(o, k, {
          get: Object.getOwnPropertyDescriptor(item, k).get,
          enumerable: true,
          configurable: true
        });
      } else if (item.hasOwnProperty(k)) {
        o[k] = deep ? cloner(true, item[k]) : item[k];
      }
    }
    return o;
  }

  return item;
}

/**
 * Exporting shallow and deep cloning functions.
 */
var shallowClone = cloner.bind(null, false),
    deepClone = cloner.bind(null, true);

exports.shallowClone = shallowClone;
exports.deepClone = deepClone;

/**
 * Coerce the given variable into a full-fledged path.
 *
 * @param  {mixed} target - The variable to coerce.
 * @return {array}        - The array path.
 */

function coercePath(target) {
  if (target || target === 0 || target === '') return target;
  return [];
}

/**
 * Function comparing an object's properties to a given descriptive
 * object.
 *
 * @param  {object} object      - The object to compare.
 * @param  {object} description - The description's mapping.
 * @return {boolean}            - Whether the object matches the description.
 */
function compare(object, description) {
  var ok = true,
      k = undefined;

  // If we reached here via a recursive call, object may be undefined because
  // not all items in a collection will have the same deep nesting structure.
  if (!object) return false;

  for (k in description) {
    if (_type2['default'].object(description[k])) {
      ok = ok && compare(object[k], description[k]);
    } else if (_type2['default'].array(description[k])) {
      ok = ok && !! ~description[k].indexOf(object[k]);
    } else {
      if (object[k] !== description[k]) return false;
    }
  }

  return ok;
}

/**
 * Function freezing the given variable if possible.
 *
 * @param  {boolean} deep - Should we recursively freeze the given objects?
 * @param  {object}  o    - The variable to freeze.
 * @return {object}    - The merged object.
 */
function freezer(deep, o) {
  if (typeof o !== 'object' || o === null || o instanceof _monkey.Monkey) return;

  Object.freeze(o);

  if (!deep) return;

  if (Array.isArray(o)) {

    // Iterating through the elements
    var i = undefined,
        l = undefined;

    for (i = 0, l = o.length; i < l; i++) freezer(true, o[i]);
  } else {
    var p = undefined,
        k = undefined;

    for (k in o) {
      if (_type2['default'].lazyGetter(o, k)) continue;

      p = o[k];

      if (!p || !o.hasOwnProperty(k) || typeof p !== 'object' || Object.isFrozen(p)) continue;

      freezer(true, p);
    }
  }
}

/**
 * Exporting both `freeze` and `deepFreeze` functions.
 * Note that if the engine does not support `Object.freeze` then this will
 * export noop functions instead.
 */
var isFreezeSupported = typeof Object.freeze === 'function';

var freeze = isFreezeSupported ? freezer.bind(null, false) : noop,
    deepFreeze = isFreezeSupported ? freezer.bind(null, true) : noop;

exports.freeze = freeze;
exports.deepFreeze = deepFreeze;

/**
 * Function retrieving nested data within the given object and according to
 * the given path.
 *
 * @todo: work if dynamic path hit objects also.
 * @todo: memoized perfgetters.
 *
 * @param  {object}  object - The object we need to get data from.
 * @param  {array}   path   - The path to follow.
 * @return {object}  result            - The result.
 * @return {mixed}   result.data       - The data at path, or `undefined`.
 * @return {array}   result.solvedPath - The solved path or `null`.
 * @return {boolean} result.exists     - Does the path exists in the tree?
 */
var notFoundObject = { data: undefined, solvedPath: null, exists: false };

function getIn(object, path) {
  if (!path) return notFoundObject;

  var solvedPath = [];

  var exists = true,
      c = object,
      idx = undefined,
      i = undefined,
      l = undefined;

  for (i = 0, l = path.length; i < l; i++) {
    if (!c) return { data: undefined, solvedPath: path, exists: false };

    if (typeof path[i] === 'function') {
      if (!_type2['default'].array(c)) return notFoundObject;

      idx = index(c, path[i]);
      if (! ~idx) return notFoundObject;

      solvedPath.push(idx);
      c = c[idx];
    } else if (typeof path[i] === 'object') {
      if (!_type2['default'].array(c)) return notFoundObject;

      idx = index(c, function (e) {
        return compare(e, path[i]);
      });
      if (! ~idx) return notFoundObject;

      solvedPath.push(idx);
      c = c[idx];
    } else {
      solvedPath.push(path[i]);
      exists = typeof c === 'object' && path[i] in c;
      c = c[path[i]];
    }
  }

  return { data: c, solvedPath: solvedPath, exists: exists };
}

/**
 * Little helper returning a JavaScript error carrying some data with it.
 *
 * @param  {string} message - The error message.
 * @param  {object} [data]  - Optional data to assign to the error.
 * @return {Error}          - The created error.
 */

function makeError(message, data) {
  var err = new Error(message);

  for (var k in data) {
    err[k] = data[k];
  }return err;
}

/**
 * Function taking n objects to merge them together.
 * Note 1): the latter object will take precedence over the first one.
 * Note 2): the first object will be mutated to allow for perf scenarios.
 * Note 3): this function will consider monkeys as leaves.
 *
 * @param  {boolean}   deep    - Whether the merge should be deep or not.
 * @param  {...object} objects - Objects to merge.
 * @return {object}            - The merged object.
 */
function merger(deep) {
  for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    objects[_key - 1] = arguments[_key];
  }

  var o = objects[0];

  var t = undefined,
      i = undefined,
      l = undefined,
      k = undefined;

  for (i = 1, l = objects.length; i < l; i++) {
    t = objects[i];

    for (k in t) {
      if (deep && _type2['default'].object(t[k]) && !(t[k] instanceof _monkey.Monkey)) {
        o[k] = merger(true, o[k] || {}, t[k]);
      } else {
        o[k] = t[k];
      }
    }
  }

  return o;
}

/**
 * Exporting both `shallowMerge` and `deepMerge` functions.
 */
var shallowMerge = merger.bind(null, false),
    deepMerge = merger.bind(null, true);

exports.shallowMerge = shallowMerge;
exports.deepMerge = deepMerge;

/**
 * Solving a potentially relative path.
 *
 * @param  {array} base - The base path from which to solve the path.
 * @param  {array} to   - The subpath to reach.
 * @param  {array}      - The solved absolute path.
 */

function solveRelativePath(base, to) {
  var solvedPath = [];

  for (var i = 0, l = to.length; i < l; i++) {
    var step = to[i];

    if (step === '.') {
      if (!i) solvedPath = base.slice(0);
    } else if (step === '..') {
      solvedPath = (!i ? base : solvedPath).slice(0, -1);
    } else {
      solvedPath.push(step);
    }
  }

  return solvedPath;
}

/**
 * Function determining whether some paths in the tree were affected by some
 * updates that occurred at the given paths. This helper is mainly used at
 * cursor level to determine whether the cursor is concerned by the updates
 * fired at tree level.
 *
 * NOTES: 1) If performance become an issue, the following threefold loop
 *           can be simplified to a complex twofold one.
 *        2) A regex version could also work but I am not confident it would
 *           be faster.
 *        3) Another solution would be to keep a register of cursors like with
 *           the monkeys and update along this tree.
 *
 * @param  {array} affectedPaths - The paths that were updated.
 * @param  {array} comparedPaths - The paths that we are actually interested in.
 * @return {boolean}             - Is the update relevant to the compared
 *                                 paths?
 */

function solveUpdate(affectedPaths, comparedPaths) {
  var i = undefined,
      j = undefined,
      k = undefined,
      l = undefined,
      m = undefined,
      n = undefined,
      p = undefined,
      c = undefined,
      s = undefined;

  // Looping through possible paths
  for (i = 0, l = affectedPaths.length; i < l; i++) {
    p = affectedPaths[i];

    if (!p.length) return true;

    // Looping through logged paths
    for (j = 0, m = comparedPaths.length; j < m; j++) {
      c = comparedPaths[j];

      if (!c || !c.length) return true;

      // Looping through steps
      for (k = 0, n = c.length; k < n; k++) {
        s = c[k];

        // If path is not relevant, we break
        // NOTE: the '!=' instead of '!==' is required here!
        if (s != p[k]) break;

        // If we reached last item and we are relevant
        if (k + 1 === n || k + 1 === p.length) return true;
      }
    }
  }

  return false;
}

/**
 * Non-mutative version of the splice array method.
 *
 * @param {array}    array        - The array to splice.
 * @param {integer}  startIndex   - The start index.
 * @param {integer}  nb           - Number of elements to remove.
 * @param {...mixed} elements     - Elements to append after splicing.
 * @return {array}                - The spliced array.
 */

function splice(array, startIndex, nb) {
  for (var _len2 = arguments.length, elements = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
    elements[_key2 - 3] = arguments[_key2];
  }

  return array.slice(0, startIndex).concat(elements).concat(array.slice(startIndex + Math.max(0, nb)));
}

/**
 * Function returning a unique incremental id each time it is called.
 *
 * @return {integer} - The latest unique id.
 */
var uniqid = (function () {
  var i = 0;

  return function () {
    return i++;
  };
})();

exports.uniqid = uniqid;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./monkey":4,"./type":5}],4:[function(require,module,exports){
/**
 * Baobab Monkeys
 * ===============
 *
 * Exposing both handy monkey definitions and the underlying working class.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _update2 = require('./update');

var _update3 = _interopRequireDefault(_update2);

var _helpers = require('./helpers');

/**
 * Monkey Definition class
 * Note: The only reason why this is a class is to be able to spot it within
 * otherwise ordinary data.
 *
 * @constructor
 * @param {array|object} definition - The formal definition of the monkey.
 */

var MonkeyDefinition = function MonkeyDefinition(definition) {
  var _this = this;

  _classCallCheck(this, MonkeyDefinition);

  var monkeyType = _type2['default'].monkeyDefinition(definition);

  if (!monkeyType) throw (0, _helpers.makeError)('Baobab.monkey: invalid definition.', { definition: definition });

  this.type = monkeyType;

  if (this.type === 'object') {
    this.getter = definition.get;
    this.projection = definition.cursors || {};
    this.paths = Object.keys(this.projection).map(function (k) {
      return _this.projection[k];
    });
  } else {
    this.getter = definition[definition.length - 1];
    this.projection = definition.slice(0, -1);
    this.paths = this.projection;
  }

  this.hasDynamicPaths = this.paths.some(_type2['default'].dynamicPath);
}

/**
 * Monkey core class
 *
 * @constructor
 * @param {Baobab}           tree       - The bound tree.
 * @param {MonkeyDefinition} definition - A definition instance.
 */
;

exports.MonkeyDefinition = MonkeyDefinition;

var Monkey = (function () {
  function Monkey(tree, pathInTree, definition) {
    var _this2 = this;

    _classCallCheck(this, Monkey);

    // Properties
    this.tree = tree;
    this.path = pathInTree;
    this.definition = definition;
    this.isRecursive = false;

    // Adapting the definition's paths & projection to this monkey's case
    var projection = definition.projection,
        relative = _helpers.solveRelativePath.bind(null, pathInTree.slice(0, -1));

    if (definition.type === 'object') {
      this.projection = Object.keys(projection).reduce(function (acc, k) {
        acc[k] = relative(projection[k]);
        return acc;
      }, {});
      this.depPaths = Object.keys(this.projection).map(function (k) {
        return _this2.projection[k];
      });
    } else {
      this.projection = projection.map(relative);
      this.depPaths = this.projection;
    }

    // Internal state
    this.state = {
      killed: false
    };

    /**
     * Listener on the tree's `write` event.
     *
     * When the tree writes, this listener will check whether the updated paths
     * are of any use to the monkey and, if so, will update the tree's node
     * where the monkey sits with a lazy getter.
     */
    this.listener = function (_ref) {
      var path = _ref.data.path;

      if (_this2.state.killed) return;

      // Is the monkey affected by the current write event?
      var concerned = (0, _helpers.solveUpdate)([path], _this2.relatedPaths());

      if (concerned) _this2.update();
    };

    // Binding listener
    this.tree.on('write', this.listener);

    // Updating relevant node
    this.update();
  }

  /**
   * Method triggering a recursivity check.
   *
   * @return {Monkey} - Returns itself for chaining purposes.
   */

  _createClass(Monkey, [{
    key: 'checkRecursivity',
    value: function checkRecursivity() {
      var _this3 = this;

      this.isRecursive = this.depPaths.some(function (p) {
        return !!_type2['default'].monkeyPath(_this3.tree._monkeys, p);
      });

      // Putting the recursive monkeys' listeners at the end of the stack
      // NOTE: this is a dirty hack and a more thorough solution should be found
      if (this.isRecursive) {
        this.tree.off('write', this.listener);
        this.tree.on('write', this.listener);
      }

      return this;
    }

    /**
     * Method returning solved paths related to the monkey.
     *
     * @return {array} - An array of related paths.
     */
  }, {
    key: 'relatedPaths',
    value: function relatedPaths() {
      var _this4 = this;

      var paths = undefined;

      if (this.definition.hasDynamicPaths) paths = this.depPaths.map(function (p) {
        return (0, _helpers.getIn)(_this4.tree._data, p).solvedPath;
      });else paths = this.depPaths;

      if (!this.isRecursive) return paths;

      return paths.reduce(function (accumulatedPaths, path) {
        var monkeyPath = _type2['default'].monkeyPath(_this4.tree._monkeys, path);

        if (!monkeyPath) return accumulatedPaths.concat([path]);

        // Solving recursive path
        var relatedMonkey = (0, _helpers.getIn)(_this4.tree._monkeys, monkeyPath).data;

        return accumulatedPaths.concat(relatedMonkey.relatedPaths());
      }, []);
    }

    /**
     * Method used to update the tree's internal data with a lazy getter holding
     * the computed data.
     *
     * @return {Monkey} - Returns itself for chaining purposes.
     */
  }, {
    key: 'update',
    value: function update() {
      var deps = this.tree.project(this.projection);

      var lazyGetter = (function (tree, def, data) {
        var cache = null,
            alreadyComputed = false;

        return function () {

          if (!alreadyComputed) {
            cache = def.getter.apply(tree, def.type === 'object' ? [data] : data);

            // Freezing if required
            if (tree.options.immutable) (0, _helpers.deepFreeze)(cache);

            alreadyComputed = true;
          }

          return cache;
        };
      })(this.tree, this.definition, deps);

      lazyGetter.isLazyGetter = true;

      // If the tree does not accept lazy monkeys, we solve the lazy getter
      if (this.tree.options.lazyMonkeys) {
        this.tree._data = (0, _update3['default'])(this.tree._data, this.path, { type: 'monkey', value: lazyGetter }, this.tree.options).data;
      } else {
        var result = (0, _update3['default'])(this.tree._data, this.path, { type: 'set', value: lazyGetter() }, this.tree.options);

        if ('data' in result) this.tree._data = result.data;
      }

      return this;
    }

    /**
     * Method releasing the monkey from memory.
     */
  }, {
    key: 'release',
    value: function release() {

      // Unbinding events
      this.tree.off('write', this.listener);
      this.state.killed = true;

      // Deleting properties
      // NOTE: not deleting this.definition because some strange things happen
      // in the _refreshMonkeys method. See #372.
      delete this.projection;
      delete this.depPaths;
      delete this.tree;
    }
  }]);

  return Monkey;
})();

exports.Monkey = Monkey;
},{"./helpers":3,"./type":5,"./update":6}],5:[function(require,module,exports){
/**
 * Baobab Type Checking
 * =====================
 *
 * Helpers functions used throughout the library to perform some type
 * tests at runtime.
 *
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _monkey = require('./monkey');

var type = {};

/**
 * Helpers
 * --------
 */

/**
 * Checking whether the given variable is of any of the given types.
 *
 * @todo   Optimize this function by dropping `some`.
 *
 * @param  {mixed} target  - Variable to test.
 * @param  {array} allowed - Array of allowed types.
 * @return {boolean}
 */
function anyOf(target, allowed) {
  return allowed.some(function (t) {
    return type[t](target);
  });
}

/**
 * Simple types
 * -------------
 */

/**
 * Checking whether the given variable is an array.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.array = function (target) {
  return Array.isArray(target);
};

/**
 * Checking whether the given variable is an object.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.object = function (target) {
  return target && typeof target === 'object' && !Array.isArray(target) && !(target instanceof Date) && !(target instanceof RegExp) && !(typeof Map === 'function' && target instanceof Map) && !(typeof Set === 'function' && target instanceof Set);
};

/**
 * Checking whether the given variable is a string.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.string = function (target) {
  return typeof target === 'string';
};

/**
 * Checking whether the given variable is a number.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.number = function (target) {
  return typeof target === 'number';
};

/**
 * Checking whether the given variable is a function.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type['function'] = function (target) {
  return typeof target === 'function';
};

/**
 * Checking whether the given variable is a JavaScript primitive.
 *
 * @param  {mixed} target - Variable to test.
 * @return {boolean}
 */
type.primitive = function (target) {
  return target !== Object(target);
};

/**
 * Complex types
 * --------------
 */

/**
 * Checking whether the given variable is a valid splicer.
 *
 * @param  {mixed} target    - Variable to test.
 * @param  {array} [allowed] - Optional valid types in path.
 * @return {boolean}
 */
type.splicer = function (target) {
  if (!type.array(target) || target.length < 2) return false;

  return anyOf(target[0], ['number', 'function', 'object']) && type.number(target[1]);
};

/**
 * Checking whether the given variable is a valid cursor path.
 *
 * @param  {mixed} target    - Variable to test.
 * @param  {array} [allowed] - Optional valid types in path.
 * @return {boolean}
 */

// Order is important for performance reasons
var ALLOWED_FOR_PATH = ['string', 'number', 'function', 'object'];

type.path = function (target) {
  if (!target && target !== 0 && target !== '') return false;

  return [].concat(target).every(function (step) {
    return anyOf(step, ALLOWED_FOR_PATH);
  });
};

/**
 * Checking whether the given path is a dynamic one.
 *
 * @param  {mixed} path - The path to test.
 * @return {boolean}
 */
type.dynamicPath = function (path) {
  return path.some(function (step) {
    return type['function'](step) || type.object(step);
  });
};

/**
 * Retrieve any monkey subpath in the given path or null if the path never comes
 * across computed data.
 *
 * @param  {mixed} data - The data to test.
 * @param  {array} path - The path to test.
 * @return {boolean}
 */
type.monkeyPath = function (data, path) {
  var subpath = [];

  var c = data,
      i = undefined,
      l = undefined;

  for (i = 0, l = path.length; i < l; i++) {
    subpath.push(path[i]);

    if (typeof c !== 'object') return null;

    c = c[path[i]];

    if (c instanceof _monkey.Monkey) return subpath;
  }

  return null;
};

/**
 * Check if the given object property is a lazy getter used by a monkey.
 *
 * @param  {mixed}   o           - The target object.
 * @param  {string}  propertyKey - The property to test.
 * @return {boolean}
 */
type.lazyGetter = function (o, propertyKey) {
  var descriptor = Object.getOwnPropertyDescriptor(o, propertyKey);

  return descriptor && descriptor.get && descriptor.get.isLazyGetter === true;
};

/**
 * Returns the type of the given monkey definition or `null` if invalid.
 *
 * @param  {mixed} definition - The definition to check.
 * @return {string|null}
 */
type.monkeyDefinition = function (definition) {

  if (type.object(definition)) {
    if (!type['function'](definition.get) || definition.cursors && (!type.object(definition.cursors) || !Object.keys(definition.cursors).every(function (k) {
      return type.path(definition.cursors[k]);
    }))) return null;

    return 'object';
  } else if (type.array(definition)) {
    if (!type['function'](definition[definition.length - 1]) || !definition.slice(0, -1).every(function (p) {
      return type.path(p);
    })) return null;

    return 'array';
  }

  return null;
};

/**
 * Checking whether the given watcher definition is valid.
 *
 * @param  {mixed}   definition - The definition to check.
 * @return {boolean}
 */
type.watcherMapping = function (definition) {
  return type.object(definition) && Object.keys(definition).every(function (k) {
    return type.path(definition[k]);
  });
};

/**
 * Checking whether the given string is a valid operation type.
 *
 * @param  {mixed} string - The string to test.
 * @return {boolean}
 */

// Ordered by likeliness
var VALID_OPERATIONS = ['set', 'apply', 'push', 'unshift', 'concat', 'deepMerge', 'merge', 'splice', 'unset'];

type.operationType = function (string) {
  return typeof string === 'string' && !! ~VALID_OPERATIONS.indexOf(string);
};

exports['default'] = type;
module.exports = exports['default'];
},{"./monkey":4}],6:[function(require,module,exports){
/**
 * Baobab Update
 * ==============
 *
 * The tree's update scheme.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = update;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _helpers = require('./helpers');

function err(operation, expectedTarget, path) {
  return (0, _helpers.makeError)('Baobab.update: cannot apply the "' + operation + '" on ' + ('a non ' + expectedTarget + ' (path: /' + path.join('/') + ').'), { path: path });
}

/**
 * Function aiming at applying a single update operation on the given tree's
 * data.
 *
 * @param  {mixed}  data      - The tree's data.
 * @param  {path}   path      - Path of the update.
 * @param  {object} operation - The operation to apply.
 * @param  {object} [opts]    - Optional options.
 * @return {mixed}            - Both the new tree's data and the updated node.
 */

function update(data, path, operation) {
  var opts = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var operationType = operation.type;
  var value = operation.value;

  // Dummy root, so we can shift and alter the root
  var dummy = { root: data },
      dummyPath = ['root'].concat(_toConsumableArray(path)),
      currentPath = [];

  // Walking the path
  var p = dummy,
      i = undefined,
      l = undefined,
      s = undefined;

  for (i = 0, l = dummyPath.length; i < l; i++) {

    // Current item's reference is therefore p[s]
    // The reason why we don't create a variable here for convenience
    // is because we actually need to mutate the reference.
    s = dummyPath[i];

    // Updating the path
    if (i > 0) currentPath.push(s);

    // If we reached the end of the path, we apply the operation
    if (i === l - 1) {

      /**
       * Set
       */
      if (operationType === 'set') {

        // Purity check
        if (opts.pure && p[s] === value) return { node: p[s] };

        if (_type2['default'].lazyGetter(p, s)) {
          Object.defineProperty(p, s, {
            value: value,
            enumerable: true,
            configurable: true
          });
        } else if (opts.persistent) {
          p[s] = (0, _helpers.shallowClone)(value);
        } else {
          p[s] = value;
        }
      }

      /**
       * Monkey
       */
      else if (operationType === 'monkey') {
          Object.defineProperty(p, s, {
            get: value,
            enumerable: true,
            configurable: true
          });
        }

        /**
         * Apply
         */
        else if (operationType === 'apply') {
            var result = value(p[s]);

            // Purity check
            if (opts.pure && p[s] === result) return { node: p[s] };

            if (_type2['default'].lazyGetter(p, s)) {
              Object.defineProperty(p, s, {
                value: result,
                enumerable: true,
                configurable: true
              });
            } else if (opts.persistent) {
              p[s] = (0, _helpers.shallowClone)(result);
            } else {
              p[s] = result;
            }
          }

          /**
           * Push
           */
          else if (operationType === 'push') {
              if (!_type2['default'].array(p[s])) throw err('push', 'array', currentPath);

              if (opts.persistent) p[s] = p[s].concat([value]);else p[s].push(value);
            }

            /**
             * Unshift
             */
            else if (operationType === 'unshift') {
                if (!_type2['default'].array(p[s])) throw err('unshift', 'array', currentPath);

                if (opts.persistent) p[s] = [value].concat(p[s]);else p[s].unshift(value);
              }

              /**
               * Concat
               */
              else if (operationType === 'concat') {
                  if (!_type2['default'].array(p[s])) throw err('concat', 'array', currentPath);

                  if (opts.persistent) p[s] = p[s].concat(value);else p[s].push.apply(p[s], value);
                }

                /**
                 * Splice
                 */
                else if (operationType === 'splice') {
                    if (!_type2['default'].array(p[s])) throw err('splice', 'array', currentPath);

                    if (opts.persistent) p[s] = _helpers.splice.apply(null, [p[s]].concat(value));else p[s].splice.apply(p[s], value);
                  }

                  /**
                   * Unset
                   */
                  else if (operationType === 'unset') {
                      if (_type2['default'].object(p)) delete p[s];else if (_type2['default'].array(p)) p.splice(s, 1);
                    }

                    /**
                     * Merge
                     */
                    else if (operationType === 'merge') {
                        if (!_type2['default'].object(p[s])) throw err('merge', 'object', currentPath);

                        if (opts.persistent) p[s] = (0, _helpers.shallowMerge)({}, p[s], value);else p[s] = (0, _helpers.shallowMerge)(p[s], value);
                      }

                      /**
                       * Deep merge
                       */
                      else if (operationType === 'deepMerge') {
                          if (!_type2['default'].object(p[s])) throw err('deepMerge', 'object', currentPath);

                          if (opts.persistent) p[s] = (0, _helpers.deepMerge)({}, p[s], value);else p[s] = (0, _helpers.deepMerge)(p[s], value);
                        }

      if (opts.immutable) (0, _helpers.deepFreeze)(p);

      break;
    }

    // If we reached a leaf, we override by setting an empty object
    else if (_type2['default'].primitive(p[s])) {
        p[s] = {};
      }

      // Else, we shift the reference and continue the path
      else if (opts.persistent) {
          p[s] = (0, _helpers.shallowClone)(p[s]);
        }

    // Should we freeze the current step before continuing?
    if (opts.immutable && l > 0) (0, _helpers.freeze)(p);

    p = p[s];
  }

  // If we are updating a dynamic node, we need not return the affected node
  if (_type2['default'].lazyGetter(p, s)) return { data: dummy.root };

  // Returning new data object
  return { data: dummy.root, node: p[s] };
}

module.exports = exports['default'];
},{"./helpers":3,"./type":5}],7:[function(require,module,exports){
/**
 * Baobab Watchers
 * ================
 *
 * Abstraction used to listen and retrieve data from multiple parts of a
 * Baobab tree at once.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _emmett = require('emmett');

var _emmett2 = _interopRequireDefault(_emmett);

var _cursor = require('./cursor');

var _cursor2 = _interopRequireDefault(_cursor);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _helpers = require('./helpers');

/**
 * Watcher class.
 *
 * @constructor
 * @param {Baobab} tree     - The watched tree.
 * @param {object} mapping  - A mapping of the paths to watch in the tree.
 */

var Watcher = (function (_Emitter) {
  _inherits(Watcher, _Emitter);

  function Watcher(tree, mapping) {
    var _this = this;

    _classCallCheck(this, Watcher);

    _get(Object.getPrototypeOf(Watcher.prototype), 'constructor', this).call(this);

    // Properties
    this.tree = tree;
    this.mapping = null;

    this.state = {
      killed: false
    };

    // Initializing
    this.refresh(mapping);

    // Listening
    this.handler = function (e) {
      if (_this.state.killed) return;

      var watchedPaths = _this.getWatchedPaths();

      if ((0, _helpers.solveUpdate)(e.data.paths, watchedPaths)) return _this.emit('update');
    };

    this.tree.on('update', this.handler);
  }

  /**
   * Method used to get the current watched paths.
   *
   * @return {array} - The array of watched paths.
   */

  _createClass(Watcher, [{
    key: 'getWatchedPaths',
    value: function getWatchedPaths() {
      var _this2 = this;

      var rawPaths = Object.keys(this.mapping).map(function (k) {
        var v = _this2.mapping[k];

        // Watcher mappings can accept a cursor
        if (v instanceof _cursor2['default']) return v.solvedPath;

        return _this2.mapping[k];
      });

      return rawPaths.reduce(function (cp, p) {

        // Handling path polymorphisms
        p = [].concat(p);

        // Dynamic path?
        if (_type2['default'].dynamicPath(p)) p = (0, _helpers.getIn)(_this2.tree._data, p).solvedPath;

        if (!p) return cp;

        // Facet path?
        var monkeyPath = _type2['default'].monkeyPath(_this2.tree._monkeys, p);

        if (monkeyPath) return cp.concat((0, _helpers.getIn)(_this2.tree._monkeys, monkeyPath).data.relatedPaths());

        return cp.concat([p]);
      }, []);
    }

    /**
     * Method used to return a map of the watcher's cursors.
     *
     * @return {object} - TMap of relevant cursors.
     */
  }, {
    key: 'getCursors',
    value: function getCursors() {
      var _this3 = this;

      var cursors = {};

      Object.keys(this.mapping).forEach(function (k) {
        var path = _this3.mapping[k];

        if (path instanceof _cursor2['default']) cursors[k] = path;else cursors[k] = _this3.tree.select(path);
      });

      return cursors;
    }

    /**
     * Method used to refresh the watcher's mapping.
     *
     * @param  {object}  mapping  - The new mapping to apply.
     * @return {Watcher}          - Itself for chaining purposes.
     */
  }, {
    key: 'refresh',
    value: function refresh(mapping) {

      if (!_type2['default'].watcherMapping(mapping)) throw (0, _helpers.makeError)('Baobab.watch: invalid mapping.', { mapping: mapping });

      this.mapping = mapping;

      // Creating the get method
      var projection = {};

      for (var k in mapping) {
        projection[k] = mapping[k] instanceof _cursor2['default'] ? mapping[k].path : mapping[k];
      }this.get = this.tree.project.bind(this.tree, projection);
    }

    /**
     * Methods releasing the watcher from memory.
     */
  }, {
    key: 'release',
    value: function release() {

      this.tree.off('update', this.handler);
      this.state.killed = true;
      this.kill();
    }
  }]);

  return Watcher;
})(_emmett2['default']);

exports['default'] = Watcher;
module.exports = exports['default'];
},{"./cursor":2,"./helpers":3,"./type":5,"emmett":8}],8:[function(require,module,exports){
(function() {
  'use strict';

  /**
   * Here is the list of every allowed parameter when using Emitter#on:
   * @type {Object}
   */
  var __allowedOptions = {
    once: 'boolean',
    scope: 'object'
  };

  /**
   * Incremental id used to order event handlers.
   */
  var __order = 0;

  /**
   * A simple helper to shallowly merge two objects. The second one will "win"
   * over the first one.
   *
   * @param  {object}  o1 First target object.
   * @param  {object}  o2 Second target object.
   * @return {object}     Returns the merged object.
   */
  function shallowMerge(o1, o2) {
    var o = {},
        k;

    for (k in o1) o[k] = o1[k];
    for (k in o2) o[k] = o2[k];

    return o;
  }

  /**
   * Is the given variable a plain JavaScript object?
   *
   * @param  {mixed}  v   Target.
   * @return {boolean}    The boolean result.
   */
  function isPlainObject(v) {
    return v &&
           typeof v === 'object' &&
           !Array.isArray(v) &&
           !(v instanceof Function) &&
           !(v instanceof RegExp);
  }

  /**
   * Iterate over an object that may have ES6 Symbols.
   *
   * @param  {object}   object  Object on which to iterate.
   * @param  {function} fn      Iterator function.
   * @param  {object}   [scope] Optional scope.
   */
  function forIn(object, fn, scope) {
    var symbols,
        k,
        i,
        l;

    for (k in object)
      fn.call(scope || null, k, object[k]);

    if (Object.getOwnPropertySymbols) {
      symbols = Object.getOwnPropertySymbols(object);

      for (i = 0, l = symbols.length; i < l; i++)
        fn.call(scope || null, symbols[i], object[symbols[i]]);
    }
  }

  /**
   * The emitter's constructor. It initializes the handlers-per-events store and
   * the global handlers store.
   *
   * Emitters are useful for non-DOM events communication. Read its methods
   * documentation for more information about how it works.
   *
   * @return {Emitter}         The fresh new instance.
   */
  var Emitter = function() {
    this._enabled = true;

    // Dirty trick that will set the necessary properties to the emitter
    this.unbindAll();
  };

  /**
   * This method unbinds every handlers attached to every or any events. So,
   * these functions will no more be executed when the related events are
   * emitted. If the functions were not bound to the events, nothing will
   * happen, and no error will be thrown.
   *
   * Usage:
   * ******
   * > myEmitter.unbindAll();
   *
   * @return {Emitter}      Returns this.
   */
  Emitter.prototype.unbindAll = function() {

    this._handlers = {};
    this._handlersAll = [];
    this._handlersComplex = [];

    return this;
  };


  /**
   * This method binds one or more functions to the emitter, handled to one or a
   * suite of events. So, these functions will be executed anytime one related
   * event is emitted.
   *
   * It is also possible to bind a function to any emitted event by not
   * specifying any event to bind the function to.
   *
   * Recognized options:
   * *******************
   *  - {?boolean} once   If true, the handlers will be unbound after the first
   *                      execution. Default value: false.
   *  - {?object}  scope  If a scope is given, then the listeners will be called
   *                      with this scope as "this".
   *
   * Variant 1:
   * **********
   * > myEmitter.on('myEvent', function(e) { console.log(e); });
   * > // Or:
   * > myEmitter.on('myEvent', function(e) { console.log(e); }, { once: true });
   *
   * @param  {string}   event   The event to listen to.
   * @param  {function} handler The function to bind.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.on(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * >);
   * > // Or:
   * > myEmitter.on(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * >   { once: true }}
   * >);
   *
   * @param  {array}    events  The events to listen to.
   * @param  {function} handler The function to bind.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.on({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > });
   * > // Or:
   * > myEmitter.on({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > }, { once: true });
   *
   * @param  {object}  bindings An object containing pairs event / function.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.on(function(e) { console.log(e); });
   * > // Or:
   * > myEmitter.on(function(e) { console.log(e); }, { once: true});
   *
   * @param  {function} handler The function to bind to every events.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   */
  Emitter.prototype.on = function(a, b, c) {
    var i,
        l,
        k,
        event,
        eArray,
        handlersList,
        bindingObject;

    // Variant 3
    if (isPlainObject(a)) {
      forIn(a, function(name, fn) {
        this.on(name, fn, b);
      }, this);

      return this;
    }

    // Variant 1, 2 and 4
    if (typeof a === 'function') {
      c = b;
      b = a;
      a = null;
    }

    eArray = [].concat(a);

    for (i = 0, l = eArray.length; i < l; i++) {
      event = eArray[i];

      bindingObject = {
        order: __order++,
        fn: b
      };

      // Defining the list in which the handler should be inserted
      if (typeof event === 'string' || typeof event === 'symbol') {
        if (!this._handlers[event])
          this._handlers[event] = [];
        handlersList = this._handlers[event];
        bindingObject.type = event;
      }
      else if (event instanceof RegExp) {
        handlersList = this._handlersComplex;
        bindingObject.pattern = event;
      }
      else if (event === null) {
        handlersList = this._handlersAll;
      }
      else {
        throw Error('Emitter.on: invalid event.');
      }

      // Appending needed properties
      for (k in c || {})
        if (__allowedOptions[k])
          bindingObject[k] = c[k];

      handlersList.push(bindingObject);
    }

    return this;
  };


  /**
   * This method works exactly as the previous #on, but will add an options
   * object if none is given, and set the option "once" to true.
   *
   * The polymorphism works exactly as with the #on method.
   */
  Emitter.prototype.once = function() {
    var args = Array.prototype.slice.call(arguments),
        li = args.length - 1;

    if (isPlainObject(args[li]) && args.length > 1)
      args[li] = shallowMerge(args[li], {once: true});
    else
      args.push({once: true});

    return this.on.apply(this, args);
  };


  /**
   * This method unbinds one or more functions from events of the emitter. So,
   * these functions will no more be executed when the related events are
   * emitted. If the functions were not bound to the events, nothing will
   * happen, and no error will be thrown.
   *
   * Variant 1:
   * **********
   * > myEmitter.off('myEvent', myHandler);
   *
   * @param  {string}   event   The event to unbind the handler from.
   * @param  {function} handler The function to unbind.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.off(['myEvent1', 'myEvent2'], myHandler);
   *
   * @param  {array}    events  The events to unbind the handler from.
   * @param  {function} handler The function to unbind.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.off({
   * >   myEvent1: myHandler1,
   * >   myEvent2: myHandler2
   * > });
   *
   * @param  {object} bindings An object containing pairs event / function.
   * @return {Emitter}         Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.off(myHandler);
   *
   * @param  {function} handler The function to unbind from every events.
   * @return {Emitter}          Returns this.
   *
   * Variant 5:
   * **********
   * > myEmitter.off(event);
   *
   * @param  {string} event     The event we should unbind.
   * @return {Emitter}          Returns this.
   */
  function filter(target, fn) {
    target = target || [];

    var a = [],
        l,
        i;

    for (i = 0, l = target.length; i < l; i++)
      if (target[i].fn !== fn)
        a.push(target[i]);

    return a;
  }

  Emitter.prototype.off = function(events, fn) {
    var i,
        n,
        k,
        event;

    // Variant 4:
    if (arguments.length === 1 && typeof events === 'function') {
      fn = arguments[0];

      // Handlers bound to events:
      for (k in this._handlers) {
        this._handlers[k] = filter(this._handlers[k], fn);

        if (this._handlers[k].length === 0)
          delete this._handlers[k];
      }

      // Generic Handlers
      this._handlersAll = filter(this._handlersAll, fn);

      // Complex handlers
      this._handlersComplex = filter(this._handlersComplex, fn);
    }

    // Variant 5
    else if (arguments.length === 1 &&
             (typeof events === 'string' || typeof events === 'symbol')) {
      delete this._handlers[events];
    }

    // Variant 1 and 2:
    else if (arguments.length === 2) {
      var eArray = [].concat(events);

      for (i = 0, n = eArray.length; i < n; i++) {
        event = eArray[i];

        this._handlers[event] = filter(this._handlers[event], fn);

        if ((this._handlers[event] || []).length === 0)
          delete this._handlers[event];
      }
    }

    // Variant 3
    else if (isPlainObject(events)) {
      forIn(events, this.off, this);
    }

    return this;
  };

  /**
   * This method retrieve the listeners attached to a particular event.
   *
   * @param  {?string}    Name of the event.
   * @return {array}      Array of handler functions.
   */
  Emitter.prototype.listeners = function(event) {
    var handlers = this._handlersAll || [],
        complex = false,
        h,
        i,
        l;

    if (!event)
      throw Error('Emitter.listeners: no event provided.');

    handlers = handlers.concat(this._handlers[event] || []);

    for (i = 0, l = this._handlersComplex.length; i < l; i++) {
      h = this._handlersComplex[i];

      if (~event.search(h.pattern)) {
        complex = true;
        handlers.push(h);
      }
    }

    // If we have any complex handlers, we need to sort
    if (this._handlersAll.length || complex)
      return handlers.sort(function(a, b) {
        return a.order - b.order;
      });
    else
      return handlers.slice(0);
  };

  /**
   * This method emits the specified event(s), and executes every handlers bound
   * to the event(s).
   *
   * Use cases:
   * **********
   * > myEmitter.emit('myEvent');
   * > myEmitter.emit('myEvent', myData);
   * > myEmitter.emit(['myEvent1', 'myEvent2']);
   * > myEmitter.emit(['myEvent1', 'myEvent2'], myData);
   * > myEmitter.emit({myEvent1: myData1, myEvent2: myData2});
   *
   * @param  {string|array} events The event(s) to emit.
   * @param  {object?}      data   The data.
   * @return {Emitter}             Returns this.
   */
  Emitter.prototype.emit = function(events, data) {

    // Short exit if the emitter is disabled
    if (!this._enabled)
      return this;

    // Object variant
    if (isPlainObject(events)) {
      forIn(events, this.emit, this);
      return this;
    }

    var eArray = [].concat(events),
        onces = [],
        event,
        parent,
        handlers,
        handler,
        i,
        j,
        l,
        m;

    for (i = 0, l = eArray.length; i < l; i++) {
      handlers = this.listeners(eArray[i]);

      for (j = 0, m = handlers.length; j < m; j++) {
        handler = handlers[j];
        event = {
          type: eArray[i],
          target: this
        };

        if (arguments.length > 1)
          event.data = data;

        handler.fn.call('scope' in handler ? handler.scope : this, event);

        if (handler.once)
          onces.push(handler);
      }

      // Cleaning onces
      for (j = onces.length - 1; j >= 0; j--) {
        parent = onces[j].type ?
          this._handlers[onces[j].type] :
          onces[j].pattern ?
            this._handlersComplex :
            this._handlersAll;

        parent.splice(parent.indexOf(onces[j]), 1);
      }
    }

    return this;
  };


  /**
   * This method will unbind all listeners and make it impossible to ever
   * rebind any listener to any event.
   */
  Emitter.prototype.kill = function() {

    this.unbindAll();
    this._handlers = null;
    this._handlersAll = null;
    this._handlersComplex = null;
    this._enabled = false;

    // Nooping methods
    this.unbindAll =
    this.on =
    this.once =
    this.off =
    this.emit =
    this.listeners = Function.prototype;
  };


  /**
   * This method disabled the emitter, which means its emit method will do
   * nothing.
   *
   * @return {Emitter} Returns this.
   */
  Emitter.prototype.disable = function() {
    this._enabled = false;

    return this;
  };


  /**
   * This method enables the emitter.
   *
   * @return {Emitter} Returns this.
   */
  Emitter.prototype.enable = function() {
    this._enabled = true;

    return this;
  };


  /**
   * Version:
   */
  Emitter.version = '3.1.1';


  // Export:
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = Emitter;
    exports.Emitter = Emitter;
  } else if (typeof define === 'function' && define.amd)
    define('emmett', [], function() {
      return Emitter;
    });
  else
    this.Emitter = Emitter;
}).call(this);

},{}],9:[function(require,module,exports){
var Baobab, CoffeeTable, Interactive, d3, error, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ref = require("./deps"), Baobab = ref.Baobab, d3 = ref.d3;

Interactive = require('./interactive');


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
    var ref1;
    if ((ref1 = typeof url_or_record_array) === 'string') {
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

})(Interactive);

try {
  window.CoffeeTable = CoffeeTable;
} catch (error) {
  console.log("whatever");
}

module.exports = {
  CoffeeTable: CoffeeTable,
  d3: d3,
  Baobab: Baobab
};


},{"./deps":10,"./interactive":12}],10:[function(require,module,exports){
var Baobab, d3;

Baobab = (function() {
  var error, error1;
  try {
    return require('baobab');
  } catch (error) {
    try {
      return require('Baobab');
    } catch (error1) {
      return window.Baobab;
    }
  }
})();

d3 = (function() {
  var error;
  try {
    return require('d3');
  } catch (error) {
    return window.d3;
  }
})();

module.exports = {
  Baobab: Baobab,
  d3: d3
};


},{"Baobab":1,"baobab":"baobab","d3":"d3"}],11:[function(require,module,exports){
var DerivedDataSource, Expression, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

d3 = require('../deps').d3;

DerivedDataSource = require('../tree/derived_data_source');

Expression = (function(superClass) {
  extend(Expression, superClass);

  function Expression() {
    return Expression.__super__.constructor.apply(this, arguments);
  }

  Expression.prototype.transform = function(transformers) {
    d3.entries(transformers).forEach((function(_this) {
      return function(arg1) {
        var cursors, fn, i, key, ref, ref1, smart_cursor, value;
        key = arg1.key, value = arg1.value;
        ref = value != null ? value : [], cursors = 2 <= ref.length ? slice.call(ref, 0, i = ref.length - 1) : (i = 0, []), fn = ref[i++];
        if (cursors.length === 0) {
          cursors = null;
        }
        smart_cursor = (ref1 = cursors != null ? cursors.map(function(col) {
          var ref2;
          if ((ref2 = typeof col) === 'string') {
            return ['column_source', col, 'values'];
          } else {
            return col;
          }
        }) : void 0) != null ? ref1 : [];
        return _this._add_derived_column(key, smart_cursor, fn);
      };
    })(this));
    this.expression.push(['transform', transformers]);
    return this;
  };

  Expression.prototype.concat = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    Expression.__super__.concat.apply(this, args);
    return this.expression.push(['concat'].concat(slice.call(args)));
  };


  /*
  Project selects a subset of columns
  @example Selection the index, x, and y
    table.projection 'index','x','y'
   */

  Expression.prototype.projection = function() {
    var columns, ref;
    columns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.values.set(this.col.apply(this, columns));
    (ref = this.columns).set.apply(ref, columns);
    this.expression.push(['projection'].concat(slice.call(columns)));
    return this;
  };


  /*
  Filter elements columns based on a predicate function.
  @param [String] columns a list of columns to include in the predicate function
  @param [Function] fn a predicate function with access to each of the columns.
  
  @example Filter columns ``x`` and ``y``
    table.filter 'x','y', (x,y)-> x > 0 and y < 5
   */

  Expression.prototype.filter = function() {
    var columns, fn, i, new_values, values;
    columns = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), fn = arguments[i++];
    values = this.col.apply(this, columns);
    new_values = values.filter(fn);
    this.index.set(new_values.map((function(_this) {
      return function(v) {
        return values.indexOf(v);
      };
    })(this)));
    this.values.set(values);
    this.expression.push(['filter'].concat(slice.call(columns), [fn.toString()]));
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

  Expression.prototype.concat = function(value_object) {
    Expression.__super__.concat.call(this, value_object);
    this.expression.push(['concat', value_object]);
    return this;
  };


  /*
  Apply a function to a column
  @example Apply a function to x depending on y
    table.apply 'x', ['x','y'], (x,y)-> d3.zip(x,y).map (v)-> d3.mean v
   */

  Expression.prototype.apply = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    Expression.__super__.apply.apply(this, args);
    return this.expression.push([
      'apply', args.map(function(arg) {
        return JSON.parse(JSON.stringify(arg));
      })
    ]);
  };

  return Expression;

})(DerivedDataSource);

module.exports = Expression;


},{"../deps":10,"../tree/derived_data_source":19}],12:[function(require,module,exports){
var CoffeeTable, Tree, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

d3 = require('./deps').d3;

CoffeeTable = require('./coffeetable');

Tree = require('./tree');


/*
An Interactive Table uses immutable cursor trees to track the evolution history at a table state.
  It is similar to a DataFrame because it's rows and columns can be accessed independently.  The
state of the table can be used to publish data-driven content to a webpage.  Most
data that is generated from an API endpoint can be represented as a table; more
complex scenarios can be decoupled to independent tables.  Decoupled tables can manipulated
independently and joined with other tables.
 */

CoffeeTable.Interactive = (function(superClass) {
  extend(Interactive, superClass);

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
    Interactive.__super__.constructor.call(this, record_orient_data);
    this.compute();
  }

  return Interactive;

})(Tree);

module.exports = CoffeeTable.Interactive;


},{"./coffeetable":9,"./deps":10,"./tree":22}],13:[function(require,module,exports){
var Table, d3,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

d3 = require('../deps').d3;

Table = require('./index');

Table.ColumnDataSource = (function(superClass) {
  extend(ColumnDataSource, superClass);

  function ColumnDataSource(values, columns) {
    var tmp;
    this.new_major_cursor('column_source', {}, 'field');
    ColumnDataSource.__super__.constructor.call(this, values, columns);
    tmp = {};
    this.raw.get().forEach((function(_this) {
      return function(c) {
        return _this._add_derived_column(c);
      };
    })(this));
  }


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
          _this.raw.push(key);
          _this.values.set(_this.values.get().map(function(row, i) {
            return slice.call(row).concat([value[i]]);
          }));
          return _this._add_derived_column(key);
        };
      })(this));
    }
    return ColumnDataSource.__super__.concat.call(this, values, columns);
  };

  ColumnDataSource.prototype.col = function() {
    var columns;
    columns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (columns.length === 0) {
      columns = this.columns.get();
    }
    return d3.zip.apply(d3, columns.map((function(_this) {
      return function(c) {
        return _this.field.get(c, 'values');
      };
    })(this)));
  };

  return ColumnDataSource;

})(require('./data'));

module.exports = Table.ColumnDataSource;


},{"../deps":10,"./data":15,"./index":16}],14:[function(require,module,exports){
var Table,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Table = require('./index');

Table.Column = (function(superClass) {
  extend(Column, superClass);

  function Column() {
    return Column.__super__.constructor.apply(this, arguments);
  }

  return Column;

})(require('../tree/expression'));

module.exports = Table.Column;


},{"../tree/expression":20,"./index":16}],15:[function(require,module,exports){
var Table,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Table = require('./index');

Table.DataSource = (function(superClass) {
  extend(DataSource, superClass);

  function DataSource() {
    return DataSource.__super__.constructor.apply(this, arguments);
  }

  DataSource.prototype.concat = function(values, columns) {
    var ref;
    if (values != null) {
      values.forEach((function(_this) {
        return function(row) {
          return _this.values.push(row);
        };
      })(this));
    }
    DataSource.__super__.concat.call(this, (ref = values != null ? values.length : void 0) != null ? ref : 0);
    return this;
  };

  return DataSource;

})(require('./rows'));

module.exports = Table.DataSource;


},{"./index":16,"./rows":17}],16:[function(require,module,exports){
var Expressions, Interactive,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Interactive = require('./index');

Expressions = require('../expressions');

Interactive.Table = (function(superClass) {
  extend(Table, superClass);

  function Table(arg) {
    var columns, values;
    values = arg.values, columns = arg.columns;
    this.new_major_cursor('name', typeof name !== "undefined" && name !== null ? name : "Some name");
    Table.__super__.constructor.call(this, values, columns);
    this.compute();
  }

  return Table;

})(Expressions);


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


},{"../expressions":11,"./index":16}],17:[function(require,module,exports){
var Table,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Table = require('./index');

Table.Row = (function(superClass) {
  extend(Row, superClass);

  function Row(values, columns) {
    var k, ref, results;
    this.new_major_cursor('index', (function() {
      results = [];
      for (var k = 0, ref = values.length - 1; 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this));
    this.index.startRecording(1);
    this.length = function() {
      return this.values.get().length;
    };
    Row.__super__.constructor.call(this, columns);
    this._add_derived_column('index', [['index']], function(index) {
      return index;
    });
  }


  /*
  Update the index when a row is concatenated.
   */

  Row.prototype.concat = function(length) {
    var i, k, max, ref, results;
    i = this.field.get('index', 'values');
    max = Math.max.apply(Math, i) + 1;
    return (function() {
      results = [];
      for (var k = 0, ref = length - 1; 0 <= ref ? k <= ref : k >= ref; 0 <= ref ? k++ : k--){ results.push(k); }
      return results;
    }).apply(this).map((function(_this) {
      return function(j) {
        return _this.index.push(max + j);
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
    index = this.index.get();
    values = this.values.get();
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
    index = this.index.get();
    values = this.values.get();
    if (selection != null) {
      values = selection.map((function(_this) {
        return function(i) {
          return values[index.indexOf(i)];
        };
      })(this));
    }
    return values;
  };

  return Row;

})(require('./columns'));

module.exports = Table.Row;


},{"./columns":14,"./index":16}],18:[function(require,module,exports){
var Tree;

Tree = require('./index');

Tree.Compute = (function() {
  function Compute() {}

  Compute.prototype.compute = function() {

    /* Compute changes the state of the data tree */
    this.checkpoint.deepMerge({
      name: this.name.get(),
      index: this.col('index'),
      readme: this.readme.get(),
      values: this.col(),
      metadata: this.metadata.get(),
      columns: [this.columns.get(), this.columns.get()]
    });

    /* TODO Remove old columns */
    return this;
  };

  Compute.prototype.rewind = function() {
    this.cursor.deepMerge({
      index: this.checkpoint.get('index'),
      columns: this.checkpoint.get('columns'),
      values: this.checkpoint.get('values'),
      metadata: this.checkpoint.get('metadata')
    });
    this.raw.set(this.checkpoint.get('columns'));
    return this;
  };

  return Compute;

})();

module.exports = Tree.Compute;


},{"./index":22}],19:[function(require,module,exports){
var Baobab, Tree,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Baobab = require('../deps').Baobab;

Tree = require('.');

Tree.DerivedDataSource = (function(superClass) {
  extend(DerivedDataSource, superClass);

  function DerivedDataSource(values, columns) {

    /*
    Transform adds named columns to the table
    @param [Object] transformers is an object of named columns.  The new columns
    are defined by ``cursors`` and a function ``fn``.
    @example Create two new columns mean and std.
      table.transform
        mean: ['x','y', (x,y)-> (x+y)/2 ]
        std: ['x','y', (x,y)-> (x+y)/2 ]
    
    dont states are weird
     */
    DerivedDataSource.__super__.constructor.call(this, values, columns);
  }


  /*
  Create a new interactive cursor that defines a new Column Data Source
   */

  DerivedDataSource.prototype._add_derived_column = function(name, cursors, fn) {
    if (cursors == null) {
      cursors = [];
    }
    if (fn == null) {
      fn = null;
    }
    if (cursors.length === 0) {
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
    this.field.set(name, {
      name: name,
      values: Baobab.monkey.apply(Baobab, slice.call(cursors).concat([fn]))
    });

    /* Always push derived columns to second part of columns */
    if (indexOf.call(['index'].concat(slice.call(this.columns.get())), name) < 0) {
      return this.columns.push(name);
    }
  };

  return DerivedDataSource;

})(require('../table/column_data_source'));

module.exports = Tree.DerivedDataSource;


},{".":22,"../deps":10,"../table/column_data_source":13}],20:[function(require,module,exports){
var Tree,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Tree = require('./index');

Tree.Expression = (function(superClass) {
  extend(Expression, superClass);

  function Expression() {
    this.new_major_cursor('expression');
    this.expression.set([]);
    this.expression.startRecording(20);
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

})(require('./history'));

module.exports = Tree.Expression;


},{"./history":21,"./index":22}],21:[function(require,module,exports){
var Tree,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Tree = require('./index');

Tree.History = (function(superClass) {
  extend(History, superClass);

  function History() {
    this.new_major_cursor('checkpoint', {});
    History.__super__.constructor.call(this);
  }

  History.prototype.history = function() {
    return this.expression.getHistory();
  };

  History.prototype.clear_history = function() {
    return this.expression.clearHistory();
  };

  History.prototype.record = function(expression) {
    return this.expression.push(expression);
  };

  return History;

})(require('./compute'));

module.exports = Tree.History;


},{"./compute":18,"./index":22}],22:[function(require,module,exports){

/*
The Tree is the interactive data source for the table.  It is responsible for
* Storing the static state of the table values.
* Creating Column Data sources
* Creating Derived Data sources
* Storying the history of expressions.

> All content on the leaves of the tree should be JSONifiable.  No Javascript objects.
Baobab monkeys must return jsonifiable values.
 */
var Baobab, Tree, d3, ref,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ref = require('../deps'), d3 = ref.d3, Baobab = ref.Baobab;

Tree = (function(superClass) {
  extend(Tree, superClass);

  function Tree(structured_data) {
    var ref1, ref2, ref3, ref4, ref5;
    this.tree = new Baobab(structured_data);
    this.cursor = this.tree.select(0);
    this.events = {};
    this.new_major_cursor('init', structured_data);
    this.new_major_cursor('readme', (ref1 = structured_data.readme) != null ? ref1 : "");
    this.cursor.set('columns', [(ref2 = structured_data.columns) != null ? ref2 : [], []]);
    this.new_major_cursor(['columns', 0], null, 'raw');
    this.new_major_cursor(['columns', 1], null, 'columns');
    this.new_major_cursor('values', (ref3 = structured_data.values) != null ? ref3 : []);
    this.new_major_cursor('metadata', (ref4 = structured_data.metadata) != null ? ref4 : {});
    this.new_major_cursor('name', (ref5 = structured_data.name) != null ? ref5 : '');
    Tree.__super__.constructor.call(this, this.cursor.project({
      values: ['values'],
      columns: ['columns', 0]
    }));
    this.tree.on('write', function(event) {
      var new_index, old_index, ref6, values;
      switch (false) {
        case !(indexOf.call(event.data.path, 'index') >= 0 && event.data.path.length === 1):
          values = this.get('values');
          new_index = this.get('index');
          old_index = (ref6 = this.select('index').getHistory(1)[0]) != null ? ref6 : d3.range(new_index.length);
          return this.set('values', new_index.map((function(_this) {
            return function(i) {
              return values[old_index.indexOf(i)];
            };
          })(this)));
      }
    });
  }


  /* A major cursor is reflected in the table API */

  Tree.prototype.new_major_cursor = function(name, set_value, alias) {
    this[alias != null ? alias : name] = this.cursor.select(name);
    if (set_value != null) {
      return this[alias != null ? alias : name].set(set_value);
    }
  };

  return Tree;

})(require('../table'));

module.exports = Tree;


},{"../deps":10,"../table":16}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvQmFvYmFiL2Rpc3QvYmFvYmFiLmpzIiwibm9kZV9tb2R1bGVzL0Jhb2JhYi9kaXN0L2N1cnNvci5qcyIsIm5vZGVfbW9kdWxlcy9CYW9iYWIvZGlzdC9oZWxwZXJzLmpzIiwibm9kZV9tb2R1bGVzL0Jhb2JhYi9kaXN0L21vbmtleS5qcyIsIm5vZGVfbW9kdWxlcy9CYW9iYWIvZGlzdC90eXBlLmpzIiwibm9kZV9tb2R1bGVzL0Jhb2JhYi9kaXN0L3VwZGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9CYW9iYWIvZGlzdC93YXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL0Jhb2JhYi9ub2RlX21vZHVsZXMvZW1tZXR0L2VtbWV0dC5qcyIsInNyYy9jb2ZmZWV0YWJsZS5jb2ZmZWUiLCJzcmMvZGVwcy5jb2ZmZWUiLCJzcmMvZXhwcmVzc2lvbnMvaW5kZXguY29mZmVlIiwic3JjL2ludGVyYWN0aXZlLmNvZmZlZSIsInNyYy90YWJsZS9jb2x1bW5fZGF0YV9zb3VyY2UuY29mZmVlIiwic3JjL3RhYmxlL2NvbHVtbnMuY29mZmVlIiwic3JjL3RhYmxlL2RhdGEuY29mZmVlIiwic3JjL3RhYmxlL2luZGV4LmNvZmZlZSIsInNyYy90YWJsZS9yb3dzLmNvZmZlZSIsInNyYy90cmVlL2NvbXB1dGUuY29mZmVlIiwic3JjL3RyZWUvZGVyaXZlZF9kYXRhX3NvdXJjZS5jb2ZmZWUiLCJzcmMvdHJlZS9leHByZXNzaW9uLmNvZmZlZSIsInNyYy90cmVlL2hpc3RvcnkuY29mZmVlIiwic3JjL3RyZWUvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNubEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsMEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2psQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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SUFJQSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxPQUFULEVBQWtCLFNBQUMsS0FBRDtBQUNoQixVQUFBO0FBQUEsY0FBQSxLQUFBO0FBQUEsZUFDTyxhQUFXLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBdEIsRUFBQSxPQUFBLE1BQUEsSUFBK0IsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBaEIsS0FBMEIsRUFEaEU7VUFFSSxNQUFBLEdBQVMsSUFBQyxDQUFBLEdBQUQsQ0FBSyxRQUFMO1VBQ1QsU0FBQSxHQUFZLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTDtVQUNaLFNBQUEsbUVBQWdELEVBQUUsQ0FBQyxLQUFILENBQVMsU0FBUyxDQUFDLE1BQW5CO2lCQUNoRCxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsRUFBZSxTQUFTLENBQUMsR0FBVixDQUFjLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDtxQkFBTSxNQUFPLENBQUEsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsQ0FBbEIsQ0FBQTtZQUFiO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLENBQWY7QUFMSjtJQURnQixDQUFsQjtFQWpCVzs7O0FBeUJiOztpQkFDQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsRUFBTyxTQUFQLEVBQWtCLEtBQWxCO0lBQ2hCLElBQUUsaUJBQUEsUUFBUSxJQUFSLENBQUYsR0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsSUFBZjtJQUNsQixJQUFHLGlCQUFIO2FBQW1CLElBQUUsaUJBQUEsUUFBUSxJQUFSLENBQWEsQ0FBQyxHQUFoQixDQUFvQixTQUFwQixFQUFuQjs7RUFGZ0I7Ozs7R0EzQkQsT0FBQSxDQUFRLFVBQVI7O0FBK0JuQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEJhb2JhYiBEYXRhIFN0cnVjdHVyZVxuICogPT09PT09PT09PT09PT09PT09PT09PVxuICpcbiAqIEEgaGFuZHkgZGF0YSB0cmVlIHdpdGggY3Vyc29ycy5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gzLCBfeDQsIF94NSkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDMsIHByb3BlcnR5ID0gX3g0LCByZWNlaXZlciA9IF94NTsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDMgPSBwYXJlbnQ7IF94NCA9IHByb3BlcnR5OyBfeDUgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX2VtbWV0dCA9IHJlcXVpcmUoJ2VtbWV0dCcpO1xuXG52YXIgX2VtbWV0dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9lbW1ldHQpO1xuXG52YXIgX2N1cnNvciA9IHJlcXVpcmUoJy4vY3Vyc29yJyk7XG5cbnZhciBfY3Vyc29yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2N1cnNvcik7XG5cbnZhciBfbW9ua2V5ID0gcmVxdWlyZSgnLi9tb25rZXknKTtcblxudmFyIF93YXRjaGVyID0gcmVxdWlyZSgnLi93YXRjaGVyJyk7XG5cbnZhciBfd2F0Y2hlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXRjaGVyKTtcblxudmFyIF90eXBlID0gcmVxdWlyZSgnLi90eXBlJyk7XG5cbnZhciBfdHlwZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlKTtcblxudmFyIF91cGRhdGUyID0gcmVxdWlyZSgnLi91cGRhdGUnKTtcblxudmFyIF91cGRhdGUzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXBkYXRlMik7XG5cbnZhciBfaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG52YXIgaGVscGVycyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9oZWxwZXJzKTtcblxudmFyIGFycmF5RnJvbSA9IGhlbHBlcnMuYXJyYXlGcm9tO1xudmFyIGNvZXJjZVBhdGggPSBoZWxwZXJzLmNvZXJjZVBhdGg7XG52YXIgZGVlcEZyZWV6ZSA9IGhlbHBlcnMuZGVlcEZyZWV6ZTtcbnZhciBnZXRJbiA9IGhlbHBlcnMuZ2V0SW47XG52YXIgbWFrZUVycm9yID0gaGVscGVycy5tYWtlRXJyb3I7XG52YXIgZGVlcE1lcmdlID0gaGVscGVycy5kZWVwTWVyZ2U7XG52YXIgc2hhbGxvd0Nsb25lID0gaGVscGVycy5zaGFsbG93Q2xvbmU7XG52YXIgc2hhbGxvd01lcmdlID0gaGVscGVycy5zaGFsbG93TWVyZ2U7XG52YXIgdW5pcWlkID0gaGVscGVycy51bmlxaWQ7XG5cbi8qKlxuICogQmFvYmFiIGRlZmF1bHRzXG4gKi9cbnZhciBERUZBVUxUUyA9IHtcblxuICAvLyBTaG91bGQgdGhlIHRyZWUgaGFuZGxlIGl0cyB0cmFuc2FjdGlvbnMgb24gaXRzIG93bj9cbiAgYXV0b0NvbW1pdDogdHJ1ZSxcblxuICAvLyBTaG91bGQgdGhlIHRyYW5zYWN0aW9ucyBiZSBoYW5kbGVkIGFzeW5jaHJvbm91c2x5P1xuICBhc3luY2hyb25vdXM6IHRydWUsXG5cbiAgLy8gU2hvdWxkIHRoZSB0cmVlJ3MgZGF0YSBiZSBpbW11dGFibGU/XG4gIGltbXV0YWJsZTogdHJ1ZSxcblxuICAvLyBTaG91bGQgdGhlIG1vbmtleXMgYmUgbGF6eT9cbiAgbGF6eU1vbmtleXM6IHRydWUsXG5cbiAgLy8gU2hvdWxkIHRoZSB0cmVlIGJlIHBlcnNpc3RlbnQ/XG4gIHBlcnNpc3RlbnQ6IHRydWUsXG5cbiAgLy8gU2hvdWxkIHRoZSB0cmVlJ3MgdXBkYXRlIGJlIHB1cmU/XG4gIHB1cmU6IHRydWUsXG5cbiAgLy8gVmFsaWRhdGlvbiBzcGVjaWZpY2F0aW9uc1xuICB2YWxpZGF0ZTogbnVsbCxcblxuICAvLyBWYWxpZGF0aW9uIGJlaGF2aW9yICdyb2xsYmFjaycgb3IgJ25vdGlmeSdcbiAgdmFsaWRhdGlvbkJlaGF2aW9yOiAncm9sbGJhY2snXG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHJldHVybmluZyBhIHN0cmluZyBoYXNoIGZyb20gYSBub24tZHluYW1pYyBwYXRoIGV4cHJlc3NlZCBhcyBhblxuICogYXJyYXkuXG4gKlxuICogQHBhcmFtICB7YXJyYXl9ICBwYXRoIC0gVGhlIHBhdGggdG8gaGFzaC5cbiAqIEByZXR1cm4ge3N0cmluZ30gc3RyaW5nIC0gVGhlIHJlc3VsdGFudCBoYXNoLlxuICovXG5mdW5jdGlvbiBoYXNoUGF0aChwYXRoKSB7XG4gIHJldHVybiAnzrsnICsgcGF0aC5tYXAoZnVuY3Rpb24gKHN0ZXApIHtcbiAgICBpZiAoX3R5cGUyWydkZWZhdWx0J11bJ2Z1bmN0aW9uJ10oc3RlcCkgfHwgX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KHN0ZXApKSByZXR1cm4gJyMnICsgdW5pcWlkKCkgKyAnIyc7XG5cbiAgICByZXR1cm4gc3RlcDtcbiAgfSkuam9pbignzrsnKTtcbn1cblxuLyoqXG4gKiBCYW9iYWIgY2xhc3NcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fGFycmF5fSBbaW5pdGlhbERhdGE9e31dICAgIC0gSW5pdGlhbCBkYXRhIHBhc3NlZCB0byB0aGUgdHJlZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICBbb3B0c10gICAgICAgICAgICAgIC0gT3B0aW9uYWwgb3B0aW9ucy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICBbb3B0cy5hdXRvQ29tbWl0XSAgIC0gU2hvdWxkIHRoZSB0cmVlIGF1dG8tY29tbWl0P1xuICogQHBhcmFtIHtib29sZWFufSAgICAgIFtvcHRzLmFzeW5jaHJvbm91c10gLSBTaG91bGQgdGhlIHRyZWUncyB0cmFuc2FjdGlvbnNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCBhc3luY2hyb25vdXNseT9cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICBbb3B0cy5pbW11dGFibGVdICAgIC0gU2hvdWxkIHRoZSB0cmVlIGJlIGltbXV0YWJsZT9cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICBbb3B0cy5wZXJzaXN0ZW50XSAgIC0gU2hvdWxkIHRoZSB0cmVlIGJlIHBlcnNpc3RlbnQ/XG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgW29wdHMucHVyZV0gICAgICAgICAtIFNob3VsZCB0aGUgdHJlZSBiZSBwdXJlP1xuICogQHBhcmFtIHtmdW5jdGlvbn0gICAgIFtvcHRzLnZhbGlkYXRlXSAgICAgLSBWYWxpZGF0aW9uIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgIFtvcHRzLnZhbGlkYXRpb25CZWhhdmlvdXJdIC0gXCJyb2xsYmFja1wiIG9yIFwibm90aWZ5XCIuXG4gKi9cblxudmFyIEJhb2JhYiA9IChmdW5jdGlvbiAoX0VtaXR0ZXIpIHtcbiAgX2luaGVyaXRzKEJhb2JhYiwgX0VtaXR0ZXIpO1xuXG4gIGZ1bmN0aW9uIEJhb2JhYihpbml0aWFsRGF0YSwgb3B0cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQmFvYmFiKTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEJhb2JhYi5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgLy8gU2V0dGluZyBpbml0aWFsRGF0YSB0byBhbiBlbXB0eSBvYmplY3QgaWYgbm8gZGF0YSBpcyBwcm92aWRlZCBieSB1c2VcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIGluaXRpYWxEYXRhID0ge307XG5cbiAgICAvLyBDaGVja2luZyB3aGV0aGVyIGdpdmVuIGluaXRpYWwgZGF0YSBpcyB2YWxpZFxuICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KGluaXRpYWxEYXRhKSAmJiAhX3R5cGUyWydkZWZhdWx0J10uYXJyYXkoaW5pdGlhbERhdGEpKSB0aHJvdyBtYWtlRXJyb3IoJ0Jhb2JhYjogaW52YWxpZCBkYXRhLicsIHsgZGF0YTogaW5pdGlhbERhdGEgfSk7XG5cbiAgICAvLyBNZXJnaW5nIGdpdmVuIG9wdGlvbnMgd2l0aCBkZWZhdWx0c1xuICAgIHRoaXMub3B0aW9ucyA9IHNoYWxsb3dNZXJnZSh7fSwgREVGQVVMVFMsIG9wdHMpO1xuXG4gICAgLy8gRGlzYWJsaW5nIGltbXV0YWJpbGl0eSAmIHBlcnNpc3RlbmNlIGlmIHBlcnNpc3RlbmNlIGlmIGRpc2FibGVkXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucGVyc2lzdGVudCkge1xuICAgICAgdGhpcy5vcHRpb25zLmltbXV0YWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5vcHRpb25zLnB1cmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBQcml2YXRlc1xuICAgIHRoaXMuX2lkZW50aXR5ID0gJ1tvYmplY3QgQmFvYmFiXSc7XG4gICAgdGhpcy5fY3Vyc29ycyA9IHt9O1xuICAgIHRoaXMuX2Z1dHVyZSA9IG51bGw7XG4gICAgdGhpcy5fdHJhbnNhY3Rpb24gPSBbXTtcbiAgICB0aGlzLl9hZmZlY3RlZFBhdGhzSW5kZXggPSB7fTtcbiAgICB0aGlzLl9tb25rZXlzID0ge307XG4gICAgdGhpcy5fcHJldmlvdXNEYXRhID0gbnVsbDtcbiAgICB0aGlzLl9kYXRhID0gaW5pdGlhbERhdGE7XG5cbiAgICAvLyBQcm9wZXJ0aWVzXG4gICAgdGhpcy5yb290ID0gbmV3IF9jdXJzb3IyWydkZWZhdWx0J10odGhpcywgW10sICfOuycpO1xuICAgIGRlbGV0ZSB0aGlzLnJvb3QucmVsZWFzZTtcblxuICAgIC8vIERvZXMgdGhlIHVzZXIgd2FudCBhbiBpbW11dGFibGUgdHJlZT9cbiAgICBpZiAodGhpcy5vcHRpb25zLmltbXV0YWJsZSkgZGVlcEZyZWV6ZSh0aGlzLl9kYXRhKTtcblxuICAgIC8vIEJvb3RzdHJhcHBpbmcgcm9vdCBjdXJzb3IncyBnZXR0ZXJzIGFuZCBzZXR0ZXJzXG4gICAgdmFyIGJvb3RzdHJhcCA9IGZ1bmN0aW9uIGJvb3RzdHJhcChuYW1lKSB7XG4gICAgICBfdGhpc1tuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHIgPSB0aGlzLnJvb3RbbmFtZV0uYXBwbHkodGhpcy5yb290LCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gciBpbnN0YW5jZW9mIF9jdXJzb3IyWydkZWZhdWx0J10gPyB0aGlzIDogcjtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIFsnYXBwbHknLCAnY29uY2F0JywgJ2RlZXBNZXJnZScsICdleGlzdHMnLCAnZ2V0JywgJ3B1c2gnLCAnbWVyZ2UnLCAncHJvamVjdCcsICdzZXJpYWxpemUnLCAnc2V0JywgJ3NwbGljZScsICd1bnNldCcsICd1bnNoaWZ0J10uZm9yRWFjaChib290c3RyYXApO1xuXG4gICAgLy8gUmVnaXN0ZXJpbmcgdGhlIGluaXRpYWwgbW9ua2V5c1xuICAgIHRoaXMuX3JlZnJlc2hNb25rZXlzKCk7XG5cbiAgICAvLyBJbml0aWFsIHZhbGlkYXRpb25cbiAgICB2YXIgdmFsaWRhdGlvbkVycm9yID0gdGhpcy52YWxpZGF0ZSgpO1xuXG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcikgdGhyb3cgRXJyb3IoJ0Jhb2JhYjogaW52YWxpZCBkYXRhLicsIHsgZXJyb3I6IHZhbGlkYXRpb25FcnJvciB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGluZyBzdGF0aWNzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBtZXRob2QgdXNlZCB0byByZWZyZXNoIHRoZSB0cmVlJ3MgbW9ua2V5IHJlZ2lzdGVyIG9uIGV2ZXJ5XG4gICAqIHVwZGF0ZS5cbiAgICogTm90ZSAxKSBGb3IgdGhlIHRpbWUgYmVpbmcsIHBsYWNpbmcgbW9ua2V5cyBiZW5lYXRoIGFycmF5IG5vZGVzIGlzIG5vdFxuICAgKiBhbGxvd2VkIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxuICAgKlxuICAgKiBAcGFyYW0gIHttaXhlZH0gICBub2RlICAgICAgLSBUaGUgc3RhcnRpbmcgbm9kZS5cbiAgICogQHBhcmFtICB7YXJyYXl9ICAgcGF0aCAgICAgIC0gVGhlIHN0YXJ0aW5nIG5vZGUncyBwYXRoLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICBvcGVyYXRpb24gLSBUaGUgb3BlcmF0aW9uIHRoYXQgbGVhZCB0byBhIHJlZnJlc2htZW50LlxuICAgKiBAcmV0dXJuIHtCYW9iYWJ9ICAgICAgICAgICAgLSBUaGUgdHJlZSBpbnN0YW5jZSBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhCYW9iYWIsIFt7XG4gICAga2V5OiAnX3JlZnJlc2hNb25rZXlzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3JlZnJlc2hNb25rZXlzKG5vZGUsIHBhdGgsIG9wZXJhdGlvbikge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIHZhciBjbGVhbiA9IGZ1bmN0aW9uIGNsZWFuKGRhdGEpIHtcbiAgICAgICAgdmFyIHAgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIF9tb25rZXkuTW9ua2V5KSB7XG4gICAgICAgICAgZGF0YS5yZWxlYXNlKCk7XG4gICAgICAgICAgKDAsIF91cGRhdGUzWydkZWZhdWx0J10pKF90aGlzMi5fbW9ua2V5cywgcCwgeyB0eXBlOiAndW5zZXQnIH0sIHtcbiAgICAgICAgICAgIGltbXV0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBwZXJzaXN0ZW50OiBmYWxzZSxcbiAgICAgICAgICAgIHB1cmU6IGZhbHNlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KGRhdGEpKSB7XG4gICAgICAgICAgZm9yICh2YXIgayBpbiBkYXRhKSB7XG4gICAgICAgICAgICBjbGVhbihkYXRhW2tdLCBwLmNvbmNhdChrKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB2YXIgcmVnaXN0ZXIgPSBbXTtcblxuICAgICAgdmFyIHdhbGsgPSBmdW5jdGlvbiB3YWxrKGRhdGEpIHtcbiAgICAgICAgdmFyIHAgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAvLyBTaG91bGQgd2Ugc2l0IGEgbW9ua2V5IGluIHRoZSB0cmVlP1xuICAgICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIF9tb25rZXkuTW9ua2V5RGVmaW5pdGlvbiB8fCBkYXRhIGluc3RhbmNlb2YgX21vbmtleS5Nb25rZXkpIHtcbiAgICAgICAgICB2YXIgbW9ua2V5ID0gbmV3IF9tb25rZXkuTW9ua2V5KF90aGlzMiwgcCwgZGF0YSBpbnN0YW5jZW9mIF9tb25rZXkuTW9ua2V5ID8gZGF0YS5kZWZpbml0aW9uIDogZGF0YSk7XG5cbiAgICAgICAgICByZWdpc3Rlci5wdXNoKG1vbmtleSk7XG5cbiAgICAgICAgICAoMCwgX3VwZGF0ZTNbJ2RlZmF1bHQnXSkoX3RoaXMyLl9tb25rZXlzLCBwLCB7IHR5cGU6ICdzZXQnLCB2YWx1ZTogbW9ua2V5IH0sIHtcbiAgICAgICAgICAgIGltbXV0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBwZXJzaXN0ZW50OiBmYWxzZSxcbiAgICAgICAgICAgIHB1cmU6IGZhbHNlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPYmplY3QgaXRlcmF0aW9uXG4gICAgICAgIGlmIChfdHlwZTJbJ2RlZmF1bHQnXS5vYmplY3QoZGF0YSkpIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGRhdGEpIHtcbiAgICAgICAgICAgIHdhbGsoZGF0YVtrXSwgcC5jb25jYXQoaykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gV2Fsa2luZyB0aGUgd2hvbGUgdHJlZVxuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHdhbGsodGhpcy5fZGF0YSk7XG4gICAgICAgIHJlZ2lzdGVyLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICByZXR1cm4gbS5jaGVja1JlY3Vyc2l2aXR5KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1vbmtleXNOb2RlID0gZ2V0SW4odGhpcy5fbW9ua2V5cywgcGF0aCkuZGF0YTtcblxuICAgICAgICAvLyBJcyB0aGlzIHJlcXVpcmVkIHRoYXQgd2UgY2xlYW4gc29tZSBhbHJlYWR5IGV4aXN0aW5nIG1vbmtleXM/XG4gICAgICAgIGlmIChtb25rZXlzTm9kZSkgY2xlYW4obW9ua2V5c05vZGUsIHBhdGgpO1xuXG4gICAgICAgIC8vIExldCdzIHdhbGsgdGhlIHRyZWUgb25seSBmcm9tIHRoZSB1cGRhdGVkIHBvaW50XG4gICAgICAgIGlmIChvcGVyYXRpb24gIT09ICd1bnNldCcpIHtcbiAgICAgICAgICB3YWxrKG5vZGUsIHBhdGgpO1xuICAgICAgICAgIHJlZ2lzdGVyLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiBtLmNoZWNrUmVjdXJzaXZpdHkoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdXNlZCB0byB2YWxpZGF0ZSB0aGUgdHJlZSdzIGRhdGEuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAtIElzIHRoZSB0cmVlIHZhbGlkP1xuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAndmFsaWRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB2YWxpZGF0ZShhZmZlY3RlZFBhdGhzKSB7XG4gICAgICB2YXIgX29wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgdmFsaWRhdGUgPSBfb3B0aW9ucy52YWxpZGF0ZTtcbiAgICAgIHZhciBiZWhhdmlvciA9IF9vcHRpb25zLnZhbGlkYXRpb25CZWhhdmlvcjtcblxuICAgICAgaWYgKHR5cGVvZiB2YWxpZGF0ZSAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGw7XG5cbiAgICAgIHZhciBlcnJvciA9IHZhbGlkYXRlLmNhbGwodGhpcywgdGhpcy5fcHJldmlvdXNEYXRhLCB0aGlzLl9kYXRhLCBhZmZlY3RlZFBhdGhzIHx8IFtbXV0pO1xuXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuXG4gICAgICAgIGlmIChiZWhhdmlvciA9PT0gJ3JvbGxiYWNrJykge1xuICAgICAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9wcmV2aW91c0RhdGE7XG4gICAgICAgICAgdGhpcy5fYWZmZWN0ZWRQYXRoc0luZGV4ID0ge307XG4gICAgICAgICAgdGhpcy5fdHJhbnNhY3Rpb24gPSBbXTtcbiAgICAgICAgICB0aGlzLl9wcmV2aW91c0RhdGEgPSB0aGlzLl9kYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0KCdpbnZhbGlkJywgeyBlcnJvcjogZXJyb3IgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdXNlZCB0byBzZWxlY3QgZGF0YSB3aXRoaW4gdGhlIHRyZWUgYnkgY3JlYXRpbmcgYSBjdXJzb3IuIEN1cnNvcnNcbiAgICAgKiBhcmUga2VwdCBhcyBzaW5nbGV0b25zIGJ5IHRoZSB0cmVlIGZvciBwZXJmb3JtYW5jZSBhbmQgaHlnaWVuZSByZWFzb25zLlxuICAgICAqXG4gICAgICogQXJpdHkgKDEpOlxuICAgICAqIEBwYXJhbSB7cGF0aH0gICAgcGF0aCAtIFBhdGggdG8gc2VsZWN0IGluIHRoZSB0cmVlLlxuICAgICAqXG4gICAgICogQXJpdHkgKCopOlxuICAgICAqIEBwYXJhbSB7Li4uc3RlcH0gcGF0aCAtIFBhdGggdG8gc2VsZWN0IGluIHRoZSB0cmVlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Q3Vyc29yfSAgICAgIC0gVGhlIHJlc3VsdGFudCBjdXJzb3IuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdzZWxlY3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3QocGF0aCkge1xuXG4gICAgICAvLyBJZiBubyBwYXRoIGlzIGdpdmVuLCB3ZSBzaW1wbHkgcmV0dXJuIHRoZSByb290XG4gICAgICBwYXRoID0gcGF0aCB8fCBbXTtcblxuICAgICAgLy8gVmFyaWFkaWNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgcGF0aCA9IGFycmF5RnJvbShhcmd1bWVudHMpO1xuXG4gICAgICAvLyBDaGVja2luZyB0aGF0IGdpdmVuIHBhdGggaXMgdmFsaWRcbiAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10ucGF0aChwYXRoKSkgdGhyb3cgbWFrZUVycm9yKCdCYW9iYWIuc2VsZWN0OiBpbnZhbGlkIHBhdGguJywgeyBwYXRoOiBwYXRoIH0pO1xuXG4gICAgICAvLyBDYXN0aW5nIHRvIGFycmF5XG4gICAgICBwYXRoID0gW10uY29uY2F0KHBhdGgpO1xuXG4gICAgICAvLyBDb21wdXRpbmcgaGFzaCAoZG9uZSBoZXJlIGJlY2F1c2UgaXQgd291bGQgYmUgdG9vIGxhdGUgdG8gZG8gaXQgaW4gdGhlXG4gICAgICAvLyBjdXJzb3IncyBjb25zdHJ1Y3RvciBzaW5jZSB3ZSBuZWVkIHRvIGhpdCB0aGUgY3Vyc29ycycgaW5kZXggZmlyc3QpLlxuICAgICAgdmFyIGhhc2ggPSBoYXNoUGF0aChwYXRoKTtcblxuICAgICAgLy8gQ3JlYXRpbmcgYSBuZXcgY3Vyc29yIG9yIHJldHVybmluZyB0aGUgYWxyZWFkeSBleGlzdGluZyBvbmUgZm9yIHRoZVxuICAgICAgLy8gcmVxdWVzdGVkIHBhdGguXG4gICAgICB2YXIgY3Vyc29yID0gdGhpcy5fY3Vyc29yc1toYXNoXTtcblxuICAgICAgaWYgKCFjdXJzb3IpIHtcbiAgICAgICAgY3Vyc29yID0gbmV3IF9jdXJzb3IyWydkZWZhdWx0J10odGhpcywgcGF0aCwgaGFzaCk7XG4gICAgICAgIHRoaXMuX2N1cnNvcnNbaGFzaF0gPSBjdXJzb3I7XG4gICAgICB9XG5cbiAgICAgIC8vIEVtaXR0aW5nIGFuIGV2ZW50IHRvIG5vdGlmeSB0aGF0IGEgcGFydCBvZiB0aGUgdHJlZSB3YXMgc2VsZWN0ZWRcbiAgICAgIHRoaXMuZW1pdCgnc2VsZWN0JywgeyBwYXRoOiBwYXRoLCBjdXJzb3I6IGN1cnNvciB9KTtcbiAgICAgIHJldHVybiBjdXJzb3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHVzZWQgdG8gdXBkYXRlIHRoZSB0cmVlLiBVcGRhdGVzIGFyZSBzaW1wbHkgZXhwcmVzc2VkIGJ5IGEgcGF0aCxcbiAgICAgKiBkeW5hbWljIG9yIG5vdCwgYW5kIGFuIG9wZXJhdGlvbi5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgd2hlcmUgcGF0aCBzb2x2aW5nIHNob3VsZCBoYXBwZW4gYW5kIG5vdCBpbiB0aGUgY3Vyc29yLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7cGF0aH0gICBwYXRoICAgICAgLSBUaGUgcGF0aCB3aGVyZSB3ZSdsbCBhcHBseSB0aGUgb3BlcmF0aW9uLlxuICAgICAqIEBwYXJhbSAge29iamVjdH0gb3BlcmF0aW9uIC0gVGhlIG9wZXJhdGlvbiB0byBhcHBseS5cbiAgICAgKiBAcmV0dXJuIHttaXhlZH0gLSBSZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgdXBkYXRlLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAndXBkYXRlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKHBhdGgsIG9wZXJhdGlvbikge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIC8vIENvZXJjaW5nIHBhdGhcbiAgICAgIHBhdGggPSBjb2VyY2VQYXRoKHBhdGgpO1xuXG4gICAgICBpZiAoIV90eXBlMlsnZGVmYXVsdCddLm9wZXJhdGlvblR5cGUob3BlcmF0aW9uLnR5cGUpKSB0aHJvdyBtYWtlRXJyb3IoJ0Jhb2JhYi51cGRhdGU6IHVua25vd24gb3BlcmF0aW9uIHR5cGUgXCInICsgb3BlcmF0aW9uLnR5cGUgKyAnXCIuJywgeyBvcGVyYXRpb246IG9wZXJhdGlvbiB9KTtcblxuICAgICAgLy8gU29sdmluZyB0aGUgZ2l2ZW4gcGF0aFxuXG4gICAgICB2YXIgX2dldEluID0gZ2V0SW4odGhpcy5fZGF0YSwgcGF0aCk7XG5cbiAgICAgIHZhciBzb2x2ZWRQYXRoID0gX2dldEluLnNvbHZlZFBhdGg7XG4gICAgICB2YXIgZXhpc3RzID0gX2dldEluLmV4aXN0cztcblxuICAgICAgLy8gSWYgd2UgY291bGRuJ3Qgc29sdmUgdGhlIHBhdGgsIHdlIHRocm93XG4gICAgICBpZiAoIXNvbHZlZFBhdGgpIHRocm93IG1ha2VFcnJvcignQmFvYmFiLnVwZGF0ZTogY291bGQgbm90IHNvbHZlIHRoZSBnaXZlbiBwYXRoLicsIHtcbiAgICAgICAgcGF0aDogc29sdmVkUGF0aFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFJlYWQtb25seSBwYXRoP1xuICAgICAgdmFyIG1vbmtleVBhdGggPSBfdHlwZTJbJ2RlZmF1bHQnXS5tb25rZXlQYXRoKHRoaXMuX21vbmtleXMsIHNvbHZlZFBhdGgpO1xuICAgICAgaWYgKG1vbmtleVBhdGggJiYgc29sdmVkUGF0aC5sZW5ndGggPiBtb25rZXlQYXRoLmxlbmd0aCkgdGhyb3cgbWFrZUVycm9yKCdCYW9iYWIudXBkYXRlOiBhdHRlbXB0aW5nIHRvIHVwZGF0ZSBhIHJlYWQtb25seSBwYXRoLicsIHtcbiAgICAgICAgcGF0aDogc29sdmVkUGF0aFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFdlIGRvbid0IHVuc2V0IGlycmVsZXZhbnQgcGF0aHNcbiAgICAgIGlmIChvcGVyYXRpb24udHlwZSA9PT0gJ3Vuc2V0JyAmJiAhZXhpc3RzKSByZXR1cm47XG5cbiAgICAgIC8vIElmIHdlIG1lcmdlIGRhdGEsIHdlIG5lZWQgdG8gYWNrbm93bGVkZ2UgbW9ua2V5c1xuICAgICAgdmFyIHJlYWxPcGVyYXRpb24gPSBvcGVyYXRpb247XG4gICAgICBpZiAoL21lcmdlLy50ZXN0KG9wZXJhdGlvbi50eXBlKSkge1xuICAgICAgICB2YXIgbW9ua2V5c05vZGUgPSBnZXRJbih0aGlzLl9tb25rZXlzLCBzb2x2ZWRQYXRoKS5kYXRhO1xuXG4gICAgICAgIGlmIChfdHlwZTJbJ2RlZmF1bHQnXS5vYmplY3QobW9ua2V5c05vZGUpKSB7XG4gICAgICAgICAgcmVhbE9wZXJhdGlvbiA9IHNoYWxsb3dDbG9uZShyZWFsT3BlcmF0aW9uKTtcblxuICAgICAgICAgIGlmICgvZGVlcC8udGVzdChyZWFsT3BlcmF0aW9uLnR5cGUpKSByZWFsT3BlcmF0aW9uLnZhbHVlID0gZGVlcE1lcmdlKHt9LCBtb25rZXlzTm9kZSwgcmVhbE9wZXJhdGlvbi52YWx1ZSk7ZWxzZSByZWFsT3BlcmF0aW9uLnZhbHVlID0gc2hhbGxvd01lcmdlKHt9LCBtb25rZXlzTm9kZSwgcmVhbE9wZXJhdGlvbi52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU3Rhc2hpbmcgcHJldmlvdXMgZGF0YSBpZiB0aGlzIGlzIHRoZSBmcmFtZSdzIGZpcnN0IHVwZGF0ZVxuICAgICAgaWYgKCF0aGlzLl90cmFuc2FjdGlvbi5sZW5ndGgpIHRoaXMuX3ByZXZpb3VzRGF0YSA9IHRoaXMuX2RhdGE7XG5cbiAgICAgIC8vIEFwcGx5aW5nIHRoZSBvcGVyYXRpb25cbiAgICAgIHZhciByZXN1bHQgPSAoMCwgX3VwZGF0ZTNbJ2RlZmF1bHQnXSkodGhpcy5fZGF0YSwgc29sdmVkUGF0aCwgcmVhbE9wZXJhdGlvbiwgdGhpcy5vcHRpb25zKTtcblxuICAgICAgdmFyIGRhdGEgPSByZXN1bHQuZGF0YTtcbiAgICAgIHZhciBub2RlID0gcmVzdWx0Lm5vZGU7XG5cbiAgICAgIC8vIElmIGJlY2F1c2Ugb2YgcHVyaXR5LCB0aGUgdXBkYXRlIHdhcyBtb290LCB3ZSBzdG9wIGhlcmVcbiAgICAgIGlmICghKCdkYXRhJyBpbiByZXN1bHQpKSByZXR1cm4gbm9kZTtcblxuICAgICAgLy8gSWYgdGhlIG9wZXJhdGlvbiBpcyBwdXNoLCB0aGUgYWZmZWN0ZWQgcGF0aCBpcyBzbGlnaHRseSBkaWZmZXJlbnRcbiAgICAgIHZhciBhZmZlY3RlZFBhdGggPSBzb2x2ZWRQYXRoLmNvbmNhdChvcGVyYXRpb24udHlwZSA9PT0gJ3B1c2gnID8gbm9kZS5sZW5ndGggLSAxIDogW10pO1xuXG4gICAgICB2YXIgaGFzaCA9IGhhc2hQYXRoKGFmZmVjdGVkUGF0aCk7XG5cbiAgICAgIC8vIFVwZGF0aW5nIGRhdGEgYW5kIHRyYW5zYWN0aW9uXG4gICAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgICAgIHRoaXMuX2FmZmVjdGVkUGF0aHNJbmRleFtoYXNoXSA9IHRydWU7XG4gICAgICB0aGlzLl90cmFuc2FjdGlvbi5wdXNoKF9leHRlbmRzKHt9LCBvcGVyYXRpb24sIHsgcGF0aDogYWZmZWN0ZWRQYXRoIH0pKTtcblxuICAgICAgLy8gVXBkYXRpbmcgdGhlIG1vbmtleXNcbiAgICAgIHRoaXMuX3JlZnJlc2hNb25rZXlzKG5vZGUsIHNvbHZlZFBhdGgsIG9wZXJhdGlvbi50eXBlKTtcblxuICAgICAgLy8gRW1pdHRpbmcgYSBgd3JpdGVgIGV2ZW50XG4gICAgICB0aGlzLmVtaXQoJ3dyaXRlJywgeyBwYXRoOiBhZmZlY3RlZFBhdGggfSk7XG5cbiAgICAgIC8vIFNob3VsZCB3ZSBsZXQgdGhlIHVzZXIgY29tbWl0P1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYXV0b0NvbW1pdCkgcmV0dXJuIG5vZGU7XG5cbiAgICAgIC8vIFNob3VsZCB3ZSB1cGRhdGUgYXN5bmNocm9ub3VzbHk/XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5hc3luY2hyb25vdXMpIHtcbiAgICAgICAgdGhpcy5jb21taXQoKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0aW5nIGFzeW5jaHJvbm91c2x5XG4gICAgICBpZiAoIXRoaXMuX2Z1dHVyZSkgdGhpcy5fZnV0dXJlID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczMuY29tbWl0KCk7XG4gICAgICB9LCAwKTtcblxuICAgICAgLy8gRmluYWxseSByZXR1cm5pbmcgdGhlIGFmZmVjdGVkIG5vZGVcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBjb21taXR0aW5nIHRoZSB1cGRhdGVzIG9mIHRoZSB0cmVlIGFuZCBmaXJpbmcgdGhlIHRyZWUncyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCYW9iYWJ9IC0gVGhlIHRyZWUgaW5zdGFuY2UgZm9yIGNoYWluaW5nIHB1cnBvc2VzLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnY29tbWl0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29tbWl0KCkge1xuXG4gICAgICAvLyBDbGVhcmluZyB0aW1lb3V0IGlmIG9uZSB3YXMgZGVmaW5lZFxuICAgICAgaWYgKHRoaXMuX2Z1dHVyZSkgdGhpcy5fZnV0dXJlID0gY2xlYXJUaW1lb3V0KHRoaXMuX2Z1dHVyZSk7XG5cbiAgICAgIHZhciBhZmZlY3RlZFBhdGhzID0gT2JqZWN0LmtleXModGhpcy5fYWZmZWN0ZWRQYXRoc0luZGV4KS5tYXAoZnVuY3Rpb24gKGgpIHtcbiAgICAgICAgcmV0dXJuIGggIT09ICfOuycgPyBoLnNwbGl0KCfOuycpLnNsaWNlKDEpIDogW107XG4gICAgICB9KTtcblxuICAgICAgLy8gSXMgdGhlIHRyZWUgc3RpbGwgdmFsaWQ/XG4gICAgICB2YXIgdmFsaWRhdGlvbkVycm9yID0gdGhpcy52YWxpZGF0ZShhZmZlY3RlZFBhdGhzKTtcblxuICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIENhY2hpbmcgdG8ga2VlcCBvcmlnaW5hbCByZWZlcmVuY2VzIGJlZm9yZSB3ZSBjaGFuZ2UgdGhlbVxuICAgICAgdmFyIHRyYW5zYWN0aW9uID0gdGhpcy5fdHJhbnNhY3Rpb24sXG4gICAgICAgICAgcHJldmlvdXNEYXRhID0gdGhpcy5fcHJldmlvdXNEYXRhO1xuXG4gICAgICB0aGlzLl9hZmZlY3RlZFBhdGhzSW5kZXggPSB7fTtcbiAgICAgIHRoaXMuX3RyYW5zYWN0aW9uID0gW107XG4gICAgICB0aGlzLl9wcmV2aW91c0RhdGEgPSB0aGlzLl9kYXRhO1xuXG4gICAgICAvLyBFbWl0dGluZyB1cGRhdGUgZXZlbnRcbiAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywge1xuICAgICAgICBwYXRoczogYWZmZWN0ZWRQYXRocyxcbiAgICAgICAgY3VycmVudERhdGE6IHRoaXMuX2RhdGEsXG4gICAgICAgIHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbixcbiAgICAgICAgcHJldmlvdXNEYXRhOiBwcmV2aW91c0RhdGFcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdXNlZCB0byB3YXRjaCBhIGNvbGxlY3Rpb24gb2YgcGF0aHMgd2l0aGluIHRoZSB0cmVlLiBWZXJ5IHVzZWZ1bFxuICAgICAqIHRvIGJpbmQgVUkgY29tcG9uZW50cyBhbmQgc3VjaCB0byB0aGUgdHJlZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge29iamVjdH0gbWFwcGluZyAtIE1hcHBpbmcgb2YgcGF0aHMgdG8gbGlzdGVuLlxuICAgICAqIEByZXR1cm4ge0N1cnNvcn0gICAgICAgICAtIFRoZSBjcmVhdGVkIHdhdGNoZXIuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICd3YXRjaCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHdhdGNoKG1hcHBpbmcpIHtcbiAgICAgIHJldHVybiBuZXcgX3dhdGNoZXIyWydkZWZhdWx0J10odGhpcywgbWFwcGluZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJlbGVhc2luZyB0aGUgdHJlZSBhbmQgaXRzIGF0dGFjaGVkIGRhdGEgZnJvbSBtZW1vcnkuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZWxlYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVsZWFzZSgpIHtcbiAgICAgIHZhciBrID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLmVtaXQoJ3JlbGVhc2UnKTtcblxuICAgICAgZGVsZXRlIHRoaXMucm9vdDtcblxuICAgICAgZGVsZXRlIHRoaXMuX2RhdGE7XG4gICAgICBkZWxldGUgdGhpcy5fcHJldmlvdXNEYXRhO1xuICAgICAgZGVsZXRlIHRoaXMuX3RyYW5zYWN0aW9uO1xuICAgICAgZGVsZXRlIHRoaXMuX2FmZmVjdGVkUGF0aHNJbmRleDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9tb25rZXlzO1xuXG4gICAgICAvLyBSZWxlYXNpbmcgY3Vyc29yc1xuICAgICAgZm9yIChrIGluIHRoaXMuX2N1cnNvcnMpIHRoaXMuX2N1cnNvcnNba10ucmVsZWFzZSgpO1xuICAgICAgZGVsZXRlIHRoaXMuX2N1cnNvcnM7XG5cbiAgICAgIC8vIEtpbGxpbmcgZXZlbnQgZW1pdHRlclxuICAgICAgdGhpcy5raWxsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGluZyB0aGUgYHRvSlNPTmAgbWV0aG9kIGZvciBjb252ZW5pZW50IHVzZSB3aXRoIEpTT04uc3RyaW5naWZ5LlxuICAgICAqXG4gICAgICogQHJldHVybiB7bWl4ZWR9IC0gRGF0YSBhdCBjdXJzb3IuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICd0b0pTT04nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXJpYWxpemUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkaW5nIHRoZSBgdG9TdHJpbmdgIG1ldGhvZCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7c3RyaW5nfSAtIFRoZSBiYW9iYWIncyBpZGVudGl0eS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3RvU3RyaW5nJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gdGhpcy5faWRlbnRpdHk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEJhb2JhYjtcbn0pKF9lbW1ldHQyWydkZWZhdWx0J10pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBCYW9iYWI7XG5CYW9iYWIubW9ua2V5ID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICBpZiAoIWFyZ3MubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0Jhb2JhYi5tb25rZXk6IG1pc3NpbmcgZGVmaW5pdGlvbi4nKTtcblxuICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHJldHVybiBuZXcgX21vbmtleS5Nb25rZXlEZWZpbml0aW9uKGFyZ3NbMF0pO1xuXG4gIHJldHVybiBuZXcgX21vbmtleS5Nb25rZXlEZWZpbml0aW9uKGFyZ3MpO1xufTtcbkJhb2JhYi5keW5hbWljTm9kZSA9IEJhb2JhYi5tb25rZXk7XG5cbi8qKlxuICogRXhwb3Npbmcgc29tZSBpbnRlcm5hbHMgZm9yIGNvbnZlbmllbmNlXG4gKi9cbkJhb2JhYi5DdXJzb3IgPSBfY3Vyc29yMlsnZGVmYXVsdCddO1xuQmFvYmFiLk1vbmtleURlZmluaXRpb24gPSBfbW9ua2V5Lk1vbmtleURlZmluaXRpb247XG5CYW9iYWIuTW9ua2V5ID0gX21vbmtleS5Nb25rZXk7XG5CYW9iYWIudHlwZSA9IF90eXBlMlsnZGVmYXVsdCddO1xuQmFvYmFiLmhlbHBlcnMgPSBoZWxwZXJzO1xuXG4vKipcbiAqIFZlcnNpb25cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJhb2JhYiwgJ3ZlcnNpb24nLCB7XG4gIHZhbHVlOiAnMi4yLjEnXG59KTtcblxuLyoqXG4gKiBFeHBvcnRpbmdcbiAqL1xuZXhwb3J0c1snZGVmYXVsdCddID0gQmFvYmFiO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyoqXG4gKiBCYW9iYWIgQ3Vyc29yc1xuICogPT09PT09PT09PT09PT09XG4gKlxuICogQ3Vyc29ycyBjcmVhdGVkIGJ5IHNlbGVjdGluZyBzb21lIGRhdGEgd2l0aGluIGEgQmFvYmFiIHRyZWUuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MywgX3g0LCBfeDUpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gzLCBwcm9wZXJ0eSA9IF94NCwgcmVjZWl2ZXIgPSBfeDU7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gzID0gcGFyZW50OyBfeDQgPSBwcm9wZXJ0eTsgX3g1ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9lbW1ldHQgPSByZXF1aXJlKCdlbW1ldHQnKTtcblxudmFyIF9lbW1ldHQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZW1tZXR0KTtcblxudmFyIF9tb25rZXkgPSByZXF1aXJlKCcuL21vbmtleScpO1xuXG52YXIgX3R5cGUgPSByZXF1aXJlKCcuL3R5cGUnKTtcblxudmFyIF90eXBlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGUpO1xuXG52YXIgX2hlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxuLyoqXG4gKiBUcmF2ZXJzYWwgaGVscGVyIGZ1bmN0aW9uIGZvciBkeW5hbWljIGN1cnNvcnMuIFdpbGwgdGhyb3cgYSBsZWdpYmxlIGVycm9yXG4gKiBpZiB0cmF2ZXJzYWwgaXMgbm90IHBvc3NpYmxlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgICAgIC0gVGhlIG1ldGhvZCBuYW1lLCB0byBjcmVhdGUgYSBjb3JyZWN0IGVycm9yIG1zZy5cbiAqIEBwYXJhbSB7YXJyYXl9ICBzb2x2ZWRQYXRoIC0gVGhlIGN1cnNvcidzIHNvbHZlZCBwYXRoLlxuICovXG5mdW5jdGlvbiBjaGVja1Bvc3NpYmlsaXR5T2ZEeW5hbWljVHJhdmVyc2FsKG1ldGhvZCwgc29sdmVkUGF0aCkge1xuICBpZiAoIXNvbHZlZFBhdGgpIHRocm93ICgwLCBfaGVscGVycy5tYWtlRXJyb3IpKCdCYW9iYWIuQ3Vyc29yLicgKyBtZXRob2QgKyAnOiAnICsgKCdjYW5ub3QgdXNlICcgKyBtZXRob2QgKyAnIG9uIGFuIHVucmVzb2x2ZWQgZHluYW1pYyBwYXRoLicpLCB7IHBhdGg6IHNvbHZlZFBhdGggfSk7XG59XG5cbi8qKlxuICogQ3Vyc29yIGNsYXNzXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Jhb2JhYn0gdHJlZSAgIC0gVGhlIGN1cnNvcidzIHJvb3QuXG4gKiBAcGFyYW0ge2FycmF5fSAgcGF0aCAgIC0gVGhlIGN1cnNvcidzIHBhdGggaW4gdGhlIHRyZWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaCAgIC0gVGhlIHBhdGgncyBoYXNoIGNvbXB1dGVkIGFoZWFkIGJ5IHRoZSB0cmVlLlxuICovXG5cbnZhciBDdXJzb3IgPSAoZnVuY3Rpb24gKF9FbWl0dGVyKSB7XG4gIF9pbmhlcml0cyhDdXJzb3IsIF9FbWl0dGVyKTtcblxuICBmdW5jdGlvbiBDdXJzb3IodHJlZSwgcGF0aCwgaGFzaCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ3Vyc29yKTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEN1cnNvci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgLy8gSWYgbm8gcGF0aCB3ZXJlIHRvIGJlIHByb3ZpZGVkLCB3ZSBmYWxsYmFjayB0byBhbiBlbXB0eSBwYXRoIChyb290KVxuICAgIHBhdGggPSBwYXRoIHx8IFtdO1xuXG4gICAgLy8gUHJpdmF0ZXNcbiAgICB0aGlzLl9pZGVudGl0eSA9ICdbb2JqZWN0IEN1cnNvcl0nO1xuICAgIHRoaXMuX2FyY2hpdmUgPSBudWxsO1xuXG4gICAgLy8gUHJvcGVydGllc1xuICAgIHRoaXMudHJlZSA9IHRyZWU7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLmhhc2ggPSBoYXNoO1xuXG4gICAgLy8gU3RhdGVcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAga2lsbGVkOiBmYWxzZSxcbiAgICAgIHJlY29yZGluZzogZmFsc2UsXG4gICAgICB1bmRvaW5nOiBmYWxzZVxuICAgIH07XG5cbiAgICAvLyBDaGVja2luZyB3aGV0aGVyIHRoZSBnaXZlbiBwYXRoIGlzIGR5bmFtaWMgb3Igbm90XG4gICAgdGhpcy5fZHluYW1pY1BhdGggPSBfdHlwZTJbJ2RlZmF1bHQnXS5keW5hbWljUGF0aCh0aGlzLnBhdGgpO1xuXG4gICAgLy8gQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gcGF0aCB3aWxsIG1lZXQgYSBtb25rZXlcbiAgICB0aGlzLl9tb25rZXlQYXRoID0gX3R5cGUyWydkZWZhdWx0J10ubW9ua2V5UGF0aCh0aGlzLnRyZWUuX21vbmtleXMsIHRoaXMucGF0aCk7XG5cbiAgICBpZiAoIXRoaXMuX2R5bmFtaWNQYXRoKSB0aGlzLnNvbHZlZFBhdGggPSB0aGlzLnBhdGg7ZWxzZSB0aGlzLnNvbHZlZFBhdGggPSAoMCwgX2hlbHBlcnMuZ2V0SW4pKHRoaXMudHJlZS5fZGF0YSwgdGhpcy5wYXRoKS5zb2x2ZWRQYXRoO1xuXG4gICAgLyoqXG4gICAgICogTGlzdGVuZXIgYm91bmQgdG8gdGhlIHRyZWUncyB3cml0ZXMgc28gdGhhdCBjdXJzb3JzIHdpdGggZHluYW1pYyBwYXRoc1xuICAgICAqIG1heSB1cGRhdGUgdGhlaXIgc29sdmVkIHBhdGggY29ycmVjdGx5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gVGhlIGV2ZW50IGZpcmVkIGJ5IHRoZSB0cmVlLlxuICAgICAqL1xuICAgIHRoaXMuX3dyaXRlSGFuZGxlciA9IGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICB2YXIgZGF0YSA9IF9yZWYuZGF0YTtcblxuICAgICAgaWYgKF90aGlzLnN0YXRlLmtpbGxlZCB8fCAhKDAsIF9oZWxwZXJzLnNvbHZlVXBkYXRlKShbZGF0YS5wYXRoXSwgX3RoaXMuX2dldENvbXBhcmVkUGF0aHMoKSkpIHJldHVybjtcblxuICAgICAgX3RoaXMuc29sdmVkUGF0aCA9ICgwLCBfaGVscGVycy5nZXRJbikoX3RoaXMudHJlZS5fZGF0YSwgX3RoaXMucGF0aCkuc29sdmVkUGF0aDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gaW4gY2hhcmdlIG9mIGFjdHVhbGx5IHRyaWdnZXIgdGhlIGN1cnNvcidzIHVwZGF0ZXMgYW5kXG4gICAgICogZGVhbCB3aXRoIHRoZSBhcmNoaXZlZCByZWNvcmRzLlxuICAgICAqXG4gICAgICogQG5vdGU6IHByb2JhYmx5IHNob3VsZCB3cmFwIHRoZSBjdXJyZW50IHNvbHZlZFBhdGggaW4gY2xvc3VyZSB0byBhdm9pZFxuICAgICAqIGZvciB0cmlja3kgY2FzZXMgd2hlcmUgaXQgd291bGQgZmFpbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bWl4ZWR9IHByZXZpb3VzRGF0YSAtIHRoZSB0cmVlJ3MgcHJldmlvdXMgZGF0YS5cbiAgICAgKi9cbiAgICB2YXIgZmlyZVVwZGF0ZSA9IGZ1bmN0aW9uIGZpcmVVcGRhdGUocHJldmlvdXNEYXRhKSB7XG4gICAgICB2YXIgc2VsZiA9IF90aGlzO1xuXG4gICAgICB2YXIgZXZlbnREYXRhID0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoe30sIHtcbiAgICAgICAgcHJldmlvdXNEYXRhOiB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gKDAsIF9oZWxwZXJzLmdldEluKShwcmV2aW91c0RhdGEsIHNlbGYuc29sdmVkUGF0aCkuZGF0YTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGN1cnJlbnREYXRhOiB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXQoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoX3RoaXMuc3RhdGUucmVjb3JkaW5nICYmICFfdGhpcy5zdGF0ZS51bmRvaW5nKSBfdGhpcy5hcmNoaXZlLmFkZChldmVudERhdGEucHJldmlvdXNEYXRhKTtcblxuICAgICAgX3RoaXMuc3RhdGUudW5kb2luZyA9IGZhbHNlO1xuXG4gICAgICByZXR1cm4gX3RoaXMuZW1pdCgndXBkYXRlJywgZXZlbnREYXRhKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGlzdGVuZXIgYm91bmQgdG8gdGhlIHRyZWUncyB1cGRhdGVzIGFuZCBkZXRlcm1pbmluZyB3aGV0aGVyIHRoZVxuICAgICAqIGN1cnNvciBpcyBhZmZlY3RlZCBhbmQgc2hvdWxkIHJlYWN0IGFjY29yZGluZ2x5LlxuICAgICAqXG4gICAgICogTm90ZSB0aGF0IHRoaXMgbGlzdGVuZXIgaXMgbGF6aWx5IGJvdW5kIHRvIHRoZSB0cmVlIHRvIGJlIHN1cmVcbiAgICAgKiBvbmUgd291bGRuJ3QgbGVhayBsaXN0ZW5lcnMgd2hlbiBvbmx5IGNyZWF0aW5nIGN1cnNvcnMgZm9yIGNvbnZlbmllbmNlXG4gICAgICogYW5kIG5vdCB0byBsaXN0ZW4gdG8gdXBkYXRlcyBzcGVjaWZpY2FsbHkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXZlbnQgLSBUaGUgZXZlbnQgZmlyZWQgYnkgdGhlIHRyZWUuXG4gICAgICovXG4gICAgdGhpcy5fdXBkYXRlSGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgaWYgKF90aGlzLnN0YXRlLmtpbGxlZCkgcmV0dXJuO1xuXG4gICAgICB2YXIgX2V2ZW50JGRhdGEgPSBldmVudC5kYXRhO1xuICAgICAgdmFyIHBhdGhzID0gX2V2ZW50JGRhdGEucGF0aHM7XG4gICAgICB2YXIgcHJldmlvdXNEYXRhID0gX2V2ZW50JGRhdGEucHJldmlvdXNEYXRhO1xuICAgICAgdmFyIHVwZGF0ZSA9IGZpcmVVcGRhdGUuYmluZChfdGhpcywgcHJldmlvdXNEYXRhKTtcbiAgICAgIHZhciBjb21wYXJlZFBhdGhzID0gX3RoaXMuX2dldENvbXBhcmVkUGF0aHMoKTtcblxuICAgICAgaWYgKCgwLCBfaGVscGVycy5zb2x2ZVVwZGF0ZSkocGF0aHMsIGNvbXBhcmVkUGF0aHMpKSByZXR1cm4gdXBkYXRlKCk7XG4gICAgfTtcblxuICAgIC8vIExhenkgYmluZGluZ1xuICAgIHZhciBib3VuZCA9IGZhbHNlO1xuICAgIHRoaXMuX2xhenlCaW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGJvdW5kKSByZXR1cm47XG5cbiAgICAgIGJvdW5kID0gdHJ1ZTtcblxuICAgICAgaWYgKF90aGlzLl9keW5hbWljUGF0aCkgX3RoaXMudHJlZS5vbignd3JpdGUnLCBfdGhpcy5fd3JpdGVIYW5kbGVyKTtcblxuICAgICAgcmV0dXJuIF90aGlzLnRyZWUub24oJ3VwZGF0ZScsIF90aGlzLl91cGRhdGVIYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgLy8gSWYgdGhlIHBhdGggaXMgZHluYW1pYywgd2UgYWN0dWFsbHkgbmVlZCB0byBsaXN0ZW4gdG8gdGhlIHRyZWVcbiAgICBpZiAodGhpcy5fZHluYW1pY1BhdGgpIHtcbiAgICAgIHRoaXMuX2xhenlCaW5kKCk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gT3ZlcnJpZGluZyB0aGUgZW1pdHRlciBgb25gIGFuZCBgb25jZWAgbWV0aG9kc1xuICAgICAgdGhpcy5vbiA9ICgwLCBfaGVscGVycy5iZWZvcmUpKHRoaXMuX2xhenlCaW5kLCB0aGlzLm9uLmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5vbmNlID0gKDAsIF9oZWxwZXJzLmJlZm9yZSkodGhpcy5fbGF6eUJpbmQsIHRoaXMub25jZS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHVzZWQgdG8gYWxsb3cgaXRlcmF0aW5nIG92ZXIgY3Vyc29ycyBjb250YWluaW5nIGxpc3QtdHlwZSBkYXRhLlxuICAgKlxuICAgKiBlLmcuIGZvcihsZXQgaSBvZiBjdXJzb3IpIHsgLi4uIH1cbiAgICpcbiAgICogQHJldHVybnMge29iamVjdH0gLSAgRWFjaCBpdGVtIHNlcXVlbnRpYWxseS5cbiAgICovXG5cbiAgLyoqXG4gICAqIEludGVybmFsIGhlbHBlcnNcbiAgICogLS0tLS0tLS0tLS0tLS0tLS1cbiAgICovXG5cbiAgLyoqXG4gICAqIE1ldGhvZCByZXR1cm5pbmcgdGhlIHBhdGhzIG9mIHRoZSB0cmVlIHdhdGNoZWQgb3ZlciBieSB0aGUgY3Vyc29yIGFuZCB0aGF0XG4gICAqIHNob3VsZCBiZSB0YWtlbiBpbnRvIGFjY291bnQgd2hlbiBzb2x2aW5nIGEgcG90ZW50aWFsIHVwZGF0ZS5cbiAgICpcbiAgICogQHJldHVybiB7YXJyYXl9IC0gQXJyYXkgb2YgcGF0aHMgdG8gY29tcGFyZSB3aXRoIGEgZ2l2ZW4gdXBkYXRlLlxuICAgKi9cblxuICBfY3JlYXRlQ2xhc3MoQ3Vyc29yLCBbe1xuICAgIGtleTogJ19nZXRDb21wYXJlZFBhdGhzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2dldENvbXBhcmVkUGF0aHMoKSB7XG5cbiAgICAgIC8vIENoZWNraW5nIHdoZXRoZXIgd2Ugc2hvdWxkIGtlZXAgdHJhY2sgb2Ygc29tZSBkZXBlbmRlbmNpZXNcbiAgICAgIHZhciBhZGRpdGlvbmFsUGF0aHMgPSB0aGlzLl9tb25rZXlQYXRoID8gKDAsIF9oZWxwZXJzLmdldEluKSh0aGlzLnRyZWUuX21vbmtleXMsIHRoaXMuX21vbmtleVBhdGgpLmRhdGEucmVsYXRlZFBhdGhzKCkgOiBbXTtcblxuICAgICAgcmV0dXJuIFt0aGlzLnNvbHZlZFBhdGhdLmNvbmNhdChhZGRpdGlvbmFsUGF0aHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWRpY2F0ZXNcbiAgICAgKiAtLS0tLS0tLS0tLVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB3aGV0aGVyIHRoZSBjdXJzb3IgaXMgYXQgcm9vdCBsZXZlbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IC0gSXMgdGhlIGN1cnNvciB0aGUgcm9vdD9cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2lzUm9vdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzUm9vdCgpIHtcbiAgICAgIHJldHVybiAhdGhpcy5wYXRoLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgcmV0dXJuaW5nIHdoZXRoZXIgdGhlIGN1cnNvciBpcyBhdCBsZWFmIGxldmVsLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gLSBJcyB0aGUgY3Vyc29yIGEgbGVhZj9cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2lzTGVhZicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzTGVhZigpIHtcbiAgICAgIHJldHVybiBfdHlwZTJbJ2RlZmF1bHQnXS5wcmltaXRpdmUodGhpcy5fZ2V0KCkuZGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB3aGV0aGVyIHRoZSBjdXJzb3IgaXMgYXQgYnJhbmNoIGxldmVsLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gLSBJcyB0aGUgY3Vyc29yIGEgYnJhbmNoP1xuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnaXNCcmFuY2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpc0JyYW5jaCgpIHtcbiAgICAgIHJldHVybiAhdGhpcy5pc1Jvb3QoKSAmJiAhdGhpcy5pc0xlYWYoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmF2ZXJzYWwgTWV0aG9kc1xuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB0aGUgcm9vdCBjdXJzb3IuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCYW9iYWJ9IC0gVGhlIHJvb3QgY3Vyc29yLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAncm9vdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJvb3QoKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmVlLnNlbGVjdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBzZWxlY3RpbmcgYSBzdWJwYXRoIGFzIGEgbmV3IGN1cnNvci5cbiAgICAgKlxuICAgICAqIEFyaXR5ICgxKTpcbiAgICAgKiBAcGFyYW0gIHtwYXRofSBwYXRoICAgIC0gVGhlIHBhdGggdG8gc2VsZWN0LlxuICAgICAqXG4gICAgICogQXJpdHkgKCopOlxuICAgICAqIEBwYXJhbSAgey4uLnN0ZXB9IHBhdGggLSBUaGUgcGF0aCB0byBzZWxlY3QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtDdXJzb3J9ICAgICAgIC0gVGhlIGNyZWF0ZWQgY3Vyc29yLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnc2VsZWN0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VsZWN0KHBhdGgpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgcGF0aCA9ICgwLCBfaGVscGVycy5hcnJheUZyb20pKGFyZ3VtZW50cyk7XG5cbiAgICAgIHJldHVybiB0aGlzLnRyZWUuc2VsZWN0KHRoaXMucGF0aC5jb25jYXQocGF0aCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCByZXR1cm5pbmcgdGhlIHBhcmVudCBub2RlIG9mIHRoZSBjdXJzb3Igb3IgZWxzZSBgbnVsbGAgaWYgdGhlXG4gICAgICogY3Vyc29yIGlzIGFscmVhZHkgYXQgcm9vdCBsZXZlbC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jhb2JhYn0gLSBUaGUgcGFyZW50IGN1cnNvci5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3VwJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXAoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNSb290KCkpIHJldHVybiB0aGlzLnRyZWUuc2VsZWN0KHRoaXMucGF0aC5zbGljZSgwLCAtMSkpO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgcmV0dXJuaW5nIHRoZSBjaGlsZCBub2RlIG9mIHRoZSBjdXJzb3IuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCYW9iYWJ9IC0gVGhlIGNoaWxkIGN1cnNvci5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2Rvd24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkb3duKCkge1xuICAgICAgY2hlY2tQb3NzaWJpbGl0eU9mRHluYW1pY1RyYXZlcnNhbCgnZG93bicsIHRoaXMuc29sdmVkUGF0aCk7XG5cbiAgICAgIGlmICghKHRoaXMuX2dldCgpLmRhdGEgaW5zdGFuY2VvZiBBcnJheSkpIHRocm93IEVycm9yKCdCYW9iYWIuQ3Vyc29yLmRvd246IGNhbm5vdCBnbyBkb3duIG9uIGEgbm9uLWxpc3QgdHlwZS4nKTtcblxuICAgICAgcmV0dXJuIHRoaXMudHJlZS5zZWxlY3QodGhpcy5zb2x2ZWRQYXRoLmNvbmNhdCgwKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB0aGUgbGVmdCBzaWJsaW5nIG5vZGUgb2YgdGhlIGN1cnNvciBpZiB0aGlzIG9uZSBpc1xuICAgICAqIHBvaW50aW5nIGF0IGEgbGlzdC4gUmV0dXJucyBgbnVsbGAgaWYgdGhpcyBjdXJzb3IgaXMgYWxyZWFkeSBsZWZ0bW9zdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jhb2JhYn0gLSBUaGUgbGVmdCBzaWJsaW5nIGN1cnNvci5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2xlZnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsZWZ0KCkge1xuICAgICAgY2hlY2tQb3NzaWJpbGl0eU9mRHluYW1pY1RyYXZlcnNhbCgnbGVmdCcsIHRoaXMuc29sdmVkUGF0aCk7XG5cbiAgICAgIHZhciBsYXN0ID0gK3RoaXMuc29sdmVkUGF0aFt0aGlzLnNvbHZlZFBhdGgubGVuZ3RoIC0gMV07XG5cbiAgICAgIGlmIChpc05hTihsYXN0KSkgdGhyb3cgRXJyb3IoJ0Jhb2JhYi5DdXJzb3IubGVmdDogY2Fubm90IGdvIGxlZnQgb24gYSBub24tbGlzdCB0eXBlLicpO1xuXG4gICAgICByZXR1cm4gbGFzdCA/IHRoaXMudHJlZS5zZWxlY3QodGhpcy5zb2x2ZWRQYXRoLnNsaWNlKDAsIC0xKS5jb25jYXQobGFzdCAtIDEpKSA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB0aGUgcmlnaHQgc2libGluZyBub2RlIG9mIHRoZSBjdXJzb3IgaWYgdGhpcyBvbmUgaXNcbiAgICAgKiBwb2ludGluZyBhdCBhIGxpc3QuIFJldHVybnMgYG51bGxgIGlmIHRoaXMgY3Vyc29yIGlzIGFscmVhZHkgcmlnaHRtb3N0LlxuICAgICAqXG4gICAgICogQHJldHVybiB7QmFvYmFifSAtIFRoZSByaWdodCBzaWJsaW5nIGN1cnNvci5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JpZ2h0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmlnaHQoKSB7XG4gICAgICBjaGVja1Bvc3NpYmlsaXR5T2ZEeW5hbWljVHJhdmVyc2FsKCdyaWdodCcsIHRoaXMuc29sdmVkUGF0aCk7XG5cbiAgICAgIHZhciBsYXN0ID0gK3RoaXMuc29sdmVkUGF0aFt0aGlzLnNvbHZlZFBhdGgubGVuZ3RoIC0gMV07XG5cbiAgICAgIGlmIChpc05hTihsYXN0KSkgdGhyb3cgRXJyb3IoJ0Jhb2JhYi5DdXJzb3IucmlnaHQ6IGNhbm5vdCBnbyByaWdodCBvbiBhIG5vbi1saXN0IHR5cGUuJyk7XG5cbiAgICAgIGlmIChsYXN0ICsgMSA9PT0gdGhpcy51cCgpLl9nZXQoKS5kYXRhLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIHJldHVybiB0aGlzLnRyZWUuc2VsZWN0KHRoaXMuc29sdmVkUGF0aC5zbGljZSgwLCAtMSkuY29uY2F0KGxhc3QgKyAxKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB0aGUgbGVmdG1vc3Qgc2libGluZyBub2RlIG9mIHRoZSBjdXJzb3IgaWYgdGhpcyBvbmUgaXNcbiAgICAgKiBwb2ludGluZyBhdCBhIGxpc3QuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCYW9iYWJ9IC0gVGhlIGxlZnRtb3N0IHNpYmxpbmcgY3Vyc29yLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnbGVmdG1vc3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsZWZ0bW9zdCgpIHtcbiAgICAgIGNoZWNrUG9zc2liaWxpdHlPZkR5bmFtaWNUcmF2ZXJzYWwoJ2xlZnRtb3N0JywgdGhpcy5zb2x2ZWRQYXRoKTtcblxuICAgICAgdmFyIGxhc3QgPSArdGhpcy5zb2x2ZWRQYXRoW3RoaXMuc29sdmVkUGF0aC5sZW5ndGggLSAxXTtcblxuICAgICAgaWYgKGlzTmFOKGxhc3QpKSB0aHJvdyBFcnJvcignQmFvYmFiLkN1cnNvci5sZWZ0bW9zdDogY2Fubm90IGdvIGxlZnQgb24gYSBub24tbGlzdCB0eXBlLicpO1xuXG4gICAgICByZXR1cm4gdGhpcy50cmVlLnNlbGVjdCh0aGlzLnNvbHZlZFBhdGguc2xpY2UoMCwgLTEpLmNvbmNhdCgwKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHJldHVybmluZyB0aGUgcmlnaHRtb3N0IHNpYmxpbmcgbm9kZSBvZiB0aGUgY3Vyc29yIGlmIHRoaXMgb25lIGlzXG4gICAgICogcG9pbnRpbmcgYXQgYSBsaXN0LlxuICAgICAqXG4gICAgICogQHJldHVybiB7QmFvYmFifSAtIFRoZSByaWdodG1vc3Qgc2libGluZyBjdXJzb3IuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyaWdodG1vc3QnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByaWdodG1vc3QoKSB7XG4gICAgICBjaGVja1Bvc3NpYmlsaXR5T2ZEeW5hbWljVHJhdmVyc2FsKCdyaWdodG1vc3QnLCB0aGlzLnNvbHZlZFBhdGgpO1xuXG4gICAgICB2YXIgbGFzdCA9ICt0aGlzLnNvbHZlZFBhdGhbdGhpcy5zb2x2ZWRQYXRoLmxlbmd0aCAtIDFdO1xuXG4gICAgICBpZiAoaXNOYU4obGFzdCkpIHRocm93IEVycm9yKCdCYW9iYWIuQ3Vyc29yLnJpZ2h0bW9zdDogY2Fubm90IGdvIHJpZ2h0IG9uIGEgbm9uLWxpc3QgdHlwZS4nKTtcblxuICAgICAgdmFyIGxpc3QgPSB0aGlzLnVwKCkuX2dldCgpLmRhdGE7XG5cbiAgICAgIHJldHVybiB0aGlzLnRyZWUuc2VsZWN0KHRoaXMuc29sdmVkUGF0aC5zbGljZSgwLCAtMSkuY29uY2F0KGxpc3QubGVuZ3RoIC0gMSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBtYXBwaW5nIHRoZSBjaGlsZHJlbiBub2RlcyBvZiB0aGUgY3Vyc29yLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7ZnVuY3Rpb259IGZuICAgICAgLSBUaGUgZnVuY3Rpb24gdG8gbWFwLlxuICAgICAqIEBwYXJhbSAge29iamVjdH0gICBbc2NvcGVdIC0gQW4gb3B0aW9uYWwgc2NvcGUuXG4gICAgICogQHJldHVybiB7YXJyYXl9ICAgICAgICAgICAgLSBUaGUgcmVzdWx0YW50IGFycmF5LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnbWFwJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWFwKGZuLCBzY29wZSkge1xuICAgICAgY2hlY2tQb3NzaWJpbGl0eU9mRHluYW1pY1RyYXZlcnNhbCgnbWFwJywgdGhpcy5zb2x2ZWRQYXRoKTtcblxuICAgICAgdmFyIGFycmF5ID0gdGhpcy5fZ2V0KCkuZGF0YSxcbiAgICAgICAgICBsID0gYXJndW1lbnRzLmxlbmd0aDtcblxuICAgICAgaWYgKCFfdHlwZTJbJ2RlZmF1bHQnXS5hcnJheShhcnJheSkpIHRocm93IEVycm9yKCdiYW9iYWIuQ3Vyc29yLm1hcDogY2Fubm90IG1hcCBhIG5vbi1saXN0IHR5cGUuJyk7XG5cbiAgICAgIHJldHVybiBhcnJheS5tYXAoZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwobCA+IDEgPyBzY29wZSA6IHRoaXMsIHRoaXMuc2VsZWN0KGkpLCBpLCBhcnJheSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXR0ZXIgTWV0aG9kc1xuICAgICAqIC0tLS0tLS0tLS0tLS0tLVxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgZ2V0IG1ldGhvZC4gQmFzaWNhbGx5IGNvbnRhaW5zIHRoZSBtYWluIGJvZHkgb2YgdGhlIGBnZXRgIG1ldGhvZFxuICAgICAqIHdpdGhvdXQgdGhlIGV2ZW50IGVtaXR0aW5nLiBUaGlzIGlzIHNvbWV0aW1lcyBuZWVkZWQgbm90IHRvIGZpcmUgdXNlbGVzc1xuICAgICAqIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3BhdGh9ICAgW3BhdGg9W11dICAgICAgIC0gUGF0aCB0byBnZXQgaW4gdGhlIHRyZWUuXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBpbmZvICAgICAgICAgICAgLSBUaGUgcmVzdWx0YW50IGluZm9ybWF0aW9uLlxuICAgICAqIEByZXR1cm4ge21peGVkfSAgaW5mby5kYXRhICAgICAgIC0gRGF0YSBhdCBwYXRoLlxuICAgICAqIEByZXR1cm4ge2FycmF5fSAgaW5mby5zb2x2ZWRQYXRoIC0gVGhlIHBhdGggc29sdmVkIHdoZW4gZ2V0dGluZy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ19nZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZ2V0KCkge1xuICAgICAgdmFyIHBhdGggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgaWYgKCFfdHlwZTJbJ2RlZmF1bHQnXS5wYXRoKHBhdGgpKSB0aHJvdyAoMCwgX2hlbHBlcnMubWFrZUVycm9yKSgnQmFvYmFiLkN1cnNvci5nZXR0ZXJzOiBpbnZhbGlkIHBhdGguJywgeyBwYXRoOiBwYXRoIH0pO1xuXG4gICAgICBpZiAoIXRoaXMuc29sdmVkUGF0aCkgcmV0dXJuIHsgZGF0YTogdW5kZWZpbmVkLCBzb2x2ZWRQYXRoOiBudWxsLCBleGlzdHM6IGZhbHNlIH07XG5cbiAgICAgIHJldHVybiAoMCwgX2hlbHBlcnMuZ2V0SW4pKHRoaXMudHJlZS5fZGF0YSwgdGhpcy5zb2x2ZWRQYXRoLmNvbmNhdChwYXRoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHVzZWQgdG8gY2hlY2sgd2hldGhlciBhIGNlcnRhaW4gcGF0aCBleGlzdHMgaW4gdGhlIHRyZWUgc3RhcnRpbmdcbiAgICAgKiBmcm9tIHRoZSBjdXJyZW50IGN1cnNvci5cbiAgICAgKlxuICAgICAqIEFyaXR5ICgxKTpcbiAgICAgKiBAcGFyYW0gIHtwYXRofSAgIHBhdGggICAgICAgICAgIC0gUGF0aCB0byBjaGVjayBpbiB0aGUgdHJlZS5cbiAgICAgKlxuICAgICAqIEFyaXR5ICgyKTpcbiAgICAgKiBAcGFyYW0gey4uc3RlcH0gIHBhdGggICAgICAgICAgIC0gUGF0aCB0byBjaGVjayBpbiB0aGUgdHJlZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59ICAgICAgICAgICAgICAgLSBEb2VzIHRoZSBnaXZlbiBwYXRoIGV4aXN0cz9cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2V4aXN0cycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGV4aXN0cyhwYXRoKSB7XG4gICAgICBwYXRoID0gKDAsIF9oZWxwZXJzLmNvZXJjZVBhdGgpKHBhdGgpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHBhdGggPSAoMCwgX2hlbHBlcnMuYXJyYXlGcm9tKShhcmd1bWVudHMpO1xuXG4gICAgICByZXR1cm4gdGhpcy5fZ2V0KHBhdGgpLmV4aXN0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdXNlZCB0byBnZXQgZGF0YSBmcm9tIHRoZSB0cmVlLiBXaWxsIGZpcmUgYSBgZ2V0YCBldmVudCBmcm9tIHRoZVxuICAgICAqIHRyZWUgc28gdGhhdCB0aGUgdXNlciBtYXkgc29tZXRpbWVzIHJlYWN0IHVwb24gaXQgdG8gZmV0Y2ggZGF0YSwgZm9yXG4gICAgICogaW5zdGFuY2UuXG4gICAgICpcbiAgICAgKiBBcml0eSAoMSk6XG4gICAgICogQHBhcmFtICB7cGF0aH0gICBwYXRoICAgICAgICAgICAtIFBhdGggdG8gZ2V0IGluIHRoZSB0cmVlLlxuICAgICAqXG4gICAgICogQXJpdHkgKDIpOlxuICAgICAqIEBwYXJhbSAgey4uc3RlcH0gcGF0aCAgICAgICAgICAgLSBQYXRoIHRvIGdldCBpbiB0aGUgdHJlZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge21peGVkfSAgICAgICAgICAgICAgICAgLSBEYXRhIGF0IHBhdGguXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdnZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXQocGF0aCkge1xuICAgICAgcGF0aCA9ICgwLCBfaGVscGVycy5jb2VyY2VQYXRoKShwYXRoKTtcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBwYXRoID0gKDAsIF9oZWxwZXJzLmFycmF5RnJvbSkoYXJndW1lbnRzKTtcblxuICAgICAgdmFyIF9nZXQyID0gdGhpcy5fZ2V0KHBhdGgpO1xuXG4gICAgICB2YXIgZGF0YSA9IF9nZXQyLmRhdGE7XG4gICAgICB2YXIgc29sdmVkUGF0aCA9IF9nZXQyLnNvbHZlZFBhdGg7XG5cbiAgICAgIC8vIEVtaXR0aW5nIHRoZSBldmVudFxuICAgICAgdGhpcy50cmVlLmVtaXQoJ2dldCcsIHsgZGF0YTogZGF0YSwgc29sdmVkUGF0aDogc29sdmVkUGF0aCwgcGF0aDogdGhpcy5wYXRoLmNvbmNhdChwYXRoKSB9KTtcblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHVzZWQgdG8gcmV0dXJuIHJhdyBkYXRhIGZyb20gdGhlIHRyZWUsIGJ5IGNhcmVmdWxseSBhdm9pZGluZ1xuICAgICAqIGNvbXB1dGVkIG9uZS5cbiAgICAgKlxuICAgICAqIEB0b2RvOiBzaG91bGQgYmUgbW9yZSBwZXJmb3JtYW50IGFzIHRoZSBjbG9uaW5nIHNob3VsZCBoYXBwZW4gYXMgd2VsbCBhc1xuICAgICAqIHdoZW4gZHJvcHBpbmcgY29tcHV0ZWQgZGF0YS5cbiAgICAgKlxuICAgICAqIEFyaXR5ICgxKTpcbiAgICAgKiBAcGFyYW0gIHtwYXRofSAgIHBhdGggICAgICAgICAgIC0gUGF0aCB0byBzZXJpYWxpemUgaW4gdGhlIHRyZWUuXG4gICAgICpcbiAgICAgKiBBcml0eSAoMik6XG4gICAgICogQHBhcmFtICB7Li5zdGVwfSBwYXRoICAgICAgICAgICAtIFBhdGggdG8gc2VyaWFsaXplIGluIHRoZSB0cmVlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7bWl4ZWR9ICAgICAgICAgICAgICAgICAtIFRoZSByZXRyaWV2ZWQgcmF3IGRhdGEuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdzZXJpYWxpemUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXJpYWxpemUocGF0aCkge1xuICAgICAgcGF0aCA9ICgwLCBfaGVscGVycy5jb2VyY2VQYXRoKShwYXRoKTtcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSBwYXRoID0gKDAsIF9oZWxwZXJzLmFycmF5RnJvbSkoYXJndW1lbnRzKTtcblxuICAgICAgaWYgKCFfdHlwZTJbJ2RlZmF1bHQnXS5wYXRoKHBhdGgpKSB0aHJvdyAoMCwgX2hlbHBlcnMubWFrZUVycm9yKSgnQmFvYmFiLkN1cnNvci5nZXR0ZXJzOiBpbnZhbGlkIHBhdGguJywgeyBwYXRoOiBwYXRoIH0pO1xuXG4gICAgICBpZiAoIXRoaXMuc29sdmVkUGF0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgICAgdmFyIGZ1bGxQYXRoID0gdGhpcy5zb2x2ZWRQYXRoLmNvbmNhdChwYXRoKTtcblxuICAgICAgdmFyIGRhdGEgPSAoMCwgX2hlbHBlcnMuZGVlcENsb25lKSgoMCwgX2hlbHBlcnMuZ2V0SW4pKHRoaXMudHJlZS5fZGF0YSwgZnVsbFBhdGgpLmRhdGEpLFxuICAgICAgICAgIG1vbmtleXMgPSAoMCwgX2hlbHBlcnMuZ2V0SW4pKHRoaXMudHJlZS5fbW9ua2V5cywgZnVsbFBhdGgpLmRhdGE7XG5cbiAgICAgIHZhciBkcm9wQ29tcHV0ZWREYXRhID0gZnVuY3Rpb24gZHJvcENvbXB1dGVkRGF0YShkLCBtKSB7XG4gICAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KG0pIHx8ICFfdHlwZTJbJ2RlZmF1bHQnXS5vYmplY3QoZCkpIHJldHVybjtcblxuICAgICAgICBmb3IgKHZhciBrIGluIG0pIHtcbiAgICAgICAgICBpZiAobVtrXSBpbnN0YW5jZW9mIF9tb25rZXkuTW9ua2V5KSBkZWxldGUgZFtrXTtlbHNlIGRyb3BDb21wdXRlZERhdGEoZFtrXSwgbVtrXSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGRyb3BDb21wdXRlZERhdGEoZGF0YSwgbW9ua2V5cyk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdXNlZCB0byBwcm9qZWN0IHNvbWUgb2YgdGhlIGRhdGEgYXQgY3Vyc29yIG9udG8gYSBtYXAgb3IgYSBsaXN0LlxuICAgICAqXG4gICAgICogQHBhcmFtICB7b2JqZWN0fGFycmF5fSBwcm9qZWN0aW9uIC0gVGhlIHByb2plY3Rpb24ncyBmb3JtYWwgZGVmaW5pdGlvbi5cbiAgICAgKiBAcmV0dXJuIHtvYmplY3R8YXJyYXl9ICAgICAgICAgICAgLSBUaGUgcmVzdWx0YW50IG1hcC9saXN0LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAncHJvamVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHByb2plY3QocHJvamVjdGlvbikge1xuICAgICAgaWYgKF90eXBlMlsnZGVmYXVsdCddLm9iamVjdChwcm9qZWN0aW9uKSkge1xuICAgICAgICB2YXIgZGF0YSA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGsgaW4gcHJvamVjdGlvbikge1xuICAgICAgICAgIGRhdGFba10gPSB0aGlzLmdldChwcm9qZWN0aW9uW2tdKTtcbiAgICAgICAgfXJldHVybiBkYXRhO1xuICAgICAgfSBlbHNlIGlmIChfdHlwZTJbJ2RlZmF1bHQnXS5hcnJheShwcm9qZWN0aW9uKSkge1xuICAgICAgICB2YXIgZGF0YSA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcHJvamVjdGlvbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBkYXRhLnB1c2godGhpcy5nZXQocHJvamVjdGlvbltpXSkpO1xuICAgICAgICB9cmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIHRocm93ICgwLCBfaGVscGVycy5tYWtlRXJyb3IpKCdCYW9iYWIuQ3Vyc29yLnByb2plY3Q6IHdyb25nIHByb2plY3Rpb24uJywgeyBwcm9qZWN0aW9uOiBwcm9qZWN0aW9uIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpc3RvcnkgTWV0aG9kc1xuICAgICAqIC0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZHMgc3RhcnRpbmcgdG8gcmVjb3JkIHRoZSBjdXJzb3IncyBzdWNjZXNzaXZlIHN0YXRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge2ludGVnZXJ9IFttYXhSZWNvcmRzXSAtIE1heGltdW0gcmVjb3JkcyB0byBrZWVwIGluIG1lbW9yeS4gTm90ZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQgaWYgbm8gbnVtYmVyIGlzIHByb3ZpZGVkLCB0aGUgY3Vyc29yXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBrZWVwIGV2ZXJ5dGhpbmcuXG4gICAgICogQHJldHVybiB7Q3Vyc29yfSAgICAgICAgICAgICAgIC0gVGhlIGN1cnNvciBpbnN0YW5jZSBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdzdGFydFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0UmVjb3JkaW5nKG1heFJlY29yZHMpIHtcbiAgICAgIG1heFJlY29yZHMgPSBtYXhSZWNvcmRzIHx8IEluZmluaXR5O1xuXG4gICAgICBpZiAobWF4UmVjb3JkcyA8IDEpIHRocm93ICgwLCBfaGVscGVycy5tYWtlRXJyb3IpKCdCYW9iYWIuQ3Vyc29yLnN0YXJ0UmVjb3JkaW5nOiBpbnZhbGlkIG1heCByZWNvcmRzLicsIHtcbiAgICAgICAgdmFsdWU6IG1heFJlY29yZHNcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnN0YXRlLnJlY29yZGluZyA9IHRydWU7XG5cbiAgICAgIGlmICh0aGlzLmFyY2hpdmUpIHJldHVybiB0aGlzO1xuXG4gICAgICAvLyBMYXp5IGJpbmRpbmdcbiAgICAgIHRoaXMuX2xhenlCaW5kKCk7XG5cbiAgICAgIHRoaXMuYXJjaGl2ZSA9IG5ldyBfaGVscGVycy5BcmNoaXZlKG1heFJlY29yZHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kcyBzdG9wcGluZyB0byByZWNvcmQgdGhlIGN1cnNvcidzIHN1Y2Nlc3NpdmUgc3RhdGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Q3Vyc29yfSAtIFRoZSBjdXJzb3IgaW5zdGFuY2UgZm9yIGNoYWluaW5nIHB1cnBvc2VzLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnc3RvcFJlY29yZGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgICB0aGlzLnN0YXRlLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kcyB1bmRvaW5nIG4gc3RlcHMgb2YgdGhlIGN1cnNvcidzIHJlY29yZGVkIHN0YXRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge2ludGVnZXJ9IFtzdGVwcz0xXSAtIFRoZSBudW1iZXIgb2Ygc3RlcHMgdG8gcm9sbGJhY2suXG4gICAgICogQHJldHVybiB7Q3Vyc29yfSAgICAgICAgICAgIC0gVGhlIGN1cnNvciBpbnN0YW5jZSBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICd1bmRvJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5kbygpIHtcbiAgICAgIHZhciBzdGVwcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgIGlmICghdGhpcy5zdGF0ZS5yZWNvcmRpbmcpIHRocm93IG5ldyBFcnJvcignQmFvYmFiLkN1cnNvci51bmRvOiBjdXJzb3IgaXMgbm90IHJlY29yZGluZy4nKTtcblxuICAgICAgdmFyIHJlY29yZCA9IHRoaXMuYXJjaGl2ZS5iYWNrKHN0ZXBzKTtcblxuICAgICAgaWYgKCFyZWNvcmQpIHRocm93IEVycm9yKCdCYW9iYWIuQ3Vyc29yLnVuZG86IGNhbm5vdCBmaW5kIGEgcmVsZXZhbnQgcmVjb3JkLicpO1xuXG4gICAgICB0aGlzLnN0YXRlLnVuZG9pbmcgPSB0cnVlO1xuICAgICAgdGhpcy5zZXQocmVjb3JkKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kcyByZXR1cm5pbmcgd2hldGhlciB0aGUgY3Vyc29yIGhhcyBhIHJlY29yZGVkIGhpc3RvcnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSAtIGB0cnVlYCBpZiB0aGUgY3Vyc29yIGhhcyBhIHJlY29yZGVkIGhpc3Rvcnk/XG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdoYXNIaXN0b3J5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFzSGlzdG9yeSgpIHtcbiAgICAgIHJldHVybiAhISh0aGlzLmFyY2hpdmUgJiYgdGhpcy5hcmNoaXZlLmdldCgpLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kcyByZXR1cm5pbmcgdGhlIGN1cnNvcidzIGhpc3RvcnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHthcnJheX0gLSBUaGUgY3Vyc29yJ3MgaGlzdG9yeS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2dldEhpc3RvcnknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRIaXN0b3J5KCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXJjaGl2ZSA/IHRoaXMuYXJjaGl2ZS5nZXQoKSA6IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZHMgY2xlYXJpbmcgdGhlIGN1cnNvcidzIGhpc3RvcnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtDdXJzb3J9IC0gVGhlIGN1cnNvciBpbnN0YW5jZSBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdjbGVhckhpc3RvcnknLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhckhpc3RvcnkoKSB7XG4gICAgICBpZiAodGhpcy5hcmNoaXZlKSB0aGlzLmFyY2hpdmUuY2xlYXIoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2luZ1xuICAgICAqIC0tLS0tLS0tLS1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZHMgcmVsZWFzaW5nIHRoZSBjdXJzb3IgZnJvbSBtZW1vcnkuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZWxlYXNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVsZWFzZSgpIHtcblxuICAgICAgLy8gUmVtb3ZpbmcgbGlzdGVuZXJzIG9uIHBhcmVudFxuICAgICAgaWYgKHRoaXMuX2R5bmFtaWNQYXRoKSB0aGlzLnRyZWUub2ZmKCd3cml0ZScsIHRoaXMuX3dyaXRlSGFuZGxlcik7XG5cbiAgICAgIHRoaXMudHJlZS5vZmYoJ3VwZGF0ZScsIHRoaXMuX3VwZGF0ZUhhbmRsZXIpO1xuXG4gICAgICAvLyBVbnN1YnNjcmliZSBmcm9tIHRoZSBwYXJlbnRcbiAgICAgIGlmICh0aGlzLmhhc2gpIGRlbGV0ZSB0aGlzLnRyZWUuX2N1cnNvcnNbdGhpcy5oYXNoXTtcblxuICAgICAgLy8gRGVyZWZlcmVuY2luZ1xuICAgICAgZGVsZXRlIHRoaXMudHJlZTtcbiAgICAgIGRlbGV0ZSB0aGlzLnBhdGg7XG4gICAgICBkZWxldGUgdGhpcy5zb2x2ZWRQYXRoO1xuICAgICAgZGVsZXRlIHRoaXMuYXJjaGl2ZTtcblxuICAgICAgLy8gS2lsbGluZyBlbWl0dGVyXG4gICAgICB0aGlzLmtpbGwoKTtcbiAgICAgIHRoaXMuc3RhdGUua2lsbGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdXRwdXRcbiAgICAgKiAtLS0tLS0tXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkaW5nIHRoZSBgdG9KU09OYCBtZXRob2QgZm9yIGNvbnZlbmllbnQgdXNlIHdpdGggSlNPTi5zdHJpbmdpZnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHttaXhlZH0gLSBEYXRhIGF0IGN1cnNvci5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3RvSlNPTicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRpbmcgdGhlIGB0b1N0cmluZ2AgbWV0aG9kIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gVGhlIGN1cnNvcidzIGlkZW50aXR5LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAndG9TdHJpbmcnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pZGVudGl0eTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ3Vyc29yO1xufSkoX2VtbWV0dDJbJ2RlZmF1bHQnXSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEN1cnNvcjtcbmlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIEN1cnNvci5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJyYXkgPSB0aGlzLl9nZXQoKS5kYXRhO1xuXG4gICAgaWYgKCFfdHlwZTJbJ2RlZmF1bHQnXS5hcnJheShhcnJheSkpIHRocm93IEVycm9yKCdiYW9iYWIuQ3Vyc29yLkBAaXRlcmF0ZTogY2Fubm90IGl0ZXJhdGUgYSBub24tbGlzdCB0eXBlLicpO1xuXG4gICAgdmFyIGkgPSAwO1xuXG4gICAgdmFyIGN1cnNvciA9IHRoaXMsXG4gICAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICAgIHJldHVybiB7XG4gICAgICBuZXh0OiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICBpZiAoaSA8IGxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogY3Vyc29yLnNlbGVjdChpKyspXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZG9uZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogU2V0dGVyIE1ldGhvZHNcbiAqIC0tLS0tLS0tLS0tLS0tLVxuICpcbiAqIFRob3NlIG1ldGhvZHMgYXJlIGR5bmFtaWNhbGx5IGFzc2lnbmVkIHRvIHRoZSBjbGFzcyBmb3IgRFJZIHJlYXNvbnMuXG4gKi9cblxuLyoqXG4gKiBGdW5jdGlvbiBjcmVhdGluZyBhIHNldHRlciBtZXRob2QgZm9yIHRoZSBDdXJzb3IgY2xhc3MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9ICAgbmFtZSAgICAgICAgICAtIHRoZSBtZXRob2QncyBuYW1lLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gW3R5cGVDaGVja2VyXSAtIGEgZnVuY3Rpb24gY2hlY2tpbmcgdGhhdCB0aGUgZ2l2ZW4gdmFsdWUgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCBmb3IgdGhlIGdpdmVuIG9wZXJhdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWFrZVNldHRlcihuYW1lLCB0eXBlQ2hlY2tlcikge1xuXG4gIC8qKlxuICAgKiBCaW5kaW5nIGEgc2V0dGVyIG1ldGhvZCB0byB0aGUgQ3Vyc29yIGNsYXNzIGFuZCBoYXZpbmcgdGhlIGZvbGxvd2luZ1xuICAgKiBkZWZpbml0aW9uLlxuICAgKlxuICAgKiBOb3RlOiB0aGlzIGlzIG5vdCByZWFsbHkgcG9zc2libGUgdG8gbWFrZSB0aG9zZSBzZXR0ZXJzIHZhcmlhZGljIGJlY2F1c2VcbiAgICogaXQgd291bGQgY3JlYXRlIGFuIGltcG9zc2libGUgcG9seW1vcnBoaXNtIHdpdGggcGF0aC5cbiAgICpcbiAgICogQHRvZG86IHBlcmZvcm0gdmFsdWUgdmFsaWRhdGlvbiBlbHNld2hlcmUgc28gdGhhdCB0cmVlLnVwZGF0ZSBjYW5cbiAgICogYmVuZWZpY2lhdGUgZnJvbSBpdC5cbiAgICpcbiAgICogQXJpdHkgKDEpOlxuICAgKiBAcGFyYW0gIHttaXhlZH0gdmFsdWUgLSBOZXcgdmFsdWUgdG8gc2V0IGF0IGN1cnNvcidzIHBhdGguXG4gICAqXG4gICAqIEFyaXR5ICgyKTpcbiAgICogQHBhcmFtICB7cGF0aH0gIHBhdGggIC0gU3VicGF0aCB0byB1cGRhdGUgc3RhcnRpbmcgZnJvbSBjdXJzb3Incy5cbiAgICogQHBhcmFtICB7bWl4ZWR9IHZhbHVlIC0gTmV3IHZhbHVlIHRvIHNldC5cbiAgICpcbiAgICogQHJldHVybiB7bWl4ZWR9ICAgICAgIC0gRGF0YSBhdCBwYXRoLlxuICAgKi9cbiAgQ3Vyc29yLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuXG4gICAgLy8gV2Ugc2hvdWxkIHdhcm4gdGhlIHVzZXIgaWYgaGUgYXBwbGllcyB0byBtYW55IGFyZ3VtZW50cyB0byB0aGUgZnVuY3Rpb25cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHRocm93ICgwLCBfaGVscGVycy5tYWtlRXJyb3IpKCdCYW9iYWIuQ3Vyc29yLicgKyBuYW1lICsgJzogdG9vIG1hbnkgYXJndW1lbnRzLicpO1xuXG4gICAgLy8gSGFuZGxpbmcgYXJpdGllc1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIG5hbWUgIT09ICd1bnNldCcpIHtcbiAgICAgIHZhbHVlID0gcGF0aDtcbiAgICAgIHBhdGggPSBbXTtcbiAgICB9XG5cbiAgICAvLyBDb2VyY2UgcGF0aFxuICAgIHBhdGggPSAoMCwgX2hlbHBlcnMuY29lcmNlUGF0aCkocGF0aCk7XG5cbiAgICAvLyBDaGVja2luZyB0aGUgcGF0aCdzIHZhbGlkaXR5XG4gICAgaWYgKCFfdHlwZTJbJ2RlZmF1bHQnXS5wYXRoKHBhdGgpKSB0aHJvdyAoMCwgX2hlbHBlcnMubWFrZUVycm9yKSgnQmFvYmFiLkN1cnNvci4nICsgbmFtZSArICc6IGludmFsaWQgcGF0aC4nLCB7IHBhdGg6IHBhdGggfSk7XG5cbiAgICAvLyBDaGVja2luZyB0aGUgdmFsdWUncyB2YWxpZGl0eVxuICAgIGlmICh0eXBlQ2hlY2tlciAmJiAhdHlwZUNoZWNrZXIodmFsdWUpKSB0aHJvdyAoMCwgX2hlbHBlcnMubWFrZUVycm9yKSgnQmFvYmFiLkN1cnNvci4nICsgbmFtZSArICc6IGludmFsaWQgdmFsdWUuJywgeyBwYXRoOiBwYXRoLCB2YWx1ZTogdmFsdWUgfSk7XG5cbiAgICB2YXIgZnVsbFBhdGggPSB0aGlzLnNvbHZlZFBhdGguY29uY2F0KHBhdGgpO1xuXG4gICAgLy8gRmlsaW5nIHRoZSB1cGRhdGUgdG8gdGhlIHRyZWVcbiAgICByZXR1cm4gdGhpcy50cmVlLnVwZGF0ZShmdWxsUGF0aCwge1xuICAgICAgdHlwZTogbmFtZSxcbiAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0pO1xuICB9O1xufVxuXG4vKipcbiAqIE1ha2luZyB0aGUgbmVjZXNzYXJ5IHNldHRlcnMuXG4gKi9cbm1ha2VTZXR0ZXIoJ3NldCcpO1xubWFrZVNldHRlcigndW5zZXQnKTtcbm1ha2VTZXR0ZXIoJ2FwcGx5JywgX3R5cGUyWydkZWZhdWx0J11bJ2Z1bmN0aW9uJ10pO1xubWFrZVNldHRlcigncHVzaCcpO1xubWFrZVNldHRlcignY29uY2F0JywgX3R5cGUyWydkZWZhdWx0J10uYXJyYXkpO1xubWFrZVNldHRlcigndW5zaGlmdCcpO1xubWFrZVNldHRlcignc3BsaWNlJywgX3R5cGUyWydkZWZhdWx0J10uc3BsaWNlcik7XG5tYWtlU2V0dGVyKCdtZXJnZScsIF90eXBlMlsnZGVmYXVsdCddLm9iamVjdCk7XG5tYWtlU2V0dGVyKCdkZWVwTWVyZ2UnLCBfdHlwZTJbJ2RlZmF1bHQnXS5vYmplY3QpO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyogZXNsaW50IGVxZXFlcTogMCAqL1xuXG4vKipcbiAqIEJhb2JhYiBIZWxwZXJzXG4gKiA9PT09PT09PT09PT09PT1cbiAqXG4gKiBNaXNjZWxsYW5lb3VzIGhlbHBlciBmdW5jdGlvbnMuXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmV4cG9ydHMuYXJyYXlGcm9tID0gYXJyYXlGcm9tO1xuZXhwb3J0cy5iZWZvcmUgPSBiZWZvcmU7XG5leHBvcnRzLmNvZXJjZVBhdGggPSBjb2VyY2VQYXRoO1xuZXhwb3J0cy5nZXRJbiA9IGdldEluO1xuZXhwb3J0cy5tYWtlRXJyb3IgPSBtYWtlRXJyb3I7XG5leHBvcnRzLnNvbHZlUmVsYXRpdmVQYXRoID0gc29sdmVSZWxhdGl2ZVBhdGg7XG5leHBvcnRzLnNvbHZlVXBkYXRlID0gc29sdmVVcGRhdGU7XG5leHBvcnRzLnNwbGljZSA9IHNwbGljZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9tb25rZXkgPSByZXF1aXJlKCcuL21vbmtleScpO1xuXG52YXIgX3R5cGUgPSByZXF1aXJlKCcuL3R5cGUnKTtcblxudmFyIF90eXBlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGUpO1xuXG4vKipcbiAqIE5vb3AgZnVuY3Rpb25cbiAqL1xudmFyIG5vb3AgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKlxuICogRnVuY3Rpb24gcmV0dXJuaW5nIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZWxlbWVudCBvZiBhIGxpc3QgbWF0Y2hpbmcgdGhlXG4gKiBnaXZlbiBwcmVkaWNhdGUuXG4gKlxuICogQHBhcmFtICB7YXJyYXl9ICAgICBhICAtIFRoZSB0YXJnZXQgYXJyYXkuXG4gKiBAcGFyYW0gIHtmdW5jdGlvbn0gIGZuIC0gVGhlIHByZWRpY2F0ZSBmdW5jdGlvbi5cbiAqIEByZXR1cm4ge21peGVkfSAgICAgICAgLSBUaGUgaW5kZXggb2YgdGhlIGZpcnN0IG1hdGNoaW5nIGl0ZW0gb3IgLTEuXG4gKi9cbmZ1bmN0aW9uIGluZGV4KGEsIGZuKSB7XG4gIHZhciBpID0gdW5kZWZpbmVkLFxuICAgICAgbCA9IHVuZGVmaW5lZDtcbiAgZm9yIChpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKGZuKGFbaV0pKSByZXR1cm4gaTtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogRWZmaWNpZW50IHNsaWNlIGZ1bmN0aW9uIHVzZWQgdG8gY2xvbmUgYXJyYXlzIG9yIHBhcnRzIG9mIHRoZW0uXG4gKlxuICogQHBhcmFtICB7YXJyYXl9IGFycmF5IC0gVGhlIGFycmF5IHRvIHNsaWNlLlxuICogQHJldHVybiB7YXJyYXl9ICAgICAgIC0gVGhlIHNsaWNlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gc2xpY2UoYXJyYXkpIHtcbiAgdmFyIG5ld0FycmF5ID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aCk7XG5cbiAgdmFyIGkgPSB1bmRlZmluZWQsXG4gICAgICBsID0gdW5kZWZpbmVkO1xuXG4gIGZvciAoaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpKyspIG5ld0FycmF5W2ldID0gYXJyYXlbaV07XG5cbiAgcmV0dXJuIG5ld0FycmF5O1xufVxuXG4vKipcbiAqIEFyY2hpdmUgYWJzdHJhY3Rpb25cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7aW50ZWdlcn0gc2l6ZSAtIE1heGltdW0gbnVtYmVyIG9mIHJlY29yZHMgdG8gc3RvcmUuXG4gKi9cblxudmFyIEFyY2hpdmUgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBBcmNoaXZlKHNpemUpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQXJjaGl2ZSk7XG5cbiAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgIHRoaXMucmVjb3JkcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGNyZWF0aW5nIGEgcmVhbCBhcnJheSBmcm9tIHdoYXQgc2hvdWxkIGJlIGFuIGFycmF5IGJ1dCBpcyBub3QuXG4gICAqIEknbSBsb29raW5nIGF0IHlvdSBuYXN0eSBgYXJndW1lbnRzYC4uLlxuICAgKlxuICAgKiBAcGFyYW0gIHttaXhlZH0gY3VscHJpdCAtIFRoZSBjdWxwcml0IHRvIGNvbnZlcnQuXG4gICAqIEByZXR1cm4ge2FycmF5fSAgICAgICAgIC0gVGhlIHJlYWwgYXJyYXkuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBNZXRob2QgcmV0cmlldmluZyB0aGUgcmVjb3Jkcy5cbiAgICpcbiAgICogQHJldHVybiB7YXJyYXl9IC0gVGhlIHJlY29yZHMuXG4gICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhBcmNoaXZlLCBbe1xuICAgIGtleTogJ2dldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlY29yZHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIGFkZGluZyBhIHJlY29yZCB0byB0aGUgYXJjaGl2ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9ICByZWNvcmQgLSBUaGUgcmVjb3JkIHRvIHN0b3JlLlxuICAgICAqIEByZXR1cm4ge0FyY2hpdmV9ICAgICAgIC0gVGhlIGFyY2hpdmUgaXRzZWxmIGZvciBjaGFpbmluZyBwdXJwb3Nlcy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2FkZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZChyZWNvcmQpIHtcbiAgICAgIHRoaXMucmVjb3Jkcy51bnNoaWZ0KHJlY29yZCk7XG5cbiAgICAgIC8vIElmIHRoZSBudW1iZXIgb2YgcmVjb3JkcyBpcyBleGNlZWRlZCwgd2UgdHJ1bmNhdGUgdGhlIHJlY29yZHNcbiAgICAgIGlmICh0aGlzLnJlY29yZHMubGVuZ3RoID4gdGhpcy5zaXplKSB0aGlzLnJlY29yZHMubGVuZ3RoID0gdGhpcy5zaXplO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgY2xlYXJpbmcgdGhlIHJlY29yZHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtBcmNoaXZlfSAtIFRoZSBhcmNoaXZlIGl0c2VsZiBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdjbGVhcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgdGhpcy5yZWNvcmRzID0gW107XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gZ28gYmFjayBpbiB0aW1lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtpbnRlZ2VyfSBzdGVwcyAtIE51bWJlciBvZiBzdGVwcyB3ZSBzaG91bGQgZ28gYmFjayBieS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9ICAgICAgIC0gVGhlIGxhc3QgcmVjb3JkLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnYmFjaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGJhY2soc3RlcHMpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0aGlzLnJlY29yZHNbc3RlcHMgLSAxXTtcblxuICAgICAgaWYgKHJlY29yZCkgdGhpcy5yZWNvcmRzID0gdGhpcy5yZWNvcmRzLnNsaWNlKHN0ZXBzKTtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEFyY2hpdmU7XG59KSgpO1xuXG5leHBvcnRzLkFyY2hpdmUgPSBBcmNoaXZlO1xuXG5mdW5jdGlvbiBhcnJheUZyb20oY3VscHJpdCkge1xuICByZXR1cm4gc2xpY2UoY3VscHJpdCk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZGVjb3JhdGluZyBvbmUgZnVuY3Rpb24gd2l0aCBhbm90aGVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgYmVmb3JlIHRoZVxuICogZGVjb3JhdGVkIG9uZS5cbiAqXG4gKiBAcGFyYW0gIHtmdW5jdGlvbn0gZGVjb3JhdG9yIC0gVGhlIGRlY29yYXRpbmcgZnVuY3Rpb24uXG4gKiBAcGFyYW0gIHtmdW5jdGlvbn0gZm4gICAgICAgIC0gVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlLlxuICogQHJldHVybiB7ZnVuY3Rpb259ICAgICAgICAgICAtIFRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24uXG4gKi9cblxuZnVuY3Rpb24gYmVmb3JlKGRlY29yYXRvciwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBkZWNvcmF0b3IuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICBmbi5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGNsb25pbmcgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbi4gU3VwcG9ydHMgYHlgIGFuZCBgdWAgZmxhZ3NcbiAqIGFscmVhZHkuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSByZSAtIFRoZSB0YXJnZXQgcmVndWxhciBleHByZXNzaW9uLlxuICogQHJldHVybiB7UmVnRXhwfSAgICAtIFRoZSBjbG9uZWQgcmVndWxhciBleHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ2V4cChyZSkge1xuICB2YXIgcGF0dGVybiA9IHJlLnNvdXJjZTtcblxuICB2YXIgZmxhZ3MgPSAnJztcblxuICBpZiAocmUuZ2xvYmFsKSBmbGFncyArPSAnZyc7XG4gIGlmIChyZS5tdWx0aWxpbmUpIGZsYWdzICs9ICdtJztcbiAgaWYgKHJlLmlnbm9yZUNhc2UpIGZsYWdzICs9ICdpJztcbiAgaWYgKHJlLnN0aWNreSkgZmxhZ3MgKz0gJ3knO1xuICBpZiAocmUudW5pY29kZSkgZmxhZ3MgKz0gJ3UnO1xuXG4gIHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4sIGZsYWdzKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBjbG9uaW5nIHRoZSBnaXZlbiB2YXJpYWJsZS5cbiAqXG4gKiBAdG9kbzogaW1wbGVtZW50IGEgZmFzdGVyIHdheSB0byBjbG9uZSBhbiBhcnJheS5cbiAqXG4gKiBAcGFyYW0gIHtib29sZWFufSBkZWVwIC0gU2hvdWxkIHdlIGRlZXAgY2xvbmUgdGhlIHZhcmlhYmxlLlxuICogQHBhcmFtICB7bWl4ZWR9ICAgaXRlbSAtIFRoZSB2YXJpYWJsZSB0byBjbG9uZVxuICogQHJldHVybiB7bWl4ZWR9ICAgICAgICAtIFRoZSBjbG9uZWQgdmFyaWFibGUuXG4gKi9cbmZ1bmN0aW9uIGNsb25lcihkZWVwLCBpdGVtKSB7XG4gIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbSAhPT0gJ29iamVjdCcgfHwgaXRlbSBpbnN0YW5jZW9mIEVycm9yIHx8IGl0ZW0gaW5zdGFuY2VvZiBfbW9ua2V5Lk1vbmtleURlZmluaXRpb24gfHwgJ0FycmF5QnVmZmVyJyBpbiBnbG9iYWwgJiYgaXRlbSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSByZXR1cm4gaXRlbTtcblxuICAvLyBBcnJheVxuICBpZiAoX3R5cGUyWydkZWZhdWx0J10uYXJyYXkoaXRlbSkpIHtcbiAgICBpZiAoZGVlcCkge1xuICAgICAgdmFyIGEgPSBbXTtcblxuICAgICAgdmFyIGkgPSB1bmRlZmluZWQsXG4gICAgICAgICAgbCA9IHVuZGVmaW5lZDtcblxuICAgICAgZm9yIChpID0gMCwgbCA9IGl0ZW0ubGVuZ3RoOyBpIDwgbDsgaSsrKSBhLnB1c2goY2xvbmVyKHRydWUsIGl0ZW1baV0pKTtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIHJldHVybiBzbGljZShpdGVtKTtcbiAgfVxuXG4gIC8vIERhdGVcbiAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gbmV3IERhdGUoaXRlbS5nZXRUaW1lKCkpO1xuXG4gIC8vIFJlZ0V4cFxuICBpZiAoaXRlbSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIGNsb25lUmVnZXhwKGl0ZW0pO1xuXG4gIC8vIE9iamVjdFxuICBpZiAoX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KGl0ZW0pKSB7XG4gICAgdmFyIG8gPSB7fTtcblxuICAgIHZhciBrID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gTk9URTogY291bGQgYmUgcG9zc2libGUgdG8gZXJhc2UgY29tcHV0ZWQgcHJvcGVydGllcyB0aHJvdWdoIGBudWxsYC5cbiAgICBmb3IgKGsgaW4gaXRlbSkge1xuICAgICAgaWYgKF90eXBlMlsnZGVmYXVsdCddLmxhenlHZXR0ZXIoaXRlbSwgaykpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGssIHtcbiAgICAgICAgICBnZXQ6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXRlbSwgaykuZ2V0LFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChpdGVtLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgIG9ba10gPSBkZWVwID8gY2xvbmVyKHRydWUsIGl0ZW1ba10pIDogaXRlbVtrXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG87XG4gIH1cblxuICByZXR1cm4gaXRlbTtcbn1cblxuLyoqXG4gKiBFeHBvcnRpbmcgc2hhbGxvdyBhbmQgZGVlcCBjbG9uaW5nIGZ1bmN0aW9ucy5cbiAqL1xudmFyIHNoYWxsb3dDbG9uZSA9IGNsb25lci5iaW5kKG51bGwsIGZhbHNlKSxcbiAgICBkZWVwQ2xvbmUgPSBjbG9uZXIuYmluZChudWxsLCB0cnVlKTtcblxuZXhwb3J0cy5zaGFsbG93Q2xvbmUgPSBzaGFsbG93Q2xvbmU7XG5leHBvcnRzLmRlZXBDbG9uZSA9IGRlZXBDbG9uZTtcblxuLyoqXG4gKiBDb2VyY2UgdGhlIGdpdmVuIHZhcmlhYmxlIGludG8gYSBmdWxsLWZsZWRnZWQgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHttaXhlZH0gdGFyZ2V0IC0gVGhlIHZhcmlhYmxlIHRvIGNvZXJjZS5cbiAqIEByZXR1cm4ge2FycmF5fSAgICAgICAgLSBUaGUgYXJyYXkgcGF0aC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2VQYXRoKHRhcmdldCkge1xuICBpZiAodGFyZ2V0IHx8IHRhcmdldCA9PT0gMCB8fCB0YXJnZXQgPT09ICcnKSByZXR1cm4gdGFyZ2V0O1xuICByZXR1cm4gW107XG59XG5cbi8qKlxuICogRnVuY3Rpb24gY29tcGFyaW5nIGFuIG9iamVjdCdzIHByb3BlcnRpZXMgdG8gYSBnaXZlbiBkZXNjcmlwdGl2ZVxuICogb2JqZWN0LlxuICpcbiAqIEBwYXJhbSAge29iamVjdH0gb2JqZWN0ICAgICAgLSBUaGUgb2JqZWN0IHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gIHtvYmplY3R9IGRlc2NyaXB0aW9uIC0gVGhlIGRlc2NyaXB0aW9uJ3MgbWFwcGluZy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59ICAgICAgICAgICAgLSBXaGV0aGVyIHRoZSBvYmplY3QgbWF0Y2hlcyB0aGUgZGVzY3JpcHRpb24uXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmUob2JqZWN0LCBkZXNjcmlwdGlvbikge1xuICB2YXIgb2sgPSB0cnVlLFxuICAgICAgayA9IHVuZGVmaW5lZDtcblxuICAvLyBJZiB3ZSByZWFjaGVkIGhlcmUgdmlhIGEgcmVjdXJzaXZlIGNhbGwsIG9iamVjdCBtYXkgYmUgdW5kZWZpbmVkIGJlY2F1c2VcbiAgLy8gbm90IGFsbCBpdGVtcyBpbiBhIGNvbGxlY3Rpb24gd2lsbCBoYXZlIHRoZSBzYW1lIGRlZXAgbmVzdGluZyBzdHJ1Y3R1cmUuXG4gIGlmICghb2JqZWN0KSByZXR1cm4gZmFsc2U7XG5cbiAgZm9yIChrIGluIGRlc2NyaXB0aW9uKSB7XG4gICAgaWYgKF90eXBlMlsnZGVmYXVsdCddLm9iamVjdChkZXNjcmlwdGlvbltrXSkpIHtcbiAgICAgIG9rID0gb2sgJiYgY29tcGFyZShvYmplY3Rba10sIGRlc2NyaXB0aW9uW2tdKTtcbiAgICB9IGVsc2UgaWYgKF90eXBlMlsnZGVmYXVsdCddLmFycmF5KGRlc2NyaXB0aW9uW2tdKSkge1xuICAgICAgb2sgPSBvayAmJiAhISB+ZGVzY3JpcHRpb25ba10uaW5kZXhPZihvYmplY3Rba10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob2JqZWN0W2tdICE9PSBkZXNjcmlwdGlvbltrXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvaztcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBmcmVlemluZyB0aGUgZ2l2ZW4gdmFyaWFibGUgaWYgcG9zc2libGUuXG4gKlxuICogQHBhcmFtICB7Ym9vbGVhbn0gZGVlcCAtIFNob3VsZCB3ZSByZWN1cnNpdmVseSBmcmVlemUgdGhlIGdpdmVuIG9iamVjdHM/XG4gKiBAcGFyYW0gIHtvYmplY3R9ICBvICAgIC0gVGhlIHZhcmlhYmxlIHRvIGZyZWV6ZS5cbiAqIEByZXR1cm4ge29iamVjdH0gICAgLSBUaGUgbWVyZ2VkIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gZnJlZXplcihkZWVwLCBvKSB7XG4gIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcgfHwgbyA9PT0gbnVsbCB8fCBvIGluc3RhbmNlb2YgX21vbmtleS5Nb25rZXkpIHJldHVybjtcblxuICBPYmplY3QuZnJlZXplKG8pO1xuXG4gIGlmICghZGVlcCkgcmV0dXJuO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KG8pKSB7XG5cbiAgICAvLyBJdGVyYXRpbmcgdGhyb3VnaCB0aGUgZWxlbWVudHNcbiAgICB2YXIgaSA9IHVuZGVmaW5lZCxcbiAgICAgICAgbCA9IHVuZGVmaW5lZDtcblxuICAgIGZvciAoaSA9IDAsIGwgPSBvLmxlbmd0aDsgaSA8IGw7IGkrKykgZnJlZXplcih0cnVlLCBvW2ldKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcCA9IHVuZGVmaW5lZCxcbiAgICAgICAgayA9IHVuZGVmaW5lZDtcblxuICAgIGZvciAoayBpbiBvKSB7XG4gICAgICBpZiAoX3R5cGUyWydkZWZhdWx0J10ubGF6eUdldHRlcihvLCBrKSkgY29udGludWU7XG5cbiAgICAgIHAgPSBvW2tdO1xuXG4gICAgICBpZiAoIXAgfHwgIW8uaGFzT3duUHJvcGVydHkoaykgfHwgdHlwZW9mIHAgIT09ICdvYmplY3QnIHx8IE9iamVjdC5pc0Zyb3plbihwKSkgY29udGludWU7XG5cbiAgICAgIGZyZWV6ZXIodHJ1ZSwgcCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhwb3J0aW5nIGJvdGggYGZyZWV6ZWAgYW5kIGBkZWVwRnJlZXplYCBmdW5jdGlvbnMuXG4gKiBOb3RlIHRoYXQgaWYgdGhlIGVuZ2luZSBkb2VzIG5vdCBzdXBwb3J0IGBPYmplY3QuZnJlZXplYCB0aGVuIHRoaXMgd2lsbFxuICogZXhwb3J0IG5vb3AgZnVuY3Rpb25zIGluc3RlYWQuXG4gKi9cbnZhciBpc0ZyZWV6ZVN1cHBvcnRlZCA9IHR5cGVvZiBPYmplY3QuZnJlZXplID09PSAnZnVuY3Rpb24nO1xuXG52YXIgZnJlZXplID0gaXNGcmVlemVTdXBwb3J0ZWQgPyBmcmVlemVyLmJpbmQobnVsbCwgZmFsc2UpIDogbm9vcCxcbiAgICBkZWVwRnJlZXplID0gaXNGcmVlemVTdXBwb3J0ZWQgPyBmcmVlemVyLmJpbmQobnVsbCwgdHJ1ZSkgOiBub29wO1xuXG5leHBvcnRzLmZyZWV6ZSA9IGZyZWV6ZTtcbmV4cG9ydHMuZGVlcEZyZWV6ZSA9IGRlZXBGcmVlemU7XG5cbi8qKlxuICogRnVuY3Rpb24gcmV0cmlldmluZyBuZXN0ZWQgZGF0YSB3aXRoaW4gdGhlIGdpdmVuIG9iamVjdCBhbmQgYWNjb3JkaW5nIHRvXG4gKiB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBAdG9kbzogd29yayBpZiBkeW5hbWljIHBhdGggaGl0IG9iamVjdHMgYWxzby5cbiAqIEB0b2RvOiBtZW1vaXplZCBwZXJmZ2V0dGVycy5cbiAqXG4gKiBAcGFyYW0gIHtvYmplY3R9ICBvYmplY3QgLSBUaGUgb2JqZWN0IHdlIG5lZWQgdG8gZ2V0IGRhdGEgZnJvbS5cbiAqIEBwYXJhbSAge2FycmF5fSAgIHBhdGggICAtIFRoZSBwYXRoIHRvIGZvbGxvdy5cbiAqIEByZXR1cm4ge29iamVjdH0gIHJlc3VsdCAgICAgICAgICAgIC0gVGhlIHJlc3VsdC5cbiAqIEByZXR1cm4ge21peGVkfSAgIHJlc3VsdC5kYXRhICAgICAgIC0gVGhlIGRhdGEgYXQgcGF0aCwgb3IgYHVuZGVmaW5lZGAuXG4gKiBAcmV0dXJuIHthcnJheX0gICByZXN1bHQuc29sdmVkUGF0aCAtIFRoZSBzb2x2ZWQgcGF0aCBvciBgbnVsbGAuXG4gKiBAcmV0dXJuIHtib29sZWFufSByZXN1bHQuZXhpc3RzICAgICAtIERvZXMgdGhlIHBhdGggZXhpc3RzIGluIHRoZSB0cmVlP1xuICovXG52YXIgbm90Rm91bmRPYmplY3QgPSB7IGRhdGE6IHVuZGVmaW5lZCwgc29sdmVkUGF0aDogbnVsbCwgZXhpc3RzOiBmYWxzZSB9O1xuXG5mdW5jdGlvbiBnZXRJbihvYmplY3QsIHBhdGgpIHtcbiAgaWYgKCFwYXRoKSByZXR1cm4gbm90Rm91bmRPYmplY3Q7XG5cbiAgdmFyIHNvbHZlZFBhdGggPSBbXTtcblxuICB2YXIgZXhpc3RzID0gdHJ1ZSxcbiAgICAgIGMgPSBvYmplY3QsXG4gICAgICBpZHggPSB1bmRlZmluZWQsXG4gICAgICBpID0gdW5kZWZpbmVkLFxuICAgICAgbCA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGkgPSAwLCBsID0gcGF0aC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoIWMpIHJldHVybiB7IGRhdGE6IHVuZGVmaW5lZCwgc29sdmVkUGF0aDogcGF0aCwgZXhpc3RzOiBmYWxzZSB9O1xuXG4gICAgaWYgKHR5cGVvZiBwYXRoW2ldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoIV90eXBlMlsnZGVmYXVsdCddLmFycmF5KGMpKSByZXR1cm4gbm90Rm91bmRPYmplY3Q7XG5cbiAgICAgIGlkeCA9IGluZGV4KGMsIHBhdGhbaV0pO1xuICAgICAgaWYgKCEgfmlkeCkgcmV0dXJuIG5vdEZvdW5kT2JqZWN0O1xuXG4gICAgICBzb2x2ZWRQYXRoLnB1c2goaWR4KTtcbiAgICAgIGMgPSBjW2lkeF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGF0aFtpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10uYXJyYXkoYykpIHJldHVybiBub3RGb3VuZE9iamVjdDtcblxuICAgICAgaWR4ID0gaW5kZXgoYywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmUoZSwgcGF0aFtpXSk7XG4gICAgICB9KTtcbiAgICAgIGlmICghIH5pZHgpIHJldHVybiBub3RGb3VuZE9iamVjdDtcblxuICAgICAgc29sdmVkUGF0aC5wdXNoKGlkeCk7XG4gICAgICBjID0gY1tpZHhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBzb2x2ZWRQYXRoLnB1c2gocGF0aFtpXSk7XG4gICAgICBleGlzdHMgPSB0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgcGF0aFtpXSBpbiBjO1xuICAgICAgYyA9IGNbcGF0aFtpXV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgZGF0YTogYywgc29sdmVkUGF0aDogc29sdmVkUGF0aCwgZXhpc3RzOiBleGlzdHMgfTtcbn1cblxuLyoqXG4gKiBMaXR0bGUgaGVscGVyIHJldHVybmluZyBhIEphdmFTY3JpcHQgZXJyb3IgY2Fycnlpbmcgc29tZSBkYXRhIHdpdGggaXQuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0gIHtvYmplY3R9IFtkYXRhXSAgLSBPcHRpb25hbCBkYXRhIHRvIGFzc2lnbiB0byB0aGUgZXJyb3IuXG4gKiBAcmV0dXJuIHtFcnJvcn0gICAgICAgICAgLSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xuXG5mdW5jdGlvbiBtYWtlRXJyb3IobWVzc2FnZSwgZGF0YSkge1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuXG4gIGZvciAodmFyIGsgaW4gZGF0YSkge1xuICAgIGVycltrXSA9IGRhdGFba107XG4gIH1yZXR1cm4gZXJyO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRha2luZyBuIG9iamVjdHMgdG8gbWVyZ2UgdGhlbSB0b2dldGhlci5cbiAqIE5vdGUgMSk6IHRoZSBsYXR0ZXIgb2JqZWN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhlIGZpcnN0IG9uZS5cbiAqIE5vdGUgMik6IHRoZSBmaXJzdCBvYmplY3Qgd2lsbCBiZSBtdXRhdGVkIHRvIGFsbG93IGZvciBwZXJmIHNjZW5hcmlvcy5cbiAqIE5vdGUgMyk6IHRoaXMgZnVuY3Rpb24gd2lsbCBjb25zaWRlciBtb25rZXlzIGFzIGxlYXZlcy5cbiAqXG4gKiBAcGFyYW0gIHtib29sZWFufSAgIGRlZXAgICAgLSBXaGV0aGVyIHRoZSBtZXJnZSBzaG91bGQgYmUgZGVlcCBvciBub3QuXG4gKiBAcGFyYW0gIHsuLi5vYmplY3R9IG9iamVjdHMgLSBPYmplY3RzIHRvIG1lcmdlLlxuICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgICAgIC0gVGhlIG1lcmdlZCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIG1lcmdlcihkZWVwKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBvYmplY3RzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIG9iamVjdHNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIG8gPSBvYmplY3RzWzBdO1xuXG4gIHZhciB0ID0gdW5kZWZpbmVkLFxuICAgICAgaSA9IHVuZGVmaW5lZCxcbiAgICAgIGwgPSB1bmRlZmluZWQsXG4gICAgICBrID0gdW5kZWZpbmVkO1xuXG4gIGZvciAoaSA9IDEsIGwgPSBvYmplY3RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHQgPSBvYmplY3RzW2ldO1xuXG4gICAgZm9yIChrIGluIHQpIHtcbiAgICAgIGlmIChkZWVwICYmIF90eXBlMlsnZGVmYXVsdCddLm9iamVjdCh0W2tdKSAmJiAhKHRba10gaW5zdGFuY2VvZiBfbW9ua2V5Lk1vbmtleSkpIHtcbiAgICAgICAgb1trXSA9IG1lcmdlcih0cnVlLCBvW2tdIHx8IHt9LCB0W2tdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9ba10gPSB0W2tdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvO1xufVxuXG4vKipcbiAqIEV4cG9ydGluZyBib3RoIGBzaGFsbG93TWVyZ2VgIGFuZCBgZGVlcE1lcmdlYCBmdW5jdGlvbnMuXG4gKi9cbnZhciBzaGFsbG93TWVyZ2UgPSBtZXJnZXIuYmluZChudWxsLCBmYWxzZSksXG4gICAgZGVlcE1lcmdlID0gbWVyZ2VyLmJpbmQobnVsbCwgdHJ1ZSk7XG5cbmV4cG9ydHMuc2hhbGxvd01lcmdlID0gc2hhbGxvd01lcmdlO1xuZXhwb3J0cy5kZWVwTWVyZ2UgPSBkZWVwTWVyZ2U7XG5cbi8qKlxuICogU29sdmluZyBhIHBvdGVudGlhbGx5IHJlbGF0aXZlIHBhdGguXG4gKlxuICogQHBhcmFtICB7YXJyYXl9IGJhc2UgLSBUaGUgYmFzZSBwYXRoIGZyb20gd2hpY2ggdG8gc29sdmUgdGhlIHBhdGguXG4gKiBAcGFyYW0gIHthcnJheX0gdG8gICAtIFRoZSBzdWJwYXRoIHRvIHJlYWNoLlxuICogQHBhcmFtICB7YXJyYXl9ICAgICAgLSBUaGUgc29sdmVkIGFic29sdXRlIHBhdGguXG4gKi9cblxuZnVuY3Rpb24gc29sdmVSZWxhdGl2ZVBhdGgoYmFzZSwgdG8pIHtcbiAgdmFyIHNvbHZlZFBhdGggPSBbXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHRvLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBzdGVwID0gdG9baV07XG5cbiAgICBpZiAoc3RlcCA9PT0gJy4nKSB7XG4gICAgICBpZiAoIWkpIHNvbHZlZFBhdGggPSBiYXNlLnNsaWNlKDApO1xuICAgIH0gZWxzZSBpZiAoc3RlcCA9PT0gJy4uJykge1xuICAgICAgc29sdmVkUGF0aCA9ICghaSA/IGJhc2UgOiBzb2x2ZWRQYXRoKS5zbGljZSgwLCAtMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvbHZlZFBhdGgucHVzaChzdGVwKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29sdmVkUGF0aDtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBkZXRlcm1pbmluZyB3aGV0aGVyIHNvbWUgcGF0aHMgaW4gdGhlIHRyZWUgd2VyZSBhZmZlY3RlZCBieSBzb21lXG4gKiB1cGRhdGVzIHRoYXQgb2NjdXJyZWQgYXQgdGhlIGdpdmVuIHBhdGhzLiBUaGlzIGhlbHBlciBpcyBtYWlubHkgdXNlZCBhdFxuICogY3Vyc29yIGxldmVsIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBjdXJzb3IgaXMgY29uY2VybmVkIGJ5IHRoZSB1cGRhdGVzXG4gKiBmaXJlZCBhdCB0cmVlIGxldmVsLlxuICpcbiAqIE5PVEVTOiAxKSBJZiBwZXJmb3JtYW5jZSBiZWNvbWUgYW4gaXNzdWUsIHRoZSBmb2xsb3dpbmcgdGhyZWVmb2xkIGxvb3BcbiAqICAgICAgICAgICBjYW4gYmUgc2ltcGxpZmllZCB0byBhIGNvbXBsZXggdHdvZm9sZCBvbmUuXG4gKiAgICAgICAgMikgQSByZWdleCB2ZXJzaW9uIGNvdWxkIGFsc28gd29yayBidXQgSSBhbSBub3QgY29uZmlkZW50IGl0IHdvdWxkXG4gKiAgICAgICAgICAgYmUgZmFzdGVyLlxuICogICAgICAgIDMpIEFub3RoZXIgc29sdXRpb24gd291bGQgYmUgdG8ga2VlcCBhIHJlZ2lzdGVyIG9mIGN1cnNvcnMgbGlrZSB3aXRoXG4gKiAgICAgICAgICAgdGhlIG1vbmtleXMgYW5kIHVwZGF0ZSBhbG9uZyB0aGlzIHRyZWUuXG4gKlxuICogQHBhcmFtICB7YXJyYXl9IGFmZmVjdGVkUGF0aHMgLSBUaGUgcGF0aHMgdGhhdCB3ZXJlIHVwZGF0ZWQuXG4gKiBAcGFyYW0gIHthcnJheX0gY29tcGFyZWRQYXRocyAtIFRoZSBwYXRocyB0aGF0IHdlIGFyZSBhY3R1YWxseSBpbnRlcmVzdGVkIGluLlxuICogQHJldHVybiB7Ym9vbGVhbn0gICAgICAgICAgICAgLSBJcyB0aGUgdXBkYXRlIHJlbGV2YW50IHRvIHRoZSBjb21wYXJlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRocz9cbiAqL1xuXG5mdW5jdGlvbiBzb2x2ZVVwZGF0ZShhZmZlY3RlZFBhdGhzLCBjb21wYXJlZFBhdGhzKSB7XG4gIHZhciBpID0gdW5kZWZpbmVkLFxuICAgICAgaiA9IHVuZGVmaW5lZCxcbiAgICAgIGsgPSB1bmRlZmluZWQsXG4gICAgICBsID0gdW5kZWZpbmVkLFxuICAgICAgbSA9IHVuZGVmaW5lZCxcbiAgICAgIG4gPSB1bmRlZmluZWQsXG4gICAgICBwID0gdW5kZWZpbmVkLFxuICAgICAgYyA9IHVuZGVmaW5lZCxcbiAgICAgIHMgPSB1bmRlZmluZWQ7XG5cbiAgLy8gTG9vcGluZyB0aHJvdWdoIHBvc3NpYmxlIHBhdGhzXG4gIGZvciAoaSA9IDAsIGwgPSBhZmZlY3RlZFBhdGhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHAgPSBhZmZlY3RlZFBhdGhzW2ldO1xuXG4gICAgaWYgKCFwLmxlbmd0aCkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBMb29waW5nIHRocm91Z2ggbG9nZ2VkIHBhdGhzXG4gICAgZm9yIChqID0gMCwgbSA9IGNvbXBhcmVkUGF0aHMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICBjID0gY29tcGFyZWRQYXRoc1tqXTtcblxuICAgICAgaWYgKCFjIHx8ICFjLmxlbmd0aCkgcmV0dXJuIHRydWU7XG5cbiAgICAgIC8vIExvb3BpbmcgdGhyb3VnaCBzdGVwc1xuICAgICAgZm9yIChrID0gMCwgbiA9IGMubGVuZ3RoOyBrIDwgbjsgaysrKSB7XG4gICAgICAgIHMgPSBjW2tdO1xuXG4gICAgICAgIC8vIElmIHBhdGggaXMgbm90IHJlbGV2YW50LCB3ZSBicmVha1xuICAgICAgICAvLyBOT1RFOiB0aGUgJyE9JyBpbnN0ZWFkIG9mICchPT0nIGlzIHJlcXVpcmVkIGhlcmUhXG4gICAgICAgIGlmIChzICE9IHBba10pIGJyZWFrO1xuXG4gICAgICAgIC8vIElmIHdlIHJlYWNoZWQgbGFzdCBpdGVtIGFuZCB3ZSBhcmUgcmVsZXZhbnRcbiAgICAgICAgaWYgKGsgKyAxID09PSBuIHx8IGsgKyAxID09PSBwLmxlbmd0aCkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIE5vbi1tdXRhdGl2ZSB2ZXJzaW9uIG9mIHRoZSBzcGxpY2UgYXJyYXkgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7YXJyYXl9ICAgIGFycmF5ICAgICAgICAtIFRoZSBhcnJheSB0byBzcGxpY2UuXG4gKiBAcGFyYW0ge2ludGVnZXJ9ICBzdGFydEluZGV4ICAgLSBUaGUgc3RhcnQgaW5kZXguXG4gKiBAcGFyYW0ge2ludGVnZXJ9ICBuYiAgICAgICAgICAgLSBOdW1iZXIgb2YgZWxlbWVudHMgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHsuLi5taXhlZH0gZWxlbWVudHMgICAgIC0gRWxlbWVudHMgdG8gYXBwZW5kIGFmdGVyIHNwbGljaW5nLlxuICogQHJldHVybiB7YXJyYXl9ICAgICAgICAgICAgICAgIC0gVGhlIHNwbGljZWQgYXJyYXkuXG4gKi9cblxuZnVuY3Rpb24gc3BsaWNlKGFycmF5LCBzdGFydEluZGV4LCBuYikge1xuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGVsZW1lbnRzID0gQXJyYXkoX2xlbjIgPiAzID8gX2xlbjIgLSAzIDogMCksIF9rZXkyID0gMzsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgIGVsZW1lbnRzW19rZXkyIC0gM10gPSBhcmd1bWVudHNbX2tleTJdO1xuICB9XG5cbiAgcmV0dXJuIGFycmF5LnNsaWNlKDAsIHN0YXJ0SW5kZXgpLmNvbmNhdChlbGVtZW50cykuY29uY2F0KGFycmF5LnNsaWNlKHN0YXJ0SW5kZXggKyBNYXRoLm1heCgwLCBuYikpKTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiByZXR1cm5pbmcgYSB1bmlxdWUgaW5jcmVtZW50YWwgaWQgZWFjaCB0aW1lIGl0IGlzIGNhbGxlZC5cbiAqXG4gKiBAcmV0dXJuIHtpbnRlZ2VyfSAtIFRoZSBsYXRlc3QgdW5pcXVlIGlkLlxuICovXG52YXIgdW5pcWlkID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIGkgPSAwO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGkrKztcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMudW5pcWlkID0gdW5pcWlkOyIsIi8qKlxuICogQmFvYmFiIE1vbmtleXNcbiAqID09PT09PT09PT09PT09PVxuICpcbiAqIEV4cG9zaW5nIGJvdGggaGFuZHkgbW9ua2V5IGRlZmluaXRpb25zIGFuZCB0aGUgdW5kZXJseWluZyB3b3JraW5nIGNsYXNzLlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3R5cGUgPSByZXF1aXJlKCcuL3R5cGUnKTtcblxudmFyIF90eXBlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGUpO1xuXG52YXIgX3VwZGF0ZTIgPSByZXF1aXJlKCcuL3VwZGF0ZScpO1xuXG52YXIgX3VwZGF0ZTMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF91cGRhdGUyKTtcblxudmFyIF9oZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbi8qKlxuICogTW9ua2V5IERlZmluaXRpb24gY2xhc3NcbiAqIE5vdGU6IFRoZSBvbmx5IHJlYXNvbiB3aHkgdGhpcyBpcyBhIGNsYXNzIGlzIHRvIGJlIGFibGUgdG8gc3BvdCBpdCB3aXRoaW5cbiAqIG90aGVyd2lzZSBvcmRpbmFyeSBkYXRhLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHthcnJheXxvYmplY3R9IGRlZmluaXRpb24gLSBUaGUgZm9ybWFsIGRlZmluaXRpb24gb2YgdGhlIG1vbmtleS5cbiAqL1xuXG52YXIgTW9ua2V5RGVmaW5pdGlvbiA9IGZ1bmN0aW9uIE1vbmtleURlZmluaXRpb24oZGVmaW5pdGlvbikge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb25rZXlEZWZpbml0aW9uKTtcblxuICB2YXIgbW9ua2V5VHlwZSA9IF90eXBlMlsnZGVmYXVsdCddLm1vbmtleURlZmluaXRpb24oZGVmaW5pdGlvbik7XG5cbiAgaWYgKCFtb25rZXlUeXBlKSB0aHJvdyAoMCwgX2hlbHBlcnMubWFrZUVycm9yKSgnQmFvYmFiLm1vbmtleTogaW52YWxpZCBkZWZpbml0aW9uLicsIHsgZGVmaW5pdGlvbjogZGVmaW5pdGlvbiB9KTtcblxuICB0aGlzLnR5cGUgPSBtb25rZXlUeXBlO1xuXG4gIGlmICh0aGlzLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgdGhpcy5nZXR0ZXIgPSBkZWZpbml0aW9uLmdldDtcbiAgICB0aGlzLnByb2plY3Rpb24gPSBkZWZpbml0aW9uLmN1cnNvcnMgfHwge307XG4gICAgdGhpcy5wYXRocyA9IE9iamVjdC5rZXlzKHRoaXMucHJvamVjdGlvbikubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gX3RoaXMucHJvamVjdGlvbltrXTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmdldHRlciA9IGRlZmluaXRpb25bZGVmaW5pdGlvbi5sZW5ndGggLSAxXTtcbiAgICB0aGlzLnByb2plY3Rpb24gPSBkZWZpbml0aW9uLnNsaWNlKDAsIC0xKTtcbiAgICB0aGlzLnBhdGhzID0gdGhpcy5wcm9qZWN0aW9uO1xuICB9XG5cbiAgdGhpcy5oYXNEeW5hbWljUGF0aHMgPSB0aGlzLnBhdGhzLnNvbWUoX3R5cGUyWydkZWZhdWx0J10uZHluYW1pY1BhdGgpO1xufVxuXG4vKipcbiAqIE1vbmtleSBjb3JlIGNsYXNzXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Jhb2JhYn0gICAgICAgICAgIHRyZWUgICAgICAgLSBUaGUgYm91bmQgdHJlZS5cbiAqIEBwYXJhbSB7TW9ua2V5RGVmaW5pdGlvbn0gZGVmaW5pdGlvbiAtIEEgZGVmaW5pdGlvbiBpbnN0YW5jZS5cbiAqL1xuO1xuXG5leHBvcnRzLk1vbmtleURlZmluaXRpb24gPSBNb25rZXlEZWZpbml0aW9uO1xuXG52YXIgTW9ua2V5ID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTW9ua2V5KHRyZWUsIHBhdGhJblRyZWUsIGRlZmluaXRpb24pIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNb25rZXkpO1xuXG4gICAgLy8gUHJvcGVydGllc1xuICAgIHRoaXMudHJlZSA9IHRyZWU7XG4gICAgdGhpcy5wYXRoID0gcGF0aEluVHJlZTtcbiAgICB0aGlzLmRlZmluaXRpb24gPSBkZWZpbml0aW9uO1xuICAgIHRoaXMuaXNSZWN1cnNpdmUgPSBmYWxzZTtcblxuICAgIC8vIEFkYXB0aW5nIHRoZSBkZWZpbml0aW9uJ3MgcGF0aHMgJiBwcm9qZWN0aW9uIHRvIHRoaXMgbW9ua2V5J3MgY2FzZVxuICAgIHZhciBwcm9qZWN0aW9uID0gZGVmaW5pdGlvbi5wcm9qZWN0aW9uLFxuICAgICAgICByZWxhdGl2ZSA9IF9oZWxwZXJzLnNvbHZlUmVsYXRpdmVQYXRoLmJpbmQobnVsbCwgcGF0aEluVHJlZS5zbGljZSgwLCAtMSkpO1xuXG4gICAgaWYgKGRlZmluaXRpb24udHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHRoaXMucHJvamVjdGlvbiA9IE9iamVjdC5rZXlzKHByb2plY3Rpb24pLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBrKSB7XG4gICAgICAgIGFjY1trXSA9IHJlbGF0aXZlKHByb2plY3Rpb25ba10pO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgfSwge30pO1xuICAgICAgdGhpcy5kZXBQYXRocyA9IE9iamVjdC5rZXlzKHRoaXMucHJvamVjdGlvbikubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIucHJvamVjdGlvbltrXTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb2plY3Rpb24gPSBwcm9qZWN0aW9uLm1hcChyZWxhdGl2ZSk7XG4gICAgICB0aGlzLmRlcFBhdGhzID0gdGhpcy5wcm9qZWN0aW9uO1xuICAgIH1cblxuICAgIC8vIEludGVybmFsIHN0YXRlXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGtpbGxlZDogZmFsc2VcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGlzdGVuZXIgb24gdGhlIHRyZWUncyBgd3JpdGVgIGV2ZW50LlxuICAgICAqXG4gICAgICogV2hlbiB0aGUgdHJlZSB3cml0ZXMsIHRoaXMgbGlzdGVuZXIgd2lsbCBjaGVjayB3aGV0aGVyIHRoZSB1cGRhdGVkIHBhdGhzXG4gICAgICogYXJlIG9mIGFueSB1c2UgdG8gdGhlIG1vbmtleSBhbmQsIGlmIHNvLCB3aWxsIHVwZGF0ZSB0aGUgdHJlZSdzIG5vZGVcbiAgICAgKiB3aGVyZSB0aGUgbW9ua2V5IHNpdHMgd2l0aCBhIGxhenkgZ2V0dGVyLlxuICAgICAqL1xuICAgIHRoaXMubGlzdGVuZXIgPSBmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIHBhdGggPSBfcmVmLmRhdGEucGF0aDtcblxuICAgICAgaWYgKF90aGlzMi5zdGF0ZS5raWxsZWQpIHJldHVybjtcblxuICAgICAgLy8gSXMgdGhlIG1vbmtleSBhZmZlY3RlZCBieSB0aGUgY3VycmVudCB3cml0ZSBldmVudD9cbiAgICAgIHZhciBjb25jZXJuZWQgPSAoMCwgX2hlbHBlcnMuc29sdmVVcGRhdGUpKFtwYXRoXSwgX3RoaXMyLnJlbGF0ZWRQYXRocygpKTtcblxuICAgICAgaWYgKGNvbmNlcm5lZCkgX3RoaXMyLnVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICAvLyBCaW5kaW5nIGxpc3RlbmVyXG4gICAgdGhpcy50cmVlLm9uKCd3cml0ZScsIHRoaXMubGlzdGVuZXIpO1xuXG4gICAgLy8gVXBkYXRpbmcgcmVsZXZhbnQgbm9kZVxuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRyaWdnZXJpbmcgYSByZWN1cnNpdml0eSBjaGVjay5cbiAgICpcbiAgICogQHJldHVybiB7TW9ua2V5fSAtIFJldHVybnMgaXRzZWxmIGZvciBjaGFpbmluZyBwdXJwb3Nlcy5cbiAgICovXG5cbiAgX2NyZWF0ZUNsYXNzKE1vbmtleSwgW3tcbiAgICBrZXk6ICdjaGVja1JlY3Vyc2l2aXR5JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tSZWN1cnNpdml0eSgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICB0aGlzLmlzUmVjdXJzaXZlID0gdGhpcy5kZXBQYXRocy5zb21lKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiAhIV90eXBlMlsnZGVmYXVsdCddLm1vbmtleVBhdGgoX3RoaXMzLnRyZWUuX21vbmtleXMsIHApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFB1dHRpbmcgdGhlIHJlY3Vyc2l2ZSBtb25rZXlzJyBsaXN0ZW5lcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RhY2tcbiAgICAgIC8vIE5PVEU6IHRoaXMgaXMgYSBkaXJ0eSBoYWNrIGFuZCBhIG1vcmUgdGhvcm91Z2ggc29sdXRpb24gc2hvdWxkIGJlIGZvdW5kXG4gICAgICBpZiAodGhpcy5pc1JlY3Vyc2l2ZSkge1xuICAgICAgICB0aGlzLnRyZWUub2ZmKCd3cml0ZScsIHRoaXMubGlzdGVuZXIpO1xuICAgICAgICB0aGlzLnRyZWUub24oJ3dyaXRlJywgdGhpcy5saXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCByZXR1cm5pbmcgc29sdmVkIHBhdGhzIHJlbGF0ZWQgdG8gdGhlIG1vbmtleS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge2FycmF5fSAtIEFuIGFycmF5IG9mIHJlbGF0ZWQgcGF0aHMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZWxhdGVkUGF0aHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWxhdGVkUGF0aHMoKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgdmFyIHBhdGhzID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAodGhpcy5kZWZpbml0aW9uLmhhc0R5bmFtaWNQYXRocykgcGF0aHMgPSB0aGlzLmRlcFBhdGhzLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gKDAsIF9oZWxwZXJzLmdldEluKShfdGhpczQudHJlZS5fZGF0YSwgcCkuc29sdmVkUGF0aDtcbiAgICAgIH0pO2Vsc2UgcGF0aHMgPSB0aGlzLmRlcFBhdGhzO1xuXG4gICAgICBpZiAoIXRoaXMuaXNSZWN1cnNpdmUpIHJldHVybiBwYXRocztcblxuICAgICAgcmV0dXJuIHBhdGhzLnJlZHVjZShmdW5jdGlvbiAoYWNjdW11bGF0ZWRQYXRocywgcGF0aCkge1xuICAgICAgICB2YXIgbW9ua2V5UGF0aCA9IF90eXBlMlsnZGVmYXVsdCddLm1vbmtleVBhdGgoX3RoaXM0LnRyZWUuX21vbmtleXMsIHBhdGgpO1xuXG4gICAgICAgIGlmICghbW9ua2V5UGF0aCkgcmV0dXJuIGFjY3VtdWxhdGVkUGF0aHMuY29uY2F0KFtwYXRoXSk7XG5cbiAgICAgICAgLy8gU29sdmluZyByZWN1cnNpdmUgcGF0aFxuICAgICAgICB2YXIgcmVsYXRlZE1vbmtleSA9ICgwLCBfaGVscGVycy5nZXRJbikoX3RoaXM0LnRyZWUuX21vbmtleXMsIG1vbmtleVBhdGgpLmRhdGE7XG5cbiAgICAgICAgcmV0dXJuIGFjY3VtdWxhdGVkUGF0aHMuY29uY2F0KHJlbGF0ZWRNb25rZXkucmVsYXRlZFBhdGhzKCkpO1xuICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB1c2VkIHRvIHVwZGF0ZSB0aGUgdHJlZSdzIGludGVybmFsIGRhdGEgd2l0aCBhIGxhenkgZ2V0dGVyIGhvbGRpbmdcbiAgICAgKiB0aGUgY29tcHV0ZWQgZGF0YS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge01vbmtleX0gLSBSZXR1cm5zIGl0c2VsZiBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICd1cGRhdGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICB2YXIgZGVwcyA9IHRoaXMudHJlZS5wcm9qZWN0KHRoaXMucHJvamVjdGlvbik7XG5cbiAgICAgIHZhciBsYXp5R2V0dGVyID0gKGZ1bmN0aW9uICh0cmVlLCBkZWYsIGRhdGEpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gbnVsbCxcbiAgICAgICAgICAgIGFscmVhZHlDb21wdXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICBpZiAoIWFscmVhZHlDb21wdXRlZCkge1xuICAgICAgICAgICAgY2FjaGUgPSBkZWYuZ2V0dGVyLmFwcGx5KHRyZWUsIGRlZi50eXBlID09PSAnb2JqZWN0JyA/IFtkYXRhXSA6IGRhdGEpO1xuXG4gICAgICAgICAgICAvLyBGcmVlemluZyBpZiByZXF1aXJlZFxuICAgICAgICAgICAgaWYgKHRyZWUub3B0aW9ucy5pbW11dGFibGUpICgwLCBfaGVscGVycy5kZWVwRnJlZXplKShjYWNoZSk7XG5cbiAgICAgICAgICAgIGFscmVhZHlDb21wdXRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNhY2hlO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcy50cmVlLCB0aGlzLmRlZmluaXRpb24sIGRlcHMpO1xuXG4gICAgICBsYXp5R2V0dGVyLmlzTGF6eUdldHRlciA9IHRydWU7XG5cbiAgICAgIC8vIElmIHRoZSB0cmVlIGRvZXMgbm90IGFjY2VwdCBsYXp5IG1vbmtleXMsIHdlIHNvbHZlIHRoZSBsYXp5IGdldHRlclxuICAgICAgaWYgKHRoaXMudHJlZS5vcHRpb25zLmxhenlNb25rZXlzKSB7XG4gICAgICAgIHRoaXMudHJlZS5fZGF0YSA9ICgwLCBfdXBkYXRlM1snZGVmYXVsdCddKSh0aGlzLnRyZWUuX2RhdGEsIHRoaXMucGF0aCwgeyB0eXBlOiAnbW9ua2V5JywgdmFsdWU6IGxhenlHZXR0ZXIgfSwgdGhpcy50cmVlLm9wdGlvbnMpLmRhdGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIF91cGRhdGUzWydkZWZhdWx0J10pKHRoaXMudHJlZS5fZGF0YSwgdGhpcy5wYXRoLCB7IHR5cGU6ICdzZXQnLCB2YWx1ZTogbGF6eUdldHRlcigpIH0sIHRoaXMudHJlZS5vcHRpb25zKTtcblxuICAgICAgICBpZiAoJ2RhdGEnIGluIHJlc3VsdCkgdGhpcy50cmVlLl9kYXRhID0gcmVzdWx0LmRhdGE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCByZWxlYXNpbmcgdGhlIG1vbmtleSBmcm9tIG1lbW9yeS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbGVhc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWxlYXNlKCkge1xuXG4gICAgICAvLyBVbmJpbmRpbmcgZXZlbnRzXG4gICAgICB0aGlzLnRyZWUub2ZmKCd3cml0ZScsIHRoaXMubGlzdGVuZXIpO1xuICAgICAgdGhpcy5zdGF0ZS5raWxsZWQgPSB0cnVlO1xuXG4gICAgICAvLyBEZWxldGluZyBwcm9wZXJ0aWVzXG4gICAgICAvLyBOT1RFOiBub3QgZGVsZXRpbmcgdGhpcy5kZWZpbml0aW9uIGJlY2F1c2Ugc29tZSBzdHJhbmdlIHRoaW5ncyBoYXBwZW5cbiAgICAgIC8vIGluIHRoZSBfcmVmcmVzaE1vbmtleXMgbWV0aG9kLiBTZWUgIzM3Mi5cbiAgICAgIGRlbGV0ZSB0aGlzLnByb2plY3Rpb247XG4gICAgICBkZWxldGUgdGhpcy5kZXBQYXRocztcbiAgICAgIGRlbGV0ZSB0aGlzLnRyZWU7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIE1vbmtleTtcbn0pKCk7XG5cbmV4cG9ydHMuTW9ua2V5ID0gTW9ua2V5OyIsIi8qKlxuICogQmFvYmFiIFR5cGUgQ2hlY2tpbmdcbiAqID09PT09PT09PT09PT09PT09PT09PVxuICpcbiAqIEhlbHBlcnMgZnVuY3Rpb25zIHVzZWQgdGhyb3VnaG91dCB0aGUgbGlicmFyeSB0byBwZXJmb3JtIHNvbWUgdHlwZVxuICogdGVzdHMgYXQgcnVudGltZS5cbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfbW9ua2V5ID0gcmVxdWlyZSgnLi9tb25rZXknKTtcblxudmFyIHR5cGUgPSB7fTtcblxuLyoqXG4gKiBIZWxwZXJzXG4gKiAtLS0tLS0tLVxuICovXG5cbi8qKlxuICogQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gdmFyaWFibGUgaXMgb2YgYW55IG9mIHRoZSBnaXZlbiB0eXBlcy5cbiAqXG4gKiBAdG9kbyAgIE9wdGltaXplIHRoaXMgZnVuY3Rpb24gYnkgZHJvcHBpbmcgYHNvbWVgLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSB0YXJnZXQgIC0gVmFyaWFibGUgdG8gdGVzdC5cbiAqIEBwYXJhbSAge2FycmF5fSBhbGxvd2VkIC0gQXJyYXkgb2YgYWxsb3dlZCB0eXBlcy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGFueU9mKHRhcmdldCwgYWxsb3dlZCkge1xuICByZXR1cm4gYWxsb3dlZC5zb21lKGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIHR5cGVbdF0odGFyZ2V0KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2ltcGxlIHR5cGVzXG4gKiAtLS0tLS0tLS0tLS0tXG4gKi9cblxuLyoqXG4gKiBDaGVja2luZyB3aGV0aGVyIHRoZSBnaXZlbiB2YXJpYWJsZSBpcyBhbiBhcnJheS5cbiAqXG4gKiBAcGFyYW0gIHttaXhlZH0gdGFyZ2V0IC0gVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbnR5cGUuYXJyYXkgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHRhcmdldCk7XG59O1xuXG4vKipcbiAqIENoZWNraW5nIHdoZXRoZXIgdGhlIGdpdmVuIHZhcmlhYmxlIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gIHttaXhlZH0gdGFyZ2V0IC0gVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbnR5cGUub2JqZWN0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICByZXR1cm4gdGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHRhcmdldCkgJiYgISh0YXJnZXQgaW5zdGFuY2VvZiBEYXRlKSAmJiAhKHRhcmdldCBpbnN0YW5jZW9mIFJlZ0V4cCkgJiYgISh0eXBlb2YgTWFwID09PSAnZnVuY3Rpb24nICYmIHRhcmdldCBpbnN0YW5jZW9mIE1hcCkgJiYgISh0eXBlb2YgU2V0ID09PSAnZnVuY3Rpb24nICYmIHRhcmdldCBpbnN0YW5jZW9mIFNldCk7XG59O1xuXG4vKipcbiAqIENoZWNraW5nIHdoZXRoZXIgdGhlIGdpdmVuIHZhcmlhYmxlIGlzIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSB0YXJnZXQgLSBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudHlwZS5zdHJpbmcgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIHJldHVybiB0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJztcbn07XG5cbi8qKlxuICogQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gdmFyaWFibGUgaXMgYSBudW1iZXIuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9IHRhcmdldCAtIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG50eXBlLm51bWJlciA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgcmV0dXJuIHR5cGVvZiB0YXJnZXQgPT09ICdudW1iZXInO1xufTtcblxuLyoqXG4gKiBDaGVja2luZyB3aGV0aGVyIHRoZSBnaXZlbiB2YXJpYWJsZSBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSB0YXJnZXQgLSBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudHlwZVsnZnVuY3Rpb24nXSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgcmV0dXJuIHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbic7XG59O1xuXG4vKipcbiAqIENoZWNraW5nIHdoZXRoZXIgdGhlIGdpdmVuIHZhcmlhYmxlIGlzIGEgSmF2YVNjcmlwdCBwcmltaXRpdmUuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9IHRhcmdldCAtIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG50eXBlLnByaW1pdGl2ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldCAhPT0gT2JqZWN0KHRhcmdldCk7XG59O1xuXG4vKipcbiAqIENvbXBsZXggdHlwZXNcbiAqIC0tLS0tLS0tLS0tLS0tXG4gKi9cblxuLyoqXG4gKiBDaGVja2luZyB3aGV0aGVyIHRoZSBnaXZlbiB2YXJpYWJsZSBpcyBhIHZhbGlkIHNwbGljZXIuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9IHRhcmdldCAgICAtIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcGFyYW0gIHthcnJheX0gW2FsbG93ZWRdIC0gT3B0aW9uYWwgdmFsaWQgdHlwZXMgaW4gcGF0aC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbnR5cGUuc3BsaWNlciA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgaWYgKCF0eXBlLmFycmF5KHRhcmdldCkgfHwgdGFyZ2V0Lmxlbmd0aCA8IDIpIHJldHVybiBmYWxzZTtcblxuICByZXR1cm4gYW55T2YodGFyZ2V0WzBdLCBbJ251bWJlcicsICdmdW5jdGlvbicsICdvYmplY3QnXSkgJiYgdHlwZS5udW1iZXIodGFyZ2V0WzFdKTtcbn07XG5cbi8qKlxuICogQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gdmFyaWFibGUgaXMgYSB2YWxpZCBjdXJzb3IgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHttaXhlZH0gdGFyZ2V0ICAgIC0gVmFyaWFibGUgdG8gdGVzdC5cbiAqIEBwYXJhbSAge2FycmF5fSBbYWxsb3dlZF0gLSBPcHRpb25hbCB2YWxpZCB0eXBlcyBpbiBwYXRoLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuXG4vLyBPcmRlciBpcyBpbXBvcnRhbnQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnNcbnZhciBBTExPV0VEX0ZPUl9QQVRIID0gWydzdHJpbmcnLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ29iamVjdCddO1xuXG50eXBlLnBhdGggPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0ICYmIHRhcmdldCAhPT0gMCAmJiB0YXJnZXQgIT09ICcnKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIFtdLmNvbmNhdCh0YXJnZXQpLmV2ZXJ5KGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgcmV0dXJuIGFueU9mKHN0ZXAsIEFMTE9XRURfRk9SX1BBVEgpO1xuICB9KTtcbn07XG5cbi8qKlxuICogQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gcGF0aCBpcyBhIGR5bmFtaWMgb25lLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSBwYXRoIC0gVGhlIHBhdGggdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbnR5cGUuZHluYW1pY1BhdGggPSBmdW5jdGlvbiAocGF0aCkge1xuICByZXR1cm4gcGF0aC5zb21lKGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgcmV0dXJuIHR5cGVbJ2Z1bmN0aW9uJ10oc3RlcCkgfHwgdHlwZS5vYmplY3Qoc3RlcCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZSBhbnkgbW9ua2V5IHN1YnBhdGggaW4gdGhlIGdpdmVuIHBhdGggb3IgbnVsbCBpZiB0aGUgcGF0aCBuZXZlciBjb21lc1xuICogYWNyb3NzIGNvbXB1dGVkIGRhdGEuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9IGRhdGEgLSBUaGUgZGF0YSB0byB0ZXN0LlxuICogQHBhcmFtICB7YXJyYXl9IHBhdGggLSBUaGUgcGF0aCB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xudHlwZS5tb25rZXlQYXRoID0gZnVuY3Rpb24gKGRhdGEsIHBhdGgpIHtcbiAgdmFyIHN1YnBhdGggPSBbXTtcblxuICB2YXIgYyA9IGRhdGEsXG4gICAgICBpID0gdW5kZWZpbmVkLFxuICAgICAgbCA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGkgPSAwLCBsID0gcGF0aC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBzdWJwYXRoLnB1c2gocGF0aFtpXSk7XG5cbiAgICBpZiAodHlwZW9mIGMgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbDtcblxuICAgIGMgPSBjW3BhdGhbaV1dO1xuXG4gICAgaWYgKGMgaW5zdGFuY2VvZiBfbW9ua2V5Lk1vbmtleSkgcmV0dXJuIHN1YnBhdGg7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGdpdmVuIG9iamVjdCBwcm9wZXJ0eSBpcyBhIGxhenkgZ2V0dGVyIHVzZWQgYnkgYSBtb25rZXkuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9ICAgbyAgICAgICAgICAgLSBUaGUgdGFyZ2V0IG9iamVjdC5cbiAqIEBwYXJhbSAge3N0cmluZ30gIHByb3BlcnR5S2V5IC0gVGhlIHByb3BlcnR5IHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG50eXBlLmxhenlHZXR0ZXIgPSBmdW5jdGlvbiAobywgcHJvcGVydHlLZXkpIHtcbiAgdmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG8sIHByb3BlcnR5S2V5KTtcblxuICByZXR1cm4gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmdldCAmJiBkZXNjcmlwdG9yLmdldC5pc0xhenlHZXR0ZXIgPT09IHRydWU7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHR5cGUgb2YgdGhlIGdpdmVuIG1vbmtleSBkZWZpbml0aW9uIG9yIGBudWxsYCBpZiBpbnZhbGlkLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSBkZWZpbml0aW9uIC0gVGhlIGRlZmluaXRpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJuIHtzdHJpbmd8bnVsbH1cbiAqL1xudHlwZS5tb25rZXlEZWZpbml0aW9uID0gZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcblxuICBpZiAodHlwZS5vYmplY3QoZGVmaW5pdGlvbikpIHtcbiAgICBpZiAoIXR5cGVbJ2Z1bmN0aW9uJ10oZGVmaW5pdGlvbi5nZXQpIHx8IGRlZmluaXRpb24uY3Vyc29ycyAmJiAoIXR5cGUub2JqZWN0KGRlZmluaXRpb24uY3Vyc29ycykgfHwgIU9iamVjdC5rZXlzKGRlZmluaXRpb24uY3Vyc29ycykuZXZlcnkoZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiB0eXBlLnBhdGgoZGVmaW5pdGlvbi5jdXJzb3JzW2tdKTtcbiAgICB9KSkpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuICdvYmplY3QnO1xuICB9IGVsc2UgaWYgKHR5cGUuYXJyYXkoZGVmaW5pdGlvbikpIHtcbiAgICBpZiAoIXR5cGVbJ2Z1bmN0aW9uJ10oZGVmaW5pdGlvbltkZWZpbml0aW9uLmxlbmd0aCAtIDFdKSB8fCAhZGVmaW5pdGlvbi5zbGljZSgwLCAtMSkuZXZlcnkoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiB0eXBlLnBhdGgocCk7XG4gICAgfSkpIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gd2F0Y2hlciBkZWZpbml0aW9uIGlzIHZhbGlkLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSAgIGRlZmluaXRpb24gLSBUaGUgZGVmaW5pdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbnR5cGUud2F0Y2hlck1hcHBpbmcgPSBmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICByZXR1cm4gdHlwZS5vYmplY3QoZGVmaW5pdGlvbikgJiYgT2JqZWN0LmtleXMoZGVmaW5pdGlvbikuZXZlcnkoZnVuY3Rpb24gKGspIHtcbiAgICByZXR1cm4gdHlwZS5wYXRoKGRlZmluaXRpb25ba10pO1xuICB9KTtcbn07XG5cbi8qKlxuICogQ2hlY2tpbmcgd2hldGhlciB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb3BlcmF0aW9uIHR5cGUuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9IHN0cmluZyAtIFRoZSBzdHJpbmcgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblxuLy8gT3JkZXJlZCBieSBsaWtlbGluZXNzXG52YXIgVkFMSURfT1BFUkFUSU9OUyA9IFsnc2V0JywgJ2FwcGx5JywgJ3B1c2gnLCAndW5zaGlmdCcsICdjb25jYXQnLCAnZGVlcE1lcmdlJywgJ21lcmdlJywgJ3NwbGljZScsICd1bnNldCddO1xuXG50eXBlLm9wZXJhdGlvblR5cGUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiB0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJyAmJiAhISB+VkFMSURfT1BFUkFUSU9OUy5pbmRleE9mKHN0cmluZyk7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSB0eXBlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyoqXG4gKiBCYW9iYWIgVXBkYXRlXG4gKiA9PT09PT09PT09PT09PVxuICpcbiAqIFRoZSB0cmVlJ3MgdXBkYXRlIHNjaGVtZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHVwZGF0ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG52YXIgX3R5cGUgPSByZXF1aXJlKCcuL3R5cGUnKTtcblxudmFyIF90eXBlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGUpO1xuXG52YXIgX2hlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxuZnVuY3Rpb24gZXJyKG9wZXJhdGlvbiwgZXhwZWN0ZWRUYXJnZXQsIHBhdGgpIHtcbiAgcmV0dXJuICgwLCBfaGVscGVycy5tYWtlRXJyb3IpKCdCYW9iYWIudXBkYXRlOiBjYW5ub3QgYXBwbHkgdGhlIFwiJyArIG9wZXJhdGlvbiArICdcIiBvbiAnICsgKCdhIG5vbiAnICsgZXhwZWN0ZWRUYXJnZXQgKyAnIChwYXRoOiAvJyArIHBhdGguam9pbignLycpICsgJykuJyksIHsgcGF0aDogcGF0aCB9KTtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBhaW1pbmcgYXQgYXBwbHlpbmcgYSBzaW5nbGUgdXBkYXRlIG9wZXJhdGlvbiBvbiB0aGUgZ2l2ZW4gdHJlZSdzXG4gKiBkYXRhLlxuICpcbiAqIEBwYXJhbSAge21peGVkfSAgZGF0YSAgICAgIC0gVGhlIHRyZWUncyBkYXRhLlxuICogQHBhcmFtICB7cGF0aH0gICBwYXRoICAgICAgLSBQYXRoIG9mIHRoZSB1cGRhdGUuXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wZXJhdGlvbiAtIFRoZSBvcGVyYXRpb24gdG8gYXBwbHkuXG4gKiBAcGFyYW0gIHtvYmplY3R9IFtvcHRzXSAgICAtIE9wdGlvbmFsIG9wdGlvbnMuXG4gKiBAcmV0dXJuIHttaXhlZH0gICAgICAgICAgICAtIEJvdGggdGhlIG5ldyB0cmVlJ3MgZGF0YSBhbmQgdGhlIHVwZGF0ZWQgbm9kZS5cbiAqL1xuXG5mdW5jdGlvbiB1cGRhdGUoZGF0YSwgcGF0aCwgb3BlcmF0aW9uKSB7XG4gIHZhciBvcHRzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbM107XG4gIHZhciBvcGVyYXRpb25UeXBlID0gb3BlcmF0aW9uLnR5cGU7XG4gIHZhciB2YWx1ZSA9IG9wZXJhdGlvbi52YWx1ZTtcblxuICAvLyBEdW1teSByb290LCBzbyB3ZSBjYW4gc2hpZnQgYW5kIGFsdGVyIHRoZSByb290XG4gIHZhciBkdW1teSA9IHsgcm9vdDogZGF0YSB9LFxuICAgICAgZHVtbXlQYXRoID0gWydyb290J10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShwYXRoKSksXG4gICAgICBjdXJyZW50UGF0aCA9IFtdO1xuXG4gIC8vIFdhbGtpbmcgdGhlIHBhdGhcbiAgdmFyIHAgPSBkdW1teSxcbiAgICAgIGkgPSB1bmRlZmluZWQsXG4gICAgICBsID0gdW5kZWZpbmVkLFxuICAgICAgcyA9IHVuZGVmaW5lZDtcblxuICBmb3IgKGkgPSAwLCBsID0gZHVtbXlQYXRoLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXG4gICAgLy8gQ3VycmVudCBpdGVtJ3MgcmVmZXJlbmNlIGlzIHRoZXJlZm9yZSBwW3NdXG4gICAgLy8gVGhlIHJlYXNvbiB3aHkgd2UgZG9uJ3QgY3JlYXRlIGEgdmFyaWFibGUgaGVyZSBmb3IgY29udmVuaWVuY2VcbiAgICAvLyBpcyBiZWNhdXNlIHdlIGFjdHVhbGx5IG5lZWQgdG8gbXV0YXRlIHRoZSByZWZlcmVuY2UuXG4gICAgcyA9IGR1bW15UGF0aFtpXTtcblxuICAgIC8vIFVwZGF0aW5nIHRoZSBwYXRoXG4gICAgaWYgKGkgPiAwKSBjdXJyZW50UGF0aC5wdXNoKHMpO1xuXG4gICAgLy8gSWYgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBwYXRoLCB3ZSBhcHBseSB0aGUgb3BlcmF0aW9uXG4gICAgaWYgKGkgPT09IGwgLSAxKSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0XG4gICAgICAgKi9cbiAgICAgIGlmIChvcGVyYXRpb25UeXBlID09PSAnc2V0Jykge1xuXG4gICAgICAgIC8vIFB1cml0eSBjaGVja1xuICAgICAgICBpZiAob3B0cy5wdXJlICYmIHBbc10gPT09IHZhbHVlKSByZXR1cm4geyBub2RlOiBwW3NdIH07XG5cbiAgICAgICAgaWYgKF90eXBlMlsnZGVmYXVsdCddLmxhenlHZXR0ZXIocCwgcykpIHtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocCwgcywge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdHMucGVyc2lzdGVudCkge1xuICAgICAgICAgIHBbc10gPSAoMCwgX2hlbHBlcnMuc2hhbGxvd0Nsb25lKSh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcFtzXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogTW9ua2V5XG4gICAgICAgKi9cbiAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICdtb25rZXknKSB7XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHAsIHMsIHtcbiAgICAgICAgICAgIGdldDogdmFsdWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQXBwbHlcbiAgICAgICAgICovXG4gICAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICdhcHBseScpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB2YWx1ZShwW3NdKTtcblxuICAgICAgICAgICAgLy8gUHVyaXR5IGNoZWNrXG4gICAgICAgICAgICBpZiAob3B0cy5wdXJlICYmIHBbc10gPT09IHJlc3VsdCkgcmV0dXJuIHsgbm9kZTogcFtzXSB9O1xuXG4gICAgICAgICAgICBpZiAoX3R5cGUyWydkZWZhdWx0J10ubGF6eUdldHRlcihwLCBzKSkge1xuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocCwgcywge1xuICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHQsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdHMucGVyc2lzdGVudCkge1xuICAgICAgICAgICAgICBwW3NdID0gKDAsIF9oZWxwZXJzLnNoYWxsb3dDbG9uZSkocmVzdWx0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBbc10gPSByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogUHVzaFxuICAgICAgICAgICAqL1xuICAgICAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICdwdXNoJykge1xuICAgICAgICAgICAgICBpZiAoIV90eXBlMlsnZGVmYXVsdCddLmFycmF5KHBbc10pKSB0aHJvdyBlcnIoJ3B1c2gnLCAnYXJyYXknLCBjdXJyZW50UGF0aCk7XG5cbiAgICAgICAgICAgICAgaWYgKG9wdHMucGVyc2lzdGVudCkgcFtzXSA9IHBbc10uY29uY2F0KFt2YWx1ZV0pO2Vsc2UgcFtzXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBVbnNoaWZ0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICd1bnNoaWZ0Jykge1xuICAgICAgICAgICAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10uYXJyYXkocFtzXSkpIHRocm93IGVycigndW5zaGlmdCcsICdhcnJheScsIGN1cnJlbnRQYXRoKTtcblxuICAgICAgICAgICAgICAgIGlmIChvcHRzLnBlcnNpc3RlbnQpIHBbc10gPSBbdmFsdWVdLmNvbmNhdChwW3NdKTtlbHNlIHBbc10udW5zaGlmdCh2YWx1ZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogQ29uY2F0XG4gICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICBlbHNlIGlmIChvcGVyYXRpb25UeXBlID09PSAnY29uY2F0Jykge1xuICAgICAgICAgICAgICAgICAgaWYgKCFfdHlwZTJbJ2RlZmF1bHQnXS5hcnJheShwW3NdKSkgdGhyb3cgZXJyKCdjb25jYXQnLCAnYXJyYXknLCBjdXJyZW50UGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChvcHRzLnBlcnNpc3RlbnQpIHBbc10gPSBwW3NdLmNvbmNhdCh2YWx1ZSk7ZWxzZSBwW3NdLnB1c2guYXBwbHkocFtzXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIFNwbGljZVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICdzcGxpY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10uYXJyYXkocFtzXSkpIHRocm93IGVycignc3BsaWNlJywgJ2FycmF5JywgY3VycmVudFBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRzLnBlcnNpc3RlbnQpIHBbc10gPSBfaGVscGVycy5zcGxpY2UuYXBwbHkobnVsbCwgW3Bbc11dLmNvbmNhdCh2YWx1ZSkpO2Vsc2UgcFtzXS5zcGxpY2UuYXBwbHkocFtzXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAqIFVuc2V0XG4gICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICd1bnNldCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KHApKSBkZWxldGUgcFtzXTtlbHNlIGlmIChfdHlwZTJbJ2RlZmF1bHQnXS5hcnJheShwKSkgcC5zcGxpY2UocywgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogTWVyZ2VcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wZXJhdGlvblR5cGUgPT09ICdtZXJnZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10ub2JqZWN0KHBbc10pKSB0aHJvdyBlcnIoJ21lcmdlJywgJ29iamVjdCcsIGN1cnJlbnRQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdHMucGVyc2lzdGVudCkgcFtzXSA9ICgwLCBfaGVscGVycy5zaGFsbG93TWVyZ2UpKHt9LCBwW3NdLCB2YWx1ZSk7ZWxzZSBwW3NdID0gKDAsIF9oZWxwZXJzLnNoYWxsb3dNZXJnZSkocFtzXSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAqIERlZXAgbWVyZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvcGVyYXRpb25UeXBlID09PSAnZGVlcE1lcmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV90eXBlMlsnZGVmYXVsdCddLm9iamVjdChwW3NdKSkgdGhyb3cgZXJyKCdkZWVwTWVyZ2UnLCAnb2JqZWN0JywgY3VycmVudFBhdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRzLnBlcnNpc3RlbnQpIHBbc10gPSAoMCwgX2hlbHBlcnMuZGVlcE1lcmdlKSh7fSwgcFtzXSwgdmFsdWUpO2Vsc2UgcFtzXSA9ICgwLCBfaGVscGVycy5kZWVwTWVyZ2UpKHBbc10sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuaW1tdXRhYmxlKSAoMCwgX2hlbHBlcnMuZGVlcEZyZWV6ZSkocCk7XG5cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIElmIHdlIHJlYWNoZWQgYSBsZWFmLCB3ZSBvdmVycmlkZSBieSBzZXR0aW5nIGFuIGVtcHR5IG9iamVjdFxuICAgIGVsc2UgaWYgKF90eXBlMlsnZGVmYXVsdCddLnByaW1pdGl2ZShwW3NdKSkge1xuICAgICAgICBwW3NdID0ge307XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2UsIHdlIHNoaWZ0IHRoZSByZWZlcmVuY2UgYW5kIGNvbnRpbnVlIHRoZSBwYXRoXG4gICAgICBlbHNlIGlmIChvcHRzLnBlcnNpc3RlbnQpIHtcbiAgICAgICAgICBwW3NdID0gKDAsIF9oZWxwZXJzLnNoYWxsb3dDbG9uZSkocFtzXSk7XG4gICAgICAgIH1cblxuICAgIC8vIFNob3VsZCB3ZSBmcmVlemUgdGhlIGN1cnJlbnQgc3RlcCBiZWZvcmUgY29udGludWluZz9cbiAgICBpZiAob3B0cy5pbW11dGFibGUgJiYgbCA+IDApICgwLCBfaGVscGVycy5mcmVlemUpKHApO1xuXG4gICAgcCA9IHBbc107XG4gIH1cblxuICAvLyBJZiB3ZSBhcmUgdXBkYXRpbmcgYSBkeW5hbWljIG5vZGUsIHdlIG5lZWQgbm90IHJldHVybiB0aGUgYWZmZWN0ZWQgbm9kZVxuICBpZiAoX3R5cGUyWydkZWZhdWx0J10ubGF6eUdldHRlcihwLCBzKSkgcmV0dXJuIHsgZGF0YTogZHVtbXkucm9vdCB9O1xuXG4gIC8vIFJldHVybmluZyBuZXcgZGF0YSBvYmplY3RcbiAgcmV0dXJuIHsgZGF0YTogZHVtbXkucm9vdCwgbm9kZTogcFtzXSB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKipcbiAqIEJhb2JhYiBXYXRjaGVyc1xuICogPT09PT09PT09PT09PT09PVxuICpcbiAqIEFic3RyYWN0aW9uIHVzZWQgdG8gbGlzdGVuIGFuZCByZXRyaWV2ZSBkYXRhIGZyb20gbXVsdGlwbGUgcGFydHMgb2YgYVxuICogQmFvYmFiIHRyZWUgYXQgb25jZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94LCBwcm9wZXJ0eSA9IF94MiwgcmVjZWl2ZXIgPSBfeDM7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3ggPSBwYXJlbnQ7IF94MiA9IHByb3BlcnR5OyBfeDMgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX2VtbWV0dCA9IHJlcXVpcmUoJ2VtbWV0dCcpO1xuXG52YXIgX2VtbWV0dDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9lbW1ldHQpO1xuXG52YXIgX2N1cnNvciA9IHJlcXVpcmUoJy4vY3Vyc29yJyk7XG5cbnZhciBfY3Vyc29yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2N1cnNvcik7XG5cbnZhciBfdHlwZSA9IHJlcXVpcmUoJy4vdHlwZScpO1xuXG52YXIgX3R5cGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdHlwZSk7XG5cbnZhciBfaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG4vKipcbiAqIFdhdGNoZXIgY2xhc3MuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0Jhb2JhYn0gdHJlZSAgICAgLSBUaGUgd2F0Y2hlZCB0cmVlLlxuICogQHBhcmFtIHtvYmplY3R9IG1hcHBpbmcgIC0gQSBtYXBwaW5nIG9mIHRoZSBwYXRocyB0byB3YXRjaCBpbiB0aGUgdHJlZS5cbiAqL1xuXG52YXIgV2F0Y2hlciA9IChmdW5jdGlvbiAoX0VtaXR0ZXIpIHtcbiAgX2luaGVyaXRzKFdhdGNoZXIsIF9FbWl0dGVyKTtcblxuICBmdW5jdGlvbiBXYXRjaGVyKHRyZWUsIG1hcHBpbmcpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFdhdGNoZXIpO1xuXG4gICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoV2F0Y2hlci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuXG4gICAgLy8gUHJvcGVydGllc1xuICAgIHRoaXMudHJlZSA9IHRyZWU7XG4gICAgdGhpcy5tYXBwaW5nID0gbnVsbDtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBraWxsZWQ6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIEluaXRpYWxpemluZ1xuICAgIHRoaXMucmVmcmVzaChtYXBwaW5nKTtcblxuICAgIC8vIExpc3RlbmluZ1xuICAgIHRoaXMuaGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoX3RoaXMuc3RhdGUua2lsbGVkKSByZXR1cm47XG5cbiAgICAgIHZhciB3YXRjaGVkUGF0aHMgPSBfdGhpcy5nZXRXYXRjaGVkUGF0aHMoKTtcblxuICAgICAgaWYgKCgwLCBfaGVscGVycy5zb2x2ZVVwZGF0ZSkoZS5kYXRhLnBhdGhzLCB3YXRjaGVkUGF0aHMpKSByZXR1cm4gX3RoaXMuZW1pdCgndXBkYXRlJyk7XG4gICAgfTtcblxuICAgIHRoaXMudHJlZS5vbigndXBkYXRlJywgdGhpcy5oYW5kbGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdXNlZCB0byBnZXQgdGhlIGN1cnJlbnQgd2F0Y2hlZCBwYXRocy5cbiAgICpcbiAgICogQHJldHVybiB7YXJyYXl9IC0gVGhlIGFycmF5IG9mIHdhdGNoZWQgcGF0aHMuXG4gICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhXYXRjaGVyLCBbe1xuICAgIGtleTogJ2dldFdhdGNoZWRQYXRocycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFdhdGNoZWRQYXRocygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB2YXIgcmF3UGF0aHMgPSBPYmplY3Qua2V5cyh0aGlzLm1hcHBpbmcpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgICB2YXIgdiA9IF90aGlzMi5tYXBwaW5nW2tdO1xuXG4gICAgICAgIC8vIFdhdGNoZXIgbWFwcGluZ3MgY2FuIGFjY2VwdCBhIGN1cnNvclxuICAgICAgICBpZiAodiBpbnN0YW5jZW9mIF9jdXJzb3IyWydkZWZhdWx0J10pIHJldHVybiB2LnNvbHZlZFBhdGg7XG5cbiAgICAgICAgcmV0dXJuIF90aGlzMi5tYXBwaW5nW2tdO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByYXdQYXRocy5yZWR1Y2UoZnVuY3Rpb24gKGNwLCBwKSB7XG5cbiAgICAgICAgLy8gSGFuZGxpbmcgcGF0aCBwb2x5bW9ycGhpc21zXG4gICAgICAgIHAgPSBbXS5jb25jYXQocCk7XG5cbiAgICAgICAgLy8gRHluYW1pYyBwYXRoP1xuICAgICAgICBpZiAoX3R5cGUyWydkZWZhdWx0J10uZHluYW1pY1BhdGgocCkpIHAgPSAoMCwgX2hlbHBlcnMuZ2V0SW4pKF90aGlzMi50cmVlLl9kYXRhLCBwKS5zb2x2ZWRQYXRoO1xuXG4gICAgICAgIGlmICghcCkgcmV0dXJuIGNwO1xuXG4gICAgICAgIC8vIEZhY2V0IHBhdGg/XG4gICAgICAgIHZhciBtb25rZXlQYXRoID0gX3R5cGUyWydkZWZhdWx0J10ubW9ua2V5UGF0aChfdGhpczIudHJlZS5fbW9ua2V5cywgcCk7XG5cbiAgICAgICAgaWYgKG1vbmtleVBhdGgpIHJldHVybiBjcC5jb25jYXQoKDAsIF9oZWxwZXJzLmdldEluKShfdGhpczIudHJlZS5fbW9ua2V5cywgbW9ua2V5UGF0aCkuZGF0YS5yZWxhdGVkUGF0aHMoKSk7XG5cbiAgICAgICAgcmV0dXJuIGNwLmNvbmNhdChbcF0pO1xuICAgICAgfSwgW10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB1c2VkIHRvIHJldHVybiBhIG1hcCBvZiB0aGUgd2F0Y2hlcidzIGN1cnNvcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IC0gVE1hcCBvZiByZWxldmFudCBjdXJzb3JzLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZ2V0Q3Vyc29ycycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEN1cnNvcnMoKSB7XG4gICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgdmFyIGN1cnNvcnMgPSB7fTtcblxuICAgICAgT2JqZWN0LmtleXModGhpcy5tYXBwaW5nKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgIHZhciBwYXRoID0gX3RoaXMzLm1hcHBpbmdba107XG5cbiAgICAgICAgaWYgKHBhdGggaW5zdGFuY2VvZiBfY3Vyc29yMlsnZGVmYXVsdCddKSBjdXJzb3JzW2tdID0gcGF0aDtlbHNlIGN1cnNvcnNba10gPSBfdGhpczMudHJlZS5zZWxlY3QocGF0aCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGN1cnNvcnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHVzZWQgdG8gcmVmcmVzaCB0aGUgd2F0Y2hlcidzIG1hcHBpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9ICBtYXBwaW5nICAtIFRoZSBuZXcgbWFwcGluZyB0byBhcHBseS5cbiAgICAgKiBAcmV0dXJuIHtXYXRjaGVyfSAgICAgICAgICAtIEl0c2VsZiBmb3IgY2hhaW5pbmcgcHVycG9zZXMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZWZyZXNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVmcmVzaChtYXBwaW5nKSB7XG5cbiAgICAgIGlmICghX3R5cGUyWydkZWZhdWx0J10ud2F0Y2hlck1hcHBpbmcobWFwcGluZykpIHRocm93ICgwLCBfaGVscGVycy5tYWtlRXJyb3IpKCdCYW9iYWIud2F0Y2g6IGludmFsaWQgbWFwcGluZy4nLCB7IG1hcHBpbmc6IG1hcHBpbmcgfSk7XG5cbiAgICAgIHRoaXMubWFwcGluZyA9IG1hcHBpbmc7XG5cbiAgICAgIC8vIENyZWF0aW5nIHRoZSBnZXQgbWV0aG9kXG4gICAgICB2YXIgcHJvamVjdGlvbiA9IHt9O1xuXG4gICAgICBmb3IgKHZhciBrIGluIG1hcHBpbmcpIHtcbiAgICAgICAgcHJvamVjdGlvbltrXSA9IG1hcHBpbmdba10gaW5zdGFuY2VvZiBfY3Vyc29yMlsnZGVmYXVsdCddID8gbWFwcGluZ1trXS5wYXRoIDogbWFwcGluZ1trXTtcbiAgICAgIH10aGlzLmdldCA9IHRoaXMudHJlZS5wcm9qZWN0LmJpbmQodGhpcy50cmVlLCBwcm9qZWN0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2RzIHJlbGVhc2luZyB0aGUgd2F0Y2hlciBmcm9tIG1lbW9yeS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbGVhc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWxlYXNlKCkge1xuXG4gICAgICB0aGlzLnRyZWUub2ZmKCd1cGRhdGUnLCB0aGlzLmhhbmRsZXIpO1xuICAgICAgdGhpcy5zdGF0ZS5raWxsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5raWxsKCk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFdhdGNoZXI7XG59KShfZW1tZXR0MlsnZGVmYXVsdCddKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gV2F0Y2hlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBIZXJlIGlzIHRoZSBsaXN0IG9mIGV2ZXJ5IGFsbG93ZWQgcGFyYW1ldGVyIHdoZW4gdXNpbmcgRW1pdHRlciNvbjpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHZhciBfX2FsbG93ZWRPcHRpb25zID0ge1xuICAgIG9uY2U6ICdib29sZWFuJyxcbiAgICBzY29wZTogJ29iamVjdCdcbiAgfTtcblxuICAvKipcbiAgICogSW5jcmVtZW50YWwgaWQgdXNlZCB0byBvcmRlciBldmVudCBoYW5kbGVycy5cbiAgICovXG4gIHZhciBfX29yZGVyID0gMDtcblxuICAvKipcbiAgICogQSBzaW1wbGUgaGVscGVyIHRvIHNoYWxsb3dseSBtZXJnZSB0d28gb2JqZWN0cy4gVGhlIHNlY29uZCBvbmUgd2lsbCBcIndpblwiXG4gICAqIG92ZXIgdGhlIGZpcnN0IG9uZS5cbiAgICpcbiAgICogQHBhcmFtICB7b2JqZWN0fSAgbzEgRmlyc3QgdGFyZ2V0IG9iamVjdC5cbiAgICogQHBhcmFtICB7b2JqZWN0fSAgbzIgU2Vjb25kIHRhcmdldCBvYmplY3QuXG4gICAqIEByZXR1cm4ge29iamVjdH0gICAgIFJldHVybnMgdGhlIG1lcmdlZCBvYmplY3QuXG4gICAqL1xuICBmdW5jdGlvbiBzaGFsbG93TWVyZ2UobzEsIG8yKSB7XG4gICAgdmFyIG8gPSB7fSxcbiAgICAgICAgaztcblxuICAgIGZvciAoayBpbiBvMSkgb1trXSA9IG8xW2tdO1xuICAgIGZvciAoayBpbiBvMikgb1trXSA9IG8yW2tdO1xuXG4gICAgcmV0dXJuIG87XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGdpdmVuIHZhcmlhYmxlIGEgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3Q/XG4gICAqXG4gICAqIEBwYXJhbSAge21peGVkfSAgdiAgIFRhcmdldC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gICAgVGhlIGJvb2xlYW4gcmVzdWx0LlxuICAgKi9cbiAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2KSB7XG4gICAgcmV0dXJuIHYgJiZcbiAgICAgICAgICAgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICFBcnJheS5pc0FycmF5KHYpICYmXG4gICAgICAgICAgICEodiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSAmJlxuICAgICAgICAgICAhKHYgaW5zdGFuY2VvZiBSZWdFeHApO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciBhbiBvYmplY3QgdGhhdCBtYXkgaGF2ZSBFUzYgU3ltYm9scy5cbiAgICpcbiAgICogQHBhcmFtICB7b2JqZWN0fSAgIG9iamVjdCAgT2JqZWN0IG9uIHdoaWNoIHRvIGl0ZXJhdGUuXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBmbiAgICAgIEl0ZXJhdG9yIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICAgW3Njb3BlXSBPcHRpb25hbCBzY29wZS5cbiAgICovXG4gIGZ1bmN0aW9uIGZvckluKG9iamVjdCwgZm4sIHNjb3BlKSB7XG4gICAgdmFyIHN5bWJvbHMsXG4gICAgICAgIGssXG4gICAgICAgIGksXG4gICAgICAgIGw7XG5cbiAgICBmb3IgKGsgaW4gb2JqZWN0KVxuICAgICAgZm4uY2FsbChzY29wZSB8fCBudWxsLCBrLCBvYmplY3Rba10pO1xuXG4gICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICAgIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7XG5cbiAgICAgIGZvciAoaSA9IDAsIGwgPSBzeW1ib2xzLmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgICAgZm4uY2FsbChzY29wZSB8fCBudWxsLCBzeW1ib2xzW2ldLCBvYmplY3Rbc3ltYm9sc1tpXV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZW1pdHRlcidzIGNvbnN0cnVjdG9yLiBJdCBpbml0aWFsaXplcyB0aGUgaGFuZGxlcnMtcGVyLWV2ZW50cyBzdG9yZSBhbmRcbiAgICogdGhlIGdsb2JhbCBoYW5kbGVycyBzdG9yZS5cbiAgICpcbiAgICogRW1pdHRlcnMgYXJlIHVzZWZ1bCBmb3Igbm9uLURPTSBldmVudHMgY29tbXVuaWNhdGlvbi4gUmVhZCBpdHMgbWV0aG9kc1xuICAgKiBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGhvdyBpdCB3b3Jrcy5cbiAgICpcbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICBUaGUgZnJlc2ggbmV3IGluc3RhbmNlLlxuICAgKi9cbiAgdmFyIEVtaXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9lbmFibGVkID0gdHJ1ZTtcblxuICAgIC8vIERpcnR5IHRyaWNrIHRoYXQgd2lsbCBzZXQgdGhlIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzIHRvIHRoZSBlbWl0dGVyXG4gICAgdGhpcy51bmJpbmRBbGwoKTtcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgdW5iaW5kcyBldmVyeSBoYW5kbGVycyBhdHRhY2hlZCB0byBldmVyeSBvciBhbnkgZXZlbnRzLiBTbyxcbiAgICogdGhlc2UgZnVuY3Rpb25zIHdpbGwgbm8gbW9yZSBiZSBleGVjdXRlZCB3aGVuIHRoZSByZWxhdGVkIGV2ZW50cyBhcmVcbiAgICogZW1pdHRlZC4gSWYgdGhlIGZ1bmN0aW9ucyB3ZXJlIG5vdCBib3VuZCB0byB0aGUgZXZlbnRzLCBub3RoaW5nIHdpbGxcbiAgICogaGFwcGVuLCBhbmQgbm8gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gICAqXG4gICAqIFVzYWdlOlxuICAgKiAqKioqKipcbiAgICogPiBteUVtaXR0ZXIudW5iaW5kQWxsKCk7XG4gICAqXG4gICAqIEByZXR1cm4ge0VtaXR0ZXJ9ICAgICAgUmV0dXJucyB0aGlzLlxuICAgKi9cbiAgRW1pdHRlci5wcm90b3R5cGUudW5iaW5kQWxsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLl9oYW5kbGVycyA9IHt9O1xuICAgIHRoaXMuX2hhbmRsZXJzQWxsID0gW107XG4gICAgdGhpcy5faGFuZGxlcnNDb21wbGV4ID0gW107XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBiaW5kcyBvbmUgb3IgbW9yZSBmdW5jdGlvbnMgdG8gdGhlIGVtaXR0ZXIsIGhhbmRsZWQgdG8gb25lIG9yIGFcbiAgICogc3VpdGUgb2YgZXZlbnRzLiBTbywgdGhlc2UgZnVuY3Rpb25zIHdpbGwgYmUgZXhlY3V0ZWQgYW55dGltZSBvbmUgcmVsYXRlZFxuICAgKiBldmVudCBpcyBlbWl0dGVkLlxuICAgKlxuICAgKiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIGJpbmQgYSBmdW5jdGlvbiB0byBhbnkgZW1pdHRlZCBldmVudCBieSBub3RcbiAgICogc3BlY2lmeWluZyBhbnkgZXZlbnQgdG8gYmluZCB0aGUgZnVuY3Rpb24gdG8uXG4gICAqXG4gICAqIFJlY29nbml6ZWQgb3B0aW9uczpcbiAgICogKioqKioqKioqKioqKioqKioqKlxuICAgKiAgLSB7P2Jvb2xlYW59IG9uY2UgICBJZiB0cnVlLCB0aGUgaGFuZGxlcnMgd2lsbCBiZSB1bmJvdW5kIGFmdGVyIHRoZSBmaXJzdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBleGVjdXRpb24uIERlZmF1bHQgdmFsdWU6IGZhbHNlLlxuICAgKiAgLSB7P29iamVjdH0gIHNjb3BlICBJZiBhIHNjb3BlIGlzIGdpdmVuLCB0aGVuIHRoZSBsaXN0ZW5lcnMgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGlzIHNjb3BlIGFzIFwidGhpc1wiLlxuICAgKlxuICAgKiBWYXJpYW50IDE6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIub24oJ215RXZlbnQnLCBmdW5jdGlvbihlKSB7IGNvbnNvbGUubG9nKGUpOyB9KTtcbiAgICogPiAvLyBPcjpcbiAgICogPiBteUVtaXR0ZXIub24oJ215RXZlbnQnLCBmdW5jdGlvbihlKSB7IGNvbnNvbGUubG9nKGUpOyB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gICBldmVudCAgIFRoZSBldmVudCB0byBsaXN0ZW4gdG8uXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICAgKiBAcGFyYW0gIHs/b2JqZWN0fSAgb3B0aW9ucyBFdmVudHVhbGx5IHNvbWUgb3B0aW9ucy5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKlxuICAgKiBWYXJpYW50IDI6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIub24oXG4gICAqID4gICBbJ215RXZlbnQxJywgJ215RXZlbnQyJ10sXG4gICAqID4gICBmdW5jdGlvbihlKSB7IGNvbnNvbGUubG9nKGUpOyB9XG4gICAqID4pO1xuICAgKiA+IC8vIE9yOlxuICAgKiA+IG15RW1pdHRlci5vbihcbiAgICogPiAgIFsnbXlFdmVudDEnLCAnbXlFdmVudDInXSxcbiAgICogPiAgIGZ1bmN0aW9uKGUpIHsgY29uc29sZS5sb2coZSk7IH1cbiAgICogPiAgIHsgb25jZTogdHJ1ZSB9fVxuICAgKiA+KTtcbiAgICpcbiAgICogQHBhcmFtICB7YXJyYXl9ICAgIGV2ZW50cyAgVGhlIGV2ZW50cyB0byBsaXN0ZW4gdG8uXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9ufSBoYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICAgKiBAcGFyYW0gIHs/b2JqZWN0fSAgb3B0aW9ucyBFdmVudHVhbGx5IHNvbWUgb3B0aW9ucy5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKlxuICAgKiBWYXJpYW50IDM6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIub24oe1xuICAgKiA+ICAgbXlFdmVudDE6IGZ1bmN0aW9uKGUpIHsgY29uc29sZS5sb2coZSk7IH0sXG4gICAqID4gICBteUV2ZW50MjogZnVuY3Rpb24oZSkgeyBjb25zb2xlLmxvZyhlKTsgfVxuICAgKiA+IH0pO1xuICAgKiA+IC8vIE9yOlxuICAgKiA+IG15RW1pdHRlci5vbih7XG4gICAqID4gICBteUV2ZW50MTogZnVuY3Rpb24oZSkgeyBjb25zb2xlLmxvZyhlKTsgfSxcbiAgICogPiAgIG15RXZlbnQyOiBmdW5jdGlvbihlKSB7IGNvbnNvbGUubG9nKGUpOyB9XG4gICAqID4gfSwgeyBvbmNlOiB0cnVlIH0pO1xuICAgKlxuICAgKiBAcGFyYW0gIHtvYmplY3R9ICBiaW5kaW5ncyBBbiBvYmplY3QgY29udGFpbmluZyBwYWlycyBldmVudCAvIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gIHs/b2JqZWN0fSAgb3B0aW9ucyBFdmVudHVhbGx5IHNvbWUgb3B0aW9ucy5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKlxuICAgKiBWYXJpYW50IDQ6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIub24oZnVuY3Rpb24oZSkgeyBjb25zb2xlLmxvZyhlKTsgfSk7XG4gICAqID4gLy8gT3I6XG4gICAqID4gbXlFbWl0dGVyLm9uKGZ1bmN0aW9uKGUpIHsgY29uc29sZS5sb2coZSk7IH0sIHsgb25jZTogdHJ1ZX0pO1xuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gaGFuZGxlciBUaGUgZnVuY3Rpb24gdG8gYmluZCB0byBldmVyeSBldmVudHMuXG4gICAqIEBwYXJhbSAgez9vYmplY3R9ICBvcHRpb25zIEV2ZW50dWFsbHkgc29tZSBvcHRpb25zLlxuICAgKiBAcmV0dXJuIHtFbWl0dGVyfSAgICAgICAgICBSZXR1cm5zIHRoaXMuXG4gICAqL1xuICBFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgICB2YXIgaSxcbiAgICAgICAgbCxcbiAgICAgICAgayxcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIGVBcnJheSxcbiAgICAgICAgaGFuZGxlcnNMaXN0LFxuICAgICAgICBiaW5kaW5nT2JqZWN0O1xuXG4gICAgLy8gVmFyaWFudCAzXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcbiAgICAgIGZvckluKGEsIGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgICAgIHRoaXMub24obmFtZSwgZm4sIGIpO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIFZhcmlhbnQgMSwgMiBhbmQgNFxuICAgIGlmICh0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYyA9IGI7XG4gICAgICBiID0gYTtcbiAgICAgIGEgPSBudWxsO1xuICAgIH1cblxuICAgIGVBcnJheSA9IFtdLmNvbmNhdChhKTtcblxuICAgIGZvciAoaSA9IDAsIGwgPSBlQXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBldmVudCA9IGVBcnJheVtpXTtcblxuICAgICAgYmluZGluZ09iamVjdCA9IHtcbiAgICAgICAgb3JkZXI6IF9fb3JkZXIrKyxcbiAgICAgICAgZm46IGJcbiAgICAgIH07XG5cbiAgICAgIC8vIERlZmluaW5nIHRoZSBsaXN0IGluIHdoaWNoIHRoZSBoYW5kbGVyIHNob3VsZCBiZSBpbnNlcnRlZFxuICAgICAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGV2ZW50ID09PSAnc3ltYm9sJykge1xuICAgICAgICBpZiAoIXRoaXMuX2hhbmRsZXJzW2V2ZW50XSlcbiAgICAgICAgICB0aGlzLl9oYW5kbGVyc1tldmVudF0gPSBbXTtcbiAgICAgICAgaGFuZGxlcnNMaXN0ID0gdGhpcy5faGFuZGxlcnNbZXZlbnRdO1xuICAgICAgICBiaW5kaW5nT2JqZWN0LnR5cGUgPSBldmVudDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgIGhhbmRsZXJzTGlzdCA9IHRoaXMuX2hhbmRsZXJzQ29tcGxleDtcbiAgICAgICAgYmluZGluZ09iamVjdC5wYXR0ZXJuID0gZXZlbnQ7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChldmVudCA9PT0gbnVsbCkge1xuICAgICAgICBoYW5kbGVyc0xpc3QgPSB0aGlzLl9oYW5kbGVyc0FsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBFcnJvcignRW1pdHRlci5vbjogaW52YWxpZCBldmVudC4nKTtcbiAgICAgIH1cblxuICAgICAgLy8gQXBwZW5kaW5nIG5lZWRlZCBwcm9wZXJ0aWVzXG4gICAgICBmb3IgKGsgaW4gYyB8fCB7fSlcbiAgICAgICAgaWYgKF9fYWxsb3dlZE9wdGlvbnNba10pXG4gICAgICAgICAgYmluZGluZ09iamVjdFtrXSA9IGNba107XG5cbiAgICAgIGhhbmRsZXJzTGlzdC5wdXNoKGJpbmRpbmdPYmplY3QpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHdvcmtzIGV4YWN0bHkgYXMgdGhlIHByZXZpb3VzICNvbiwgYnV0IHdpbGwgYWRkIGFuIG9wdGlvbnNcbiAgICogb2JqZWN0IGlmIG5vbmUgaXMgZ2l2ZW4sIGFuZCBzZXQgdGhlIG9wdGlvbiBcIm9uY2VcIiB0byB0cnVlLlxuICAgKlxuICAgKiBUaGUgcG9seW1vcnBoaXNtIHdvcmtzIGV4YWN0bHkgYXMgd2l0aCB0aGUgI29uIG1ldGhvZC5cbiAgICovXG4gIEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgIGxpID0gYXJncy5sZW5ndGggLSAxO1xuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXJnc1tsaV0pICYmIGFyZ3MubGVuZ3RoID4gMSlcbiAgICAgIGFyZ3NbbGldID0gc2hhbGxvd01lcmdlKGFyZ3NbbGldLCB7b25jZTogdHJ1ZX0pO1xuICAgIGVsc2VcbiAgICAgIGFyZ3MucHVzaCh7b25jZTogdHJ1ZX0pO1xuXG4gICAgcmV0dXJuIHRoaXMub24uYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG5cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgdW5iaW5kcyBvbmUgb3IgbW9yZSBmdW5jdGlvbnMgZnJvbSBldmVudHMgb2YgdGhlIGVtaXR0ZXIuIFNvLFxuICAgKiB0aGVzZSBmdW5jdGlvbnMgd2lsbCBubyBtb3JlIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIHJlbGF0ZWQgZXZlbnRzIGFyZVxuICAgKiBlbWl0dGVkLiBJZiB0aGUgZnVuY3Rpb25zIHdlcmUgbm90IGJvdW5kIHRvIHRoZSBldmVudHMsIG5vdGhpbmcgd2lsbFxuICAgKiBoYXBwZW4sIGFuZCBubyBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAgICpcbiAgICogVmFyaWFudCAxOlxuICAgKiAqKioqKioqKioqXG4gICAqID4gbXlFbWl0dGVyLm9mZignbXlFdmVudCcsIG15SGFuZGxlcik7XG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gICBldmVudCAgIFRoZSBldmVudCB0byB1bmJpbmQgdGhlIGhhbmRsZXIgZnJvbS5cbiAgICogQHBhcmFtICB7ZnVuY3Rpb259IGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIHVuYmluZC5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKlxuICAgKiBWYXJpYW50IDI6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIub2ZmKFsnbXlFdmVudDEnLCAnbXlFdmVudDInXSwgbXlIYW5kbGVyKTtcbiAgICpcbiAgICogQHBhcmFtICB7YXJyYXl9ICAgIGV2ZW50cyAgVGhlIGV2ZW50cyB0byB1bmJpbmQgdGhlIGhhbmRsZXIgZnJvbS5cbiAgICogQHBhcmFtICB7ZnVuY3Rpb259IGhhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIHVuYmluZC5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKlxuICAgKiBWYXJpYW50IDM6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIub2ZmKHtcbiAgICogPiAgIG15RXZlbnQxOiBteUhhbmRsZXIxLFxuICAgKiA+ICAgbXlFdmVudDI6IG15SGFuZGxlcjJcbiAgICogPiB9KTtcbiAgICpcbiAgICogQHBhcmFtICB7b2JqZWN0fSBiaW5kaW5ncyBBbiBvYmplY3QgY29udGFpbmluZyBwYWlycyBldmVudCAvIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHtFbWl0dGVyfSAgICAgICAgIFJldHVybnMgdGhpcy5cbiAgICpcbiAgICogVmFyaWFudCA0OlxuICAgKiAqKioqKioqKioqXG4gICAqID4gbXlFbWl0dGVyLm9mZihteUhhbmRsZXIpO1xuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gaGFuZGxlciBUaGUgZnVuY3Rpb24gdG8gdW5iaW5kIGZyb20gZXZlcnkgZXZlbnRzLlxuICAgKiBAcmV0dXJuIHtFbWl0dGVyfSAgICAgICAgICBSZXR1cm5zIHRoaXMuXG4gICAqXG4gICAqIFZhcmlhbnQgNTpcbiAgICogKioqKioqKioqKlxuICAgKiA+IG15RW1pdHRlci5vZmYoZXZlbnQpO1xuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGV2ZW50ICAgICBUaGUgZXZlbnQgd2Ugc2hvdWxkIHVuYmluZC5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKi9cbiAgZnVuY3Rpb24gZmlsdGVyKHRhcmdldCwgZm4pIHtcbiAgICB0YXJnZXQgPSB0YXJnZXQgfHwgW107XG5cbiAgICB2YXIgYSA9IFtdLFxuICAgICAgICBsLFxuICAgICAgICBpO1xuXG4gICAgZm9yIChpID0gMCwgbCA9IHRhcmdldC5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICBpZiAodGFyZ2V0W2ldLmZuICE9PSBmbilcbiAgICAgICAgYS5wdXNoKHRhcmdldFtpXSk7XG5cbiAgICByZXR1cm4gYTtcbiAgfVxuXG4gIEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50cywgZm4pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgbixcbiAgICAgICAgayxcbiAgICAgICAgZXZlbnQ7XG5cbiAgICAvLyBWYXJpYW50IDQ6XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIGV2ZW50cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4gPSBhcmd1bWVudHNbMF07XG5cbiAgICAgIC8vIEhhbmRsZXJzIGJvdW5kIHRvIGV2ZW50czpcbiAgICAgIGZvciAoayBpbiB0aGlzLl9oYW5kbGVycykge1xuICAgICAgICB0aGlzLl9oYW5kbGVyc1trXSA9IGZpbHRlcih0aGlzLl9oYW5kbGVyc1trXSwgZm4pO1xuXG4gICAgICAgIGlmICh0aGlzLl9oYW5kbGVyc1trXS5sZW5ndGggPT09IDApXG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2hhbmRsZXJzW2tdO1xuICAgICAgfVxuXG4gICAgICAvLyBHZW5lcmljIEhhbmRsZXJzXG4gICAgICB0aGlzLl9oYW5kbGVyc0FsbCA9IGZpbHRlcih0aGlzLl9oYW5kbGVyc0FsbCwgZm4pO1xuXG4gICAgICAvLyBDb21wbGV4IGhhbmRsZXJzXG4gICAgICB0aGlzLl9oYW5kbGVyc0NvbXBsZXggPSBmaWx0ZXIodGhpcy5faGFuZGxlcnNDb21wbGV4LCBmbik7XG4gICAgfVxuXG4gICAgLy8gVmFyaWFudCA1XG4gICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgICh0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgZXZlbnRzID09PSAnc3ltYm9sJykpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9oYW5kbGVyc1tldmVudHNdO1xuICAgIH1cblxuICAgIC8vIFZhcmlhbnQgMSBhbmQgMjpcbiAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICB2YXIgZUFycmF5ID0gW10uY29uY2F0KGV2ZW50cyk7XG5cbiAgICAgIGZvciAoaSA9IDAsIG4gPSBlQXJyYXkubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGV2ZW50ID0gZUFycmF5W2ldO1xuXG4gICAgICAgIHRoaXMuX2hhbmRsZXJzW2V2ZW50XSA9IGZpbHRlcih0aGlzLl9oYW5kbGVyc1tldmVudF0sIGZuKTtcblxuICAgICAgICBpZiAoKHRoaXMuX2hhbmRsZXJzW2V2ZW50XSB8fCBbXSkubGVuZ3RoID09PSAwKVxuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9oYW5kbGVyc1tldmVudF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmFyaWFudCAzXG4gICAgZWxzZSBpZiAoaXNQbGFpbk9iamVjdChldmVudHMpKSB7XG4gICAgICBmb3JJbihldmVudHMsIHRoaXMub2ZmLCB0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgcmV0cmlldmUgdGhlIGxpc3RlbmVycyBhdHRhY2hlZCB0byBhIHBhcnRpY3VsYXIgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSAgez9zdHJpbmd9ICAgIE5hbWUgb2YgdGhlIGV2ZW50LlxuICAgKiBAcmV0dXJuIHthcnJheX0gICAgICBBcnJheSBvZiBoYW5kbGVyIGZ1bmN0aW9ucy5cbiAgICovXG4gIEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGhhbmRsZXJzID0gdGhpcy5faGFuZGxlcnNBbGwgfHwgW10sXG4gICAgICAgIGNvbXBsZXggPSBmYWxzZSxcbiAgICAgICAgaCxcbiAgICAgICAgaSxcbiAgICAgICAgbDtcblxuICAgIGlmICghZXZlbnQpXG4gICAgICB0aHJvdyBFcnJvcignRW1pdHRlci5saXN0ZW5lcnM6IG5vIGV2ZW50IHByb3ZpZGVkLicpO1xuXG4gICAgaGFuZGxlcnMgPSBoYW5kbGVycy5jb25jYXQodGhpcy5faGFuZGxlcnNbZXZlbnRdIHx8IFtdKTtcblxuICAgIGZvciAoaSA9IDAsIGwgPSB0aGlzLl9oYW5kbGVyc0NvbXBsZXgubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBoID0gdGhpcy5faGFuZGxlcnNDb21wbGV4W2ldO1xuXG4gICAgICBpZiAofmV2ZW50LnNlYXJjaChoLnBhdHRlcm4pKSB7XG4gICAgICAgIGNvbXBsZXggPSB0cnVlO1xuICAgICAgICBoYW5kbGVycy5wdXNoKGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlIGhhdmUgYW55IGNvbXBsZXggaGFuZGxlcnMsIHdlIG5lZWQgdG8gc29ydFxuICAgIGlmICh0aGlzLl9oYW5kbGVyc0FsbC5sZW5ndGggfHwgY29tcGxleClcbiAgICAgIHJldHVybiBoYW5kbGVycy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEub3JkZXIgLSBiLm9yZGVyO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGhhbmRsZXJzLnNsaWNlKDApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBlbWl0cyB0aGUgc3BlY2lmaWVkIGV2ZW50KHMpLCBhbmQgZXhlY3V0ZXMgZXZlcnkgaGFuZGxlcnMgYm91bmRcbiAgICogdG8gdGhlIGV2ZW50KHMpLlxuICAgKlxuICAgKiBVc2UgY2FzZXM6XG4gICAqICoqKioqKioqKipcbiAgICogPiBteUVtaXR0ZXIuZW1pdCgnbXlFdmVudCcpO1xuICAgKiA+IG15RW1pdHRlci5lbWl0KCdteUV2ZW50JywgbXlEYXRhKTtcbiAgICogPiBteUVtaXR0ZXIuZW1pdChbJ215RXZlbnQxJywgJ215RXZlbnQyJ10pO1xuICAgKiA+IG15RW1pdHRlci5lbWl0KFsnbXlFdmVudDEnLCAnbXlFdmVudDInXSwgbXlEYXRhKTtcbiAgICogPiBteUVtaXR0ZXIuZW1pdCh7bXlFdmVudDE6IG15RGF0YTEsIG15RXZlbnQyOiBteURhdGEyfSk7XG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ3xhcnJheX0gZXZlbnRzIFRoZSBldmVudChzKSB0byBlbWl0LlxuICAgKiBAcGFyYW0gIHtvYmplY3Q/fSAgICAgIGRhdGEgICBUaGUgZGF0YS5cbiAgICogQHJldHVybiB7RW1pdHRlcn0gICAgICAgICAgICAgUmV0dXJucyB0aGlzLlxuICAgKi9cbiAgRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50cywgZGF0YSkge1xuXG4gICAgLy8gU2hvcnQgZXhpdCBpZiB0aGUgZW1pdHRlciBpcyBkaXNhYmxlZFxuICAgIGlmICghdGhpcy5fZW5hYmxlZClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgLy8gT2JqZWN0IHZhcmlhbnRcbiAgICBpZiAoaXNQbGFpbk9iamVjdChldmVudHMpKSB7XG4gICAgICBmb3JJbihldmVudHMsIHRoaXMuZW1pdCwgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgZUFycmF5ID0gW10uY29uY2F0KGV2ZW50cyksXG4gICAgICAgIG9uY2VzID0gW10sXG4gICAgICAgIGV2ZW50LFxuICAgICAgICBwYXJlbnQsXG4gICAgICAgIGhhbmRsZXJzLFxuICAgICAgICBoYW5kbGVyLFxuICAgICAgICBpLFxuICAgICAgICBqLFxuICAgICAgICBsLFxuICAgICAgICBtO1xuXG4gICAgZm9yIChpID0gMCwgbCA9IGVBcnJheS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGhhbmRsZXJzID0gdGhpcy5saXN0ZW5lcnMoZUFycmF5W2ldKTtcblxuICAgICAgZm9yIChqID0gMCwgbSA9IGhhbmRsZXJzLmxlbmd0aDsgaiA8IG07IGorKykge1xuICAgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbal07XG4gICAgICAgIGV2ZW50ID0ge1xuICAgICAgICAgIHR5cGU6IGVBcnJheVtpXSxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXNcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICAgICAgZXZlbnQuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgaGFuZGxlci5mbi5jYWxsKCdzY29wZScgaW4gaGFuZGxlciA/IGhhbmRsZXIuc2NvcGUgOiB0aGlzLCBldmVudCk7XG5cbiAgICAgICAgaWYgKGhhbmRsZXIub25jZSlcbiAgICAgICAgICBvbmNlcy5wdXNoKGhhbmRsZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhbmluZyBvbmNlc1xuICAgICAgZm9yIChqID0gb25jZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgcGFyZW50ID0gb25jZXNbal0udHlwZSA/XG4gICAgICAgICAgdGhpcy5faGFuZGxlcnNbb25jZXNbal0udHlwZV0gOlxuICAgICAgICAgIG9uY2VzW2pdLnBhdHRlcm4gP1xuICAgICAgICAgICAgdGhpcy5faGFuZGxlcnNDb21wbGV4IDpcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZXJzQWxsO1xuXG4gICAgICAgIHBhcmVudC5zcGxpY2UocGFyZW50LmluZGV4T2Yob25jZXNbal0pLCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIHVuYmluZCBhbGwgbGlzdGVuZXJzIGFuZCBtYWtlIGl0IGltcG9zc2libGUgdG8gZXZlclxuICAgKiByZWJpbmQgYW55IGxpc3RlbmVyIHRvIGFueSBldmVudC5cbiAgICovXG4gIEVtaXR0ZXIucHJvdG90eXBlLmtpbGwgPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMudW5iaW5kQWxsKCk7XG4gICAgdGhpcy5faGFuZGxlcnMgPSBudWxsO1xuICAgIHRoaXMuX2hhbmRsZXJzQWxsID0gbnVsbDtcbiAgICB0aGlzLl9oYW5kbGVyc0NvbXBsZXggPSBudWxsO1xuICAgIHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcblxuICAgIC8vIE5vb3BpbmcgbWV0aG9kc1xuICAgIHRoaXMudW5iaW5kQWxsID1cbiAgICB0aGlzLm9uID1cbiAgICB0aGlzLm9uY2UgPVxuICAgIHRoaXMub2ZmID1cbiAgICB0aGlzLmVtaXQgPVxuICAgIHRoaXMubGlzdGVuZXJzID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGRpc2FibGVkIHRoZSBlbWl0dGVyLCB3aGljaCBtZWFucyBpdHMgZW1pdCBtZXRob2Qgd2lsbCBkb1xuICAgKiBub3RoaW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtFbWl0dGVyfSBSZXR1cm5zIHRoaXMuXG4gICAqL1xuICBFbWl0dGVyLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgZW5hYmxlcyB0aGUgZW1pdHRlci5cbiAgICpcbiAgICogQHJldHVybiB7RW1pdHRlcn0gUmV0dXJucyB0aGlzLlxuICAgKi9cbiAgRW1pdHRlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBWZXJzaW9uOlxuICAgKi9cbiAgRW1pdHRlci52ZXJzaW9uID0gJzMuMS4xJztcblxuXG4gIC8vIEV4cG9ydDpcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cylcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG4gICAgZXhwb3J0cy5FbWl0dGVyID0gRW1pdHRlcjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG4gICAgZGVmaW5lKCdlbW1ldHQnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRW1pdHRlcjtcbiAgICB9KTtcbiAgZWxzZVxuICAgIHRoaXMuRW1pdHRlciA9IEVtaXR0ZXI7XG59KS5jYWxsKHRoaXMpO1xuIiwie0Jhb2JhYiwgZDN9ID0gcmVxdWlyZSBcIi4vZGVwc1wiXG5JbnRlcmFjdGl2ZSA9IHJlcXVpcmUgJy4vaW50ZXJhY3RpdmUnXG4jIyNcbmludGVyYWN0aXZlIHRhYnVsYXIgZGF0YSwgb3B0aW1pemVkIGZvciB0aGUgYnJvd3NlclxuXG5AZXhhbXBsZSBDcmVhdGUgYSBuZXcgaW50ZXJhY3RpdmUgQ29mZmVlVGFibGVcbiAgdGFibGUgPSBuZXcgQ29mZmVlVGFibGVcbiAgICBuYW1lOiBcIlBvbHlnb25cIlxuICAgIHJlYWRtZTogXCJBIHJlY3RhbmdsZVwiXG4gICAgbWV0YWRhdGE6IHt4Oidob3Jpem9udGFsIGRpcmVjdGlvbicseTondmVydGljYWwgZGlyZWN0aW9uJ31cbiAgICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gICAgdmFsdWVzOiBbWzEsIDNdLFsyLCA4XSxbMywxM11dXG5cbkBleGFtcGxlIEFkZCBhIGNvbHVtbiBvZiBkYXRhIHdpdGggQ29uY2F0XG4gIHRhYmxlLmNvbmNhdFxuICAgIGNvbHVtbnM6XG4gICAgICB6OiBbNSwgNCwgM11cblxuQGV4YW1wbGUgQWRkIHR3byByb3dzIG9mIGRhdGEgd2l0aCBDb25jYXRcbiAgdGFibGUuY29uY2F0XG4gICAgdmFsdWVzOiBbXG4gICAgICBbNCwgMTgsIDJdXG4gICAgICBbNSwgMjMsIDFdXG4gICAgXVxuXG5AZXhhbXBsZSBBZGQgYSBuZXcgY29sdW1uIHRoYXQgaXMgYSBmdW5jdGlvbiBvZiBleGlzdGluZyBjb2x1bW5zIHggYW5kIHlcbiAgdGFibGUudHJhbnNmb3JtXG4gICAgdDogJ3gnLCAneScsICh4LCB5KS0+XG4gICAgICBkMy56aXAoeCwgeSkubWFwICh2KS0+IE1hdGgudGFuIHZbMV0vIHZbMF1cblxuQGV4YW1wbGUgTWFrZSBhIGNoZWNrcG9pbnQgb3Igc3RvcmUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGNvbHVtbnMgYW5kIHZhbHVlcyB0byByZXVzZSBsYXRlci5cbiAgdGFibGUuY29tcHV0ZSgpXG5cbkBleGFtcGxlIENyZWF0ZSBhIG5ldyBjb3B5IHdpdGggdGhlIHggYW5kIGFuZ2xlIGNvbHVtbnNcbiAgdmVjdG9ycyA9IHRhYmxlLnByb2plY3Rpb24gJ3gnLCd0J1xuICAgIC5jb3B5KClcblxuVGhlIHN0YXRlIG9mIHRoZSB0YWJsZSAgaXMgc3RpbGwgdGhlIHByb2plY3Qgb2YgeCBhbmQgdC5cblxuQGV4YW1wbGUgUmV2ZXJ0IHRoZSB0YWJsZSBiYWNrIHRvIHRoZSBsYXN0IGNoZWNrcG9pbnQuXG4gIHRhYmxlLnJld2luZCgpXG5cbk5vdyB0aGUgdGFibGUgaGFzIGZvciBjb2x1bW5zXG5cbiAgYWxlcnQgdGFibGUubmFtZSgpICsgJyBoYXMgJyArIHRhYmxlLmluZGV4KCkubGVuZ3RoICsgJyByb3cgIGFuZCB0aGUgZmllbGRzOiAnICsgdGFibGUuY29sdW1ucygpLmpvaW4oJywgJylbLi4tMl1cblxuQGV4YW1wbGUgQWRkIGEgY2F0ZWdvcmljYWwgY29sdW1uc1xuICB0YWJsZS50cmFuc2Zvcm1cbiAgICAgICdjb2xvcic6ICd5JywgKHkpLT4geS5tYXAgKHYpLT4gWydyZWQnLCdncmVlbicsJ2JsdWUnXVt2ICUlIDEwXVxuICAgIC5jb21wdXRlKClcblxuXG5AZXhhbXBsZSBTZXBhcmF0ZSB0aGUgcmVkIGFuZCB0aGUgZ3JlZW5zLlxuICBncmVlbiA9IHRhYmxlLmZpbHRlciAnY29sb3InLCAoY29sb3IpLT4gY29sb3IgaW4gWydncmVlbiddXG4gICAgLmNvcHkoKVxuICByZWQgPSB0YWJsZS5yZXdpbmQoKS5maWx0ZXIgJ2NvbG9yJywgKGNvbG9yKS0+IGNvbG9yIGluIFsncmVkJ11cbiAgICAuY29weSgpXG5cblNlcGFyYXRpbmcgY29tcHV0ZSBmcm9tIHRoZSB2YWx1ZXMuXG5cbkNvZmZlZVRhYmxlIHN0b3JlcyBhIGhpc3Rvcnkgb2YgdGhlIHRyYW5zZm9ybWF0aW9uc1xuXG5AZXhhbXBsZSBTaG93IFRhYmxlIEV4cHJlc3Npb24gaGlzdG9yeVxuICB0YWJsZS5oaXN0b3J5KClcbiAgdGFibGUuZXhwcmVzc2lvbigpXG5cbmluIHRoZSBuZXh0IGV4YW1wbGUgYW4gZXhwcmVzc2lvbiBpcyBjcmVhdGVkIG9uIHRoZSBncmVlbiB0aGUgdGFibGUgYW5kIGl0c1xuZXhwcmVzc2lvbnMgYXJlIGFwcGxpZWQgdG8gdGhlIHJlZCB0YWJsZS4gIE1ldGhvZHMgYXJlIGNoYWluYWJsZS5cblxuQGV4YW1wbGUgQXBwbHkgZXhwcmVzc2lvbnMgdG8gZ3JlZW4gdGhlbiB1c2UgdGhlIGV4cHJlc3Npb25zIG9uIHJlZFxuICBncmVlbi5zb3J0ICd4J1xuICAgIC51bmlxdWUoKVxuICAgIC50cmFuc2Zvcm1cbiAgICAgIHByb2Q6ICd4JywgJ3knLCAoeCx5KS0+IGQzLnppcCh4LHkpLm1hcCAodiktPiB2WzFdKnZbMF1cblxuICByZWQuZXZhbHVhdGUgZ3JlZW4uaGlzdG9yeSgpXG5cblxuPiBOb24tY29sdW1uL290aGVyIGN1cnNvciBjb250ZW50IGlzIGFuIGFycmF5LlxuXG4jIyNcbmNsYXNzIENvZmZlZVRhYmxlIGV4dGVuZHMgSW50ZXJhY3RpdmVcbiAgdmVyc2lvbjogJzAuMS4wJ1xuICAjIENvbnN0cnVjdCBhIGNvbGxlY3Rpb24gb2YgQ29mZmVlVGFibGUgYm9va3MuXG4gICMgQHBhcmFtIFtTdHJpbmddIHVybF9vcl9yZWNvcmRfYXJyYXkgQSB1cmwgdG8gYSByZW1vdGUgcmVzb3VyY2VcbiAgIyBAcGFyYW0gW3tuYW1lLG1ldGFkYXRhLHJlYWRtZSxjb2x1bW5zLHZhbHVlc31dIHVybF9vcl9yZWNvcmRfYXJyYXkgYSBzdHJ1Y3R1cmVkIG9iamVjdCB0byBjcmVhdGUgYSBuZXcgdGFibGVcbiAgY29uc3RydWN0b3I6ICh1cmxfb3JfcmVjb3JkX2FycmF5LCBkb25lKS0+XG4gICAgaWYgdHlwZW9mKHVybF9vcl9yZWNvcmRfYXJyYXkpIGluIFsnc3RyaW5nJ11cbiAgICAgIGQzLmpzb24gdXJsX29yX3JlY29yZF9hcnJheSwgKGQpPT5cbiAgICAgICAgc3VwZXIgZFxuICAgICAgICBAY3Vyc29yLnNldCAndXJsJywgdXJsX29yX3JlY29yZF9hcnJheVxuICAgIGVsc2VcbiAgICAgIHN1cGVyIHVybF9vcl9yZWNvcmRfYXJyYXlcblxudHJ5XG4gIHdpbmRvdy5Db2ZmZWVUYWJsZSA9IENvZmZlZVRhYmxlXG5jYXRjaFxuICBjb25zb2xlLmxvZyBcIndoYXRldmVyXCJcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvZmZlZVRhYmxlXG4gIGQzXG4gIEJhb2JhYlxufVxuIiwiQmFvYmFiID0gdHJ5XG4gIHJlcXVpcmUgJ2Jhb2JhYidcbmNhdGNoXG4gIHRyeVxuICAgIHJlcXVpcmUgJ0Jhb2JhYidcbiAgY2F0Y2hcbiAgICB3aW5kb3cuQmFvYmFiXG5cbmQzID0gdHJ5XG4gIHJlcXVpcmUgJ2QzJ1xuY2F0Y2hcbiAgd2luZG93LmQzXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEJhb2JhYlxuICBkM1xufVxuIiwie2QzfSA9IHJlcXVpcmUgJy4uL2RlcHMnXG5EZXJpdmVkRGF0YVNvdXJjZSA9IHJlcXVpcmUgJy4uL3RyZWUvZGVyaXZlZF9kYXRhX3NvdXJjZSdcblxuY2xhc3MgRXhwcmVzc2lvbiBleHRlbmRzIERlcml2ZWREYXRhU291cmNlXG4gIHRyYW5zZm9ybTogKHRyYW5zZm9ybWVycyktPlxuICAgIGQzLmVudHJpZXMgdHJhbnNmb3JtZXJzXG4gICAgICAuZm9yRWFjaCAoe2tleSx2YWx1ZX0pPT5cbiAgICAgICAgW2N1cnNvcnMuLi4sZm5dID0gdmFsdWUgPyBbXVxuICAgICAgICBpZiBjdXJzb3JzLmxlbmd0aCA9PSAwICB0aGVuIGN1cnNvcnMgPSBudWxsXG4gICAgICAgIHNtYXJ0X2N1cnNvciA9IGN1cnNvcnM/Lm1hcCgoY29sKT0+IGlmIHR5cGVvZiBjb2wgaW4gWydzdHJpbmcnXSB0aGVuIFsnY29sdW1uX3NvdXJjZScsY29sLCd2YWx1ZXMnXSBlbHNlIGNvbCkgPyBbXVxuICAgICAgICBAX2FkZF9kZXJpdmVkX2NvbHVtbiBrZXksIHNtYXJ0X2N1cnNvciwgZm5cbiAgICBAZXhwcmVzc2lvbi5wdXNoIFsndHJhbnNmb3JtJywgdHJhbnNmb3JtZXJzXVxuICAgIHRoaXNcblxuICBjb25jYXQ6IChhcmdzLi4uKS0+XG4gICAgc3VwZXIgYXJncy4uLlxuICAgIEBleHByZXNzaW9uLnB1c2ggWydjb25jYXQnLCBhcmdzLi4uXVxuXG4gICMjI1xuICBQcm9qZWN0IHNlbGVjdHMgYSBzdWJzZXQgb2YgY29sdW1uc1xuICBAZXhhbXBsZSBTZWxlY3Rpb24gdGhlIGluZGV4LCB4LCBhbmQgeVxuICAgIHRhYmxlLnByb2plY3Rpb24gJ2luZGV4JywneCcsJ3knXG4gICMjI1xuICBwcm9qZWN0aW9uOiAoY29sdW1ucy4uLiktPlxuICAgIEB2YWx1ZXMuc2V0IEBjb2wgY29sdW1ucy4uLlxuICAgIEBjb2x1bW5zLnNldCBjb2x1bW5zLi4uXG4gICAgQGV4cHJlc3Npb24ucHVzaCBbJ3Byb2plY3Rpb24nLCBjb2x1bW5zLi4uXVxuICAgIHRoaXNcblxuICAjIyNcbiAgRmlsdGVyIGVsZW1lbnRzIGNvbHVtbnMgYmFzZWQgb24gYSBwcmVkaWNhdGUgZnVuY3Rpb24uXG4gIEBwYXJhbSBbU3RyaW5nXSBjb2x1bW5zIGEgbGlzdCBvZiBjb2x1bW5zIHRvIGluY2x1ZGUgaW4gdGhlIHByZWRpY2F0ZSBmdW5jdGlvblxuICBAcGFyYW0gW0Z1bmN0aW9uXSBmbiBhIHByZWRpY2F0ZSBmdW5jdGlvbiB3aXRoIGFjY2VzcyB0byBlYWNoIG9mIHRoZSBjb2x1bW5zLlxuXG4gIEBleGFtcGxlIEZpbHRlciBjb2x1bW5zIGBgeGBgIGFuZCBgYHlgYFxuICAgIHRhYmxlLmZpbHRlciAneCcsJ3knLCAoeCx5KS0+IHggPiAwIGFuZCB5IDwgNVxuICAjIyNcbiAgZmlsdGVyOiAoY29sdW1ucy4uLiwgZm4pLT5cbiAgICB2YWx1ZXMgPSBAY29sIGNvbHVtbnMuLi5cbiAgICBuZXdfdmFsdWVzID0gdmFsdWVzLmZpbHRlciBmblxuICAgIEBpbmRleC5zZXQgbmV3X3ZhbHVlcy5tYXAgKHYpPT4gdmFsdWVzLmluZGV4T2YgdlxuICAgIEB2YWx1ZXMuc2V0IHZhbHVlc1xuICAgIEBleHByZXNzaW9uLnB1c2ggWydmaWx0ZXInLCBjb2x1bW5zLi4uLCBmbi50b1N0cmluZygpXVxuICAgIHRoaXNcblxuICAjIyNcbiAgQ29uY2F0ZW5hdGUgbmV3IHZhbHVlcyB0byB0aGUgdGFibGUuXG4gIEBwYXJhbSBbT2JqZWN0XSBuZXdfdmFsdWVzIHJlc3BvbmRzIHRvIHRoZSBrZXlzIGBgY29sdW1uc2BgIGFuZCBgYHZhbHVlc2BgIHRvXG4gIGFwcGVuZCBpbiB0aGUgY29sdW1uIGRpcmVjdGlvbiBvciByb3cgZGlyZWN0aW9uLCByZXNwZWN0aXZlbHkuXG4gIEBleGFtcGxlIEFkZCBhIFR3byBSb3dzXG4gICAgdGFibGUuY29uY2F0XG4gICAgICB2YWx1ZXM6IFtcbiAgICAgICAgWy0zLDRdXG4gICAgICAgIFsxLDldXG4gICAgICBdXG4gIEBleGFtcGxlIEFkZCBPbmUgQ29sdW1uLiAgVGhlIEFycmF5IGhhcyBhIGxlbmd0aCBvZiBzaXggYmVjYXVzZSB0d28gcm93cyB3ZXJlIGp1c3QgYWRkZWQuXG4gICAgdGFibGUuY29uY2F0XG4gICAgICBjb2x1bW5zOlxuICAgICAgICB6OiBbLTMsNCwxLDksNiwtNF1cbiAgIyMjXG4gIGNvbmNhdDogKHZhbHVlX29iamVjdCktPlxuICAgIHN1cGVyIHZhbHVlX29iamVjdFxuICAgIEBleHByZXNzaW9uLnB1c2ggWydjb25jYXQnLHZhbHVlX29iamVjdF1cbiAgICB0aGlzXG5cbiAgIyMjXG4gIEFwcGx5IGEgZnVuY3Rpb24gdG8gYSBjb2x1bW5cbiAgQGV4YW1wbGUgQXBwbHkgYSBmdW5jdGlvbiB0byB4IGRlcGVuZGluZyBvbiB5XG4gICAgdGFibGUuYXBwbHkgJ3gnLCBbJ3gnLCd5J10sICh4LHkpLT4gZDMuemlwKHgseSkubWFwICh2KS0+IGQzLm1lYW4gdlxuICAjIyNcbiAgYXBwbHk6IChhcmdzLi4uKS0+XG4gICAgc3VwZXIgYXJncyAuLi5cbiAgICBAZXhwcmVzc2lvbi5wdXNoIFsnYXBwbHknLGFyZ3MubWFwIChhcmcpLT4gSlNPTi5wYXJzZSBKU09OLnN0cmluZ2lmeSBhcmddXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFeHByZXNzaW9uXG4iLCJ7ZDN9ID0gcmVxdWlyZSAnLi9kZXBzJ1xuQ29mZmVlVGFibGUgPSByZXF1aXJlICcuL2NvZmZlZXRhYmxlJ1xuVHJlZSA9IHJlcXVpcmUgJy4vdHJlZSdcblxuIyMjXG5BbiBJbnRlcmFjdGl2ZSBUYWJsZSB1c2VzIGltbXV0YWJsZSBjdXJzb3IgdHJlZXMgdG8gdHJhY2sgdGhlIGV2b2x1dGlvbiBoaXN0b3J5IGF0IGEgdGFibGUgc3RhdGUuXG4gIEl0IGlzIHNpbWlsYXIgdG8gYSBEYXRhRnJhbWUgYmVjYXVzZSBpdCdzIHJvd3MgYW5kIGNvbHVtbnMgY2FuIGJlIGFjY2Vzc2VkIGluZGVwZW5kZW50bHkuICBUaGVcbnN0YXRlIG9mIHRoZSB0YWJsZSBjYW4gYmUgdXNlZCB0byBwdWJsaXNoIGRhdGEtZHJpdmVuIGNvbnRlbnQgdG8gYSB3ZWJwYWdlLiAgTW9zdFxuZGF0YSB0aGF0IGlzIGdlbmVyYXRlZCBmcm9tIGFuIEFQSSBlbmRwb2ludCBjYW4gYmUgcmVwcmVzZW50ZWQgYXMgYSB0YWJsZTsgbW9yZVxuY29tcGxleCBzY2VuYXJpb3MgY2FuIGJlIGRlY291cGxlZCB0byBpbmRlcGVuZGVudCB0YWJsZXMuICBEZWNvdXBsZWQgdGFibGVzIGNhbiBtYW5pcHVsYXRlZFxuaW5kZXBlbmRlbnRseSBhbmQgam9pbmVkIHdpdGggb3RoZXIgdGFibGVzLlxuXG4jIyNcbmNsYXNzIENvZmZlZVRhYmxlLkludGVyYWN0aXZlIGV4dGVuZHMgVHJlZVxuICByZXNldDogKCktPlxuICAgIEBjdXJzb3IuZGVlcE1lcmdlIEBfaW5pdC5nZXQoKVxuICAgIHRoaXNcbiAgIyMjXG4gIENyZWF0ZSBhIG5ldyBpbnRlcmFjdGl2ZSB0YWJsZS5cbiAgQHBhcmFtIFt7Y29sdW1ucywgdmFsdWVzLCByZWFkbWUsIG1ldGFkYXRhfV0gcmVjb3JkX29yaWVudF9kYXRhIFJlY29yZCBvcmllbnQgZGF0YSBjb250YWlucyB0aGUgY29sdW1ucyBhbmRcbiAgdmFsdWVzLlxuXG4gIEBleGFtcGxlIENyZWF0ZSBhIG5ldyBpbnRlcmFjdGl2ZSB0YWJsZVxuICAgIHRhYmxlID0gbmV3IENvZmZlZVRhYmxlXG4gICAgICBjb2x1bW5zOiBbJ3gnLCAneSddXG4gICAgICB2YWx1ZXM6IFtcbiAgICAgICAgWzEsIDJdXG4gICAgICAgIFszLCA4XVxuICAgICAgICBbLTEsNF1cbiAgICAgICAgWzUsN11cbiAgICAgIF1cbiAgIyMjXG4gIGNvbnN0cnVjdG9yOiAocmVjb3JkX29yaWVudF9kYXRhKS0+XG4gICAgc3VwZXIgcmVjb3JkX29yaWVudF9kYXRhXG4gICAgQGNvbXB1dGUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvZmZlZVRhYmxlLkludGVyYWN0aXZlXG4iLCJ7ZDN9ID0gcmVxdWlyZSAnLi4vZGVwcydcblRhYmxlID0gcmVxdWlyZSgnLi9pbmRleCcpXG5cbmNsYXNzIFRhYmxlLkNvbHVtbkRhdGFTb3VyY2UgZXh0ZW5kcyByZXF1aXJlICcuL2RhdGEnXG4gIGNvbnN0cnVjdG9yOiAodmFsdWVzLCBjb2x1bW5zKS0+XG4gICAgQG5ld19tYWpvcl9jdXJzb3IgJ2NvbHVtbl9zb3VyY2UnLCAge30sICdmaWVsZCdcbiAgICBzdXBlciB2YWx1ZXMsIGNvbHVtbnNcbiAgICB0bXAgPSB7fTtcbiAgICBAcmF3LmdldCgpLmZvckVhY2ggKGMpPT4gQF9hZGRfZGVyaXZlZF9jb2x1bW4gIGNcblxuICAjIyMgQXBwZW5kIGNvbHVtbnMgb3Igcm93cyB3aXRob3V0IG1vbmtleXMgIyMjXG4gIGNvbmNhdDogKHtjb2x1bW5zLHZhbHVlc30pLT5cbiAgICBpZiBjb2x1bW5zP1xuICAgICAgI2FsZXJ0IEpTT04uc3RyaW5naWZ5IGNvbHVtbnNcbiAgICAgIGQzLmVudHJpZXMoY29sdW1ucykuZm9yRWFjaCAoe2tleSwgdmFsdWV9KT0+XG4gICAgICAgICMjIyBBcHBlbmQgdGhlIHZhbHVlIHRvIHRoZSByYXcgY29sdW1ucyAjIyNcbiAgICAgICAgQHJhdy5wdXNoIGtleVxuICAgICAgICBAdmFsdWVzLnNldCBAdmFsdWVzLmdldCgpLm1hcCAocm93LGkpPT4gW3Jvdy4uLix2YWx1ZVtpXV1cbiAgICAgICAgQF9hZGRfZGVyaXZlZF9jb2x1bW4ga2V5XG4gICAgc3VwZXIgdmFsdWVzLCBjb2x1bW5zXG5cbiAgY29sOiAoY29sdW1ucy4uLiktPlxuICAgIGlmIGNvbHVtbnMubGVuZ3RoID09IDAgdGhlbiBjb2x1bW5zID0gQGNvbHVtbnMuZ2V0KClcbiAgICBkMy56aXAgY29sdW1ucy5tYXAoIChjKSA9PiBAZmllbGQuZ2V0KGMsJ3ZhbHVlcycpKS4uLlxuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYmxlLkNvbHVtbkRhdGFTb3VyY2VcbiIsIlRhYmxlID0gcmVxdWlyZSgnLi9pbmRleCcpXG5cbmNsYXNzIFRhYmxlLkNvbHVtbiBleHRlbmRzIHJlcXVpcmUgJy4uL3RyZWUvZXhwcmVzc2lvbidcblxubW9kdWxlLmV4cG9ydHMgPSBUYWJsZS5Db2x1bW5cbiIsIlRhYmxlID0gcmVxdWlyZSgnLi9pbmRleCcpXG5cbmNsYXNzIFRhYmxlLkRhdGFTb3VyY2UgZXh0ZW5kcyByZXF1aXJlICcuL3Jvd3MnXG4gIGNvbmNhdDogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIHZhbHVlcz8uZm9yRWFjaCAocm93KT0+IEB2YWx1ZXMucHVzaCByb3dcbiAgICBzdXBlciB2YWx1ZXM/Lmxlbmd0aCA/IDBcbiAgICB0aGlzXG5cbm1vZHVsZS5leHBvcnRzID0gIFRhYmxlLkRhdGFTb3VyY2VcbiIsIkludGVyYWN0aXZlID0gcmVxdWlyZSAnLi9pbmRleCdcbkV4cHJlc3Npb25zID0gcmVxdWlyZSAnLi4vZXhwcmVzc2lvbnMnXG5cbiMgVGFibGUgYXNzaWducyBtZXRhZGF0YSB0byB0aGUgSW50ZXJhY3RpdmUgZGF0YSBzb3VyY2VcbiMgQSB0YWJsZSBpcyBkZXNjcmliZSBieTpcbiMgKiBfdmFsdWVzXyAtIEEgbGlzdCBvZiBsaXN0cyBjb250YWluaW5nIHRoZSByb3cgZW50cmllcyBpbiB0aGUgdGFibGUuXG4jICogX2NvbHVtbnNfIC0gVGhlIGNvbHVtbiBuYW1lcyBpbiB0aGUgdGFibGUsIHRoZSBjb2x1bW4gbmFtZXMgbWFwIHRoZSBlbnRyaWVzIGluIGVhY2ggcm93XG4jICogX21ldGFkYXRhXyAtXG4jIFRoZSB0YWJsZSBrZXlzICBuYW1pbmcgaXMgaW5zcGlyZWQgYnkgYGBwYW5kYXMuRGF0YUZyYW1lLnRvX2RpY3Qob3JpZW50PSdyZWNvcmRzJykuXG5cbmNsYXNzIEludGVyYWN0aXZlLlRhYmxlIGV4dGVuZHMgRXhwcmVzc2lvbnNcbiAgIyBAcGFyYW0gW0FycmF5XSBjb2x1bW5zIFRoZSBuYW1lIG9mIHRoZSB0YWJsZSBjb2x1bW5zXG4gICMgQHBhcmFtIFtBcnJheV0gdmFsdWVzIFRoZSB2YWx1ZXMgb2YgdGhlIHRhYmxlLlxuICAjIEBwYXJhbSBbT2JqZWN0XSBtZXRhZGF0YSBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY29sdW1uc1xuICBjb25zdHJ1Y3RvcjogKHt2YWx1ZXMsIGNvbHVtbnN9KS0+XG4gICAgIyMgVGhlIHRhYmxlIGNhbiBiZSByZW5hbWVkICMjI1xuICAgIEBuZXdfbWFqb3JfY3Vyc29yICduYW1lJywgbmFtZSA/IFwiU29tZSBuYW1lXCJcbiAgICBzdXBlciB2YWx1ZXMsIGNvbHVtbnNcbiAgICBAY29tcHV0ZSgpXG4jIyNcbkEgZm9ybWF0dGVkIHN0cmluZyBvZiB0aGUgdGFibGUuXG4jIyNcbkludGVyYWN0aXZlLlRhYmxlOjp0b19zdHJpbmcgPSAtPlxuIyMjXG5KU09OaWZ5IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSB0YWJsZS5cblxuQHBhcmFtIFtCb29sZWFuXSBpbmRleCBUcnVlIGluY2x1ZGVzIHRoZSBpbmRleCBpbiB0aGUgSlNPTiBzdHJpbmcuXG4jIyNcbkludGVyYWN0aXZlLlRhYmxlOjp0b19qc29uID0gKCktPlxuICBKU09OLnN0cmluZ2lmeVxuICAgIGNvbHVtbnM6IEBkZXJpdmVkKClcbiAgICB2YWx1ZXM6IEBjb2x1bW5fZGF0YV9zb3VyY2UoQGRlcml2ZWQoKS4uLilcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmFjdGl2ZS5UYWJsZVxuIiwiVGFibGUgPSByZXF1aXJlKCcuL2luZGV4JylcblxuY2xhc3MgVGFibGUuUm93IGV4dGVuZHMgcmVxdWlyZSAnLi9jb2x1bW5zJ1xuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgIEBuZXdfbWFqb3JfY3Vyc29yICdpbmRleCcsIFswLi52YWx1ZXMubGVuZ3RoLTFdXG4gICAgQGluZGV4LnN0YXJ0UmVjb3JkaW5nIDFcbiAgICBAbGVuZ3RoID0gKCktPiBAdmFsdWVzLmdldCgpLmxlbmd0aFxuICAgIHN1cGVyIGNvbHVtbnNcbiAgICBAX2FkZF9kZXJpdmVkX2NvbHVtbiAnaW5kZXgnLCBbWydpbmRleCddXSwgKGluZGV4KS0+IGluZGV4XG5cbiAgIyMjXG4gIFVwZGF0ZSB0aGUgaW5kZXggd2hlbiBhIHJvdyBpcyBjb25jYXRlbmF0ZWQuXG4gICMjI1xuICBjb25jYXQ6IChsZW5ndGgpLT5cbiAgICBpID0gQGZpZWxkLmdldCAnaW5kZXgnLCAndmFsdWVzJ1xuICAgIG1heCA9IE1hdGgubWF4KGkuLi4pICsgMVxuICAgIFswLi5sZW5ndGgtMV0ubWFwIChqKT0+IEBpbmRleC5wdXNoIG1heCArIGpcblxuXG4gICMjI1xuICB0YWJsZS5pbG9jIFsyLDNdXG4gIHRhYmxlLl9pbmRleC5zZXQgWzIsMywwLDFdXG4gIHRhYmxlLmlsb2MgWzIsM11cbiAgQHBhcmFtIFtBcnJheV0gc2VsZWN0aW9uIHNlbGVjdGlvbiBvZiB0aGUgaW5kaWNlcyBvZiB0aGUgcm93cy5cbiAgIyMjXG4gIGlsb2M6ICAoc2VsZWN0aW9uKS0+XG4gICAgaW5kZXggPSBAaW5kZXguZ2V0KClcbiAgICB2YWx1ZXMgPSBAdmFsdWVzLmdldCgpXG4gICAgaWYgc2VsZWN0aW9uP1xuICAgICAgdmFsdWVzID0gc2VsZWN0aW9uLm1hcCAoaSk9PiB2YWx1ZXNbaV1cbiAgICB2YWx1ZXNcblxuICAjIyNcbiAgdGFibGUubG9jIFsyLDNdXG4gIHRhYmxlLl9pbmRleC5zZXQgWzIsMywwLDFdXG4gIHRhYmxlLmxvYyBbMiwzXVxuICBAcGFyYW0gW0FycmF5XSBzZWxlY3Rpb24gc2VsZWN0aW9uIG9mIHRoZSBpZHMgb2YgdGhlIHJvd3MuXG4gICMjI1xuICBsb2M6IChzZWxlY3Rpb24pLT5cbiAgICBpbmRleCA9IEBpbmRleC5nZXQoKVxuICAgIHZhbHVlcyA9IEB2YWx1ZXMuZ2V0KClcbiAgICBpZiBzZWxlY3Rpb24/XG4gICAgICB2YWx1ZXMgPSBzZWxlY3Rpb24ubWFwIChpKT0+IHZhbHVlc1tpbmRleC5pbmRleE9mIGldXG4gICAgdmFsdWVzXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUYWJsZS5Sb3dcbiIsIlRyZWUgPSByZXF1aXJlICcuL2luZGV4J1xuXG5jbGFzcyBUcmVlLkNvbXB1dGVcbiAgY29tcHV0ZTogKCktPlxuICAgICMjIyBDb21wdXRlIGNoYW5nZXMgdGhlIHN0YXRlIG9mIHRoZSBkYXRhIHRyZWUgIyMjXG4gICAgQGNoZWNrcG9pbnQuZGVlcE1lcmdlXG4gICAgICBuYW1lOiBAbmFtZS5nZXQoKVxuICAgICAgaW5kZXg6IEBjb2wgJ2luZGV4J1xuICAgICAgcmVhZG1lOiBAcmVhZG1lLmdldCgpXG4gICAgICB2YWx1ZXM6IEBjb2woKVxuICAgICAgbWV0YWRhdGE6IEBtZXRhZGF0YS5nZXQoKVxuICAgICAgY29sdW1uczogW0Bjb2x1bW5zLmdldCgpLCBAY29sdW1ucy5nZXQoKV1cblxuICAgICMjIyBUT0RPIFJlbW92ZSBvbGQgY29sdW1ucyAjIyNcbiAgICB0aGlzXG5cbiAgcmV3aW5kOiAoKS0+XG4gICAgQGN1cnNvci5kZWVwTWVyZ2VcbiAgICAgIGluZGV4OiBAY2hlY2twb2ludC5nZXQgJ2luZGV4J1xuICAgICAgY29sdW1uczogQGNoZWNrcG9pbnQuZ2V0ICdjb2x1bW5zJ1xuICAgICAgdmFsdWVzOiBAY2hlY2twb2ludC5nZXQgJ3ZhbHVlcydcbiAgICAgIG1ldGFkYXRhOiBAY2hlY2twb2ludC5nZXQgJ21ldGFkYXRhJ1xuICAgIEByYXcuc2V0IEBjaGVja3BvaW50LmdldCAnY29sdW1ucydcbiAgICB0aGlzXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlLkNvbXB1dGVcbiIsIntCYW9iYWJ9ID0gcmVxdWlyZSAnLi4vZGVwcydcblRyZWUgPSByZXF1aXJlICcuJ1xuXG5jbGFzcyBUcmVlLkRlcml2ZWREYXRhU291cmNlIGV4dGVuZHMgcmVxdWlyZSAnLi4vdGFibGUvY29sdW1uX2RhdGFfc291cmNlJ1xuICBjb25zdHJ1Y3RvcjogKHZhbHVlcywgY29sdW1ucyktPlxuICAgICMjI1xuICAgIFRyYW5zZm9ybSBhZGRzIG5hbWVkIGNvbHVtbnMgdG8gdGhlIHRhYmxlXG4gICAgQHBhcmFtIFtPYmplY3RdIHRyYW5zZm9ybWVycyBpcyBhbiBvYmplY3Qgb2YgbmFtZWQgY29sdW1ucy4gIFRoZSBuZXcgY29sdW1uc1xuICAgIGFyZSBkZWZpbmVkIGJ5IGBgY3Vyc29yc2BgIGFuZCBhIGZ1bmN0aW9uIGBgZm5gYC5cbiAgICBAZXhhbXBsZSBDcmVhdGUgdHdvIG5ldyBjb2x1bW5zIG1lYW4gYW5kIHN0ZC5cbiAgICAgIHRhYmxlLnRyYW5zZm9ybVxuICAgICAgICBtZWFuOiBbJ3gnLCd5JywgKHgseSktPiAoeCt5KS8yIF1cbiAgICAgICAgc3RkOiBbJ3gnLCd5JywgKHgseSktPiAoeCt5KS8yIF1cblxuICAgIGRvbnQgc3RhdGVzIGFyZSB3ZWlyZFxuICAgICMjI1xuICAgIHN1cGVyIHZhbHVlcywgY29sdW1uc1xuICAjIyNcbiAgQ3JlYXRlIGEgbmV3IGludGVyYWN0aXZlIGN1cnNvciB0aGF0IGRlZmluZXMgYSBuZXcgQ29sdW1uIERhdGEgU291cmNlXG4gICMjI1xuICBfYWRkX2Rlcml2ZWRfY29sdW1uOiAobmFtZSwgY3Vyc29ycz1bXSwgZm49bnVsbCApLT5cbiAgICBpZiBjdXJzb3JzLmxlbmd0aCA9PSAwIHRoZW4gY3Vyc29ycyA9IFtbJ2NvbHVtbnMnLDBdLFsndmFsdWVzJ10sWycuJywnbmFtZSddXVxuICAgIGZuID89IChjb2x1bW5zLHZhbHVlcyxjb2x1bW5fbmFtZSktPlxuICAgICAgY29sdW1uX2luZGV4ID0gY29sdW1ucy5pbmRleE9mIGNvbHVtbl9uYW1lXG4gICAgICB2YWx1ZXMubWFwIChyb3dfdmFsdWVzKS0+IHJvd192YWx1ZXNbY29sdW1uX2luZGV4XVxuICAgIEBmaWVsZC5zZXQgbmFtZSxcbiAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB2YWx1ZXM6IEJhb2JhYi5tb25rZXkgY3Vyc29ycy4uLiwgZm5cbiAgICAjIyMgQWx3YXlzIHB1c2ggZGVyaXZlZCBjb2x1bW5zIHRvIHNlY29uZCBwYXJ0IG9mIGNvbHVtbnMgIyMjXG4gICAgdW5sZXNzIG5hbWUgaW4gWydpbmRleCcsIEBjb2x1bW5zLmdldCgpLi4uXVxuICAgICAgQGNvbHVtbnMucHVzaCBuYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZS5EZXJpdmVkRGF0YVNvdXJjZVxuIiwiVHJlZSA9IHJlcXVpcmUoJy4vaW5kZXgnKVxuXG5jbGFzcyBUcmVlLkV4cHJlc3Npb24gZXh0ZW5kcyByZXF1aXJlICcuL2hpc3RvcnknXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBuZXdfbWFqb3JfY3Vyc29yICdleHByZXNzaW9uJ1xuICAgIEBleHByZXNzaW9uLnNldCBbXVxuICAgIEBleHByZXNzaW9uLnN0YXJ0UmVjb3JkaW5nIDIwXG4gICAgc3VwZXIoKVxuXG4gIGV4ZWN1dGU6IChleHByZXNzaW9ucyktPlxuICAgIGV4cHJlc3Npb25zLmZvckVhY2ggIChleHByZXNzaW9uLGV4cHJlc3Npb25fY291bnQpPT5cbiAgICAgIEBbZXhwcmVzc2lvblswXV0gZXhwcmVzc2lvblsxLi5dLi4uXG4gICAgQGNvbXB1dGUoKVxuXG4gIGdldDogKGFyZ3MuLi4pLT4gQGN1cnNvci5nZXQgYXJncy4uLlxuICBzZXQ6IChhcmdzLi4uKS0+IEBjdXJzb3Iuc2V0IGFyZ3MuLi5cblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlLkV4cHJlc3Npb25cbiIsIlRyZWUgPSByZXF1aXJlICcuL2luZGV4JyBcblxuY2xhc3MgVHJlZS5IaXN0b3J5IGV4dGVuZHMgcmVxdWlyZSAnLi9jb21wdXRlJ1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAbmV3X21ham9yX2N1cnNvciAnY2hlY2twb2ludCcsIHt9XG4gICAgc3VwZXIoKVxuICBoaXN0b3J5OiAtPiBAZXhwcmVzc2lvbi5nZXRIaXN0b3J5KClcbiAgY2xlYXJfaGlzdG9yeTogLT4gQGV4cHJlc3Npb24uY2xlYXJIaXN0b3J5KClcbiAgcmVjb3JkOiAoZXhwcmVzc2lvbiktPlxuICAgIEBleHByZXNzaW9uLnB1c2ggZXhwcmVzc2lvblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWUuSGlzdG9yeVxuIiwiIyMjXG5UaGUgVHJlZSBpcyB0aGUgaW50ZXJhY3RpdmUgZGF0YSBzb3VyY2UgZm9yIHRoZSB0YWJsZS4gIEl0IGlzIHJlc3BvbnNpYmxlIGZvclxuKiBTdG9yaW5nIHRoZSBzdGF0aWMgc3RhdGUgb2YgdGhlIHRhYmxlIHZhbHVlcy5cbiogQ3JlYXRpbmcgQ29sdW1uIERhdGEgc291cmNlc1xuKiBDcmVhdGluZyBEZXJpdmVkIERhdGEgc291cmNlc1xuKiBTdG9yeWluZyB0aGUgaGlzdG9yeSBvZiBleHByZXNzaW9ucy5cblxuPiBBbGwgY29udGVudCBvbiB0aGUgbGVhdmVzIG9mIHRoZSB0cmVlIHNob3VsZCBiZSBKU09OaWZpYWJsZS4gIE5vIEphdmFzY3JpcHQgb2JqZWN0cy5cbkJhb2JhYiBtb25rZXlzIG11c3QgcmV0dXJuIGpzb25pZmlhYmxlIHZhbHVlcy5cbiMjI1xue2QzLEJhb2JhYn0gPSByZXF1aXJlICcuLi9kZXBzJ1xuXG5jbGFzcyBUcmVlIGV4dGVuZHMgcmVxdWlyZSAnLi4vdGFibGUnXG4gIGNvbnN0cnVjdG9yOiAoc3RydWN0dXJlZF9kYXRhKS0+XG4gICAgQHRyZWUgPSBuZXcgQmFvYmFiIHN0cnVjdHVyZWRfZGF0YVxuICAgIEBjdXJzb3IgPSBAdHJlZS5zZWxlY3QgMFxuICAgIEBldmVudHMgPSB7fVxuICAgIEBuZXdfbWFqb3JfY3Vyc29yICdpbml0Jywgc3RydWN0dXJlZF9kYXRhXG4gICAgQG5ld19tYWpvcl9jdXJzb3IgJ3JlYWRtZScsIHN0cnVjdHVyZWRfZGF0YS5yZWFkbWUgPyBcIlwiXG4gICAgQGN1cnNvci5zZXQgJ2NvbHVtbnMnLCBbKHN0cnVjdHVyZWRfZGF0YS5jb2x1bW5zID8gW10pLFtdXVxuICAgIEBuZXdfbWFqb3JfY3Vyc29yIFsnY29sdW1ucycsIDBdLCBudWxsLCAncmF3J1xuICAgIEBuZXdfbWFqb3JfY3Vyc29yIFsnY29sdW1ucycsIDFdLCBudWxsLCAnY29sdW1ucydcbiAgICBAbmV3X21ham9yX2N1cnNvciAndmFsdWVzJywgc3RydWN0dXJlZF9kYXRhLnZhbHVlcyA/IFtdXG4gICAgQG5ld19tYWpvcl9jdXJzb3IgJ21ldGFkYXRhJywgc3RydWN0dXJlZF9kYXRhLm1ldGFkYXRhID8ge31cbiAgICBAbmV3X21ham9yX2N1cnNvciAnbmFtZScsIHN0cnVjdHVyZWRfZGF0YS5uYW1lID8gJydcblxuICAgIHN1cGVyIEBjdXJzb3IucHJvamVjdFxuICAgICAgdmFsdWVzOiBbJ3ZhbHVlcyddXG4gICAgICBjb2x1bW5zOiBbJ2NvbHVtbnMnLCAwXVxuXG4gICAgQHRyZWUub24gJ3dyaXRlJywgKGV2ZW50KS0+XG4gICAgICBzd2l0Y2hcbiAgICAgICAgd2hlbiAnaW5kZXgnIGluIGV2ZW50LmRhdGEucGF0aCBhbmQgZXZlbnQuZGF0YS5wYXRoLmxlbmd0aCA9PSAxXG4gICAgICAgICAgdmFsdWVzID0gQGdldCAndmFsdWVzJ1xuICAgICAgICAgIG5ld19pbmRleCA9IEBnZXQgJ2luZGV4J1xuICAgICAgICAgIG9sZF9pbmRleCA9IEBzZWxlY3QoJ2luZGV4JykuZ2V0SGlzdG9yeSgxKVswXSA/IGQzLnJhbmdlIG5ld19pbmRleC5sZW5ndGhcbiAgICAgICAgICBAc2V0ICd2YWx1ZXMnLCBuZXdfaW5kZXgubWFwIChpKT0+IHZhbHVlc1tvbGRfaW5kZXguaW5kZXhPZiBpXVxuXG4gICMjIyBBIG1ham9yIGN1cnNvciBpcyByZWZsZWN0ZWQgaW4gdGhlIHRhYmxlIEFQSSAjIyNcbiAgbmV3X21ham9yX2N1cnNvcjogKG5hbWUsIHNldF92YWx1ZSwgYWxpYXMpLT5cbiAgICBAW2FsaWFzID8gbmFtZV0gPSBAY3Vyc29yLnNlbGVjdCBuYW1lXG4gICAgaWYgc2V0X3ZhbHVlPyB0aGVuIEBbYWxpYXMgPyBuYW1lXS5zZXQgc2V0X3ZhbHVlXG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZVxuIl19
