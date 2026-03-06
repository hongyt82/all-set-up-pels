<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		// 등록화면으로 이동
		function fnBoardInput () {
			let form = document.getElementById('form')
			form.action = "Board_Input.do"
			form.submit()
		}
		
		// 수정 화면으로 이동
		function fnBoardDetail(chkParam) {
			let form = document.getElementById('form')
			
			form.action = "Board_Detail.do?BLBR_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}
		
		// 수정 화면으로 이동
		function fnBoardUpdate() {
			const chkElements = $('#form input[name=CHK_ITEM]')
			const chkElement2 = $('#form input[name=FIRST_INPPR_ID]')
			let chkCnt = 0;
			let chkParam = '';
			let chkParam2 = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					chkParam = $(chkElements[i]).val();
					chkParam2 = $(chkElement2[i]).val();
				}
			}
			
			if (chkCnt == 0) {
				alert('수정할 자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('수정하기 위해서는 하나만 선택해야 합니다.')
				return
			}

			if('${GRADE}' != "001") {
				if(chkParam2 != '${LOGIN_USER_ID}') {
					alert("수정 권한이 없습니다.");
					return;
				}
			}
			
			let form = document.getElementById('form')
			form.action = "Board_Update.do?BLBR_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}		
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Board_Search.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Board_Search.do"
			form.submit()
		}		
		
		// 절차서관리 삭제
		function fnBoardDelete () {
			const chkElements = $('#form input[name=CHK_ITEM]')
			const chkElement2 = $('#form input[name=FIRST_INPPR_ID]')
			let chkCnt = 0;
			let chkParams = '';
			let chkParam2 = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					if('' == chkParams) {
						chkParams = $(chkElements[i]).val();	
					} else {
						chkParams += ', ' + $(chkElements[i]).val();
						chkParam2 = $(chkElement2[i]).val();
					}
				}
			}
			
			if (chkCnt == 0) {
				alert('삭제할 자료를 선택하여 주십시오.')
				return
			}
			
			if('${GRADE}' != "001") {
				if(chkParam2 != '${LOGIN_USER_ID}') {
					alert("삭제 권한이 없습니다.");
					return;
				}
			}			
			
			if (!confirm('정말로 삭제 하시겠습니까?')) return
			
			let params = new Object()
			params.BLBR_UNQ_KY_VAL = chkParams;
			params.GRUP_CFY_CD = $('#GRUP_CFY_CD').val();
			
			$.ajax({
				type: 'POST',
				url: 'Board_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.action = "Board_Search.do"
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
		
		function fnDownLoad(ATFL_PHCL_NM, ATFL_ORSRC_NM)
		{
			let form = document.getElementById('form')
			form.action = "FileDownload.do";
			form.ATFL_PHCL_NM.value = ATFL_PHCL_NM;
			form.ATFL_ORSRC_NM.value = ATFL_ORSRC_NM;
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
	<input type="hidden" name="GRUP_CFY_CD" value="${GRUP_CFY_CD}">
	<input type="hidden" name="BLBR_UNQ_KY_VAL" value="${BLBR_UNQ_KY_VAL}">
    <input type="hidden" class="TextBox" name="ATFL_PHCL_NM" id="ATFL_PHCL_NM" value=""/>
    <input type="hidden" class="TextBox" name="ATFL_ORSRC_NM" id="ATFL_ORSRC_NM" value=""/>
			
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<c:if test="${GRUP_CFY_CD eq 'A'}">
								<span class="title">고장신고 및 개선의견</span>
								</c:if>
								<c:if test="${GRUP_CFY_CD eq 'B'}">
								<span class="title">자료실</span>
								</c:if>
								<c:if test="${GRUP_CFY_CD eq 'C'}">
								<span class="title">공지사항</span>
								</c:if>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">HELP DESK</a>
										</li>
										<c:if test="${GRUP_CFY_CD eq 'A'}">
										<li class="active">고장신고 및 개선의견</li>
										</c:if>
										<c:if test="${GRUP_CFY_CD eq 'B'}">
										<li class="active">자료실</li>
										</c:if>
										<c:if test="${GRUP_CFY_CD eq 'C'}">
										<li class="active">공지사항</li>
										</c:if>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnBoardInput();"><span class="Text">등록</span></a>
                            <a class="btn-m" href="javascript:fnBoardUpdate();"><span class="Text">수정</span></a>
                            <a class="btn-m" href="javascript:fnBoardDelete();"><span class="Text">삭제</span></a>
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
                                                    <td class="Title"><span class="Label">제목</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="BLBR_TITL_NM" id="BLBR_TITL_NM" value="${BLBR_TITL_NM}" style="width:300px;" />
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
													<col width="70px" />
													<col width="*" />
                                                    <col width="200px" />
													<col width="200px" />
                                                    <col width="100px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>제목</th>
													<th>등록자</th>
													<th>등록일</th>
													<th>첨부파일</th>
												</tr>
												<c:forEach var="board" items="${boardList}" begin="0" end="${TCNT}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold">
														<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" onclick="checkOnlyOne(this)" value="${board.BLBR_UNQ_KY_VAL}">
														<input name="UPDR_ID" id="UPDR_ID" type="hidden" value="${board.FIRST_INPPR_ID}">
														</td>
														<td><a href="javascript:fnBoardDetail(${board.BLBR_UNQ_KY_VAL});">${board.BLBR_TITL_NM}</a></td>
														<td align="center">${board.UPDR_NM}</td>
														<td align="center">${board.FM_MDF_DT}</td>
														<td align="center">
														<c:choose>
															<c:when test="${null ne board.FNAME1}">
																	<a  class="SubButton" href="javascript:fnDownLoad('${board.FNAME1}','${board.ONAME1}');"><span class="Text">다운로드</span></a>
															</c:when>
														</c:choose>
														</td>
													</tr>
												</c:forEach>
												<c:if test="${TCNT eq 0}">
													<tr class="Item">
														<td colspan="5" style="text-align: center;">조회된 자료가 없습니다.</td>
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