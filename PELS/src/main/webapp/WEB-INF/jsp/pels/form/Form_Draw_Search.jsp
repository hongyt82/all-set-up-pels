<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		// 등록 화면으로 이동
		function fnFormDrawInput () {
			let form = document.getElementById('form')
			form.action = "Form_Draw_Input.do?&subTitleCfy=${subTitleCfy}"
			form.submit()
		}
		
		// 수정 화면으로 이동
		function fnFormDrawDetail () {
			const chkElements = $('#form input[name=CHK_ITEM]')
			const chkFRM_ID = $('#form input[name=L_FRM_ID]')
			const chkDOC_UNQ_ID = $('#form input[name=L_DOC_UNQ_ID]')
			
			let chkCnt = 0;
			let chkParams1 = '';
			let chkParams2 = '';
			let chkParams3 = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					chkParams1 = $(chkElements[i]).val();
					chkParams2 = $(chkFRM_ID[i]).val();
					chkParams3 = $(chkDOC_UNQ_ID[i]).val();					
					break;
				}
			}
			
			if (chkCnt == 0) {
				alert('수정할 자료를 선택하여 주십시오.')
				return
			}
			
			let form = document.getElementById('form')
			form.action = "Form_Draw_Detail.do"
			form.FRM_ID.value = chkParams2;
			form.DOC_UNQ_ID.value = chkParams3;
			form.submit()
		}
		
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Form_Draw_Search.do"
			form.submit()
		}
		
		// 절차서관리 삭제
		function fnFormDrawDelete () {
			const chkElements = $('#form input[name=CHK_ITEM]')
			const chkFRM_ID = $('#form input[name=L_FRM_ID]')
			const chkDOC_UNQ_ID = $('#form input[name=L_DOC_UNQ_ID]')
		
			let chkCnt = 0;
			let chkParams1 = '';
			let chkParams2 = '';
			let chkParams3 = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					chkParams1 = $(chkElements[i]).val();
					chkParams2 = $(chkFRM_ID[i]).val();
					chkParams3 = $(chkDOC_UNQ_ID[i]).val();					
					break;
				}
			}
			
			if (chkCnt == 0) {
				alert('삭제할 자료를 선택하여 주십시오.')
				return
			}
			
			if (!confirm('정말로 삭제 하시겠습니까?')) return
			
			let params = new Object()
			params.CHK_ITEM = chkParams1;
			params.FRM_ID = chkParams2;
			params.DOC_UNQ_ID = chkParams3;
			
			$.ajax({
				type: 'POST',
				url: 'Form_Draw_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					alert(resultData.resultMsg);
					 fnSearch();
				},
				error: function () {
					alert('폼ID 삭제에 실패하였습니다.');
				}
			})
		}
		
		function fnParent()
		{
			let form = document.getElementById('form')
			form.action = "Form_Update.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Form_Draw_Search.do"
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
	<input name="PRCDOC_NO" id="PRCDOC_NO" type="hidden" value="${PRCDOC_NO}"/>
	<input name="PRCDOC_NM" id="PRCDOC_NM" type="hidden" value="${PRCDOC_NM}"/>
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">도면연계관리</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">절차서(서식)관리</a>
							</li>
							<li>
                                   <a href="#">${subTitle}</a>
                               </li>
							<li class="active">도면연계관리</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>
			</div><!-- /page-header -->
			<!-- #section:basics/page-button -->
			<div class="PageButtonGroup" style="text-align:right">
				<a class="btn-m" href="javascript:fnFormDrawInput();"><span class="Text">등록</span></a>
                         <a class="btn-m" href="javascript:fnFormDrawDetail();"><span class="Text">수정</span></a>
                         <a class="btn-m" href="javascript:fnFormDrawDelete();"><span class="Text">삭제</span></a>
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
										<td class="Title">폼ID</td>
										<td class="Value">
                                              	<input type="text" class="TextBox" name="SH_FRM_ID" id="SH_FRM_ID" style="width:200px;" value="${SH_FRM_ID}"/>
										</td>
										<td class="Title">문서번호</td>
										<td class="Value">
                                              	<input type="text" class="TextBox" name="SH_DOC_UNQ_ID" id="SH_DOC_UNQ_ID" style="width:200px;" value="${SH_DOC_UNQ_ID}"/>
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
								<span class="SubTitle">조회건수</span><span class="count">총 ${TCNT} 건</span>
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
										<col width="250px" />
										<col width="250px" />
										<col width="180px" />
										<col width="180px" />
										<col width="*" />
									</colgroup>
									<tr class="Header">
										<th>선택</th>
										<th>폼ID</th>
										<th>문서번호</th>
										<th>문서유형</th>
										<th>문서부분코드</th>
										<th>비고</th>
									</tr>
									<c:forEach var="formDraw" items="${formDrawList}" begin="0" end="${formDrawList.size()}" step="1">
										<tr class="Item">
											<input type="hidden" name="FRM_ID" value="${formDraw.FRM_ID}">
											<input type="hidden" name="DOC_UNQ_ID" value="${formDraw.DOC_UNQ_ID}">
											<td align="center" style="font-weight:bold">
												<input name="CHK_ITEM" id="CHK_ITEM"   onclick="checkOnlyOne(this)" type="checkbox"  onclick="checkOnlyOne(this)" value="${formDraw.UNQ_KY_VAL}">
											</td>
											<!-- <td align="center">${formId.FRM_ID}</td> -->
											<td align="center">${formDraw.FRM_ID}</td>
											<td align="center">${formDraw.DOC_UNQ_ID}</td>
											<td align="center">${formDraw.DOC_TYP}</td>
											<td align="center">${formDraw.DOC_PART_CD}</td>
											<td align="center"></td>
										</tr>
									</c:forEach>
									<c:if test="${formDrawList.size() eq 0}">
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