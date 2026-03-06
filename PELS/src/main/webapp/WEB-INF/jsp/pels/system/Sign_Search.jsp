<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Sign_Search.do"
			form.target = "_self";
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Sign_Search.do"
			form.target = "_self";
			form.submit()
		}	
		
		function MM_openSIGN(APLPR_ID)
		{
			window.open("", "PopupOpen", "width=1000,height=800");
			
			let form = document.getElementById('form')
			form.action = "SignViewer.do";
			form.target = "PopupOpen"; 
			form.APLPR_ID.value = APLPR_ID;
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
			<input type="hidden" id="PPCD" name="PPCD" value="${PPCD}">
			<input type="hidden" id="APLPR_ID" name="APLPR_ID" value="">
			<input type="hidden" id="SIGN_DATA" name="SIGN_DATA" value="">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">사인관리</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">시스템관리</a>
										</li>
										<li class="active">사인관리</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
                            <!-- <a class="btn-m" href="javascript:fnDelete();"><span class="Text">삭제</span></a> -->
						</div>
						<!-- /page-button-->
						<div class="row">
							<div class="col-xs-12">
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
													<td class="Title"><span class="Label">발전소</span></td>
													<td class="Value">
														<select name="SH_PPCD" id="SH_PPCD">
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
											<span class="SubTitle"></span><span class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
											<!-- <a class="InfoButton" href="javascript:downloadExcelFile();"><span class="Text">엑셀 다운로드</span></a> -->
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
                                                    <col width="200px" />
                                                    <col width="200px" />
                                                    <col width="200px" />
                                                    <col width="120px" />
                                                    <col width="*" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>사번</th>
													<th>성명</th>
													<th>등록일</th>
													<th>사인</th>
													<th>비고</th>
												</tr>
												<c:forEach var="sign" items="${signList}" begin="0" end="${signList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" onclick="checkOnlyOne(this)" value="${sign.APLPR_ID}"></td>
														<td align="center">${sign.APLPR_ID}</td>
														<td align="center">${sign.APLPR_NM}</td>
														<td align="center">${sign.FM_APRV_DT}</td>
														<td align="center">
															<a class="SubButton" href="javascript:MM_openSIGN('${sign.APLPR_ID}');"><span class="Text">보기</span></a>
														</td>
														<td align="center"></td>
													</tr>
												</c:forEach>
												<c:if test="${signList.size() eq 0}">
													<tr class="Item">
														<td colspan="6" style="text-align: center;">조회된 자료가 없습니다.</td>
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