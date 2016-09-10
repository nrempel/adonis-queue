'user strict';

const Ioc = require('adonis-fold').Ioc;
const Command = Ioc.use('Adonis/Src/Command');

class Listen extends Command {

  constructor (Queue) {
    super();
    this.queue = Queue;
  }

  get signature () {
    return 'queue:listen';
  }

  get description () {
    return 'Start the queue listener.';
  }

  * handle (options, flags) {
    yield this.queue.listen();
  }
}

module.exports = Listen;
