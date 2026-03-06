<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
		})
		
		// 등록 화면으로 이동
		function fnFormInput () {
			let form = document.getElementById('form')
			form.action = "Form_Input.do"
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
			form.action = "Form_Detail.do?FRM_UNQ_KY_VAL=" + chkParam;
			form.submit()
		}
		
		// 폼ID관리 화면으로 이동
		function fnFormIdSearch(FRM_UNQ_KY_VAL) {
			let form = document.getElementById('form')
			form.action = "Form_Id_Search.do?FRM_UNQ_KY_VAL=" + FRM_UNQ_KY_VAL;
			form.submit()
		}
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Form_Search.do"
			form.submit()
		}
		
		
		// 절차서관리 삭제
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
			
			if (!confirm('정말로 삭제 하시겠습니까?')) return
			
			let params = new Object()
			params.CHK_ITEM = chkParams;
			
			$.ajax({
				type: 'POST',
				url: 'Form_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					alert(resultData.resultMsg);
					location.href = '/Form_Search.do';
				},
				error: function () {
					alert('절차서 삭제에 실패하였습니다.');
				}
			})
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}			
	</script>
	<body class="no-skin real-skin">
			<form id="form" name="form" method="post">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">정주기시험</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">절차서(서식)관리</a>
										</li>
										<li class="active">정주기시험</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnFormInput();"><span class="Text">등록</span></a>
                            <a class="btn-m" href="javascript:fnFormDetail();"><span class="Text">수정</span></a>
                            <a class="btn-m" href="javascript:fnFormDelete();"><span class="Text">삭제</span></a>
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
														<select>
															<option value="==선택==">한빛6호기</option>
														</select>
													</td>
                                                    <td class="Title"><span class="Label">절차서번호</span></td>
                                                    <td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_NO" id="PRCDOC_NO" value="" style="width:150px;" />
                                                    </td>
													<td class="Title">절차서명</td>
													<td class="Value">
                                                        <input type="text" class="TextBox" name="PRCDOC_NM" id="PRCDOC_NM" value="" style="width:220px;" />
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
											<span class="SubTitle">서식현황</span><span class="count">총 ${TCNT} 건</span>
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
													<col width="80px" />
													<col width="100px" />
                                                    <col width="100px" />
                                                    <col width="50px" />
                                                    <col width="100px" />
                                                    <col width="100px" />
                                                    <col width="100px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>절차서번호</th>
													<th>절차서명</th>
													<th>문서유형</th>
													<th>개정번호</th>
													<th>서식갯수</th>
                                                    <th>OZR</th>
                                                    <th>등록자</th>
                                                    <th>등록일자</th>
                                                    <th></th>
												</tr>
												<c:forEach var="form" items="${formList}" begin="0" end="${formList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${form.FRM_UNQ_KY_VAL}"></td>
														<td>${form.PRCDOC_NO}</td>
														<td align="left">${form.PRCDOC_NM}</td>
														<td align="center">${form.DOC_TYP}</td>
														<td align="center">${form.PRCDOC_RVSN_NO}</td>
														<td align="center">${form.ATFL_CNT}</td>
														<td align="center">
														<a href="javascript:MM_openBrWindow('OzrViewer.do?ATFL_GRUP_NM=GE_MP_FRM_M&FRM_UNQ_KY_VAL=${form.FRM_UNQ_KY_VAL}','','width=1000,height=800');"><img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;"></a>
														</td>
														<td align="center">${form.REGPR_NM}</td>
														<td align="center">${form.FM_RG_DT}</td>
														<td align="center"><a href="javascript:fnFormIdSearch(${form.FRM_UNQ_KY_VAL});" class="SubButton"><span class="Text">폼ID관리</span></a></td>
													</tr>
												</c:forEach>
												<c:if test="${formList.size() eq 0}">
													<tr class="Item">
														<td colspan="9" style="text-align: center;">조회된 자료가 없습니다.</td>
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
			</form>
</body>
</html>