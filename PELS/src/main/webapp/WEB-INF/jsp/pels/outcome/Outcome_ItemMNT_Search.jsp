<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
			$('#TST_UNQ_KY_VAL').val('${TST_UNQ_KY_VAL}');
		})
		
		// 결과관리 시험(점검)자료이력정보 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Outcome_Item_Search.do"
			form.submit()
		}
		
		// 등록 화면으로 이동
		function Outcome_ItemMNT_Input() {
			let form = document.getElementById('form')
			form.action = "Outcome_ItemMNT_Input.do";
			form.submit()
		}
		
		// 등록 화면으로 이동
		function Outcome_ItemMNT_Update() {
			const chkElements = $('#form input[name=CHK_ITEM]')
			let chkCnt = 0;
			let chkParam = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					chkParam = $(chkElements[i]).val();
				}
			}
			
			if (chkCnt == 0) {
				alert('수정할 자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('수정하기 위해서는 하나만 선택해야 합니다.')
				return
			}			
			
			let form = document.getElementById('form')
			form.UNQ_KY_VAL.value = chkParam;
			form.action = "Outcome_ItemMNT_Update.do";
			form.submit()
		}
		
		function Outcome_ItemMNT_Delete () {
			const chkElements = $('#form input[name=CHK_ITEM]')
			let chkCnt = 0;
			let chkParams = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					chkParams = $(chkElements[i]).val();	
				}
			}
			
			if (chkCnt == 0) {
				alert('삭제할 자료를 선택하여 주십시오.')
				return
			}
			
			if (!confirm('정말로 삭제 하시겠습니까?')) return
			
			let params = new Object()
			params.UNQ_KY_VAL = chkParams;
			
			$.ajax({
				type: 'POST',
				url: 'Outcome_ItemMNT_Delete_Ajax.do',
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
						alert('삭제에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('절차서 삭제에 실패하였습니다.');
				}
			})
		}		
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}			
		
		function downloadExcelFile()
		{
			let form = document.getElementById('form')
			form.action = '/Outcome_ItemMnt_Download.do'
			form.submit()
		}
		
		function fnParent()
		{
			let form = document.getElementById('form')
			form.action = '${URL}'
			form.submit()
		}
		
		
	</script>
	<body class="no-skin real-skin">
			<form id="form" name="form" method="post">
			<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
			<input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="${FRM_UNQ_KY_VAL}">
			<input type="hidden" name="UNQ_ID" id="UNQ_ID" value="">
			<input type="hidden" name="UNQ_KY_VAL" id="UNQ_KY_VAL" value="">
			<input type="hidden" name="URL" id="URL" value="${URL}">
			<input type="hidden" name="ATCT_CFY" id="ATCT_CFY" value="${ATCT_CFY}">
			<input type="hidden" name="PRCDOC_CFY" id="PRCDOC_CFY" value="${PRCDOC_CFY}">
			
			<div class="main-content">
				<!-- /section:basics/content.util-area -->
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">${examDetail.ATCT_NM}</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">점검지A(DB화)</a>
										</li>
										<li class="">점검 계획 수립</li>
										<li class="active">${examDetail.ATCT_NM}</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<!-- <a class="btn-m" href="javascript:fnInput();"><span class="Text">OZD 등록</span></a> -->
							<a class="btn-m" href="javascript:MM_openBrWindow('OzReport.do?TST_UNQ_KY_VAL=${TST_UNQ_KY_VAL}','','width=1000,height=800');"><span class="Text">보고서</span></a>
							<a class="btn-m" href="javascript:fnParent();"><span class="Text">이전화면</span></a>
						</div>
						<!-- /page-button-->
						<div class="row">
							<div class="col-xs-12">
								<!-- PAGE CONTENT BEGINS -->								
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
                                            <td class="Value" align="center">
                                            	${examDetail.PRCDOC_NO}
                                           	</td>
                                            <th class="Title"><span class="Label">절차서명</span></th>
                                            <td class="Value" colspan=3>
                                            	${examDetail.PRCDOC_NM}
                                            </td>
                                        </tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label">시험기간</span></th>
                                            <td class="Value"  align="center">
                                            	${examDetail.CHCK_DT}
                                            </td>
                                            <th class="Title"><span class="Label">점검지명</span></th>
                                            <td class="Value">
                                            	${examDetail.ATCT_NM}
                                            </td>
                                            <th class="Title"><span class="Label">점검명</span></th>
                                            <td class="Value">
                                            	${examDetail.TITL_NM}
                                            </td>
                                        </tr>
                                        </table>
									</div>	
								</div><br>
								<div class="RealSearchBox">
									<div class="NormalSearch">
										<div class="Default">
											<table border="0" cellpadding="0" cellspacing="0" class="Outline">
												<colgroup>
													<col class="Title" />
													<col style="width:25%" />
													<col class="Title" />
													<col style="width:25%" />
	                                               	<col class="Title" />
	                                               	<col style="width:25%" />
												</colgroup>
												<tr>
													<td class="Title">조치필요사항</td>
													<td class="Value">
		                                               	<input type="text" class="TextBox" name="SH_RMK_NM" id="SH_RMK_NM" style="width:200px;" value="${SH_RMK_NM}"/>
													</td>
												</tr>
											</table>
											<a class="SearchButton" href="javascript:fnSearch();"><span class='Text'>조회</span></a>
										</div>
									</div>
								</div>								
								<div class="RealPanel">
									<div class="Title">
										<div class="TitleArea">
											<span class="SubTitle">점검결과표</span><span class="count">${TCNT}</span>
										</div>
										<div class="ControlArea">
											<c:if test="${URL eq 'Exam_Monitoring.do'}">
											<a class="InfoButton" href="javascript:Outcome_ItemMNT_Input();"><span class="Text">추가</span></a>
											<a class="InfoButton" href="javascript:Outcome_ItemMNT_Update();"><span class="Text">수정</span></a>
											<a class="InfoButton" href="javascript:Outcome_ItemMNT_Delete();"><span class="Text">삭제</span></a>
											</c:if>
											
											<a class="InfoButton" href="javascript:downloadExcelFile();"><span class="Text">엑셀 다운로드</span></a>
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
													<col width="200px" />
													<col width="300px" />
													<col width="100px" />
													<col width="*" />
                                                    <col width="100px" />
                                                    <col width="200px" />
                                                    <col width="70px" />
												</colgroup>
												<tr class="Header">
                                                    <th>선택</th>
                                                    <th>관리번호</th>
                                                    <th>감독부서</th>
                                                    <th>점검결과</th>
                                                    <th>조치필요사항</th>
                                                    <th>점검자</th>
                                                    <th>점검일시</th>
                                                    <th>점검결과</th>
												</tr>
												<c:forEach var="OutcomeItemList" items="${OutcomeItemList}" begin="0" end="${OutcomeItemList.size()}" step="1" varStatus="loop">
													<tr class="Item">
														<td align="center">
															<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox"  onclick="checkOnlyOne(this)" value="${OutcomeItemList.UNQ_KY_VAL}">
														</td>
														<td align="center">${OutcomeItemList.UNQ_ID}</td>
														<td align="left">${OutcomeItemList.TH1_ITM_NM}</td>
														<td align="center">${OutcomeItemList.CHCK_YN_NM}</td>
														<td align="center">${OutcomeItemList.RMK_NM}</td>
														<td align="center">${OutcomeItemList.REGPR_NM}</td>
														<td align="center">${OutcomeItemList.FM_RG_DT}</td>
														<td align="center">
														<c:choose>
															<c:when test="${null eq OutcomeItemList.OZD_FNAME1 }">
															</c:when>
															<c:otherwise>
																<a class="SubButton" href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${OutcomeItemList.OZD_FNAME1}','','width=1000,height=800');"><span class="Text">보기</span></a>
															</c:otherwise>
														</c:choose>
														</td>
													</tr>
												</c:forEach>
												<c:if test="${outcomeItemList.size() eq 0}">
													<tr class="Item">
														<td colspan="5" style="text-align: center;">조회된 자료가 없습니다.</td>
													</tr>
												</c:if>
											</table>
										</div>
									</div>
								</div>
								
								<!-- PAGE CONTENT ENDS -->
							</div><!-- /.col -->
						</div><!-- /.row -->
					</div><!-- /.page-content-area -->
				</div><!-- /.page-content -->
			</div><!-- /.main-content -->
			</form>	
	</body>
</html>