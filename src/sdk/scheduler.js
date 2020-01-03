// @flow
import Logger from './logger'

type TaskT = {|
  method: (timestamp?: number) => mixed,
  description: string,
  timestamp: number
|}

/**
 * Delayed tasks list
 *
 * @type {Array}
 * @private
 */
let _tasks: Array<TaskT> = []

/**
 * Put the dask in the delayed list
 *
 * @param {Function} method
 * @param {string} description
 */
function delay (method: $PropertyType<TaskT, 'method'>, description: $PropertyType<TaskT, 'description'>): void {
  _tasks.push({method, description, timestamp: Date.now()})
}

/**
 * Flush all delayed tasks
 */
function flush (): void {
  _tasks.forEach((task: TaskT) => {
    if (typeof task.method === 'function') {
      Logger.log(`Delayed ${task.description} task is running now`)
      task.method(task.timestamp)
    }
  })

  _tasks = []
}

/**
 * Destroy all pending tasks
 */
function destroy (): void {
  _tasks = []
}

export {
  delay,
  flush,
  destroy
}
