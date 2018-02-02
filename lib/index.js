const {ObjectId} = require('mongodb');

class OperationError extends Error{
	constructor(msg) {
		super(msg);
	}
}

function objectId (id) {
	if (id instanceof ObjectId) {return id;}
	if (typeof id !== "string" || id.length !== 24 || id.search(/^[0-9a-f]{24}$/ig)) {return null;}
	return ObjectId(id);
}

/**
 * 获取ID数组
 * @param  {Array | Id} id 数组或者Id
 * @return {Array}    Id数组
 */
function objectIdArray(id) {
	let ret =[];
	if (id instanceof Array) {
		id.map(id=>{
			id = objectId(id);
			if(id) {ret.push(id);}
		})
	} else {
		id = objectId(id);
		if(id) {ret.push(id);}
	}
	return ret;
}



/**
 * 添加日志
 */
async function addLog(refid, user, handle, name, explain) {
	switch (handle) {
		case 0:
		case false:
			handle = 0;
			name = "关闭工单";
			break;
		case 1:
		case true:
			handle = 1;
			name = "创建工单";
			break;
		case 3:
			name = "重新打开";
			break;
		default:
			if (!handle) {
				handle = "";
				name = "";
			} else {
				handle = String(handle);
			}
	}
	if (!name) {
		name = "";
	} else {
		name = String(name);
	}
	if (!(explain && typeof explain === "string")) {
		explain = "";
	}
	await this.db.log.insert({refid: objectId(refid), user, date: new Date, handle, name, explain});
}

async function getLog(refid) {
	return this.db.log.find({refid: objectId(refid)}).toArray();
}

/**
 * 创建工单
 * @param	{String}			options.group		工单分组
 * @param	{String}			options.title		工单标题
 * @param	{String[]}			options.flag		工单标志
 * @param	{String}			options.refid		工单关联Id
 * @param	{String}			options.user		工单创建用户
 * @param	{Object<String[]>}	options.category	工单分类
 */
async function create({group, title, flag, refid, user, category}) {
	group = String(group);
	title = String(title);
	flag = Array.isArray(flag) ? flag.map(String) : (flag ? [String(flag)] : []);
	refid = String(refid);
	user = String(user);
	if (category && typeof category === "object") {
		let c = {};
		for(let k in category) {
			let value = category[k];
			if (typeof value === "string") {
				c[k] = value ? [value] : [];
			} else if (Array.isArray(value)){
				c[k] = value.filter(x=>x).map(String).filter(x=>x);
			}
		}
		category = c;
	} else {
		category = {};
	}
	if(!(group in this.group)) {
		throw new OperationError("工单组无效");
	}
	if(!title) {
		throw new OperationError("请填写工单名称");
	}
	if (!refid) {
		throw new OperationError("请填写关联Id");
	}
	let value = {
		group: group,
		title: title,
		flag: flag,
		refid: refid,
		user: user,
		category: category,
		status: 3, //0关闭，1完成，2驳回，3处理中
		createDate: new Date(),
		updateDate: new Date(),
		historyUser: [user],
		historyFlag: flag,
	};
	let {insertedIds} = await this.db.list.insert(value);
	if (!insertedIds) {
		throw new OperationError("创建失败");
	}
	let id = insertedIds[0];
	if (id) {
		await this.addLog(id, user, true);
		return id;
	}
	throw new OperationError("创建失败");
}


/**
 * 关闭工单
 * @param	{String}	id		工单Id
 * @param	{String}	user	工单关闭用户
 */
async function close(id, user) {
	if (!(id = objectId(id))) {
		throw new OperationError("工单无效");
	}
	user = String(user);
	let {result, modifiedCount} = await this.db.list.update(
		{_id: id, status: {$ne: 0}},
		{
			$set:{status: 0, updateDate: new Date()},
			$addToSet: {historyUser:user},
		}
	);
	if (result && result.ok && modifiedCount) {
		await this.addLog(id, user, 0);
		return true;
	}
	return false;
}
/**
 * 重新开放驳回的工单
 * @param	{String}			id					工单Id
 * @param	{String}			options.user		工单打开用户
 * @param	{String[]}			options.flag		工单标志
 * @param	{Object<String[]>}	options.category	工单分类
 */
async function open(id, {user, flag, category}) {
	if (!(id = objectId(id))) {
		throw new OperationError("工单无效");
	}
	user = String(user);
	flag = Array.isArray(flag) ? flag.map(String) : (flag ? [String(flag)] : null);
	if (category && typeof category === "object") {
		let c = {};
		for(let k in category) {
			let value = category[k];
			if (typeof value === "string") {
				c[k] = value ? [value] : [];
			} else if (Array.isArray(value)){
				c[k] = value.filter(x=>x).map(String).filter(x=>x);
			}
		}
		category = c;
	} else {
		category = null;
	}

	const $set = {status: 3, updateDate: new Date()};
	const $addToSet = {historyUser:user};
	if (flag) {
		$set.flag = flag;
		$addToSet.historyFlag = {$each: flag};
	}
	if (category) {
		$set.category = category;
	}

	let {result, modifiedCount} = await this.db.list.update({_id: id, status: 2}, {$set, $addToSet});
	if (result && result.ok && modifiedCount) {
		await this.addLog(id, user, 3);
		return true;
	}
	return false;
}
/**
 * 移除工单
 * @param	{String}	id		工单Id
 */
async function remove(id) {
	if (!(id = objectId(id))) {
		throw new OperationError("工单无效");
	}
	let {result, matchedCount} = await this.db.list.remove({_id: id, status: 0});
	if (result && result.ok && matchedCount) {
		await this.addLog(id, user, 0);
		return true;
	}
	return false;
}

/**
 * 获取工单信息
 * @param	{String}	id		工单Id
 */
async function get(id, {group, flag} = {}) {
	if (Array.isArray(id)) {
		//获取一组工单，则直接获取信息
		id = objectIdArray(id);
		const info = await this.db.list.find({_id:{$in:id}}).toArray();
		info.forEach(info=>{info.id = info._id; delete info._id;});
		return info;
	} else if (!(id = objectId(id))) {
		throw new OperationError("工单无效");
	}

	const info = await this.db.list.findOne({_id: id});
	if(!info) {throw new OperationError("找不到此工单");}
	info.id = info._id;
	delete info._id;

	if (Array.isArray(flag)) {
		flag = flag.map(String);
	} else {
		flag = null;
	}
	if (flag && flag.length && info.flag.length) {
		const g = info.flag;
		flag = flag.filter(x => g.has(x));
		if (!flag.length) {
			throw new OperationError("工单标志无交集");
		}
	}

	if (group && String(group) != info.group) {
		throw new OperationError("工单组不一致");
	} else {
		const group = this.group[info.group];
		if (group) {
			info.handle = await group.getOption(info.group, info.flag, info);
		}
	}
	return info;
}
/**
 * 处理工单
 * @param	{String}	id					工单id
 * @param	{String}	options.handle		工单处理方式
 * @param	{String}	options.group		限制工单组(选填,如果填，则必须为此组工单)
 * @param	{String[]}	options.flag		工单标志(选填，如果填，则必须有交集)
 * @param	{String}	options.user		工单处理用户
 * @param	{String}	options.explain		工单处理说明
 */
async function handle(id, {handle, group, flag, user, explain} = {}) {
	user = String(user);
	if (!(id = objectId(id))) {
		throw new OperationError("工单无效");
	}
	if (!(handle && typeof handle === "string")) {
		throw new OperationError("操作无效")
	}
	let info = await this.db.list.findOne({_id: id, status: {$gte: 3}});
	if(!info) {
		throw new OperationError("找不到此工单");
	}
	if (group && String(group) != info.group) {
		throw new OperationError("工单组不一致");
	} else {
		group = info.group;
	}
	const groupInfo = this.group[group];
	if(!groupInfo) {
		throw new OperationError("找不到操作");
	}
	if (Array.isArray(flag)) {
		flag = flag.map(String);
	} else {
		flag = null;
	}
	if (flag && flag.length && info.flag.length) {
		const g = info.flag;
		flag = flag.filter(x => g.has(x));
		if (!flag.length) {
			throw new OperationError("工单标志无交集");
		}
	} else {
		flag = info.flag;
	}

	info.id = info._id;
	delete info._id;

	//获取处理结果
	let result = await groupInfo.handle(group, handle, flag, info);
	if (!result) {
		throw new OperationError("操作无效");
	}
	const {status, flag:newFlag, set} = result;
	const $set = {};
	//状态
	if (status === parseInt(status) && status >= 0) {
		$set.status = status;
	}
	//标志
	if (Array.isArray(newFlag)) {
		$set.flag = newFlag.map(String);
	}
	if (!Object.keys($set).length) {
		throw new OperationError("操作无效");
	}
	//更新时间
	$set.updateDate = new Date();
	//更新
	({result} = await this.db.list.update(
			{_id: id, status: info.status, group: info.group, flag: info.flag},
			{$set, $addToSet: {historyUser:user, historyFlag:{$each:$set.flag}}}
		));
	//日志
	await this.addLog(id, user, handle, groupInfo.option[handle], explain);
	return result.ok;
}



/**
 * 获取工单列表
 * @param	{Number}					options.status		工单状态
 * @param	{String | RegExp}			options.title		工单标题
 * @param	{String | String[]}			options.group		工单组
 * @param	{String | String[]}			options.flag		工单标志
 * @param	{String | String[]}			options.user		创建用户
 * @param	{String | String[]}			options.historyUser	历史用户
 * @param	{String | String[]}			options.historyFlag	历史标志
 * @param	{Object<String | String[]>}	options.category	工单分类
 * @param	{Number}					options.skip		跳过的记录数
 * @param	{Number}					options.limit		最大返回数量
 */
async function list({status, title, group, flag, user, historyUser, historyFlag, category, skip = 0, limit = 30,} = {}) {
	let condition = {};
	//状态
	if (status === parseInt(status) && status >= 0) {
		condition.status = status;
	}
	//标题
	if(title instanceof RegExp) {
		condition.title = title;
	} else if (title && typeof title) {
		condition.title = newRegExp(title
			.replace(/\\/g,"\\\\").replace(/\./g,"\\.")
			.replace(/\[/g, "\\[").replace(/\]/g, "\\]")
			.replace(/\(/g, "\\(").replace(/\)/g, "\\)")
			.replace(/\(/g, "\\{").replace(/\)/g, "\\}")
			.replace(/\^/g, "\\^").replace(/\$/g, "\\$")
			.replace(/\+/g, "\\+").replace(/\*/g, "\\*").replace(/\?/g, "\\?")
			.replace(/\s+/g, ".*"));
	}
	//组
	if (Array.isArray(group)) {
		let groups = this.group;
		group = group.map(String).filter(g => g in groups);
		if (group.length) {
			condition.group = {$in:group};
		}
	} else if (group && (group = String(group)) && group in this.group) {
		condition.group = group;
	}
	//标志
	if (Array.isArray(flag)) {
		flag = flag.map(String).filter(u => u);
		if (flag.length) {
			condition.flag = {$in:flag};
		}
	} else if (flag && (flag = String(flag))) {
		condition.flag = flag;
	}
	//创建者
	if (Array.isArray(user)) {
		user = user.map(String).filter(u => u);
		if (user.length) {
			condition.user = {$in:user};
		}
	} else if (user && (user = String(user))) {
		condition.user = user;
	}
	//历史用户
	if (Array.isArray(historyUser)) {
		historyUser = historyUser.map(String).filter(u => u);
		if (historyUser.length) {
			condition.historyUser = {$in:historyUser};
		}
	} else if (historyUser && (historyUser = String(historyUser))) {
		condition.historyUser = historyUser;
	}
	//历史标志
	if (Array.isArray(historyFlag)) {
		historyFlag = historyFlag.map(String).filter(u => u);
		if (historyFlag.length) {
			condition.historyFlag = {$in:historyFlag};
		}
	} else if (historyFlag && (historyFlag = String(historyFlag))) {
		condition.historyFlag = historyFlag;
	}
	//类别
	if (category && !Array.isArray(category) && typeof category === "object") {
		for (let k in category) {
			let value = category[k];
			if (Array.isArray(value)) {
				value = value.filter(x=>x).map(String).filter(x=>x);
			} else if (value && typeof value === "string") {
				value = [value]
			} else {
				continue;
			}
			condition["category." + k] = value;
		}
	}

	const cursor = this.db.list.find(condition).sort({updateDate:1}).skip(skip).limit(limit);
	const [list, total] = await Promise.all([cursor.toArray(), cursor.count()]);
	list.forEach(info => {
		info.id = info._id;
		delete info._id;
	});
	return {total, list};
}


/**
 * 设置工单组
 */
function setGroup(group, {getOption, handle, flag, title, option}) {
	let groups = this.group;
	group = String(group);
	if (!group) {
		return false;
	}
	if (typeof getOption !== "function") {
		return false;
	}
	if (typeof handle !== "function") {
		return false;
	}
	const flags = {};
	if (flag && typeof flag === "object") {
		for (let k in flag) {
			let v = flag[k];
			if (v && typeof v === "string") {
				flags[k] = v;
			}
		}
	}
	const options = {};
	if (option && typeof option === "object") {
		for (let k in option) {
			let v = option[k];
			if (v && typeof v === "string") {
				options[k] = v;
			}
		}
	}
	groups[group] = {
		title: String(title),
		getOption,
		handle,
		flag: flags,
		option: options,
	}
	return true;
}
/**
 * 移除工单组
 */
function removeGroup(group, entire) {
	let groups = this.group;
	group = String(group);
	if (!(group in groups)) {
		return false;
	}
	delete groups[group];
	return true;
}
/**
 * 关闭工单组内全部工单
 */
function closeGroup(group) {
	await this.db.list.update({group: String(group), status: {$gte: 2}}, {$set:{status: 0, updateDate:new Date()}}, {multi: true});
}
/**
 * 获取工单组列表
 */
function getGroupList() {
	return Object.keys(this.group);
}
/**
 * 获取工单组信息
 */
function getGroup(group) {
	let groups = this.group;
	group = String(group);
	if (!(group in groups)) {
		return null;
	}
	const {getOption, handle, flag, title, option} = groups[group];
	const flags = {};
	for (let k in flag) {
		flags[k] = flag[k];
	}
	const options = {};
	for (let k in option) {
		options[k] = option[k];
	}
	return {title, getOption, handle, flag: flags, option: options};
}






module.exports = function init({collection}) {
	const ret = {};
	const that = Object.create(ret);
	that.db = {
		list: collection.list,
		log: collection.log,
	};
	that.group = {};
	that.addLog = addLog.bind(that);

	ret.create = create.bind(that);
	ret.list = list.bind(that);
	ret.close = close.bind(that);
	ret.remove = remove.bind(that);
	ret.get = get.bind(that);
	ret.handle = handle.bind(that);
	ret.setGroup = setGroup.bind(that);
	ret.removeGroup = removeGroup.bind(that);
	ret.closeGroup = closeGroup.bind(that);
	ret.getGroupList = getGroupList.bind(that);
	ret.getGroup = getGroup.bind(that);
	ret.log = getLog.bind(that);


	return ret;
}
