<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		function fnSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('저장 하시겠습니까?')) return
			
			let params = new Object()
			params.UNQ_KY_VAL = $('#UNQ_KY_VAL').val();
			params.FRM_ID = $('#FRM_ID').val();
			params.DOC_UNQ_ID = $('#DOC_UNQ_ID').val();
			params.DOC_TYP = $('#DOC_TYP').val();
			params.DOC_PART_CD = $('#DOC_PART_CD').val();
			
			$.ajax({
				type: 'POST',
				url: 'Form_Draw_Update_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						fnParent();
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
		
		function fnParent() {
			let form = document.getElementById('form')
			form.action = "Form_Draw_Search.do";
			form.submit();
		}				
	</script>
	<body class="no-skin real-skin">
		<form id="form" name="form" method="post">
		<input name="UNQ_KY_VAL" id="UNQ_KY_VAL" type="hidden" value="${formDetail.UNQ_KY_VAL}"/>
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">도면연계관리 수정</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">절차서(서식)관리</a>
										</li>
                                        <li>
                                            <a href="#">도면연계관리</a>
                                        </li>
										<li class="active">도면연계관리 수정</li>
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
													<col style="width:50%" />
													<col class="Title" />
													<col style="width:50%" />
												</colgroup>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label Req">이폼서식ID</span></th>
                                                        <td class="Value">
															<input name="FRM_ID" id="FRM_ID" title="이폼서식ID" type="text" class="TextBox" value="${formDetail.FRM_ID}" style="width:90%;"  required/>
														</td>
                                                        <th class="Title"><span class="Label Req">문서번호</span> </th>
                                                        <td class="Value">
															<input name="DOC_UNQ_ID" id="DOC_UNQ_ID" title="문서번호" type="text" class="TextBox" value="${formDetail.DOC_UNQ_ID}" style="width:90%"  required/>
														</td>
                                                    </tr>
                                                    <tr class="Row">
                                                        <th class="Title"><span class="Label">문서유형</span></th>
                                                        <td class="Value">
															<input name="DOC_TYP" id="DOC_TYP" title="문서유형" type="text" class="TextBox" value="${formDetail.DOC_TYP}" style="width:100px;" required/>
														</td>
                                                        <th class="Title"><span class="Label">문서부분코드</span> </th>
                                                        <td class="Value">
															<input name="DOC_PART_CD" id="DOC_PART_CD" title="문서부분코드" type="text" class="TextBox" value="${formDetail.DOC_PART_CD}" style="width:100px;" required/>
														</td>
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