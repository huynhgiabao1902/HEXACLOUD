
import { Client } from 'ssh2';

export interface SSHConnectionConfig {
  host: string;
  username: string;
  password: string;
  port?: number;
}

export class SSHManager {
  private client: Client;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client();
  }

  async connect(config: SSHConnectionConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        this.isConnected = true;
        console.log('SSH Client :: ready');
        resolve(true);
      });

      this.client.on('error', (err) => {
        console.error('SSH Client :: error', err);
        this.isConnected = false;
        reject(err);
      });

      this.client.connect({
        host: config.host,
        username: config.username,
        password: config.password,
        port: config.port || 22,
        readyTimeout: 10000,
      });
    });
  }

  async executeCommand(command: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('SSH client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let output = '';
        stream.on('data', (data: Buffer) => {
          output += data.toString();
        });

        stream.on('close', () => {
          resolve(output);
        });

        stream.stderr.on('data', (data: Buffer) => {
          console.error('SSH Command Error:', data.toString());
        });
      });
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}