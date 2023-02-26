import { exec } from "child_process";
import { accessSync, constants, writeFile } from "fs";

export function convertToClassName(functionName: string): string {
  // split the function name into words
  const words = functionName.split("_");

  // capitalize the first letter of each word
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );

  // join the words together and add "Action" at the end
  const className = capitalizedWords.join("") + "Action";

  return className;
}

export function writeJsonFile(
  filePaths: string[],
  outputFile: string
): Promise<boolean> {
  const data = JSON.stringify(filePaths, null, 2);
  return new Promise((resolve, reject) => {
    writeFile(outputFile, data, (err) => {
      if (err) {
        console.error(err);
        return reject(false);
      }
      return resolve(true);
    });
  });
}

export function runRubyScript(
  scriptPath: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(`ruby ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

export function parseOutputString(outputString: string): string[] {
  const filePaths = outputString.split("\n").filter((path) => path !== "");
  return filePaths;
}
export function fileExists(filePath: string): boolean {
  try {
    // Check if the file exists
    accessSync(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
