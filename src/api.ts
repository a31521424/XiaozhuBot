import { driver } from "./event_driver";
import { event as e } from "./struct";

class Api {
	content: any;
	private static _api: Api;
	public static get api(): Api {
		return Api._api;
	}
	public static set api(value: Api) {
		Api._api = value;
	}
	public static instance(content: any): Api {
		if (!this.api) {
			this.api = new Api();
		}
		this.api.content = content;
		return this.api;
	}
	async sendPrivateMsg(params: {
		user_id: number;
		gruop_id?: number;
		message: e.message | string;
		auto_escape?: boolean;
	}) {
		return driver.send({ action: "send_private_msg", params });
	}
	async sendGruopMsg(params: {
		group_id: number;
		message: e.message | string;
		auto_escape?: boolean;
	}) {
		return driver.send({ action: "send_group_msg", params });
	}
	async sendMsg(params: {
		message_type: string;
		user_id?: number;
		group_id?: number;
		message: e.message;
		auto_escape?: boolean;
	}) {
		return driver.send({ action: "send_msg", params });
	}
	async replay(params: { message: e.message | string }) {
		let content = { ...this.content };
		content.message = params.message;
		return this.sendMsg(content);
	}
}
export { Api };
