import * as winston from 'winston';
const { combine, timestamp, label, printf, colorize } = winston.format;
import { support } from 'fluent-logger';

export default class Logger {
  private logName: string;
  private logToFile: boolean = false;
  private fluentTransport = support.winstonTransport();
  private logger: winston.Logger;
  private fluent: any;
  private fluentConfig: any = {
    enableReconnect: false
  };
  private format = printf(({ level, message, label, timestamp }) => {
    return `${timestamp.slice(0, 19)} [${label}] ${level}: ${message}`;
  });
  private formatConsole = printf(({ level, message }) => {
    return `${level}: ${message}`;
  });

  constructor(logName: string, hostName: string, port: number, logToFile: boolean) {
    this.logName = logName;
    this.fluentConfig.host = hostName;
    this.fluentConfig.port = port;
    this.logToFile = logToFile;
    this.connectFluent();
  }

  connectFluent() {
    this.fluent = new this.fluentTransport(this.logName, this.fluentConfig);
    this.logger = winston.createLogger();
    if (this.logToFile) {
      this.logger.add(
        new winston.transports.File({
          format: combine(label({ label: this.logName }), timestamp(), this.format),
          filename: `/logs/${this.logName}.log`
        })
      );
    }
    this.logger.add(
      new winston.transports.Console({
        format: combine(label({ label: this.logName }), timestamp(), colorize(), this.formatConsole)
      })
    );
    this.logger.add(this.fluent);
    this.logger.log({ level: 'info', message: `[logs] fluentd connected` });
  }

  info(message: string) {
    if (!this.fluent) {
      this.connectFluent();
    }
    this.logger.log({
      level: 'info',
      message: message
    });
  }

  warn(message: string) {
    if (!this.fluent) {
      this.connectFluent();
    }
    this.logger.log({
      level: 'warn',
      message: message
    });
  }

  error(message: string) {
    if (!this.fluent) {
      this.connectFluent();
    }
    this.logger.log({
      level: 'error',
      message: message
    });
  }
}
