/**
 * https://stackoverflow.com/questions/53540348/js-async-await-tasks-queue
 */
class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  get size() {
    return this.items.length;
  }
}

module.exports = { Queue }