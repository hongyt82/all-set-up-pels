<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			if ($.trim('${callMethod}') != null && $.trim('${callMethod}') != "" && $.trim('${callMethod}') != undefined) {
				alert('${resultMsg}')
			}
			
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_TITL').val('${PRCDOC_TITL}');
			
			$('#CHCK_DY_S').val('${CHCK_DY_S}');
			$('#CHCK_DY_E').val('${CHCK_DY_E}');
			
			const TCNT = '${TCNT}';
			const scheduleList = '${scheduleList}';
			
			fnSetScheduleList(TCNT, scheduleList);
		})
		
		// 등록화면으로 이동
		function fnScheduleInput () {
			let form = document.getElementById('form')
			form.action = "Schedule_Input.do"
			form.submit()
		}
		
		// 정주기시험 일정 데이터 세팅
		function fnSetScheduleList(TCNT, scheduleList) {
			$('#tblScheduleList').html('');
			
			let html = ''
				
			if (TCNT == 0) {
				html = '<tr><td colspan="8" style="text-align: center; height: 50px;">조회된 일정이 없습니다.</td></tr>'
			} else {
				scheduleList = JSON.parse(scheduleList);
				html = `
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
				`
				
				for (let i = 0; i < scheduleList.length; i++) {
					html += '<tr class="Item">'
					html += '	<td align="center" style="font-weight:bold"><input name="CHK_ITEM" type="checkbox" value="' + scheduleList[i].UNQ_NO + '"></td>'
					html += '	<td align="center">' + scheduleList[i].FM_CHCK_DY + '</td>'
					html += '	<td></td>'
					html += '	<td align="center">' + scheduleList[i].CHKPR_FNM + '</td>'
					html += '	<td>' + scheduleList[i].PRCDOC_NO + '</td>'
					html += '	<td>' + scheduleList[i].PRCDOC_TITL + '</td>'
					html += '	<td align="center">' + scheduleList[i].FM_RG_DT + '</td>'
					html += '	<td align="center">' + scheduleList[i].REGPR_NM + '</td>'
					html += '</tr>'
				}
			}
			
			$('#totalCnt').html('총 ' + TCNT + ' 건');
			$('#tblScheduleList').html(html);
		}
		
		// 정주기시험 일정 조회
		function fnSearch () {
			let params = new Object()
			params.PRCDOC_NO = $('#PRCDOC_NO').val();
			params.PRCDOC_TITL = $('#PRCDOC_TITL').val();
			params.CHCK_DY_S = $('#CHCK_DY_S').val();
			params.CHCK_DY_E = $('#CHCK_DY_E').val();
			
			$.ajax({
				type: 'POST',
				url: 'Schedule_Search_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					fnSetScheduleList(resultData.TCNT, resultData.scheduleList)
				},
				error: function () {
					console.log('Error occured!!')
				}
			})
		}
		
		function fnScheduleDelete () {
			const chkElements = $('#form input[name=CHK_ITEM]')
			let chkCnt = 0;
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) chkCnt++;
			}
			
			if (chkCnt == 0) {
				alert('삭제할 자료를 선택하여 주십시오.')
				return
			}
			
			if (!confirm('정말로 삭제 하시겠습니까?')) return
			
			let form = document.getElementById('form')
			form.action = "Schedule_Delete.do"
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
                            <a class="btn-m" href="#"><span class="Text">수정</span></a>
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
                                                    <col style="width:30%" />
                                                    <col class="Title" />
                                                    <col style="width:30%" />
												</colgroup>
												<tr>
													<td class="Title"><span class="Label">부서</span></td>
													<td class="Value">
														<select>
															<option value="==선택==">발전운영부</option>
														</select>
                                                        <select>
                                                            <option value="==선택==">전체</option>
                                                        </select>
													</td>
                                                    <td class="Title"><span class="Label">절차서번호</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_NO" id="PRCDOC_NO" value="" style="width:120px;" />
                                                    </td>
                                                    <td class="Title"><span class="Label">절차서명</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_TITL" id="PRCDOC_TITL" value="" style="width:120px;" />
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
											<span class="SubTitle">검색현황</span><span id="totalCnt" class="count"></span>
										</div>
										<div class="ControlArea">
											<a class="InfoButton" href="javascript:downloadExcelFile();"><span class="Text">엑셀 다운로드</span></a>
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table id="tblScheduleList" cellspacing="0" cellpadding="0" border="0" class="Outline">
												
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