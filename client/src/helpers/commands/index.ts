import { window } from "vscode";
import {platform} from 'os';
export type SetupConfigHandlerType = {
  command: string;
  commandHandler: (name?: string) => void;
};
export const setupConfigCommmandHandler = (): SetupConfigHandlerType => {
  const command = "fastlane-intellisense.setupConfig";

  const commandHandler = (name = "world") => {
    const current_path = __dirname;
    const devRegex = /^(.*?[\\/])[a-zA-Z]:?[\\/]?[^\\/]*?[\\/]?fastlane-intellisense[\\/]/g;
    const prodRegex = /^(.*?[\\/])[a-zA-Z]:?[\\/]?[^\\/]*?[\\/]?vikmanatus\.fastlane-intellisense-.*?[\\/]/g;
    const regex = process.env.NODE_ENV === "development" ? devRegex : prodRegex;
    // list.map((element)=>{
    //   const does_match = element.match(regex);
    //   return does_match;
    // });
    const matchPath = current_path.match(regex);
    if(matchPath){
      const platformName = platform();
      console.log("Matching path OK");
    }
    
    window.showInformationMessage("Going to setup extension");
    window.showInformationMessage(`Current path of file: ${current_path}`);
  };
  return { command, commandHandler };
};
