<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#FRM_UNQ_KY_VAL').val('${FRM_UNQ_KY_VAL}');
			$('#TST_UNQ_KY_VAL').val('${TST_UNQ_KY_VAL}');
		})
		
		// 결과관리 시험(점검)자료이력정보 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Outcome_Item_Search.do"
			form.submit()
		}
	</script>
	<body class="no-skin real-skin">
			<div class="main-content">
				<!-- /section:basics/content.util-area -->
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">${examDetail.ATCT_NM}</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">점검지(DB화)</a>
										</li>
										<li class="">점검 계획 수립</li>
										<li class="active">${examDetail.ATCT_NM}</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:history.back();"><span class="Text">이전화면</span></a>
						</div>
						<!-- /page-button-->
						<div class="row">
							<div class="col-xs-12">
								<!-- PAGE CONTENT BEGINS -->								
										<div class="ContentPanel">
											<div class="GridWrite">       
										<table cellspacing="0" cellpadding="0" border="0" class="Outline">
										<colgroup>
											<col class="Title" />
											<col style="width:20%" />
											<col class="Title" />
											<col style="width:40%" />
											<col class="Title" />
											<col style="width:40%" />
										</colgroup>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label">절차서번호</span></th>
                                            <td class="Value" align="center">
                                            	${examDetail.PRCDOC_NO}
                                           	</td>
                                            <th class="Title"><span class="Label">절차서명</span></th>
                                            <td class="Value" colspan=3>
                                            	${examDetail.PRCDOC_NM}
                                            </td>
                                        </tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label">시험기간</span></th>
                                            <td class="Value"  align="center">
                                            	${examDetail.CHCK_DT}
                                            </td>
                                            <th class="Title"><span class="Label">점검지명</span></th>
                                            <td class="Value">
                                            	${examDetail.ATCT_NM}
                                            </td>
                                            <th class="Title"><span class="Label">점검명</span></th>
                                            <td class="Value">
                                            	${examDetail.TITL_NM}
                                            </td>
                                        </tr>
                                        </table>
											</div>	
										</div>

								
								<div class="RealPanel">
									<div class="Title">
										<div class="TitleArea">
											<span class="SubTitle">점검결과표</span><span class="count">${TCNT}</span>
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
													<col width="*" />
													<col width="100px" />
                                                    <col width="100px" />
                                                    <col width="200px" />
												</colgroup>
												<tr class="Header">
                                                    <th>순번</th>
                                                    <th>설명</th>
                                                    <th>점검유무</th>
                                                    <th>점검자</th>
                                                    <th>점검일시</th>
												</tr>
												<c:forEach var="outcomeItem" items="${OutcomeItemList}" begin="0" end="${OutcomeItemList.size()}" step="1" varStatus="loop">
													<tr class="Item">
														<td align="center">
															${loop.index+1}
															<input name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" type="hidden" value="${outcomeItem.FRM_UNQ_KY_VAL}">
															<input name="UNQ_ID" id="UNQ_ID" type="hidden" value="${outcomeItem.UNQ_ID}">
														</td>
														<td align="left">${outcomeItem.TH1_ITM_NM} ${outcomeItem.TH2_ITM_NM} ${outcomeItem.TH3_ITM_NM}</td>
														<td align="center">${outcomeItem.CHCK_YN_NM}</td>
														<td align="center">${outcomeItem.REGPR_NM}</td>
														<td align="center">${outcomeItem.FM_RG_DT}</td>
													</tr>
												</c:forEach>
												<c:if test="${outcomeItemList.size() eq 0}">
													<tr class="Item">
														<td colspan="5" style="text-align: center;">조회된 자료가 없습니다.</td>
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
	</body>
</html>