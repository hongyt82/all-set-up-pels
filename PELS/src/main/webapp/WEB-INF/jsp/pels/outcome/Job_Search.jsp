<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
    <style>
        .ui-widget {font-size: 1.2em;}
        .ui-state-active, .ui-widget-content .ui-state-active, .ui-widget-header .ui-state-active{
            border: 1px solid #aaa; background: #fff url("images/ui-bg_glass_65_ffffff_1x400.png") 50% 50% repeat-x;
            font-weight: normal;color: #212121;}
        .ui-state-highlight, .ui-widget-content .ui-state-highlight, .ui-widget-header .ui-state-highlight{
            border: 1px solid #fcefa1; background: #fbf9ee url("images/ui-bg_glass_55_fbf9ee_1x400.png") 50% 50% repeat-x;
            font-weight:600; color: #ff0000;
        }
        .ui-datepicker td>a.ui-state-active {background-color:#2283c5; color:#fff;}
    </style>

	<script>
		let userPlantCode = '${LOGIN_USER_PLANT_CD}'

		$(document).ready(function () {
			$('#FRM_NM').val('${FRM_NM}');
			dateInit2();
		})
		
        function dateInit2() {
            $("#MTNG_DY_S,#MTNG_DY_E"
                ).datepicker({
                onSelect: function (date, evt) {
                    if (evt.id == "incident_date") fncSetIncidentNo(3, date);
                },
                showAnimation: 'slideDown',
                showOtherMonths: true,
                selectOtherMonths: true,
                changeYear: true,
                changeMonth: true,
                /*yearSuffix: '년',*/
                dateFormat: 'yy-mm-dd', /* yy/mm/dd = 2014/12/23 */
                prevText: '이전 달',
                nextText: '다음 달',
                monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                dayNames: ['일', '월', '화', '수', '목', '금', '토'],
                dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
                dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
                showMonthAfterYear: true
            });
        }

        function fncDatePicker(id) {
            let obj = document.getElementById(id);
            if (obj != null && obj != "undefined") {
                $("#" + id).datepicker('show');
            }
        }			
		
		// 결과관리 일반양식 조회
		function fnSearch() {
			let form = document.getElementById('form')
			form.action = "Job_Search.do"
			form.submit()
		}
		
		// 등록 화면으로 이동
		function fnFormInput (FRM_CFY, FRM_UNQ_KY_VAL) {
			let form = document.getElementById('form')
			form.FRM_CFY.value = FRM_CFY;
			form.FRM_UNQ_KY_VAL.value = FRM_UNQ_KY_VAL;
			form.action = "Job_Input.do"
			form.submit()
		}
		
		// 수정 화면으로 이동
		function fnFormDetail() {
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
			form.UNQ_KY_VAL.value = chkParam;
			form.action = "Job_Detail.do";
			form.submit()
		}		
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}
		
		function fnGetPlantCode () {
			let PWPL_CFY = $('#PWPL_CFY').val()
			if (gfnIsNull(PWPL_CFY)) {
				$('#PPCD').html('<option value="">전체</option>');
				return
			}
			
			let params = { 'PWPL_CFY': PWPL_CFY }
			$.ajax({
				type: 'POST',
				url: 'GetPlantCode.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					const plantCodeList = resultData.plantCodeList
					let html = '<option value="">전체</option>'
					for (let i = 0; i < plantCodeList.length; i++) {
						const PPCD = plantCodeList[i].PPCD
						const PWPL_NM = plantCodeList[i].PWPL_NM
						html += '<option value="' + PPCD + '">' + PWPL_NM + '</option>'
					}
					
					$('#PPCD').html(html)
				},
				error: function () {
					console.log('Error occured!!')
				}
			})
		}
		
		function fnFormDelete () {
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
			
			if (!confirm("[ " + chkCnt + ' 건 ] 을 정말로 삭제 하시겠습니까?')) return
			
			let params = new Object()
			params.CHK_ITEM = chkParams;
			
			$.ajax({
				type: 'POST',
				url: 'Job_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					alert(resultData.resultMsg);
					fnSearch();
				},
				error: function () {
					alert('삭제에 실패하였습니다.');
				}
			})
		}
		
		function fnFormLDM() {
			
			alert('작업중입니다.');
			
			return
			
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
			
			if (!confirm('LDM 전송을 하면 작업전회의을 수정할 수 없습니다. 전송하시겠습니까?')) {
				alert('오더번호가 없습니다.');
				return
			}
			
			alert('LDM 전송이 완료 되었습니다.');
			
			return
			
			//let form = document.getElementById('form')
			//form.UNQ_KY_VAL.value = chkParam;
			//form.action = "Job_LDM_Send.do";
			//form.submit()
		}		
		
		
	</script>
	<body class="no-skin real-skin" onload="dateInit2();">
			<form id="form">
            <input type="hidden" name="LOGIN_PWPL_CFY" id="LOGIN_PWPL_CFY" class="TextBox" value="${LOGIN_PWPL_CFY}"/>
            <input type="hidden" name="LOGIN_PPCD" id="LOGIN_PPCD" class="TextBox" value="${LOGIN_PPCD}"/>
            <input type="hidden" name="LOGIN_DIVS_CD" id="LOGIN_DIVS_CD" class="TextBox" value="${LOGIN_DIVS_CD}"/>
            <input type="hidden" name="LOGIN_USER_ID" id="LOGIN_USER_ID" class="TextBox" value="${LOGIN_USER_ID}"/>
            <input type="hidden" name="LOGIN_USER_NM" id="LOGIN_USER_NM" class="TextBox" value="${LOGIN_USER_NM}"/>
			
            <input type="hidden" name="FRM_CFY" id="FRM_CFY" class="TextBox" value=""/>
            <input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="" />
            <input type="hidden" name="UNQ_KY_VAL" id="UNQ_KY_VAL" value="" />
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">작업전회의 관리</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">작업전회의</a>
										</li>
										<li class="active">작업전회의 관리</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
						    <c:if test="${PWPL_CFY ne '0'}">
							<a class="btn-m" href="javascript:fnFormInput('REP', 2);"><span class="Text">정비작업전회의 등록</span></a>
							<a class="btn-m" href="javascript:fnFormInput('GEN', 1);"><span class="Text">일반작업전회의 등록</span></a>
							<a class="btn-m" href="javascript:fnFormInput('MAN', 0);"><span class="Text">수기 등록</span></a>
                            <a class="btn-m" href="javascript:fnFormDetail();"><span class="Text">수정</span></a>
                            <a class="btn-m" href="javascript:fnFormDelete();"><span class="Text">삭제</span></a>
                            <a class="btn-m" href="javascript:fnFormLDM();"><span class="Text">LDM전송</span></a>
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
													<col style="width:10%" />
													<col class="Title" />
													<col style="width:20%" />
                                                    <col class="Title" />
                                                    <col style="width:25%" />
                                                    <col class="Title" />
                                                    <col style="width:45%" />
												</colgroup>
												<tr>
													<td class="Title"><span class="Label">구분</span></td>
													<td class="Value">
													    <c:if test="${PWPL_CFY ne '0'}">
											            <input type="hidden" name="PWPL_CFY" id="PWPL_CFY" class="TextBox" value="${PWPL_CFY}"/>
														<select name="PWPL_CFY" id="PWPL_CFY" onchange="fnGetPlantCode()" title="발전소(타입)" disabled>
													    </c:if>
													    <c:if test="${PWPL_CFY eq '0'}">
														<select name="PWPL_CFY" id="PWPL_CFY" onchange="fnGetPlantCode()" title="발전소(타입)">
													    </c:if>
														    <c:if test="${PWPL_CFY eq '1'}">
																<option value="1" selected>수력</option>
																<option value="2">양수</option>
															</c:if>
														    <c:if test="${PWPL_CFY eq '2' or PWPL_CFY eq '0'}">
																<option value="1">수력</option>
																<option value="2" selected>양수</option>
															</c:if>
														</select>
													</td>
													<td class="Title"><span class="Label">발전소</span></td>
													<td class="Value">
													    <c:if test="${PWPL_CFY ne '0'}">
											            <input type="hidden" name="PPCD" id="PPCD" class="TextBox" value="${PPCD}"/>
														<select name="PPCD" id="PPCD" disabled>
													    </c:if>
													    <c:if test="${PWPL_CFY eq '0'}">
														<select name="PPCD" id="PPCD">
													    </c:if>
														<option value="">전체</option>
														<c:forEach var="PlantCode" items="${PlantCode}" begin="0" end="${PlantCode.size()}" step="1">
															<c:if test="${PlantCode.PPCD eq PPCD}">
																<option value="${PlantCode.PPCD}" selected>${PlantCode.PWPL_NM}</option>
															</c:if>
															<c:if test="${PlantCode.PPCD ne PPCD}">
																<option value="${PlantCode.PPCD}">${PlantCode.PWPL_NM}</option>
															</c:if>
														</c:forEach>
														</select>
													</td>
													<td class="Title">조회기간</td>
													<td class="Value">
														<input name="MTNG_DY_S" id="MTNG_DY_S" type="text" style="width:80px;" class="TextBox" value="${MTNG_DY_S}" onkeypress="fnOnKeyPress();" readonly/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('MTNG_DY_S')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
														~
														<input name="MTNG_DY_E" id="MTNG_DY_E" type="text" style="width:80px;" class="TextBox" value="${MTNG_DY_E}" onkeypress="fnOnKeyPress();" readonly/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('MTNG_DY_E')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
													</td>
                                                    <td class="Title"><span class="Label">작업명</span></td>
                                                    <td class="Value">
                                                        <input type="text" name="WRK_NM" id="WRK_NM" class="TextBox" value="${WRK_NM}" style="width:300px;" />
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
											<span class="SubTitle">작업전회의 현황</span><span class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
												    <c:if test="${PWPL_CFY eq '0'}">
                                                    	<col width="100px" />
												    </c:if>
                                                    <col width="150px" />
                                                    <col width="*" />
                                                    <col width="200px" />
													<col width="100px" />
                                                    <col width="120px" />
                                                    <col width="120px" />
                                                    <col width="60px" />
                                                    <col width="70px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
												    <c:if test="${PWPL_CFY eq '0'}">
														<th>발전소</th>
												    </c:if>
													<th>오더번호</th>
													<th>작업명</th>
													<th>작업부서</th>
                                                    <th>회의주관자</th>
													<th>회의일자</th>
													<th>구분</th>
                                                    <th>파일</th>
                                                    <th>전송유무</th>
												</tr>
												<c:forEach var="etcOutcome" items="${EtcJobList}" begin="0" end="${EtcJobList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold">
													    <c:if test="${etcOutcome.REGPR_ID eq LOGIN_USER_ID}">
															<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${etcOutcome.UNQ_KY_VAL}">
													    </c:if>
														</td>
													    <c:if test="${PWPL_CFY eq '0'}">
														<td align="center">${etcOutcome.PPCD_NM}</td>
													    </c:if>
														<td align="center">${etcOutcome.WRKOR_NO}</td>
														<td align="center">${etcOutcome.WRK_NM}</td>
														<td align="center">${etcOutcome.WRK_SCTN_NM}</td>
														<td align="center">${etcOutcome.MTNG_HSMPR_ID}</td>
														<td align="center">${etcOutcome.FM_MTNG_DY}</td>
														<td align="center">${etcOutcome.FRM_CFY_NM}</td>
														<c:if test="${etcOutcome.FRM_CFY eq 'MAN_REP' or etcOutcome.FRM_CFY eq 'MAN_GEN'}">
															<td align="center"><a href="/upload/${etcOutcome.ATFL_PHCL_NM}"><img src="/resources/themes/QuartzLight/Skins/Image/pdf.png" height="21px;"></a></td>
														</c:if>
														<c:if test="${etcOutcome.FRM_CFY eq 'GEN'}">
															<td align="center"><a href="javascript:MM_openBrWindow('Job0Viewer.do?ATFL_PHCL_NM=/${etcOutcome.ATFL_PHCL_NM}&ATFL_PHCL_NM_OZR=/${etcOutcome.ATFL_PHCL_NM_GEN}&UNQ_KY_VAL=${etcOutcome.UNQ_KY_VAL}','ozd','width=1000,height=800');"><img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;"></a></td>
														</c:if>
														<c:if test="${etcOutcome.FRM_CFY eq 'REP'}">
															<td align="center"><a href="javascript:MM_openBrWindow('Job0Viewer.do?ATFL_PHCL_NM=/${etcOutcome.ATFL_PHCL_NM}&ATFL_PHCL_NM_OZR=/${etcOutcome.ATFL_PHCL_NM_REP}&UNQ_KY_VAL=${etcOutcome.UNQ_KY_VAL}','ozd','width=1000,height=800');"><img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;"></a></td>
														</c:if>
														<td align="center">${etcOutcome.TRSN_YN_NM}</td>
													</tr>
												</c:forEach>
												<c:if test="${EtcJobList.size() eq 0}">
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