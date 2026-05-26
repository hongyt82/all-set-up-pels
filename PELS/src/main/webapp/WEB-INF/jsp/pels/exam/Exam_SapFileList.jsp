<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	$(document).ready(function () {
	})	
	
	function fncSave () {
		//if (!gfnChkReqValidation()) return
		
		let params = new Object()
		let formData = new FormData()
		
		formData.append('CHCK_STRT_DT', $('#CHCK_STRT_DT').val());		// 점검시작일자	
		formData.append('CHCK_END_DT', $('#CHCK_END_DT').val());		// 점검종료일자	
		formData.append('CHCK_TITL', $('#CHCK_TITL').val());			// 제목명
		formData.append('CHKPR_ID', $('#CHKPR_ID').val());				// 점검자ID	
		formData.append('CHKPR_FNM', $('#CHKPR_FNM').val());			// 점검자성명	
		formData.append('WRKOR_NO', $('#WRKOR_NO').val());				// 작업오더번호	
		formData.append('PRSTS_CFY', $('#PRSTS_CFY').val());			// 진행상태구분	

		formData.append('DOC_TYP_CD', $('#DOC_TYP_CD').val());	
		formData.append('PRT_NO', $('#PRT_NO').val());	
		formData.append('PRCDOC_NO', $('#PRCDOC_NO').val());	
		formData.append('PRCDOC_NM', $('#PRCDOC_NM').val());	
		formData.append('PRCDOC_RVSN_NO', $('#PRCDOC_RVSN_NO').val());	
		formData.append('FILE_URL1', $('#FILE_URL1').val());	
		formData.append('FILE_URL2', $('#FILE_URL2').val());	
		formData.append('FILE_URL3', $('#FILE_URL3').val());	
		formData.append('FILE_URL4', $('#FILE_URL4').val());	
		formData.append('FILE_URL5', $('#FILE_URL5').val());	
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: '<%=request.getContextPath()%>/Exam_Insert_Ajax.do',
			data: formData,
			processData: false,
			contentType: false,
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					//alert(resultData.resultMsg);
                    console.log("Check Result Data : " + resultData);
                    console.log("Check Result resultCd : " + resultData.resultCd);
                    console.log("Check Result MSG : " + resultData.resultMsg);
                    console.log("CHCK_SNO : " + resultData.CHCK_SNO);
                    console.log("callMethod : " + resultData.callMethod);
                    //resultData.resultCd
                    //resultData.value
                    //검증 체크
                    console.log("==============called==============");
                    sendAlertWithAck(JSON.stringify("[{CHCK_SNO : 43, PWPL_ID : 2320}]"));
					//fnInputBack();
				} else {
					alert('등록에 실패하였습니다.');
					console.log('Save Fail!!');
				}
			},
			error: function () {
				alert('등록에 실패하였습니다.');
				console.log('Error occured!!');
			}
		})
	}

	// 절차서관리 선택
	function fnFormSelect () {
		const chkElements = document.getElementsByName("CHK_ITEM");
		const chkElement1 = $('#form input[name=FILE_NAME]')
		let form = document.getElementById('form')
		
		let chkCnt = 0;
		let chkParam1 = '';
		let chkParam2 = '';
		let chkParam3 = '';
		let chkParam4 = '';
		let chkParam5 = '';
		for (let i = 0; i < chkElements.length; i++) { 
			if ($(chkElements[i]).is(':checked')) {
				chkCnt++;
				if(chkCnt == 1)	{ form.FILE_URL1.value = $(chkElement1[i]).val(); }
				if(chkCnt == 2)	{ form.FILE_URL2.value = $(chkElement1[i]).val(); }
				if(chkCnt == 3)	{ form.FILE_URL3.value = $(chkElement1[i]).val(); }
				if(chkCnt == 4)	{ form.FILE_URL4.value = $(chkElement1[i]).val(); }
				if(chkCnt == 5)	{ form.FILE_URL5.value = $(chkElement1[i]).val(); }
			}
		}
		
		if (chkCnt == 0) {
			alert('자료를 선택하여 주십시오.')
			return
		}
		
		if (!confirm('단말기에 자료를 다운로드하시겠습니까?')) return
		
		fncSave();
	}
	
	function fnInputBack () {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_Input_M.do?USER_ID=${CHKPR_ID}";
		form.submit()
	}		
	
	function fnFormBack () {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_SapList.do"
		form.submit()
	}	
</script>
<script>
	window.PelsNative = window.PelsNative || {};
	
	window.PelsNative.onInputResult = function(field, value) {
	  if (field === 'sampleInput') {
	    var el = document.getElementById('sampleInput');
	    if (el) el.value = value || '';
	  }
	  if (field === 'sampleInputAck') {
	    var elAck = document.getElementById('sampleInputAck');
	    if (elAck) elAck.value = value || '';
	  }
	  console.log('[PelsNative] onInputResult', field, value);
	};
	
	window.PelsNative.onApiResult = function(endpoint, status, bodyJson) {
	  console.log('[PelsNative] onApiResult', endpoint, status, bodyJson);
	};
	
	// ACK / Promise 踰꾩쟾 ?몄텧
	function sendAlertWithAck(message) {
        if (window.PelsAndroidBridge && PelsAndroidBridge.ui && PelsAndroidBridge.ui.showAlertWithAck) {
            console.log("=======PelsAndroidBridge 객체 있음 (안드로이드 웹뷰 기반상에서 동작한다는 뜻임)======");
            // PC 브라우저상에서는 PelsAndroidBridge 가 존재하지 않음 당연한 것임.
            // 반드시 안드로이드에 웹뷰에서만 동작하는 부분임. 더 정확히는 PelsAndroidBridge 를 받아줄 수 있는 선언부가
            // 안드로이드 웹뷰에 있다.
            // 자바 스크립트 브릿지 인터페이스 자체가 그렇게 동작함으로 이건 기본
            PelsAndroidBridge.ui
                .showAlertWithAck(message)
                .then(function (res) {
                    console.log('[Web] showAlertWithAck OK', res);
                })
                .catch(function (err) {
                    console.log('[Web] showAlertWithAck FAIL', err);
                });
        } else {
            // 여기는 그냥 PC 브라우저에서 호출한 경우
            alert(message.data); // console만
        }
	}
	
	function sendInputRequestWithAck() {
	  var current = document.getElementById('sampleInputAck').value;
      if (window.PelsAndroidBridge && PelsAndroidBridge.ui && PelsAndroidBridge.input.requestWithAck) {
            console.log("PelsAndroidBridge Current :: " + current)
            console.log("=======PelsAndroidBridge 객체 있음 (안드로이드 웹뷰 기반상에서 동작한다는 뜻임)======");
            PelsAndroidBridge.input
                .requestWithAck('sampleInputAck', current)
                .then(function (res) {
                    console.log('[Web] input.requestWithAck OK', res);
                })
                .catch(function (err) {
                    console.log('[Web] input.requestWithAck FAIL', err);
                });
      }else{
            console.log("Current :: " + current)
            // 여기는 그냥 PC 브라우저에서 호출한 경우
            // alert(message.data); // console만
            alert("input.requestWithAck");
      }
	}
	
	function sendApiRequestWithAck() {
        if (window.PelsAndroidBridge && PelsAndroidBridge.ui && PelsAndroidBridge.api.callWithAck) {
            PelsAndroidBridge.api
                .callWithAck('/v1/example',
                    {code: 'ACK01', date: '2026-03-13'},
                    'GET')
                .then(function (res) {
                    console.log('[Web] api.callWithAck OK', res);
                })
                .catch(function (err) {
                    console.log('[Web] api.callWithAck FAIL', err);
                });
        }else{
            alert('API Call with Ack'); // console만
        }
	}
</script>	
<style>

	#myTable tbody tr td {
		line-height: 24px;
	}
	
	body.real-skin  {
		font-size: 14px;
	    min-width: 360px;
	}	
</style>	

<body class="no-skin real-skin real-popup">
<form id="form" name="form" method="post">
<input type="hidden" name="SH_DOC_TYP_CD" value="${SH_DOC_TYP_CD}">
<input type="hidden" name="SH_PRCDOC_NO" value="${SH_PRCDOC_NO}">
<input type="hidden" name="SH_PRT_NO" value="${SH_PRT_NO}">

<input name="PRCDOC_NO" id="PRCDOC_NO" type="hidden" value="${PRCDOC_NO}"> 
<input name="PRCDOC_NM" id="PRCDOC_NM" type="hidden" value="${PRCDOC_NM}"> 
<input name="DOC_TYP_CD" id="DOC_TYP_CD" type="hidden" value="${DOC_TYP_CD}"> 
<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" type="hidden" value="${PRCDOC_RVSN_NO}"> 
<input name="PRT_NO" id="PRT_NO" type="hidden" value="${PRT_NO}"> 

<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" type="hidden" value="${CHCK_STRT_DT}"> 
<input name="CHCK_END_DT" id="CHCK_END_DT" type="hidden" value="${CHCK_END_DT}"> 
<input name="CHCK_TITL" id="CHCK_TITL" type="hidden" value="${CHCK_TITL}"> 
<input name="CHKPR_ID" id="CHKPR_ID" type="hidden" value="${CHKPR_ID}"> 
<input name="CHKPR_FNM" id="CHKPR_FNM" type="hidden" value="${CHKPR_FNM}"> 
<input name="WRKOR_NO" id="WRKOR_NO" type="hidden" value=""> 
<input name="PRSTS_CFY" id="PRSTS_CFY" type="hidden" value="R">
 
<input name="FILE_URL1" id="FILE_URL1" type="hidden" value="">
<input name="FILE_URL2" id="FILE_URL2" type="hidden" value="">
<input name="FILE_URL3" id="FILE_URL3" type="hidden" value="">
<input name="FILE_URL4" id="FILE_URL4" type="hidden" value="">
<input name="FILE_URL5" id="FILE_URL5" type="hidden" value="">
<div class="Header">  
	<div class="PageTitle">		
		<span class="Text">SAP PDF 가져오기</span>
	</div>      
	<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>         
</div>
<div class="Contents"> 			
	<div class="RealPanel">
		<div class="Title">
			<div class="TitleArea">
				<span class="SubTitle"></span>
			</div>
			<div class="ControlArea"></div>
		</div>
		<div class="RealSearchBox">
			<div class="NormalSearch">
				<div class="Default">
					<table border="0" cellpadding="0" cellspacing="0" class="Outline">
						<colgroup>
							<col style="width:100%" />
						</colgroup>
						<tr>
							<td class="Title">
							<span style="font-weight: normal;">문서번호[</span>	 ${PRCDOC_NO} 
							<span style="font-weight: normal;">], 문서제목[</span> ${PRCDOC_NM}
							<span style="font-weight: normal;">]</span>
							</td>
						</tr>
						<tr>
							<td class="Title">
							<span style="font-weight: normal;">문서유형[</span> ${DOC_TYP_CD} 
							<span style="font-weight: normal;">], 문서부분[</span> ${PRT_NO}
							<span style="font-weight: normal;">], 개정번호[</span> ${PRCDOC_RVSN_NO}
							<span style="font-weight: normal;">]</span>
							</td>							
						</tr>
					</table>
				</div>
			</div>
		</div>				
		<div class="ContentPanel">
			<div class="Grid">
				<table cellspacing="0" cellpadding="0" border="0" class="Outline" id = "myTable">
					<colgroup>
						<col width="70px" />
						<col width="*" />
					</colgroup>
					<tr class="Header">
						<th>선택</th>
						<th>파일이름</th>
					</tr>
					<c:forEach var="form" items="${SapFileList}" begin="0" end="${SapFileList.size()}" step="1">
						<tr class="Item">
							<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="" >
								<input type="hidden" name="FILE_NAME" value="${form.FILE_NAME}">
							</td>
							<td align="left">${form.FILE_NAME}</td>
						</tr>
					</c:forEach>
					<c:if test="${SapFileList.size() eq 0}">
						<tr class="Item">
							<td colspan="2" style="text-align: center;">조회된 자료가 없습니다.</td>
						</tr>
					</c:if>
				</table>
				
				<div class="PageButtonGroup">
					<a class="btn-m" href="javascript:fnFormSelect() ;"><span class="Text">다운로드</span></a>
					<a class="btn-m" href="javascript:fnFormBack() ;"><span class="Text">이전화변</span></a>
				</div>
			</div>
		</div>
	</div>
</div>
</form>
</body>
</html>

