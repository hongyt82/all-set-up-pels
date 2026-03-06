<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	var gflag = '1';

	function MM_openBrWindow(theURL,winName,features,flag) { //v2.0
		gflag = flag;
	  	window.open(theURL,winName,features);
	}
	
	function getUserReturnValue(returnValue) {
		if(gflag == 1) {
			$('#APLPR_ID1').val(returnValue.USER_ID);
			$('#APLPR_NM1').val(returnValue.USER_NAME);
		}
		else if(gflag == 2) {
			$('#APLPR_ID2').val(returnValue.USER_ID);
			$('#APLPR_NM2').val(returnValue.USER_NAME);
		}
		else if(gflag == 3) {
			$('#APLPR_ID3').val(returnValue.USER_ID);
			$('#APLPR_NM3').val(returnValue.USER_NAME);
		}
		else if(gflag == 4) {
			$('#APLPR_ID4').val(returnValue.USER_ID);
			$('#APLPR_NM4').val(returnValue.USER_NAME);
		}
	}
	
	function fncSave () {
		if (!gfnChkReqValidation()) return
		
		if (!confirm('등록하시겠습니까?')) return
		
		let params = new Object()
					
		params.TST_UNQ_KY_VAL = $('#TST_UNQ_KY_VAL').val();
		params.APRV_STEP_CFY  = $('#APRV_STEP_CFY').val();
		params.OZD_NAME   	  = $('#OZD_NAME').val();
		params.APLPR_ID1 	  = $('#APLPR_ID1').val();
		params.APLPR_NM1 	  = $('#APLPR_NM1').val();
		params.APLPR_ID2 	  = $('#APLPR_ID2').val();
		params.APLPR_NM2 	  = $('#APLPR_NM2').val();
		params.APLPR_ID3 	  = $('#APLPR_ID3').val();
		params.APLPR_NM3 	  = $('#APLPR_NM3').val();
		params.APLPR_ID4 	  = $('#APLPR_ID4').val();
		params.APLPR_NM4 	  = $('#APLPR_NM4').val();
		
		$.ajax({
			type: 'POST',
			url: 'Aplpr_Insert_Ajax.do',
			data: params,
			dataType: 'JSON',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function (resultData) {
				if('true' == resultData.resultCd) {
					alert(resultData.resultMsg);
					window.opener.fnSearch();
					window.close();
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
	
</script>
<body class="no-skin real-skin real-popup">
<form id="form" name="form" method="post">
<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
<input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="${FRM_UNQ_KY_VAL}">
<input type="hidden" name="APRV_STEP_CFY" id="APRV_STEP_CFY" value="${APRV_STEP_CFY}">
<input type="hidden" name="OZD_NAME" id="OZD_NAME" value="${OZD_NAME}">
<div class="Header">  
	<div class="PageTitle">		
		<span class="Text">결재선 지정</span>
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
		<div class="Title">
			<div class="TitleArea">
				<span class="SubTitle"></span>
			</div>
			<div class="ControlArea"><span class="Label Req">표시는 필수입력항목입니다.</span></div>
		</div>
		<div class="ContentPanel">
			<div class="GridWrite">       
				<table cellspacing="0" cellpadding="0" border="0" class="Outline">
				<colgroup>
					<col class="Title" />
					<col style="width:100%" />
				</colgroup>
				<c:if test="${outcomeAplprList.size() eq 0}">
	                <tr class="Row">
	                	<th class="Title"><span class="Label Req">결재자1</span> </th>
	                	<td class="Value">
							&nbsp; &nbsp; 사번 <input name="APLPR_ID1" id="APLPR_ID1" title="결재자1 사번" type="text" class="TextBox" value="${USER_ID}" style="width:100px;" readonly required />
							&nbsp; &nbsp; 성명 <input name="APLPR_NM1" id="APLPR_NM1" title="결재자1 섬영" type="text" class="TextBox" value="${USER_NM}" style="width:100px;" readonly required />
						</td>
	                </tr>
					<c:forEach var="i" begin="2" end="${APRV_STEP_CFY}" step="1">
	                <tr class="Row">
	                	<th class="Title"><span class="Label Req">결재자${i}</span> </th>
	                	<td class="Value">
							&nbsp; &nbsp; 사번 <input name="APLPR_ID${i}" id="APLPR_ID${i}" title="결재자1 사번" type="text" class="TextBox" value="" style="width:100px;" readonly required />
							&nbsp; &nbsp; 성명 <input name="APLPR_NM${i}" id="APLPR_NM${i}" title="결재자1 섬영" type="text" class="TextBox" value="" style="width:100px;" readonly required />
							<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','${i}');"><span class='Wrap'><span class="Text">찾기</span></span></a>
						</td>
	                </tr>
	                </c:forEach>
                </c:if>
				<c:if test="${outcomeAplprList.size() > 0}">
					<c:forEach var="aplprList" items="${outcomeAplprList}" begin="0" end="${outcomeAplprList.size()}" step="1">
	                <tr class="Row">
	                	<th class="Title"><span class="Label Req">결재자${aplprList.APRV_SEQ}</span> </th>
	                	<td class="Value">
							&nbsp; &nbsp; 사번 <input name="APLPR_ID${aplprList.APRV_SEQ}" id="APLPR_ID${aplprList.APRV_SEQ}" title="결재자{aplprList.APRV_SEQ} 사번" type="text" class="TextBox" value="${aplprList.APLPR_ID}" style="width:100px;" readonly required />
							&nbsp; &nbsp; 성명 <input name="APLPR_NM${aplprList.APRV_SEQ}" id="APLPR_NM${aplprList.APRV_SEQ}" title="결재자{aplprList.APRV_SEQ} 섬영" type="text" class="TextBox" value="${aplprList.APLPR_NM}" style="width:100px;" readonly required />
							<c:if test="${aplprList.APRV_SEQ ne '1'}">
								<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','${aplprList.APRV_SEQ}');"><span class='Wrap'><span class="Text">찾기</span></span></a>
							</c:if>
						</td>
	                </tr>
	                </c:forEach>
				</c:if>
                </table>
			</div>
			<div class="PageButtonGroup">
				<a class="btn-m" href="javascript:fncSave() ;"><span class="Text">저장</span></a>
				<a class="btn-m" href="javascript:top.window.close() ;"><span class="Text">취소</span></a> 
			</div>			
		</div>
	</div>
</div>
</form>
</body>
</html>

