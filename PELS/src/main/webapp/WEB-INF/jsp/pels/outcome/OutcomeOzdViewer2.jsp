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

	ArrayList formList  = (ArrayList) request.getAttribute("formList");
	String DIV  = (String) request.getAttribute("DIV");
	String ATFL_PHCL_NM  = (String) request.getAttribute("ATFL_PHCL_NM");
	
	String Sign_Data1 = (String) request.getAttribute("Sign_Data1");
	String SIGN_DATE1 = (String) request.getAttribute("Sign_Date1");
	String Sign_Data2 = (String) request.getAttribute("Sign_Data2");
	String SIGN_DATE2 = (String) request.getAttribute("Sign_Date2");
	String Sign_Data3 = (String) request.getAttribute("Sign_Data3");
	String SIGN_DATE3 = (String) request.getAttribute("Sign_Date3");
	
    int size = formList.size();
    String FNAME1 = formList.get(0).toString();
    String FNAME2 = "";
    if(size > 1) {
    	FNAME2 = formList.get(1).toString();
    }
    
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
	var ws;
	var rommId = '${TST_UNQ_KY_VAL}';
	
	$(document).ready(function () {
		start_ozjs("OZViewer","/oz80/ozhviewer/");
	})	

	function OZUserActionCommand_OZViewer(param1, param2, param3, param4) {
		console.log("ActionCommand 1:" + param1 + ",2:" + param2 + ",3:" + param3 + ",4:" + param4);

		if(param1=="CommentDraw"){
			console.log(OZViewer.GetInformation("MEMO_DATA"));
		}
	}

	function OZPageChangeCommand_OZViewer(param1) {
		console.log("Change Command 1:" + param1);
	}

	function OZUserEvent_OZViewer(param1, param2, param3, param4) {
		console.log("UserEvnet 1:" + param1 + ",2:" + param2 + ",3:" + param3 + ",4:" + param4);
	}
	
	function OZEFormInputEventCommand_OZViewer(param1, param2, param3, param4) {
		console.log("EFormInputEventCommand 1:" + param1 + ",2:" + param2 + ",3:" + param3 + ",4:" + param4);

		getInputData(param2);
	}

	function getInputData(formId)
	{
		var inputJsonAll = OZViewer.GetInformation("INPUT_JSON_ALL_GROUP_BY_REPORT");
		inputJsonAll = JSON.parse(inputJsonAll);
		
		//console.log("INPUT_JSON_ALL_GROUP_BY_REPORT >>" +inputJsonAll);

		for(let i=0; i< inputJsonAll.length; i++)
		{
			var obj = inputJsonAll[i]["Input"];

			if(obj[formId])
			{
				console.log(obj[formId]);
				return;
			}
		}
	}

	function getCallshimStr() {
	    let call_shim = "";
	    call_shim += "_TraceLn('[call_shim_] ozarg_1 :'+ozarg_1+' | ozarg_2 :'+ozarg_2+' | ozarg_3 : '+ozarg_3+' | ozarg_4 : '+ozarg_4);";
	    call_shim += " if(ozarg_1 == 'f_setvalues') {";
	    call_shim += "     var jsonObj = JSON.parse(ozarg_2);	";
	    call_shim += "	  for (var key in jsonObj) {	";
	    call_shim += "		  _TraceLn('[key]'+key +'[value]'+jsonObj[key]); ";
	    call_shim += "         var comp = GetInputComponent(key);";
	    call_shim += "         if(comp && comp.GetInputType() == 'RadioButton'){ ";
	    call_shim += "             var comp = GetInputComponent(key); ";
	    call_shim += "             if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4) ";
	    call_shim += "         }else if(comp && comp.GetInputType() == 'RadioButtonGroup'){ ";
	    call_shim += "   	      var comp1 = comp.GetRadioButtons(); ";
	    call_shim += "   	      comp1 = JSON.parse(comp1); ";
	    call_shim += "   	      var checked = []; ";
	    call_shim += "   	      for(var i = 0; i<comp1.length; i++){ ";
	    call_shim += "   	         var comp2 = comp.GetRadioButton(comp1[i]); ";
	    call_shim += "   		     if(comp2)checked.push(comp2.IsChecked()); ";
	    call_shim += "   	      } ";
	    call_shim += "   	      SetInputValue(key, jsonObj[key]); ";
	    call_shim += "   	      for(var i = 0; i<comp1.length; i++){ ";
	    call_shim += "   	         var comp2 = comp.GetRadioButton(comp1[i]); ";
	    call_shim += "   	         if(comp2 && comp2.IsChecked() != checked[i]){ ";
	    call_shim += "   		        comp2.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "   		     } ";
	    call_shim += "   	      } ";
	    call_shim += "   	      if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "          }else if (comp && comp.GetInputType() == 'SignPad'){ ";
	    call_shim += "   	      SetInputValue(key, jsonObj[key]); ";
	    call_shim += "   	      if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "   	      var reuseName = comp.GetReusableSignName(); ";
	    call_shim += "   	      if (reuseName != '') { ";
	    call_shim += "   	         _SetReusableSignData(reuseName, comp.GetValue()); ";
	    call_shim += "   	      } ";
	    call_shim += "   	   }else{ ";
	    call_shim += "   	      SetInputValue(key, jsonObj[key]); ";
	    call_shim += "   	      if (comp) comp.TriggerEvent('OnValueChanged', ozarg_4); ";
	    call_shim += "          } ";
	    call_shim += "  	   } ";
	    call_shim += "  }";
	    
	    return call_shim
	}

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
		
		var inputJsonStr = "{" 
			+ "\"FixedTableLabel7\":\"<%=SIGN_DATE1%>\",\"FixedTableSignPad_1\":\"<%=Sign_Data1%>\"," 
			+ "\"FixedTableLabel8\":\"<%=SIGN_DATE2%>\",\"FixedTableSignPad_2\":\"<%=Sign_Data2%>\"," 
			+ "\"FixedTableLabel9\":\"<%=SIGN_DATE3%>\",\"FixedTableSignPad_3\":\"<%=Sign_Data3%>\"" 
			+ "}";
		var oz;
		oz = document.getElementById("OZViewer");
		oz.sendToActionScript("viewer.focus_doc_index", "0"); //자식 ozr 개수
		oz.sendToActionScript("viewer.useractioncommand", "true");
		oz.sendToActionScript("viewer.pagechangecommand", "true");
		oz.sendToActionScript("viewer.pagedisplay","continuous");
		oz.sendToActionScript("viewer.externaleventshim", getCallshimStr());
		oz.sendToActionScript("global.concatpage","true");
		oz.sendToActionScript("eform.signpad_type","dialog");
		oz.sendToActionScript("eform.inputeventcommand","true");
		oz.sendToActionScript("print.alldocument","true");
		oz.sendToActionScript("viewer.childcount", "0"); //자식 ozr 개수
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.inputjson", inputJsonStr);
		oz.sendToActionScript("connection.openfile","${PELS_URL}/upload/<%=FNAME1%>");
		oz.sendToActionScript("pdf.savecomment","all");
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.args1","viewerType=HTML5 Canvas Viewer");
		oz.sendToActionScript("information.debug","true");
		
		return true;
	}	
	
	function getMemoData0()
	{
		return OZViewer.GetInformation("MEMO_DATA_AT=0");
	}
	
	function getMemoData1()
	{
		return OZViewer.GetInformation("MEMO_DATA_AT=1");
	}


	function getMemoData2()
	{
		return OZViewer.GetInformation("MEMO_DATA_AT=2");
	}


	function getMemoData3()
	{
		return OZViewer.GetInformation("MEMO_DATA_AT=3");
	}
	
	function SaveOzd(inputJson)
	{
		//var jsondata = getInputJson();
		
		//alert(jsondata);
		
		// 입력데이터 서버에 전송
		$.ajax({
			url: '/oz80/pels/inspection_ozd_sign.jsp',
			type: "POST",
			//data: "jsondata=" + encodeURIComponent( getInputJson() ),
			data: { ozd_file : '<%=FNAME1%>', ozr_file : '<%=FNAME2%>', jsondata : inputJson, memoData0 : getMemoData0(), memoData1 : getMemoData1(), memoData2 : getMemoData2(), memoData3 : getMemoData3()},
			success: function (resultStr) {
				console.log("resultStr="+resultStr);
				if(resultStr.trim().length == 0) {
					alert(" 저장시 오류가 발생했습니다.\n오즈스케줄러 로그를 확인해 주시기 바랍니다.");
					return;
				}
				
				var result = JSON.parse(resultStr);
				if (result.Status == "success") {
					//alert("[Success] " + result.Message);
				} else {
					alert("[Fail] " + result.Message);                        
				}
			},
			error: function (err) {
				alert(err.statusText + ":aaaa");
			}
		});
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
	
	function AplprSet()
	{
		MM_openBrWindow('Aplpr_Popup.do?PPCD=233&APRV_STEP_CFY=${outcomeProcDetail.APRV_STEP_CFY}&TST_UNQ_KY_VAL=${TST_UNQ_KY_VAL}&FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}&OZD_NAME=<%=FNAME1%>','','width=1000,height=600');	
	}
	
	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "OutcomeOzdViewer.do"
		form.submit()
	}
	
	function fncApprove(TST_UNQ_KY_VAL, APRV_SEQ, APLPR_ID) {
		if (!confirm('결재를 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', TST_UNQ_KY_VAL);
		formData.append('APRV_SEQ', APRV_SEQ);
		formData.append('APLPR_ID', APLPR_ID);
		formData.append('OZD_NAME', '<%=FNAME1%>');
		
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
	
	function fncApprove2(TST_UNQ_KY_VAL, APRV_SEQ, APLPR_ID, APRV_DT) {
		if (!confirm('결재를 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', TST_UNQ_KY_VAL);
		formData.append('APRV_SEQ', APRV_SEQ);
		formData.append('APLPR_ID', APLPR_ID);
		formData.append('APRV_DT', APRV_DT);
		formData.append('OZD_NAME', '<%=FNAME1%>');
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Aplpr_Approve2_Ajax.do',
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
	
	function fncApprove3(TST_UNQ_KY_VAL, APRV_SEQ, APLPR_ID, APRV_DT) {
		if (!confirm('결재를 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', TST_UNQ_KY_VAL);
		formData.append('APRV_SEQ', APRV_SEQ);
		formData.append('APLPR_ID', APLPR_ID);
		formData.append('APRV_DT', APRV_DT);
		formData.append('OZD_NAME', '<%=FNAME1%>');
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Aplpr_Approve3_Ajax.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					alert(resultData.signData);
					SingLocalSet(resultData.signData);
					//SignSet(APRV_SEQ);
					//fnSearch();
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
	
	function SingLocalSet(Sign)
	{
		alert(Sign);
		var signData = Sign;
		var inputjson = "{";
		inputjson += "\"sign_text_1\":\"" + signData + "\",\"date_text_1\":\"25/07/01\",";
		inputjson += "}";
		alert(inputjson);
		
		OZViewer.Document_TriggerExternalEventByDocIndex(i, "call_shim_f_setvalues", jsonData, "")
	}

	function SingAllDel()
	{
		var inputjson = "{";
		inputjson += "\"sign_text_1\":\" \",\"date_text_1\":\" \",";
		inputjson += "\"sign_text_2\":\" \",\"date_text_2\":\" \",";
		inputjson += "\"sign_text_3\":\" \",\"date_text_3\":\" \"";
		inputjson += "}";
		
		SaveOzd(inputjson);
	}
	
	function SignSet2(Cnt)
	{
		fncApprove('${TST_UNQ_KY_VAL}', Cnt, '${LOGIN_USER_ID}');
	}
	
	function SignSet(Cnt)
	{
		var inputjson = "{";
		if(Cnt == 1)
			inputjson += "\"sign_text_1\":\"${LOGIN_USER_NM}\",\"date_text_1\":";
		else if(Cnt == 2)
			inputjson += "\"sign_text_2\":\"${LOGIN_USER_NM}\",\"date_text_2\":";
		else if(Cnt == 3)
			inputjson += "\"sign_text_3\":\"${LOGIN_USER_NM}\",\"date_text_3\":";
			
//		inputjson += "\"${SIGN_DATE}\""
		inputjson += "\"<%=SignDate%>\""
		  	      + "}";
		SetForm(inputjson);
		
		SaveOzd(inputjson);
	}
	
	function SetForm(data)
	{
		var reportCount = OZViewer.GetInformation("REPORT_COUNT");

		const jsonData = '{"A080200001_tbx_1": "2024-06-04" }';

		for(let i=0; i<reportCount; i++) {
			if(data)
				OZViewer.Document_TriggerExternalEventByDocIndex(i, "call_shim_f_setvalues", data, "");
			else
				OZViewer.Document_TriggerExternalEventByDocIndex(i, "call_shim_f_setvalues", jsonData, "")
		}

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
							<span class="SubTitle">${outcomeProcDetail.ATCT_NM} [${outcomeProcDetail.TITL_NM}] ${ATFL_PHCL_NM}</span>
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
										<c:if test="${LOGIN_USER_ID eq 'M1EU0004'}">
											<td width=70 height=50 align="center" style="font-family:Fantasy;font-style:italic;">
											<a  href="javascript:fncApprove3('${aplprList.TST_UNQ_KY_VAL}','${aplprList.APRV_SEQ}','${aplprList.APLPR_ID}','${aplprList.FM_APRV_DT}');"><font size=3><strong>${aplprList.APLPR_NM}<strong></font></a>
											</td>
										</c:if>
										<c:if test="${LOGIN_USER_ID ne 'M1EU0004'}">
											<td width=70 height=50 align="center" style="font-family:Fantasy;font-style:italic;"><font size=3><strong>${aplprList.APLPR_NM}<strong></font></td>
										</c:if>
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