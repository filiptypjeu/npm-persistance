# localstorage wrapper for persistant variables

## Usage
```ts
// using node-localstorage as an example
import { LocalStorage } from "node-localstorage";
const ls = new LocalStorage("/");

const numbers = new Variable<number[]>("numbers", [1, 2], ls);

// Setting the values
numbers.set([]);
numbers.set([3, 4], "domain");

// Getting the values
numbers.get();         // []
numbers.get("domain"); // [3, 4]

// Resetting the values back to the default values
numbers.clear();
numbers.clear("domain");

// Getting the default values
numbers.get();         // [1, 2]
numbers.get("domain"); // [1, 2]
```
