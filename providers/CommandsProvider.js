'use strict';

const ServiceProvider = require('adonis-fold').ServiceProvider;

class CommandsProvider extends ServiceProvider {
  * register () {
    this.app.bind('Adonis/Commands/Queue:Listen', function (app) {
      const Queue = app.use('Adonis/Addons/Queue');
      const Listen = require('../src/Commands/Listen');
      return new Listen(Queue);
    });
  }
}

module.exports = CommandsProvider;
