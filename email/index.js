#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const nodemailer = require('nodemailer');

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
    }, secs * 1000);
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
    }, secs * 1000);
  }, {
    noAck: false
  });
}

function sendEmail (tipo, pedido) {
  const estrutura = pedido
  
  const transport = nodemailer.createTransport({
    host: process.env.MAILHOG_HOST,
    port: '1025',
    auth: null
  });

  transport.sendMail({
    from: 'Leonaro Lima <leonardortlima@gmail.com>',
    to: 'Paulo Freitas <paulosfjunior@gmail.com>',
    subject: 'Pedido ' + tipo,
    html: estrutura.toString()
  })
  .then((d) => console.log('Enviado'))
  .catch((e) => console.log({e}));

  console.log({ tipo, estrutura });
}
