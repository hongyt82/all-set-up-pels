<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#REGPR_NM').val('${REGPR_NM}');
		})
		
		function fnSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let formData = new FormData()
			formData.append('PRCDOC_CFY'   , $('#PRCDOC_CFY').val()); 	 			// 정주기, 점검지 구분
			formData.append('PRCDOC_UNQ_KY_VAL', $('#PRCDOC_UNQ_KY_VAL').val()); 	// 절차서고유키값
			formData.append('PRCDOC_RVSN_NO'   , $('#PRCDOC_RVSN_NO').val()); 	 	// 절차서개정번호
			
			formData.append('ATFL_TITL_NM1', $('#ATFL_TITL_NM1').val()); // 서식1 제목
			formData.append('ATFL_TITL_NM2', $('#ATFL_TITL_NM2').val()); // 서식2 제목
			formData.append('ATFL_TITL_NM3', $('#ATFL_TITL_NM3').val()); // 서식3 제목
			formData.append('ATFL_TITL_NM4', $('#ATFL_TITL_NM4').val()); // 서식4 제목
			formData.append('ATFL_TITL_NM5', $('#ATFL_TITL_NM5').val()); // 서식5 제목
			
			formData.append('ATFL_FILE1', $('#ATFL_FILE1')[0].files[0]); // 서식 첨부1
			formData.append('ATFL_FILE2', $('#ATFL_FILE2')[0].files[0]); // 서식 첨부2
			formData.append('ATFL_FILE3', $('#ATFL_FILE3')[0].files[0]); // 서식 첨부3
			formData.append('ATFL_FILE4', $('#ATFL_FILE4')[0].files[0]); // 서식 첨부4
			formData.append('ATFL_FILE5', $('#ATFL_FILE5')[0].files[0]); // 서식 첨부5
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Form_Insert_Ajax.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						fnParent();	
					} else {
						alert('정주기시험 서식 저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('정주기시험 서식 저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}
		
		// 팝업 선택된 값 세팅
		function getReturnValue(returnValue) {
			$('#PRCDOC_UNQ_KY_VAL').val(returnValue.PRCDOC_UNQ_KY_VAL);
			$('#PRCDOC_NO').val(returnValue.PRCDOC_NO);
			$('#PRCDOC_NM').val(returnValue.PRCDOC_NM);
			$('#DOC_TYP').val(returnValue.DOC_TYP);
			$('#RRD_CFY').val(returnValue.RRD_CFY);
		}
		
		function fnParent() {
			let form = document.getElementById('form')
			form.PRCDOC_NO.value = "";
			form.PRCDOC_NM.value = "";
			form.action = "Proc_Search.do";
			form.submit()
		}		
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post" enctype="multipart/form-data">
	<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" class="TextBox" value="${PRCDOC_CFY}"/>
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<span class="title">정주기시험 등록</span>
						<span>
							<ul class="breadcrumb">
								<li>
									<a href="#">절차서(서식)관리</a>
								</li>
                                <li>
                                    <a href="Form_Search.do">정주기시험</a>
                                </li>
								<li class="active">정주기시험 등록</li>
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
														<input name="PRCDOC_UNQ_KY_VAL" id="PRCDOC_UNQ_KY_VAL" type="hidden" class="TextBox" value="${PRCDOC_UNQ_KY_VAL}"/>
														<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="${PRCDOC_NO}" style="width:200px;" required readonly/>
														<a href="javascript:MM_openBrWindow('Proc_Popup.do','','width=1000,height=600');" class="SubButton">
															<span class="Wrap">
																<span class="Text">절차서선택</span>
															</span>
														</a>
													  </td>
                                                      <th class="Title"><span class="Label Req">절차서명</span></th>
                                                      <td class="Value">
														<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" value="${PRCDOC_NM}" style="width:90%;" readonly/>
													  </td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">문서유형</span></th>
                                                      <td class="Value">
														<input name="DOC_TYP" id="DOC_TYP" title="문서유형" type="text" class="TextBox" value="${DOC_TYP}" style="width:100px;" readonly/>
													  </td>
                                                      <th class="Title"><span class="Label Req">개정번호</span> </th>
                                                      <td class="Value">
														<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" title="개정번호" type="text" class="TextBox" value="" style="width:80px;" required />
													  </td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">주기</span></th>
                                                      <td class="Value">
														<input name="RRD_CFY" id="RRD_CFY" title="주기" type="text" class="TextBox" value="${RRD_CFY}" style="width:100px;" readonly/>
													  </td>
                                                      <th class="Title"><span class="Label Req">등록자</span> </th>
                                                      <td class="Value">
														<input name="REGPR_NM" id="REGPR_NM" title="등록자" type="text" class="TextBox" value="${REGPR_NM}" style="width:80px;" readonly />
													  </td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">서식1 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL_NM1" id="ATFL_TITL_NM1" title="서식1 제목" type="text" class="TextBox" value="" style="width:200px;" required />
													  </td>
                                                      <th class="Title"><span class="Label Req">서식1 첨부(ozr)</span></th>
                                                      <td class="Value"><input name="ATFL_FILE1" id="ATFL_FILE1" title="서식1 파일" type="file" required /></td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label ">서식2 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL2" id="ATFL_TITL_NM2" title="서식2 제목" type="text" class="TextBox" value="" style="width:200px;" />
													  </td>
                                                      <th class="Title"><span class="Label">서식2 첨부(ozr)</span></th>
                                                      <td class="Value"><input name="ATFL_FILE2" id="ATFL_FILE2" title="서식2 파일" type="file" /></td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label ">서식3 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL_NM3" id="ATFL_TITL_NM3" title="서식3 제목" type="text" class="TextBox" value="" style="width:200px;" />
													  </td>
                                                      <th class="Title"><span class="Label">서식3 첨부(ozr)</span></th>
                                                      <td class="Value"><input name="ATFL_FILE3" id="ATFL_FILE3" title="서식3 파일" type="file" /></td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label ">서식4 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL_NM4" id="ATFL_TITL_NM4" title="서식4 제목" type="text" class="TextBox" value="" style="width:200px;" />
													  </td>
                                                      <th class="Title"><span class="Label">서식4 첨부(ozr)</span></th>
                                                      <td class="Value"><input name="ATFL_FILE4" id="ATFL_FILE4" title="서식4 파일" type="file" /></td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label ">서식5 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL_NM5" id="ATFL_TITL_NM5" title="서식5 제목" type="text" class="TextBox" value="" style="width:200px;" />
													  </td>
                                                      <th class="Title"><span class="Label">서식5 첨부(ozr)</span></th>
                                                      <td class="Value"><input name="ATFL_FILE5" id="ATFL_FILE5" title="서식5 파일" type="file" /></td>
                                                  </tr>
                                              </table>
									</div>			
                                          <div class="MainButtonGroup">
                                          	<a class="btn-m" href="javascript:fnSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
										  	<a class="btn-m" href="javascript:fnParent();"><span class="Wrap"><span class="Text">취소</span></span></a>
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