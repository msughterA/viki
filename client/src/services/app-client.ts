import { WebSocket } from "ws";
import { websocketUrl } from "../constants";
import { OpenFile,CreateFile,FileExists,DeleteFile,GetActiveDirectory,GetActiveFile } from "../tools/fileoperator";
import { SearchInFile,SearchInFileWithReplacement, SearchInWorkSpace, SearchAndHighlightInFile } from "../tools/search";
import { Notification } from "../tools/notification";
import { QuickPick } from "../tools/quickpick";
import * as vscode from 'vscode';
// make api to connect to websocket
// Create a new WebSocket instance

export class ErrandSocket{
	public socket: WebSocket;
	private isInitialized = false;
	constructor(){
			this.socket = new WebSocket(websocketUrl);

			// Event listener for WebSocket connection open
			this.socket.addEventListener('open', () => {
			console.log('WebSocket connection is open');
			// initialization complete
			this.isInitialized = true;
			
			// Send a message to the server
			});
			
			// Event listener for WebSocket message received
			this.socket.addEventListener('message', (event) => {
			const message = event.data;
			console.log('Received message:', message,typeof message);
			
			// Close the WebSocket connection after receiving a specific message
			// these is the point where i would use switch case to call the respective
			// based on their names.
			const openFileObj = new OpenFile();
			const createFileObj = new CreateFile();
			const fileExistsObj = new FileExists();
			const deleteFileObj = new DeleteFile();
			const searchInFileObj = new SearchInFile();
			const searchInWorkSpaceObj = new SearchInWorkSpace();
			const searchInFileWithReplacementObj = new SearchInFileWithReplacement();
			const notificationObj = new Notification();
			const quickPickObj = new QuickPick();
			const getActiveDirectoryObj = new GetActiveDirectory();
			const getActiveFileObj = new GetActiveFile();
			const searchAndHighlightObj = new SearchAndHighlightInFile();
			try{
				
				const jsonData = JSON.parse(message.toString());
				const commandName = jsonData.command;
				const commandArguments =jsonData.arguments; 
				console.log(commandName);
			switch (commandName) {
					case 'openFile':
						openFileObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'success',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
						break;
					case 'createFile':
						createFileObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
					
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
						break;
					case 'fileExists':
						fileExistsObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'deleteFile':
						deleteFileObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'finish':
						this.socket.send(JSON.stringify({'result':'well done','type':'finish'}));
					break;
					case 'searchInFile':
						searchInFileObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'searchInFileWithReplacement':
						searchInFileWithReplacementObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'searchAndHighlight':
						searchAndHighlightObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'searchInWorkspace':
						searchInWorkSpaceObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'notification':
						notificationObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});

					break;
					case 'quickpick':
						quickPickObj.commandFunction(commandArguments).then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});

					break;
					case 'getActiveFile':
						getActiveFileObj.commandFunction().then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					case 'getActiveDirectory':
						getActiveDirectoryObj.commandFunction().then(message => {
							// Handle the success message or do something with it
							// TODO: send this message to the AI agent
							console.log(message);
							const response_data = {
								'result':message,
								'status':'succes',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						})
						.catch(error => {
							// Handle the error message or do something with it
							// TODO: send this message to the AI agent
							console.error(error);
							const response_data = {
								'result':error,
								'status':'failure',
								'type':'result'
							};
							this.socket.send(
								JSON.stringify(response_data)
							);
						});
					break;
					default:
							
							this.socket.send(
								JSON.stringify( {
									'result':'You provided the wrong tool name. make sure you provide everything in the right format',
									'status':'failure',
									'type':'result'
								})
							);
					break;
				}
			if (message === 'Goodbye, server!') {
				this.socket.close();
			}
			}catch(e){
				console.log(e);
				console.log('An error occured while parsing the json');
			}
			});
			
			// Event listener for WebSocket connection close
			this.socket.addEventListener('close', () => {
				this.isInitialized = false;
			console.log('WebSocket connection is closed');
			vscode.window.showInformationMessage("Connection to server closed");
			});
			
			// Event listener for WebSocket connection error
			this.socket.addEventListener('error', (error) => {
				this.isInitialized = false;
			console.error('WebSocket error:', error);
			vscode.window.showErrorMessage('Server error');
			});
		
	}
	public initialize(){
		console.log("Object has initialized");
	}

	public sendInstruction(instruction:string){
		if(this.isInitialized){
			this.socket.send(
			JSON.stringify({
				'instruction':instruction,
				'type':'instruction'
			})
			);
		}else{
			vscode.window.showErrorMessage("Unable to connect to server");
		}
		}
}
