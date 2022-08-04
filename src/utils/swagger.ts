import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';

import * as TJS from 'typescript-json-schema';
import * as fs from 'fs';

require('@controllers/index');

const storage = getMetadataArgsStorage();

const swaggerSpec = routingControllersToSpec(
  storage,
  {},
  {
    info: {
      title: 'Docker Daemon',
      version: '0.0.1',
    },
    servers: [
      {
        url: 'http://localhost:7777/api/',
      },
    ],
  },
);

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

const pathKeys = Object.entries(swaggerSpec.paths).map(p => p[0]);
for (const pathKey of pathKeys) {
  const path = swaggerSpec.paths[pathKey];
  const methodKeys = Object.entries(path).map(m => m[0]);
  for (const methodKey of methodKeys) {
    const method = path[methodKey];
    const oldOperationId = method.operationId;
    method.operationId = method.summary;
    method.summary = oldOperationId;
  }
}

console.log(JSON.stringify(swaggerSpec, null, 2));

export const spec = {
  ...JSON.parse(JSON.stringify(swaggerSpec)),
  components: {
    schemas: schemaForSymbols.definitions,
  },
};

// console.log(JSON.stringify(spec, null, 2));
