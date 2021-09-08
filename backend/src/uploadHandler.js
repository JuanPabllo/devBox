import BusBoy from 'busboy';
import fs from 'fs';
import { pipeline } from 'stream/promises';

import { logger } from './logger.js';

export default class uploadHanlder {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
  }

  handlerFileBytes() {}

  async onFile(fieldName, file, fileName) {
    const saveTo = `${this.downloadsFolder}/${fileName}`;

    await pipeline(
      file,
      this.handlerFileBytes.apply(this, [fileName]),
      fs.createWriteStream(saveTo)
    );

    logger.info(`File [${fileName}] finished`);
  }

  registerEvents(headers, onFinish) {
    const busBoy = new BusBoy({
      headers,
    });

    busBoy.on('file', this.onFile.bind(this));
    busBoy.on('finish', onFinish);

    return busBoy;
  }
}
