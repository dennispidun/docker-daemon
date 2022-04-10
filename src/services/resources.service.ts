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

    const containers: Container[] = await this.docker.container.list({ all: true });
    const docker = await si.dockerContainers(true);

    console.log(await si.dockerInfo());

    let currentMemory = memory.used;
    for (let container of containers) {
      container = await container.status();
      currentMemory += container.data['HostConfig']['Memory'] || 0;
    }

    currentMemory = currentMemory / 1024 / 1024;

    let runningContainers = docker.filter(c => {
      return c.state == 'running';
    });

    return {
      currentMemory,
      maxMemory,
      cpuCores: cpu.cores,
      maxDiskSpace: Number.parseInt(MAX_DISK_SPACE),
      maxGameServer: docker.length,
      currentGameServer: runningContainers.length,
      images: info['Images'],
    };
  }
}

export default ResourcesService;
