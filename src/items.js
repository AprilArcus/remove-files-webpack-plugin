'use strict';


const fs = require('fs');
const path = require('path');
const Utils = require('./utils');


/**
 * Contains directories and files.
 *
 * - available through `directories` and
 * `files` properties respectively.
 */
class Items {
    /**
     * Creates an instance of `Items`.
     */
    constructor() {
        /**
         * @type {string[]}
         * */
        this._directories = [];

        /**
         * @type {string[]}
         * */
        this._files = [];
    }

    /**
     * @returns {string[]}
     * Directories.
     */
    get directories() {
        return this._directories;
    }

    /**
     * Sets directories.
     *
     * @param {string[]} value
     * Value to set.
     */
    set directories(value) {
        this._directories = value;
    }

    /**
     * @returns {string[]}
     * Files.
     */
    get files() {
        return this._files;
    }

    /**
     * Sets files.
     *
     * @param {string[]} value
     * Value to set.
     */
    set files(value) {
        this._files = value;
    }

    /**
     * Crops unecessary folders and files.
     *
     * - it's clears childrens directories or files,
     * whose parents will be removed;
     * - changes `this.directories` and `this.files`.
     *
     * @example
     * this = {
     *   directories: [
     *     'D:/dist/styles/css',
     *     'D:/dist/js/scripts',
     *     'D:/dist/styles',
     *     'D:/test'
     *   ],
     *   files: [
     *     'D:/dist/styles/popup.css',
     *     'D:/dist/styles/popup.css.map',
     *     'D:/dist/manifest.json',
     *     'D:/test.txt'
     *   ]
     * };
     *
     * After cropUnnecessaryItems() will be:
     * this = {
     *   directories: [
     *     'D:/dist/js/scripts',
     *     'D:/dist/styles',
     *     'D:/test'
     *   ],
     *   files: [
     *     'D:/dist/manifest.json',
     *     'D:/test.txt'
     *   ]
     * };
     *
     * because entire styles folder will be removed.
     */
    cropUnnecessaryItems() {
        if (!this.directories.length) {
            return;
        }

        const rightItems = new Items();
        const unnecessaryIndexes = new Set();

        /**
         * - at the moment it is duplicates `isSave()` from `plugin.js`,
         * which leads to big issues with performance and quality of code.
         * So, we need to do refactoring of this.
         *
         * @param {string[]} firstGroup
         * @param {string[]} secondGroup
         * @param {Set<string>} indexes
         */
        const addToUnnecessaryIndexes = (firstGroup, secondGroup, indexes) => {
            for (let itemFirst of firstGroup) {
                itemFirst = Utils.escape(
                    path.resolve(itemFirst)
                );

                const regexpForFile = new RegExp(`(^${itemFirst})`, 'm');
                const regexpForFolder = new RegExp(`(^${itemFirst})(.+)`, 'm');

                // eslint-disable-next-line guard-for-in
                for (const itemSecond in secondGroup) {
                    const item = path.resolve(
                        secondGroup[itemSecond]
                    );
                    const stat = fs.statSync(item);

                    if (stat.isFile()) {
                        const newItem = path.dirname(item);

                        if (regexpForFile.test(newItem)) {
                            indexes.add(itemSecond);
                        }
                    } else {
                        if (regexpForFolder.test(item)) {
                            indexes.add(itemSecond);
                        }
                    }
                }
            }
        };

        /**
         * @param {string[]} firstGroup
         * @param {string[]} secondGroup
         * @param {Set<string>} indexes
         */
        const addToRightGroup = (rightGroup, itemsGroup, indexes) => {
            for (const index in itemsGroup) {
                if (!indexes.has(index)) {
                    rightGroup.push(itemsGroup[index]);
                }
            }
        };

        addToUnnecessaryIndexes(this.directories, this.directories, unnecessaryIndexes);
        addToRightGroup(rightItems.directories, this.directories, unnecessaryIndexes);

        unnecessaryIndexes.clear();

        addToUnnecessaryIndexes(rightItems.directories, this.files, unnecessaryIndexes);
        addToRightGroup(rightItems.files, this.files, unnecessaryIndexes);

        this.directories = rightItems.directories.slice();
        this.files = rightItems.files.slice();
    }

    /**
     * Trims a root.
     *
     * - should be used only for pretty printing;
     * - changes `this.directories` and `this.files`.
     *
     * @param {string} root
     * A root value that should be trimmed.
     */
    trimRoot(root) {
        const method = (value) => {
            if (value.indexOf(root) === 0) {
                value = value.replace(root, '');
            }

            return value;
        };

        this.directories = this.directories.map(method);
        this.files = this.files.map(method);
    }
}


module.exports = Items;
