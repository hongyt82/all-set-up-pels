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
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.reportname","/upload/PELS.ozr");
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.args1","viewerType=HTML5 Canvas Viewer");
		oz.sendToActionScript("information.debug","true");
		
		oz.sendToActionScript("odi.odinames", "PELS_OZ");
		oz.sendToActionScript("odi.PELS_OZ.pcount", "1");
		oz.sendToActionScript("odi.PELS_OZ.args1", "TST_UNQ_KY_VAL=${TST_UNQ_KY_VAL}");
		oz.sendToActionScript("odi.PELS_OZ.fetchtype", "Concurrent");

		return true;
	}	
	
	function SaveCFY() {
		if (!confirm('점검완료를 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', '${TST_UNQ_KY_VAL}');
		formData.append('PRSTS_CFY', 'C');
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Exam_CFY_Update.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					alert("점검완료 처리되었습니다. 점검결과관리에서 확인하세요");
					window.opener.fnSearch();
					window.close();					
				} else {
					alert('저장에 실패하였습니다.');
					console.log('Save Fail!!');
				}
			},
			error: function () {
				alert('저장에 실패하였습니다.');
				console.log('Error occured!!');
			}
		})
	}	
</script>
<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text">현장임시보관함 점검 결과표</span>	
		</div>  
		<div class="PageButtonGroup" style="text-align:right; top: 9px;">
			<c:if test="${PRSTS_CFY eq 'A' and GRADE ne ''}">
			<a class="btn-m" href="javascript:SaveCFY();" style="background-color: #e9a35c"><span class="Text">점검완료</span></a>
			</c:if>
			<span class="ButtonClose" style="height: 30px;" onclick="javascript:top.window.close();"></span>
		</div>		    
	</div>
	<div id="OZViewer" style="width:100%;height:94%"></div>
</body>
</html>

