<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	var gflag = '1';
	
	$(document).ready(function () {
		$('#CHCK_STRT_DT').val('${examDetail.FM_CHCK_STRT_DT}');
		$('#CHCK_END_DT').val('${examDetail.FM_CHCK_END_DT}');
	})
	
	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "Exam_Monitoring.do"
		form.submit()
	}
	
	function fncSave (PRSTS_CFY) {
		if (!gfnChkReqValidation()) return
		if (!confirm('저장 하시겠습니까?')) return
		
		$('#PRSTS_CFY').val(PRSTS_CFY);
		
		let params = new Object()
		params.TST_UNQ_KY_VAL = $('#TST_UNQ_KY_VAL').val(); 	// 서식고유키값			
		params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); 	// 서식고유키값
		params.CHCK_STRT_DT   = $('#CHCK_STRT_DT').val(); 		// 점검시작일자
		params.CHCK_END_DT 	  = $('#CHCK_END_DT').val(); 		// 점검종료일자
		params.TITL_NM 		  = $('#TITL_NM').val(); 			// 제목명
		params.CHKPR_ID 	  = $('#CHKPR_ID').val(); 			// 확인자ID
		params.CHKPR_FNM 	  = $('#CHKPR_FNM').val(); 			// 확인자성명
		
		$.ajax({
			type: 'POST',
			url: 'Exam_Update_Ajax.do',
			data: params,
			dataType: 'JSON',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function (resultData) {
				// 성공시 메세지 출력 및 화면 재조회
				if('true' == resultData.resultCd) {
					alert(resultData.resultMsg);
					fnSearch();
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
	
	function getUserReturnValue(returnValue) {
		$('#CHKPR_ID').val(returnValue.USER_ID);
		$('#CHKPR_FNM').val(returnValue.USER_NAME);
	}	
	
	function MM_openBrWindow(theURL,winName,features, flag) {
		  gflag = flag;
		  window.open(theURL,winName,features);
	}	
</script>
<body class="no-skin real-skin" onload="dateInit();">
<form id="form" name="form" method="post">
<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="${examDetail.TST_UNQ_KY_VAL}"/>
<input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="${examDetail.FRM_UNQ_KY_VAL}"/>
<input type="hidden" name="PRSTS_CFY" id="PRSTS_CFY" value="${PRSTS_CFY}">
<input type="hidden" name="PRCDOC_CFY" id="PRCDOC_CFY" value="${PRCDOC_CFY}">
<div class="page-content">
	<div class="page-content-area">
		<!-- #ection:basics/page-header -->
		<div class="page-header">
			<h1>
				<span class="title">점검 계획 수립 수정</span>
				<span>
					<ul class="breadcrumb">
						<li>
							<a href="#">점검지A(DB화)</a>
						</li>
						<li class="active">점검 계획 수립 수정</li>
					</ul><!-- /.breadcrumb -->
				</span>
			</h1>
		</div><!-- /page-header -->
		<!-- #section:basics/page-button -->
		
		<!-- /page-button-->
		<div class="row">
			<div class="col-xs-12">
				<!-- PAGE CONTENT BEGINS -->	
				<div class="RealPanel">
						<div class="Title">
							<div class="TitleArea">
								<span class="SubTitle"></span>
							</div>
							<div class="ControlArea"><span class="Label Req">표시는 필수입력항목입니다.</span></div>
						</div>
						<div class="ContentPanel">
							<div class="GridWrite">       
								<table cellspacing="0" cellpadding="0" border="0" class="Outline">
                                <tr class="Row">
                                     <th class="Title"><span class="Label Req">절차서번호</span></th>
                                     <td class="Value">
                                     	<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" style="width:200px;"  value="${examDetail.PRCDOC_NO}" readonly>
                                     </td>
                                     <th class="Title"><span class="Label">절차서명</span></th>
                                     <td class="Value">
                                     	<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" style="width:400px;"  value="${examDetail.PRCDOC_NM}" readonly >
                                     </td>
                                </tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label">문서유형</span></th>
                                    <td class="Value">
                                    	<input name="DOC_TYP" id="DOC_TYP" title="문서유형" type="text" class="TextBox"  style="width:100px;"  value="${examDetail.DOC_TYP}" readonly>
									</td>
                                    <th class="Title"><span class="Label">개정번호</span> </th>
                                    <td class="Value">
                                    	<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" title="개정번호" type="text" class="TextBox" style="width:100px;" value="${examDetail.PRCDOC_RVSN_NO}" readonly>
									</td>
                            	</tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label">점검지명</span></th>
                                    <td class="Value" colspan=3>
                                    	<input name="ATCT_NM" id="ATCT_NM" title="문서유형" type="text" class="TextBox"  style="width:500px;" value="${examDetail.ATCT_NM}" readonly>
									</td>
                            	</tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label  Req">점검기간</span></th>
                                    <td class="Value">
										<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" title="점검시작일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
										<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_STRT_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
										~
										<input name="CHCK_END_DT" id="CHCK_END_DT" title="점검종료일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
										<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_END_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
									</td>
                                       <th class="Title"><span class="Label Req">시험명</span></th>
                                       <td class="Value">
                                       	<input name="TITL_NM" id="TITL_NM" title="시험명" type="text" class="TextBox" style="width:400px;"  value="${examDetail.TITL_NM}" required>
									</td>
                                </tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label Req">점검자</span> </th>
                                    <td class="Value" colspan="3">
                                    	<input name="CHKPR_ID" id="CHKPR_ID" type="text" class="TextBox" style="width:100px;" value='${examDetail.CHKPR_ID}' readonly>
                                    	<input name="CHKPR_FNM" id="CHKPR_FNM" title="점검자" type="text" class="TextBox" style="width:100px;" value='${examDetail.CHKPR_FNM}'  readonly required>
                                    	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','2');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                   	</td>
                                </tr>
                             	</table>
							</div>			
                            <div class="MainButtonGroup">
                                <a class="btn-m" href="javascript:fncSave('A');"><span class="Wrap"><span class="Text">저장</span></span></a>                        
								<a class="btn-m" href="javascript:history.back();"><span class="Wrap"><span class="Text">취소</span></span></a>
                    		</div>                                            						
						</div>
					</div> 										
				</div>							
				<!-- PAGE CONTENT ENDS -->
			</div><!-- /.col -->
		</div><!-- /.row -->
	</div><!-- /.page-content-area -->
</form>
</body>
</html>