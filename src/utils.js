/*exported Utils*/

/**
 * @type {Object}
 */
const Utils = {

    /**
     * @param {String} event
     * @param {Function} handler
     * @returns {undefined}
     */
    on (event, handler) {
        if (this.handlers === undefined) {
            this.handlers = {};
        }

        if (this.handlers[event] === undefined) {
            this.handlers[event] = [];
        }

        this.handlers[event].push(handler);
    },

    /**
     * @param {String} event
     * @returns {undefined}
     */
    trigger (event) {
        if (this.handlers === undefined || (this.handlers[event] || []).length === 0) {
            return;
        }

        const args = [].slice.call(arguments, 1);

        this.handlers[event].forEach(handler => {
            handler.apply(null, args);
        });
    },

    /**
     * @param {Function} fn
     * @param {Integer} delay
     * @returns {Function}
     */
    throttle (fn, delay) {
        const args = [].slice.call(arguments);

        let wait = false;

        return () => {
            if (wait === true) {
                return;
            }

            fn.apply(this, args);
            wait = true;

            setTimeout(() => {
                wait = false;
            }, delay);
        };
    },

    /**
     * @param {String} url
     * @returns {undefined}
     */
    parseUrl (url) {
        const parser = document.createElement('a');

        return (() => {
            parser.href = url;

            return {
                url: parser.href,
                hostname: parser.hostname,
                pathname: parser.pathname,
                search: parser.search
            };
        })();
    },
};
