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
		
		// 수정 화면으로 이동
		function fnScheduleDetail() {
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
			form.action = "Schedule_Detail.do?UNQ_KY_VAL=" + chkParam;
			form.submit()
		}
		
		// 정주기시험 일정 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Schedule_Search.do"
			form.submit()
		}
		
		// 정주기시험 일정 삭제
		function fnScheduleDelete () {
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
				url: 'Schedule_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						location.href = '/Schedule_Search.do';
					} else {
						alert('정주기시험 일정 삭제에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('정주기시험 일정 삭제에 실패하였습니다.');
				}
			})
		}
	
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
		<form id="form" name="form" method="post">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">정주기시험 일정</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">일정관리</a>
										</li>
										<li class="active">정주기시험 일정</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnScheduleInput();"><span class="Text">등록</span></a>
                            <a class="btn-m" href="javascript:fnScheduleDetail();"><span class="Text">수정</span></a>
                            <a class="btn-m" href="javascript:fnScheduleDelete();"><span class="Text">삭제</span></a>
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
											<span class="SubTitle">정주기시험 일정현황</span><span id="totalCnt" class="count">총 ${TCNT} 건</span>
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
													<col width="150px" />
													<col width="*" />
													<col width="100px" />
							                        <col width="100px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>시험일자</th>
							                        <th>부서</th>
							                        <th>담당자</th>
													<th>절차서번호</th>
													<th>절차서명</th>
													<th>등록일</th>
							                        <th>등록자</th>
												</tr>
												<c:forEach var="schedule" items="${scheduleList}" begin="0" end="${scheduleList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold">
															<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${schedule.UNQ_KY_VAL}">
														</td>
														<td align="center">${schedule.FM_CHCK_DY}</td>
														<td></td>
														<td align="center">${schedule.CHKPR_FNM}</td>
														<td>${schedule.PRCDOC_NO}</td>
														<td>${schedule.PRCDOC_NM}</td>
														<td align="center">${schedule.FM_RG_DT}</td>
														<td align="center">${schedule.REGPR_NM}</td>
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