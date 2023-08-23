import * as vscode from "vscode";
// import { accessTokenKey, refreshTokenKey,avatarUrlkey, userNameKey } from "./constants";

export class Util {
  static globalState: vscode.ExtensionContext["globalState"];


 

  static getGitData(){
    const userName: string = this.globalState.get('userName')||'';
    const avatarUrl: string = this.globalState.get('avatarUrl')||'';
    console.log(`USER NAME ${userName}`);
    return {
      userName,
      avatarUrl
    };
  }

  static isLoggedIn(){
    const userName: string = this.globalState.get('userName')||'';
   // const avatarUrl: string = this.globalState.get('avatarUrl')||'';

    return (userName ==='');
  }
  
}

