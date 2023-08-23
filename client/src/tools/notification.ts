import * as vscode from 'vscode';
import { ToolInterface } from './toolInterface';



// Tool to display notifications to the user
export class Notification implements ToolInterface{
	commandId = "viki.notification";
	commandTitle = "Show notification to the user";
	details: { description: string; usage: string; } = {
		description:"Use this tool to display notifications to the user on very critical issues",
		usage:"notification['message']"
	};
	commandFunction(args: unknown): Promise<any> {
		return new Promise<any>((resolve, reject)=>{
			const { message } = args as { message: string};
			try {
				vscode.window.showInformationMessage(message);
				resolve("Message delivered");
			} catch (error) {
				reject(`Message delivery failed ${error}`);
			}
		});
	}
}