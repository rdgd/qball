/*
  In order to remove the message from the queue, your handler must return the message that is being processed
  or your handler must return a promise which resolves the message being processed.
*/

let SQS;
let QueueOwnerAWSAccountId;
let intervalHandle;

function getQueueUrlByName (QueueName) {
  return SQS.getQueueUrl({ QueueName, QueueOwnerAWSAccountId }).promise().catch(err => { throw err; });
}

function ack (QueueUrl, messages) {
  let msgs = messages.filter(m => m);
  let isPromisified = msgs.length > 0 && msgs[0].then;
  function _ack (msgs) {
    return Promise.all(msgs.map(m => SQS.deleteMessage({ QueueUrl, ReceiptHandle: m.ReceiptHandle }).promise().catch((err => { throw err; }))));
  }
  return isPromisified ? Promise.all(msgs).then(_ack) : _ack(msgs);
}

function handle (handler, QueueUrl, messages) {
  return messages.map(m => handler(m, ack.bind(null, QueueUrl, [m])));
}

function processQueue (QueueUrl, handler, maxMessages) {
  return SQS.receiveMessage({ QueueUrl, MaxNumberOfMessages: maxMessages}).promise()
    .then(response => response.Messages)
    .then(handle.bind(null, handler, QueueUrl))
    .then(ack.bind(null, QueueUrl))
    .catch(err => { throw err; });
}

function init (AWS, accountId, queueName, maxMessages = 10, interval = 3000) {
  QueueOwnerAWSAccountId = accountId;
  SQS = new AWS.SQS();

  const API = { start, stop };
  function stop () { clearInterval((() => intervalHandle)()); }
  function start (handler) {
    return getQueueUrlByName(queueName)
      .then(queue => {
        intervalHandle = setInterval(processQueue.bind(null, queue.QueueUrl, handler, maxMessages), interval);
        return API;
      })
      .catch(err => console.error(err.stack));
  }

  return API; 
}

module.exports = init;