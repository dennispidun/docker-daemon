import {ResourcesUtilization} from "@interfaces/resource-utilization.interface";
import {Docker} from "node-docker-api";
import {Container} from "node-docker-api/lib/container";
import {MAX_DISK_SPACE} from "@config";
import {Service} from "typedi";

@Service()
class ResourcesService {

  private docker: Docker = new Docker({ socketPath: '/var/run/docker.sock' });

  async getStats(): Promise<ResourcesUtilization> {

    const info = await this.docker.info();
    console.log(info)

    const totalMemory = (Math.floor(info['MemTotal'] / 1024 / 1024 / 1024) - 2) * 1024;

    const containers: Container[] = await this.docker.container.list({all:true});
    let usedMemory: number = 0;
    for (let container of containers) {
      container = await container.status()
      usedMemory += container.data['HostConfig']['Memory'] || 0;
    }

    usedMemory = usedMemory / 1024 / 1024;

    return {
      usedMemory,
      maxMemory: totalMemory,
      maxCpuCores: info['NCPU'],
      maxDiskSpace: Number.parseInt(MAX_DISK_SPACE),
      containers: info['Containers'],
      containersRunning: info['ContainersRunning'],
      images: info['Images']
    }
  }

}


export default ResourcesService;
