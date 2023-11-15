<?php

  include('./JSON.php');
  $_sTest = $_REQUEST['test'];
  $_sValue = $_REQUEST['value'];
  $_json = new Services_JSON();

  switch($_sTest) {
    case 1:
      if(strcmp(preg_replace("/[^0-9]/", '', $_sValue), $_sValue) != 0) {
        _outputFailMsg('Only number is allowed');
      }
      break;
    case 2:
      if(strcmp('abcdef', $_sValue) != 0) {
        _outputFailMsg('Wrong input');
      }
      break;
  }
  _outputOKMsg();

function _outputJson($obj) {
  global $_json;
  header('Content-type: application/x-json');
  header("Expires: Thu, 01 Jan 1970 00:00:01 GMT");
  header("Cache-Control: no-cache, must-revalidate");
  header("Pragma: no-cache");
  echo $_json->encode($obj);
  exit;
}

function _outputFailMsg($sMsg) {
  $_output = array(
    'code' => '50001',
    'message' => $sMsg
  );
  _outputJson($_output);
}
function _outputOKMsg() {
  $_output = array(
    'code' => '200',
    'message' => 'Success'
  );
  _outputJson($_output);
}