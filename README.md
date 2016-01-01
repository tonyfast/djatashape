# CoffeeTable
[![Build Status](https://travis-ci.org/bollwyvl/coffeetable.svg)](https://travis-ci.org/bollwyvl/coffeetable)

## Developing
Get npm.

```bash
npm install
npm run testem
```

## `npm run` _`x`_
`testem` basically does everything

|     _x_       | does                                                        |
|---------------|-------------------------------------------------------------|
| `build`       | generate UMD'd JS from CoffeeScript in `src/`               |
| `build-deps`  | generate JS dependencies for tests                          |
| `build-test`  | generate JS tests from Literate CoffeeScript in `src/test/` |
| `coverage`    | report coverage from previous `test`                        |
| `docs`        | generate API docs                                           |
| `lint`        | check for well-formedness of CoffeeScript                   |
| `test-js`     | run JS tests in node                                        |
| `test`        | runs the tests in node directly against CoffeeScript        |
| `testem`      | continuously build and run tests, serving to browsers (probably [http://localhost:7357](http://localhost:7357)) |
