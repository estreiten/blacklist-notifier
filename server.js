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

const notify = (host, logFile, result) => {
  fs.writeFileSync(logFile, result.urls.join('\r\n'))
  mailService.send(`Blacklist update: ${host}`, `Blacklist information updated for ${host}`, result.html)
}

const parse = (out) => {
  const consoleRegex = /(\(B)|(\[m)|(\[3.m)|(\u001b)/g
  out = out.replace(consoleRegex, '')
  const pivot = out.indexOf('--')
  const data = out.substring(0, pivot)
  const result = out.substring(pivot)
  const urlRegex = /(.*[^(Warning)]\:)/g
  const rawUrls = data.match(urlRegex)
  const urls = rawUrls !== null ? rawUrls.map(url => url.replace(' :', '')) : []
  return {
    urls, 
    html: urls.length > 0 ? result + 'Blacklist sites where detected:<br><br>' + urls.map(url => `- ${url}`).join('<br>') : result
  }
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
    const result = parse(out)
    if (fs.existsSync(logFile)) {
      const last = fs.readFileSync(logFile, 'utf8')
      const lastUrls = last.split(/\r?\n/)
      if ((result.urls.length === 0 && last.length > 0) || (result.urls.length > 0 && (JSON.stringify(lastUrls) !== JSON.stringify(result.urls)))) {
        log(`Status changed for '${host}', sending notification`)
        notify(host, logFile, result)
      }
    } else {
      log(`Status changed for '${host}', sending notification`)
      notify(host, logFile, result)
    }
    log(`Blacklist check for '${host}' completed with status ${code}`)
  })
}
