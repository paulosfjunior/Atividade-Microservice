#!/usr/bin/env node

const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    const queue = 'pedidos';

    channel.assertQueue(queue, {
      durable: false
    });

    channel.prefetch(1);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, function (msg) {
      const secs = msg.content.toString().split('.').length - 1;
      const pedido = msg.content.toString();

      const aprovado = Math.random() > 0.5;

      if (aprovado) {
        pedidoAprovado(channel, pedido);
      } else {
        pedidoRejeitado(channel, pedido);
      }

      setTimeout(function () {
        console.log(" [x] Done");
        channel.ack(msg);
      }, secs * 500);
    }, {
      noAck: false
    });
  });
});

function pedidoAprovado (channel, pedido) {
  const queue = 'aprovado';
  channel.assertQueue(queue, {
    durable: false
  });
  const msg = pedido;
  channel.sendToQueue(queue, Buffer.from(msg));
  console.log(" [x] Aprovado %s", msg);
}

function pedidoRejeitado (channel, pedido) {
  const queue = 'rejeitado';
  channel.assertQueue(queue, {
    durable: false
  });
  const msg = pedido;
  channel.sendToQueue(queue, Buffer.from(msg));
  console.log(" [x] Rejeitado %s", msg);
}
