<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#FRM_UNQ_KY_VAL').val('$CNIF_YN');
		})
		
		function fnSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('저장 하시겠습니까?')) return
			
			let params = new Object()
			params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); // 서식고유키값
			params.FRM_ID = $('#FRM_ID').val(); 				// 이폼서식ID
			params.TITL_NM = $('#TITL_NM').val(); 				// 제목명
			params.TH1_ITM_NM = $('#TH1_ITM_NM').val(); 		// 1번째항목명
			params.TH2_ITM_NM = $('#TH2_ITM_NM').val(); 		// 2번째항목명
			params.TH3_ITM_NM = $('#TH3_ITM_NM').val(); 		// 3번째항목명
			params.STDVL_VAL_NM = $('#STDVL_VAL_NM').val(); 	// 기준치
			params.UNIT_NM = $('#UNIT_NM').val(); 				// 단위
			params.CNIF_YN = $('#CNIF_YN').val(); 				// 연계여부
			params.CNIF_TAG_NM = $('#CNIF_TAG_NM').val(); 		// 연계태그명
			
			$.ajax({
				type: 'POST',
				url: 'Form_Id_Update_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Form_Id_Search.do?FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}';
					} else {
						alert('폼ID 저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('폼ID 저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
	</script>
	<body class="no-skin real-skin">
		<form id="form" name="form" method="post">
		<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" title="서식고유키값" type="hidden" class="TextBox" value="${FRM_UNQ_KY_VAL}"/>
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">폼ID관리 등록</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">절차서(서식)관리</a>
										</li>
                                        <li>
                                            <a href="${subTitleUrl}">${subTitle}</a>
                                        </li>
                                        <li>
                                            <a href="Form_Id_Search.do?FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}">폼ID관리</a>
                                        </li>
										<li class="active">폼ID관리 등록</li>
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
															<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="${PRCDOC_NO}" style="width:200px;" readonly/>
														</td>
                                                        <th class="Title"><span class="Label">절차서명</span></th>
                                                        <td class="Value">
															<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" value="${PRCDOC_NM}" style="width:90%;" readonly/>
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label Req">서식ID</span></th>
                                                        <td class="Value">
															<input name="FRM_ID" id="FRM_ID" title="이폼서식ID" type="text" class="TextBox" value="${FRM_ID}" style="width:200px;" required />
														</td>
                                                        <th class="Title"><span class="Label Req">제목</span> </th>
                                                        <td class="Value">
															<input name="TITL_NM" id="TITL_NM" title="제목명" type="text" class="TextBox" value="${TITL_NM}" style="width:90%;" required />
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label">1번째항목명</span></th>
                                                        <td class="Value">
															<input name="TH1_ITM_NM" id="TH1_ITM_NM" title="1번째항목명" type="text" class="TextBox" value="${TH1_ITM_NM}" style="width:90%;" />
														</td>
                                                        <th class="Title"><span class="Label">2번째항목명</span> </th>
                                                        <td class="Value">
															<input name="TH2_ITM_NM" id="TH2_ITM_NM" title="2번째항목명" type="text" class="TextBox" value="${TH2_ITM_NM}" style="width:400px;" />
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label">3번째항목명</span></th>
                                                        <td class="Value">
															<input name="TH3_ITM_NM" id="TH3_ITM_NM" title="3번째항목명" type="text" class="TextBox" value="${TH3_ITM_NM}" style="width:90%;" />
														</td>
                                                        <th class="Title"><span class="Label">기준치값설명</span> </th>
                                                        <td class="Value">
															<input name="STDVL_VAL_NM" id="STDVL_VAL_NM" title="기준치값설명" type="text" class="TextBox" value="${STDVL_VAL_NM}" style="width:200px;"/>
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label">단위</span></th>
                                                        <td class="Value">
															<input name="UNIT_NM" id="UNIT_NM" title="단위" type="text" class="TextBox" value="${UNIT_NM}" style="width:200px;"/>
														</td>
                                                        <th class="Title"><span class="Label">연계여부</span></th>
                                                        <td class="Value">
															<select name="CNIF_YN" id="CNIF_YN" title="연계여부" style="width:100px;">
																<option value="Y">연계</option>
																<option value="N">미연계</option>
															</select>															
															연계태그명<input name="CNIF_TAG_NM" id="CNIF_TAG_NM" title="연계태그명" type="text" class="TextBox" value="${CNIF_TAG_NM}" style="width:200px;"/>
														</td>
                                                    </tr>
                                                </table>
											</div>			
                                            <div class="MainButtonGroup">
                                                <a class="btn-m" href="javascript:fnSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
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