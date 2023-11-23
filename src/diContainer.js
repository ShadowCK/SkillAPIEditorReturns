import EventEmitter from 'events';

const diContainer = {
  dependencies: {},
  promises: {},
  events: new EventEmitter(),

  register(key, dependency) {
    this.dependencies[key] = dependency;
    this.events.emit(key, dependency);
  },

  /**
   * Injects a dependency based on the provided key.
   * If the dependency is already available, it returns a resolved Promise with the dependency.
   * If the dependency is not available, it returns a Promise that will be resolved when the dependency becomes available.
   * @param {string} key - The key of the dependency to inject.
   * @returns {Promise<any>} A Promise that resolves to the injected dependency.
   */
  inject(key) {
    if (this.dependencies[key]) {
      // Note: We can also directly return this.dependencies[key] here, but this keeps consistency of the return type.
      return Promise.resolve(this.dependencies[key]);
    }
    if (!this.promises[key]) {
      this.promises[key] = {};
      this.promises[key].promise = new Promise((resolve, reject) => {
        this.promises[key].resolve = resolve;
        this.promises[key].reject = reject;
        this.events.once(key, () => {
          resolve(this.dependencies[key]);
        });
      });
    }
    return this.promises[key].promise;
  },
};

export default diContainer;
