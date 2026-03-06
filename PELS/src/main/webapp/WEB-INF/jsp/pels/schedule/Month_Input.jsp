<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			const monthCfy = '${MONTH_CFY}';
			
			console.log('MONTH_CFY: ${MONTH_CFY}');
			console.log('TH1_ITM_NM: ${TH1_ITM_NM}');
			console.log('TH2_ITM_NM: ${TH2_ITM_NM}');
			console.log('TH3_ITM_NM: ${TH3_ITM_NM}');
			console.log('TH4_ITM_NM: ${TH4_ITM_NM}');
			
		})
		
		function fncSave () {
			// 필수체크
			//if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			params.UNQ_KY_VAL = '${UNQ_KY_VAL}';
			params.TH1_ITM_NM = $('#TH1_ITM_NM').val(); // 정기/주기 시험(N)
			params.TH2_ITM_NM = $('#TH2_ITM_NM').val(); // 정기/주기 시험(D)
			params.TH3_ITM_NM = $('#TH3_ITM_NM').val(); // 정기/주기 시험(A)
			params.TH4_ITM_NM = $('#TH4_ITM_NM').val(); // 회전기기교체운전 항목
			
			$.ajax({
				type: 'POST',
				url: 'Month_Update_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Month_Search.do';
					} else {
						alert('월별 시험계획표 저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('월별 시험계획표 저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
	</script>
	<body class="no-skin real-skin">
		<form id="form" name="form" method="post">
			<div class="page-content">
				<div class="page-content-area">
					<!-- #ection:basics/page-header -->
					<div class="page-header">
						<h1>
							<span class="title">월별 시험계획표</span>
							<span>
								<ul class="breadcrumb">
									<li>
										<a href="#">일정관리</a>
									</li>
                                    <li>
                                        <a href="Month_Search.do">월별 시험계획표</a>
                                    </li>
									<li class="active">월별 시험계획표 등록</li>
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
											<span class="SubTitle">${SCHDL_PLN_DY }</span>
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
                                                   <tr id="table_row_n" class="Row">
                                                       <th class="Title"><span class="Label">정기/주기시험(N)</span></th>
                                                       <td class="Value">
                                                       	<input name="TH1_ITM_NM" id="TH1_ITM_NM" title="정기/주기시험(N)" type="text" class="TextBox" value="" style="width:400px;"/>
                                                       </td>
                                                       <th class="Title" rowspan=3><span class="Label">회전기기교체운전</span></th>
                                                       <td class="Value" rowspan=3>
                                                       	<input name="TH4_ITM_NM" id="TH4_ITM_NM" title="회전기기교체운전" type="text" class="TextBox" value="" style="width:400px;"/>
                                                       </td>
                                                   </tr>
                                                   <tr id="table_row_d" class="Row">
                                                       <th class="Title"><span class="Label">정기/주기시험(D)</span></th>
                                                       <td class="Value">
                                                       	<input name="TH2_ITM_NM" id="TH2_ITM_NM" title="정기/주기시험(D)" type="text" class="TextBox" value="" style="width:400px;"/>
                                                       </td>
                                                   </tr>
                                                   <tr id="table_row_a" class="Row">
                                                       <th class="Title"><span class="Label">정기/주기시험(A)</span></th>
                                                       <td class="Value">
                                                       	<input name="TH3_ITM_NM" id="TH3_ITM_NM" title="정기/주기시험(A)" type="text" class="TextBox" value="" style="width:400px;"/>
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