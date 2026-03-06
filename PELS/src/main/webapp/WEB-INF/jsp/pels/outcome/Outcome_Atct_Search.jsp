<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			
			$('#CHCK_STRT_DT').val('${CHCK_STRT_DT}');
			$('#CHCK_END_DT').val('${CHCK_END_DT}');
		})
		
		// 결과관리 점검관리(붙임) 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Outcome_Atct_Search.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Outcome_Atct_Search.do"
			form.submit()
		}				
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}
		
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
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
								<span class="title">점검지</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">결과관리</a>
										</li>
										<li class="active">점검지</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
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
													<col style="width:20%" />
													<col class="Title" />
													<col style="width:20%" />
                                                    <col class="Title" />
                                                    <col style="width:30%" />
                                                    <col class="Title" />
                                                    <col style="width:30%" />
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
                                                    <td class="Title"><span class="Label">절차서번호</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_NO" id="PRCDOC_NO" value="" style="width:120px;" />
                                                    </td>
													<td class="Title">절차서명</td>
													<td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_TITL" id="PRCDOC_TITL" value="" style="width:300px;" />
													</td>
													<td class="Title">시험일자</td>
													<td class="Value">
														<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();"/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_STRT_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
														~
														<input name="CHCK_END_DT" id="CHCK_END_DT" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();"/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_END_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
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
											<span class="SubTitle">시험수행현황</span><span class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
											<a class="btn-c" href="#"><span class="Text">엑셀다운로드</span></a>
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="200px" />
                                                    <col width="150px" />
													<col width="*" />
                                                    <col width="25%" />
                                                    <col width="100px" />
                                                    <col width="100px" />
                                                    <col width="100px" />
												</colgroup>
												<tr class="Header">
                                                    <th>시험기간</th>
													<th>절차서번호</th>
													<th>절차서명 [붙임명]</th>
                                                    <th>시험명</th>
                                                    <th>완료자</th>
                                                    <th>완료일</th>
                                                    <th>점검결과</th>
												</tr>
												<c:forEach var="outcome" items="${outcomeList}" begin="0" end="${outcomeList.size()}" step="1">
													<tr class="Item">
														<td align="center">${outcome.CHCK_DT}</td>
														<td align="center">${outcome.PRCDOC_NO}</td>
														<td align="left">
													    <a href="/Outcome_Item_Search.do?URL=Outcome_Atct_Search.do&TST_UNQ_KY_VAL=${outcome.TST_UNQ_KY_VAL}&FRM_UNQ_KY_VAL=${outcome.FRM_UNQ_KY_VAL}&ATCT_CFY=${outcome.ATCT_CFY}">
														${outcome.PRCDOC_NM} <font color="blue">[${outcome.ATCT_NM}]</font></a>
														</td>
														<td align="left">${outcome.TITL_NM}</td>
														<td align="center">${outcome.CHKPR_FNM}</td>
														<td align="center">${outcome.FM_RG_DT}</td>
														<td align="center">
														<c:choose>
															<c:when test="${null eq outcome.OZD_FNAME1}">
																미수행
															</c:when>
															<c:otherwise>
																<a class="InfoButton" href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${outcome.OZD_FNAME1}','','width=1000,height=800');"><span class="Text">보기</span></a>
															</c:otherwise>
														</c:choose>														
													
														</td>
													</tr>
												</c:forEach>
												<c:if test="${outcomeList.size() eq 0}">
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