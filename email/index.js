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

    findAprovado(channel);

    findRejeitado(channel);
  });
});

function findAprovado (channel) {
  channel.prefetch(1);

  let queue = 'aprovado';
  channel.consume(queue, function (msg) {
    const secs = msg.content.toString().split('.').length - 1;
    const pedido = JSON.parse(msg.content.toString());

    sendEmail(queue, pedido)

    setTimeout(function () {
      console.log(" [x] Verificado aprovados");
      channel.ack(msg);
    }, secs * 3000);
  }, {
    noAck: false
  });
}

function findRejeitado (channel) {
  channel.prefetch(1);

  let queue = 'rejeitado';
  channel.consume(queue, function (msg) {
    const secs = msg.content.toString().split('.').length - 1;
    const pedido = JSON.parse(msg.content.toString());

    sendEmail(queue, pedido)

    setTimeout(function () {
      console.log(" [x] Verificado rejeitados");
      channel.ack(msg);
    }, secs * 3000);
  }, {
    noAck: false
  });
}

function sendEmail (tipo, pedido) {
  const estrutura = JSON.parse(pedido);
  console.log({ tipo,  estrutura});

  const mailhog = require('mailhog')({
    host: 'mailhog'
  })
  
  mailhog.messages().then(result => console.log(result))
}
