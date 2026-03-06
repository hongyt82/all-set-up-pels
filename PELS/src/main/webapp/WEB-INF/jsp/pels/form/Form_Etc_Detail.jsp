<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$("input:radio[name=OPPB_CFY][value='${OPPB_CFY}']").prop("checked", true);
		})
		
		function fnParent () {
			let form = document.getElementById('form')
			form.action = "/Form_Etc_Search.do?FRM_CFY=${FRM_CFY}";
			form.submit()
		}
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('저장하시겠습니까?')) return
			
			let formData = new FormData()
			formData.append('FRM_UNQ_KY_VAL', '${FRM_UNQ_KY_VAL}'); 
			formData.append('FRM_NM', $('#FRM_NM').val()); 
			formData.append('ATFL_FILE1', $('#ATFL_FILE1')[0].files[0]);
			formData.append('OPPB_CFY', $("input:radio[name='OPPB_CFY']:checked").val()); 
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Form_Etc_Update_Ajax.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						fnParent();
					} else {
						alert('저장에 실패하였습니다.');
					}
				},
				error: function () {
					alert('저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}		
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post" enctype="multipart/form-data">
	<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" class="TextBox" value="${FRM_UNQ_KY_VAL}"/>
    <input type="hidden" class="TextBox" name="MY_DATA" id="MY_DATA" value="${MY_DATA}"/>
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
									<a href="#">작업전회의</a>
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
											<col style="width:30px;" />
											<col style="width:100%" />
										</colgroup>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">양식 제목</span></th>
                                                      <td class="Value" colspan=2>
														<input name="FRM_NM" id="FRM_NM" title="양식 제목" type="text" class="TextBox" value="${FRM_NM}" style="width:60%;"/>
													  </td>

                                                  </tr>
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">공개 여부</span></th>
													  <td class="Value" colspan=2>
															<input type="radio" name="OPPB_CFY" id="OPPB_CFY" class="TextBox" style="width: 30px;" title="구분" value="비공개" checked="checked" required />비공개
															<input type="radio" name="OPPB_CFY" id="OPPB_CFY" class="TextBox" style="width: 30px;" title="구분" value="부서" required />부서
															<input type="radio" name="OPPB_CFY" id="OPPB_CFY" class="TextBox" style="width: 30px;" title="구분" value="공통" required />공통
													  </td>
												  </tr>											
                                                  <tr class="Row">
                                                      <th class="Title"><span class="Label Req">서식파일</span></th>
                                                      <td class="Value">
                                                      	<c:if test="${not empty ATFL_PHCL_NM1}">
	                                                      	<a href="javascript:MM_openBrWindow('OzrViewer.do?ATFL_PHCL_NM=${ATFL_PHCL_NM1}','','width=1000,height=800');">
																<img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;">
															</a>
														</c:if>
                                                      </td>
                                                      <td class="Value">
                                                      <input name="ATFL_FILE1" id="ATFL_FILE1" title="서식1 파일" type="file"/>
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