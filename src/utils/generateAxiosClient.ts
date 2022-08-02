import { spec } from '@utils/swagger';
import { CodeGen } from 'swagger-taxos-codegen';
import path from 'path';
import * as fs from 'fs';

const tsSourceCode = CodeGen.generateCode({
  swagger: JSON.parse(JSON.stringify(spec)),
});

const outputFile = path.join(process.cwd(), '/api.ts');
fs.writeFileSync(outputFile, tsSourceCode, { encoding: 'utf-8' });
