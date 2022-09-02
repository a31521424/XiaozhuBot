import { Api } from "../api";
import { event as e } from "../struct";

export async function onLoad() {
	console.log("repeat", "加载成功");
}
export async function onEvent(msg: e.Msg, api: Api) {
	if (msg.message_type === "private" && msg.user_id === 31521424) {
		let sleep_time = Math.floor(Math.random() * 1000);
		await new Promise((resovle, reject) => {
			setTimeout(() => {
				resovle(sleep_time);
			}, sleep_time);
		});
		api.replay({ message: `复读姬\n${msg.message}` });
	}
}
