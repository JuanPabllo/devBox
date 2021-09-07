import { describe, test, expect, jest } from '@jest/globals';
import Routes from '../../src/routes.js';

describe('#Routes test suit', () => {
  const defaultParams = {
    request: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      method: '',
      body: {},
    },
    response: {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    },
    values: () => Object.values(defaultParams),
  };

  describe('#setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes();
      const ioObject = {
        to: (id) => ioObject,
        emit: (event, message) => {},
      };

      routes.setSocketInstance(ioObject);
      expect(routes.io).toStrictEqual(ioObject);
    });
  });

  describe('#handler', () => {
    test('given an inexistent route ir shoul choose default route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = 'inexistent';

      await routes.handler(...params.values());
      expect(params.response.end).toHaveBeenCalledWith('Hello world');
    });

    test('it should set any request with CORS enable', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = 'inexistent';

      await routes.handler(...params.values());
      expect(params.response.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*'
      );
    });

    test('given method OPTIONS it shoul choose options route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = 'OPTIONS';

      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(204);
      expect(params.response.end).toHaveBeenCalled();
    });

    test('given method POST it shoul choose post route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = 'POST';

      jest.spyOn(routes, routes.post.name).mockResolvedValue();

      await routes.handler(...params.values());
      expect(routes.post).toHaveBeenCalled();
    });

    test('given method GET it shoul choose get route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };
      params.request.method = 'GET';

      jest.spyOn(routes, routes.get.name).mockResolvedValue();

      await routes.handler(...params.values());
      expect(routes.get).toHaveBeenCalled();
    });
  });

  describe('#get', () => {
    test('given method GET it should list all files downloaded', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams,
      };

      const filesStatusesMock = [
        {
          size: '13.1 kB',
          lastModified: '2021-09-06T20:13:19.795Z',
          owner: 'juanpablo',
          file: 'file.png',
        },
      ];

      jest
        .spyOn(routes.fileHelper, routes.fileHelper.getFileStatus.name)
        .mockResolvedValue(filesStatusesMock);

      params.request.method = 'GET';
      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(
        JSON.stringify(filesStatusesMock)
      );
    });
  });
});
