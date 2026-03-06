<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#REGPR_NM').val('${REGPR_NM}');
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			var AUCR_YN = 'N';
			if($('#AUCR_YN').is(':checked'))
				AUCR_YN = 'Y'
			
			let params = new Object()
			params.PRCDOC_NO = $('#PRCDOC_NO').val(); // 절차서번호
			params.PRCDOC_NM = $('#PRCDOC_NM').val(); // 절차서명
			params.DOC_TYP = $('#DOC_TYP').val(); // 문서유형
			params.DOC_PART_NO = $('#DOC_PART_NO').val(); // 문서부분번호
			params.RRD_CFY = $('#RRD_CFY').val(); // 주기
			params.FNCLC_ID = $('#FNCLC_ID').val(); 
			params.ATCT_NM = $('#ATCT_NM').val();
			params.PRCDOC_CFY = $('#PRCDOC_CFY').val(); 
			params.MNTRG_YN = $('#MNTRG_YN').val(); 
			params.AUCR_YN = AUCR_YN;
			params.APRV_YN_CFY = $('#APRV_YN_CFY').val();
			params.APRV_STEP_CFY = $('#APRV_STEP_CFY').val();
			
			$.ajax({
				type: 'POST',
				url: 'Proc_Insert_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.PRCDOC_NO.value = "";
						form.PRCDOC_NM.value = "";
						form.action = "Proc_Search.do"
						form.submit()
					} else {
						alert('절차서 저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('절차서 저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
		
		function checkAPRV_YN_CFY()
		{
			if($('#APRV_YN_CFY').val() == 'Y') {
				$('#APRV_STEP_CFY').css("visibility", "visible");
			}
			else {
				$('#APRV_STEP_CFY').css("visibility", "hidden");
			}
		}		
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
	<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" class="TextBox" value="${PRCDOC_CFY}" />
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<span class="title">절차서 등록</span>
						<span>
							<ul class="breadcrumb">
								<li>
									<a href="#">시스템관리</a>
								</li>
                                      <li>
                                          <a href="Proc_Search.do">절차서관리</a>
                                      </li>
								<li class="active">절차서 등록</li>
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
                                            <th class="Title"><span class="Label Req">절차서번호</span> </th>
                                            <td class="Value">
												<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="" style="width:200px;" required />
											</td>
                                            <th class="Title"><span class="Label Req">절차서명</span></th>
                                            <td class="Value">
												<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" value="" style="width:90%;" required />
											</td>
                                        </tr>
                                        <tr class="Row">
                                             <th class="Title"><span class="Label Req">문서유형</span></th>
                                             <td class="Value">
												<input name="DOC_TYP" id="DOC_TYP" title="문서유형" type="text" class="TextBox" value="" style="width:100px;" required />
                                             </td>
                                             <th class="Title"><span class="Label Req">문서부분번호</span> </th>
                                             <td class="Value">
                                             	<input name="DOC_PART_NO" id="DOC_PART_NO" title="문서부분번호" type="text" class="TextBox" value="" style="width:80px;" required />
											 </td>
                                        </tr>
                                  		<tr class="Row">
                                            <th class="Title"><span class="Label ">기능위치</span></th>
                                            <td class="Value">
												<input name="FNCLC_ID" id="FNCLC_ID" title="기능위치" type="text" class="TextBox" value="" style="width:200px;"  />
											</td>
                                            <th class="Title"><span class="Label Req">주기</span></th>
                                            <td class="Value">
												<select name="RRD_CFY" id="RRD_CFY" title="주기" style="width:100px;" required >
													<option value="일">일</option>
													<option value="주">주</option>
													<option value="월">월</option>
													<option value="월2">월(1,16일)</option>
													<option value="분기">분기</option>
													<option value="년">년</option>
													<option value="OH">OH</option>
													<option value="기타">기타</option>
												</select>		
												<c:if test="${PRCDOC_CFY eq 'M'}">
												<input name="AUCR_YN" id="AUCR_YN" type="checkbox"> 자동생성 [주 또는 월만 가능합니다]
												</c:if>
											</td>
										</tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label Req">모니터링</span> </th>
                                            <td class="Value">
												<select name="MNTRG_YN" id="MNTRG_YN" title="모니터링" style="width:100px;"  >
													<option value="N">없음</option>
													<option value="Y">모니터링</option>
												</select>															
                                            </td>
                                            <th class="Title"><span class="Label Req">결재여부</span></th>
                                            <td class="Value">
												<select name="APRV_YN_CFY" id="APRV_YN_CFY" title="결재여부"  onchange="javascript:checkAPRV_YN_CFY();" style="width:100px;"  >
													<option value="N">결재없음</option>
													<option value="Y">결재</option>
												</select>
												<select name="APRV_STEP_CFY" id="APRV_STEP_CFY" title="결재단계" style="width:100px;visibility:hidden;"  >
													<option value="2">2단계</option>
													<option value="3">3단계</option>
													<option value="4">4단계</option>
												</select>	
										  </td>
                                        </tr>
										<c:if test="${PRCDOC_CFY eq 'M'}">
                                        <tr class="Row">
	                                        <th class="Title"><span class="Label Req">붙임명</span> </th>
	                                        <td class="Value"  colspan=3>
												<input name="ATCT_NM" id="ATCT_NM" title="붙임명" type="text" class="TextBox" value="" style="width:90%;" required />
											</td>
                                        </tr>
                                        </c:if>
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