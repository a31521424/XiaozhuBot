import fs from "fs";

(async () => {
	let res = await fs.readdirSync("./src/plugins");
	console.log(res);

	for (let i of res) {
		if (i.indexOf("_pg") !== -1) {
			let t = await import("./plugins/" + i.slice(0, i.length - 3));
			t.onLoad();
		}
	}
})();

export default {};
