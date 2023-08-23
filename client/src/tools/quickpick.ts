import * as vscode from 'vscode';
import { ToolInterface } from './toolInterface';




// Tool to instantiate and display quickpick Item
export class QuickPick implements ToolInterface{
	commandId = "viki.quikpick";
	commandTitle = "Pick from the list items";
	details: { description: string; usage: string; }={
		description:"Use this tool to display a list of options the user can choose from",
		usage:`if you want to display three options 
		quickpick['option1','option2','option3'] if you want to display four options
		quickpick['option1','option2','option3','option4']`
	};

	commandFunction(args: unknown): Promise<any> {
		return new Promise<any>((resolve, reject)=>{
			const { items } = args as {items:[]};

			try {
				vscode.window.showQuickPick(items, {
					placeHolder: 'pick and option',
					onDidSelectItem: item => vscode.window.showInformationMessage(`${item} selected`)
				}).then((result)=>{
					resolve(result);
				});
				
			} catch (error) {
				reject('Error occured showing quickpick box with options');
			}
			
		});
	}
}