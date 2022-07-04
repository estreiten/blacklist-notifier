module.exports = {
  hosts: ['mail.domain.com', 'mail.domain2.com'],
  smtp: {
    host: 'smtp.host',
    port: 587,
    auth: {
      user: 'user@host.com',
      pass: 'password'
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  receivers: ['my@mail.com']
}