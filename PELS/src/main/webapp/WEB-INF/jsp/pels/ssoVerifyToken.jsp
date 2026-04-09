<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ page import="WiseAccess.*, java.text.SimpleDateFormat, java.util.Date" %>

<%
	response.setHeader("Cache-Control", "no-cache");
%>

<%
SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmm");
String time = format.format(new Date());	

String ssotoken = request.getParameter("ssotoken");
String sIp = request.getRemoteAddr();


%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<script src="/resources/assets/js/jquery-1.11.1.js"></script>
<script src="/resources/assets/js/NxSsoClientKHNP.js"></script>

<%
if (ssotoken == null || "".equals(ssotoken)) {
%>
<script language='javascript'>
//SSO클라이언트에서 토큰을 가져오기 위한 스크립트
function _GetToken(frm)
{
	var ret = "";
	NxSsoClient.GetToken(ssotoken).then(function(result) {
		ret = result.json.message;
		 //alert("GetToken result : " + ret)
		
		if(ret == null || ret == "") {
			location.href = "<%=request.getContextPath()%>/error.do";
		} else {
			frm.ssotoken.value = ret;
			frm.submit();
		}
	});
}
</script>
</head>
<!--action URL은 업무 경로에 맞게 설정 부탁드립니다. -->
<body onload="javascript:_GetToken(document.form_);">
<form name="form_" ID="Form1" action="<%=request.getContextPath()%>/LoginSSO.do" method="post" target="_self">
	<input name="ssotoken" type="hidden" ID="ssotoken">
</form>
</body>
<%
} else {
	/**
	 * ssotoken을 서버에서 받아 처리하기 위한 로직
	 * 세션에 사번을 담아 처리 or 사번을 파라미터로 처리
	 * @param ssotoken
	 */
	int nRet = -1;
		
	SSO sso = new SSO();
	
	nRet = sso.verifyToken(ssotoken, sIp);

	if(nRet >= 0) {
		String sabun = sso.getValueUserID(); 		//사번을 추출한다.
		session.setAttribute("ssotoken", ssotoken);	// ssotoken을 세션에 담는다.
		session.setAttribute("sabun", sabun);		// ssotoken을 세션에 담는다.
		response.sendRedirect("<%=request.getContextPath()%>/Login.do");			// 업무에 맞게 페이지 설정
	} else {
		//response.sendRedirect("<%=request.getContextPath()%>/errorLogin.do");	// 에러처리
		response.sendRedirect("<%=request.getContextPath()%>/PELS_Login.do");	// 에러처리
	}
}
%>
</html>