import { Readable, Writable, Transform } from 'stream';

export default class testUtil {
  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,
      read() {
        for (const item of data) {
          this.push(item);
        }

        this.push(null);
      },
    });
  }

  static generateWritableStream(onData) {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, callBack) {
        onData(chunk);

        callBack(null, chunk);
      },
    });
  }

  static generateTransformStream(onData) {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callBack) {
        onData(chunk);
        callBack(null, chunk);
      },
    });
  }
}
