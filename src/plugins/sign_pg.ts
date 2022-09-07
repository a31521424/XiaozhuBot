import { Api } from "../api";
import { event as e } from "../struct";

import schedule, { scheduledJobs, scheduleJob } from "node-schedule";
import CryptoJS from "crypto-js";
import axios from "axios";

import config from "./sign/sign_config.json";

import { getCode } from "./sign/scan_code";
import fs from "fs";

// 结构区定义

// 类操作区
class QnSign {
	public info: {
		name: string;
		id: string;
		pwd: string;
		uid: number;
		loc: string;
		qq: number;
		group?: number;
	};
	constructor(params: {
		info: {
			name: string;
			id: string;
			pwd: string;
			loc: string;
			qq: number;
			group?: number;
		};
	}) {
		this.info = { ...params.info, uid: 0 };
		this.info.pwd = CryptoJS.MD5(this.info.pwd).toString().toLowerCase();
	}
	public static async login(params: {
		info: {
			name: string;
			id: string;
			pwd: string;
			loc: string;
			qq: number;
			group?: number;
		};
	}): Promise<QnSign | null> {
		let qn = new QnSign(params);
		let data = {
			YXDM: "13668",
			UserType: 1,
			XGH: qn.info.id,
			Name: qn.info.name,
			PassWord: qn.info.pwd,
		};
		let res = await axios.post(
			"https://yqfkapi.zhxy.net/api/User/CheckUser",
			data
		);

		if (res?.data?.data?.ID) {
			qn.info.uid = res.data.data.ID;

			return qn;
		} else {
			return null;
		}
	}

	async getStatus() {
		if (this.info.uid > 0) {
			let res = await axios.get(
				"https://yqfkapi.zhxy.net/api/ClockIn/IsClockIn",
				{ params: { uid: this.info.uid, usertype: 1, yxdm: 13668 } }
			);
			return { res: res.data };
		} else {
			return { res: "请先初始化" };
		}
	}
	private generatHeaders() {
		let random_str = Math.random()
			.toString(36)
			.substr(2)
			.toLocaleUpperCase();
		let time_str = Math.floor(new Date().getTime() / 1000) + 300 + "";
		let sign_str_o =
			random_str + time_str + "Q9y1Vr5sbjGwR8gekNCzELhZioQb9UZw";
		let sign_str = CryptoJS.MD5(sign_str_o).toString().toUpperCase();
		return {
			timestamp: time_str,
			sign: sign_str,
			noncestr: random_str,
			Connection: " keep-alive",
			Authorization: " Bearer undefined",
			Origin: " https://wxyqfk.zhxy.net",
			Referer: " https://wxyqfk.zhxy.net/",
			"Content-Type": " application/json;charset=UTF-8",
			"User-Agent":
				" Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
			"Accept-Encoding": " gzip, deflate, br",
			"Accept-Language": " zh-CN,zh;q=0.9",
			"Sec-Fetch-Site": " same-site",
			"Sec-Fetch-Mode": " cors",
			"Sec-Fetch-Dest": " empty",
		};
	}
	async sign(): Promise<any> {
		let { data, config } = await axios.get(
			"https://yqfkapi.zhxy.net/api/common/getverifycode",
			{ headers: this.generatHeaders() }
		);

		// console.log("111", config.headers);
		if (data?.code === 200) {
			let { key, img } = data.data;
			let {
				data: { pic_str: code },
			} = await getCode(img);
			let senddata = {
					UID: this.info.uid,
					UserType: 1,
					JWD: "0,0",
					key: key,
					code: code,
					ZZDKID: 0,
					A1: "正常",
					A4: "无",
					A2: "全部正常",
					A3: this.info.loc,
					YXDM: "13668",
					version: "v1.3.2",
				},
				sendheaders = this.generatHeaders();
			return new Promise((resolve, reject) => {
				setTimeout(async () => {
					let res = await axios.post(
						"https://yqfkapi.zhxy.net/api/ClockIn/Save",
						senddata,
						{
							headers: sendheaders,
						}
					);

					resolve(res.data);
				}, 2000);
			});
		}
	}
}

const api = Api.instance(null);
const ans: QnSign[] = [];

export async function onLoad() {
	console.log("sign", "加载成功");
	for (let i of config.info) {
		let one = await QnSign.login({ info: i });
		one !== null ? ans.push(one) : console.error(i.name, "登录失败");
	}
	// 定时通知打卡
	schedule.scheduleJob("0 0 18,23 * * *", async () => {
		// schedule.scheduleJob("10,30,50 * * * * *", async () => {
		for (let i of ans) {
			let { res } = await i.getStatus();

			let msg = "";
			if (res?.code === 200) {
				msg = `${i.info.name}同学\n打卡状态: ${res.data.msg}\n连续打卡天数: ${res.data.totaldate}`;
			} else {
				msg = JSON.stringify(res);
			}

			if (i.info.group) {
				msg = [
					{ type: "at", data: { qq: i.info.qq.toString() } },
					{ type: "text", data: { text: msg } },
				] as any;
				api.sendGruopMsg({ group_id: i.info.group, message: msg });
			} else {
				api.sendPrivateMsg({
					user_id: i.info.qq,
					message: msg,
				});
			}
		}
	});
	schedule.scheduleJob("23 32 8 * * *", async () => {
		for (let i of ans) {
			let msg = "您已经打过卡了";

			let { res } = await i.getStatus();
			if (!(res.data?.isclockin === true)) {
				let signData = await i.sign();
				if (signData?.code === 200) {
					msg = "打卡成功";
				} else {
					msg = signData;
				}
			}

			if (i.info.group) {
				msg = [
					{ type: "at", data: { qq: i.info.qq.toString() } },
					{ type: "text", data: { text: msg } },
				] as any;
				api.sendGruopMsg({ group_id: i.info.group, message: msg });
			} else {
				api.sendPrivateMsg({
					user_id: i.info.qq,
					message: msg,
				});
			}
		}
	});
}
export async function onEvent(msg: e.Msg, api: Api) {
	if (["private", "group"].includes(msg.message_type)) {
		if (msg.message === "/打卡状态") {
			for (let i of ans) {
				if (i.info.qq === msg.user_id) {
					let { res } = await i.getStatus();
					let replay = "";
					if (res?.code === 200) {
						replay = `${i.info.name}同学\n打卡状态: ${res.data.msg}\n连续打卡天数: ${res.data.totaldate}`;
					} else {
						replay = JSON.stringify(res);
					}
					api.replay({ message: replay });
					break;
				}
			}
		}
	}
}

(async () => {
	let qn = (await QnSign.login({ info: config.info[0] })) as QnSign;
	// console.log(await qn.getStatus());
	// console.log(await qn.sign());
})();
