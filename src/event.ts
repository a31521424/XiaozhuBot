import axios from "axios";
import { Api } from "./api";
import { event as e } from "./struct";
import fs from "fs";

const plugins: any[] = [];
(async () => {
	let res = await fs.readdirSync("./src/plugins");

	for (let i of res) {
		if (i.indexOf("_pg") !== -1) {
			plugins.push(await import("./plugins/" + i.slice(0, i.length - 3)));
		}
	}
})();

namespace events {
	export async function onEvent(msg: e.Msg, api: Api) {
		for (let i of plugins) {
			i.onEvent(msg, api);
		}
	}
	export async function onLoad() {
		for (let i of plugins) {
			i.onLoad();
		}
	}
}

export default events;
