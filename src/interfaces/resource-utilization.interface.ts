export interface ResourcesUtilization {
  usedMemory: number;
  maxMemory: number;
  maxCpuCores: number;
  maxDiskSpace: number;
  containers: number;
  containersRunning: number;
  images: number;
}
