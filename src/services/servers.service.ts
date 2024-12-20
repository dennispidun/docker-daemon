import { Server } from '@interfaces/server.interface';
import { CreateServerDto, ServerAction } from '@/dtos/server.dto';
import { Docker } from 'node-docker-api';
import { HttpException } from '@exceptions/HttpException';
import ResourcesService from '@services/resources.service';
import { Service } from 'typedi';

@Service()
class ServersService {
  private docker: Docker = new Docker({ socketPath: '/var/run/docker.sock' });

  private resourcesService: ResourcesService = new ResourcesService();

  async getServers(): Promise<Server[]> {
    const container = await this.docker.container.list({ all: true, filters: { label: ['me.dpidun.game_server'] } });
    return container.map(
      c =>
        ({
          id: c.id.substring(0, 8),
          name: c.data['Names'][0].substring(1, c.data['Names'][0].length),
          ports: c.data['Ports'],
          status: c.data['State'].toUpperCase(),
          image: c.data['Image'],
          createdAt: new Date(c.data['Created'] * 1000).toJSON(),
        } as Server),
    );
  }

  async getServer(idOrName: string): Promise<Server> {
    const container = await this.getGameServerContainerWithIdOrName(idOrName);

    return {
      id: container.id.substring(0, 8),
      name: container.data['Names'][0].substring(1, container.data['Names'][0].length),
      ports: container.data['Ports'],
      status: container.data['State'].toUpperCase(),
      image: container.data['Image'],
      createdAt: container.data['Created'],
    } as Server;
  }

  private async getGameServerContainerWithIdOrName(idOrName: string) {
    const containers = await this.docker.container.list({ all: true, filters: { label: ['me.dpidun.game_server'] } });
    const container = containers.find(
      c => c.id === idOrName || c.id.startsWith(idOrName) || c.data['Names'][0].substring(1, c.data['Names'][0].length) === idOrName,
    );

    if (!container) {
      throw new ServerNotFound();
    }
    return container;
  }

  async createServer(server: CreateServerDto) {
    const memory: number = server.memory || 1024;
    const resourcesUtilization = await this.resourcesService.getStats();
    if (resourcesUtilization.currentMemory + memory > resourcesUtilization.maxMemory) {
      throw new ResourceExhausted();
    }

    const hostPort = server.port <= 0 ? undefined : server.port;
    await this.docker.container
      .create({
        Image: server.image,
        name: server.name,
        Labels: {
          'me.dpidun.game_server': '',
        },
        HostConfig: {
          Memory: memory * 1024 * 1024,
          PortBindings: { '80/tcp': [{ HostIp: server.ip, HostPort: hostPort }] },
        },
      })
      .then(container => {
        container.start();
      })
      .catch(e => {
        throw new ServerNotCreated(e.json.message);
      });
  }

  async runAction(idOrName: string, action: ServerAction) {
    const container = await this.getGameServerContainerWithIdOrName(idOrName);

    if (action === ServerAction.STOP) {
      await container.stop();
    } else if (action === ServerAction.START) {
      await container.start();
    } else if (action === ServerAction.RESTART) {
      await container.restart();
    }
  }
}

export default ServersService;

class ServerNotFound extends HttpException {
  constructor() {
    super(404, 'Server was not found!');
  }
}

class ServerNotCreated extends HttpException {
  constructor(message) {
    super(400, `Server was not created: ${message}`);
  }
}

class ResourceExhausted extends HttpException {
  constructor() {
    super(409, 'Resource exhausted');
  }
}
