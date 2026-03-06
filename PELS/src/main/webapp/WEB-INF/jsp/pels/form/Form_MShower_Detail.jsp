<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); // 서식고유키값
			params.UNQ_ID = $('#UNQ_ID').val(); // 관리번호
			params.UNQ_ID_NEW = $('#UNQ_ID_NEW').val(); // 관리번호
			params.TH1_ITM_NM = $('#TH1_ITM_NM').val(); // 대분류
			params.TH2_ITM_NM = ""; // 중분류
			params.TH3_ITM_NM = ""; // 소분류
			
			$.ajax({
				type: 'POST',
				url: 'Form_Manage_Update_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Form_Manage_Search.do?FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}&ATCT_CFY=${ATCT_CFY}';
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
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">FME 순찰 관리조 점검표 등록</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">절차서(서식)관리</a>
										</li>
                                        <li>
                                            <a href="#">점검관리(붙임)</a>
                                        </li>
                                        <li>
                                            <a href="/Form_Manage_Search.do?FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}">FME 순찰 관리조 점검표</a>
                                        </li>
										<li class="active">FME 순찰 관리조 점검표 등록</li>
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
												<colgroup>
													<col class="Title" />
													<col style="width:30%" />
													<col class="Title" />
													<col style="width:70%" />
												</colgroup>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label">절차서번호</span> </th>
                                                        <td class="Value">
															<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" title="서식고유키값" type="hidden" class="TextBox" value=""/>
															<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="" style="width:200px;" readonly/>
														</td>
                                                        <th class="Title"><span class="Label">절차서명</span></th>
                                                        <td class="Value">
															<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" value="" style="width:90%;" readonly/>
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label Req">관리번호</span></th>
                                                        <td class="Value">
															<input name="UNQ_ID" id="UNQ_ID" title="대분류" type="hidden" class="TextBox" value="${UNQ_ID}" style="width:200px;" required/>
															<input name="UNQ_ID_NEW" id="UNQ_ID_NEW" title="대분류" type="text" class="TextBox" value="${UNQ_ID}" style="width:200px;" required/>
														</td>
                                                        <th class="Title"><span class="Label">점검구역</span> </th>
                                                        <td class="Value">
															<input name="TH1_ITM_NM" id="TH1_ITM_NM" title="중분류" type="text" class="TextBox" value="${TH1_ITM_NM}" style="width:90%;" />
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