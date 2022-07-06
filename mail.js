const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('./config');

module.exports = {
  send: async (subject, title, body) => {
    if (config.smtp && config.receivers && config.receivers.length > 0) {
      let transporter = nodemailer.createTransport(config.smtp);
      let mail = fs.readFileSync('template.html', 'utf8');
      mail = mail.replace('{{title}}', title.replace(/(?:\r\n|\r|\n)/g, '<br>'))
      mail = mail.replace('{{body}}', body.replace(/(?:\r\n|\r|\n)/g, '<br>'))

      return new Promise((resolve, reject) => {
        transporter
          .sendMail({
            from: `"The Library at i78s" <${config.smtp.auth.user}>`,
            to: config.receivers,
            subject,
            html: mail
          })
          .then((info) => {
            if (config.smtp.host === 'smtp.ethereal.email') {
              console.info('Message sent: %s', info.messageId);
              // Preview only available when sending through an Ethereal account
              console.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
              resolve(nodemailer.getTestMessageUrl(info));
            }
            resolve()
          })
          .catch(reject);
      });
    }
  }
}
