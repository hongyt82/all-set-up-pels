<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "QR_Search.do"
			form.submit()
		}		
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			params.PRCDOC_UNQ_KY_VAL = $('#PRCDOC_UNQ_KY_VAL').val();
			params.PPCD = $('#PPCD').val();
			params.LOCT_NM = $('#LOCT_NM').val();
			params.QR_CD_INFO = $('#QR_CD_INFO').val();
			
			$.ajax({
				type: 'POST',
				url: 'QR_Insert_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.action = "QR_Search.do"
						form.submit()
					} else {
						alert('저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('절차서 저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
	<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" class="TextBox" value="${PRCDOC_CFY}" />
	<input name="PRCDOC_UNQ_KY_VAL" id="PRCDOC_UNQ_KY_VAL" type="hidden" class="TextBox" value="${PRCDOC_UNQ_KY_VAL}" />
	<input name="PPCD" id="PPCD" type="hidden" class="TextBox" value="${PPCD}" />
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">QR 등록</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">절차서(서식)관리</a>
							</li>
							<c:if test="${PRCDOC_CFY eq 'P'}">
							<li class="">정주기시험</li>
							</c:if>
							<c:if test="${PRCDOC_CFY eq 'M'}">
							<li class="">점검지</li>
							</c:if>
							<li class="">QR관리</li>
							<li class="active">QR 등록</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>

			</div><!-- /page-header -->
			<!-- #section:basics/page-button -->
			
			<!-- /page-button-->
			<div class="row">
				<div class="col-xs-12">
					<div class="ContentPanel">
						<div class="GridWrite">       
							<table cellspacing="0" cellpadding="0" border="0" class="Outline">
							<colgroup>
								<col class="Title" />
								<col style="width:20%" />
								<col class="Title" />
								<col style="width:40%" />
								<col class="Title" />
								<col style="width:40%" />
							</colgroup>
	                                 <tr class="Row">
	                                     <th class="Title"><span class="Label">절차서번호</span></th>
	                                     <td class="Value">
	                                     	${PRCDOC_NO}
	                                    	</td>
	                                     <th class="Title"><span class="Label">절차서명</span></th>
	                                     <td class="Value">
	                                     	${PRCDOC_NM}
	                                     </td>
	                                     <th class="Title"><span class="Label">점검지명</span></th>
	                                     <td class="Value">
	                                     	${ATCT_NM}
	                                     </td>
	                                 </tr>
	                                 </table>
						</div>	
					</div><br>				
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
                                           <th class="Title"><span class="Label Req">현장위치</span> </th>
                                           <td class="Value">
											<input name="LOCT_NM" id="LOCT_NM" title="현장위치" type="text" class="TextBox" value="" style="width:90%;" required />
										</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">QR식별자</span></th>
                                           <td class="Value">
											<input name="QR_CD_INFO" id="QR_CD_INFO" title="식별자" type="text" class="TextBox" value="" style="width:90%;" required />
										</td>
                                       </tr>
                                        </table>
									</div>			
                                    <div class="MainButtonGroup">
                                    	<a class="btn-m" href="javascript:fncSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
									  	<a class="btn-m" href="javascript:fnSearch();"><span class="Wrap"><span class="Text">취소</span></span></a>
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