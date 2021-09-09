import BusBoy from 'busboy';
import fs from 'fs';
import { pipeline } from 'stream/promises';

import { logger } from './logger.js';

export default class uploadHanlder {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.ON_UPLOAD_EVENT = 'file-upload';
  }

  handlerFileBytes(fileName) {
    async function* handleData(source) {
      let processedAlready = 0;

      for await (const chunk of source) {
        yield chunk;
        processedAlready += chunk.length;

        this.io
          .to(this.socketId)
          .emit(this.ON_UPLOAD_EVENT, { processedAlready, fileName });
        logger.info(
          `File ${fileName} got ${processedAlready} bytes to ${this.socketId}`
        );
      }
    }

    return handleData.bind(this);
  }

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
