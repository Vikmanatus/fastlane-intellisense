import { exec } from "child_process";
import { accessSync, constants } from "fs";
import path from "path";
import axios from "axios";
import { JSDOM } from 'jsdom';

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

export function fileExists(filePath: string): boolean {
  try {
    // Check if the file exists
    accessSync(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

export function parseDocumentation(list: Element[]){
  list.map((element)=>{
    const node = element;
    return node;
  });
}
export function fetchFastlaneDoc(actionName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://docs.fastlane.tools/actions/${actionName}/`)
      .then((result) => {
        const testReponse = result;
        const test = new JSDOM(testReponse.data);
        const parsedDoc = Array.from(test.window.document.querySelectorAll('div.section'))[0]?.outerHTML;
        // parseDocumentation(parsedDoc);
        resolve(parsedDoc);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
