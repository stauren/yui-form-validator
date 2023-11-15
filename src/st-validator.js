/**
 * Copyright (c) 2008, stauren All rights reserved.
 * YUI extension module 'validator' used to verify submitting tables
 * example: var oVerfier = new YAHOO.extension.verifier()
 * @author stauren@qq.com
 */
YAHOO.namespace("extension");
(function() {
  var _regExp = {
      email : /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
      cnPhone : /^(\d{3,4}-)\d{7,8}(-\d{1,6})?$/,
      cnMobile : /^1[3,5]\d{9}$/,
      yid : /^[a-z][a-z_0-9]{3,}(@yahoo\.cn)?$/,
      date : /^\d{4}\-[01]?\d\-[0-3]?\d$|^[01]\d\/[0-3]\d\/\d{4}$|^\d{4}年[01]?\d月[0-3]?\d[日号]$/,
      integer : /^[1-9][0-9]*$/,
      number : /^[+-]?[1-9][0-9]*(\.[0-9]+)?([eE][+-][1-9][0-9]*)?$|^[+-]?0?\.[0-9]+([eE][+-][1-9][0-9]*)?$/,
      alpha : /^[a-zA-Z]+$/,
      alphaNum : /^[a-zA-Z0-9_]+$/,
      urls : /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
      chinese : /^[\u2E80-\uFE4F]+$/,
      postal : /^[0-9]{6}$/
    }
    ,

    /**
     * if there is a group of radio or checkbox with the same name, add class to the first one
     */
    _config = {
      bHideSuccess : false,
      sImgBase : './img/',
      sLoadingImgSrc : 'st_validate_icon_loading.gif',
      sSuccessImgSrc : 'st_validate_icon_ok.gif',
      sFailImgSrc : 'st_validate_icon_error.gif',
      sInlineErrorTag : 'em',
      sInlineErrorClass : 'st-validate-notice',
      sErrorActiveClass : 'active',
      sErrorHideClass : 'hide',
      sInputErrorClass : 'st-validate-input-error',
      sNotRequiredClass : 'st-validate-not-required',
      sNeededClass : 'st-validate-needed',
      sDateClass : 'st-validate-date',
      sPhoneClass : 'st-validate-phone',
      sMobileClass : 'st-validate-mobile',
      sYidClass : 'st-validate-yid',
      sIntClass : 'st-validate-int',
      sNumberClass : 'st-validate-number',
      sAlphaClass : 'st-validate-alpha',
      sAlphaNumClass : 'st-validate-alphanum',
      sEmailClass : 'st-validate-email',
      sUrlClass : 'st-validate-url',
      sChineseClass : 'st-validate-chinese',
      sPostalClass : 'st-validate-postal'
    }
    ,
    _oPredefinedRules = {
      sDateClass : {
        mask : _regExp.date
      },
      sPhoneClass : {
        mask : _regExp.cnPhone
      },
      sMobileClass : {
        mask : _regExp.cnMobile
      },
      sNotRequiredClass : {
        required : false
      },
      sYidClass : {
        mask : _regExp.yid
      },
      sIntClass : {
        mask : _regExp.integer
      },
      sNumberClass : {
        mask : _regExp.number
      },
      sAlphaClass : {
        mask : _regExp.alpha
      },
      sAlphaNumClass : {
        mask : _regExp.alphaNum
      },
      sEmailClass : {
        mask : _regExp.email
      },
      sUrlClass : {
        mask : _regExp.urls
      },
      sChineseClass : {
        mask : _regExp.chinese
      },
      sPostalClass : {
        mask : _regExp.postal
      }
    }
    ,
    _oPredefinedRulesName = {
      sDateClass : 'date',
      sPhoneClass : 'cnphone',
      sMobileClass : 'cnmobile',
      sYidClass : 'yid',
      sIntClass : 'integer',
      sNumberClass : 'number',
      sAlphaClass : 'alpha',
      sAlphaNumClass : 'alphanum',
      sEmailClass : 'email',
      sUrlClass : 'urls',
      sChineseClass : 'chinese',
      sPostalClass : 'postal'
    }
    ,
    _ERROR_SUCCESS = 200,
    _ERROR_EMPTY = 1501,
    _ERROR_MAXLENGTH = 1502,
    _ERROR_MINLENGTH = 1503,
    _ERROR_MAXVALUE = 1504,
    _ERROR_MINVALUE = 1505,
    _ERROR_REGEXP = 1506,
    _ERROR_WRONGVALUE = 1507,
    _ERROR_AJAXVALUEERR = 1508,
    _ERROR_AJAXFAIL = 1509,
    _ERROR_EMPTYCHECK = 1510,
    _ERROR_NEEDED = 1511,
    _ERROR_ALTER = 1512,
    _ERROR_PWDSAME = 1513,
    _oErrorTemplate = {
      200 : 'Success',
      1501 : '%s can\'t be empty',
      1502 : '%s can\'t be longer than %s',
      1503 : '%s can\'t be shorter than %s',
      1504 : '%s can\'t be greater than %s',
      1505 : '%s can\'t be less than %s',
      1506 : '%s don\'t match the pattern',
      1507 : '%s don\'t match the requirement',
      1508 : '%s',
      1509 : 'Contact server failed, please try again later',
      1510 : 'Choose at least one item',
      1511 : 'You choice don\'t match the requirement',
      1512 : 'Can\'t leave all above empty',
      1513 : 'The two value are not the same'
    },
    _YU = YAHOO.util,
    _YL = YAHOO.lang,
    _D = _YU.Dom,
    _E = _YU.Event,
    _S = _YU.Selector,
    _C = _YU.Connect,
    _JSON = _YL.JSON,
    _aNoticeType = ['tips', 'domDiv', 'alert'],

    /**
     * private function used to get Dom element
     * @param {string} an Id or a CSS selector string
     * @return {array} array of Dom elements
     */
    _$ = function(sQuery, root, firstOnly) {
      var _els = _D.get(sQuery);
      if (_els === null || root) {
        _els = _S ? _S.query(sQuery, root, firstOnly) : [];
      }
      if (!_YL.isArray(_els)) {
        _els = [_els];
      }
      return _els;
    }
    ,
    _ajax = function(sUrl, oCallback, o) {
      oCallback.success = oCallback.success ? oCallback.success :
        function(o) {
          alert("Success!\nServer returns:" + o.responseText)
        };
      oCallback.failure = oCallback.failure ? oCallback.failure :
        function(o) {
          alert("Ajax request Failed!")
        };
      //set default timeout to 8 seconds
      oCallback.timeout = oCallback.timeout ? oCallback.timeout : 5000;
      _C.asyncRequest('get', sUrl, oCallback)
    }
    ,
    _each = function(aAry, fn) {
      for(var i=0,j=aAry.length;i<j;i++) {
        fn(aAry[i], i);
      }
    }
    ,
    _reduce = function(fn, base, aAry) {
      _each(aAry, function(oItem, i){
        base = fn(base, oItem, i)
      });
      return base;
    }
    ,
    _map = function(aAry, fn) {
      var aNew = [];
      _each(aAry, function(oItem, i) {
        aNew[i] = fn(oItem);
      });
      return aNew;
    }
    ,
    _isNode = function(obj, strict) {
      return _YL.isObject(obj) && ((!strict && (obj==window || obj==document)) ||
        obj.nodeType == 1);
    }
    ,
    /**
     * return false or an array of index of the found values
     */
    _inArray = function(obj, ary, strict) {
      var found = false;
      _each(ary, function(oItem, i) {
        if(oItem===obj || (!strict && oItem==obj)) {
          found === false && (found = []);
          found[found.length] = i;
        }
      });
      return found;
    }
    ,
    /**
     * get value of input element(textarea), and return a object of id:value pair
     * 
     */
    _getObjFromId = function(ary) {
      var _oResult = {};
      ary = _YL.isArray(ary) ? ary : [ary];
      _each(ary, function(sId) {
        var _temp = _$(sId)[0];
        if(_temp && (typeof _temp.value != 'undefined')) {
          _oResult[sId] = _temp.value;
        } else if (_temp && _temp.innerHTML) {
          _oResult[sId] = _temp.innerHTML;
        } else {
          _oResult[sId] = null;
        }
      });
      return _oResult;
    }
    ,
    _sprintf = function(sTemplate) {
      var i = 1;
      while (arguments[i]) {
        sTemplate = sTemplate.replace(/%s/, arguments[i++])
      }
      return sTemplate;
    }
    ,
    _getMergeObj = function(oldOne, newOne) {
      var _newO = {};
      for(var i in oldOne) {
        _newO[i] = oldOne[i]
      }
      for(var i in newOne) {
        _newO[i] = newOne[i]
      }
      return _newO;
    }
    ,
    _checkOneSetting = function(sRname, sRvalue, sValue) {
      var _iReturn = _ERROR_SUCCESS;
      switch (sRname) {
        case 'required' :
          if (sRvalue && sValue === '') {
            _iReturn = _ERROR_EMPTY;
          }
          break;
        case 'maxLength': 
          if (sValue.length > sRvalue) {
            _iReturn = _ERROR_MAXLENGTH;
          }
          break;
        case 'minLength': 
          if (sValue.length < sRvalue) {
            _iReturn = _ERROR_MINLENGTH;
          }
          break;
        case 'maxValue': 
          if (sValue > sRvalue) {
            _iReturn = _ERROR_MAXVALUE;
          }
          break;
        case 'minValue': 
          if (sValue < sRvalue) {
            _iReturn = _ERROR_MINVALUE;
          }
          break;
        case 'mask': 
          if (!sRvalue.test(sValue)) {
            _iReturn = _ERROR_REGEXP;
          }
          break;
        case 'value': 
          if (sRvalue !== sValue) {
            _iReturn = _ERROR_WRONGVALUE;
          }
          break;
      }
      return _iReturn;
    },
    _CheckError = function(iCode, vRuleValue, vDesc, oIpt, sDiyTemplate) {
      this.iCode = iCode;
      this.sTemplate = sDiyTemplate || _oErrorTemplate[iCode];
      this.vRuleValue = vRuleValue;
      this.sName = vDesc;
      this.oDomInput = oIpt;
    };
    _CheckError.prototype.sErrorTag = _config.sInlineErrorTag;
    _CheckError.prototype.sErrorClass = _config.sInlineErrorClass;
    _CheckError.prototype.sActiveClass = _config.sErrorActiveClass;
    _CheckError.prototype.sHideClass = _config.sErrorHideClass;

    _CheckError.prototype.toString = function() {
      return _sprintf(this.sTemplate, this.sName, this.vRuleValue);
    };

    _CheckError.prototype._getTipsDom = function() {
      var _sTag = this.sErrorTag, _sClass = this.sErrorClass,
        oExistingTips = _$(_sTag+'.'+_sClass, this.oDomInput.parentNode, true)[0];
      if (!_isNode(oExistingTips)) {
        var oNextOfInput = this.oDomInput.nextSibling;
        oExistingTips = document.createElement(_sTag);
        _D.addClass(oExistingTips, _sClass);
        _config.bHideSuccess && _D.addClass(oExistingTips, this.sHideClass);
        this.oDomInput.parentNode.insertBefore(oExistingTips, oNextOfInput);
      }
      return oExistingTips;
    };

    _CheckError.prototype.showTips = function() {
      var oTips = this._getTipsDom();
      if (this.iCode != _ERROR_SUCCESS) {
        oTips.innerHTML = ['<img src="', _config.sImgBase + _config.sFailImgSrc, '" />', this.toString()].join('');
        _D.addClass(oTips, this.sActiveClass);
      } else {
        oTips.innerHTML = '<img src="'+_config.sImgBase+_config.sSuccessImgSrc+'" />';
        _D.removeClass(oTips, this.sActiveClass);
      }
    };

    _CheckError.prototype.showLoading = function() {
      var oTips = this._getTipsDom();
      oTips.innerHTML = '<img src="'+ _config.sImgBase + _config.sLoadingImgSrc+'" />';
    };

  /**
   * constructor of validator
   * @constructor
   * @param {string} sForm, the id or cssSelector string or name of the form
   * @param {object} oConfig
   * @config {string} notifyType, default = tips(0)
   * @config {boolean} onSubmit, default = true
   * @config {boolean} stopOnFirst, default = false
   * @config {boolean} checkOnBlur, default = true
   */
  YAHOO.extension.validator = function(sForm, oConfig) {
    oConfig = oConfig || {};
    var self = this;
    /**
     * the id or the name of the form
     * @type string
     */
    this.sForm = sForm;

    /**
     * the dom reference of the form
     * @type object
     */
    this.oForm = null;

    if(sForm) {
      var _oFormTmp = _$(sForm);
      this.oForm = _isNode(_oFormTmp[0]) ? _oFormTmp[0] :
        (_isNode(document.forms[sForm]) ? document.forms[sForm] : null);
    }

    if(this.oForm != null) {
      var _aInputs = _$('input, textarea', this.oForm),
        _aSelects = _$('select', this.oForm), _allInputs = _aInputs;

      _each(_aSelects, function(o) {
        _allInputs[_allInputs.length] = o;
      });

      this.aInputs = _allInputs;

      if(oConfig.onSubmit !== false) {
        _E.on(this.oForm, 'submit', this._hSubmit, self, true);
      }
      
    }

    this.bCheckOnBlur = false;
    if(oConfig.checkOnBlur !== false) {
      _E.on(_aInputs, 'blur', this._hOnBlur, self, true);
      _E.on(_aInputs, 'focus', this._hClearTip, self, true);
      //_E.on(_aInputs, 'keyup', this._hKeyup, self, true);
      _E.on(_aSelects, 'change', this._hOnBlur, self, true);
      this.bCheckOnBlur = true;
    }

    /**
     * the stored rules of form verification
     * index == the name of input element
     * @type object
     */
    this.oRules = {};

    /**
     * the error notification type
     * default to 0
     * see the comment of 'setNoticeType' too
     * @type integer
     */
    this.iNoticeType = 0;
    oConfig.notifyType !== undefined && this.setNoticeType(oConfig.notifyType);

    /**
     * whether return when the first error occur, default to true
     * @type boolean
     */
    this.stopOnFirst = oConfig.stopOnFirst === true ? true : false;

     _config.sImgBase = oConfig.imageBase || _sImgBase;
     _config.bHideSuccess = oConfig.hideSuccess || _config.bHideSuccess;
  };

  YAHOO.extension.validator.prototype = {

    /*
    _test : function() {
      console.log('test _$:'+(typeof _$('#hd div')[0] == 'object'));
      var aValue = _getObjFromId(['test-form1-name', 'test-form1-pwd']);
      console.log('test _getObjFromId:'+(typeof aValue['test-form1-name'] == 'string'));
      //console.log(document.forms['test-form1a']);
      this.addRules({'a':'a added', 'b':{'123':222}});
      console.log('test addRules:'+(this.oRules['a'] == 'a added'));
      //this.setNoticeType(_aNoticeType[1]);//div
      console.log('test setNoticeType:'+(this.iNoticeType == 1));
    }
    ,
    */

    /**
     * set a Rule to be checked with
     * @param {string} sName, == input element "name" attribute or "id", will look for name first
     * @param {object} oRule
     * @config desc {string}, description of the input, used on error message,
     *   or title attribute will be used, then alt attr then name attr
     * @config required {boolean}, default true
     * @config useDefined {string}, use predefined set of rules to check
     * @config maxLenth {integer}
     * @config minLenth {integer}
     * @config maxValue {number}
     * @config minValue {number}
     * @config mask {regexp}, value must pass the regexp
     * @config ajax {string}, the url to be requested is : oRule.ajax+input.value
     *   server return a JSON object, with code and message properties, code=200 means success
     * @config group {array}, an array of input names. grouped inputs share the same notice tips
     *   if checked an input and got 200, then will auto check its grouped inputs
     */
    _addRule : function(sName, oRule) {
      var _self = this, _oriRules = this.oRules[sName], _fnMerge = function(oldOne, newOne) {
        return typeof oldOne == 'undefined' ? newOne : _getMergeObj(oldOne, newOne);
      };
      _oriRules = _fnMerge(_oriRules, oRule);
      this.oRules[sName] = _oriRules;

      //add(merge) group rules to other inputs in group
      if (_oriRules.group) {
        var _aTheGroup = _map(_oriRules.group, function(o){return o});
        _aTheGroup[_aTheGroup.length] = sName;
        _each(_oriRules.group, function(o) {
          var _aGroupForMe;
          _self.oRules[o] || (_self.oRules[o] = {});
          _aGroupForMe = _self.oRules[o].group || [];
          _each(_aTheGroup, function(oItem) {
            if (oItem != o) {
              _inArray(oItem, _aGroupForMe) || (_aGroupForMe[_aGroupForMe.length] = oItem);
            }
          });
          _self.oRules[o].group = _aGroupForMe;
          
        });
      }
    }
    ,

    /**
     * private function, check an input value by request a remote server
     * @param {string}, value of input
     * @param {object}, rule, see comment of _addRule
     * @return true or an _CheckError object of the first error
     */
    _ajaxCheck : function(sUrl, sValue, oInput) {
      var _oCEobj = new _CheckError(_ERROR_SUCCESS, '', '', oInput),
        _sDiyTemplate = this.oRules[oInput.name] && this.oRules[oInput.name].errorMessage,
        _oCallback = {
        success : function(o) {
          var _oResult, _oCheckE;
          try {
            _oResult = _JSON.parse(o.responseText);
          } catch(e) {}
          if (_oResult) {
            if (_oResult.code == _ERROR_SUCCESS) {
              _oCheckE = new _CheckError(_ERROR_SUCCESS, '', '', oInput);
            } else {
              _oCheckE = new _CheckError(_ERROR_AJAXVALUEERR,'', _oResult.message+
                ', Error Code: '+_oResult.code,
                oInput, _sDiyTemplate);
            }
          } else {
            _oCheckE = new _CheckError(_ERROR_AJAXFAIL, '', '', oInput, _sDiyTemplate);
          }
          _oCheckE.showTips();
        },
        failure : function() {
          var _oCheckE = new _CheckError(_ERROR_AJAXFAIL, '', '', oInput, _sDiyTemplate);
          _oCheckE.showTips();
        }
      };
      _oCEobj.showLoading();
      _ajax(sUrl + encodeURI(sValue), _oCallback);
    }
    ,

    /**
     * private function, check one rule set
     * @param {string}, value of input
     * @param {object}, rule, see comment of _addRule
     * @return {object} an _CheckError object of the first error
     */
    _check : function(sValue, oRule) {
      var _vReturn = true, _vTemp;
      for (var i in oRule) {
        _vTemp = _checkOneSetting(i, oRule[i], sValue);
        if (_vTemp != _ERROR_SUCCESS) {
          _vReturn = new _CheckError(_vTemp, oRule[i]);
          break;
        }
      }
      _vReturn = _vReturn === true ? (new _CheckError(_ERROR_SUCCESS)) : _vReturn;
      return _vReturn;
    }
    ,

    /**
     * private function, check one rule by its name
     * @param {string}, rule name
     * @return true, false or _CheckError object
     */
    _checkByName : function(sName, bDoAjax, bDoAlter) {
      bDoAjax = bDoAjax === false ? false : true;
      bDoAlter = bDoAlter === false ? false : true; 
      var _oRule, _oInput, _sValue, _vResult, _aInputs, _sIptType, _sIptTag, self = this,
        _oInput = (this.oForm && this.oForm[sName]) || _$(sName)[0];

      if (_oInput[0] && _oInput.type === undefined) {
        //radio or check box, but not select
        _aInputs = _oInput;
        _oInput = _aInputs[0];
      }

      _sIptType = _oInput.type.toLowerCase();
      _sIptTag = _oInput.tagName.toLowerCase();

      _oRule = this._getRuleFromInput(_oInput);  

      if (_oRule.ignore) {
        return false;
      }

      if (_oRule.required === false && _oInput.value === '') {
        return false;
      }
      
      if (_oRule.equal) {
        var _oOtherIpt = this.oForm[_oRule.equal] || _$(_oRule.equal)[0];
        if (_oInput.value !== _oOtherIpt.value) {
          return new _CheckError(_ERROR_PWDSAME, '', '', _oInput);
        }
      }

      if (!_oInput) {
        return false;
      }
      this.clearNotice(_aInputs || _oInput);
      if (_sIptType == 'radio' || _sIptType == 'checkbox') {
        //1 or more radio with the same name
        _vResult = this._checkRadio(_aInputs || [_oInput], _oRule);
      } else if (_sIptTag == 'select') {
        _vResult = this._checkSelect(_oInput, _oRule);
      } else {
        _sValue = _oInput.value || '';
        if (_oRule.ajax) {
          bDoAjax && 
            this._ajaxCheck(_oRule.ajax, _sValue, _oInput);
          return true;
        }
        _vResult = this._check(_sValue, _oRule);
      }
      
      //deal with alter rule
      //required error happened, and if alter is set
      if (bDoAlter && _vResult.iCode == _ERROR_EMPTY && _oRule.alter) {
        var _vAltResult = this._checkByName(_oRule.alter, true, false);
        if (typeof _vAltResult == 'object' && _vAltResult.iCode == _ERROR_EMPTY) {
          return new _CheckError(_ERROR_ALTER, '', '', _vAltResult.oDomInput);
        }
        return _vAltResult;
      }

      _vResult.sName = _oRule.desc || _oInput.title || _oInput.alt || sName;
      _oRule.errorMessage && (_vResult.sTemplate = _oRule.errorMessage);
      _vResult.oDomInput = _oInput;
      return _vResult;
    }
    ,

    /**
     * private function, check an array of radio input or checkbox input
     */
    _checkRadio : function(aInputs, oRules) {
      //sNeededClass
      var _checked = false, _iReturn = _ERROR_SUCCESS, _bWrongSelect = false;
      _each(aInputs, function(o){
        if (o.checked === true) {
          _checked = true;
        } else if (_D.hasClass(o, _config.sNeededClass)) {
          _bWrongSelect = true;
        }
      });
      if (oRules.required && !_checked) {
        _iReturn = _ERROR_EMPTYCHECK;
      } else if (_bWrongSelect) {
        _iReturn = _ERROR_NEEDED;
      }
      return new _CheckError(_iReturn);
    }
    ,

    /**
     * private function, check a select
     */
    _checkSelect : function(oSelect, oRules) {
      //sNeededClass
      var _iIndex = oSelect.selectedIndex, 
        _sValue = oSelect[_iIndex].value;
      return this._check(_sValue, oRules);
    }
    ,

    /**
     * private function
     */
    _getRuleFromInput : function(oIpt) {
      var _oRule = {required : true},//default Rule 
        _sName = oIpt.name,
        _oConfigedRule = this.oRules[_sName] || {},
        _aPredefined = _oConfigedRule.predefined || [];

      _YL.isArray(_aPredefined) || (_aPredefined = [_aPredefined]);

      for (var k in _oPredefinedRules) {
        if (_D.hasClass(oIpt, _config[k]) || _inArray(_oPredefinedRulesName[k], _aPredefined)) {
          _oRule = _getMergeObj(_oRule, _oPredefinedRules[k])
        }
      }

      if (this.oRules[_sName]) {
        _oRule = _getMergeObj(_oRule, this.oRules[_sName]);
      }
      return _oRule;
    }
    ,

    /**
     * private function, input on blur handler
     */
    _hOnBlur : function(e) {
      _E.stopEvent(e);
      var _oInput = _E.getTarget(e);
      if (_oInput.type != 'submit' && _oInput.type != 'image' &&
        _oInput.type != 'button'
      ) {
        this._validateInput(_oInput);
      }
    }
    ,

    /**
     * private function, handler for input to clear tips on focus
     */
    _hClearTip : function(e) {
      _E.stopEvent(e);
      var _oInput = _E.getTarget(e),
        _oRule = this._getRuleFromInput(_oInput);  
      if (!_oRule.ignore && this.iNoticeType == 0 && 
        _oInput.type != 'submit' && _oInput.type != 'image' &&
        _oInput.type != 'button'
      ) {
        this.clearNotice(_oInput);
      }
    }
    ,

    /**
     * private function, input on keyup handler
     */
    _hKeyup : function(e) {
      _E.stopEvent(e);
      var _oInput = _E.getTarget(e);
      if (_oInput.type != 'submit') {
        this._validateInput(_oInput, true, false);
      }
    }
    ,

    /**
     * private function, form on submit handler
     */
    _hSubmit : function(e) {
      this._validateForm(e);
    }
    ,

    /**
     * private function, add error class to input
     */
    _notifyInput : function(el) {
      _D.addClass(el, _config.sInputErrorClass);
    }
    ,

    /**
     * private function, add error class to input
     */
    _normalizeInput : function(el) {
      _D.removeClass(el, _config.sInputErrorClass);
    }
    ,
    /**
     * private function, trigger the notification for user
     * @param {array} aCheckError, array of _CheckError object
     */
    _triggerNotice : function(aCheckError) {
      var _iType = this.iNoticeType, self = this,
        _sType = _aNoticeType[_iType] ? _aNoticeType[_iType] : _aNoticeType[0];
      switch(_sType) {
        case 'tips': 
          _each(aCheckError, function(o) {
            o.showTips && o.showTips();
            o.iCode != _ERROR_SUCCESS && self._notifyInput(o.oDomInput);
          });
          break;
        case 'domDiv': 
          break;
        case 'alert': 
          var _aMessage = _map(aCheckError, function(o) {
            o.iCode != _ERROR_SUCCESS && self._notifyInput(o.oDomInput);
            return o.toString();
          }), _sMessage = _aMessage.join('，\n');
          alert(_sMessage);
          break;
      }
    }
    ,

    /**
     * validate the form
     */
    _validateForm : function(e) {

//      var _oRules = this.oRules;
      var _aInputs, _aResult = [], self = this, _bIsEnd = false,
        _aFinishedCheckRadio = [], _aIgnoreChecking = [], _oFirstEI;

      _aInputs = this.aInputs;
      /*if (this.oForm) {
        _aInputs = _$('input, textarea, select', this.oForm);
        //_each(_$('textarea', this.oForm), function(o) {
        //  _aInputs[_aInputs.length] = o;
        //});
      }*/

      _reduce(function(isend, o, i) {
        var _sType = o.type.toLowerCase();
        if (isend || _sType == 'submit' || _sType == 'button' || _sType == 'image') {
          return isend;
        }
        var _sName = o.name, _oResult;
        if (_inArray(_sName, _aIgnoreChecking)) {
          //ignore checking the group when 1 ipt of the group failed
          return isend;
        }
        if (_sType == 'radio' || _sType == 'checkbox') {
          //only check a set of radio once
          if (_inArray(_sName, _aFinishedCheckRadio)) {
            return isend;
          } else {
            _aFinishedCheckRadio[_aFinishedCheckRadio.length] = _sName;
          }
        }
        _oResult = self._checkByName(_sName);
        _aResult[_aResult.length] = _oResult;
        if(typeof _oResult == 'object' && _oResult.iCode != _ERROR_SUCCESS) {
          typeof e == 'object' && _E.stopEvent(e);
          _oFirstEI = _oFirstEI || _oResult.oDomInput;
          if (self.stopOnFirst) {
            self._triggerNotice(_aResult);
            return true;
          }
          if (self.oRules[_sName] && self.oRules[_sName].group) {
            _each(self.oRules[_sName].group, function(o) {
              _aIgnoreChecking[_aIgnoreChecking.length] = o;
            });
          }
        }
      }, _bIsEnd, _aInputs);
      this._triggerNotice(_aResult);
      var y = _D.getY(_oFirstEI);
      y = y || 100;//hidden input
      window.scrollTo(0,y-100);

      //focus will erase the first error message
      this.bCheckOnBlur || _oFirstEI.focus();
    }
    ,

    /**
     * validate an input, could choose whether auto validate its group inputs
     */
    _validateInput : function(oInput, bValidateGroup, bValidateAjax) {
      bValidateGroup = bValidateGroup === false ? false : true;
      bValidateAjax = bValidateAjax === false ? false : true;
      var _self = this, _sName = oInput.name, 
        _oResult = this._checkByName(_sName, bValidateAjax),
        _aGrp = this.oRules[_sName] ? this.oRules[_sName].group : false;
      if(typeof _oResult == 'object') {
        if (_oResult.iCode == _ERROR_SUCCESS) {
          if (bValidateGroup && _aGrp) {
            bValidateGroup = _reduce(function(base, o) {
              base && _each(_self.aInputs, function(p) {
                if (o == p.name) {
                  base = _self._validateInput(p, false);
                }
              });
              return base;
            }, bValidateGroup, _aGrp);
          }
          //bValidateGroup == false means a notice has been triggered
          //only the first success in a group trigger 200 notice
          bValidateGroup && this._triggerNotice([_oResult]);
          return true;
        } else {
          this._triggerNotice([_oResult]);
        }
      }
      return false;
    }
    ,

    /**
     * Public API begins:
     */

    /**
     * add batch rules
     * @param {object} oNewRules, array of sName
     * @config {string} name, name of a rule
     * @config {object} rule
     * @return boolean, true if every value is set
     */
    addRules : function(oNewRules) {
      var _bReturn = true,
        self = this;
      for(var i in oNewRules) {
        if (!self._addRule(i, oNewRules[i])) {
          _bReturn = false;
        }
      }
      return _bReturn;
    }
    ,

    /**
     * clear all notice class on input and remove notice tips
     * @param {object}, dom reference of input object
     * @return boolean
     */
    clearAll : function() {
      this.clearNotice(this.aInputs);
    }
    ,

    /**
     * clear notice class on input and remove notice tips
     * @param {object|array}, dom reference of input object
     * @return boolean
     */
    clearNotice : function(vInput) {
      var self = this, fn = function(o) {
        self._normalizeInput(o);
        var oExistingTips = _$(_config.sInlineErrorTag+'.'+_config.sInlineErrorClass,
          o.parentNode, true)[0];
        if (_isNode(oExistingTips)) {
          oExistingTips.innerHTML = '';
          _D.removeClass(oExistingTips, _config.sErrorActiveClass);
        }
      };
      _YL.isArray(vInput) || (vInput = [vInput]);
      _each(vInput, fn);
    }
    ,

    /**
     * set notice type when error happened
     * @param {string}, possible value: 'tips', 'domDiv', 'alert'
     * @return boolean
     */
    setNoticeType : function(sNotice) {
      var _bReturn = _inArray(sNotice, _aNoticeType);
      if(_bReturn) {
        this.iNoticeType = _bReturn[0];
        _bReturn = true;
      }
      return _bReturn;
    }
    ,

    /**
     * public function, validate the form
     */
    validate : function() {
      this._validateForm(false);
    }

  };

})()