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
    const regex = /^(.*?[\\/])[a-zA-Z]:?[\\/]?[^\\/]*?[\\/]?vikmanatus\.fastlane-intellisense-.*?[\\/]/g;
    // list.map((element)=>{
    //   const does_match = element.match(regex);
    //   return does_match;
    // });
    const matchPath = __dirname.match(regex);
    if(current_path.match(regex)){
      const platformName = platform();
      console.log("Matching path OK");
    }
    
    window.showInformationMessage("Going to setup extension");
    window.showInformationMessage(`Current path of file: ${current_path}`);
  };
  return { command, commandHandler };
};
