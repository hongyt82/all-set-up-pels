<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%
	ArrayList formList  = (ArrayList) request.getAttribute("formList");
	String DIV  = (String) request.getAttribute("DIV");
    int size = formList.size();
    String FNAME1 = formList.get(0).toString();
    String FNAME2 = "";
    if(size > 1) {
    	FNAME2 = formList.get(1).toString();
    }
    
%>
<script src="/oz80/ozhviewer/jquery-2.0.3.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/jquery-ui.css" type="text/css"/>
<script src="/oz80/ozhviewer/jquery-ui.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/ui.dynatree.css" type="text/css"/>
<script type="text/javascript" src="/oz80/ozhviewer/jquery.dynatree.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/OZJSSVGViewer.js" charset="utf-8"></script>

<!-- <script type="text/javascript" src="/oz80/ozhviewer/OZJSSVGViewer.js" charset="utf-8"></script> -->
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/web/compatibility.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/build/pdf.js" charset="utf-8"></script>
<script type="text/javascript">
	if (typeof PDFJS != "undefined") {
	//cMapUrl must match the path of pdf.js file. If it is different from the default path, be sure to correct it.
        PDFJS.cMapUrl = "/oz80/ozhviewer/pdf_js/web/cmaps/";
        PDFJS.cMapPacked = true;
    }
</script>
<script>
	$(document).ready(function () {
		start_ozjs("OZViewer","/oz80/ozhviewer/");
	})	

	function SetOZParamters_OZViewer(){
		var oz;
		oz = document.getElementById("OZViewer");
		oz.sendToActionScript("information.debug","true");
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.openfile","${PELS_IP_URL}/upload/<%=FNAME1%>");
		oz.sendToActionScript("connection.reportname","${PELS_URL}/upload/<%=FNAME1%>");
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.args1","pdf=${PELS_IP_URL}/upload/<%=FNAME2%>");
		oz.sendToActionScript("svg.convertedimagedpi","150");
		
		oz.sendToActionScript("ozd.allowreplaceformparam","true"); //ozd formparam 변경시 true
		
		oz.sendToActionScript("pdf.filename","/upload/<%=FNAME2%>");
		oz.sendToActionScript("pdf.fontembedding","true");
		oz.sendToActionScript("pdf.fontembedding_subset","true");
		oz.sendToActionScript("pdf.savecomment","all");
		
		return true;
	}		
	
</script>
<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text"></span> 	
		</div>      
		<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>
		<div class="PageButtonGroup" style="text-align:right">
		</div>         
	</div>
	<div id="OZViewer" style="width:100%;height:94%"></div>
</body>
</html>