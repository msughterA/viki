import * as vscode from 'vscode';
import { ToolInterface } from './toolInterface';



// function searchInText(text: string, searchString: string): vscode.Range[] {
// 	const results: vscode.Range[] = [];
// 	const searchRegex = new RegExp(searchString, 'gi');
// 	let match: RegExpExecArray | null;
  
// 	while ((match = searchRegex.exec(text)) !== null) {
// 		const startPos = match.index;
// 		const endPos = match.index + match[0].length;
// 		const start = text.substring(0, startPos).split('\n').length - 1;
// 		const end = text.substring(0, endPos).split('\n').length - 1;
// 		const range = new vscode.Range(new vscode.Position(start, startPos), new vscode.Position(end, endPos));
// 		console.log(`${start}:${startPos}.....${end}:${endPos}`);
// 		console.log(match);
// 		results.push(range);
// 	}
  
// 	return results;
//   }

function searchInText(text: string, searchString: string): vscode.Range[] {
    const results: vscode.Range[] = [];
    const searchRegex = new RegExp(searchString, 'gi');
    let match: RegExpExecArray | null;

    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        let startPos = 0;

        while ((match = searchRegex.exec(line)) !== null) {
			startPos = match.index;
            const endPos = match.index + match[0].length;
            const start = lineIndex;
            const end = lineIndex;
            const range = new vscode.Range(new vscode.Position(start, startPos), new vscode.Position(end, endPos));
            // console.log(`${start}:${startPos}.....${end}:${endPos}`);
            // console.log(match);
            results.push(range);
            startPos = endPos;
        }
    }

    return results;
}



  export class SearchInFile implements ToolInterface {
    commandId = "viki.searchinfile";
    commandTitle = "Search for text in One file";
    details: { description: string; usage: string; } = {
        description: "Use this tool to search for text in one file",
        usage: "search['text you want to search for']"
    };

    commandFunction(args: unknown): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const { searchString, filePath } = args as { searchString: string, filePath: string };
            const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
            if (!document) {
                vscode.window.showErrorMessage(`File ${filePath} is not opened in the editor.`);
                reject(`File ${filePath} is not opened in the editor.`);
                return;
            }
            if (searchString) {
                const searchResults = searchInText(document.getText(), searchString);
                resolve(searchResults);
            }
        });
    }
}

export class SearchInFileWithReplacement implements ToolInterface {
    commandId = "viki.searchinfilewithreplacement";
    commandTitle = "Search and Replace in One File";
    details: { description: string; usage: string; } = {
        description: "Use this tool to search and replace text in one file",
        usage: "searchReplace['text to search', 'replacement text']"
    };

    commandFunction(args: unknown): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const { searchString, replacementText, filePath } = args as { searchString: string, replacementText: string, filePath: string };
            const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
            if (!document) {
                vscode.window.showErrorMessage(`File ${filePath} is not opened in the editor.`);
                reject(`File ${filePath} is not opened in the editor.`);
                return;
            }
            if (searchString && replacementText) {
                const searchResults = searchInText(document.getText(), searchString);
                if (searchResults.length > 0) {
                    const edit = new vscode.WorkspaceEdit();
                    searchResults.forEach(range => {
						console.log(range);
                        edit.replace(document.uri, range, replacementText);
                    });
                    vscode.workspace.applyEdit(edit).then(() => {
                        vscode.window.showInformationMessage('Search and replace completed.');
                        resolve('Search and replace completed.');
                    }, (error) => {
                        vscode.window.showErrorMessage('Failed to apply search and replace.');
                        reject(error);
                    });
                } else {
                    vscode.window.showInformationMessage('No matches found.');
                    reject("No matches found");
                }
            }
        });
    }
}
// interface for a search result 
interface SearchResult {
uri:vscode.Uri,
range:vscode.Range[]
}

export class SearchInWorkSpace implements ToolInterface{
	commandId = "viki.searchinworkspace";
	commandTitle = "Search for text in the entire workpace";
	details: { description: string; usage: string; } = {
		description:"Use this tool to search for text in the entire workspace",
		usage:"search['text you want to search for']"
	};

	commandFunction(args: unknown): Promise<any> {
		return new Promise<any>((resolve, reject)=>{
			const { searchString } = args as { searchString: string};
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active text editor found.');
				reject('No active text editor found');
				
			}
		if (searchString) {
			const searchResults: SearchResult[] = [];
			vscode.workspace.findFiles('**/*').then((workspaceFiles: vscode.Uri[]) => {
				const promises = workspaceFiles.map((file) => {
				return vscode.workspace.openTextDocument(file).then((document: vscode.TextDocument) => {
					const fileContent = document.getText();
					const fileSearchResults = searchInText(fileContent, searchString);
			
					if (fileSearchResults.length > 0) {
					searchResults.push({
						uri:file,
						range:fileSearchResults
					});
					
					}
				});
				});
			
				Promise.all(promises).then(() => {
				resolve(searchResults
					);
				});
			});
			}
			
		});
	}
  }
  export class SearchInWorkspaceWithReplacement implements ToolInterface {
    commandId = "viki.searchinworkspacewithreplacement";
    commandTitle = "Search and Replace in the Entire Workspace";
    details: { description: string; usage: string; } = {
        description: "Use this tool to search and replace text in the entire workspace",
        usage: "searchReplace['text to search', 'replacement text']"
    };

    commandFunction(args: unknown): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const { searchString, replacementText } = args as { searchString: string, replacementText: string };
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active text editor found.');
                reject('No active text editor found');
            }
            if (searchString && replacementText) {
                const searchResults: SearchResult[] = [];
                vscode.workspace.findFiles('**/*').then((workspaceFiles: vscode.Uri[]) => {
                    const promises = workspaceFiles.map((file) => {
                        return vscode.workspace.openTextDocument(file).then((document: vscode.TextDocument) => {
                            const fileContent = document.getText();
                            const fileSearchResults = searchInText(fileContent, searchString);

                            if (fileSearchResults.length > 0) {
                                searchResults.push({
                                    uri: file,
                                    range: fileSearchResults
                                });
                                const edit = new vscode.WorkspaceEdit();
                                fileSearchResults.forEach(range => {
                                    edit.replace(file, range, replacementText);
                                });
                                vscode.workspace.applyEdit(edit);
                            }
                        });
                    });

                    Promise.all(promises).then(() => {
                        if (searchResults.length > 0) {
                            vscode.window.showInformationMessage('Search and replace completed.');
                        } else {
                            vscode.window.showInformationMessage('No matches found.');
                        }
                        resolve(searchResults);
                    }, (error) => {
                        vscode.window.showErrorMessage('Failed to apply search and replace.');
                        reject(error);
                    });
                });
            }
        });
    }
}

function searchAndHighlightInText(text: string, searchString: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor found.');
        return;
    }

    const searchRegex = new RegExp(searchString, 'gi');
    let match: RegExpExecArray | null;

    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'yellow'
    });

    const ranges: vscode.Range[] = [];

    const lines = text.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        let startPos = 0;

        while ((match = searchRegex.exec(line)) !== null) {
            startPos = match.index;
            const endPos = match.index + match[0].length;
            const start = lineIndex;
            const end = lineIndex;
            const range = new vscode.Range(new vscode.Position(start, startPos), new vscode.Position(end, endPos));
            ranges.push(range);
            startPos = endPos;
        }
    }

    editor.setDecorations(decorationType, ranges);
}

export class SearchAndHighlightInFile implements ToolInterface {
    commandId = "viki.searchandhighlightinfile";
    commandTitle = "Search and Highlight in One File";
    details: { description: string; usage: string; } = {
        description: "Use this tool to search and highlight text in one file",
        usage: "searchAndHighlight['text you want to search for']"
    };

    commandFunction(args: unknown): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const { searchString, filePath } = args as { searchString: string, filePath: string };
            const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === filePath);
            if (!document) {
                vscode.window.showErrorMessage(`File ${filePath} is not opened in the editor.`);
                reject(`File ${filePath} is not opened in the editor.`);
                return;
            }
            if (searchString) {
                searchAndHighlightInText(document.getText(), searchString);
                resolve('Search and highlight completed.');
            }
        });
    }
}