import { WebSocket } from "ws";
import * as vscode from 'vscode';
import { stateSocketUrl } from "../constants";




export class StateSocket{
	public socket: WebSocket;
	private isInitialized = false;
	constructor(){
		this.socket = new WebSocket(stateSocketUrl);
		// Event listener for WebSocket connection open
		this.socket.addEventListener('open', () => {
			console.log('WebSocket connection is open');
			// initialization complete
			this.isInitialized = true;
			
			// Send a message to the server
			});
		// Event listener to handle received messages
		this.socket.addEventListener('message', (event) => {
			const message = event.data;
			console.log('Received message:', message,typeof message);
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

	// implement a function to 
	// OPEN FILE
	public onFileOpen(fileName:string,fileExtension: string,filePath: string, fileContent:string){
		if(this.isInitialized){
			this.socket.send(
				JSON.stringify({
					'fileName':fileName,
					'fileExtension':fileExtension,
					'filePath':filePath,
					'fileContent':fileContent,
					'command':'FILEOPEN'
				})
			);
		}else{
			vscode.window.showErrorMessage("Unable to connect to server");
		}
	}
	// UPDATE FILE
	public onFileUpdate(fileName:string,fileExtension: string,filePath: string, fileContent:string){
		if(this.isInitialized){
			this.socket.send(
				JSON.stringify({
					'fileName':fileName,
					'fileExtension':fileExtension,
					'filePath':filePath,
					'fileContent':fileContent,
					'command':'FILEMODIFY'
				})
			);
		}else{
			vscode.window.showErrorMessage("Unable to connect to server");
		}
	}
	// CLOSE FILE
	public onFileClose(fileName:string,fileExtension: string,filePath: string){
		if(this.isInitialized){
			this.socket.send(
				JSON.stringify({
					'fileName':fileName,
					'fileExtension':fileExtension,
					'filePath':filePath,
					'command':'FILECLOSE'
				})
			);
		}else{
			vscode.window.showErrorMessage("Unable to connect to server");
		}
	}

	public onInitialize(files:any){
		if(this.isInitialized){
			this.socket.send(
				JSON.stringify(
					{
						'files':files,
						'command':'INITIALIZE'
					}
				)
			);
		}else{
			vscode.window.showErrorMessage("Unable to connect to server");
		}
	}

}


