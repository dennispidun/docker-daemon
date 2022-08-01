import { spec } from './swagger';
import * as fs from 'fs';

fs.writeFile(process.cwd() + '/swagger.json', JSON.stringify(spec, null, 2), err => {
  if (err) {
    throw err;
  }
  console.log('Swagger.json was saved');
});
