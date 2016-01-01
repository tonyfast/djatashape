# CoffeeTable

## Developing
Get npm.

```bash
npm install
mkdir -p lib/test/lib # funny story
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
| `lint`        | check for well-formedness of CoffeeScript                   |
| `test-js`     | run JS tests in node                                        |
| `test`        | runs the tests in node directly against CoffeeScript        |
| `testem`      | continuously build and run tests, serving to browsers (probably [http://localhost:7357](http://localhost:7357)) |
