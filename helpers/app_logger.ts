import { Logger, dummyLogger } from "ts-log";
import * as fs from "fs";

// example class that uses the logger

// example custom logger that logs to a file
export class AppLogger implements Logger {
  private readonly fd: number;

  public constructor(filename: string) {
    this.fd = fs.openSync(filename, "a");
  }

  public trace(message?: any, ...optionalParams: any[]): void {
    console.log(`${message} ${JSON.stringify(optionalParams)}`);
    this.append("TRACE", `${message} ${JSON.stringify(optionalParams)}`);
  }

  public debug(message?: any, ...optionalParams: any[]): void {
    this.append("DEBUG", `${message} ${JSON.stringify(optionalParams)}`);
    console.log(`${message} ${JSON.stringify(optionalParams)}`);
  }

  public info(message?: any, ...optionalParams: any[]): void {
    this.append("INFO ", `${message} ${JSON.stringify(optionalParams)}`);
    console.log(`${message} ${JSON.stringify(optionalParams)}`);
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    this.append("WARN ", `${message} ${JSON.stringify(optionalParams)}`);
    console.log(`${message} ${JSON.stringify(optionalParams)}`);
  }

  public error(message?: any, ...optionalParams: any[]): void {
    this.append("ERROR", `${message} ${JSON.stringify(optionalParams)}`);
    console.log(`${message} ${JSON.stringify(optionalParams)}`);
  }

  private append(type: string, message: string) {
    fs.writeSync(this.fd, `${new Date().toISOString()} ${type} ${message}\n`);
  }
}

const logger = new AppLogger("app.log");

export default logger;
// don't define a logger, defaults to dummy logger that does nothing
