import WebSocket from "ws";
import config from "./config";
import events from "./event";
import { Api } from "./api";

class Driver {
	ws = new WebSocket(config.ws.url);
	msg_pool: any[] = [];
	constructor() {
		this.ws.on("message", (res) => {
			new Promise((reject, resolve) => {
				let data = JSON.parse(res.toString()) as any;
				if (!("post_type" in data)) {
					this.msg_pool.push(data);
				} else if (data?.post_type === "meta_event") {
				} else {
					events.onEvent(data as any, Api.instance(data));
				}
			});
		});
		this.ws.on("error", (e) => console.log(e));
		this.ws.on("open", () => {
			setTimeout(() => {
				events.onLoad();
			}, 1000);
		});
	}
	async send(data: { [key: string]: any } | string): Promise<any> {
		let tmp = new Date().getTime(); // 时间戳
		if (data instanceof Object) {
			data.echo = tmp;
		}
		data = JSON.stringify(data);

		this.ws.send(data);
		return new Promise((resolve, reject) => {
			let timers: any[] = [];
			for (let i = 0; i < 20; i++) {
				timers.push(
					setTimeout(() => {
						// console.log("循环", i, new Date().getTime());
						for (let j = 0; j < this.msg_pool.length; j++) {
							if ((this.msg_pool[j].echo = tmp)) {
								for (let i of timers) {
									clearTimeout(i);
								}
								resolve(this.msg_pool[j]);
								this.msg_pool.slice(j, 1);
							}
						}
					}, 500 * i)
				);
				if (i === 19) {
					setTimeout(() => {
						reject("timeout");
					}, (i + 1) * 500);
				}
			}
		});
	}
}
const driver = new Driver();

export { driver };
export default {};
