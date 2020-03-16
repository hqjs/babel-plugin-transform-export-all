# https://hqjs.org
TTransform export all to named imports and export default.

# Installation
```sh
npm install hqjs@babel-plugin-transform-export-all
```

# Transformation
Plugin transforms export all to named imports and export default
```js
export * from "./hello";
export * from "./nameEdit";
export * from "./colorBrowser";
export * from "./colorPicker";
export * from "./sidebar";
```

will turn into
```js
import * as _ref from "./hello";
import * as _ref2 from "./nameEdit";
import * as _ref3 from "./colorBrowser";
import * as _ref4 from "./colorPicker";
import * as _ref5 from "./sidebar";
export default Object.assign({}, _ref, _ref2, _ref3, _ref4, _ref5);
```
