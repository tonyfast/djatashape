# CoffeeTable

## Developing
Get npm.

```bash
npm install
mkdir -p lib/test/lib # funny story
npm run testem
```

## `npm run` _`x`_
| _x_ | does |
|-|-|
| `build-deps` | generate JS dependencies for tests |
| `build-test` | generate JS tests from Literate CoffeeScript in `src/test/` |
| `build` | generate UMD'd JS from CoffeeScript in `src/` |
| `coverage` | report coverage from previous `test-coffee` |
| `lint` | check for well-formedness of CoffeeScript |
| `test-coffee` | runs the tests in node directly against CoffeeScript |
| `test` | run JS tests in node |
| `testem` | continuously run test server to connect to browsers (probably [http://localhost:7357](http://localhost:7357)) |
