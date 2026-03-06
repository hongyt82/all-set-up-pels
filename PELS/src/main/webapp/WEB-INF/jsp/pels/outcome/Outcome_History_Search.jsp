<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			
		})
		
		// 결과관리 시험(점검)자료이력정보 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Outcome_History_Search.do"
			form.PAGE.value = "1";
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Outcome_History_Search.do"
			form.submit()
		}
		
		function fnChart() {
			const chkElements1 = $('#form input[name=CHK_ITEM]')
			const chkElements2 = $('#form input[name=FRM_ID]')
			const chkElements3 = $('#form input[name=TITL_NM]')
			const chkElements4 = $('#form input[name=TH1_ITM_NM]') 
			const chkElements5 = $('#form input[name=TH2_ITM_NM]')
			const chkElements6 = $('#form input[name=TH3_ITM_NM]')
			
			let chkCnt = 0;
			let chkParam1 = '';
			let chkParam2 = '';
			let chkParam3 = '';
			let chkParam4 = '';
			let chkParam5 = '';
			let chkParam6 = '';
			
			for (let i = 0; i < chkElements1.length; i++) {
				if ($(chkElements1[i]).is(':checked')) {
					chkCnt++;
					chkParam1 = $(chkElements1[i]).val();
					chkParam2 = $(chkElements2[i]).val();
					chkParam3 = $(chkElements3[i]).val();
					chkParam4 = $(chkElements4[i]).val();
					chkParam5 = $(chkElements5[i]).val();
					chkParam6 = $(chkElements6[i]).val();
				}
			}
			
			if (chkCnt == 0) {
				alert('자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('하나만 선택해야 합니다.')
				return
			}
			
			var sParam = 'TST_UNQ_KY_VAL=' + chkParam1 + '&FRM_ID=' + chkParam2 + '&TITL_NM=' + chkParam3 + 
						 '&TH1_ITM_NM=' + chkParam4  + '&TH2_ITM_NM=' + chkParam5  + '&TH3_ITM_NM=' + chkParam6;
			//return;
			//window.open('Outcome_Chart_Search.do?TST_UNQ_KY_VAL=' + chkParam1 + '&FRM_ID=' + chkParam2, '', 'width=1000, height=800');
			window.open('Outcome_Chart_Search.do?' + sParam, '', 'width=1000, height=800');
		}	
		
		function downloadExcelFile () {
			let form = document.getElementById('form')
			form.action = '/Outcome_History_Excel.do'
			form.submit()
		}			
		
	</script>
	<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
	<input type="hidden" name="PAGE" value="${PAGE}">
	<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
	<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
	<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
	<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">시험결과(데이터)</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">정주기시험</a>
										</li>
										<li class="active">시험결과(데이터)</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnChart();"><span class="Text">트랜드</span></a>
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
												<col style="width:10%" />
												<col class="Title" />
												<col style="width:10%" />
                                                <col class="Title" />
                                                <col style="width:15%" />
                                                <col class="Title" />
                                                <col style="width:15%" />
                                                <col class="Title" />
                                                <col style="width:15%" />
                                                <col class="Title" />
                                                <col style="width:15%" />
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
												<td class="Title">절차서번호</td>
												<td class="Value">
                                                	<input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" style="width:100px;" value="${SH_PRCDOC_NO}"/>
												</td>
												<td class="Title">시험명</td>
												<td class="Value">
                                                	<input type="text" class="TextBox" name="SH_TEST_NM" id="SH_TEST_NM" style="width:200px;" value="${SH_TEST_NM}"/>
												</td>
												<td class="Title">제목명</td>
												<td class="Value">
                                                	<input type="text" class="TextBox" name="SH_TITL_NM" id="SH_TITL_NM" style="width:200px;" value="${SH_TITL_NM}"/>
												</td>
												<td class="Title">분류</td>
												<td class="Value">
                                                	<input type="text" class="TextBox" name="SH_ITM_NM" id="SH_ITM_NM" style="width:200px;" value="${SH_ITM_NM}"/>
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
											<span class="SubTitle">현황</span><span class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
											<a class="InfoButton" href="javascript:downloadExcelFile();"><span class="Text">엑셀 다운로드</span></a>
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
													<col width="100px" />
													<col width="15%" />
                                                    <col width="15%" />
                                                    <col width="*" />
                                                    <col width="100px" />
                                                    <col width="80px" />
                                                    <col width="80px" />
                                                    <col width="150px" />
                                                    <col width="80px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
                                                    <th>절차서번호</th>
													<th>시험명</th>
                                                    <th>제목명</th>
                                                    <th>분류</th>
                                                    <th>기록값</th>
                                                    <th>단위</th>
                                                    <th>기록자</th>
                                                    <th>기록일자</th>
                                                    <th>페이지</th>
												</tr>
												<c:forEach var="outcomeHistory" items="${outcomeHistoryList}" begin="0" end="${outcomeHistoryList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold">
															<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox"  onclick="checkOnlyOne(this)" value="${outcomeHistory.TST_UNQ_KY_VAL}">
															<input name="FRM_ID" id="FRM_ID" type="hidden" value="${outcomeHistory.FRM_ID}">
															<input name="TITL_NM" id="FRM_ID" type="hidden" value="${outcomeHistory.TITL_NM}">
															<input name="TH1_ITM_NM" id="TH1_ITM_NM" type="hidden" value="${outcomeHistory.TH1_ITM_NM}">
															<input name="TH2_ITM_NM" id="TH2_ITM_NM" type="hidden" value="${outcomeHistory.TH2_ITM_NM}">
															<input name="TH3_ITM_NM" id="TH3_ITM_NM" type="hidden" value="${outcomeHistory.TH3_ITM_NM}">
														</td>
														<td align="center">${outcomeHistory.PRCDOC_NO}</td>
														<td align="left">${outcomeHistory.TEST_NM}</td>
														<td align="left">${outcomeHistory.TITL_NM}</td>
														<td align="left">${outcomeHistory.TH1_ITM_NM} ${outcomeHistory.TH2_ITM_NM} ${outcomeHistory.TH3_ITM_NM}</td>
														<td align="center" title="${outcomeHistory.STDVL_VAL_NM}">${outcomeHistory.AGMST_VAL}</td>
														<td align="center">${outcomeHistory.UNIT_NM}</td>
														<td align="center">${outcomeHistory.REGPR_NM}</td>
														<td align="center">${outcomeHistory.FM_MSNT_DT}</td>
														<td align="center">${outcomeHistory.PAGE_NO}</td>
													</tr>
												</c:forEach>
												<c:if test="${outcomeList.size() eq 0}">
													<tr class="Item">
														<td colspan="10" style="text-align: center;">조회된 자료가 없습니다.</td>
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