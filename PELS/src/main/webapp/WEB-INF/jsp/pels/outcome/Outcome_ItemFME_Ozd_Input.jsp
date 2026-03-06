<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {

		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let formData = new FormData()
						
			formData.append('DIV', 'INSERT');
			formData.append('CLASS', 'FRM_MNT'); 
			formData.append('TST_UNQ_KY_VAL', $('#TST_UNQ_KY_VAL').val()); 
			formData.append('UNQ_ID', $('#UNQ_ID').val()); 
			formData.append('file', $('#ATFL_FILE1')[0].files[0]); 
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Ozd_Upload.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
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
		
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
			<form id="form" name="form" method="post">
			<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
			<input type="hidden" name="UNQ_ID" id="UNQ_ID" value="${UNQ_ID}">
			
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">시험(점검)수행 모니터링 등록[${TST_UNQ_KY_VAL},${UNQ_ID}]</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">시험(점검)관리</a>
										</li>
                                        <li>
                                            <a href="/Exam_Search.do">시험(점검)수행 모니터링</a>
                                        </li>
										<li class="active">시험(점검)수행 모니터링 등록</li>
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
	                                                    <th class="Title"><span class="Label Req">서식1 제목</span></th>
	                                                    <td class="Value">
															<input name="ATFL_TITL_NM1" id="ATFL_TITL_NM1" title="서식1 제목" type="text" class="TextBox" value="" style="width:200px;" required />
												  		</td>
	                                                    <th class="Title"><span class="Label Req">서식1 첨부(ozr)</span></th>
	                                                    <td class="Value"><input name="ATFL_FILE1" id="ATFL_FILE1" title="서식1 파일" type="file" required /></td>
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