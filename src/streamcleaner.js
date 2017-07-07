/*exported StreamCleaner*/
/*global Player, Storage, Stream, Hero*/

/**
 * @type {Object}
 */
const StreamCleaner = {

    /**
     * @returns {undefined}
     */
    init () {
        this.app = document.querySelector('#app');

        this.createUi();

        this.createHero();
        this.createPlayer();
        this.createStream();
    },

    /**
     * @private
     * @returns {undefined}
     */
    createUi () {
        this.ui = Object.create(StreamCleaner.Ui);
        this.ui.init();
    },

    /**
     * @private
     * @returns {undefined}
     */
    createHero () {
        this.hero = Object.create(Hero);
        this.hero.init(this.app);

        this.hero.on('changed', (resource) => {
            this.updateResourceUi(resource);
        });
    },

    /**
     * @private
     * @returns {undefined}
     */
    createPlayer () {
        this.player = Object.create(Player);
        this.player.init(this.app);

        this.player.on('resourcechanged', (resource) => {
            if (resource.deleted === true && this.hero.isActive() === false) {
                this.player.skip();
            }
        });
    },

    /**
     * @private
     * @returns {undefined}
     */
    createStream () {
        this.stream = Object.create(Stream);
        this.stream.init(this.app);

        this.stream.on('changed', (resource) => {
            this.updateResourceUi(resource);
        });
    },

    /**
     * @private
     * @param {Object} resource
     * @returns {undefined}
     */
    updateResourceUi (resource) {
        // update resource visibility

        if (resource.deleted === true) {
            this.ui.delete(resource);
        } else {
            this.ui.undelete(resource);
        }

        // update buttons state

        if (resource.subtype === 'player') {
            return;
        }

        const button = (resource.deleted === true)
            ? this.ui.createUndeleteButton(resource)
            : this.ui.createDeleteButton(resource);

        button.addEventListener('click', () => {
            resource.deleted = !resource.deleted;

            this.updateResourceUi(resource);
        }, false);

        this.ui.appendButton(button, resource);
    },
};
