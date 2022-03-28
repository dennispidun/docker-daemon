import { Controller, Get } from 'routing-controllers';
import ResourcesService from '@services/resources.service';
import { Service } from 'typedi';

@Controller('/resources')
@Service()
export class ResourcesController {
  constructor(private service: ResourcesService) {}

  @Get()
  async info() {
    return await this.service.getStats();
  }
}
