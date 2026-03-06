<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#REGPR_NM').val('${REGPR_NM}');
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			params.USER_ID = $('#USER_ID').val();
			params.USER_NM = $('#USER_NM').val();
			params.PPCD = $('#PPCD').val();
			params.RG_SCCD = $('#RG_SCCD').val();
			params.HOLD_SCCD = $('#HOLD_SCCD').val();
			params.RELTN_SCTN_NM = $('#RELTN_SCTN_NM').val(); 
			params.ATTY_CFY = $('#ATTY_CFY').val();
			params.RMK = $('#RMK').val(); 
			
			$.ajax({
				type: 'POST',
				url: 'Grade_Insert_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.action = "Grade_Search.do"
						form.submit()
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
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features,flag) { //v2.0
			gflag = flag;
		  	window.open(theURL,winName,features);
		}	
		
		function getUserReturnValue(returnValue) {
			$('#USER_ID').val(returnValue.USER_ID);
			$('#USER_NM').val(returnValue.USER_NAME);
			$('#RELTN_SCTN_NM').val(returnValue.DEPT_NM + ' [' + returnValue.PLANT_DESC + ']');
			$('#PPCD').val(returnValue.PLANT);
		}		
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
		<input name="PPCD" id="PPCD" type="hidden" value="${PPCD}"/>
		<input name="RG_SCCD" id="RG_SCCD" type="hidden" value="${RG_SCCD}"/>
		<input name="HOLD_SCCD" id="HOLD_SCCD" type="hidden" value="${HOLD_SCCD}"/>
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<span class="title">권한 등록</span>
						<span>
							<ul class="breadcrumb">
								<li>
									<a href="#">시스템관리</a>
								</li>
								<li class="active">권한 등록</li>
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
                                            <th class="Title"><span class="Label Req">사용자ID</span> </th>
                                            <td class="Value">
												<input name="USER_ID" id="USER_ID" title="사번" type="text" class="TextBox" value="" style="width:100px;" readonly required />
												<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','3');"><span class='Wrap'><span class="Text">찾기</span></span></a>
											</td>
                                            <th class="Title"><span class="Label Req">사용자명</span></th>
                                            <td class="Value">
												<input name="USER_NM" id="USER_NM" title="성명" type="text" class="TextBox" value="" style="width:100px;" readonly required />
											</td>
                                        </tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label ">부서명</span></th>
                                            <td class="Value">
											<input name="RELTN_SCTN_NM" id="RELTN_SCTN_NM" title="부서명" type="text" class="TextBox" value="" style="width:500px;" readonly  />
											</td>
	                                        <th class="Title"><span class="Label ">권한</span> </th>
	                                        <td class="Value">
													<select name="ATTY_CFY" id="ATTY_CFY" title="주기" style="width:100px;"  >
														<option value="001">전체관리자</option>
														<option value="002">사업소관리자</option>
													</select>															
											</td>
											</tr>
                                                 <tr class="Row">
                                                    <th class="Title"><span class="Label ">비고</span></th>
                                                    <td class="Value" colspan=3>
													<input name="RMK" id="RMK" title="qlrh" type="text" class="TextBox" value="" style="width:90%;"  />
													</td>
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