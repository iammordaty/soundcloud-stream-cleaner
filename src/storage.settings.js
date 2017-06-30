/*global Storage*/

/**
 * @type {Object}
 */
Storage.Settings = {

    /**
     * @type {String}
     */
    get storageKey () {
        return 'settings';
    },

    /**
     * @type {String}
     */
    get defaultSettings () {
        return {
            delete_mode: 'hide', // [ 'hide', 'compact' ]
        };
    },

    /**
     * @param {String} key
     * @param {*} value
     * @returns {undefined}
     */
    set (key, value) {
        if (this.settings === undefined) {
            this.settings = Storage.get(this.storageKey) || this.defaultSettings;
        }

        this.settings[key] = value;

        Storage.set(this.storageKey, this.settings);
    },

    /**
     * @param {String} key
     * @returns {*}
     */
    get (key) {
        this.settings = Storage.get(this.storageKey) || this.defaultSettings;

        return this.settings[key];
    },

    /**
     * @param {Object} key
     * @returns {Boolean}
     */
    has (key) {
        this.settings = Storage.get(this.storageKey) || this.defaultSettings;

        return Object.keys(this.settings).includes(key);
    }
};
