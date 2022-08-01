import 'reflect-metadata';
import App from '@/app';
import validateEnv from '@utils/validateEnv';
import { controllers } from '@controllers/index';

validateEnv();

const app = new App(controllers);
app.listen();
