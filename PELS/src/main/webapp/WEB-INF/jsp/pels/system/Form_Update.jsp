<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		function fnFileDelete(atflId) {
			if (!confirm('파일을 삭제하시겠습니까?')) return
			
			let params = new Object()
			params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val();
			params.ATFL_ID = atflId;
			
			$.ajax({
				type: 'POST',
				url: 'Form_File_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Form_Update.do?PRCDOC_UNQ_KY_VAL=' + $('#PRCDOC_UNQ_KY_VAL').val();
					} else {
						alert('첨부파일 삭제에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('첨부파일 삭제에 실패하였습니다.');
				}
			})
		}
		
		function fnSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let formData = new FormData()
			formData.append('FRM_UNQ_KY_VAL', $('#FRM_UNQ_KY_VAL').val()); // 서식고유키값
			
			formData.append('PRCDOC_UNQ_KY_VAL', $('#PRCDOC_UNQ_KY_VAL').val()); // 절차서고유키값
			formData.append('PRCDOC_RVSN_NO'   , $('#PRCDOC_RVSN_NO').val()); 	 // 절차서개정번호
			formData.append('ATFL_TITL_NM1', $('#ATFL_TITL_NM1').val()); // 서식1 제목
			formData.append('ATFL_FILE1', $('#ATFL_FILE1')[0].files[0]); // 서식 첨부1
			formData.append('FRM_OVER_JSON'   , $('#FRM_OVER_JSON').val()); 	 // 절차서개정번호
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Form_Update_Ajax.do',
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
		
		function fnFormIdSearch() {
			let form = document.getElementById('form')
			form.action = "Form_Id_Search.do";
			form.submit()
		}	
		
		function fnFormMntSearch() {
			let form = document.getElementById('form')
			form.action = "Form_Manage_Search.do";
			form.submit()
		}	

		function fnFormDrawSearch() {
			let form = document.getElementById('form')
			form.action = "Form_Draw_Search.do";
			form.submit()
		}
		
		function fnFormInput() {
			let form = document.getElementById('form')
			form.CFY.value = "I";
			form.action = "Form_Update.do";
			form.submit()
		}	
		
		function fnParent() {
			let form = document.getElementById('form')
			form.PRCDOC_NO.value = "";
			form.PRCDOC_NM.value = "";
			form.action = "Proc_Search.do";
			form.submit()
		}			
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}	
		
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post" enctype="multipart/form-data">
	<input name="CFY" id="CYF" type="hidden" class="TextBox" value=""/>
	<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" class="TextBox" value="${PRCDOC_CFY}"/>
	<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" title="서식고유키값" type="hidden" class="TextBox" value="${formList[0].FRM_UNQ_KY_VAL}"/>
	<input name="PRCDOC_UNQ_KY_VAL" id="PRCDOC_UNQ_KY_VAL" title="절차서고유키값" type="hidden" class="TextBox" value="${formList[0].PRCDOC_UNQ_KY_VAL}"/>
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">정주기시험 수정</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">절차서(서식)관리</a>
							</li>
                               <li>
                                   <a href="Form_Search.do">정주기시험</a>
                               </li>
							<li class="active">정주기시험 수정</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>
			</div> <!-- /page-header -->
			<!-- #section:basics/page-button -->
			<div class="PageButtonGroup" style="text-align:right">
                <a class="btn-m" href="javascript:fnFormInput();"><span class="Text">신규등록</span></a>
				<a class="btn-m" href="javascript:fnFormIdSearch();"><span class="Text">DB항목관리</span></a>
				<a class="btn-m" href="javascript:fnFormMntSearch();"><span class="Text">모니터링관리</span></a>
			</div>				
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
											<col style="width:30%" />
											<col class="Title" />
											<col style="width:40%" />
										</colgroup>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">절차서번호</span> </th>
                                                      <td class="Value">
														<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="${formList[0].PRCDOC_NO}" style="width:200px;" required readonly/>
													  </td>
                                                      <th class="Title"><span class="Label Req">절차서명</span></th>
                                                      <td colspan="3" class="Value">
														<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" value="${formList[0].PRCDOC_NM}" style="width:90%;" readonly/>
													  </td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">문서유형</span></th>
                                                      <td class="Value">
														<input name="DOC_TYP" id="DOC_TYP" title="문서유형" type="text" class="TextBox" value="${formList[0].DOC_TYP}" style="width:100px;" readonly/>
													  </td>
                                                      <th class="Title"><span class="Label Req">개정번호</span> </th>
                                                      <td colspan="3" class="Value">
														<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" title="개정번호" type="text" class="TextBox" value="${formList[0].PRCDOC_RVSN_NO}" style="width:80px;" required />
													  </td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">주기</span></th>
                                                      <td class="Value">
														<input name="RRD_CFY" id="RRD_CFY" title="주기" type="text" class="TextBox" value="${formList[0].RRD_CFY}" style="width:100px;" readonly/>
													  </td>
                                                      <th class="Title"><span class="Label Req">등록자</span> </th>
                                                      <td colspan="3" class="Value">
														<input name="REGPR_NM" id="REGPR_NM" title="등록자" type="text" class="TextBox" value="${formList[0].REGPR_NM}" style="width:80px;" readonly />
													  </td>
                                                  </tr>
                                      			  <tr class="Row">
													  <th class="Title"><span class="Label Req">PDF 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL_NM1" id="ATFL_TITL_NM1" title="첨부 제목" type="text" class="TextBox" value="${formList[0].ATFL_TITL_NM1}" style="width:95%;" required/>
													  </td>                                      			  
                                                      <th class="Title"><span class="Label Req">PDF 첨부</span></th>
                                                  	  <td class="Value">
                                                      <input name="ATFL_FILE1" id="ATFL_FILE1" title="서식1 파일" type="file" accept=".pdf"/>
                                                      </td>             
                                                      <th class="Title"><span class="Label Req">PDF 보기</span></th>                                         
                                                      <td class="Value" colspan="3">
                                                      	<c:if test="${not empty formList[0].ATFL_PHCL_NM1}">
                                                      		<a href="javascript:MM_openBrWindow('<%=request.getContextPath()%>/upload/${formList[0].ATFL_PHCL_NM1}','','width='+ screen.width + ',height=' +  screen.height);">
																<img src="/resources/themes/QuartzLight/Skins/Image/pdf.png" height="21px;">
															</a>
														</c:if>
                                                      </td>
                                                  </tr>
                                                  <!-- 
                                      			  <tr class="Row">
													  <th class="Title"><span class="Label Req">JSON</span></th>
                                                      <td class="Value" colspan=6>
                                                      	<textarea name="FRM_OVER_JSON" id="FRM_OVER_JSON" rows=10 cols=200>${FRM_OVER_JSON}</textarea>
													  </td>                                      			  
                                                  </tr>
                                                   -->
                                                  <!-- 
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label">서식1 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL_NM2" id="ATFL_TITL_NM2" title="서식1 제목" type="text" class="TextBox" value="${formList[0].ATFL_TITL_NM2}" style="width:95%;" />
													  </td>
                                                      <th class="Title"><span class="Label Req">서식1 첨부</span></th>
                                                      <td class="Value"><input name="ATFL_FILE1" id="ATFL_FILE1" title="서식1 파일" type="file" /></td>
                                                      <th class="Title"><span class="Label">서식1 보기</span></th>
                                                      <td class="Value">
                                                      	<c:if test="${not empty formList[0].ATFL_PHCL_NM2}">
	                                                      	<a href="javascript:MM_openBrWindow('OzrViewer.do?ATFL_PHCL_NM=${formList[0].ATFL_PHCL_NM2}','','width=1000,height=800');">
																<img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;">
															</a>
															<a href="javascript:fnFileDelete(2);" class="SubButton"><span class="Text">파일삭제</span></a>
														</c:if>
                                                      </td>
                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label ">서식2 제목</span></th>
                                                      <td class="Value">
														<input name="ATFL_TITL3" id="ATFL_TITL_NM3" title="서식2 제목" type="text" class="TextBox" value="${formList[0].ATFL_TITL_NM3}" style="width:95%;" />
													  </td>
                                                      <th class="Title"><span class="Label">서식2 첨부</span></th>
                                                      <td class="Value"><input name="ATFL_FILE3" id="ATFL_FILE3" title="서식2 파일" type="file" /></td>
                                                      <th class="Title"><span class="Label">서식2 보기</span></th>
                                                      <td class="Value">
                                                      	<c:if test="${not empty formList[0].ATFL_PHCL_NM3}">
	                                                      	<a href="javascript:MM_openBrWindow('OzrViewer.do?ATFL_PHCL_NM=${formList[0].ATFL_PHCL_NM3}','','width=1000,height=800');">
																<img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;">
															</a>
															<a href="javascript:fnFileDelete(3);" class="SubButton"><span class="Text">파일삭제</span></a>
														</c:if>
                                                      </td>
                                                  </tr>
                                                   -->
                                              </table>
									</div>			
                                          <div class="MainButtonGroup">
                                          	<a class="btn-m" href="javascript:fnSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
										  	<a class="btn-m" href="javascript:fnParent();"><span class="Wrap"><span class="Text">취소</span></span></a>
                                          </div>                                            						
								</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="150px" />
													<col width="*" />
													<col width="200px" />
													<col width="200px" />
													<col width="100px" />
												</colgroup>
												<tr class="Header">
													<th>버젼</th>
													<th>첨부(PDF)</th>
													<th>Overlay JSON</th>
													<th>Constrail JSON</th>
													<th>서식</th>
												</tr>
												<c:forEach var="form" items="${formList}" begin="0" end="${formList.size()}" step="1">
													<tr class="Item">
														<td align="center">${form.PRCDOC_RVSN_NO}
														</td>
														<td align="left">
                                                      	<c:if test="${not empty form.ATFL_PHCL_NM1}">
                                                      		<a href="javascript:MM_openBrWindow('<%=request.getContextPath()%>/upload/${formList[0].ATFL_PHCL_NM1}','','width='+ screen.width + ',height=' +  screen.height);">
																<img src="/resources/themes/QuartzLight/Skins/Image/pdf.png" height="21px;">
															</a>
                                                      	</c:if>
														${form.ATFL_TITL_NM1} [파일명: ${formList[0].ATFL_ORSRC_NM1}]
														</td>
														<td align="center">
                                                      	<c:if test="${not empty form.FRM_OVER_JSON}">
                                                      	    있음
                                                      	</c:if>
														${form.ATFL_TITL_NM2}
														</td>
														<td align="center">
                                                      	<c:if test="${not empty form.FRM_CONS_JSON}">
                                                      	    있음
                                                      	</c:if>
														${form.ATFL_TITL_NM3}
														</td>
														<td  align="center">
														<!-- 
                                                      		<a href="javascript:MM_openBrWindow('KhnpEditor.do?FRM_UNQ_KY_VAL=${form.FRM_UNQ_KY_VAL}','','width=1000,height=800');">
																편집
															</a>
															 -->
                                                      		<a href="javascript:MM_openBrWindow('KhnpEditor.do?FRM_UNQ_KY_VAL=${form.FRM_UNQ_KY_VAL}','','width='+ screen.width + ',height=' +  screen.height);">
																편집
															</a>
														</td>														
													</tr>
												</c:forEach>
                                                </table>
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