<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
		})
		
		// 등록 화면으로 이동
		function fnFormIdInput () {
			let form = document.getElementById('form')
			form.action = "Form_Id_Input.do?&subTitleCfy=${subTitleCfy}"
			form.submit()
		}
		
		// 수정 화면으로 이동
		function fnFormIdDetail () {
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
				alert('수정할 자료를 선택하여 주십시오.')
				return
			}

			let form = document.getElementById('form')
			form.action = "Form_Id_Detail.do?&subTitleCfy=${subTitleCfy}"
			form.FRM_ID.value = chkParams;
			form.submit()
		}
		
		function fnSearch () {
			
			let form = document.getElementById('form')
			form.action = "Form_Id_Search.do"
			form.submit()
		}
		
		// 절차서관리 삭제
		function fnFormIdDelete () {
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
			params.CHK_ITEM = chkParams;
			params.FRM_UNQ_KY_VAL = '${FRM_UNQ_KY_VAL}';
			
			$.ajax({
				type: 'POST',
				url: 'Form_Id_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					alert(resultData.resultMsg);
					location.href = '/Form_Id_Search.do?&FRM_UNQ_KY_VAL=${FRM_UNQ_KY_VAL}';
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
			form.action = "Form_Id_Search.do"
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
	<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" value="${FRM_UNQ_KY_VAL}"/>
	<input name="PRCDOC_UNQ_KY_VAL" id="PRCDOC_UNQ_KY_VAL" type="hidden" value="${PRCDOC_UNQ_KY_VAL}"/>
	<input name="FRM_ID" id="FRM_ID" type="hidden" value=""/>
			<div class="page-content">
				<div class="page-content-area">
					<!-- #ection:basics/page-header -->
					<div class="page-header">
						<h1>
							<span class="title">DB항목관리</span>
							<span>
								<ul class="breadcrumb">
									<li>
										<a href="#">절차서(서식)관리</a>
									</li>
									<li>
	                                    <a href="#">${subTitle}</a>
	                                </li>
									<li class="active">DB항목관리</li>
								</ul><!-- /.breadcrumb -->
							</span>
						</h1>
					</div><!-- /page-header -->
					<!-- #section:basics/page-button -->
					<div class="PageButtonGroup" style="text-align:right">
						<a class="btn-m" href="javascript:fnFormIdInput();"><span class="Text">등록</span></a>
                           <a class="btn-m" href="javascript:fnFormIdDetail();"><span class="Text">수정</span></a>
                           <a class="btn-m" href="javascript:fnFormIdDelete();"><span class="Text">삭제</span></a>
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
										<col style="width:80%" />
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
												<td class="Title">제목명</td>
												<td class="Value">
                                                	<input type="text" class="TextBox" name="TITL_NM" id="TITL_NM" style="width:300px;" value="${TITL_NM}"/>
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
												<col width="*" />
												<col width="180px" />
												<col width="180px" />
												<col width="180px" />
												<col width="100px" />
												<col width="150px" />
												<col width="70px" />
												<col width="150px" />
											</colgroup>
											<tr class="Header">
												<th>선택</th>
												<th>제목명</th>
												<th>분류1</th>
												<th>분류2</th>
												<th>분류3</th>
												<th>단위</th>
												<th>기준치</th>
												<th>연계여부</th>
												<th>연계태그</th>
											</tr>
											<c:forEach var="formId" items="${formIdList}" begin="0" end="${formIdList.size()}" step="1">
												<tr class="Item">
													<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox"  onclick="checkOnlyOne(this)" value="${formId.FRM_ID}"></td>
													<!-- <td align="center">${formId.FRM_ID}</td> -->
													<td align="left">${formId.TITL_NM}</td>
													<td align="left">${formId.TH1_ITM_NM}</td>
													<td align="left">${formId.TH2_ITM_NM}</td>
													<td align="left">${formId.TH3_ITM_NM}</td>
													<td align="center">${formId.UNIT_NM}</td>
													<td align="center">${formId.STDVL_VAL_NM}</td>
													<td align="center">${formId.FM_CNIF_YN}</td>
													<td align="center">${formId.CNIF_TAG_NM}</td>
												</tr>
											</c:forEach>
											<c:if test="${formIdList.size() eq 0}">
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