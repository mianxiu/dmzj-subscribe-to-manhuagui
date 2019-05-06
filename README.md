# 介绍
用来把动漫之家的订阅同步到漫画柜的node脚本
# 使用指南

> 漫画柜需要梯子

## 添加cookie
编辑`setting.json`,在浏览器使用[EditThisCookie](http://www.editthiscookie.com/)导出[动漫之家]()、[漫画柜](https://www.manhuagui.com/)登陆账号后的`cookie`分别粘贴到对应的`[]`里

```json
 "dmzjMaxPage": "56",
 "chromePath": "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
 "dmzjCookie": [...动漫之家],
 "mhgCookie": [...漫画柜]
```



## 如果需要更改`chrome.exe路径`
已默认使用`'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'`
## 使用的依赖（已安装）
[puppeteer-core](https://www.npmjs.com/package/puppeteer-core)

[cli-progress](https://www.npmjs.com/package/cli-progress)


## ⚠ 特殊提示
可以使用`EditThisCookie`编辑`漫画柜`的`country`为`US`并锁定，解除漫画限制

因为书名翻译问题，可能导致某些漫画对应错误（1/991）
