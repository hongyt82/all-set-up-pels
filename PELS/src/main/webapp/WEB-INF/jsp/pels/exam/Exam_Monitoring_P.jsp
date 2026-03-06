<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	$(document).ready(function () {
		$('#SH_SORT').val('${SH_SORT}');
	})
	
	// 등록 화면으로 이동
	function fnExamInput (PRCDOC_CFY) {
		let form = document.getElementById('form')
		form.action = "Exam_Input.do"
		form.PRCDOC_CFY.value = PRCDOC_CFY;
		form.submit()
	}
	
	// 수정 화면으로 이동
	function fnExamDetail() {
		const chkElements = $('#form input[name=CHK_ITEM]')
		const chkElement1 = $('#form input[name=REGPR_ID]')
		const chkElement2 = $('#form input[name=CHKPR_ID]')
		let chkCnt = 0;
		let chkParam = '';
		let chkParam1 = '';
		let chkParam2 = '';
		for (let i = 0; i < chkElements.length; i++) { 
			if ($(chkElements[i]).is(':checked')) {
				chkCnt++;
				chkParam = $(chkElements[i]).val();
				chkParam1 = $(chkElement1[i]).val();
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
		
		if(chkParam1 != '${LOGIN_USER_ID}' && chkParam2 != '${LOGIN_USER_ID}' && '${GRADE}' == "") {
			alert("수정 권한이 없습니다.");
			return;
		}
		
		let form = document.getElementById('form')
		form.action = "Exam_Detail.do?TST_UNQ_KY_VAL=" + chkParam;
		form.target = "_self";
		form.submit()
	}
	
	function fnStamp() {
		const chkElements = $('#form input[name=CHK_ITEM]')
		const chkElements2 = $('#form input[name=ATFL_PHCL_NM]')
		const chkElements3 = $('#form input[name=FRM_UNQ_KY_VAL]')
		let chkCnt = 0;
		let chkParam = '';
		let chkParam2 = '';
		let chkParam3 = '';
		for (let i = 0; i < chkElements.length; i++) { 
			if ($(chkElements[i]).is(':checked')) {
				chkCnt++;
				chkParam = $(chkElements[i]).val();
				chkParam2 = $(chkElements2[i]).val();
				chkParam3 = $(chkElements3[i]).val();
			}
		}
		
		if (chkCnt == 0) {
			alert('자료를 선택하여 주십시오.')
			return
		} else if (chkCnt != 1) {
			alert('하나만 선택해야 합니다.')
			return
		}
		
		if(chkParam2 == '') {
			alert("입회점이 없는 절차서입니다.");
			return;
		}
		
		window.open("", "PopupOpen", "width=1000,height=800,directoryies=no,status=no,titlebar=no,location=no,toolbar=no,menubar=no");
		let form = document.getElementById('formPopup')
		
		form.action = "StampViewer.do";
		form.target = "PopupOpen"; 
		form.TST_UNQ_KY_VAL.value = chkParam;
		form.ATFL_PHCL_NM.value = chkParam2;
		form.FRM_UNQ_KY_VAL.value = chkParam3;
		form.submit()
	}
	
	function fnExamJOB2() {
		const chkElements = $('#form input[name=CHK_ITEM]')
		const chkPRCDOC_NO = $('#form input[name=PRCDOC_NO]')
		const chkPRCDOC_RVSN_NO = $('#form input[name=PRCDOC_RVSN_NO]')
		let chkCnt = 0;
		let chkParam1 = '';
		let chkParam2 = '';
		let chkParam3 = '';
		for (let i = 0; i < chkElements.length; i++) { 
			if ($(chkElements[i]).is(':checked')) {
				chkCnt++;
				chkParam1 = $(chkElements[i]).val();
				chkParam2 = $(chkPRCDOC_NO[i]).val();
				chkParam3 = $(chkPRCDOC_RVSN_NO[i]).val();
				
			}
		}
		
		if (chkCnt == 0) {
			alert('작업전회의 등록 또는 수정 할 자료를 선택하여 주십시오.')
			return
		} else if (chkCnt != 1) {
			alert('작업전회의 등록 또는 수정 할 자료를 하나만 선택해야 합니다.')
			return
		}
		
		let form = document.getElementById('form')
		form.action = "Exam_Job_Input.do?TST_UNQ_KY_VAL=" + chkParam1 + "&PRCDOC_NO=" + chkParam2 + "&PRCDOC_RVSN_NO=" + chkParam3;
		form.target = "_self";
		form.submit()
	}
	
	function fnExamJOB(TST_UNQ_KY_VAL, PRCDOC_NO, PRCDOC_RVSN_NO, FRM_UNQ_KY_VAL) {
		let form = document.getElementById('form')
		form.action = "Exam_Job_Input.do?TST_UNQ_KY_VAL=" + TST_UNQ_KY_VAL + "&PRCDOC_NO=" + PRCDOC_NO + "&PRCDOC_RVSN_NO=" + PRCDOC_RVSN_NO + "&FRM_UNQ_KY_VAL=" + FRM_UNQ_KY_VAL;
		form.target = "_self";
		form.submit()
	}

	// 시험(점검)준비 조회
	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "Exam_Monitoring.do"
		form.target = "_self";
		form.submit()
	}
	
	function fnPage (page) {
		let form = document.getElementById('form')
		form.PAGE.value = page;
		form.action = "Exam_Monitoring.do"
		form.target = "_self";
		form.submit()
	}				
	
	// 시험(점검)준비 삭제
	function fnFormDelete () {
		const chkElements = $('#form input[name=CHK_ITEM]')
		const chkElement1 = $('#form input[name=REGPR_ID]')
		const chkElement2 = $('#form input[name=CHKPR_ID]')
		let chkCnt = 0;
		let chkParam = '';
		let chkParam1 = '';
		let chkParam2 = '';
		for (let i = 0; i < chkElements.length; i++) { 
			if ($(chkElements[i]).is(':checked')) {
				chkCnt++;
				chkParam = $(chkElements[i]).val();
				chkParam1 = $(chkElement1[i]).val();
				chkParam2 = $(chkElement2[i]).val();
			}
		}
		
		if (chkCnt == 0) {
			alert('삭제할 자료를 선택하여 주십시오.')
			return
		}
		
		if(chkParam1 != '${LOGIN_USER_ID}' && chkParam2 != '${LOGIN_USER_ID}' && '${GRADE}' == "") {
			alert("삭제 권한이 없습니다.");
			return;
		}
		
		if (!confirm('정말로 삭제 하시겠습니까?')) return
		
		let params = new Object()
		params.CHK_ITEM = chkParam;
		
		$.ajax({
			type: 'POST',
			url: 'Exam_Delete_Ajax.do',
			data: params,
			dataType: 'JSON',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function (resultData) {
				alert(resultData.resultMsg);
				fnSearch();
			},
			error: function () {
				alert('삭제에 실패하였습니다.');
			}
		})
	}
	
	function MM_openJOB(ATFL_PHCL_NM, TST_UNQ_KY_VAL, ATFL_PHCL_NM_OZR)
	{
		window.open("", "PopupOpen", "width=1000,height=800,directoryies=no,status=no,titlebar=no,location=no,toolbar=no,menubar=no");
		
		let form = document.getElementById('formPopup')
		form.action = "JobViewer.do";
		form.target = "PopupOpen"; 
		form.ATFL_PHCL_NM.value = ATFL_PHCL_NM;
		form.TST_UNQ_KY_VAL.value = TST_UNQ_KY_VAL;
		form.ATFL_PHCL_NM_OZR.value = ATFL_PHCL_NM_OZR;
		form.submit()
	}		
	
	function MM_openOZD(ATFL_PHCL_NM, TST_UNQ_KY_VAL, CFY)
	{
		window.open("", "PopupOpen", "width=1000,height=800");
		
		let form = document.getElementById('formPopup')
		form.action = "OzdViewer.do";
		form.target = "PopupOpen"; 
		form.ATFL_PHCL_NM.value = ATFL_PHCL_NM;
		form.TST_UNQ_KY_VAL.value = TST_UNQ_KY_VAL;
		form.CFY.value = CFY;
		form.submit()
	}
	
	function MM_openViewer(TST_UNQ_KY_VAL)
	{
		window.open("", "PopupOpen", "width="+  screen.width + ",height=" +  screen.height + ",fullscreen=yes");
		
		let form = document.getElementById('formPopup')
		form.action = "KhnpViewer.do";
		form.target = "PopupOpen"; 
		form.TST_UNQ_KY_VAL.value = TST_UNQ_KY_VAL;
		form.submit()
	}	
	
	
	function downloadExcelFile () {
		let form = document.getElementById('form')
		form.action = '/Exam_Excel.do'
		form.submit()
	}	
</script>
<body class="no-skin real-skin">
<form id="formPopup" name="formPopup" method="post">
<input type="hidden" name="ATFL_PHCL_NM" id="ATFL_PHCL_NM" value="">
<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="">
<input type="hidden" name="ATFL_PHCL_NM_OZR" id="ATFL_PHCL_NM_OZR" value="">
<input type="hidden" name="CFY" id="CFY" value="">
<input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="">

</form>
<form id="form" name="form" method="post">
<input type="hidden" name="PAGE" value="${PAGE}">
<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
<input type="hidden" name="PRCDOC_CFY" id="PRCDOC_CFY" value="${PRCDOC_CFY}">
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">나의문서 대기중</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">나의문서</a>
							</li>
							<li class="active">대기중</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>
			</div><!-- /page-header -->
			<!-- #section:basics/page-button -->
			<div class="PageButtonGroup" style="text-align:right">
				<a class="btn-m" href="javascript:fnExamInput('P');"><span class="Text">등록</span></a>
                         <a class="btn-m" href="javascript:fnExamDetail();"><span class="Text">수정</span></a>
                         <a class="btn-m" href="javascript:fnFormDelete();"><span class="Text">삭제</span></a>
			    <!-- 
				<a class="btn-m" href="javascript:fnExamInput();"><span class="Text">OZD 등록</span></a>
				<a class="btn-m" href="javascript:fnExamResult();"><span class="Text">완료</span></a>
				 -->
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
										<col style="width:15%" />
	                                    <col class="Title" />
	                                    <col style="width:20%" />
	                                    <col class="Title" />
	                                    <col style="width:30%" />
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
	                                    <td class="Title"><span class="Label">절차서번호</span></td>
	                                    <td class="Value">
	                                        <input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" style="width:120px;"  value="${SH_PRCDOC_NO}"/>
	                                    </td>
										<td class="Title">절차서명</td>
										<td class="Value">
	                                        <input type="text" class="TextBox" name="SH_PRCDOC_NM" id="SH_PRCDOC_NM" style="width:200px;" value="${SH_PRCDOC_NM}"/>
										</td>
	                                    <td class="Title"><span class="Label">시험명</span></td>
	                                    <td class="Value">
	                                        <input type="text" class="TextBox" name="SH_TITL_NM" id="SH_TITL_NM" style="width:150px;" value="${SH_TITL_NM}"/>
	                                    </td>
										<td class="Title"><span class="Label">정렬</span></td>
										<td class="Value">
											<select name="SH_SORT" id="SH_SORT">
												<option value="CHCK_STRT_DT">시험시작일</option>
												<option value="RG_DT">등록일</option>
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
								<span class="SubTitle">시험수행현황</span><span class="count">총 ${TCNT} 건</span>
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
										<col width="200px" />
                                        <col width="150px" />
					  					<col width="*" />
                                        <col width="*" />
                                        <col width="100px" />
                                        <col width="100px" />
                                        <col width="80px" />
                                        <col width="70px" />
                                        <col width="100px" />
									</colgroup>
									<tr class="Header">
										<th>선택</th>
										<th>시험기간</th>
										<th>절차서번호</th>
										<th>절차서명</th>
										<th>시험명</th>
										<th>오더번호</th>
										<th>점검자</th>
										<th>상태</th>
										<th>절차서</th>
										<th>등록일</th>
									</tr>
									<c:forEach var="exam" items="${examList}" begin="0" end="${examList.size()}" step="1">
										<tr class="Item">
											<td align="center" style="font-weight:bold">
												<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox"  onclick="checkOnlyOne(this)" value="${exam.TST_UNQ_KY_VAL}">
												<input name="PRCDOC_NO" id="PRCDOC_NO" type="hidden" value="${exam.PRCDOC_NO}">
												<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" type="hidden" value="${exam.PRCDOC_RVSN_NO}">
												<input name="ATFL_PHCL_NM" id="ATFL_PHCL_NM" type="hidden" value="${exam.OZD_FNAME1}">
												<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" value="${exam.FRM_UNQ_KY_VAL}">
												<input name="REGPR_ID" id="REGPR_ID" type="hidden" value="${exam.REGPR_ID}">
												<input name="CHKPR_ID" id="CHKPR_ID" type="hidden" value="${exam.CHKPR_ID}">
											</td>
											<td align="center">${exam.CHCK_DT}</td>
											<td align="center">${exam.PRCDOC_NO}</td>
											<td align="left">${exam.PRCDOC_NM}</td>
											<td align="left">${exam.TITL_NM}</td>
											<td align="center">${exam.WRKOR_NO}</td>
											<td align="center">${exam.CHKPR_FNM}</td>
											<td align="center">${exam.PRSTS_CFY_NM}</td>
											<td align="center">
												<!-- <a class="SubButton" href="javascript:MM_openViewer('${exam.TST_UNQ_KY_VAL}');"><span class="Text">보기</span></a> -->
												<a class="SubButton" href="Exam_KhnpViewer.do?TST_UNQ_KY_VAL=${exam.TST_UNQ_KY_VAL}&PRCDOC_NO=${exam.PRCDOC_NO}&PRCDOC_NM=${exam.PRCDOC_NO}&TITL_NM=${exam.PRCDOC_NM}"><span class="Text">보기</span></a>
											</td>
											<td align="center">${exam.FM_RG_DT}</td>
										</tr>
									</c:forEach>
									<c:if test="${examList.size() eq 0}">
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
</form>
	</div><!-- /.page-content -->
</body>
</html>