/*exported Storage*/

/**
 * @type {Object}
 */
const Storage = {

    /**
     * @param {String} key
     * @param {*} value
     * @returns {undefined}
     */
    set (key, value) {
        GM_setValue(key, JSON.stringify(value));
    },

    /**
     * @param {String} key
     * @returns {*}
     */
    get (key) {
        const value = GM_getValue(key) || null;

        if (value === null) {
            return null;
        }

        return JSON.parse(value);
    },

    /**
     * @param {String} key
     * @returns {undefined}
     */
    remove (key) {
        GM_deleteValue(key);
    }
};
