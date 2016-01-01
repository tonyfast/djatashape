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
| `build-test` | generate JS tests from Literate CoffeeScript in `src/test/` |
| `build` | generate UMD'd JS from CoffeeScript in `src/` |
| `coverage` | generate coverage report from coverage data |
| `lint` | check for well-formedness |
| `test-coffee` | runs the tests in node, directly against the CoffeeScript, with coverage by Istanbul |
| `test` | run JS tests in node |
| `testem` | continuously run tests in (local, virtual, remote) browsers |
