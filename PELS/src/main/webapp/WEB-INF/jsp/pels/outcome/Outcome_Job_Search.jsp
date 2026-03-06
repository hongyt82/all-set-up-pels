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
			form.action = "Outcome_Job_Search.do"
			form.submit()
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Outcome_Job_Search.do"
			form.submit()
		}			
		
	</script>
	<body class="no-skin real-skin" onload="dateInit2();">
	<form id="form">
	<input type="hidden" name="PAGE" value="${PAGE}">
	<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
	<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
	<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
	<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">

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
								<span class="title">작업전회의 이력</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">결과관리</a>
										</li>
										<li class="active">작업전회의 이력</li>
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
													<col style="width:10%" />
													<col class="Title" />
													<col style="width:20%" />
                                                    <col class="Title" />
                                                    <col style="width:25%" />
                                                    <col class="Title" />
                                                    <col style="width:45%" />
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
													<col width="150px" />
                                                    <col width="120px" />
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
                                                    <th>파일</th>
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
														<td align="center">
														<a class="SubButton" href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${etcOutcome.ATFL_PHCL_NM}&ATFL_PHCL_NM_OZR=${etcOutcome.ATFL_PHCL_NM_GEN}','ozd','width=1000,height=800');">
															<span class="Text">보기</span></a>
														</td>
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