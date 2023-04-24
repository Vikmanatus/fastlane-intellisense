import { exec } from "child_process";
import { accessSync, constants, writeFile } from "fs";
import path = require("path");

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

interface Action {
  actionName: string;
  path: string;
}

export function parseOutput(output: string, outputPath: string): Promise<void> {
  // const regex = /.*\/(.*?)\.rb/g;
  // const matches = output.match(regex);
  // const actions = matches?.map((match) => {
  //   const path = match.trim();
  //   const actionName = path.split("/").pop()?.replace(".rb", "");
  //   return { actionName, path };
  // });
  // if (actions) {
  //   const json = JSON.stringify(actions, null, 2);

  //   return new Promise((resolve, reject) => {
  //     writeFile(outputPath, json, (err) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve();
  //       }
  //     });
  //   });
  // } else {
  //   Promise.reject(new Error("No matches found."));
  // }
  console.log("inside parse output");
   return new Promise((resolve, reject) => {
      writeFile(outputPath, output, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
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

export function fetchFastlaneDoc(
  actionName: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "../../src/scripts/scrap_action.py"
    );
    exec(`python3 ${scriptPath} ${actionName}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
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
