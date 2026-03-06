<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#SH_PRCDOC_NO').val('${SH_PRCDOC_NO}');
			$('#SH_PRCDOC_NM').val('${SH_PRCDOC_NM}');
		})
		
		// 등록화면으로 이동
		function fnProcedureInput () {
			let form = document.getElementById('form')
			form.action = "Proc_Input.do"
			form.submit()
		}
		
		// 수정 화면으로 이동
		function fnProcedureDetail() {
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
				alert('수정할 자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('수정하기 위해서는 하나만 선택해야 합니다.')
				return
			}
			
			let form = document.getElementById('form')
			form.action = "Proc_Detail.do?PRCDOC_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Proc_Search.do"
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Proc_Search.do"
			form.submit()
		}		
		
		// 절차서관리 삭제
		function fnProcedureDelete () {
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
			
			$.ajax({
				type: 'POST',
				url: 'Proc_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.action = "Proc_Search.do"
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
		
		// 수정 화면으로 이동
		function fnFormUpdate() {
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
				alert('서식등록 할 자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('서식등록 하기 위해서는 하나만 선택해야 합니다.')
				return
			}
			
			let form = document.getElementById('form')
			form.action = "Form_Update.do?PRCDOC_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}	
		
		function fnQR() {
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
				alert('QR등록 할 자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('QR등록 하기 위해서는 하나만 선택해야 합니다.')
				return
			}
			
			let form = document.getElementById('form')
			form.action = "QR_Search.do?PRCDOC_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}			
		
		function fnWords() {
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
			form.action = "Words_Search.do?PRCDOC_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}			

		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}	
		
		function downloadExcelFile () {
			let form = document.getElementById('form')
			form.action = '/Proc_Excel.do'
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
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<c:if test="${PRCDOC_CFY eq 'P'}">
								<span class="title">정주기시험</span>
								</c:if>
								<c:if test="${PRCDOC_CFY eq 'M'}">
								<span class="title">점검지</span>
								</c:if>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">절차서(서식)관리</a>
										</li>
										<c:if test="${PRCDOC_CFY eq 'P'}">
										<li class="active">정주기시험</li>
										</c:if>
										<c:if test="${PRCDOC_CFY eq 'M'}">
										<li class="active">점검지</li>
										</c:if>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnProcedureInput();"><span class="Text">등록</span></a>
                            <a class="btn-m" href="javascript:fnProcedureDetail();"><span class="Text">수정</span></a>
                            <a class="btn-m" href="javascript:fnProcedureDelete();"><span class="Text">삭제</span></a>
							<a class="btn-m" href="javascript:fnFormUpdate();"><span class="Text">서식등록</span></a>
							<c:if test="${PRCDOC_CFY eq 'M'}">
							<a class="btn-m" href="javascript:fnQR();"><span class="Text">QR관리</span></a>
							<a class="btn-m" href="javascript:fnWords();"><span class="Text">자주쓰는문구관리</span></a>
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
													<td class="Title"><span class="Label">발전소</span></td>
													<td class="Value">
														<select name="SH_PPCD" id="SH_PPCD">
														<c:forEach var="plant" items="${plantList}" begin="0" end="${plantList.size()}" step="1">
															<option value="${plant.PPCD}">${plant.PWPL_NM}</option>
														</c:forEach>
														</select>
													</td>
                                                    <td class="Title"><span class="Label">절차서번호</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" value="${SH_PRCDOC_NO}" style="width:120px;" />
                                                    </td>
													<td class="Title">절차서명</td>
													<td class="Value">
                                                        <input type="text" class="TextBox" name="SH_PRCDOC_NM" id="SH_PRCDOC_NM" value="${SH_PRCDOC_NM}" style="width:220px;" />
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
											<span class="SubTitle">절차서 현황</span><span class="count">총 ${TCNT} 건</span>
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
													<col width="150px" />
													<col width="*" />
													<c:if test="${PRCDOC_CFY eq 'M'}">
													<col width="*" />
													</c:if>
                                                    <col width="200px" />
													<col width="100px" />
													<col width="100px" />
                                                    <col width="80px" />
                                                    <col width="80px" />
                                                    <col width="80px" />
                                                    <col width="100px" />
													<c:if test="${PRCDOC_CFY eq 'P'}">
                                                    <col width="80px" />
													</c:if>
													<c:if test="${PRCDOC_CFY eq 'M'}">
                                                    <col width="80px" />
													</c:if>
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>절차서번호</th>
													<th>절차서명</th>
													<c:if test="${PRCDOC_CFY eq 'M'}">
													<th>점검지명</th>
													</c:if>
													<th>절차서기능위치</th>
													<th>LDM최종버젼</th>
													<th>서식최종버젼</th>
													<th>문서유형</th>
													<th>문서부분번호</th>
													<th>서식</th>
													<th>등록일</th>
													<c:if test="${PRCDOC_CFY eq 'P'}">
													<th>DB갯수</th>
													</c:if>
													<c:if test="${PRCDOC_CFY eq 'M'}">
													<th>QR갯수</th>
													</c:if>
												</tr>
												<c:forEach var="procedure" items="${procedureList}" begin="0" end="${procedureList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" onclick="checkOnlyOne(this)" value="${procedure.PRCDOC_UNQ_KY_VAL}"></td>
														<td>${procedure.PRCDOC_NO}</td>
														<td align="left">${procedure.PRCDOC_NM}</td>
														<c:if test="${PRCDOC_CFY eq 'M'}">
														<td align="left">${procedure.ATCT_NM}</td>
														</c:if>
														<td align="center">${procedure.FNCLC_ID}</td>
														<td align="center">${procedure.PRCDOC_RVSN_NO}</td>
														<td align="center">${procedure.PRCDOC_RVSN_NO}</td>
														<td align="center">${procedure.DOC_TYP}</td>
														<td align="center">${procedure.DOC_PART_NO}</td>
														<td align="center">
														<c:if test="${procedure.FRM_CNT > 0}">
														
															<a href="javascript:MM_openBrWindow('KhnpEditor.do?FRM_UNQ_KY_VAL=${procedure.FRM_UNQ_KY_VAL}','','width='+ screen.width + ',height=' +  screen.height);">
																편집
															</a>
														
															<!-- <a  class="SubButton" href="javascript:MM_openBrWindow('OzrViewer.do?ATFL_GRUP_NM=GE_MP_FRM_M&FRM_UNQ_KY_VAL=${procedure.FRM_UNQ_KY_VAL}','','width=1000,height=800');"><span class="Text">보기</span></a> -->
														</c:if>
														<c:if test="${procedure.FRM_CNT == 0}">
														미등록
														</c:if>
														</td>
														<td align="center">${procedure.FM_RG_DT}</td>
														<c:if test="${PRCDOC_CFY eq 'P'}">
														<td align="center">${procedure.FRMID_CNT}</td>
														</c:if>
														<c:if test="${PRCDOC_CFY eq 'M'}">
															<td align="center">
															<c:if test="${procedure.QR_CNT > 0}">
															${procedure.QR_CNT}
															</c:if>
															</td>
														</c:if>
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