<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			// 초기값 세팅
			$('#TST_UNQ_KY_VAL').val('${TST_UNQ_KY_VAL}');
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
			
			$('#CHCK_STRT_DT').val('${CHCK_STRT_DT}');
			$('#CHCK_END_DT').val('${CHCK_END_DT}');
			
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			$('#DOC_TYP').val('${DOC_TYP}');
			$('#PRCDOC_RVSN_NO').val('${PRCDOC_RVSN_NO}');
			
			$('#TITL_NM').val('${TITL_NM}');
			$('#CHKPR_ID').val('${CHKPR_ID}');
			$('#CHKPR_FNM').val('${CHKPR_FNM}');
			$('#WRKOR_NO').val('${WRKOR_NO}');
			$('#ATWT_PPL_CNT').val('${ATWT_PPL_CNT}');
			$('#ATWT_RQST_YN').val('${ATWT_RQST_YN}');
			$('#PRSTS_CFY').val('${PRSTS_CFY}');
			
			$('#REGPR_NM').val('${REGPR_NM}');
		})
		
		function fncSave (PRSTS_CFY) {
			if (!gfnChkReqValidation()) return
			
			if(PRSTS_CFY == 'A') {
				if (!confirm('시험허가을 승인 하시겠습니까?')) return
			}
			else {
				if (!confirm('저장 하시겠습니까?')) return
			}
			
			$('#PRSTS_CFY').val(PRSTS_CFY);
			
			let params = new Object()
			params.TST_UNQ_KY_VAL = $('#TST_UNQ_KY_VAL').val(); // 서식고유키값			
			params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); // 서식고유키값
			params.CHCK_STRT_DT   = $('#CHCK_STRT_DT').val(); // 점검시작일자
			params.CHCK_END_DT 	  = $('#CHCK_END_DT').val(); // 점검종료일자
			params.TITL_NM 		  = $('#TITL_NM').val(); // 제목명
			params.CHKPR_ID 	  = $('#CHKPR_ID').val(); // 점검자ID
			params.CHKPR_FNM 	  = $('#CHKPR_FNM').val(); // 점검자성명
			params.WRKOR_NO 	  = $('#WRKOR_NO').val(); // 작업오더번호
			params.ATWT_PPL_CNT   = $('#ATWT_PPL_CNT').val(); // 입회인원수
			params.ATWT_RQST_YN   = $('#ATWT_RQST_YN').val(); // 입회요청여부 
			params.PRSTS_CFY 	  = $('#PRSTS_CFY').val(); // 진행상태구분
			
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
						location.href = '/Exam_Search.do';
					} else {
						alert('시험(점검)준비 등록에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('시험(점검)준비 등록에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
			<form id="form" name="form" method="post">
                <input name="PRSTS_CFY" id="PRSTS_CFY" title="진행상태구분" type="text" class="TextBox" style="width:100px;">
               	<input name="REGPR_NM" id="REGPR_NM" title="담당자" type="text" class="TextBox" style="width:100px;" readonly>
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">시험(점검)준비 등록</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">시험(점검)관리</a>
										</li>
                                        <li>
                                            <a href="/Exam_Search.do">시험(점검)준비</a>
                                        </li>
										<li class="active">시험(점검)준비 등록</li>
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
                                                        <th class="Title"><span class="Label  Req">시험기간</span></th>
                                                        <td class="Value">
														<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" title="점검시작일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_STRT_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
														~
														<input name="CHCK_END_DT" id="CHCK_END_DT" title="점검종료일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_END_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
														</td>
                                                        <th class="Title"><span class="Label Req">제목명</span></th>
                                                        <td class="Value"><input name="TITL_NM" id="TITL_NM" title="제목명" type="text" class="TextBox" style="width:400px;" required>
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label Req">절차서번호</span></th>
                                                        <td class="Value">
                                                        	<input name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" title="시험고유키값" type="hidden" class="TextBox" value=""/>
                                                        	<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" title="서식고유키값" type="hidden" class="TextBox" value=""/>
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
                                                        <th class="Title"><span class="Label Req">점검자</span> </th>
                                                        <td class="Value">
                                                        	<input name="CHKPR_ID" id="CHKPR_ID" type="hidden" class="TextBox">
                                                        	<input name="CHKPR_FNM" id="CHKPR_FNM" title="점검자" type="text" class="TextBox" style="width:100px;" required>
                                                       	</td>
                                                        <th class="Title"><span class="Label">오더번호</span> </th>
                                                        <td class="Value">
                                                             <input name="WRKOR_NO" id="WRKOR_NO" title="오더번호" type="text" class="TextBox" style="width:200px;">
                                                        </td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label">입회인원수</span> </th>
                                                        <td class="Value">
                                                             <input name="ATWT_PPL_CNT" id="ATWT_PPL_CNT" title="입회인원수" type="text" class="TextBox" style="width:100px;">
                                                        </td>
                                                        <th class="Title"><span class="Label Req">입회여부</span></th>
                                                        <td class="Value">
															<select name="ATWT_RQST_YN" id="ATWT_RQST_YN" title="입회여부"  required>
																<option value="Y">입회있음</option>
																<option value="N">입회없음</option>
															</select>
															<a class="SubButton"><span class='Wrap'><span class="Text">입회자등록</span></span></a>
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