import { ResourcesUtilization } from '@interfaces/resource-utilization.interface';
import { Docker } from 'node-docker-api';
import { Container } from 'node-docker-api/lib/container';
import { MAX_DISK_SPACE } from '@config';
import { Service } from 'typedi';
import si from 'systeminformation';

@Service()
class ResourcesService {
  private docker: Docker = new Docker({ socketPath: '/var/run/docker.sock' });

  async getStats(): Promise<ResourcesUtilization> {
    const info = await this.docker.info();
    const memory = await si.mem();
    const cpu = await si.cpu();

    const maxMemory = memory.total / 1024 / 1024;

    const gameServerContainer: Container[] = await this.docker.container.list({ all: true, filters: { label: ['me.dpidun.game_server'] } });
    const allContainers = await si.dockerContainers(true);

    let currentMemory = memory.used;
    let runningGameservers = 0;

    for (let gameServer of gameServerContainer) {
      gameServer = await gameServer.status();
      currentMemory += gameServer.data['HostConfig']['Memory'] || 0;
      if (gameServer.data['State']['Status'] == 'running') {
        runningGameservers++;
      }
    }

    currentMemory = currentMemory / 1024 / 1024;

    return {
      currentMemory,
      maxMemory,
      cpuCores: cpu.cores,
      maxDiskSpace: Number.parseInt(MAX_DISK_SPACE),
      maxGameServer: allContainers.length,
      currentGameServer: runningGameservers,
      containersAll: allContainers.length,
      containersRunning: allContainers.filter(c => c.state === 'running').length,
      images: info['Images'],
    };
  }
}

export default ResourcesService;
