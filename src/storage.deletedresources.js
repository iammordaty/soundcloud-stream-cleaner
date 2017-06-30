/*global Storage*/

/**
 * @type {Object}
 */
Storage.DeletedResources = {

    /**
     * @type {String}
     */
    get storageKey () {
        return 'deleted_resources`';
    },

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    set (resource) {
        if (this.has(resource) === true) {
            return;
        }

        this.deletedResources.push(resource.url);

        Storage.set(this.storageKey, this.deletedResources);
    },

    /**
     * @param {Object} resource
     * @returns {Boolean}
     */
    has (resource) {
        if (this.deletedResources === undefined) {
            this.deletedResources = Storage.get(this.storageKey) || [];
        }

        return this.deletedResources.includes(resource.url);
    },

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    remove (resource) {
        if (this.has(resource) === false) {
            return;
        }

        this.deletedResources.splice(this.deletedResources.indexOf(resource.url), 1);

        Storage.set(this.storageKey, this.deletedResources);
    }
};
