import { spec } from '@utils/swagger';

const OpenAPI = require('openapi-typescript-codegen');

OpenAPI.generate({
  input: JSON.parse(JSON.stringify(spec)),
  output: './gen',
  clientName: 'NodeDaemon',
  httpClient: 'axios',
});
