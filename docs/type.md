类型说明
========  

##Id  
工单及日志的Id
Id 可以是Mongodb的ObjectId，也可以是24为16进制字符串  

##LogInfo
日志信息，Object型，具体含有以下类型字段
* `refid`{ObjectId} - 对应工单的Id  
* `user`{String} - 生成此条记录对应操作的用户的Id  
* `date`{Date} - 生成此条记录的时间  
* `handle`{String | Number} - 生成此条记录对应操作的编号或Id  
* `name`{String} - 生成此条记录对应操作名称  
* `explain`{String} - 生成此条记录对应操作的说明  

