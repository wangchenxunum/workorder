API说明
========  
##wo = workOrder({collection: {list, log}})  
创建一个工单管理器  
###参数说明  
* `options.collection.list`{MongodbCollection} - 用于存储工单列表的MongoDB集合  
* `options.collection.log`{MongodbCollection} - 用于存储工单日志的MongoDB集合  

###返回值说明
* 返回值类型为{Object}  
* 返回值为一个工单管理实例  
* 具体方法如下：  

##async wo.getLog(refid)  
**异步**获取日志  
###参数说明  
* `refid`{Id} - 工单Id  

###返回值说明  
* 返回值类型为{LogInfo[]}  
* 即便没有日志，也是空数组  

###错误说明  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.create({group, title, flag, refid, user, category})  
**异步**创建工单  
###参数说明  
* `options.group`{String} - 工单分组，使用者自定义的分组  
* `options.title`{String} - 工单标题，工单的标题  
* `options.flag`{String[]} - 工单标志，使用者可以使用标志工单具体的状态  
* `options.refid`{String} - 工单关联Id，与此工单关联的id，如事件Id，表单Id  
* `options.user`{String} - 工单创建用户，创建此工单的用户Id  
* `options.category`{Object<String[]>} - 工单分类，如果相关的（如事件、表单）有分类（可以是多种分类），可以标记到此，以便于查询  

###返回值说明  
* 返回值类型为{ObjectId}  
* 返回值表示创建的工单Id  

###错误说明  
* `工单组别无效`{OperationError} - 工单组不是字符串，或没有预先设置，请使用String型的工单组Id，且确保工单组已经预先通过setGroup设置  
* `请填写工单名称`{OperationError} - 没有填写工单名称  
* `请填写关联Id`{OperationError} - 没有填写工单关联的Id  
* `创建失败`{OperationError} - 数据库造成的问题，数据库正常返回了处理结果，但创建工单失败  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.close(id, user)  
**异步**关闭工单  
###参数说明  
* `id`{Id} - 工单Id，要关闭的工单的Id  
* `user`{String} - 工单关闭用户，关闭此工单的用户的Id  

###返回值说明  
* 返回值类型为{Boolean}  
* 返回值表示是否关闭工单成功  
* 工单不存在，或者工单之前已经被关闭，也均会关闭失败  

###错误说明  
* `工单无效`{OperationError} - 工单ID不符合格式  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.open(id, user)  
**异步**重新开放驳回的工单  
###参数说明  
* `id`{Id} - 工单Id，要打开的工单的Id  
* `options.user`{String} - 工单打开用户，重新打开此工单的用户Id  
* `options.flag`{String[]} - *可选的*工单标志，如果要更新工单的标志  
* `options.category`{Object<String[]>} - *可选的*工单分类，如果要更新工单的分类  

###返回值说明  
* 返回值类型为{Boolean}  
* 返回值表示是否打开工单成功  
* 只能重新打开被驳回的工单，其他的工单此操作将失败  

###错误说明  
* `工单无效`{OperationError} - 工单ID不符合格式  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  

##async wo.remove(id)  
**异步**移除工单  
###参数说明  
* `id`{Id} - 工单Id，要移除的工单的Id  

###返回值说明  
* 返回值类型为{Boolean}  
* 返回值表示是否关闭工单成功  
* 只能移除关闭的工单，其他工单无法被移除  

###错误说明  
* `工单无效`{OperationError} - 工单ID不符合格式  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.get(id)  
**异步**获取工单信息  
###参数说明  
* `id`{Id | Id[]} - 工单Id，要获取信息的工单Id或工单Id数组  

###返回值说明  
* 返回值类型为{WorkOrder | WorkOrder[]}  
* 如果参数为{Id[]}类型，则返回值为{WorkOrder[]}  
* 如果参数为{Id}类型，则返回值为{WorkOrder}, 但如果找不到对应工单将抛出错误  

###错误说明  
* `工单无效`{OperationError} - 工单ID不符合格式  
* `找不到此工单`{OperationError} - 没有对应的工单  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.handle(id, {handle, group, flag, user, explain})  
**异步**处理工单  
###参数说明  
* `id`{Id} - 工单Id，要处理的工单Id  
* `options.handle`{String} - 工单处理方式  
* `options.group`{String} - *可选的*限制工单组，如果限制工单组，请使用此参数  
* `options.flag`{String} - *可选的*工单标志，如果限制工单标志范围，请使用此参数，表示工单实际标志中，必须有在此范围的标志  
* `options.user`{String} - 工单处理用户，处理此工单的用户Id  
* `options.explain`{String} - 工单处理说明，用作日志  

###返回值说明  
* 返回值类型为{Boolean}  
* 返回值表示是否处理工单成功  

###错误说明  
* `工单无效`{OperationError} - 工单ID不符合格式  
* `操作无效`{OperationError} - 操作没有实际效果或不能存在此操作  
* `找不到此工单`{OperationError} - 没有对应的工单  
* `工单组不一致`{OperationError} - 工单不属于限制的工单组  
* `找不到操作`{OperationError} - 此次启动后工单组未设置，或已被移除  
* `工单标志无交集`{OperationError} - 工单工单标志范围无交集  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.list({status, title, group, flag, user, historyUser, historyFlag, category, skip = 0, limit = 30})  
**异步**获取工单列表  
###参数说明  
* `options.status`{Number} - *可选的*工单状态，必须为非负整数  
* `options.title`{String | RegExp} - *可选的*工单标题，要求工单标题必须符合某规则，默认无限制  
* `options.group`{String | String[]} - *可选的*工单组，要求工单必须是某几工单组的工单，默认无限制  
* `options.flag`{String | String[]} - *可选的*工单标志，要求工单必须至少有某几个标志中的一个，默认无限制  
* `options.user`{String | String[]} - *可选的*创建用户，要求工单必须由某几名用户创建，默认无限制  
* `options.historyUser`{String | String[]} - *可选的*历史用户，要求工单必须至少有被某几名用户中的一名用户操作过，默认无限制  
* `options.historyFlag`{String | String[]} - *可选的*历史标志，要求工单必须至少有或曾经有某几个标志中的一个，默认无限制  
* `options.category`{Object<String | String[]>} - *可选的*工单分类，要求工单某几个分类都必须为指定的分类，默认无限制  
* `options.skip`{Number} - *可选的*跳过的记录数，默认值为0  
* `options.limit`{Number} - *可选的*最大返回数量，默认值为30  

###返回值说明  
* 返回值类型为{QueryList<WorkOrder>}  
* 返回值表示获取到的结果  

###错误说明  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


##async wo.getUserFlag(group, ...args)  
**异步**获取用户可用标志  
###参数说明  
* `group`{String} - 工单组Id  
* `args`{...any} - 用于获取标志的相关参数，由使用者自行定义  

###返回值说明  
* 返回值类型为{String[]}  
* 返回值表示此用户可操作的标志  

###错误说明  
* 此方法不会抛出错误  


##wo.setGroup(group, {title, getOption, handle, flag, option})  
设置工单组  
###参数说明  
* `group`{String} - 工单组Id  
* `options.title`{String} - 工单组名称  
* `options.getOption`{Function} - 获取工单的处理选项的函数  
* `options.handle`{Function} - 对工单处理的函数  
* `getUserFlag`{Function} - 获取用户可操作标志的函数  
* `options.flag`{Object<String>} - 工单标志的说明  
* `options.option`{Object<String>} - 工单选项的处理说明  

###返回值说明  
* 返回值类型为{Boolean}  
* 返回值表示是否设置工单组成功  

###错误说明  
* 此方法不会抛出错误  


##wo.removeGroup(group)  
移除工单组  
###参数说明  
* `group`{String} - 工单组Id  

###返回值说明  
* 返回值类型为{Boolean}  
* 返回值表示是否移除工单组成功  

###错误说明  
* 此方法不会抛出错误  


##wo.closeGroup(group)  
关闭工单组内全部工单  
###参数说明  
* `group`{String} - 工单组Id  

###返回值说明  
* 此函数无返回值  

###错误说明  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  

###其他说明
* 通过此方法关闭的工单，不会追加日志  


##wo.getGroupList()  
获取工单组列表  
###参数说明  
* 此方法无参数  

###返回值说明  
* 返回值类型为{String[]}  
* 返回值为有效的工作组id的数组  

###错误说明  
* 此方法不会抛出错误  


##wo.getGroupTitleList()  
获取工单组Id及标题列表  
###参数说明  
* 此方法无参数  

###返回值说明  
* 返回值类型为{String[][]}  
* 返回值为有效的[工作组id, 工作组标题]的数组  

###错误说明  
* 此方法不会抛出错误  


##wo.getGroup(group)  
获取工单组信息  
###参数说明  
* `group`{String} - 工单组Id  

###返回值说明  
* 返回值类型为{GroupInfo}  
* 返回值为工作组信息  
* 但如果工作组不存在，则返回`null`  

###错误说明  
* `*`{MongodbError} - 此操作可能抛出数据库级别的错误  


