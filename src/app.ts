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

import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import axios from 'axios';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(Controllers: Function[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    this.initializeErrorHandling();
    this.registerNode().then();
  }

  public listen() {
    this.app.listen(this.port, () => {
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

  private initializeScheduler(interval: number, id: string) {
    const scheduler = new ToadScheduler();
    const task = new Task('simple task', () => {
      axios
        .put(`http://localhost:9090/api/nodes/${id}`, {
          apiKey: 'secretKey',
        })
        .then();
    });

    const job1 = new SimpleIntervalJob({ seconds: interval, runImmediately: true }, task, 'id_1');
    scheduler.addSimpleIntervalJob(job1);
  }

  private async registerNode() {
    const nodeReq = await axios.post(`http://localhost:9090/api/nodes`, {
      apiKey: 'secretKey',
      name: 'EU-WEST-2',
      ip: '127.0.0.1',
      cpuCores: 16,
      maxMemory: 16000,
      maxGameServer: 10,
    });

    this.initializeScheduler(nodeReq.data['timeoutInterval'], nodeReq.data['entity']['id']);
  }
}

export default App;
