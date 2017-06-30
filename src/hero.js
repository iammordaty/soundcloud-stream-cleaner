/*exported Hero*/
/*global Node, Promise, Resource, Utils*/

/**
 * Represents resource page
 *
 * @type {Object}
 */
const Hero = {

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

        let lastResourceUrl;

        observers.app = new MutationObserver(this.throttle(() => {
            const currentResourceUrl = window.location.href;

            if (lastResourceUrl === currentResourceUrl) {
                return;
            }

            lastResourceUrl = currentResourceUrl;

            const hero = this.app.querySelector('.fullListenHero');

            if (observers.playlist !== undefined || hero === null) {
                if (observers.playlist !== undefined && hero === null) {
                    observers.playlist.disconnect();

                    delete observers.playlist;
                }

                lastResourceUrl = null;

                return;
            }

            const element = this.app.querySelector('#content > div');
            const playlist = element.querySelector('.trackList ul');

            this.trigger('changed', Resource.create(element));

            if (playlist === null) {
                return;
            }

            playlist.querySelectorAll('.trackList__item').forEach((resourceElement) => {
                this.waitForResourceElementLoad(resourceElement).then(() => {
                    this.trigger('changed', Resource.create(resourceElement));
                });
            });

            observers.playlist = new MutationObserver((mutations) => {
                let additional;

                for (let i = 0; i < mutations.length; i++) {
                    mutations[i].addedNodes.forEach((element) => {
                        if (element.nodeType === Node.ELEMENT_NODE && element.classList.contains('trackItem__additional')) {
                            additional = element;
                        }
                    });
                }

                if (additional !== undefined) {
                    const resourceElement = additional.parentNode.parentNode;

                    this.waitForResourceElementLoad(resourceElement).then(() => {
                        this.trigger('changed', Resource.create(resourceElement));
                    });
                }
            });

            observers.playlist.observe(playlist, {
                childList: true,
                subtree: true
            });
        }), 500);

        observers.app.observe(this.app, {
            childList: true,
            subtree: true
        });
    },

    /**
     * @private
     * @param {HTMLElement} element
     * @returns {Promise}
     */
    waitForResourceElementLoad (element) {
        return new Promise((resolve) => {
            const observer = new MutationObserver(() => {
                const share = element.querySelector('.sc-button-share');

                if (share !== null) {
                    resolve();
                }
            });

            observer.observe(this.app, {
                childList: true,
                subtree: true
            });
        });
    },
};

Object.assign(Hero, Utils);
