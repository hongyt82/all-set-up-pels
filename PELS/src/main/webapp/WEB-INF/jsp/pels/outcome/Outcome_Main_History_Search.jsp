<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#CHCK_STRT_DT').val('${CHCK_STRT_DT}');
			$('#CHCK_END_DT').val('${CHCK_END_DT}');
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
			$('#TST_UNQ_KY_VAL').val('${TST_UNQ_KY_VAL}');
		})
		
		// 결과관리 시험(점검)자료이력정보 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Outcome_Main_History_Search.do"
			form.submit()
		}
		
		function fnParent () {
			let form = document.getElementById('form')
			form.action = "${URL}"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Outcome_Main_History_Search.do"
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
		
	</script>
	<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
	<input type="hidden" name="PAGE" value="${PAGE}">
	<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
	<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
	<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
	<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
	
	<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" value="${FRM_UNQ_KY_VAL}">
	<input name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" type="hidden" value="${TST_UNQ_KY_VAL}">
	<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" value="${PRCDOC_CFY}">

	<input name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" type="hidden" value="${SH_PRCDOC_NO}">
	<input name="SH_PRCDOC_NM" id="SH_PRCDOC_NM" type="hidden" value="${SH_PRCDOC_NM}">
	<input name="SH_TITL_NM" id="SH_TITL_NM" type="hidden" value="${SH_TITL_NM}">
	<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" type="hidden" value="${CHCK_STRT_DT}">
	<input name="CHCK_END_DT" id="CHCK_END_DT" type="hidden" value="${CHCK_END_DT}">
	<input name="SH_SORT" id="SH_SORT" type="hidden" value="${SH_SORT}">
	<input name="URL" id="URL" type="hidden" value="${URL}">
	
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">시험(점검)자료 이력</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">결과관리</a>
							</li>
							<li class="active">시험(점검)자료이력</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>
			</div><!-- /page-header -->
			<!-- #section:basics/page-button -->
			<div class="PageButtonGroup" style="text-align:right">
				<a class="btn-m" href="javascript:fnChart();"><span class="Text">트랜드</span></a>
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
									<col style="width:20%" />
									<col class="Title" />
									<col style="width:30%" />
									<col class="Title" />
									<col style="width:30%" />
								</colgroup>
                                <tr class="Row">
                                    <th class="Title"><span class="Label">시험기간</span></th>
                                    <td class="Value">
                                    	${examDetail.FM_CHCK_STRT_DT} ~ ${examDetail.FM_CHCK_END_DT}
                                    </td>
                                    <th class="Title"><span class="Label">절차서번호</span></th>
                                    <td class="Value">
                                    	${examDetail.PRCDOC_NO}
                                   	</td>
                                    <th class="Title"><span class="Label">절차서명</span></th>
                                    <td class="Value">
                                    	${examDetail.PRCDOC_NM}
                                    </td>
                                    <th class="Title"><span class="Label">제목</span></th>
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
                                               <col class="Title" />
                                               <col style="width:25%" />
										</colgroup>
										<tr>
											<td class="Title">제목</td>
											<td class="Value">
                                               	<input type="text" class="TextBox" name="SH_TITL_NM" id="SH_TITL_NM" style="width:300px;" value="${SH_TITL_NM}"/>
											</td>
											<td class="Title">분류</td>
											<td class="Value">
                                               	<input type="text" class="TextBox" name="SH_ITM_NM" id="SH_ITM_NM" style="width:300px;" value="${SH_ITM_NM}"/>
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
									<a class="btn-c" href="#"><span class="Text">엑셀다운로드</span></a>
								</div>
							</div>
							<div class="ContentPanel">
								<div class="StatusGrid">
									<table cellspacing="0" cellpadding="0" border="0" class="Outline">
										<colgroup>
											<col width="70px" />
											<col width="30%" />
                                            <col width="*" />
                                            <col width="150px" />
                                            <col width="80px" />
                                            <col width="80px" />
                                            <col width="80px" />
                                            <col width="150px" />
                                            <col width="60px" />
										</colgroup>
										<tr class="Header">
											<th>선택</th>
                                            <th>제목</th>
                                            <th>분류</th>
                                            <th>기준값</th>
                                            <th>기록값</th>
                                            <th>단위</th>
                                            <th>기록자</th>
                                            <th>기록일시</th>
                                            <th>페이지</th>
										</tr>
										<c:forEach var="outcomeHistory" items="${outcomeHistoryList}" begin="0" end="${outcomeHistoryList.size()}" step="1">
											<tr class="Item">
												<td align="center" style="font-weight:bold">
													<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" onclick="checkOnlyOne(this)" value="${outcomeHistory.TST_UNQ_KY_VAL}">
													<input name="FRM_ID" id="FRM_ID" type="hidden" value="${outcomeHistory.FRM_ID}">
													<input name="TITL_NM" id="FRM_ID" type="hidden" value="${outcomeHistory.TITL_NM}">
													<input name="TH1_ITM_NM" id="TH1_ITM_NM" type="hidden" value="${outcomeHistory.TH1_ITM_NM}">
													<input name="TH2_ITM_NM" id="TH2_ITM_NM" type="hidden" value="${outcomeHistory.TH2_ITM_NM}">
													<input name="TH3_ITM_NM" id="TH3_ITM_NM" type="hidden" value="${outcomeHistory.TH3_ITM_NM}">
												</td>
												<td align="left">${outcomeHistory.TITL_NM}</td>
												<td align="left">${outcomeHistory.TH1_ITM_NM} ${outcomeHistory.TH2_ITM_NM} ${outcomeHistory.TH3_ITM_NM}</td>
												<td align="center">${outcomeHistory.STDVL_VAL_NM}</td>
												<td align="center">${outcomeHistory.AGMST_VAL}</td>
												<td align="center">${outcomeHistory.UNIT_NM}</td>
												<td align="center">${outcomeHistory.REGPR_NM}</td>
												<td align="center">${outcomeHistory.FM_MSNT_DT}</td>
												<td align="center">${outcomeHistory.PAGE_NO}</td>
											</tr>
										</c:forEach>
										<c:if test="${outcomeList.size() eq 0}">
											<tr class="Item">
												<td colspan="8" style="text-align: center;">조회된 자료가 없습니다.</td>
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