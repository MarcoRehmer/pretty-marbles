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

- VALUE TABLE ---
| Frame | Kind | Value 
|   1   |  N   | { foo: 'bar', cux: 42 } <-- green, if actual matches expected
|   2   |  N   | { foo: 'bar', cux: 42 } <-- red, if different values on same frame
|  10   |  N   | { foo: 'bar', cux: 42 } <-- orange, if value expected, but no emission on frame
```
