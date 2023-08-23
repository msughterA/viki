
//import { CommandType } from './enumerations';


export interface ToolInterface {
	commandId: string;
	readonly details : {description: string, usage: string};
	commandFunction?(args: unknown):Promise<any>;
	commandTitle?: string;
	//commandType: CommandType;
}