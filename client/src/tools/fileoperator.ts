import * as vscode from 'vscode';
import { ToolInterface } from './toolInterface';
import * as fs from 'fs';



// Tool to create a file
export class CreateFile implements ToolInterface{
	commandId= "viki.createfile";
	commandTitle = "Create a new File";
	details: { description: string; usage: string; }={
		description:'These command helps you create files under any folder you want',
		usage: "createFile['/path/to/folder','example.txt']"
	}; 
	commandFunction(args: unknown): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			const { folderDir, fileName } = args as { folderDir: string, fileName: string };
			// check if folder is open
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length>0){
			const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
			const filePath = vscode.Uri.file(`${rootDir}/${folderDir}/${fileName}`);
				console.log(folderDir);
				//const filePath = vscode.Uri.file(`${rootDir}/${fileName}`);
				// checking if the file exists
			
			fs.writeFile(filePath.fsPath, '', (err) => {
				if (err) {
					vscode.window.showErrorMessage(`Failed to create file: ${err.message}`);
					reject(`Failed to create file: ${err.message}`);
				} else {
					vscode.window.showInformationMessage(`File created at: ${filePath.fsPath}`);
					
					resolve(`File created at: ${filePath.fsPath}`);
				}
			});
			}
			else{
				vscode.window.showErrorMessage('No folder open in workspace. Please open a folder');
				reject('No folder open in workspace. Please open a folder');
			}
			
		});
	}
}

// Tool to open a file
export class OpenFile implements ToolInterface{
	commandId = "viki.openfile";
	commandTitle = "Open a file";
	details: { description: string; usage: string; }={
		description: 'These Tool helps you open any file in visual studio code given the folderpath and filename'
		,
		usage:"openFile['/path/to/folder','example.txt']"
	};
 commandFunction(args: unknown): Promise<string> {
	return new Promise<string>((resolve,reject)=>{
		const { folderDir, fileName } = args as { folderDir: string, fileName: string };
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >0){
			const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
			const filePath = vscode.Uri.file(`${rootDir}/${folderDir}/${fileName}`);
			//const filePath = vscode.Uri.file(`${folderDir}/${fileName}`);
			console.log(folderDir);
			
			fs.writeFile(filePath.fsPath, '', (err) => {
				if (err) {
					
					//console.error("Error: File does not exist");
					vscode.window.showErrorMessage(`Error occurred: ${err}`);
					reject("Error File does not exist");
				} else {
					//console.log("Success: File exists");
					vscode.workspace.openTextDocument(filePath)
						.then(document => vscode.window.showTextDocument(document));
	
					resolve("Success File has been succuessfully opened");
				}
			});
		}else{
			vscode.window.showErrorMessage('No folder open in workspace. Please open a folder');
				reject('No folder open in workspace. Please open a folder');
		}
	});
 }
}

// Tool to check the existance of a file
async function findFileInWorkspace(fileName: string): Promise<string[]> {
    const filePaths: string[] = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
        for (const folder of workspaceFolders) {
            const folderPath = folder.uri.fsPath;
            await searchFolderForFile(folderPath);
        }
    }

    async function searchFolderForFile(folderPath: string): Promise<void> {
        const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath));
        for (const file of files) {
            const [name, type] = file;
            const filePath = `${folderPath}/${name}`;

            if (type === vscode.FileType.Directory) {
                await searchFolderForFile(filePath);
            } else if (name === fileName) {
                filePaths.push(filePath);
            }
        }
    }

    return filePaths;
}

export class FileExists implements ToolInterface {
	commandId = "viki.fileexists";
	commandTitle = "Check if file exists";
	details: { description: string; usage: string; }={
		description: "Use this tool to check if a file exists in vs code and get the file path or paths",
		usage: "fileexists['example.txt']",
	};
	commandFunction(args: unknown): Promise<any> {
		return new Promise<any>((resolve,reject)=>{
			const {fileName } = args as {fileName: string};
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >0){
				findFileInWorkspace(fileName).then((filePaths) => {
					if (filePaths.length > 0) {
						console.log('File found in the following paths:');
						vscode.window.showInformationMessage(filePaths.toString());
						resolve(filePaths);
					} else {
						console.log('File not found in the workspace.');
						reject('File not found in the workspace.');
					}
				});
				
			}else{
				// reject it
				vscode.window.showErrorMessage('No folder open in workspace. Please open a folder');
				reject('No folder open in workspace. Please open a folder');
			}
		

		});
	}

	
}


async function deleteFile(filePath: vscode.Uri): Promise<void> {
  try {
    await vscode.workspace.fs.delete(filePath);
    console.log(`File deleted: ${filePath.fsPath}`);
  } catch (error) {
    console.error(`Error deleting file: ${error}`);
  }
}
export class DeleteFile implements ToolInterface{
	commandId = "viki.deletefile";
	commandTitle = "Delete a File";
	details: { description: string; usage: string; } = {
		description:'Use this function to to delete a file',
		usage: "deletefile['/path/to/folder','example.txt']"
	};
	commandFunction(args: unknown): Promise<any> {
		return new Promise<any>((resolve,reject)=>{
			const { folderDir, fileName } = args as { folderDir: string, fileName: string };
			
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >0){
				//const rootDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
				//const filePath = vscode.Uri.file(`${rootDir}/${fileName}`);
				const filePath = vscode.Uri.file(`${folderDir}/${fileName}`);
				//const filePath = vscode.Uri.file(`${rootDir}/${fileName}`);
				console.log(folderDir);
				deleteFile(filePath).then(() => {
						console.log(`File deleted: ${filePath.fsPath}`);
						resolve("File successfully deleted");
					})
					.catch((error) => {
						console.error(`Error deleting file: ${error}`);
						reject(`Error Deleting file ${error}`);
					});
					
			}else{
				vscode.window.showErrorMessage('No folder open in workspace. Please open a folder');
					reject('No folder open in workspace. Please open a folder');
			}
		});
	}
}


	// Tool to get the active directory
	export class GetActiveDirectory implements ToolInterface {
	commandId = "viki.getactivedirectory";
	commandTitle = "Get Active Directory";
	details: { description: string; usage: string } = {
		description: "Use this tool to get the active directory in VS Code",
		usage: "getActiveDirectory[]",
	};

	commandFunction(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			const activeDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;
			resolve(`Active directory: ${activeDirectory}`);
		} else {
			vscode.window.showErrorMessage('No folder open in workspace. Please open a folder');
			reject('No folder open in workspace. Please open a folder');
		}
		});
	}
	}

	// Tool to get the active file
	export class GetActiveFile implements ToolInterface {
	commandId = "viki.getactivefile";
	commandTitle = "Get Active File";
	details: { description: string; usage: string } = {
		description: "Use this tool to get the active file in VS Code",
		usage: "getActiveFile[]",
	};

	commandFunction(): Promise<string> {
		return new Promise<string>((resolve, reject) => {
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const activeFile = activeTextEditor.document.uri.fsPath;
			resolve(`Active file: ${activeFile}`);
		} else {
			vscode.window.showErrorMessage('No active file found. Please open a file');
			reject('No active file found. Please open a file');
		}
		});
	}
	}
