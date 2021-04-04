#!/usr/bin/env node
const process = require('process')
const niceTry = require('nice-try')
const inquirer = require('inquirer')
const fs = require('fs')
const cliProgress = require('cli-progress')
const axios = require('axios').default
const download = require('download')

const isFileinCWD = fs.existsSync('memories_history.json')
let answer = {}

try {
  ;(async () => {
    if (isFileinCWD) {
      answer = await inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'memories_history.json found! Hit ENTER to continue.',
        default: true,
      })

      if (!answer.continue) process.exit(0)
      const data = await niceTry.promise(async () =>
        JSON.parse(fs.readFileSync('memories_history.json')),
      )

      if (!data) {
        console.log('[ERR]! : Invalid JSON File')
        process.exit(0)
      }

      if (!('Saved Media' in data)) {
        console.log('[ERR]! : Invalid JSON File')
        process.exit(0)
      }

      const urls = niceTry(() =>
        data['Saved Media']
          .map(_ => ({
            timestamp: _.Date,
            type: _['Media Type'],
            link: _['Download Link'],
          }))
          .sort((a, b) => a.type < b.type),
      )

      if (!urls) {
        console.log('[ERR]! : Invalid JSON File')
        process.exit(0)
      }

      answer = await inquirer.prompt({
        type: 'input',
        name: 'out_folder',
        message: 'Enter output directory name:',
        default: 'memories',
        validate: input => !fs.existsSync(input),
      })

      const dist = answer.out_folder

      answer = await inquirer.prompt({
        type: 'list',
        name: 'downloadables',
        message: 'What do you want to download?',
        choices: ['both', 'images only', 'videos only'],
        default: 0,
      })
      const toBeDownloaded = answer.downloadables

      switch (toBeDownloaded) {
        case 'both':
          downloadMemories('both', urls, dist)
          break
        case 'images only':
          downloadMemories('PHOTO', urls, dist)
          break
        case 'videos only':
          downloadMemories('VIDEO', urls, dist)
          break
        default:
          downloadMemories('both', urls, dist)
          break
      }
    } else {
      console.log(
        "memories_history.json NOT Found!\nPlease make sure you are in the right directory and 'memories_history.json' exists.",
      )
      process.exit(1)
    }
  })()
} catch (err) {
  //
}

const downloadMemories = (type, urls, dist) => {
  const media = type === 'both' ? urls.filter(url => url.type === type) : urls

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(urls.length, 0)

  let index = 0

  urls.forEach(async media => {
    try {
      await save_snap(media.link, media.type, dist)
      bar.update(++index)
    } catch (e) {
      //
    }
  })
}

const save_snap = (url, type, dist) => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const res = await axios.post(url.split('?')[0], url.split('?')[1])
        if (type === 'PHOTO') await download(await res.data, `${dist}/images`)
        else if (type === 'VIDEO')
          await download(await res.data, `${dist}/videos`)
        resolve()
      } catch (err) {
        reject()
      }
    })()
  })
}
