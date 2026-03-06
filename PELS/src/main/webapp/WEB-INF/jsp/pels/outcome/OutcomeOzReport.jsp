<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>

<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<%
    response.setHeader("Cache-Control", "no-store");
	response.setHeader("Pragma", "no-cache");
	response.setDateHeader("Expires", 0);
	if(request.getProtocol().equals("HTTP/1.1")) {
		response.setHeader("Cache-Control", "no-cache");
	}

	String DIV  = (String) request.getAttribute("DIV");
    
    Date nowDate = new Date();
    
    SimpleDateFormat format = new SimpleDateFormat("yy/MM/dd");
    String SignDate = format.format(nowDate);

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
	
	function AplprSet()
	{
		MM_openBrWindow('Aplpr_Popup.do?PPCD=233&APRV_STEP_CFY=${outcomeProcDetail.APRV_STEP_CFY}&TST_UNQ_KY_VAL=${TST_UNQ_KY_VAL}&FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}','','width=1000,height=600');	
	}
	
	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "OutcomeOzReport.do"
		form.submit()
	}
	
	function fncApprove(TST_UNQ_KY_VAL, APRV_SEQ, APLPR_ID) {
		if (!confirm('결재를 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', TST_UNQ_KY_VAL);
		formData.append('APRV_SEQ', APRV_SEQ);
		formData.append('APLPR_ID', APLPR_ID);
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Aplpr_Approve_Ajax.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					alert(resultData.resultMsg);
					//SignSet(APRV_SEQ);
					fnSearch();
				} else {
					alert('결재에 실패하였습니다.');
					console.log('Save Fail!!');
				}
			},
			error: function () {
				alert('결재에 실패하였습니다.');
				console.log('Error occured!!');
			}
		})
	}
	
	function AplprDelete()
	{
		if (!confirm('결재선이 삭제되어 재지정해야 합니다. 회수하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', '${TST_UNQ_KY_VAL}');
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Aplpr_Delete_Ajax.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					alert(resultData.resultMsg);
					SingAllDel();
					fnSearch();
				} else {
					alert('회수에 실패하였습니다.');
					console.log('Save Fail!!');
				}
			},
			error: function () {
				alert('회수에 실패하였습니다.');
				console.log('Error occured!!');
			}
		})
	}
	
	function fnParent () {
		let form = document.getElementById('form')
		form.action = "Outcome_Search.do?PRCDOC_CFY=M"
		form.submit()
	}	
	
	// 팝업 오픈
	function MM_openBrWindow(theURL,winName,features) { //v2.0
	  window.open(theURL,winName,features);
	}	
	
	function SaveCFY() {
		if (!confirm('점검완료를 취소 하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', '${TST_UNQ_KY_VAL}');
		formData.append('PRSTS_CFY', 'A');
		
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
					alert(resultData.resultMsg);
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
<body class="no-skin real-skin">
<form id="form" name="form" method="post">
<input type="hidden" name="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
<input type="hidden" name="ATFL_PHCL_NM" value="${ATFL_PHCL_NM}">
<input type="hidden" name="FRM_UNQ_KY_VAL" value="${FRM_UNQ_KY_VAL}">

<div class="page-content">
	<div class="page-content-area">
		<!-- #ection:basics/page-header -->
		<div class="page-header">
			<h1>
				<span class="title">점검 결과 보기</span>
				<span>
					<ul class="breadcrumb">
						<li>
							<a href="#">점검지A(DB화)</a>
						</li>
						<li class="">점검 결과 관리</li>
						<li class="active">점검 결과 보기 </li>
					</ul><!-- /.breadcrumb -->
				</span>
			</h1>
		</div><!-- /page-header -->
		
		<div class="PageButtonGroup" style="text-align:right">
		    <!-- 
			<a class="btn-m" href="javascript:SignSet2(1);"><span class="Text">사인넣기 테스트</span></a>
			 -->
			<c:if test="${outcomeProcDetail.APRV_YN_CFY eq 'Y'}">
				<c:if test="${outcomeAplprList.size() eq 0}">
					<a class="btn-m" href="javascript:AplprSet();"><span class="Text">결재선지정</span></a>
				</c:if>
				<c:if test="${outcomeAplprList.size() > 0}">
					<c:set var="APLPR_ID" value=""/> 
					<c:set var="APRV_YN" value=""/>
					<c:forEach var="aplprList" items="${outcomeAplprList}" begin="0" end="${outcomeAplprList.size()}" step="1">
						<c:if test="${aplprList.APRV_SEQ eq '1'}">
							<c:set var="APLPR_ID" value="${aplprList.APLPR_ID}"/>
						</c:if>
						<c:if test="${aplprList.APRV_SEQ eq '2'}">
							<c:set var="APRV_YN" value="${aplprList.APRV_YN}"/>
						</c:if>
					</c:forEach>
					<c:if test="${APLPR_ID eq LOGIN_USER_ID}">
						<c:if test="${APRV_YN eq 'N'}">
							<a class="btn-m" href="javascript:AplprSet();"><span class="Text">결재서재지정</span></a>
						</c:if>
						<c:if test="${APRV_YN eq 'Y'}">
							<a class="btn-m" href="javascript:AplprDelete();"><span class="Text">회수</span></a>
						</c:if>
					</c:if>
				</c:if>
			</c:if>
			<c:if test="${GRADE eq '001' or GRADE eq '002'}">
				<a class="btn-m" href="javascript:SaveCFY();"><span class="Text">점검완료 취소</span></a>
			<!-- <a class="btn-m" href="javascript:fnSave();"><span class="Text">저장</span></a> -->
 			</c:if>			
			<a class="btn-m" href="javascript:fnParent();"><span class="Text">이전화면</span></a>
		</div>
		<div class="row">
			<div class="col-xs-12">
				<!-- PAGE CONTENT BEGINS -->	
<c:if test="${outcomeAplprList.size() > 0}">
				<div class="RealPanel" style="height:100px;">
</c:if>
<c:if test="${outcomeAplprList.size() eq 0}">
				<div class="RealPanel">
</c:if>
					<div class="Title">
						<div class="TitleArea">
							<span class="SubTitle">${outcomeProcDetail.ATCT_NM} [${outcomeProcDetail.TITL_NM}]</span>
						</div>
						<div class="ControlArea">
						<c:if test="${outcomeProcDetail.APRV_YN_CFY eq 'Y'}">
							<c:if test="${outcomeAplprList.size() > 0}">
							<div style="width:100%;height:14%;">
							<table border=1>
							<tr height=20>
								<c:forEach var="aplprList" items="${outcomeAplprList}" begin="0" end="${outcomeAplprList.size()}" step="1">
								<td width=70 align="center">${aplprList.APLPR_NM}</td>
								</c:forEach>
							</tr>
							<tr height=20>
								<c:set var="PREV_APRV_YN" value="Y"/> 
								<c:forEach var="aplprList" items="${outcomeAplprList}" begin="0" end="${outcomeAplprList.size()}" step="1">
									<c:if test="${aplprList.APRV_YN eq 'Y'}">
										<td width=70 height=50 align="center" style="font-family:Fantasy;font-style:italic;"><font size=3><strong>${aplprList.APLPR_NM}<strong></font></td>
									</c:if>
									<c:if test="${aplprList.APRV_YN eq 'N'}">
										<td width=70 height=50 align="center">
										<c:if test="${aplprList.APLPR_ID eq LOGIN_USER_ID and PREV_APRV_YN eq 'Y'}">
										  <a  class="SubButton" href="javascript:fncApprove('${aplprList.TST_UNQ_KY_VAL}','${aplprList.APRV_SEQ}','${aplprList.APLPR_ID}');"><span class="Text">결재</span></a>
										</c:if>										
										</td>
									</c:if>									
									<c:set var="PREV_APRV_YN" value="${aplprList.APRV_YN}"/> 
								</c:forEach>
							</tr>
							<tr height=20>
								<c:forEach var="aplprList" items="${outcomeAplprList}" begin="0" end="${outcomeAplprList.size()}" step="1">
								<td width=70 align="center">${aplprList.FM_APRV_DT}</td>
								</c:forEach>
							</tr>
							</table>
							</div>
							</c:if>
						</c:if>
						</div>
					</div>
				</div>
			</div>
		</div>		
		
	</div>
</div>
</form>
<c:if test="${outcomeAplprList.size() > 0}">
	<div id="OZViewer" style="width:100%-40px;height:78%; margin: 0px 20px 20px 20px;"></div>
</c:if>
<c:if test="${outcomeAplprList.size() eq 0}">
	<div id="OZViewer" style="width:100%-40px;height:85%;  margin: 0px 20px 20px 20px;"></div>
</c:if>
</body>
</html>