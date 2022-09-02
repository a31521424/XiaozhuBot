namespace event {
	export interface message {
		[index: number]: { type: string; data: string };
	}
	export interface anonymous {
		id: number;
		name: string;
		flag: string;
	}
	export interface Msg {
		time: number;
		self_id: number;
		post_type: "message";
		message_id: number;
		user_id: number;
		message: message | string;
		raw_message: string;
		font: number;
		sender: object;
		message_type: string;
		sub_type: string;
	}
	export interface PrivateMsg extends Msg {
		temp_source: number;
		message_type: "private";
		sub_type: "friend" | "group" | "group_self" | "other";
	}
	export interface GorupMsg extends Msg {
		group_id: number;
		anonymous: object | null;
		message_type: "group";
		sub_type: "normal" | "anonymous" | "notice";
	}
}
export { event };
