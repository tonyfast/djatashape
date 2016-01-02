# CoffeeTable
[![Build Status](https://travis-ci.org/bollwyvl/coffeetable.svg?branch=testem-opinion-docs)](https://travis-ci.org/bollwyvl/coffeetable)


## Developing
Get npm.

```bash
npm install
npm run testem
```
to start the test server.


### `npm run` _`x`_

|     _x_       | does                                                        | testem? |
|---------------|-------------------------------------------------------------|---------|
| `build`       | generate UMD'd JS from CoffeeScript in `src/`               | x       |
| `build-deps`  | generate JS dependencies for tests                          | x       |
| `build-test`  | generate JS tests from Literate CoffeeScript in `src/test/` | x       |
| `coverage`    | report coverage from previous `test`                        | x       |
| `docs`        | generate API docs                                           | x       |
| `lint`        | check for well-formedness of CoffeeScript                   |         |
| `test-js`     | run JS tests in node                                        |         |
| `test`        | runs the tests in node directly against CoffeeScript        | x       |
| `testem`      | continuously build and run tests, serving to browsers       |         |

`lint` is not currently run, but might be added at some time, once a code
style standard is adopted.


### `testem` Test Server
The [testem](https://github.com/testem/testem) test server runs basically all
of the code tasks (short of releasing!) on every file change. Here are some
routes with interesting stuff:
- [/](http://localhost:7357) the test results
- [/doc/index.html](http://localhost:7357/doc/index.html) the API doc
- [/coverage/lcov-report/index.html](http://localhost:7357/coverage/lcov-report/index.html) test coverage

It is configured with `./testem.yml`!
