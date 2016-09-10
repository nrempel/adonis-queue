'use strict';

const co = require('co');
const fs = require('fs');
const Bull = require('bull');
const path = require('path');
const CatLog = require('cat-log');
const logger = new CatLog('adonis:queue');
const Ioc = require('adonis-fold').Ioc;

/**
 * @module Queue
 * @description Interface to the Bull job queue library
 */
class Queue {
  constructor (Helpers, Config) {
    this.logger = new CatLog('adonis:queue');
    this.jobsPath = path.join(Helpers.appPath(), 'Jobs');
    this.jobsPath = path.normalize(this.jobsPath);
    this.connectionString = Config.get('queue.redis.connectionString');
    if (!this.connectionString) {
      throw new Error('Specify connection under config/queue file');
    }
    this.registeredJobs = [];
  }

  /**
   * @returns {*}
   * @public
   */
  getInstance (key) {
    return Bull(key, this.connectionString);
  }

  /**
   * Dispatch a new job.
   *
   * @public
   */
  dispatch(key, data) {
    if (typeof key !== 'string') {
      throw new Error(`Expected job key to be of type string but got <${typeof key}>.`);
    }
    return this.getInstance(key).add(data);
  }

  /**
   * Start queue to process all jobs defined in app/Jobs
   *
   * @public
   */
  listen () {
    try {
      const jobFiles = fs.readdirSync(this.jobsPath);
      jobFiles.forEach(file => {
        const filePath = path.join(this.jobsPath, file);
        try {
          const Job = require(filePath);
          
          // Get instance of job class
          const jobInstance = Ioc.make(Job);

          // Every job must expose a key
          if (!Job.key) {
            throw new Error(`No key found for job: ${filePath}`);
          }

          // If job concurrency is not set, default to 1
          if (Job.concurrency === undefined) {
            Job.concurrency = 1;
          }

          // If job concurrecny is set to an invalid value, throw error
          if (typeof Job.concurrency !== 'number') {
            throw new Error(`Job concurrency value must be a number but instead it is: <${Job.concurrency}>`);
          }

          // Every job must expose a handle function
          if (!jobInstance.handle) {
            throw new Error(`No handler found for job: ${filePath}`);
          }

          // Track currently registered jobs in memory
          this.registeredJobs.push(Job);

          // Register job handler
          this.getInstance(Job.key).process(Job.concurrency, function (job, done) {
            co(jobInstance.handle.bind(jobInstance), job.data).then(() => { done() });
          });

        } catch (e) {
          // If this file is not a valid javascript class, print warning and return
          if (e instanceof ReferenceError) {
            this.logger.warn('Unable to import job class <%s>. Is it a valid javascript class?', file);
            return;
          } else {
            this.logger.error(e);
            throw e;
          }
        }
      });
      this.logger.info('queue worker listening for %d jobs', this.registeredJobs.length);
    } catch (e) {
      // If the directory isn't found, log a message and exit gracefully
      if (e.code === 'ENOENT') {
        this.logger.info('The jobs directory <%s> does not exist. Exiting.', this.jobsPath);
      } else {
        // If it's some other error, bubble up exception
        this.logger.error(e);
        throw e;
      }
    }
  }
}

module.exports = Queue;
