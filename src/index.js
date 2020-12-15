#!/usr/bin/env node

console.clear();

const process = require('process');
const niceTry = require('nice-try');
const inquirer = require('inquirer');
const fs = require('fs');
const cliProgress = require('cli-progress');
const axios = require('axios').default;
const download = require('download');

const isFileinCWD = fs.existsSync('memories_history.json');
let asnwer = {};

try {
  (async () => {
    if (isFileinCWD) {
      asnwer = await inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'memories_history.json found! Hit ENTER to continue?',
        default: true,
      });

      if (!asnwer.continue) process.exit(0);
      const data = await niceTry.promise(async () =>
        JSON.parse(fs.readFileSync('memories_history.json'))
      );

      if (!data) {
        console.log('[ERR]! : Invalid JSON File');
        process.exit(0);
      }

      if (!('Saved Media' in data)) {
        console.log('[ERR]! : Invalid JSON File');
        process.exit(0);
      }

      const urls = niceTry(() =>
        data['Saved Media']
          .map((_d) => ({
            timestamp: _d.Date,
            type: _d['Media Type'],
            link: _d['Download Link'],
          }))
          .sort((a, b) => a.type < b.type)
      );

      if (!urls) {
        console.log('[ERR]! : Invalid JSON File');
        process.exit(0);
      }

      asnwer = await inquirer.prompt({
        type: 'input',
        name: 'out_folder',
        message: 'Enter output directory name:',
        default: 'memories',
        validate: (input) => !fs.existsSync(input),
      });
      const dist = asnwer.out_folder;

      asnwer = await inquirer.prompt({
        type: 'list',
        name: 'downloadables',
        message: 'What do you want to download',
        choices: ['both', 'images only', 'videos only'],
        default: 0,
      });
      const downloadables = asnwer.downloadables;

      if (downloadables === 'both') downloadAllMemories(urls, dist);
      else if (downloadables === 'images only') downloadImagesOnly(urls, dist);
      else if (downloadables === 'videos only') downloadVideosOnly(urls, dist);
    } else {
      console.log(
        "memories_history.json NOT Found!\nPlease make sure you are in the right directory and 'memories_history.json' exists."
      );
      process.exit(1);
    }
  })();
} catch (err) {
  //
}

const downloadAllMemories = (urls, dist) => {
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(urls.length, 0);

  let index = 0;

  urls.forEach(async (t) => {
    try {
      await save_snap(t.link, t.type, dist);
      bar.update(++index);
    } catch (e) {
      //
    }
  });
};

const downloadImagesOnly = (urls, dist) => {
  const images = urls.filter((url) => url.type === 'PHOTO');

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(images.length, 0);

  let index = 0;

  images.forEach(async (t) => {
    try {
      await save_snap(t.link, t.type, dist);
      bar.update(++index);
    } catch (e) {
      //
    }
  });
};

const downloadVideosOnly = (urls, dist) => {
  const videos = urls.filter((url) => url.type === 'VIDEO');

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(videos.length, 0);

  let index = 0;

  videos.forEach(async (t) => {
    try {
      await save_snap(t.link, t.type, dist);
      bar.update(++index);
    } catch (e) {
      //
    }
  });
};

const save_snap = (url, type, dist) => {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const res = await axios.post(url.split('?')[0], url.split('?')[1]);
        if (type === 'PHOTO') await download(await res.data, `${dist}/images`);
        else if (type === 'VIDEO')
          await download(await res.data, `${dist}/videos`);
        resolve();
      } catch (err) {
        reject();
      }
    })();
  });
};
