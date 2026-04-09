<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String elinkRoot = (String) request.getAttribute("ELINK_V2_ROOT");
	if (elinkRoot == null) {
		elinkRoot = request.getContextPath();
	}
%>
<!DOCTYPE html>
<html>
<head>
<meta charset="EUC-KR">
<title>PDF Editor</title>
<style>
    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
    }
    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>

<script type="text/javascript">
// @kysoft
function pageLoad(){
	document.getElementById("iframPdfEditor").src = "<%= elinkRoot %>/e-link-v2/editor?FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}";
}

</script>
</head>
<body onload="javascript:pageLoad();">

<iframe id="iframPdfEditor"></iframe>
</body>
</html>

