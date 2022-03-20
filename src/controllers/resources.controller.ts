import { Controller, Get } from 'routing-controllers';
import {Docker} from "node-docker-api";
import ServersService from "@services/servers.service";
import {MAX_CPU_CORES, MAX_DISK_SPACE, MAX_MEMORY} from "@config";
import {Container} from "node-docker-api/lib/container";
import ResourcesService from "@services/resources.service";
import {Service} from "typedi";

@Controller("/resources")
@Service()
export class ResourcesController {

  constructor(private service: ResourcesService) {
  }

  @Get()
  async info() {
    return await this.service.getStats();
  }
}
