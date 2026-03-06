<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#SH_FRM_NM').val('${SH_FRM_NM}');
		})
		
		// 등록 화면으로 이동
		function fnFormInput () {
			let form = document.getElementById('form')
			form.action = "Form_Etc_Input.do"
			form.submit()
		}
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "/Form_Etc_Search.do"
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
			form.FRM_UNQ_KY_VAL.value = chkParam;
			form.action = "Form_Etc_Detail.do";
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
				url: 'Form_Etc_Delete_Ajax.do',
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
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL, winName, features);
		}
		
		function MM_openPDF(UNQ_NO)
		{
			window.open("", "PopupOpen", "width=1000,height=800");
			
			let form = document.getElementById('form')
			form.action = "PdfViewer.do";
			form.target = "PopupOpen"; 
			form.ATFL_GRUP_NM.value = "GE_MP_ETCFRM_M";
			form.UNQ_NO.value = UNQ_NO;
			form.ATFL_ID.value = "1";
			form.submit()
		}
		
		function MM_openOZR(ATFL_PHCL_NM)
		{
			window.open("", "PopupOpen", "width=1000,height=800");
			
			let form = document.getElementById('form')
			form.action = "OzrViewer.do";
			form.target = "PopupOpen"; 
			form.ATFL_PHCL_NM.value = ATFL_PHCL_NM;
			form.submit()
		}
		
		function fnDownLoad(ATFL_PHCL_NM, ATFL_ORSRC_NM)
		{
			let form = document.getElementById('form')
			form.action = "FileDownload.do";
			form.ATFL_PHCL_NM.value = ATFL_PHCL_NM;
			form.ATFL_ORSRC_NM.value = ATFL_ORSRC_NM;
			form.submit()
		}
	</script>
	<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
    <input type="hidden" class="TextBox" name="FRM_UNQ_KY_VAL" id=FRM_UNQ_KY_VAL value=""/>
    <input type="hidden" class="TextBox" name="FRM_CFY" id="FRM_CFY" value="${FRM_CFY}"/>
    <input type="hidden" class="TextBox" name="MY_DATA" id="MY_DATA" value="${MY_DATA}"/>
    <input type="hidden" class="TextBox" name="ATFL_GRUP_NM" id="ATFL_GRUP_NM" value=""/>
    <input type="hidden" class="TextBox" name="UNQ_NO" id="UNQ_NO" value=""/>
    <input type="hidden" class="TextBox" name="ATFL_ID" id="ATFL_ID" value=""/>
    <input type="hidden" class="TextBox" name="ATFL_PHCL_NM" id="ATFL_PHCL_NM" value=""/>
    <input type="hidden" class="TextBox" name="ATFL_ORSRC_NM" id="ATFL_ORSRC_NM" value=""/>
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">${subTitle}</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">점검지B(필기)</a>
										</li>
										<li class="active">${subTitle}</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
						<c:if test="${MY_DATA eq 'Y'}">
							<a class="btn-m" href="javascript:fnFormInput();"><span class="Text">등록</span></a>
                            <a class="btn-m" href="javascript:fnFormDetail();"><span class="Text">수정</span></a>
                            <a class="btn-m" href="javascript:fnFormDelete();"><span class="Text">삭제</span></a>
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
													<col style="width:25%" />
													<col class="Title" />
													<col style="width:25%" />
                                                    <col class="Title" />
                                                    <col style="width:25%" />
                                                    <col class="Title" />
                                                    <col style="width:25%" />
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
                                                    <td class="Title">붙임명</td>
													<td class="Value">
                                                        <input type="text" class="TextBox" name="SH_FRM_NM" id=SH_FRM_NM value="" style="width:200px;" />
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
											<a class="btn-c" href="#"><span class="Text">엑셀다운로드</span></a>
										</div>
									</div>
									<div class="ContentPanel">
										<div class="StatusGrid">
											<table cellspacing="0" cellpadding="0" border="0" class="Outline">
												<colgroup>
													<col width="70px" />
													<col width="*" />
                                                    <col width="100px" />
                                                    <col width="100px" />
                                                    <col width="150px" />
                                                    <col width="150px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
													<th>붙임(양식)명</th>
                                                    <th>파일</th>
                                                    <th>공개여부</th>
                                                    <th>등록자</th>
                                                    <th>등록일자</th>
												</tr>
												<c:forEach var="etcForm" items="${etcFormList}" begin="0" end="${etcFormList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox"  onclick="checkOnlyOne(this)"  value="${etcForm.FRM_UNQ_KY_VAL}"></td>
														<td align="left">${etcForm.FRM_NM}</td>
														<c:choose>
															<c:when test="${'PDF' eq etcForm.FRM_CFY}">
																<td align="center">
																	<a class="SubButton" href="javascript:fnDownLoad('${etcForm.ATFL_PHCL_NM}','${etcForm.ATFL_ORSRC_NM}');">
																		<span class="Text">다운로드</span>
																	</a>
																</td>
															</c:when>
															<c:otherwise>
																<td align="center">
																	<!-- <a class="SubButton" href="javascript:MM_openPDF('${etcForm.ATFL_PHCL_NM}');">
																		<span class="Text">보기</span>
																	</a>
																	 -->
																</td>
															</c:otherwise>
														</c:choose>
														<td align="center">${etcForm.OPPB_CFY}</td>
														<td align="center">${etcForm.REGPR_NM}</td>
														<td align="center">${etcForm.FM_RG_DT}</td>
													</tr>
												</c:forEach>
												<c:if test="${etcFormList.size() eq 0}">
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