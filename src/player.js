/*exported Player*/
/*global Promise, Resource, Utils*/

/**
 * Represents the track player
 *
 * @type {Object}
 */
const Player = {

    /**
     * @param {HTMLElement} app
     * @returns {undefined}
     */
    init (app) {
        this.app = app;

        this.controls = {};
        this.direction = 'forward';

        this.getElement().then((element) => {
            this.element = element;
            this.resourceElement = element.querySelector('.playbackSoundBadge');

            this.controls = {
                prev: this.element.querySelector('.playControls__control.playControls__prev'),
                play: this.element.querySelector('.playControls__control.playControls__play'),
                next: this.element.querySelector('.playControls__control.playControls__next'),
            };

            this.observe();
        });
    },

    /**
     * @returns {undefined}
     */
    prev () {
        if (this.element === undefined) {
            return;
        }

        this.controls.prev.dispatchEvent(new Event('click'));
    },

    /**
     * @returns {undefined}
     */
    next () {
        if (this.element === undefined) {
            return;
        }

        this.controls.next.dispatchEvent(new Event('click'));
    },

    /**
     * @returns {undefined}
     */
    skip () {
        if (this.direction === 'forward') {
            this.next();
        } else if (this.direction === 'backward') {
            this.prev();
        }
    },

    /**
     * @returns {Object|null}
     */
    getResource () {
        return this.resourceElement !== undefined ? Resource.create(this.resourceElement) : null;
    },

    /**
     * @returns {String|undefined}
     */
    get state () {
        if (this.controls.play === undefined) {
            return undefined;
        }

        return this.controls.play.classList.contains('playing') ? 'playing' : 'paused';
    },

    /**
     * @returns {String|undefined}
     */
    get playbackDirection () {
        return this.direction;
    },

    /**
     * @private
     * @returns {undefined}
     */
    observe () {
        const observers = {};

        let lastState;

        observers.state = new MutationObserver(() => {
            const state = this.state;

            if (state !== lastState) {
                this.trigger('statechanged', this.state);

                lastState = state;
            }
        });

        observers.state.observe(this.controls.play, {
            attributes: true,
            attributeFilter: [ 'class' ]
        });

        observers.resource = new MutationObserver(() => {
            this.trigger('resourcechanged', Resource.create(this.resourceElement));
        });

        observers.resource.observe(this.resourceElement, {
            childList: true
        });

        this.app.addEventListener('keydown', (event) => {
            if (event.repeat === true || event.shiftKey === false) {
                return;
            }

            // TODO: event.keyCode is deprecated
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key

            if (event.keyCode === 37) {
                this.direction = 'backward';
            } else if (event.keyCode === 39) {
                this.direction = 'forward';
            }
        }, true);

        this.controls.prev.addEventListener('click', () => {
            this.direction = 'backward';
        }, true);

        this.controls.next.addEventListener('click', () => {
            this.direction = 'forward';
        }, true);
    },

    /**
     * @private
     * @returns {Promise}
     */
    getElement () {
        return new Promise((resolve) => {
            const observer = new MutationObserver(this.throttle(() => {
                const element = this.app.querySelector('.playControls');

                if (element !== null) {
                    observer.disconnect();

                    resolve(element);
                }
            }), 500);

            observer.observe(this.app, {
                childList: true,
                subtree: true
            });
        });
    },
};

Object.assign(Player, Utils);
