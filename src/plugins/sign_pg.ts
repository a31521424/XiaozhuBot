import { Api } from "../api";
import { event as e } from "../struct";

import schedule from "node-schedule";

export async function onLoad() {
	console.log("sign", "加载成功");
}
export async function onEvent(msg: e.Msg, api: Api) {}
