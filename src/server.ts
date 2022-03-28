import 'reflect-metadata';
import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import { ServersController } from '@controllers/servers.controller';
import validateEnv from '@utils/validateEnv';
import { ResourcesController } from '@controllers/resources.controller';

validateEnv();

const app = new App([IndexController, ServersController, ResourcesController]);
app.listen();
