import { Controller, Get } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Controller()
export class IndexController {
  @Get('/')
  index() {
    return 'OK';
  }
}
