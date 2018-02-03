const workOrder = require("../");
const {MongoClient} = require("mongodb");


async function run(argument) {
	const db = (await MongoClient.connect('mongodb://localhost:27017/workOrder')).db("workOrder");
	const wo = workOrder({
		collection: {
			list:db.collection("list"),
			log: db.collection("log"),
		}
	});
	const group = "test";

	await wo.setGroup(group, {
		getOption(group, flag, info) {
			return {
				adopt: {
					name:"通过"
				},
				reject: {
					name:"驳回"
				},
			}
		}, handle(group, handle, flag, info) {
			if(handle === "adopt") {
				if (-1 != flag.indexOf("a")) {
					return {
						flag: ["b"]
					}
				} else if (-1 != flag.indexOf("b")) {
					return {
						status: 1,
						flag: [],
					}
				}
			} else if(handle === "reject") {
				return {
					status: 2,
				}
			}
		}, getUserFlag(group, user) {
			return ["a", "b"];
		}});
	const id = await wo.create({group, title:"测试工单", flag:["a"], refid:"1", user:"1111", category:{x:["x"]}});
	console.log(await wo.get(id));
	console.log(await wo.handle(id, {handle: "reject", user:"asda"}));
	console.log(await wo.get(id));
	console.log(await wo.open(id, {user: "user"}));
	console.log(await wo.handle(id, {handle: "adopt", user:"asda"}));
	console.log(await wo.handle(id, {handle: "adopt", user:"asda"}));
	console.log(await wo.get(id));
	try {
		console.log(await wo.handle(id, {handle: "adopt", user:"asda"}));
	} catch(e) {
		console.log("因为工单已经完成，所以会出现如下的“找不到工单”错误：");
		console.log(e);
	}
	process.exit();
}


run().catch(console.error);