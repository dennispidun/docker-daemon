import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';

require('@controllers/index');

const storage = getMetadataArgsStorage();
export const spec = routingControllersToSpec(storage, { routePrefix: '/api' }, { info: { title: 'Docker Daemon', version: '0.0.1' } });
