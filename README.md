<h1 align="center">
    Removing of folders and files for Webpack
</h1>

<p align="center">
    A plugin for webpack that removes files and folders before and after compilation.
</p>


## Content

- [Content](#content)
- [Installation](#installation)
- [Support](#support)
- [Usage](#usage)
- [Parameters](#parameters)
    - [How to set](#how-to-set)
    - [Example](#example)
- [Examples](#examples)
- [Contribution](#contribution)
- [License](#license)


## Installation

- With `npm`:
```javascript
npm install remove-files-webpack-plugin
```

- With `yarn`:
```javascript
yarn add remove-files-webpack-plugin
```


## Support

The plugin works on any OS and webpack >= 2.2.0.


## Usage

```javascript
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    plugins: [
        new RemovePlugin({
            before: {
                // parameters for "before compilation" stage.
            },
            after: {
                // parameters for "after compilation" stage.
            }
        })
    ]
};
```


## Parameters

|         Name         |              Type               | Default  |                                                                         Description                                                                          |
| :------------------: | :-----------------------------: | :------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------: |
|         root         |            `string`             |   `.`    |              A root directory.  Not absolute paths will be appended to this.  Defaults to where `package.json` and `node_modules` are located.               |
|       include        |           `string[]`            |   `[]`   |                                                               A folders or files for removing.                                                               |
|       exclude        |           `string[]`            |   `[]`   |                                                                    A files for excluding.                                                                    |
|         test         |         `TestObject[]`          |   `[]`   |                                                                    A folders for testing.                                                                    |
|  TestObject.folder   |            `string`             | Required |                                                                    A path to the folder.                                                                     |
|  TestObject.method   | `(filePath: string) => boolean` | Required |        A method that accepts a file path (`root` + directoryPath + filePath) and  returns value that indicates should be this file be removed or not.        |
| TestObject.recursive |            `boolean`            | `false`  |                                                   Test in all subfolders, not just in `TestObject.folder`.                                                   |
|        trash         |            `boolean`            |  `true`  |                                         Move folders or files to trash (recycle bin) instead of permanent deleting.                                          |
|         log          |            `boolean`            |  `true`  |                                   Prints messages of "info" level  (example: "Which folders or files have been removed").                                    |
|      logWarning      |            `boolean`            |  `true`  |                                      Prints messages of "warning" level  (example: "An items for removing not found").                                       |
|       logError       |            `boolean`            | `false`  |                                          Prints messages of "error" level  (example: "No such file or directory").                                           |
|       logDebug       |            `boolean`            | `false`  |                                            Prints messages of "debug" level  (used for developers of the plugin).                                            |
|       emulate        |            `boolean`            | `false`  |                 Emulate remove process.  Print which folders or files will be removed without actually removing them.  Ignores `log` value.                  |
| allowRootAndOutside  |            `boolean`            | `false`  | Allow remove of a `root` directory or outside the `root` directory.  It is kind of safe mode.  **Don't turn it on, if you don't know what you actually do!** |

#### How to set

You can pass these parameters into both `before` and `after` keys. Each key is optional, but at least one should be specified. 

- `before` - executes before compilation; 
- `after` - executes after compilation.

#### Example

```javascript
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = {
    plugins: [
        new RemovePlugin({
            /**
             * Before compilation removes entire 
             * `./dist` folder to trash.
             */
            before: {
                include: [
                    'dist'
                ]
            },

            /**
             * After compilation removes all files in 
             * `./dist/styles` folder that have `.map` extension
             * to trash.
             */
            after: {
                test: [
                    {
                        folder: 'dist/styles',
                        method: (filePath) => {
                            return new RegExp(/\.map$/, 'm').test(filePath);
                        }
                    } 
                ]
            }
        })
    ]
};
```


## Examples

```javascript
new RemovePlugin({
    /**
     * Before compilation removes entire 
     * `./dist` folder to trash.
     */
    before: {
        include: [
            'dist'
        ]
    },

    /**
     * After compilation removes all css maps 
     * in `./dist/styles` folder to trash except 
     * `popup.css.map` file.
     */
    after: {
        exclude: [
            'dist/styles/popup.css.map'
        ],
        test: [
            {
                folder: 'dist/styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                }
            }
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * After compilation removes all css maps in 
     * `./dist/styles` folder to trash and all subfolders 
     * (e.g. `./dist/styles/header`).
     */
    after: {
        test: [
            {
                folder: 'dist/styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                },
                recursive: true
            }
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Before compilation removes both 
     * `./dist/manifest.json` file and `./dist/js` folder
     * to trash.
     */
    before: {
        root: './dist',
        include: [
            'manifest.json',
            'js'
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * After compilation:
     * - removes all css maps in `./dist/styles` folder to trash.
     * - removes all js maps in `./dist/scripts` folder to trash and 
     * all subfolders (e.g. `./dist/scripts/header`).
     */
    after: {
        root: './dist',
        test: [
            {
                folder: './styles',
                method: (filePath) => {
                    return new RegExp(/\.map$/, 'm').test(filePath);
                }
            },
            {
                folder: './scripts',
                method: (filePath) => {
                    return new RegExp(/\.js.map$/, 'm').test(filePath);
                },
                recursive: true
            }
        ]
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Before compilation permanently removes both 
     * `./dist/manifest.json` file and `./dist/js` folder.
     * Log only works for warnings and errors.
     */
    before: {
        root: './dist',
        include: [
            'manifest.json',
            'js'
        ],
        trash: false,
        log: false,
        logWarning: true,
        logError: true,
        logDebug: false
    }
})
```

```javascript
new RemovePlugin({
    /**
     * Before compilation emulates remove process
     * for a file that outside of the root directory.
     * That file will be removed in trash.
     */
    before: {
        root: '.', // "D:\\remove-files-webpack-plugin-master"
        include: [
            "C:\\Desktop\\test.txt"
        ],
        trash: true,
        emulate: true,
        allowRootAndOutside: true
    }
})
```


## Contribution

Feel free to use [issues](https://github.com/Amaimersion/remove-files-webpack-plugin/issues). [Pull requests](https://github.com/Amaimersion/remove-files-webpack-plugin/pulls) are also always welcome!


## License

[MIT](https://github.com/Amaimersion/remove-files-webpack-plugin/blob/master/LICENSE).
