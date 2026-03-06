<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=Edge, chrome=1" />
	<title> PELS-원전 절차수행기록 디지털시스템</title>
	<meta http-equiv="Cache-Control" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta http-equiv="Pragma" content="no-cache" />
	<link href="/resources/assets/css/Login1.css" rel="stylesheet" />
	<style>
	.support {
	    margin-left: 40px;
	    text-align: right;
	    padding-top: 1px;
	    font-size: 12px;
	}
	</style>
	<script src="/resources/assets/js/ace-extra.min.js"></script>
	<script type="text/javascript">
		window.jQuery || document.write("<script src='/resources/assets/js/jquery.min.js'>"+"<"+"/script>");
	</script>
	<script type="text/javascript">
		if('ontouchstart' in document.documentElement) document.write("<script src='/resources/common.jspf/js/jquery.mobile.custom.min.js'>"+"<"+"/script>");
	</script>
	<script type="text/javascript" src="/resources/assets/datepicker/jquery-ui.min.js" ></script>
</head>
<script>
	$(function() {
		$(".support").css("padding-top", "0 !important");
	});
	
	function login () {
		const LOGIN_ID = $('#LOGIN_ID').val()
		const PASSWORD = $('#PASSWORD').val()
		let params = { 
			'LOGIN_ID': LOGIN_ID,
			'PASSWORD': PASSWORD
		}
		
		$.ajax({
			type: 'POST',
			url: 'PELS_loginChk.do',
			data: params,
			dataType: 'JSON',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function (resultData) {
				if (resultData.result == "success") {
					location.href = '/index.do'
				} else {
					alert('로그인 실패. 아이디와 비밀번호를 다시 확인해주세요.')	
				}
			},
			error: function () {
				console.log('Error occured!!')
			}
		})
	}
	
	function onKeyPress () {
		if (window.event.keyCode == 13) login()
	}
</script>
<body class="RealwebLogin">
	<form id="form" name="form" method="post">
	<div class="Login">	
		<div class="Title">
			<div class="name" style="font-style: oblique;">PELS</div>
			<div class="text">
				<span style="font-family: 맑은고딕, Malgun Gothic;">원전 절차수행기록 디지털시스템</span>
				<span style="font-family: times;"> Procedural Excecution Logging System</span>
			</div>
		</div>
		<div class="contents">
			<div class="InputArea">			
				<div class="radioBox">
				</div>
				<div class="input-group">
					<span class="input-group-addon i-user"></span><input type="text" placeholder="사용자 계정을 입력 하세요." class="form-control" name="LOGIN_ID" id="LOGIN_ID" value="" onkeypress="onKeyPress();" title="계정" required />
				</div>                    
				<div class="input-group">
					<span class="input-group-addon i-password"></span><input type="password" placeholder="사용자 비밀번호를 입력 하세요." class="form-control" name="PASSWORD" id="PASSWORD" value="" onkeypress="onKeyPress();" title="비밀번호" required />
				</div>  
				<div style="margin-top: 5px; text-align: center; height: 20px;">
                   	<a class="special" role="link">
						<span class="orange" style="color: #dddccc;  font-size: 13px;">* 정확한 계정을 입력 바랍니다.</span>
					</a>
                </div>
                
				<input type="button" class="LoginButton" style="font-weight: bold;" onclick="javascript:login();" value="로그인" />	
				<div class="buttonArea">
				</div>
			</div>
			<div class="support">
				<span class="phone"></span>
				<span class="mail"></span>
			</div>
		</div>
	</div>
<div class="wrap-loading display-none">
</div>
</form>
</body>
</html>