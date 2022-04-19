export interface ResourcesUtilization {
  currentMemory: number;
  maxMemory: number;
  cpuCores: number;
  maxDiskSpace: number;
  maxGameServer: number;
  currentGameServer: number;
  containersRunning: number;
  containersAll: number;
  images: number;
}
