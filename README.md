# yui-form-validator
Legacy of https://code.google.com/archive/p/yui-form-validator/

> do html form validation with configuration

`yui-form-validator` is a javascript html form validator based on Yahoo User Interface (YUI) form validation could be achieved by configuration, no need to write validation javascript for every input element！ @Author stauren@qq.com

It's a YUI extension.

It enables configurable dynamic HTML form validation.

Highlights: * Runtime configurable validation by length, value, regular expression and ajax. * Auto validation on blus, on value change, and APIs to fire validation. * Use predefined validation rules simply by adding a class name. * Validation on input, select, textarea. * Elements in a validatoin group share the same notification. * May release server side validation scripts(in PHP) using the same validation configration(Unified validation).

这个项目的内容是使用javascript对Html表单进行基于配置的自动验证，无需为每次验证写额外的函数方法。

自信这个验证的lib还是写得很不错的，基于yui，是一个yui extension的形式。语法、注释、风格、效率都尽我所能做到了最好，相信如果给一个开发者看我的validator和yui的本身库文件，他/她是会觉得代码风格比较一致的，我一向相信规范代码风格注释习惯排版的美观是作为一个decent的程序员的基本要求。

目前功能不太多，不过已经比较强大了，项目中的验证都用这个实现了，有很多比较难比较偏的使用例子都解决了。我也知道做一个万能的表单验证是不可能的，不过，我会努力更新的。