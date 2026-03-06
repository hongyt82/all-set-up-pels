<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	var gflag = '1';
	
	$(document).ready(function () {
		// 초기값 세팅
		$('#TST_UNQ_KY_VAL').val('${examDetail.TST_UNQ_KY_VAL}');
		$('#FRM_UNQ_KY_VAL').val('${examDetail.FRM_UNQ_KY_VAL}');
		
		$('#CHCK_STRT_DT').val('${examDetail.CHCK_STRT_DT}');
		$('#CHCK_END_DT').val('${examDetail.CHCK_END_DT}');
		
		$('#PRCDOC_NO').val('${examDetail.PRCDOC_NO}');
		$('#PRCDOC_NM').val('${examDetail.PRCDOC_NM}');
		$('#DOC_TYP').val('${examDetail.DOC_TYP}');
		$('#PRCDOC_RVSN_NO').val('${examDetail.PRCDOC_RVSN_NO}');
		
		$('#TITL_NM').val('${examDetail.TITL_NM}');
		
		$('#CHKPR_ID').val('${examDetail.CHKPR_ID}');
		$('#CHKPR_FNM').val('${examDetail.CHKPR_FNM}');
		
		$('#CNMR_ID').val('${examDetail.CNMR_ID}');
		$('#CNMR_FNM').val('${examDetail.CNMR_FNM}');
		$('#ATWT_ID').val('${examDetail.ATWT_ID}');
		$('#ATWT_FNM').val('${examDetail.ATWT_FNM}');
		
		$('#WRKOR_NO').val('${examDetail.WRKOR_NO}');
		$('#ATWT_PPL_CNT').val('${examDetail.ATWT_PPL_CNT}');
		$('#ATWT_RQST_YN').val('${examDetail.ATWT_RQST_YN}');
		$('#PRSTS_CFY').val('${examDetail.PRSTS_CFY}');
		
		$('#REGPR_NM').val('${examDetail.REGPR_NM}');
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
		let formData = new FormData()
		
		/*
		params.TST_UNQ_KY_VAL = $('#TST_UNQ_KY_VAL').val(); // 서식고유키값			
		params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); // 서식고유키값
		params.CHCK_STRT_DT   = $('#CHCK_STRT_DT').val(); 	// 점검시작일자
		params.CHCK_END_DT 	  = $('#CHCK_END_DT').val(); 	// 점검종료일자
		params.TITL_NM 		  = $('#TITL_NM').val(); 		// 제목명
		
		params.CHKPR_ID 	  = $('#CHKPR_ID').val(); 	// 점검자ID
		params.CHKPR_FNM 	  = $('#CHKPR_FNM').val(); 	// 점검자성명
		params.CNMR_ID 	  	  = $('#CNMR_ID').val(); 	// 확인자ID
		params.CNMR_FNM 	  = $('#CNMR_FNM').val(); 	// 확인자성명
		params.ATWT_ID 	  	  = $('#ATWT_ID').val(); 	// 입회자ID
		params.ATWT_FNM 	  = $('#ATWT_FNM').val(); 	// 입회자성명
		
		params.WRKOR_NO 	  = $('#WRKOR_NO').val(); 		// 작업오더번호
		params.ATWT_PPL_CNT   = $('#ATWT_PPL_CNT').val(); 	// 입회인원수
		params.ATWT_RQST_YN   = $('#ATWT_RQST_YN').val(); 	// 입회요청여부 
		params.PRSTS_CFY 	  = $('#PRSTS_CFY').val(); 		// 진행상태구분

		//params.ATFL_TITL_NM1  = $('#ATFL_TITL_NM1').val(); 		// 서식 제목
		params.ATFL_FILE1 	  = $('#ATFL_FILE1')[0].files[0]; 	// 서식 첨부1

		*/
		
		formData.append('TST_UNQ_KY_VAL', $('#TST_UNQ_KY_VAL').val());	// 서식고유키값	
		formData.append('FRM_UNQ_KY_VAL', $('#FRM_UNQ_KY_VAL').val());	// 서식고유키값
		formData.append('CHCK_STRT_DT'  , $('#CHCK_STRT_DT').val());	// 점검시작일자
		formData.append('CHCK_END_DT'	, $('#CHCK_END_DT').val());		// 점검종료일자
		formData.append('TITL_NM'		, $('#TITL_NM').val());			// 제목명
		
		formData.append('CHKPR_ID' , $('#CHKPR_ID').val());			// 점검자ID	
		formData.append('CHKPR_FNM', $('#CHKPR_FNM').val());		// 점검자성명
		formData.append('CNMR_ID'  , $('#CNMR_ID').val());			// 확인자ID
		formData.append('CNMR_FNM' , $('#CNMR_FNM').val());			// 확인자성명
		formData.append('ATWT_ID'  , $('#ATWT_ID').val());			// 입회자ID
		formData.append('ATWT_FNM' , $('#ATWT_FNM').val());			// 입회자성명
		
		formData.append('WRKOR_NO'     , $('#WRKOR_NO').val());			// 작업오더번호	
		formData.append('ATWT_PPL_CNT' , $('#ATWT_PPL_CNT').val());		// 입회인원수
		formData.append('ATWT_RQST_YN' , $('#ATWT_RQST_YN').val());		// 입회요청여부ID
		formData.append('PRSTS_CFY'    , $('#PRSTS_CFY').val());		// 진행상태구분
		
		formData.append('ATFL_FILE1', $('#ATFL_FILE1')[0].files[0]);	// 첨부파일
		
		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: 'Exam_Update_Ajax.do',
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
	
	function getUserReturnValue(returnValue) {
		if(gflag == 2) {
			$('#CHKPR_ID').val(returnValue.USER_ID);
			$('#CHKPR_FNM').val(returnValue.USER_NAME);
		} else if(gflag == 3) {
			$('#CNMR_ID').val(returnValue.USER_ID);
			$('#CNMR_FNM').val(returnValue.USER_NAME);
		} else if(gflag == 4) {
			$('#ATWT_ID').val(returnValue.USER_ID);
			$('#ATWT_FNM').val(returnValue.USER_NAME);
		}
		
	}	
	
	function MM_openBrWindow(theURL,winName,features, flag) {
		  gflag = flag;
		  window.open(theURL,winName,features);
	}
	
</script>
<body class="no-skin real-skin" onload="dateInit();">
<form id="form" name="form" method="post" enctype="multipart/form-data">
<input name="PRSTS_CFY" id="PRSTS_CFY" title="진행상태구분" type="hidden" class="TextBox" style="width:100px;">
<input name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" type="hidden" value=""/>
<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" value=""/>
<input type="hidden" name="PRCDOC_CFY" id="PRCDOC_CFY" value="${PRCDOC_CFY}">
<div class="page-content">
	<div class="page-content-area">
		<!-- #ection:basics/page-header -->
	<div class="page-header">
		<h1>
			<span class="title">정주기시험 준비/수행 수정</span>
			<span>
				<ul class="breadcrumb">
					<li>
						<a href="#">정주기시험</a>
					</li>
					<li>
						<a href="#">정주기시험 준비/수행</a>
					</li>
					<li class="active">정주기시험 준비/수행 수정</li>
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
                                          <th class="Title"><span class="Label Req">시험명
                                          </span></th>
                                          <td class="Value"><input name="TITL_NM" id="TITL_NM" title="제목명" type="text" class="TextBox" style="width:400px;" required>
										</td>
                                      </tr>
                                      <tr class="Row">
                                          <th class="Title"><span class="Label Req">점검자</span> </th>
                                          <td class="Value">
                                          	<input name="CHKPR_ID" id="CHKPR_ID" type="text" class="TextBox" style="width:100px;" value='${CHKPR_ID}' readonly>
                                     	<input name="CHKPR_FNM" id="CHKPR_FNM" title="점검자" type="text" class="TextBox" style="width:100px;" value='${CHKPR_FNM}'  readonly required>
                                     	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','2');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                    	</td>
                                     <th class="Title"><span class="Label">오더번호</span> </th>
                                     <td class="Value">
                                          <input name="WRKOR_NO" id="WRKOR_NO" title="오더번호" type="text" class="TextBox" style="width:200px;">
                                     </td>
                                 </tr>
                                 <tr class="Row">
                                     <th class="Title"><span class="Label">확인자</span> </th>
                                     <td class="Value">
                                     	<input name="CNMR_ID" id="CNMR_ID" type="text" class="TextBox" style="width:100px;" value='${CNMR_ID}' readonly>
                                     	<input name="CNMR_FNM" id="CNMR_FNM" title="확인자" type="text" class="TextBox" style="width:100px;" value='${CNMR_FNM}'  readonly required>
                                        	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','3');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                       	</td>
                                        <th class="Title"><span class="Label">입회여부</span> </th>
                                        <td class="Value">
											<select name="ATWT_RQST_YN" id="ATWT_RQST_YN" title="입회여부"  required>
												<option value="N">입회없음</option>
												<option value="Y">입회있음</option>
											</select>
                                        	&nbsp; 입회자 <input name="ATWT_ID" id="ATWT_ID" type="text" class="TextBox" style="width:100px;" value='${ATWT_ID}' readonly>
                                     	<input name="ATWT_FNM" id="ATWT_FNM" title="입회자" type="text" class="TextBox" style="width:100px;" value='${ATWT_FNM}'  readonly>
                                     	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','4');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                     </td>
                                 </tr>
                                 
								<tr class="Row">                                  			  
									<th class="Title"><span class="Label">PDF 첨부</span></th>
									<td class="Value">
									<input name="ATFL_FILE1" id="ATFL_FILE1" title="서식1 파일" type="file" />
									</td>             
									<th class="Title"><span class="Label">PDF 보기</span></th>                                         
									<td class="Value">
										<c:if test="${not empty examDetail.ATFL_PHCL_NM1}">
										<a href="javascript:MM_openBrWindow('<%=request.getContextPath()%>/upload/${examDetail.ATFL_PHCL_NM1}','','width='+ screen.width + ',height=' +  screen.height);">
										    <img src="/resources/themes/QuartzLight/Skins/Image/pdf.png" height="21px;">
										</a>
										[파일명 : ${examDetail.ATFL_ORSRC_NM}]
										</c:if>
									</td>
								</tr>                              
                             </table>
						</div>			
                              <div class="MainButtonGroup">
                                  <a class="btn-m" href="javascript:fncSave('A');"><span class="Wrap"><span class="Text">작업허가</span></span></a>                        
                                  <a class="btn-m" href="javascript:fncSave('R');"><span class="Wrap"><span class="Text">저장</span></span></a>                        
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