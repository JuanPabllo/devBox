import { describe, test, expect, jest } from '@jest/globals';
import fs from 'fs';
import FileHelper from './../../src/fileHelper';

describe('#FileHelper', () => {
  describe('#getFileStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 2050,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 39716527,
        size: 13057,
        blocks: 32,
        atimeMs: 1630959200218.7844,
        mtimeMs: 1630959199802.7844,
        ctimeMs: 1630959199806.7844,
        birthtimeMs: 1630959199794.7844,
        atime: '2021-09-06T20:13:20.219Z',
        mtime: '2021-09-06T20:13:19.803Z',
        ctime: '2021-09-06T20:13:19.807Z',
        birthtime: '2021-09-06T20:13:19.795Z',
      };

      const mockUser = 'juanpablo';
      process.env.USER = mockUser;
      const filename = 'file.png';

      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);
      jest
        .spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFileStatus('/tmp');

      const expectedResult = [
        {
          size: '13.1 kB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename,
        },
      ];

      expect(fs.promises.stat).toHaveBeenLastCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectedResult);
    });
  });
});
