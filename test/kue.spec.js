'use strict';

const path = require('path');
const Queue = require('../src/Queue');
const chai = require('chai');
const expect = chai.expect;
require('co-mocha');

const Helpers = {
  appPath: function () {
    return path.join(__dirname, './app');
  }
};

const HelpersNoKey = {
  appPath: function () {
    return path.join(__dirname, './app_no_key');
  }
};

const HelpersNoHandler = {
  appPath: function () {
    return path.join(__dirname, './app_no_handler');
  }
};

const HelpersNoConcurrency = {
  appPath: function () {
    return path.join(__dirname, './app_no_concurrency');
  }
};

const HelpersBadConcurrency = {
  appPath: function () {
    return path.join(__dirname, './app_bad_concurrency');
  }
};

const HelpersNoJobs = {
  appPath: function () {
    return path.join(__dirname, './app_no_jobs');
  }
};

const HelpersBadJobFile = {
  appPath: function () {
    return path.join(__dirname, './app_bad_job_file');
  }
};

const HelpersNoJobsDir = {
  appPath: function () {
    return path.join(__dirname, './app_no_jobs_dir');
  }
};

const Config = {
  get: function () {
    return {
      redis: {
        connectionString: 'redis://localhost:6379'
      }
    };
  }
};

const NoConfig = {
  get: function () {
    return null;
  }
};

describe('Queue', function () {
  
  it('Should be able to dispatch jobs with data', function * () {
    this.timeout(0);
    const queue = new Queue(Helpers, Config);
    const Job = require('./app/Jobs/GoodJob');
    const data = { test: 'data' };
    const job = yield queue.dispatch(Job.key, data);
    expect(job.queue.name).to.equal(Job.key);
    expect(job.data).to.equal(data);
  });

  it('Should be able to dispatch jobs with no data', function * () {
    this.timeout(0);
    const queue = new Queue(Helpers, Config);
    const Job = require('./app/Jobs/GoodJob');
    const job = yield queue.dispatch(Job.key);
    expect(job.queue.name).to.equal(Job.key);
  });

  it('Should fail gracefully if dispatch is called with no key', function * () {
    this.timeout(0);
    const queue = new Queue(Helpers, Config);
    const Job = require('./app/Jobs/GoodJob');
    expect(function () { queue.dispatch() }).to.throw();
  });

  it('Should instantiate correctly', function * () {
    this.timeout(0);
    const queue = new Queue(Helpers, Config);
    expect(queue.connectionString).to.eql(Config.get('redis.connectionString'));
    expect(queue.jobsPath).to.equal(path.join(Helpers.appPath(), 'Jobs'));
  });
  
  it('Should throw an error if no config exists', function * () {
    this.timeout(0);
    expect(function () { new Queue(Helpers, NoConfig) }).to.throw();
  });

  it('Should load jobs correctly', function * () {
    this.timeout(0);
    const queue = new Queue(Helpers, Config);
    queue.listen();
    expect(queue.registeredJobs.length).to.equal(1);
  });

  it('Should load correctly if no jobs exist', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersNoJobs, Config);
    queue.listen();
    expect(queue.registeredJobs.length).to.equal(0);
  });

  it('Should fail to load gracefully if there is no jobs directory', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersNoJobsDir, Config);
    queue.listen();
    expect(function () { queue.listen() }).not.to.throw();
  });

  it('Should ignore invalid job file types', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersBadJobFile, Config);
    queue.listen();
    expect(function () { queue.listen() }).not.to.throw();
  });

  it('Should fail if job does not provide key', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersNoHandler, Config);
    expect(function () { queue.listen() }).to.throw();
  });

  it('Should fail if job does not provide handler', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersNoKey, Config);
    expect(function () { queue.listen() }).to.throw();
  });

  it('Should default concurrency to 1 if none provided', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersNoConcurrency, Config);
    queue.listen();
    expect(queue.registeredJobs[0].concurrency).to.equal(1);
  });

  it('Should fail if job provides invalid concurrency', function * () {
    this.timeout(0);
    const queue = new Queue(HelpersBadConcurrency, Config);
    expect(function () { queue.listen() }).to.throw();
  });

});
