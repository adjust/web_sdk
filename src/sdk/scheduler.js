// @flow

type TaskT = {|
  method: (timestamp?: number) => mixed,
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
 */
function delay (method: $PropertyType<TaskT, 'method'>): void {
  _tasks.push({method, timestamp: Date.now()})
}

/**
 * Flush all delayed tasks
 */
function flush (): void {
  _tasks.forEach((task: TaskT) => {
    if (typeof task.method === 'function') {
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
