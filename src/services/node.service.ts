import { Container, Service } from 'typedi';
import axios from 'axios';
import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';
import { NodeConfiguration } from '@interfaces/node.interface';
import JSONdb from 'simple-json-db';
import ResourcesService from '@services/resources.service';

@Service()
class NodeService {
  db = new JSONdb('/Users/vwxqqlp/docker-daemon/nodeConfig.json');

  resourcesService: ResourcesService = Container.get(ResourcesService);

  public async registerNode(server: string, apiKey: string) {
    let nodeConfig: NodeConfiguration = this.db.get('node');
    const resourcesUtilization = await this.resourcesService.getStats();
    if (!nodeConfig) {
      nodeConfig = {
        ...resourcesUtilization,
        ip: '127.0.0.1',
        name: 'EU-WEST-1',
      };
    }

    nodeConfig = { ...nodeConfig, ...resourcesUtilization };

    const nodeReq = await axios.post(`${server}/nodes`, {
      apiKey,
      ...nodeConfig,
    });

    const entity: NodeConfiguration = nodeReq.data['entity'];
    nodeConfig = {
      ...nodeConfig,
      ...entity,
    };
    this.db.set('node', nodeConfig);
    this.db.sync();

    this.initializeScheduler(server, nodeReq.data['timeoutInterval'], entity);
  }

  private initializeScheduler(server: string, interval: number, node: NodeConfiguration) {
    const scheduler = new ToadScheduler();
    const task = new Task('simple task', async () => {
      const resourcesUtilization = await this.resourcesService.getStats();

      axios
        .put(`${server}/nodes/${node.id}`, {
          apiKey: 'secretKey',
          ...resourcesUtilization,
        })
        .then();
    });

    const job1 = new SimpleIntervalJob({ seconds: interval, runImmediately: true }, task, 'id_1');
    scheduler.addSimpleIntervalJob(job1);
  }
}

export default NodeService;
