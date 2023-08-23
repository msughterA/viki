import * as vscode from 'vscode';
import { ToolInterface } from './toolInterface';

export function getTextRangeWithFileName(selection: vscode.Selection): { range?: vscode.Range, filePath?: string } {
	const editor = vscode.window.activeTextEditor;
		if (editor) {
		const filePath = editor.document.uri.fsPath;
		const range = new vscode.Range(selection.start, selection.end);
		return { range, filePath };
		}
	return {};
  }


  export class ExplainHighlightedText implements ToolInterface{
	commandId = "viki.explain";
	commandTitle = "Ask viki to explain the highlighted code";
	details: { description: string; usage: string; } = {
		description: "Use this tool to ask viki to explain any highlighted code",
		usage: ""
	};
	commandFunction(): Promise<any> {
		return new Promise<any>((resolve, reject)=>{
			
			const editor = vscode.window.activeTextEditor;
			if (editor) {
			const selection = editor.selection;
			const highlightedCode = editor.document.getText(selection);
			//editor.document.uri.fsPath
			// to get the path to these document
			console.log(highlightedCode);
			vscode.window.showInformationMessage('Highlighted code has been explained!');
			resolve('Highlighted code has been explained!');

			}
			else{
				reject("No editor opened");
			}
		});
	}
  }


  export class AskHighlightedText implements ToolInterface{
	commandId = "viki.instruct";
	commandTitle = "Instruct viki in chat view";
	details: { description: string; usage: string; } = {
		description: "Use this tool to ask viki what to do about the highlighted text in chat view",
		usage: ""
	};
	commandFunction(): Promise<any> {
		return new Promise<any>((resolve, reject)=>{
			
			const editor = vscode.window.activeTextEditor;
			if (editor) {
			const selection = editor.selection;
			const highlightedCode = editor.document.getText(selection);
			console.log(highlightedCode);
			vscode.window.showInformationMessage('You can now instruct viki about what to do!');
			resolve('You can now instruct viki about what to do!');
			}
			else{
				reject("No editor opened");
			}
		});
	}
  }

  export class RefactorHighlightedText implements ToolInterface{
	commandId = "viki.refactor";
	commandTitle = "Viki Refactor";
	details: { description: string; usage: string; } = {
		description: "Use this tool to refactor or improve the code",
		usage: ""
	};
	commandFunction(): Promise<any> {
		return new Promise<any>((resolve, reject)=>{
			
			const editor = vscode.window.activeTextEditor;
			if (editor) {
			const selection = editor.selection;
			const highlightedCode = editor.document.getText(selection);
			console.log(highlightedCode);
			vscode.window.showInformationMessage('Your Code has now been refactored!');
			resolve('You can now instruct viki about what to do!');
			}
			else{
				reject("No editor opened");
			}
		});
	}
  }
   