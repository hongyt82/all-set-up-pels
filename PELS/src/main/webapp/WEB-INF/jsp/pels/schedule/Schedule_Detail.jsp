<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#UNQ_KY_VAL').val('${UNQ_KY_VAL}'); // 고유키값
			$('#PRCDOC_UNQ_KY_VAL').val('${PRCDOC_UNQ_KY_VAL}'); // 절차서고유번호
			
			$('#CHCK_DY').val('${CHCK_DY}'); // 점검일자
			$('#CHKPR_FNM').val('${CHKPR_FNM}'); // 담당자명
			
			$('#PRCDOC_NO').val('${PRCDOC_NO}'); // 절차서번호
			$('#PRCDOC_NM').val('${PRCDOC_NM}'); // 절차서명
			$('#RRD_CFY').val('${RRD_CFY}'); // 주기
			
			$('#REGPR_NM').val('${REGPR_NM}'); // 등록자명
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			params.UNQ_KY_VAL = $('#UNQ_KY_VAL').val(); // 고유번호
			params.PRCDOC_UNQ_KY_VAL = $('#PRCDOC_UNQ_KY_VAL').val(); // 절차서고유번호
			params.PRCDOC_NM = $('#PRCDOC_NM').val(); // 절차서명
			params.CHCK_DY = $('#CHCK_DY').val(); // 점검일자
			params.CHKPR_FNM = $('#CHKPR_FNM').val(); // 담당자명
			
			$.ajax({
				type: 'POST',
				url: 'Schedule_Update_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Schedule_Search.do';
					} else {
						alert('정주기시험 일정 저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('정주기시험 일정 저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
		<form id="form" name="form" method="post">
			<div class="page-content">
				<div class="page-content-area">
					<!-- #ection:basics/page-header -->
					<div class="page-header">
						<h1>
							<span class="title">정주기시험일정 수정</span>
							<span>
								<ul class="breadcrumb">
									<li>
										<a href="#">일정관리</a>
									</li>
                                    <li>
                                        <a href="Schedule_Search.do">정주기시험 일정</a>
                                    </li>
									<li class="active">정주기시험일정 수정</li>
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
                                                       <th class="Title"><span class="Label Req">시험일자</span> </th>
                                                       <td class="Value">
														<input name="CHCK_DY" id="CHCK_DY" title="시험일자" type="text" style="width:100px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_DY')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
													</td>
                                                       <th class="Title"><span class="Label Req">담당자</span></th>
                                                       <td class="Value">
														<input name="CHKPR_FNM" id="CHKPR_FNM" title="담당자" type="text" class="TextBox" value="" style="width:80px;" required/>
													</td>
                                                   </tr>
                                                   <tr class="Row">
                                                       <th class="Title"><span class="Label Req">절차서번호</span> </th>
                                                       <td class="Value">
														<input name="UNQ_KY_VAL" id="UNQ_KY_VAL" title="고유번호" type="hidden" class="TextBox" value=""/>
														<input name="PRCDOC_UNQ_KY_VAL" id="PRCDOC_UNQ_KY_VAL" title="절차서고유키값" type="hidden" class="TextBox" value=""/>
														<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="" style="width:200px;" readonly/>
													</td>
                                                       <th class="Title"><span class="Label Req">절차서명</span></th>
                                                       <td class="Value">
														<input name="PRCDOC_NM" id="PRCDOC_NM" title="절차서명" type="text" class="TextBox" value="" style="width:90%;" readonly/>
													</td>
                                                   </tr>
                                                   <tr class="Row">
                                                       <th class="Title"><span class="Label Req">주기</span></th>
                                                       <td class="Value">
														<input name="RRD_CFY" id="RRD_CFY" title="주기" type="text" class="TextBox" value="" style="width:100px;" readonly/>															
													</td>
                                                       <th class="Title"><span class="Label Req">등록자</span> </th>
                                                       <td class="Value">
														<input name="REGPR_NM" id="REGPR_NM" title="등록자" type="text" class="TextBox" value="" style="width:80px;" readonly/>
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
			<!-- /.page-content -->
		</form>
	</body>
</html>