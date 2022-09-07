import axios from "axios";
async function getCode(pic: string): Promise<any> {
	let res = await axios.post(
		"http://upload.chaojiying.net/Upload/Processing.php",
		{
			user: "banbxio",
			pass2: "4759896cd291516143fa8d0c1e4cceb9",
			softid: "938533",
			codetype: "1104",
			file_base64: pic,
		}
	);
	return res;
}
export { getCode };
