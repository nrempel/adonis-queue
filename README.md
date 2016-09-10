# Adonis Queue Provider

A job queuing provider that leverages [Bull](https://github.com/OptimalBits/bull) for the AdonisJS framework.

This library provides an easy way to get started with an asynchronous job queue for AdonisJS.

## Install

```
npm install --save adonis-bull
```

## Configure

Register it in `bootstrap/app.js`:

```javascript
const providers = [
  ...
  'adonis-queue/providers/QueueProvider'
]
```

Also consider adding an alias to the provider.

```javascript
const aliases = {
  ...
  Queue: 'Adonis/Addons/Queue'
}
```

Register the commands:

```javascript
const aceProviders = [
  ...
  'adonis-queue/providers/CommandsProvider'
];

...

const commands = [
  ...
  'Adonis/Commands/Queue:Listen'
];
```

Add a configuration file in `config/queue.js`. For example:

```javascript
'use strict';

const Env = use('Env');

module.exports = {
  redis: {
    connectionString: 'redis://localhost:6379'
  }
};

```

## Usage

### Starting the listener

Starting an instance of the queue listener is easy with the included ace command. Simply run `./ace queue:listen`.

The provider looks for jobs in the `app/Jobs` directory of your AdonisJS project and will automatically register a handler for any jobs that it finds.

### Creating your first job

Jobs are easy to create. They live in `app/Jobs` and they are a simple class. They expose the following properties:

| Name        | Required | Type      | Static | Description                                           |
|-------------|----------|-----------|--------|-----------------------------------------------|
| concurrency | false    | number    | true   | The number of concurrent jobs the handler will accept |
| key         | true     | string    | true   | A unique key for this job                             |
| handle      | true     | function  | false  | A function that is called for this job.               |

[Here's an example.](examples/app/Jobs/Example.js)

### Dispatching jobs

Now that your job listener is running and ready to do some asynchronous work, you can start dispatching jobs. 

```javascript
const queue = use('Queue');
const Job = require('./app/Jobs/Example');
const data = { test: 'data' };
queue.dispatch(Job.key, data);
```

## Thanks

Special thanks to the creator(s) of [AdonisJS](http://adonisjs.com/) for creating such a great framework.
