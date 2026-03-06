<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%
	ArrayList formList  = (ArrayList) request.getAttribute("formList");
    int size = formList.size();
%>
<script src="/oz80/ozhviewer/jquery-2.0.3.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/jquery-ui.css" type="text/css"/>
<script src="/oz80/ozhviewer/jquery-ui.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/ui.dynatree.css" type="text/css"/>
<script type="text/javascript" src="/oz80/ozhviewer/jquery.dynatree.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/OZJSViewer.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/web/compatibility.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/build/pdf.js" charset="utf-8"></script>
<script type="text/javascript" src="/resources/assets/js/gfn.js" charset="utf-8"></script>

<script>
	$(document).ready(function () {
		start_ozjs("OZViewer","/oz80/ozhviewer/");
	})	
	
	function SetOZParamters_OZViewer(){
		var oz;
		oz = document.getElementById("OZViewer");
		oz.sendToActionScript("viewer.focus_doc_index", "0");
		oz.sendToActionScript("global.concatpage","true");
		oz.sendToActionScript("eform.signpad_type","dialog");
		oz.sendToActionScript("print.alldocument","true");
		oz.sendToActionScript("viewer.childcount", "<%=size-1%>"); //자식 ozr 개수
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.reportname","/upload/<%=formList.get(0).toString()%>");
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.args1","viewerType=HTML5 Canvas Viewer");
		oz.sendToActionScript("information.debug","true");
		<% 
			for(int i=0; i<size-1; i++) {
		%>
				oz.sendToActionScript("child<%=(i+1)%>.connection.servlet","/oz80/server");
				oz.sendToActionScript("child<%=(i+1)%>.connection.reportname","/upload/<%=formList.get(i+1).toString()%>");
				oz.sendToActionScript("child<%=(i+1)%>.connection.pcount","1");
				oz.sendToActionScript("child<%=(i+1)%>.connection.args1","viewerType=HTML5 Canvas Viewer");
		<%		
			}
		%>

		return true;
	}		
</script>
<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text">서식 내용</span>	
		</div>      
		<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>         
	</div>
	<div id="OZViewer" style="width:100%;height:94%"></div>
</body>
</html>

