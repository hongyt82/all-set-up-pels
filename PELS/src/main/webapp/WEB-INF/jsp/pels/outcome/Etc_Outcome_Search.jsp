<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#FRM_NM').val('${FRM_NM}');
		})
		
		// 결과관리 일반양식 조회
		function fnSearch() {
			let form = document.getElementById('form')
			form.action = "Etc_Outcome_Search.do"
			form.submit()
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}		
	</script>
	<body class="no-skin real-skin">
			<form id="form">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">일반양식</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">결과관리</a>
										</li>
										<li class="active">일반양식</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
                            <a class="btn-m" href="#"><span class="Text">삭제</span></a>
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
														<select>
															<option value="==선택==">한빛6호기</option>
														</select>
													</td>
                                                    <td class="Title"><span class="Label">제목</span></td>
                                                    <td class="Value">
                                                        <input type="text" name="FRM_NM" id="FRM_NM" class="TextBox" value="" style="width:300px;" />
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
                                                    <col width="150px" />
                                                    <col width="150px" />
                                                    <col width="70px" />
													<col width="*" />
                                                    <col width="*" />
                                                    <col width="100px" />
												</colgroup>
												<tr class="Header">
													<th>선택</th>
                                                    <th>작성일자</th>
                                                    <th>작성자</th>
													<th>종류</th>
													<th>양식명</th>
                                                    <th>제목</th>
                                                    <th>기록결과</th>
												</tr>
												<c:forEach var="etcOutcome" items="${etcOutcomeList}" begin="0" end="${etcOutcomeList.size()}" step="1">
													<tr class="Item">
														<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${etcOutcome.FRM_UNQ_KY_VAL}"></td>
														<td align="center">${etcOutcome.FM_RG_DT}</td>
														<td align="center">${etcOutcome.REGPR_NM}</td>
														<td align="center">${etcOutcome.FRM_CFY_NM}</td>
														<td align="left">${etcOutcome.FRM_NM}</td>
														<td align="left">${etcOutcome.TITL_NM}</td>
														<td align="center"><a href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${etcOutcome.OZD_FNAME1}','','width=1000,height=800');"><img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;"></a></td>
													</tr>
												</c:forEach>
												<c:if test="${etcOutcome.size() eq 0}">
													<tr class="Item">
														<td colspan="7" style="text-align: center;">조회된 자료가 없습니다.</td>
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