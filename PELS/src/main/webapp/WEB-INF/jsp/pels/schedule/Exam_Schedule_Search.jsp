<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			
			$('#CHCK_DY_S').val('${CHCK_DY_S}');
			$('#CHCK_DY_E').val('${CHCK_DY_E}');
		})
		
		// 등록화면으로 이동
		function fnScheduleInput () {
			let form = document.getElementById('form')
			form.action = "Schedule_Input.do"
			form.submit()
		}
		
		// 정주기시험 일정 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Exam_Schedule_Search.do"
			form.submit()
		}
		
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
		<form id="form" name="form" method="post">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">정주기시험 계획</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">일정관리</a>
										</li>
										<li class="active">정주기시험 계획</li>
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
														<select name="PPCD" id="PPCD">
														<c:forEach var="plant" items="${plantList}" begin="0" end="${plantList.size()}" step="1">
															<option value="${plant.PPCD}">${plant.PWPL_NM}</option>
														</c:forEach>
														</select>
													</td>

                                                    <td class="Title"><span class="Label">절차서번호</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_NO" id="PRCDOC_NO" value="" style="width:150px;" />
                                                    </td>
                                                    <td class="Title"><span class="Label">절차서명</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_NM" id="PRCDOC_NM" value="" style="width:220px;" />
                                                    </td>
													<td class="Title">시험일자</td>
													<td class="Value">
														<input name="CHCK_DY_S" id="CHCK_DY_S" type="text" style="width:100px;" class="TextBox" value="" required title="시험일자(시작)" onkeypress="fnOnKeyPress();"/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_DY_S')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
														~
														<input name="CHCK_DY_E" id="CHCK_DY_E" type="text" style="width:100px;" class="TextBox" value="" required title="시험일자(종료)" onkeypress="fnOnKeyPress();"/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_DY_E')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
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
											<span class="SubTitle">정주기시험 계획</span><span id="totalCnt" class="count">총 ${TCNT} 건</span>
										</div>
										<div class="ControlArea">
											<a class="InfoButton" href="javascript:downloadExcelFile();"><span class="Text">엑셀 다운로드</span></a>
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table id="tblScheduleList" cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
													<col width="100px" />
													<col width="150px" />
													<col width="100px" />
													<col width="*" />
													<col width="100px" />
							                        <col width="100px" />
							                        <col width="100px" />
							                        <col width="100px" />
							                        <col width="100px" />
							                        <col width="100px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>기능위치</th>
							                        <th>절차서번호</th>
							                        <th>유지보수계획</th>
													<th>유지보수품복내역</th>
													<th>최종시험일</th>
													<th>최종시험오더</th>
							                        <th>시험오더</th>
							                        <th>오더상태</th>
							                        <th>시험만료일</th>
							                        <th>최대허용일</th>
												</tr>
												<c:forEach var="exam" items="${examScheduleList}" begin="0" end="${examScheduleList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold">
															<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${exam.FNCLC_ID}">
														</td>
														<td align="center">${exam.FNCLC_ID}</td>
														<td align="center">${exam.PRCDOC_NO}</td>
														<td align="center">${exam.MNNC_PLN_CD}</td>
														<td align="center">${exam.MNNC_PRITM_DCR}</td>
														<td align="center">${exam.LAST_TST_DY}</td>
														<td align="center">${exam.LAST_WRKOR_NO}</td>
														<td align="center">${exam.WRKOR_NO}</td>
														<td align="center">${exam.WRKOR_STTE_CFY}</td>
														<td align="center">${exam.TST_EXPRTN_DY}</td>
														<td align="center">${exam.MXMM_ALLW_DY}</td>
													</tr>
												</c:forEach>
												<c:if test="${scheduleList.size() eq 0}">
													<tr class="Item">
														<td colspan="8" style="text-align: center;">조회된 자료가 없습니다.</td>
													</tr>
												</c:if>
                                            </table>
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