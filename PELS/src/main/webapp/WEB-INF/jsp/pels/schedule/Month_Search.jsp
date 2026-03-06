<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		// 체크 업데이트
		function fnMonthUpdate (element) {
			const paramValue = element.value;
			
			if(paramValue) {
				const unoKyVal = paramValue.split(',')[0].trim();
				const monthCfy = paramValue.split(',')[1].trim();
				
				let params = new Object()
				params.UNQ_KY_VAL = unoKyVal;
				
				if('N' == monthCfy) {
					params.TH1_CFRM_YN = element.checked ? 'Y' : 'N'; // 정기/주기 시험(N)
				} else if('D' == monthCfy) {
					params.TH2_CFRM_YN = element.checked ? 'Y' : 'N'; // 정기/주기 시험(D)
				} else if('A' == monthCfy) {
					params.TH3_CFRM_YN = element.checked ? 'Y' : 'N'; // 정기/주기 시험(A)
				} else {
					console.log('fnMonthUpdate error. unclassified monthCfy: ' + monthCfy);
				}
				
				$.ajax({
					type: 'POST',
					url: 'Month_Update_Ajax.do',
					data: params,
					dataType: 'JSON',
					contentType: "application/x-www-form-urlencoded; charset=utf-8",
					success: function (resultData) {
						// 성공시 메세지 출력 및 화면 재조회
						if('true' == resultData.resultCd) {
							console.log(resultData.resultMsg);
						} else {
							console.log('Save Fail!!');
						}
					},
					error: function () {
						console.log('Error occured!!');
					}
				})
			}
		}
		
		function fnSearch() {
			let form = document.getElementById('form')
			form.action = "Month_Search.do"
			form.submit()			
		}
		
		function fnCalendar()
		{
			let form = document.getElementById('form')
			form.action = "Month_Calendar.do"
			form.submit()			
		}
	</script>
	<style>
		#calendar02 table {float: left; width: 50%;}
		#calendar02 {width: 100%; height: 750px; border-collapse: collapse;}
		#calendar02 a {display: block; text-decoration: none;}
		#calendar02 th, .Calendar td {border: 1px solid #ccc; text-align: center; padding: 8px;}
		#calendar02 th {font-size: 16px; line-height: 20px !important;}
		#calendar02 td {height: 40px;}
		#calendar02 td p {margin: 2px 5px;}
	</style>
	<body class="no-skin real-skin themes-skin">
		<form id="form" name="form" method="post">
			<div class="main-content">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">월별 정주기시험 계획표</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">일정관리</a>
										</li>
	                                    <li class="active">월별 정주기시험 계획표</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnCalendar();"><span class="Text">달력 보기</span></a>
						</div>
						
						<!-- #section:basics/page-button -->
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
                                                    <col style="width:30%" />
                                                    <col class="Title" />
                                                    <col style="width:30%" />
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
													<td class="Title">시험월</td>
													<td class="Value">
														<select Name="SH_YEAR">
															<option value="2024">2024</option>
														</select>
                                                        <select Name="SH_MONTH">
                                                         <c:forEach var="list" begin="1" end="12" step="1"> 
															<c:choose>
																<c:when test="${list eq SH_MONTH}">
																	<option value="${list}" selected>${list}</option>
																</c:when>
																<c:otherwise>
																	<option value="${list}">${list}</option>
																</c:otherwise>
															</c:choose>
                                                            
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
                                    <div class="ContentPanel">
                                        <div class="Grid">
                                            <div id="calendar02">
												<table>
													<colgroup>
														<col width="50px"/>
														<col width="50px"/>
														<col width="50px"/>
														<col width="*"/>
														<col width="150px"/>
													</colgroup>
													<tr>
														<th>일시</th>
														<th>근무</th>
														<th>확인</th>
														<th>정기/주기 시험</th>
														<th>회전기기교체운전</th>
													</tr>
													<c:forEach var="month" items="${firstMonthList}" begin="0" end="${firstMonthList.size()}" step="1">
														<tr>
															<td rowspan="3" align="center"><a href="/Month_Input.do?UNQ_KY_VAL=${month.UNQ_KY_VAL}">${month.SCHDL_PLN_DATE}</a></td>
															<td align="center">N</td>
															<c:choose>
																<c:when test="${'Y' eq month.TH1_CFRM_YN}">
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},N" onclick="fnMonthUpdate(this)" checked></td>
																</c:when>
																<c:otherwise>
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},N" onclick="fnMonthUpdate(this)"></td>
																</c:otherwise>
															</c:choose>
															<td>&nbsp; ${month.TH1_ITM_NM}</td>
															<td rowspan="3">&nbsp; ${month.TH4_ITM_NM}</td>
														</tr>
														<tr>
															<td align="center">D</td>
															<c:choose>
																<c:when test="${'Y' eq month.TH2_CFRM_YN}">
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},D" onclick="fnMonthUpdate(this)" checked></td>
																</c:when>
																<c:otherwise>
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},D" onclick="fnMonthUpdate(this)"></td>
																</c:otherwise>
															</c:choose>
															<td>&nbsp; ${month.TH2_ITM_NM}</td>
														</tr>
														<tr>
															<td align="center">A</td>
															<c:choose>
																<c:when test="${'Y' eq month.TH3_CFRM_YN}">
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},A" onclick="fnMonthUpdate(this)" checked></td>
																</c:when>
																<c:otherwise>
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},A" onclick="fnMonthUpdate(this)"></td>
																</c:otherwise>
															</c:choose>
															<td>&nbsp; ${month.TH3_ITM_NM}</td>
														</tr>
													</c:forEach>
												</table>
												<table>
													<colgroup>
														<col width="50px"/>
														<col width="50px"/>
														<col width="50px"/>
														<col width="*"/>
														<col width="150px"/>
													</colgroup>
													<tr>
														<th>일시</th>
														<th>근무</th>
														<th>확인</th>
														<th>정기/주기 시험</th>
														<th>회전기기교체운전</th>
													</tr>
													<c:forEach var="month" items="${secondMonthList}" begin="0" end="${secondMonthList.size()}" step="1">
														<tr>
															<td rowspan="3" align="center"><a href="/Month_Input.do?UNQ_KY_VAL=${month.UNQ_KY_VAL}">${month.SCHDL_PLN_DATE}</a></td>
															<td align="center">N</td>
															<c:choose>
																<c:when test="${'Y' eq month.TH1_CFRM_YN}">
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},N" onclick="fnMonthUpdate(this)" checked></td>
																</c:when>
																<c:otherwise>
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},N" onclick="fnMonthUpdate(this)"></td>
																</c:otherwise>
															</c:choose>
															<td>&nbsp; ${month.TH1_ITM_NM}</td>
															
															<td rowspan="3">&nbsp; ${month.TH4_ITM_NM}</td>
														</tr>
														<tr>
															<td align="center">D</td>
															<c:choose>
																<c:when test="${'Y' eq month.TH2_CFRM_YN}">
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},D" onclick="fnMonthUpdate(this)" checked></td>
																</c:when>
																<c:otherwise>
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},D" onclick="fnMonthUpdate(this)"></td>
																</c:otherwise>
															</c:choose>
															<td>&nbsp; ${month.TH2_ITM_NM}</td>
														</tr>
														<tr>
															<td align="center">A</td>
															<c:choose>
																<c:when test="${'Y' eq month.TH3_CFRM_YN}">
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},A" onclick="fnMonthUpdate(this)" checked></td>
																</c:when>
																<c:otherwise>
																	<td align="center"><input type="checkbox" name="CHK_ITEM" id="CHK_ITEM${month.SCHDL_PLN_DATE}" value="${month.UNQ_KY_VAL},A" onclick="fnMonthUpdate(this)"></td>
																</c:otherwise>
															</c:choose>
															<td>&nbsp; ${month.TH3_ITM_NM}</td>
														</tr>
													</c:forEach>
												</table>
											</div>
                                        </div>
                                    </div>
                                </div>
								<!-- PAGE CONTENT ENDS -->
							</div><!-- /.col -->
						</div><!-- /.row -->
					</div><!-- /.page-content-area -->
				</div><!-- /.page-content -->
			</div><!-- /.main-content -->	
		</form>
	</body>
</html>