/*exported Stream*/
/*global Utils, Resource*/

/**
 * Represents the stream
 *
 * @type {Object}
 */
const Stream = {

    /**
     * @param {HTMLElement} app
     * @returns {undefined}
     */
    init (app) {
        this.app = app;

        this.observe();
    },

    /**
     * @private
     * @returns {undefined}
     */
    observe () {
        const observers = {};

        observers.app = new MutationObserver(this.throttle(() => {
            const stream = this.app.querySelector('#content div.stream ul');

            if (observers.stream !== undefined || stream === null) {
                if (observers.stream !== undefined && stream === null) {
                    observers.stream.disconnect();

                    delete observers.stream;
                }

                return;
            }

            stream.querySelectorAll('.soundList__item').forEach((element) => {
                this.trigger('changed', Resource.create(element));
            });

            observers.stream = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                    mutations[i].addedNodes.forEach((element) => {
                        this.trigger('changed', Resource.create(element));
                    });
                }
            });

            observers.stream.observe(stream, {
                childList: true
            });
        }), 500);

        observers.app.observe(this.app, {
            childList: true,
            subtree: true
        });
    },
};

Object.assign(Stream, Utils);
