import * as vscode from 'vscode';
//import { Util } from '../utils';
//import { avatarUrlkey,userNameKey } from '../constants';
import { Credentials } from '../credentials';
import { chatUrl } from '../constants';
import axios, { AxiosResponse } from 'axios';
import { Util } from '../utils';
//import { avatarUrlkey, userNameKey } from '../constants';



//stores the message content of a single chat
export class ChatMessage {
    constructor(public readonly content: string, public readonly isUser: boolean) {}
	getIcon(): vscode.ThemeIcon {
        return new vscode.ThemeIcon("comment");
    }
}

interface Data {
	status:boolean;
	output:string
}

interface LoginData {
	userName:string;
	avatarUrl:string
}

interface MessageFormat{
	input:string;
	output:string;
}
export class ChatViewProvider implements vscode.WebviewViewProvider {
	private webviewView: vscode.WebviewView | undefined;
	private messages: ChatMessage[] = [];
	private inputOutputMessageFormat: MessageFormat []=[]; 
	private signedIn =false;
	private testProperty ="This is the test property current value";
	private avatarUrl: string|undefined;
	private userName: string|undefined;
	private gitId: number|undefined;
	private errorPrefix = "An error occurred:";
	private isLoadingMessage = false;
	
  
		constructor(private readonly _extensionUri: vscode.Uri) {
			//const sessionId = vscode.env.sessionId;

			//Util.globalState.update();
		// this.messages.push(
		// 	new ChatMessage(`
		// 	Some text here...
		// 	\`\`\`javascript
		// 	const greeting = 'Hello, world!';
		// 	console.log(greeting);
		// 	\`\`\`
			
		// 	More text...
			
		// 	\`\`\`python
		// 	def say_hello():
		// 		print("Hello, world!")
			
		// 	say_hello()
		// 	\`\`\``,
		// 	false
		// 	),
		// 	new ChatMessage(`How can make a regular expression in javascript`,true)
		// );
		
		}
	
		public async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
		this.webviewView = webviewView;
		this.webviewView.webview.options = {
			enableScripts: true,
		};
		this.webviewView.webview.html =await  this.getHtmlContent();
	
		this.webviewView.webview.onDidReceiveMessage(async (message: any) => {
			// Handle the received message from the webview
			// check if user info is stored in cache
			// before proceeding to authenticate
			if (message.command === 'authenticate') {
				await this.authenticateUser();
				this.loginToChatview();
				console.log("Authentication message sent");
			} else if (message.command ==='clear'){
				this.messages=[];
				this.inputOutputMessageFormat =[];
				this.updateWebview();
				console.log('Clear chats');
			} else if (message.command==='signout'){
				this.chatviewToLogin();
			}
			else if (message.command === 'addmessage'){
				if(this.isLoadingMessage===false){
					// code goes here
				
				this.isLoadingMessage = true;
				this.addMessage(message.data,true);
				this.updateWebview();
				this.loadingView(true);
				const data = await this.makeRequest(message.data);
				if(data.status===true){
					this.addMessage(data.output,false);
					console.log(`data was recieved ${data.output}`);
					this.isLoadingMessage = false;
					this.loadingView(false);
					this.inputOutputMessageFormat.push({
						input: message.data,
						output: data.output
					});
					this.updateWebview();
				}else{
					this.addMessage(`${this.errorPrefix} server not working`,false);
					this.loadingView(false);
					this.isLoadingMessage = false;
					this.updateWebview();
					//vscode.env.sessionId
				}
				
				}
			}
		});
	
		
		}
		private async makeRequest(query:string):Promise<Data>{
				try {
					const url = chatUrl; // Replace with your API endpoint
					
					// Define the request configuration
					const requestData = {
					// Add your request payload here
					query:query,
					chat_history:this.inputOutputMessageFormat
					};
				
					// const config: AxiosRequestConfig = {
					// method: 'POST', // Use the POST method
					// url: url,
					// headers: {
					// 	'Content-Type': 'application/json', // Set the request content type
					// 	// Add any additional headers if required
					// },
					// data: requestData, // Set the request payload
					// };
				
					// // Send the request
					// const response: AxiosResponse<Data> = await axios(config);
					const response: AxiosResponse<Data> = await axios.post<Data>(
						url,
						requestData
					);
					//const data = response.data;
					//const data = axiosData.data['output'];
					//const print = data['output'];
					//console.log(`HERE IS THE MESSAGE: ${print}`);
					console.log(`THE ORIGINAL RESPONSE: ${response.data['output']}`);
					// Add your own logic to process the response data
					return response.data;
				
				} catch (error) {
					// Handle any errors
					console.error('Error:', error.message);
					return {
						status:false,
						output: error.message
					};
					// Add your own error handling logic
				}
		}
	
		private async getHtmlContent(): Promise<string> {
			// const credentials = new Credentials();
			// this.signedIn = await credentials.checkUserSignedIn();
			// const octokit = await credentials.getOctokit();
			// const userInfo = await octokit.users.getAuthenticated();
			// this.avatarUrl =userInfo.data.avatar_url;
			// this.testProperty ="Test property changed";
			// //const signedIn = false;
		//const startedConveration = this.messages.length === 0;
		this.avatarUrl ='';
		const {avatarUrl,userName} = this.loginData();
		console.log('FUNCTION CALLED');
		if(avatarUrl ==='' || userName ===''){
			this.signedIn =false;
		}
		else{
			this.signedIn = true;
		}

		const chatViewStylePath=vscode.Uri.joinPath(this._extensionUri,'static','chatview.css');
		const inputJsPath = vscode.Uri.joinPath(this._extensionUri,'static','input-box.js');
		const prismJsPath = vscode.Uri.joinPath(this._extensionUri,'static','prism.js');
		const controllerJsPath = vscode.Uri.joinPath(this._extensionUri,'static','controller.js');
		//const prismCssLPath = vscode.Uri.joinPath(this._extensionUri,'static','prism.css');
		const prismCssDPath = vscode.Uri.joinPath(this._extensionUri,'static','prismDark.css');
		const prismJsLUri = this.webviewView?.webview.asWebviewUri(prismJsPath);
		//const prismCssLUri = this.webviewView?.webview.asWebviewUri(prismCssLPath);
		const prismCssDUri = this.webviewView?.webview.asWebviewUri(prismCssDPath);
		const iconsPath = vscode.Uri.joinPath(this._extensionUri,'icons');
		const iconsUri = this.webviewView?.webview.asWebviewUri(iconsPath);
		const chatViewStyleUri = this.webviewView?.webview.asWebviewUri(chatViewStylePath);
		const inputJsUri = this.webviewView?.webview.asWebviewUri(inputJsPath);
		const controllerJsUri = this.webviewView?.webview.asWebviewUri(controllerJsPath);
		//const prismCssPath = this.webviewView?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules/prismjs/themes/prism.min.css'));
		//const prismJsPath = this.webviewView?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules/prismjs/prism.js'));
		//const prismLanguageJsPath = this.webviewView?.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules/prismjs/components/prism-javascript.min.js'));
		
		const chatMessages = this.messages.map((message) => {
			// html responsilble for holding the code part of the message
			// use regex to parse through the message content and replace it with the necessary html
			let content = message.content;
			const vikiBubble = `<div class="viki-icon-container"><img src="${iconsUri}/robot-svgrepo-com.svg" alt="SVG Image">
			</div>
			<span>Viki</span>`;
			const userBubble =`<div class="user-icon-container"><img src="${this.avatarUrl}" id="avatar" class="user" alt="SVG Image">
			</div>
			<span id="userName">User</span>`;
			const bubble = message.isUser?userBubble:vikiBubble;
			// Replace code blocks with HTML
			content = content.replace(/```([a-zA-Z]+)\n([\s\S]*?)```/g, `<pre style="padding-left:20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
			<div>
			<p>$1</p>
			<div>
			<div class="tool">
			 copy
			</div>
			<div class="tool">
			replace
			</div>
			</div>
			</div>
			<code class="language-$1" style="padding-left:20px">
			$2
			</code>	</pre>`);
			// <div class="btns">
			// 			<div class="btn">
			// 			<p>Delete file</p>
			// 			</div>
			// 			<div class="btn">
			// 			<p>Open file</p>
			// 			</div>
			// 			<div class="btn">
			// 			<p>Close file</p>
			// 			</div>
			// 			<div class="btn">
			// 			<p>Replace Code</p>
			// 			</div>
			// 			</div>

			return `
						<div class="message">
						<div class="message-header">
							
						${bubble}
						</div>
						<div class="message-box">
						${content}
						</div>
						</div>
						<hr style="height: 0.2px;">
					`;
		}).join('');


				const emptyChatHtml = `
				<div class="start-chat-container">
				<img class="viki-icon" src="${iconsUri}/robot-svgrepo-com.svg" alt="Send" />
				<h2> Start a Conversation with Viki</h2>
				<div></div>
				</div>`;

				const chatHtml = `<div class="chat-container" id="all-messages" style="display:none">

				${chatMessages}
				</div>`;
				return `
					<html>
					<head>
					<link href="${prismCssDUri}" rel="stylesheet" />
					<link rel="stylesheet" type="text/css" href="${chatViewStyleUri}">
					<style id="main-styles">
					${this.signedIn?chatCss:signInCss}
					</style>
					</head>
					<body>
					<div class="chat">
					<h1>Chat View</h1>
					<div class='quick-controls'>
					<button id="signout">
						<img class="git-logo" src="${iconsUri}/github-142-svgrepo-com.svg">
						Sign out
						</button>
						<button id="clear">
						Clear chats
						</button>
					 </div>
					${chatHtml}
					${emptyChatHtml}
					<div class="chat-input">
					<textarea id="chat-text-input" type="text" placeholder="Type your message..."></textarea>
					<img class="send-icon" id="send" src="${iconsUri}/send-svgrepo-com.svg" alt="Send" />
					<div class="loader" style="display:none;"></div>
				  </div>
					<script src="${inputJsUri}"></script>
					<script src="${controllerJsUri}"></script>
					<script src="${prismJsLUri}"></script>
					
					<script>
					
						const userInput = document.getElementById('chat-text-input')
						userInput.addEventListener('keypress', function(event) {
							if (event.key === 'Enter') {
								const text = userInput.value;

								if (text.trim() === '') {
								console.log('The textarea is empty.');
								} else {
									vscode.postMessage({ command: 'addmessage' ,data: text });
									userInput.value = '';
								}
							}
						  });
						document.getElementById('send').addEventListener('click', () => {
							
							const text = userInput.value;

							if (text.trim() === '') {
							console.log('The textarea is empty.');
							} else {
								vscode.postMessage({ command: 'addmessage' ,data: text });
								userInput.value = '';
							}

						});
						// Receive messages from the extension
						// Select chat-container
						const signoutButton = document.querySelector('#signout');
						const clearButton = document.querySelector('#clear');
						clearButton.addEventListener('click',()=> {
							vscode.postMessage({ command: 'clear' });
								
						});

						
						signoutButton.addEventListener('click',()=> {
							vscode.postMessage({ command: 'signout' });
								
						});
					</script>
					</div>
					<div class="signIn">
						<img class="viki-icon" src="${iconsUri}/robot-svgrepo-com.svg" alt="Send" />
						<h2>You are not signed in.</h2>
						<p>Tap the button below to sign in with GitHub.</p>
						<button id="authenticateButton">
						<img class="git-logo" src="${iconsUri}/github-142-svgrepo-com.svg">
						Sign in with GitHub
						</button>
						<div class="spacer-div"></div>
					</div>
					<script>
					const vscode = acquireVsCodeApi();
					document.getElementById('authenticateButton').addEventListener('click', () => {
						vscode.postMessage({ command: 'authenticate' });
					});
				</script>
					</body>
					</html>
				`;
			
		}

	
	private updateWebview(): void {
		if (this.webviewView) {
			const iconsPath = vscode.Uri.joinPath(this._extensionUri,'icons');
			const iconsUri = this.webviewView?.webview.asWebviewUri(iconsPath);
			//const imgPath = this.signedIn ?this.avatarUrl:`${iconsUri}/sample-profile.jpeg`;
			const chatMessages = this.messages.map((message) => {
				// html responsilble for holding the code part of the message
				// use regex to parse through the message content and replace it with the necessary html
				let content = message.content;
				const vikiBubble = `<div class="viki-icon-container"><img src="${iconsUri}/robot-svgrepo-com.svg" alt="SVG Image">
				</div>
				<span>Viki</span>`;
				const userBubble =`<div class="user-icon-container"><img src="${this.avatarUrl}" id="avatar" class="user" alt="SVG Image">
				</div>
				<span id="userName">User</span>`;
				const bubble = message.isUser?userBubble:vikiBubble;
				// Replace code blocks with HTML
				content = content.replace(/```([a-zA-Z]+)\n([\s\S]*?)```/g, `<pre style="padding-left:20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
				<div>
				<p>$1</p>
				<div>
				<div class="tool">
				 copy
				</div>
				<div class="tool">
				replace
				</div>
				</div>
				</div>
				<code class="language-$1" style="padding-left:20px">
				$2
				</code>	</pre>`);
				// <div class="btns">
				// 			<div class="btn">
				// 			<p>Delete file</p>
				// 			</div>
				// 			<div class="btn">
				// 			<p>Open file</p>
				// 			</div>
				// 			<div class="btn">
				// 			<p>Close file</p>
				// 			</div>;
				// 			<div class="btn">
				// 			<p>Replace Code</p>
				// 			</div>
				// 			</div>

				if (content.startsWith(this.errorPrefix)){
					const result = content.replace(new RegExp(`^${this.errorPrefix}`), '');
					content =`
					<div class="chat-error">
					 The following error occurred: ${result}
					<div>
					`;

				}
	
				return `
							<div class="message">
							<div class="message-header">
								
							${bubble}
							</div>
							<div class="message-box">
							${content}
							</div>
							</div>
							<hr style="height: 0.2px;">
						`;
			}).join('');
			console.log("Webview updating ..................");
			this.webviewView.webview.postMessage({
			command: "updateChats",
			chatMessages: chatMessages,	
			arrayLength:this.messages.length
			});
		}
		// const sendIcon = document.querySelector(".send-icon");
		// const loadIcon = chatInput.querySelector(".loader");
		console.log('UPDATE WEBVIEW HAS BEEN CALLED');
	}
		private loginToChatview(): void {
			if (this.webviewView) {
		
			//const signInStatus = true ? 'signed-in' : 'not-signed-in';
			console.log(`Signed In status ${this.signedIn}`);
			console.log(`Test property: ${this.testProperty}`);
			console.log(`Image url:${this.avatarUrl}`);
			Util.globalState.update('userName',this.userName);
			Util.globalState.update('avatarUrl',this.avatarUrl);
			Util.globalState.update('gitId',this.gitId);
			this.webviewView.webview.postMessage({
				command: 'loginTochatview',
				signInStatus: 'signed-in',
				avatarUrl:this.avatarUrl,
				userName:this.userName
			});
			}
		}

		private chatviewToLogin(): void {
			if (this.webviewView) {
		
			//const signInStatus = true ? 'signed-in' : 'not-signed-in';
			Util.globalState.update('userName',undefined);
			Util.globalState.update('avatarUrl',undefined);
			Util.globalState.update('gitId',undefined);
			this.webviewView.webview.postMessage({
				command: 'chatviewtologin',
			});
			}
		}
		private loginData(): LoginData{
			const {userName, avatarUrl} = Util.getGitData();
			return {userName,avatarUrl};
		}
		// private clearView(): void {
        //     this.webviewView.webview.postMessage({
		// 		command:'clear'
		// 	});
		// }
		private loadingView(status:boolean): void {
			if(this.webviewView){
				this.webviewView.webview.postMessage({
					command: 'messageLoading',
					status: status,
				});
			}
		}

		
		// 	if(this.webviewView){
		// 		this.webviewView.webview.postMessage({
		// 			command: 'error',
		// 			message: message
		// 		});
		// 	}
		// }
	
		public addMessage(message: string,isUser:boolean): void {
	
		const chatMessage = new ChatMessage(message,isUser);
		this.messages.push(chatMessage);
		
		}
		public async authenticateUser(): Promise<void> {
			try{
			const credentials = new Credentials();
			const octokit = await credentials.getOctokit();
			const userInfo = await octokit.users.getAuthenticated();
			this.signedIn =true;
			this.testProperty = "changed in authenticate user function";
			this.avatarUrl = userInfo.data.avatar_url;
			this.userName = userInfo.data.login;
			this.gitId = userInfo.data.id;
			//Util.setGitData(this.userName,this.avatarUrl);
			// update the avatar url
			//Util.globalState.update(avatarUrlkey,userInfo.data.avatar_url);
			// update the username
			//Util.globalState.update(userNameKey,userInfo.data.login);
			//this.updateWebview();
			}catch(e){
				console.log(e);
				// handle error;
				vscode.window.showErrorMessage('Unable to sign in to github');
			}
			
			}
			
  }

  const signInCss = `
  body {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  height: 100vh;
	  font-family: Arial, sans-serif;
  }
  button {
	  margin-top: 20px;
	  padding: 10px 20px;
	  font-size: 12px;
	  background-color:#78E490;
	  border-radius:5px;
	  border:none;
	  display:flex;
	  flex-direction:row;
	  align-items:center;
	  justify-content:center;
  }
  .git-logo{
	  width:20px;
	  height:20px;
	  margin-right:10px;
  }
  .viki-icon{
	  height: 80px;
	  width: 80px;
	}
  .spacer-div{
	  height:12%;
	  width:auto;
  }
  .signIn{
	  width: 100%;
	  height: 100%;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
  }
  .chat{
	  display:none;
  }
  `;
  
  const chatCss = `
  pre{
	  pading-left:20px;
  }
  pre > div > div {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  justify-content: space-between;
	  width: 140px;
	  height: 40px;
  }
  .chat{
	  width: 100%;
	  height: 100%;
  }
  .signIn{
	  display:none;
  }
  button {
	margin-top: 20px;
	padding: 10px 20px;
	font-size: 12px;
	background-color:#78E490;
	border-radius:5px;
	border:none;
	display:flex;
	flex-direction:row;
	align-items:center;
	justify-content:center;
}
.git-logo{
	width:20px;
	height:20px;
	margin-right:10px;
}
  `;