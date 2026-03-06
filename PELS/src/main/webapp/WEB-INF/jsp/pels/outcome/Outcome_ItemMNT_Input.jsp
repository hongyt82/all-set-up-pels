<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			params.TST_UNQ_KY_VAL = $('#TST_UNQ_KY_VAL').val(); // 서식고유키값
			params.FRM_UNQ_KY_VAL = $('#FRM_UNQ_KY_VAL').val(); // 서식고유키값
			params.UNQ_ID = $('#UNQ_ID').val(); 				// 관리번호
			params.TH1_ITM_NM = $('#TH1_ITM_NM').val(); 		// 대분류
			
			$.ajax({
				type: 'POST',
				url: 'Outcome_ItemMNT_Insert_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.action = "Outcome_Item_Search.do"
						form.submit()
					} else {
						alert(resultData.resultMsg);
						
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
	<form id="form" name="form" method="post">
	<input name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" title="서식고유키값" type="hidden" class="TextBox" value="${TST_UNQ_KY_VAL}"/>
	<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" title="서식고유키값" type="hidden" class="TextBox" value="${FRM_UNQ_KY_VAL}"/>
	<input type="hidden" name="URL" id="URL" value="${URL}">
	<input type="hidden" name="ATCT_CFY" id="ATCT_CFY" value="${ATCT_CFY}">
	<input type="hidden" name="PRCDOC_CFY" id="PRCDOC_CFY" value="${PRCDOC_CFY}">
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">${examDetail.ATCT_NM} 등록</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">점검지A(DB화)</a>
							</li>
                            <li>
                                <a href="">점검계획수립</a>
                            </li>
							<li class="active">${examDetail.ATCT_NM} [${examDetail.TITL_NM}] 등록</li>
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
									<span class="SubTitle">점검명: ${examDetail.TITL_NM}</span>
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
                                        <th class="Title"><span class="Label">절차서번호</span> </th>
                                        <td class="Value">
											${examDetail.PRCDOC_NO}
										</td>
                                         <th class="Title"><span class="Label">절차서명</span></th>
                                         <td class="Value">
											${examDetail.PRCDOC_NM}
										</td>
                                     </tr>
                                    <tr class="Row">
                                        <th class="Title"><span class="Label">시험기간</span> </th>
                                        <td class="Value">
											${examDetail.CHCK_DT}
										</td>
                                         <th class="Title"><span class="Label">점검지명</span></th>
                                         <td class="Value">
											${examDetail.ATCT_NM} [${examDetail.TITL_NM}]
										</td>
                                     </tr>
                                                 <tr class="Row">
                                                     <th class="Title"><span class="Label Req">관리번호</span></th>
                                                     <td class="Value">
												<input name="UNQ_ID" id="UNQ_ID" title="관리번호" type="text" class="TextBox" value="" style="width:200px;" required/>
											</td>
                                                     <th class="Title"><span class="Label Req">감독부서</span> </th>
                                                     <td class="Value">
												<input name="TH1_ITM_NM" id="TH1_ITM_NM" title="감독부서" type="text" class="TextBox" value="" style="width:200px;" required/>
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