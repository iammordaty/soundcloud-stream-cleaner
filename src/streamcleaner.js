/*exported StreamCleaner*/
/*global Player, Stream, Hero*/

/**
 * @type {Object}
 */
const StreamCleaner = {

    /**
     * @returns {undefined}
     */
    init () {
        this.app = document.querySelector('#app');

        this.createHero();
        this.createPlayer();
        this.createStream();

        this.setStyles();
    },

    /**
     * @private
     * @returns {undefined}
     */
    createHero () {
        this.hero = Object.create(Hero);
        this.hero.init(this.app);
    },

    /**
     * @private
     * @returns {undefined}
     */
    createPlayer () {
        this.player = Object.create(Player);
        this.player.init(this.app);

        this.player.on('resourcechanged', (resource) => {
            if (resource.deleted === true) {
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
    },

    /**
     * @private
     * @returns {undefined}
     */
    setStyles () {
        GM_addStyle([
            '.ssc-deleted.ssc-compact { margin-bottom: 0 }',
            '.ssc-deleted.ssc-compact .soundContext__targetLink, .ssc-deleted.ssc-compact .sound__body, .ssc-deleted.ssc-hide { visibility: hidden; height: 0px; margin-bottom: 0  }',
            '.ssc-deleted .coverArt__infoItem { display: none }',
            '.ssc-deleted .g-all-transitions-300 { transition: none }',
        ].join(' '));
    },
};
