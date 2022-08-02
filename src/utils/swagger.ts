import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';

import * as TJS from 'typescript-json-schema';
import * as fs from 'fs';

require('@controllers/index');

const storage = getMetadataArgsStorage();

const swaggerSpec = routingControllersToSpec(storage, { routePrefix: '/api' }, { info: { title: 'Docker Daemon', version: '0.0.1' } });

const files = fs.readdirSync(__dirname + '/../../src/dtos/').map(f => {
  return 'src/dtos/' + f;
});
const program = TJS.programFromConfig('./tsconfig.json', files);

const settings: TJS.PartialArgs = {
  required: true,
};

const generator = TJS.buildGenerator(program, settings);

const symbols = generator
  .getSymbols()
  .filter(s => {
    return s.fullyQualifiedName.startsWith('"src/');
  })
  .map(s => {
    return s.name;
  });

const schemaForSymbols = generator.getSchemaForSymbols(symbols);

export const spec = {
  ...JSON.parse(JSON.stringify(swaggerSpec)),
  components: {
    schemas: schemaForSymbols.definitions,
  },
};
