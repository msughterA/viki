/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, commands, ExtensionContext, OutputChannel } from 'vscode';
import * as vscode from 'vscode';
import { CreateFile, OpenFile, FileExists, DeleteFile } from './tools/fileoperator';
//import { getTextRangeWithFileName } from './tools/texthighlight';
import { WebSocket } from 'ws';
import { ExplainHighlightedText, AskHighlightedText, RefactorHighlightedText } from './tools/texthighlight';
import { SearchInFile, SearchInFileWithReplacement, SearchInWorkSpace } from './tools/search';
import { ChatViewProvider} from './views/chatview';
//import { ErrandSocket } from './services/app-client';
import { StateSocket } from './services/state-client';
import { Util } from './utils';
import * as fs from 'fs';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';


// importing the necessary modules
let client: LanguageClient;
// language client to hold an instance of the LanguageClient class

function getMostActiveFiles(numFiles: number): string[] {
    const activeFiles: { [filePath: string]: number } = {};

    // Iterate over visible text editors and track their activity
    vscode.window.visibleTextEditors.forEach(editor => {
        const filePath = editor.document.uri.fsPath;
        activeFiles[filePath] = (activeFiles[filePath] || 0) + 1;
    });

    // Sort files by activity in descending order
    const sortedFiles = Object.keys(activeFiles).sort((a, b) => activeFiles[b] - activeFiles[a]);

    // Return the top N files
    return sortedFiles.slice(0, numFiles);
}

function displayFilePaths(filePaths: string[]): Thenable<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = filePaths.map(filePath => ({ label: filePath }));

        quickPick.onDidChangeSelection(([selected]) => {
            if (selected) {
                quickPick.hide();
                resolve(selected.label);
            }else {
				reject("nothing was selected");
			}
        });

        quickPick.onDidHide(() => {
            quickPick.dispose();
            resolve(undefined);
        });

        quickPick.show();
    });
}

export async function activate(context: ExtensionContext) {
	// main entry point of the code
	const socketPort = workspace.getConfiguration('languageServerExample').get('port', 7000);
	// assing it the port value from the configuration settings or default to 7000
	let socket: WebSocket | null = null;
	// socket variable to hold an instance of the websocket later
	commands.registerCommand('viki.startStreaming', () => {
		// Establish websocket connection
		socket = new WebSocket(`ws://localhost:${socketPort}`);
	});

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	Util.globalState = context.globalState;

	// The serverModule variable is assigned the absolut file path to the server module

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	

	// The log to send
	let log = '';
	const websocketOutputChannel: OutputChannel = {
		name: 'websocket',
		// Only append the logs but send them later
		append(value: string) {
			log += value;
			console.log(value);
		},
		appendLine(value: string) {
			log += value;
			// Don't send logs until WebSocket initialization
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(log);
			}
			log = '';
		},
		clear() { /* empty */ },
		show() { /* empty */ },
		hide() { /* empty */ },
		dispose() { /* empty */ },
		replace() { /* empty */ }
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		// Hijacks all LSP logs and redirect them to a specific port through WebSocket connection
		outputChannel: websocketOutputChannel
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);
	// create command objects here
	const creatFileObj = new CreateFile();
	const openFileObj = new OpenFile();
	const fileExistsObj = new FileExists();
	const deleteFileObj = new DeleteFile();
	const searchInFileObj = new SearchInFile();
	const searchInWorkSpaceObj = new SearchInWorkSpace();
	//const searchInWorkSpace = new SearchInWorkSpace();
	const searchInFileWithReplacementObj = new SearchInFileWithReplacement();
	//const searchInWorkspaceWithReplacementObj = new SearchInWorkspaceWithReplacement();
	// these commands are likely not to be used by our ai agent
	const explainHighlightedTextObj = new ExplainHighlightedText();
	const askHighlightedTextObj = new AskHighlightedText();
	const refactorHighlightedTextObj = new RefactorHighlightedText();

	// Register and test some of your simple commands here
	const creatFile = vscode.commands.registerCommand(creatFileObj.commandId,()=>{
		creatFileObj.commandFunction({folderDir:".",fileName:"example.txt"}).then(message => {
			// Handle the success message or do something with it
			// TODO: send this message to the AI agent
			console.log(message);
		})
		.catch(error => {
			// Handle the error message or do something with it
			// TODO: send this message to the AI agent
			console.error(error);
		});
	});
 context.subscriptions.push(creatFile);

 const openFile = vscode.commands.registerCommand(openFileObj.commandId,()=>{
	openFileObj.commandFunction({folderDir:".",fileName:"example.txt"}).then(message => {
		// Handle the success message or do something with it
		// TODO: send this message to the AI agent
		
		console.log(message);
	})
	.catch(error => {
		// Handle the error message or do something with it
		// TODO: send this message to the AI agent
		console.error(error);
	});
});
context.subscriptions.push(openFile);

const fileExists = vscode.commands.registerCommand(fileExistsObj.commandId,()=>{
	fileExistsObj.commandFunction({fileName:"example.txt"}).then(message => {
		// Handle the success message or do something with it
		// TODO: send this message to the AI agent
		
		console.log(message);
	})
	.catch(error => {
		// Handle the error message or do something with it
		// TODO: send this message to the AI agent
		console.error(error);
	});
});
context.subscriptions.push(fileExists);

const deleteFile = vscode.commands.registerCommand(deleteFileObj.commandId,()=>{
	deleteFileObj.commandFunction({folderDir:".",fileName:"example.txt"}).then(message => {
		// Handle the success message or do something with it
		// TODO: send this message to the AI agent
		
		console.log(message);
	})
	.catch(error => {
		// Handle the error message or do something with it
		// TODO: send this message to the AI agent
		console.error(error);
	});
});
context.subscriptions.push(deleteFile);

const explainHighlightedText = vscode.commands.registerCommand(explainHighlightedTextObj.commandId,()=>{
	explainHighlightedTextObj.commandFunction().then(message => {
		// Handle the success message or do something with it
		// TODO: send this message to the AI agent
		
		console.log(message);
	})
	.catch(error => {
		// Handle the error message or do something with it
		// TODO: send this message to the AI agent
		console.error(error);
	});
});
context.subscriptions.push(explainHighlightedText);

const askHighlightedText = vscode.commands.registerCommand(askHighlightedTextObj.commandId,()=>{
	askHighlightedTextObj.commandFunction().then(message => {
		// Handle the success message or do something with it
		// TODO: send this message to the AI agent
		console.log(message);
	})
	.catch(error => {
		// Handle the error message or do something with it
		// TODO: send this message to the AI agent
		console.error(error);
	});
});
context.subscriptions.push(askHighlightedText);

const refactorHighlightedText = vscode.commands.registerCommand(refactorHighlightedTextObj.commandId,()=>{
	refactorHighlightedTextObj.commandFunction().then(message => {
		// Handle the success message or do something with it
		// TODO: send this message to the AI agent
		console.log(message);
	})
	.catch(error => {
		// Handle the error message or do something with it
		// TODO: send this message to the AI agent
		console.error(error);
	});
});
context.subscriptions.push(refactorHighlightedText);

const  searchInFile = vscode.commands.registerCommand(searchInFileObj.commandId,async ()=>{
	const editor = vscode.window.activeTextEditor;
	if(editor){
		const input = await vscode.window.showInputBox({
			prompt: 'Enter your search String',
			placeHolder: '',
		});
		const activeFiles = getMostActiveFiles(2);
		const selectedPath = await displayFilePaths(activeFiles);
		if (selectedPath){
			if (input) {
				// Perform actions with the input
				console.log('Input:', input);
				searchInFileObj.commandFunction({searchString:input, filePath:selectedPath}).then(message => {
					// Handle the success message or do something with it
					// TODO: send this message to the AI agent
					console.log(message);
				})
				.catch(error => {
					// Handle the error message or do something with it
					// TODO: send this message to the AI agent
					console.error(error);
				});
			} else {
				// User canceled the input
				console.log('Input canceled');
			}
		}else {
			console.log('Input canceled');
		}
		
		
	}
	
});
context.subscriptions.push(searchInFile);

const  searchInFileWithReplacement = vscode.commands.registerCommand(searchInFileWithReplacementObj.commandId,async ()=>{
	const editor = vscode.window.activeTextEditor;
	if(editor){
		const input = await vscode.window.showInputBox({
			prompt: 'Enter your search String',
			placeHolder: '',
		});
		const replacement = await vscode.window.showInputBox({
			prompt: 'Enter your replacement',
			placeHolder: '',
		});
		const activeFiles = getMostActiveFiles(2);
		const selectedPath = await displayFilePaths(activeFiles);
		if (selectedPath){
			if (input) {
				// Perform actions with the input
				console.log('Input:', input);
				searchInFileWithReplacementObj.commandFunction({searchString:input, filePath:selectedPath, replacementText:replacement}).then(message => {
					// Handle the success message or do something with it
					// TODO: send this message to the AI agent
					console.log(message);
				})
				.catch(error => {
					// Handle the error message or do something with it
					// TODO: send this message to the AI agent
					console.error(error);
				});
			} else {
				// User canceled the input
				console.log('Input canceled');
			}
		}else {
			console.log('Input canceled');
		}
		
		
	}
	
});
context.subscriptions.push(searchInFileWithReplacement);

const  searchInWorkSpace = vscode.commands.registerCommand(searchInWorkSpaceObj.commandId,async ()=>{
	const editor = vscode.window.activeTextEditor;
	if(editor){
		const input = await vscode.window.showInputBox({
			prompt: 'Enter your search String',
			placeHolder: '',
		});
		
		const activeFiles = getMostActiveFiles(2);
		const selectedPath = await displayFilePaths(activeFiles);
		if (selectedPath){
			if (input) {
				// Perform actions with the input
				console.log('Input:', input);
				searchInWorkSpaceObj.commandFunction({searchString:input}).then(message => {
					// Handle the success message or do something with it
					// TODO: send this message to the AI agent
					console.log(message);
				})
				.catch(error => {
					// Handle the error message or do something with it
					// TODO: send this message to the AI agent
					console.error(error);
				});
			} else {
				// User canceled the input
				console.log('Input canceled');
			}
		}else {
			console.log('Input canceled');
		}
		
		
	}
	
});
context.subscriptions.push(searchInWorkSpace);

// chatview test
  // Create a disposable for the chat view provider
  const chatViewProvider = new ChatViewProvider(context.extensionUri);
//   const chatViewProviderDisposable = vscode.window.registerTreeDataProvider(
// 	'ChatView',
// 	chatViewProvider
// );
context.subscriptions.push(vscode.window.registerWebviewViewProvider("ChatView", chatViewProvider));


//context.subscriptions.push(chatViewProviderDisposable);

// Register a command to add a new chat message
const addMessageCommandDisposable = vscode.commands.registerCommand(
	'ChatView.addmessage',
	() => {
		const inputOptions: vscode.InputBoxOptions = {
			prompt: 'Enter your message',
			placeHolder: 'Message...'
		};

		vscode.window.showInputBox(inputOptions).then(message => {
			if (message) {
				//const chatViewProvider = new ChatViewProvider();
				chatViewProvider.addMessage(message,true);
				vscode.window.showInformationMessage('Message added!');
			}
		});
	}
);

context.subscriptions.push(addMessageCommandDisposable);
// const errandSocket = new ErrandSocket();
const stateSocket = new StateSocket();
// console.log(errandSocket);
// const errand = vscode.commands.registerCommand('viki.errand',async (errandInstruction)=>{
// 	errandSocket.sendInstruction(errandInstruction);
// });

// context.subscriptions.push(errand);
// const inputInstruction = vscode.commands.registerCommand('viki.inputInstruction', async () => {
//     const instruction = await vscode.window.showInputBox({
//         prompt: 'Enter the instruction',
//         placeHolder: 'Instruction',
//     });
//     if (instruction) {
//         vscode.commands.executeCommand('viki.errand', instruction);
//     }
// });
// context.subscriptions.push(inputInstruction);

// THIS PART OF THE CODE IS RESPONSIBLE FOR OBSERVING FILE CHANGES
// BOTH OPENING AND EDITING OF FILES

const trackedFiles = new Map<string, fs.FSWatcher>();

	// Function to handle file changes
	function handleFileChange(filePath: string) {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const fileName = vscode.workspace.asRelativePath(filePath);
		const fileExtension = filePath.split('.').pop();

		// Print the updated information to the output console
		vscode.window.showInformationMessage(
		`File Path: ${filePath}\nFile Name: ${fileName}\nFile Extension: ${fileExtension}\nFile Content:\n${fileContent}`
		);
	} catch (error) {
		vscode.window.showErrorMessage(`Error reading the file: ${error.message}`);
	}
	}
  // Function to track currently opened files
  function trackOpenedFiles() {
	const files:any [] =[];
	vscode.window.visibleTextEditors.forEach((editor) => {
	const document = editor.document;
      const filePath = document.uri.fsPath;

      // Watch the file for changes using fs.watch
      if (!trackedFiles.has(filePath)) {
        const watcher = fs.watch(filePath, (event) => {
          if (event === 'change') {
            handleFileChange(filePath);
          }
        });
        trackedFiles.set(filePath, watcher);
		// stateSocket.onInitialize()
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const fileName = vscode.workspace.asRelativePath(filePath);
		const fileExtension = filePath.split('.').pop();
		if((fileExtension === 'py') || (fileExtension === 'js')){
			if(fileContent.trim()!==''){
				console.log('werrrrr');
				files.push({
					'fileName':fileName,
					'fileContent':fileContent,
					'fileExtension':fileExtension
				});
			}
			}
		
      }
console.log('LOGGING');
    });
	
	if(files.length !==0){
		console.log('FDFFrrrrr');
		stateSocket.onInitialize(files);
	}

  }

  // Track currently opened files when the extension is launched
  trackOpenedFiles();
	// This event is triggered whenever a file is opened in VSCode
	vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
	const filePath = document.uri.fsPath;

	// Watch the file for changes using fs.watch
	if (!trackedFiles.has(filePath)) {
		const watcher = fs.watch(filePath, (event) => {
		if (event === 'change') {
			handleFileChange(filePath);
		}
		});
		trackedFiles.set(filePath, watcher);
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const fileName = vscode.workspace.asRelativePath(filePath);
		const fileExtension = filePath.split('.').pop();
		stateSocket.onFileOpen(fileName,fileExtension,filePath,fileContent);
		vscode.window.showInformationMessage(`THE FOLLOWING FILE HAS JUST OPENED: ${filePath}`);
	}
	});

	// This event is triggered whenever a file is closed in VSCode
	vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
	const filePath = document.uri.fsPath;

	// Stop watching the file for changes when it's closed
	if (trackedFiles.has(filePath)) {
		const watcher = trackedFiles.get(filePath);
		if (watcher) {
		watcher.close();
		trackedFiles.delete(filePath);
		}
	}
	});
	// Start the client. This will also launch the server
	await client.start();
}

export function deactivate(): Thenable<void> {
	if (!client) {
		return undefined;
	}
	return client.stop();
}


// onFile Open
// onFile Close
// onFile change