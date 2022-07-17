const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "swapDexBlockchain",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const consumerSendTxn = kafka.consumer({
  groupId: "swapDexBloackchain",
});

module.exports = { producer, consumerSendTxn };
