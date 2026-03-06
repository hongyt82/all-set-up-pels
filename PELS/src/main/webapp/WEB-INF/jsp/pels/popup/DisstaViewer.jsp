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
		var inputjson = "{\"WRK_SCTN_NM\":\"${EtcJobFormDetail.WRK_SCTN_NM}\""
			          + ",\"MTNG_HSMPR_ID\":\"${EtcJobFormDetail.MTNG_HSMPR_ID}\""
			          + ",\"PUCD\":\"${EtcJobFormDetail.HOGI}\""
			          + ",\"WRKOR_NO\":\"${EtcJobFormDetail.WRKOR_NO}\""
			          + ",\"WRK_TRGT_NM\":\"${EtcJobFormDetail.WRK_TRGT_NM}\""
			          + ",\"MTNG_DY\":\"${EtcJobFormDetail.MTNG_DY}\""
			          + ",\"WRK_NM\":\"${EtcJobFormDetail.WRK_NM}\""
			          + ",\"PRCDOC_NO\":\"${EtcJobFormDetail.PRCDOC_NO}(${EtcJobFormDetail.PRCDOC_RVSN_NO})\""
			          + ",\"MTNG_TITL\":\"${EtcJobFormDetail.MTNG_TITL}\""
			          + ",\"MTNG_PLC_NM\":\"${EtcJobFormDetail.MTNG_PLC_NM}\""
			          + ",\"A080200001_tbx_1\":\"${EtcJobFormDetail.WRK_SCTN_NM}\""
			          + ",\"A080200001_tbx_2\":\"${EtcJobFormDetail.MTNG_HSMPR_ID}\""
			          + ",\"A080200001_tbx_3\":\"${EtcJobFormDetail.HOGI}\""
			          + ",\"A080200001_tbx_4\":\"${EtcJobFormDetail.WRKOR_NO}\""
			          + ",\"A080200001_tbx_5\":\"${EtcJobFormDetail.MTNG_DY}\""
			          + ",\"A080200001_tbx_6\":\"${EtcJobFormDetail.MTNG_PLC_NM}\""
			          + ",\"A080200001_tbx_7\":\"${EtcJobFormDetail.MTNG_PLC_NM}\""
			          + ",\"A080200001_tbx_8\":\"${EtcJobFormDetail.WRK_NM}\""
			          + ",\"A080200001_tbx_9\":\"${EtcJobFormDetail.PRCDOC_NO}(${EtcJobFormDetail.PRCDOC_RVSN_NO})\""
					  + "}";
		
		oz = document.getElementById("OZViewer");
		oz.sendToActionScript("viewer.focus_doc_index", "0"); //자식 ozr 개수
		oz.sendToActionScript("global.concatpage","true");
		oz.sendToActionScript("eform.signpad_type","dialog");
		oz.sendToActionScript("print.alldocument","true");
		oz.sendToActionScript("viewer.childcount", "0"); //자식 ozr 개수
		oz.sendToActionScript("connection.servlet","/oz80/server");
		oz.sendToActionScript("connection.openfile","${PELS_URL}/upload/<%=formList.get(0).toString()%>");
		oz.sendToActionScript("connection.pcount","1");
		oz.sendToActionScript("connection.inputjson",inputjson);
		oz.sendToActionScript("connection.args1","viewerType=HTML5 Canvas Viewer");
		oz.sendToActionScript("information.debug","true");
		
		// stemp
		oz.sendToActionScript("image.defaultsize","50,36");
		oz.sendToActionScript("image.path","${PELS_URL}/");
		oz.sendToActionScript("image.editable","false");
		oz.sendToActionScript("image.showborder","false");		

		return true;
	}		
	
	function OZImageSet()
	{
		OZViewer.ScriptEx('attachimage', 'image.path=${PELS_URL}/resources/assets/images/email1.png;image.defaultssize=100,40',';');
	}
	
	function getMemoData()
	{
		return OZViewer.GetInformation("MEMO_DATA");
	}
	
	function SaveOzd()
	{
		var jsondata = getInputJson();

		// 입력데이터 서버에 전송
		$.ajax({
			url: '${PELS_URL}/oz80/pels/inspection_save.jsp',
			type: "POST",
			//data: "jsondata=" + encodeURIComponent( getInputJson() ),
			data: { ozd_file : '<%=formList.get(0).toString()%>', ozr_file : '<%=formList.get(1).toString()%>', jsondata : getInputJson(), memoData : getMemoData()},
			success: function (resultStr) {
				console.log("resultStr="+resultStr);
				if(resultStr.trim().length == 0) {
					alert(" 저장시 오류가 발생했습니다.\n오즈스케줄러 로그를 확인해 주시기 바랍니다.");
					return;
				}
				
				var result = JSON.parse(resultStr);
				if (result.Status == "success") {
					alert("[Success] " + result.Message);
				} else {
					alert("[Fail] " + result.Message);                        
				}
				//self.opener.location.reload();
				//self.close();
			},
			error: function (err) {
				alert(err.statusText);
			}
		});
	}
	
	function SaveCFY() {
		if (!gfnChkReqValidation()) return
		
		if (!confirm('시험수행을 승인하시겠습니까?')) return
		
		let formData = new FormData()
		formData.append('TST_UNQ_KY_VAL', '${TST_UNQ_KY_VAL}');
		formData.append('PRSTS_CFY', 'F');
		
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
					fnSearch();
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
			<span class="Text">서식 내용 : <%=formList.get(0).toString()%></span> 	
		</div>      
		<div class="PageButtonGroup" style="text-align:right; top: 9px;">
			<a class="btn-m" href="javascript:SaveOzd();" style="background-color: #e9a35c"><span class="Text">저장</span></a>
			<!-- <a class="btn-m" href="javascript:SaveCFY();" style="background-color: #e9a35c"><span class="Text">발전부장 확인</span></a> -->
			<!-- <a class="btn-m" href="javascript:OZImageSet();" style="background-color: #e9a35c"><span class="Text">이미지삽입</span></a> -->
			<span class="ButtonClose" style="height: 30px;" onclick="javascript:top.window.close();"></span>
		</div>         
	</div>
	<div id="OZViewer" style="width:100%;height:94%"></div>
</body>
</html>

