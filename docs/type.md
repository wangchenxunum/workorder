类型说明
========  

##Id  
工单及日志的Id
Id 可以是Mongodb的ObjectId，也可以是24为16进制字符串  

##LogInfo
日志信息，Object型，具体含有以下类型字段：  
* `refid`{ObjectId} - 对应工单的Id  
* `user`{String} - 生成此条记录对应操作的用户的Id  
* `date`{Date} - 生成此条记录的时间  
* `handle`{String | Number} - 生成此条记录对应操作的编号或Id  
* `name`{String} - 生成此条记录对应操作名称  
* `explain`{String} - 生成此条记录对应操作的说明  

##WorkOrder
工单信息，Object型，具体含有以下类型字段：  
* `id`{ObjectId} - 工单Id  
* `title`{String} - 工单标题  
* `group`{String} - 工单组  
* `flag`{String[]} - 工单标志  
* `refid`{String} - 关联Id  
* `user`{String} - 工单创建用户  
* `category`{Object<String[]>} - 工单分类  
* `status`{Number} - 工单状态  
* `createDate`{Date} - 工单创建时间  
* `updateDate`{Date} - 工单最后更新时间  
* `historyUser`{String[]} - 工单历史操作用户  
* `historyFlag`{String[]} - 工单历史标志  

##QueryList<TYPE>
查询列表，Object型，具体含有以下类型字段：  
* `total`{Number} - 总数  
* `list`{TYPE[]} - 收到的结果，开始的记录及实际返回的记录，由查询时的 skip 和 limit 参数确定  

##GroupInfo
工单组信息，Object型，具体含有以下类型字段：  
* `title`{String} - 工单组名称  
* `getOption`{Function} - 获取工单的处理选项  
* `handle`{Function} - 对工单处理的函数  
* `flag`{Object<String>} - 工单标志的说明  
* `option`{Object<String>} - 工单选项的处理说明  