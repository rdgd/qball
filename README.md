# Qball
## What is Qball?
Qball is a library which simplifies processing AWS SQS queues. Normally you need to obtain queue urls, read from a queue, handle the messages, and delete the messages from the queue after you have processed the message successfully. Instead, at a high level, with Qball all you need to do is initialize it and tell it what function you want to process your queue messages.

## Installation
* You will need to install the qball library `npm install qball --save`
* You will also need to install the aws-sdk-library `npm install aws-sdk --save`

## Usage
### Example
The following is a basic example configuration to get up and running. It will read messages from the queue "my-queue-name" which is owned by AWS account "123456789" 5 messages at a time every 10 seconds. For each message, it will log out to the console and then delete the message from the queue.
```
let AWS = require('aws-sdk'); // Include aws-sdk in your module
const qball = require('qball'); // Include qball in your module
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const region = 'us-east-1';
const AWS_ACCOUNT_ID = '123456789';
const numMessagesToRead = 5;
const pollingInterval = 10000;
AWS.config.update({ accessKeyId, secretAccessKey, region });

let qb = init(AWS, AWS_ACCOUNT_ID, 'my-queue-name', numMessagesToRead, pollingInterval); // Initialize qball

function handler (msg) { console.log(msg); return msg; } // Define a handler that will process each message read from the queue

qb.start(handler); // Start polling

```

In the above example, the message gets removed from the queue because the message is returned from the handler function. There is an second argument passed to the handler as well, a function, which you can invoke to indicate that you are done processing the message and wish it to be deleted. An example of this would be:

```
function handler (message, delMsg) {
  console.log(message);
  delMsg();
}
```
This library is also Promise friendly, so if you handler is a Promise chain you can return the message at the end of the chain, or invoke the delete message argument all the same.

## API Reference
### `init`

The only function exported by the Qball module. 
#### Syntax
`init(AWS, accountId, queueName, maxMessages, interval)`
#### Parameters
`AWS` (object) an instance of the `aws-sdk` library

`accountId` (string) the value of the target queue's AWS account ID

`queueName` (string) the name of the target queue

`maxMessages` (integer) (defaults to 10) the number of messages to be read from the queue at once from 1 - 10

`interval` (integer) (defaults to 3000) how often the queue should be polled in milliseconds
#### Return Value
An API object with `start` and `stop` methods

---

### `start`

Method of the API object returned by the `init` `start` and `stop` functions. Begins polling the configured queue.
#### Syntax
`init(...).start(handler)`
#### Parameters
`handler` (function) processes queue messages. Accepts two arguments: message and (optional) deleteMessage function
#### Return Value
A Promise, the value of the argument passed to the next `.then()` function is an API object with `start` and `stop` methods

---

### `stop`

Method of the API object returned by the `init` `start` and `stop` functions. Stops polling the configured queue.
#### Syntax
`init(...).stop()`
#### Parameters
none
#### Return Value
A Promise, the value of the argument passed to the next `.then()` function is an API object with `start` and `stop` methods