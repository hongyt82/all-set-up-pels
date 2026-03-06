<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	var gflag = '1';
	$(document).ready(function () {
		// 초기값 세팅
		$('#CHCK_STRT_DT').val('${CHCK_STRT_DT}');
		$('#CHCK_END_DT').val('${CHCK_END_DT}');
		$('#REGPR_NM').val('${REGPR_NM}');
	})
	
	function fncSave () {
		if (!gfnChkReqValidation()) return
		
		if (!confirm('등록하시겠습니까?')) return
		
		let params = new Object()
					
		params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); // 서식고유키값
		params.CHCK_STRT_DT   = $('#CHCK_STRT_DT').val(); 	// 점검시작일자
		params.CHCK_END_DT 	  = $('#CHCK_END_DT').val(); 	// 점검종료일자
		params.TITL_NM 		  = $('#TITL_NM').val(); 		// 제목명
		params.CHKPR_ID 	  = $('#CHKPR_ID').val(); 		// 점검자ID
		params.CHKPR_FNM 	  = $('#CHKPR_FNM').val(); 		// 점검자성명
		params.WRKOR_NO 	  = $('#WRKOR_NO').val(); 		// 작업오더번호
		params.ATWT_PPL_CNT   = $('#ATWT_PPL_CNT').val(); 	// 입회인원수
		params.ATWT_RQST_YN   = $('#ATWT_RQST_YN').val(); 	// 입회요청여부
		params.PRSTS_CFY 	  = $('#PRSTS_CFY').val(); 		// 진행상태구분
		params.ATCT_CFY 	  = $('#ATCT_CFY').val(); 		// Form 구분
		
		$.ajax({
			type: 'POST',
			url: 'Exam_Insert_Ajax.do',
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
	
	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "Exam_Monitoring.do"
		form.submit()
	}
	
	// 팝업 오픈
	function MM_openBrWindow(theURL,winName,features,flag) { //v2.0
		gflag = flag;
	  	window.open(theURL,winName,features);
	}
	
	// 팝업 선택된 값 세팅
	function getReturnValue(returnValue) {
		$('#FRM_UNQ_KY_VAL').val(returnValue.FRM_UNQ_KY_VAL);
		$('#PRCDOC_NO').val(returnValue.PRCDOC_NO);
		$('#PRCDOC_NM').val(returnValue.PRCDOC_NM);
		$('#DOC_TYP').val(returnValue.DOC_TYP);
		$('#PRCDOC_RVSN_NO').val(returnValue.PRCDOC_RVSN_NO);
		$('#ATCT_NM').val(returnValue.ATCT_NM);
		$('#ATCT_CFY').val(returnValue.ATCT_CFY);
		//alert(returnValue.ATCT_CFY);
	}
	
	function getUserReturnValue(returnValue) {
		if(gflag == 2) {
			$('#CHKPR_ID').val(returnValue.USER_ID);
			$('#CHKPR_FNM').val(returnValue.USER_NAME);
		}
	}

	
</script>

<body class="no-skin real-skin" onload="dateInit();">
<form id="form" name="form" method="post">
<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" value=""/>
<input name="ATCT_CFY" id="ATCT_CFY" type="hidden" value=""/>
<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" value="${PRCDOC_CFY}"/>
<input name="PRSTS_CFY" id="PRSTS_CFY" type="hidden" value="<c:if test="${'P' eq PRCDOC_CFY}">R</c:if><c:if test="${'M' eq PRCDOC_CFY}">A</c:if>"/>
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">점검 계획 수립 등록</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">점검지A(DB화)</a>
							</li>
							<li class="active">점검 계획 수립 등록</li>
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
	                                	<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" style="width:200px;" readonly> 
	                                	<a href="javascript:MM_openBrWindow('Form_Popup.do?PRCDOC_CFY=${PRCDOC_CFY}','','width=1000,height=600','1');" class="InfoButton">
	                                		<span class='Wrap'>
	                                			<span class="Text">절차서선택</span>
	                                		</span>
	                                	</a> 
	                                </td>
	                                <th class="Title"><span class="Label">절차서명</span></th>
	                                <td class="Value"><input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" style="width:400px;" readonly ></td>
	                            </tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label">문서유형</span></th>
                                    <td class="Value"><input name="DOC_TYP" id="DOC_TYP" title="문서유형" type="text" class="TextBox"  style="width:100px;" readonly>
									</td>
                                    <th class="Title"><span class="Label">개정번호</span> </th>
                                    <td class="Value"><input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" title="개정번호" type="text" class="TextBox" style="width:100px;" readonly>
									</td>
                                </tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label">점검지명</span></th>
                                    <td class="Value" colspan=3>
                                    	<input name="ATCT_NM" id="ATCT_NM" title="문서유형" type="text" class="TextBox"  style="width:500px;" value="" readonly>
									</td>
                            	</tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label  Req">
                                    <c:if test="${'P' eq PRCDOC_CFY}">시험기간</c:if>
                                    <c:if test="${'M' eq PRCDOC_CFY}">점검기간</c:if>
                                          </span></th>
                                          <td class="Value">
											<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" title="점검시작일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
											<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_STRT_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
											~
											<input name="CHCK_END_DT" id="CHCK_END_DT" title="점검종료일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
											<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_END_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
											</td>
                                          <th class="Title"><span class="Label Req">
                                          <c:if test="${'P' eq PRCDOC_CFY}">시험명</c:if>
                                    <c:if test="${'M' eq PRCDOC_CFY}">점검명</c:if>
                                    </span></th>
                                    <td class="Value"><input name="TITL_NM" id="TITL_NM" title="제목명" type="text" class="TextBox" style="width:400px;" required>
									</td>
                                </tr>
                                <tr class="Row">
                                    <th class="Title"><span class="Label Req">점검자</span> </th>
                                    <td class="Value" colspan="3">
                                    	<input name="CHKPR_ID" id="CHKPR_ID" type="text" class="TextBox" style="width:100px;" value='${CHKPR_ID}' readonly>
                                    	<input name="CHKPR_FNM" id="CHKPR_FNM" title="점검자" type="text" class="TextBox" style="width:100px;" value='${CHKPR_FNM}'  readonly required>
                                    	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','2');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                   	</td>
                                </tr>
                                </table>
							</div>			
                            <div class="MainButtonGroup">
                            	<a class="btn-m" href="javascript:fncSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
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