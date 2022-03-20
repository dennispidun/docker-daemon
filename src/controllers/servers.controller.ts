import {Body, Controller, Get, HttpCode, Param, Post, Put, QueryParam, UseBefore} from 'routing-controllers';

import ServersService from "@services/servers.service";
import {CreateServerDto} from "@dtos/server.dto";
import {HttpException} from "@exceptions/HttpException";
import {validationMiddleware} from "@middlewares/validation.middleware";
import {Service} from "typedi";

export enum ServerAction {
  START = "START",
  STOP = "STOP",
  RESTART = "RESTART"
}

@Controller("/server")
@Service()
export class ServersController {

  constructor(private service: ServersService) {
  }

  @Get()
  async list() {
    return await this.service.getServers();
  }

  @Get('/:idOrName')
  async get(@Param('idOrName') idOrName: string) {
    return await this.service.getServer(idOrName);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() serverData: CreateServerDto) {
    await this.service.createServer(serverData)
    return { message: 'created' }
  }

  @Put('/:idOrName')
  async action(@QueryParam("action") action: ServerAction, @Param('idOrName') idOrName: string) {
    if (!ServerAction[action]) {
      throw new ActionNotValidException();
    }

    await this.service.runAction(idOrName, action)

    return { message: 'Action sent to \'' + idOrName + '\'' };
  }
}

class ActionNotValidException extends HttpException {

  constructor() {
    super(400, "Action is not valid!");
  }

}
