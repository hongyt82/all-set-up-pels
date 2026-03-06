<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		// 시험(점검)수행 모니터링 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Exam_Monitoring.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Exam_Monitoring.do"
			form.submit()
		}				
		
		// 등록 화면으로 이동
		function fnExamInput () {
			
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
				alert('자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('하나만 선택해야 합니다.')
				return
			}
			
			let form = document.getElementById('form')
			form.action = "Exam_Ozd_Input.do?TST_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}			
		
	</script>
	<body class="no-skin real-skin">
			<form id="form" name="form" method="post">
			<input type="hidden" name="PAGE" value="${PAGE}">
			<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
			<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
			<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
			<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
			<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">시험(점검) 수행</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">시험(점검)관리</a>
										</li>
										<li class="active">시험(점검) 수행</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
						    <!-- 
							<a class="btn-m" href="javascript:fnExamInput();"><span class="Text">OZD 등록</span></a>
							<a class="btn-m" href="javascript:fnExamResult();"><span class="Text">완료</span></a>
							 -->
						</div>
						<!-- /page-button-->
						<div class="row">
							<div class="col-xs-12">
								<!-- PAGE CONTENT BEGINS -->								
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
                                                    <col class="Title" />
                                                    <col style="width:25%" />
												</colgroup>
												<tr>
													<td class="Title"><span class="Label">발전소</span></td>
													<td class="Value">
														<select name="PPCD" id="PPCD">
														<c:forEach var="plant" items="${plantList}" begin="0" end="${plantList.size()}" step="1">
															<option value="${plant.PPCD}">${plant.PWPL_NM}</option>
														</c:forEach>
														</select>
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
											<span class="SubTitle">시험수행현황 0</span><span class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
											<a class="InfoButton" href="javascript:alert('개발중입니다.');"><span class="Text">엑셀 다운로드</span></a>
										</div>

									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
													<col width="200px" />
                                                    <col width="100px" />
                                                    <col width="150px" />
													<col width="*" />
                                                    <col width="25%" />
                                                    <col width="100px" />
                                                    <col width="70px" />
                                                    <col width="70px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
                                                    <th>시험기간</th>
                                                    <th>구분</th>
													<th>절차서번호</th>
													<th>절차서명 [붙임명]</th>
                                                    <th>시험명</th>
                                                    <th>점검자</th>
                                                    <th>작업전회의</th>
                                                    <th>결과</th>
												</tr>
												<c:forEach var="exam" items="${examList}" begin="0" end="${examList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox"  onclick="checkOnlyOne(this)" value="${exam.TST_UNQ_KY_VAL}"></td>
														<td align="center">${exam.CHCK_DT}</td>
														<td align="center">${exam.PRCDOC_CFY_NM}</td>
														<td align="center">${exam.PRCDOC_NO}</td>
														<c:choose>
															<c:when test="${'M' eq exam.PRCDOC_CFY}">
																<td align="left">
																	<a href="/Outcome_Item_Search.do?URL=Exam_Monitoring.do&TST_UNQ_KY_VAL=${exam.TST_UNQ_KY_VAL}&FRM_UNQ_KY_VAL=${exam.FRM_UNQ_KY_VAL}&ATCT_CFY=${exam.ATCT_CFY}">
																		${exam.PRCDOC_NM}<c:if test="${not empty exam.ATCT_NM}"> <font color="blue">[${exam.ATCT_NM}]</font></c:if>
																	</a>
																</td>
															</c:when>
															<c:otherwise>
																<td align="left">
																	<a href="/Outcome_Main_History_Search.do?URL=Exam_Monitoring.do&TST_UNQ_KY_VAL=${exam.TST_UNQ_KY_VAL}&FRM_UNQ_KY_VAL=${exam.FRM_UNQ_KY_VAL}&ATCT_CFY=${exam.ATCT_CFY}">
																		${exam.PRCDOC_NM}<c:if test="${not empty exam.ATCT_NM}"> <font color="blue">[${exam.ATCT_NM}]</font></c:if>
																	</a>
																</td>
															</c:otherwise>
														</c:choose>
														<td align="left">${exam.TITL_NM}</td>
														<td align="center">${exam.CHKPR_FNM}</td>
														<td align="center">
														<c:choose>
															<c:when test="${'M' eq exam.PRCDOC_CFY}">
															    해당없음
															</c:when>
															<c:when test="${null eq exam.JOB_FNAME1}">
																미수행
															</c:when>
															<c:otherwise>
																<a  class="InfoButton" href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${exam.JOB_FNAME1}&TST_UNQ_KY_VAL=${exam.TST_UNQ_KY_VAL}','','width=1000,height=800');"><span class="Text">보기</span></a>
															</c:otherwise>
														</c:choose>														
														</td>
														<td align="center">
															<c:choose>
																<c:when test="${null eq exam.OZD_FNAME1}">
																	미수행
																</c:when>
																<c:otherwise>
																	<a class="InfoButton" href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${exam.OZD_FNAME1}&TST_UNQ_KY_VAL=${exam.TST_UNQ_KY_VAL}','','width=1000,height=800');"><span class="Text">보기</span></a>
																</c:otherwise>
															</c:choose>														
														</td>
													</tr>
												</c:forEach>
												<c:if test="${examList.size() eq 0}">
													<tr class="Item">
														<td colspan="7" style="text-align: center;">조회된 자료가 없습니다.</td>
													</tr>
												</c:if>                                              
												</table>
											<div class="Paging" style="text-align:center;">
												<c:choose>
													<c:when test="${1 eq PAGE}">
														<a disabled="disabled" title="첫번째 페이지"><span class="ArrowFirst_disable"></span><span class="TextButton">≪</span></a>
													</c:when>
													<c:otherwise>
														<a href="javascript:fnPage('1');" title="첫번째 페이지"><span class="ArrowFirst"></span><span class="TextButton">≪</span></a>
													</c:otherwise>
												</c:choose>
												<span class='Space'>&nbsp;</span>
												<c:choose>
													<c:when test="${STARTPAGE-1 < 1}">
														<a disabled="disabled" title="이전 20페이지"><span class="ArrowPrev_disable"></span><span class="TextButton">&lt;</span></a>
													</c:when>
													<c:otherwise>
														<a href="javascript:fnPage('${STARTPAGE-1}');" title="이전 20페이지"><span class="ArrowPrev"></span><span class="TextButton">&lt;</span></a>
													</c:otherwise>
												</c:choose>
												
												<span class='Space'>&nbsp;</span>
												<span class="Number">
													<c:forEach var="num" begin="${STARTPAGE}" end="${ENDPAGE}" step="1">
														
														<c:choose>
															<c:when test="${num == PAGE}">
																<span class="Label" style="width:30px;">${num}</span>
															</c:when>
															<c:otherwise>
																<a href="javascript:fnPage('${num}');" class="link" style="width:30px;">${num}</a>
															</c:otherwise>
														</c:choose>
														<c:if test="${num ne ENDPAGE}">
															<span class='Space'>&nbsp;</span>
														</c:if>
													</c:forEach>
												</span>
												<span class='Space'>&nbsp;</span>
												<c:choose>
													<c:when test="${ENDPAGE+1 > TOTALPAGE}">
														<a disabled="disabled" title="다음 20 페이지"><span class="ArrowNext_disable"></span><span class="TextButton">&gt;</span></a>
													</c:when>
													<c:otherwise>
														<a href="javascript:fnPage('${ENDPAGE + 1}');" title="다음 20 페이지"><span class="ArrowNext"></span><span class="TextButton">&gt;</span></a>
													</c:otherwise>
												</c:choose>
												<span class='Space'>&nbsp;</span>
												<c:choose>
													<c:when test="${PAGE eq TOTALPAGE}">
														<a disabled="disabled" title="마지막 페이지"><span class="ArrowLast_disable"></span><span class="TextButton">≫</span></a>
													</c:when>
													<c:otherwise>
														<a href="javascript:fnPage('${TOTALPAGE}');" title="마지막 페이지"><span class="ArrowLast"></span><span class="TextButton">≫</span></a>
													</c:otherwise>
												</c:choose>
											</div>
												
										</div>
									</div>
								</div>
								
								<!-- PAGE CONTENT ENDS -->
							</div><!-- /.col -->
						</div><!-- /.row -->
					</div><!-- /.page-content-area -->
				</div><!-- /.page-content -->
			</form>
	</body>
</html>