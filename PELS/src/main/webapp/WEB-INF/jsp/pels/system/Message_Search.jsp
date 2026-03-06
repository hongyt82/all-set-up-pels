<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Message_Search.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Message_Search.do"
			form.submit()
		}	
		
		function fnPrevSearch () {
			let form = document.getElementById('form')
			form.action = "Outcome_Search.do"
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
			<input type="hidden" name="PRCDOC_CFY" value="${PRCDOC_CFY}">
			<input type="hidden" name="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">알림창 이력</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">시스템관리</a>
										</li>
										<li class="active">알림창 이력</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<c:if test="${'P' eq PRCDOC_CFY}">
			            		<a class="btn-m" href="javascript:fnPrevSearch();"><span class="Text">이전 화면</span></a>
							</c:if>
							<c:if test="${'M' eq PRCDOC_CFY}">
			            		<a class="btn-m" href="javascript:fnPrevSearch();"><span class="Text">이전 화면</span></a>
							</c:if>
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
                                                    <col style="width:20%" />
                                                    <col class="Title" />
                                                    <col style="width:20%" />
                                                    <col class="Title" />
                                                    <col style="width:20%" />
												</colgroup>
												<tr>
                                                    <td class="Title"><span class="Label">시험명</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="SH_TITL_NM" id="SH_TITL_NM" value="${SH_TITL_NM}" style="width:300px;" />
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
											<span class="SubTitle"></span><span class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
                                                    <col width="250px" />
													<col width="200px" />
													<col width="200px" />
													<col width="*" />
                                                    <col width="100px" />
													<col width="100px" />
													<col width="200px" />
                                                    <col width="200px" />
												</colgroup>
												<tr class="Header">
													<th>절차서 제목</th>
													<th>시험명</th>
													<th>시험기간</th>
													<th>알림내용</th>
													<th>작성자ID</th>
													<th>작성자</th>
													<th>작성시간</th>
													<th>부서명</th>
												</tr>
												<c:forEach var="message" items="${MessageList}" begin="0" end="${TCNT}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold">${message.PRCDOC_NM}</td>
														<td align="center">${message.TITL_NM}</td>
														<td align="center">${message.CHCK_STRT_DT} ~ ${message.CHCK_STRT_DT}</td>
														<td align="left">${message.MSG_CTT}</td>
														<td align="center">${message.REGPR_ID}</td>
														<td align="center">${message.REGPR_NM}</td>
														<td align="center">${message.FM_RG_DT}</td>
														<td align="center">${message.RELTN_SCTN_NM}</td>
													</tr>
												</c:forEach>
												<c:if test="${TCNT eq 0}">
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