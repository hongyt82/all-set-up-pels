<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
		})
		
		// 등록화면으로 이동
		function fnInput () {
			let form = document.getElementById('form')
			form.action = "QR_Input.do"
			form.submit()
		}
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "QR_Search.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "QR_Search.do"
			form.submit()
		}		
		
		// 절차서관리 삭제
		function fnDelete () {
			const chkElements = $('#form input[name=CHK_ITEM]')
			let chkCnt = 0;
			let chkParams = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					if('' == chkParams) {
						chkParams = $(chkElements[i]).val();	
					} else {
						chkParams += ', ' + $(chkElements[i]).val();
					}
				}
			}
			
			if (chkCnt == 0) {
				alert('삭제할 자료를 선택하여 주십시오.')
				return
			}
			
			if (!confirm('정말로 삭제 하시겠습니까?')) return
			
			let params = new Object()
			params.PRCDOC_UNQ_KY_VAL = $('#PRCDOC_UNQ_KY_VAL').val();
			params.LOCT_NM = chkParams;
			
			$.ajax({
				type: 'POST',
				url: 'QR_Delete_Ajax.do',
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
						alert('절차서 삭제에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('절차서 삭제에 실패하였습니다.');
				}
			})
		}
		
		function fnPrevSearch () {
			let form = document.getElementById('form')
			form.action = "Proc_Search.do"
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
			<input type="hidden" id="PRCDOC_CFY" name="PRCDOC_CFY" value="${PRCDOC_CFY}">
			<input type="hidden" id="PRCDOC_UNQ_KY_VAL" name="PRCDOC_UNQ_KY_VAL" value="${PRCDOC_UNQ_KY_VAL}">
			<input type="hidden" id="PPCD" name="PPCD" value="${PPCD}">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">QR관리</span>
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
										<li class="active">QR관리</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnInput();"><span class="Text">등록</span></a>
                            <a class="btn-m" href="javascript:fnDelete();"><span class="Text">삭제</span></a>
                            <a class="btn-m" href="javascript:fnPrevSearch();"><span class="Text">이전화면</span></a>
						</div>
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
							
								<div class="RealPanel">
									<div class="Title">
										<div class="TitleArea">
											<span class="SubTitle"></span><span class="count">총 ${TCNT} 건</span>
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
                                                    <col width="40%" />
                                                    <col width="60%" />
                                                    <col width="120px" />
                                                    <col width="120px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>현장위치</th>
													<th>QR식별자</th>
													<th>등록자</th>
													<th>등록일</th>
												</tr>
												<c:forEach var="qr" items="${qrList}" begin="0" end="${qrList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" onclick="checkOnlyOne(this)" value="${qr.LOCT_NM}"></td>
														<td>${qr.LOCT_NM}</td>
														<td>${qr.QR_CD_INFO}</td>
														<td align="center">${qr.REGPR_NM}</td>
														<td align="center">${qr.FM_RG_DT}</td>
													</tr>
												</c:forEach>
												<c:if test="${procedureList.size() eq 0}">
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