import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { useContainer, useExpressServer } from 'routing-controllers';
import { CREDENTIALS, LOG_FORMAT, NODE_ENV, ORIGIN, PORT } from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { Container } from 'typedi';
import NodeService from '@services/node.service';
import http from 'http';
import swaggerUi from 'swagger-ui-express';

import { spec } from '@utils/swagger';

class App {
  public app: express.Application;
  public server: http.Server;
  public env: string;
  public port: string | number;

  constructor(controllers: Function[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(controllers);
    this.initializeErrorHandling();
    this.initializeNode();
    this.initializeSwagger();
  }

  public listen() {
    this.server = this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(controllers: Function[]) {
    useContainer(Container);

    useExpressServer(this.app, {
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
      },
      routePrefix: '/api',
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeNode() {
    const nodeService = Container.get(NodeService);

    nodeService
      .registerNode('http://localhost:9090/api', 'secretKey')
      .then(() => {
        console.log();
      })
      .catch((e: Error) => {
        console.error('Cannot connect to main unit: ', e.message);
        this.server.close(() => {
          process.exit(1);
        });
      });
  }

  private initializeSwagger() {
    if (this.env !== 'development') {
      return;
    }

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

    this.app.get('/api-docs.json', (req, res) => {
      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify(spec, null, 2));
    });
  }
}

export default App;
