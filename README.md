# pretty-marbles
Pretty Terminal output for RxJS Marble Tests

## What will it looks like?
```
- Frames --------
|- 1 - - - 2 - - - 3 - - - 4 - - - 5 - - - |
- ACTUAL --------
   _       _       _
 / N \ _ / N \ _ / C \
 \ _ /   \ _ /   \ _ /

- EXCPECTED -----
   _               _
 / N \ _   _   _ / C \
 \ _ /           \ _ /

| Frames | act/exp  | Kind | Value
| ------ | -------- | ---- | ------
|      0 | expected |  N   | "foo"
|      1 | expected |  N   | "foo"
|      2 | expected |  N   | "foo"
|      2 | actual   |  N   | "bar"
|      4 | expected |  -   | -
|      4 | actual   |  N   | "foo"
|      5 | expected |  N   | {"prop1":"bar","prop2":42}
|      5 | actual   |  -   | -
|      9 | expected |  N   | "caz"
|      9 | actual   |  -   | -
|     10 | expected |  N   | "cax"
|     10 | actual   |  N   | "cux"
|     20 | expected |  N   | "buz"
| ------ | -------- | ---- | ------
```
