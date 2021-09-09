import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import { resolve } from 'path';

import TestUtil from '../_utils/testUtil';
import { logger } from '../../src/logger';

import UploadHandler from './../../src/uploadHandler';
import testUtil from '../_utils/testUtil';

describe('#UploadHandler test suite', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation();
  });

  describe('#registerEvents', () => {
    test('should call onFIle and onFinish functions on Busboy instance', () => {
      const uploadHandler = new UploadHandler({ io: ioObj, socketId: '01' });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      const headers = {
        'content-type': 'multipart/form-data; boundary=',
      };

      const onFinish = jest.fn();
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

      const fileStream = TestUtil.generateReadableStream([
        'chunk',
        'of',
        'data',
      ]);
      busboyInstance.emit('file', 'fieldname', fileStream, 'filename');

      busboyInstance.listeners('finish')[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalled();
    });
  });

  describe('#onFile', () => {
    test('given a stream file it should save it on disk', async () => {
      const chunks = ['hey', 'jude'];
      const downloadsFolder = '/tmp';

      const handler = new UploadHandler({
        io: ioObj,
        socketId: '01',
        downloadsFolder,
      });

      const onData = jest.fn();

      jest
        .spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData));

      const onTransform = jest.fn();

      jest
        .spyOn(handler, handler.handlerFileBytes.name)
        .mockImplementation(() =>
          TestUtil.generateTransformStream(onTransform)
        );

      const params = {
        fieldname: 'video',
        file: TestUtil.generateReadableStream(chunks),
        filename: 'mockFile.md',
      };

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunks.join());
      expect(onTransform.mock.calls.join()).toEqual(chunks.join());

      const expectedFileName = resolve(
        handler.downloadsFolder,
        params.filename
      );
      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFileName);
    });
  });

  describe('#handlerFileBytes', () => {
    test('should call emit function and it is a tranform string', async () => {
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);

      const handler = new UploadHandler({
        io: ioObj,
        socketId: '01',
      });

      const messages = ['hello'];
      const source = testUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = testUtil.generateWritableStream(onWrite);

      await pipeline(source, handler.handlerFileBytes('fileName.txt'), target);

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);

      expect(onWrite).toHaveBeenCalledTimes(messages.length);
      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });
  });
});
