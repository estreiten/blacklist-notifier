const fs = require('fs');
const os = require('os');
const { spawn } = require("child_process");
const mailService = require('./mail.js');
const hosts = require('./config').hosts;
const isWin = os.platform() === "win32"
const spawnParams = isWin ? { shell: true } : {}

const log = (txt) => {
  console.log(`${new Date().toISOString()}  ${txt}`)
}

const notify = (host, logFile, out) => {
  fs.writeFileSync(logFile, out)
  mailService.send(`Blacklist update: ${host}`, `Blacklist information updated for ${host}`, out)
}

for (let index = 0; index < hosts.length; index++) {
  const host = hosts[index];
  log(`Blacklist check for '${host}' started`)
  const logFile = `logs/${host}.log`
  const process = spawn(`${__dirname}/blcheck`, [host], spawnParams)
  let out = ''
  process.stdout.on('data', data => {
    out += `${data}\n`
  })
  process.stderr.on('data', data => {
    out += `== Stderr == \r\n${data}\n`
  })
  process.on('error', err => {
    out += `error ${err.name}: ${err.message}\n`
  })
  process.on('close', code => {
    out += `==== The output is ${code} ====\n`
    if (fs.existsSync(logFile)) {
      const last = fs.readFileSync(logFile)
      if (last.toString() !== out) {
        log(`Status changed for '${host}', sending notification`)
        notify(host, logFile, out)
      }
    } else {
      log(`Status changed for '${host}', sending notification`)
      notify(host, logFile, out)
    }
    log(`Blacklist check for '${host}' completed with status ${code}`)
  })
}
