<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%

%>
<script src="/oz80/ozhviewer/jquery-2.0.3.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/jquery-ui.css" type="text/css"/>
<script src="/oz80/ozhviewer/jquery-ui.min.js"></script>
<link rel="stylesheet" href="/oz80/ozhviewer/ui.dynatree.css" type="text/css"/>
<script type="text/javascript" src="/oz80/ozhviewer/jquery.dynatree.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/OZJSViewer.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/web/compatibility.js" charset="utf-8"></script>
<script type="text/javascript" src="/oz80/ozhviewer/pdf_js/build/pdf.js" charset="utf-8"></script>

<script>
	$(document).ready(function () {
		start_ozjs("OZViewer","/oz80/ozhviewer/");
	})	
	
	// 입력데이터 리턴
	function getInputJson() {
		/*
		var reportCnt = OZViewer.GetInformation("REPORT_COUNT");
		var rdata = new Object();
		for (var i = 0; i < reportCnt; i++) {
			var inputValue = OZViewer.GetInformation("INPUT_JSON_AT=" + i);
			console.log("[" + i+ "] input json >> " + inputValue);
			rdata[OZViewer.GetInformation("DISPLAYNAME_AT=" + i)] = inputValue;
		}
		var jsonStr = JSON.stringify(rdata);
		console.log("rdata >>" +jsonStr);
		*/
		var inputJsonAll = OZViewer.GetInformation("INPUT_JSON_ALL_GROUP_BY_REPORT");
		console.log("INPUT_JSON_ALL_GROUP_BY_REPORT >>" +inputJsonAll);

		return inputJsonAll;
	}	
	
	function SetOZParamters_OZViewer(){
		var oz;
		var inputjson = "{\"A080700001_sgn_1\":\"${signDetail.SIGN_DATA1}${signDetail.SIGN_DATA2}${signDetail.SIGN_DATA3}${signDetail.SIGN_DATA4}${signDetail.SIGN_DATA5}${signDetail.SIGN_DATA6}${signDetail.SIGN_DATA7}${signDetail.SIGN_DATA8}${signDetail.SIGN_DATA9}${signDetail.SIGN_DATA10}\""
			  + "}";
		
		oz = document.getElementById("OZViewer");
		oz.sendToActionScript("viewer.focus_doc_index", "0"); //자식 ozr 개수
		oz.sendToActionScript("global.concatpage","true");
		oz.sendToActionScript("eform.signpad_type","dialog");
		oz.sendToActionScript("print.alldocument","true");
		oz.sendToActionScript("pdf.savecomment","all");
		oz.sendToActionScript("viewer.childcount", "0"); //자식 ozr 개수
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.reportname","${signDetail.OZR_SIGN}");
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.inputjson",inputjson);
		oz.sendToActionScript("connection.args1","viewerType=HTML5 Canvas Viewer");
		oz.sendToActionScript("information.debug","true");
		
		return true;
	}		
	
	function getMemoData()
	{
		return OZViewer.GetInformation("MEMO_DATA");
	}
	
</script>
<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text">결재사인보기 [사번: ${signDetail.APLPR_ID}, 성명: ${signDetail.APLPR_NM}] </span> 	
		</div>      
		<div class="PageButtonGroup" style="text-align:right; top: 9px;">
			<!-- <a class="btn-m" href="javascript:SaveOzd();" style="background-color: #e9a35c"><span class="Text">저장</span></a> -->
			<span class="ButtonClose" style="height: 30px;" onclick="javascript:top.window.close();"></span>
		</div>         
	</div>
	<div id="OZViewer" style="width:100%;height:94%"></div>
</body>
</html>