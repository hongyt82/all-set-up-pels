<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#PRCDOC_NO').val('${PRCDOC_NO}');
			$('#PRCDOC_NM').val('${PRCDOC_NM}');
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
		})
		
		// 등록 화면으로 이동
		function fnFormManageInput () {
			let form = document.getElementById('form')
			form.action = "Form_Manage_Input.do"
			form.submit()
		}
		
		// 폼ID관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Form_Manage_Search.do"
			form.submit()
		}
		
		// 절차서관리 삭제
		function fnFormManageDetail () {
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
			form.UNQ_ID.value = chkParam			
			form.action = "Form_Manage_Detail.do";
			form.submit()
		}		
		
		// 절차서관리 삭제
		function fnFormManageDelete () {
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
			params.ATCT_CFY = '${ATCT_CFY}';
			params.FRM_UNQ_KY_VAL = '${FRM_UNQ_KY_VAL}';
			
			$.ajax({
				type: 'POST',
				url: 'Form_Manage_Delete_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					alert(resultData.resultMsg);
					fnSearch ();
				},
				error: function () {
					alert('삭제에 실패하였습니다.');
				}
			})
		}
		
	</script>
<body class="no-skin real-skin">
		<form id="form" name="form" method="post">
		<input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="${FRM_UNQ_KY_VAL}">
		<input type="hidden" name="ATCT_CFY" id="ATCT_CFY" value="${ATCT_CFY}">
		<input type="hidden" name="UNQ_ID" id="UNQ_ID" value="">
			<div class="page-content">
				<div class="page-content-area">
					<!-- #ection:basics/page-header -->
					<div class="page-header">
						<h1>
							<span class="title">FME 순찰 관리조 점검표</span>
							<span>
								<ul class="breadcrumb">
									<li>
										<a href="#">절차서(서식)관리</a>
									</li>
									<li>
	                                    <a href="/Form_Atct_Search.do">점검관리(붙임)</a>
	                                </li>
									<li class="active">FME 순찰 관리조 점검표</li>
								</ul><!-- /.breadcrumb -->
							</span>
						</h1>
					</div><!-- /page-header -->
					<!-- #section:basics/page-button -->
					<div class="PageButtonGroup" style="text-align:right">
						<a class="btn-m" href="javascript:fnFormManageInput();"><span class="Text">등록</span></a>
                        <a class="btn-m" href="javascript:fnFormManageDetail();"><span class="Text">수정</span></a>
                        <a class="btn-m" href="javascript:fnFormManageDelete();"><span class="Text">삭제</span></a>
                        <a class="btn-m" href="javascript:history.back();"><span class="Text">이전화면</span></a>
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
                                                    <input type="hidden" class="TextBox" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value=""/>
                                                    <input type="text" class="TextBox" name="PRCDOC_NO" id="PRCDOC_NO" style="width:200px;" value="" readonly/>
                                                </td>
												<td class="Title">절차서명</td>
												<td class="Value">
                                                       <input type="text" class="TextBox" name="PRCDOC_NM" id="PRCDOC_NM" style="width:400px;" value="" readonly/>
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
												<col width="150px" />
												<col width="*" />
												<col width="150px" />
												<col width="150px" />
											</colgroup>
											<tr class="Header">
												<th>선택</th>
												<th>관리번호</th>
												<th>점검구역</th>
												<th>등록자</th>
												<th>등록일</th>
											</tr>
											<c:forEach var="formManage" items="${formManageList}" begin="0" end="${formManageList.size()}" step="1">
												<tr class="Item">
													<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${formManage.UNQ_ID}"></td>
													<td align="left">${formManage.UNQ_ID}</td>
													<td align="left">${formManage.TH1_ITM_NM}</td>
													<td align="center">${formManage.REGPR_NM}</td>
													<td align="center">${formManage.FM_RG_DT}</td>
												</tr>
											</c:forEach>
											<c:if test="${formManageList.size() eq 0}">
												<tr class="Item">
													<td colspan="6" style="text-align: center;">조회된 자료가 없습니다.</td>
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