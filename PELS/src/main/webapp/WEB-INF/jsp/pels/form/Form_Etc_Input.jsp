<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let formData = new FormData()
			formData.append('FRM_CFY', '${FRM_CFY}'); 
			formData.append('FRM_NM', $('#FRM_NM').val()); 
			formData.append('ATFL_FILE1', $('#ATFL_FILE1')[0].files[0]); // 서식 첨부1
			formData.append('HOLD_SCCD', $('#HOLD_SCCD').val()); 
			formData.append('USER_OFCD', $('#USER_OFCD').val()); 
			formData.append('OPPB_CFY', $("input:radio[name='OPPB_CFY']:checked").val()); 
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Form_Etc_Insert_Ajax.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Form_Etc_Search.do?FRM_CFY=${FRM_CFY}&MY_DATA=Y';	
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
	<form id="form" name="form" method="post" enctype="multipart/form-data">
		<input type="hidden" name="HOLD_SCCD" value="${USER_DEPT_CD}" />
		<input type="hidden" name="USER_OFCD" value="${USER_JIKJE}" />
    	<input type="hidden" class="TextBox" name="SH_FRM_NM" id="SH_FRM_NM" value="${SH_FRM_NM}"/>
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<span class="title">${subTitle} 등록</span>
						<span>
							<ul class="breadcrumb">
								<li>
									<a href="#">절차서(서식)관리</a>
								</li>
                                <li>
                                    <a href="/Etc_Form_Search.do?FRM_CFY=${FRM_CFY}">${subTitle}</a>
                                </li>
								<li class="active">${subTitle} 등록</li>
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
											<col style="width:100%" />
										</colgroup>
                                          <tr class="Row">
                                              <th class="Title"><span class="Label Req">양식 제목</span></th>
                                              <td class="Value">
												<input name="FRM_NM" id="FRM_NM" title="양식 제목" type="text" class="TextBox" value="" style="width:60%;"/>
											  </td>
                                          </tr>
                                          <tr class="Row">
                                              <th class="Title"><span class="Label Req">공개 여부</span></th>
											  <td class="Value">
													<input type="radio" name="OPPB_CFY" id="OPPB_CFY" class="TextBox" style="width: 30px;" title="구분" value="비공개" checked="checked" required />비공개
													<input type="radio" name="OPPB_CFY" id="OPPB_CFY" class="TextBox" style="width: 30px;" title="구분" value="부서" required />부서
													<input type="radio" name="OPPB_CFY" id="OPPB_CFY" class="TextBox" style="width: 30px;" title="구분" value="공통" required />공통
											  </td>
										  </tr>											
                                          <tr class="Row">
                                              <th class="Title"><span class="Label Req">${ATCT_FILE_CFY}</span></th>
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