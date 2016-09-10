'use strict';

const ServiceProvider = require('adonis-fold').ServiceProvider;

class QueueProvider extends ServiceProvider {
  * register () {
    this.app.singleton('Adonis/Addons/Queue', function (app) {
      const Helpers = app.use('Adonis/Src/Helpers');
      const Config = app.use('Adonis/Src/Config');
      const Queue = require('../src/Queue');
      return new Queue(Helpers, Config);
    });
  }
}

module.exports = QueueProvider;
