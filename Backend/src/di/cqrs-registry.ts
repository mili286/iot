import * as fs from "fs";
import * as path from "path";
import { Container } from "inversify";
import {
  COMMAND_HANDLER_METADATA,
  QUERY_HANDLER_METADATA,
} from "../application/cqrs/decorators";

export function registerCqrsHandlers(container: Container, directory: string) {
  const files = getAllFiles(directory);

  for (const file of files) {
    if (file.endsWith(".handler.ts") || file.endsWith(".handler.js")) {
      const module = require(file);
      for (const exportKey in module) {
        const exported = module[exportKey];
        if (typeof exported === "function") {
          const command = Reflect.getMetadata(
            COMMAND_HANDLER_METADATA,
            exported,
          );
          if (command) {
            const identifier = Symbol.for(`CommandHandler:${command.name}`);
            container.bind(identifier).to(exported).inSingletonScope();
          }

          const query = Reflect.getMetadata(QUERY_HANDLER_METADATA, exported);
          if (query) {
            const identifier = Symbol.for(`QueryHandler:${query.name}`);
            container.bind(identifier).to(exported).inSingletonScope();
          }
        }
      }
    }
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}
