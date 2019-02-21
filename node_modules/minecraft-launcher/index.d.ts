import { EventEmitter } from 'events'
import { ChildProcess } from 'child_process'
export function offline (playerName: string): () => { displayName: string, uuid: string }
export function yggdrasil (email: string, password: string, url?: string): () => Promise<{
  displayName: string,
  uuid: string,
  clientToken: string,
  accessToken: string,
  properties: string
}>
export default class MCLauncher {
  constructor ({}: {
    root?: string,
    java?: string,
    env?: boolean,
    event? (events: EventEmitter): void,
    unpack? (nativePath: string, filePath: string, exclude: string[]): string[]
  })
  constructor (java?: string, root?: string, event?: (events: EventEmitter) => void)
  getVersions (): Promise<string[]>
  getEmtter (): EventEmitter
  getJava (): string
  setJava (java: string): void
  getRoot (): string
  setRoot (root: string): Promise<void>
  launch (version: string, authenticator?: Function): Promise<ChildProcess>
  launch ({}: {
    version: string,
    authenticator?: Function,
    versionType?: string,
    maxMemory?: number,
    minMemory?: number,
    server?: {
      address: string,
      port?: number
    },
    size?: {
      fullScreen?: boolean,
      height?: number,
      width?: number
    },
    launcherName?: string,
    launcherVersion?: string,
    advencedArguments?: string[],
    cgcEnabled?: boolean,
    agentPath?: string,
    features?: { [key: string]: boolean }
  }): Promise<ChildProcess>
}
export const Tools: {
  dirExists (dirName: string): Promise<boolean>
  fileExists (fileName: string): Promise<boolean>
  randomUuid (): string
  findJava (): Promise<string[]>
  findJavaFast (useEnv?: boolean, key?: string): Promise<string>
  findJavaInternal (key?: string): Promise<string[]>
}
