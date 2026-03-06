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
		
		// 등록 화면으로 이동
		function fnInput () {
			
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
				alert('자료를 선택하여 주십시오.')
				return
			} else if (chkCnt != 1) {
				alert('하나만 선택해야 합니다.')
				return
			}
			let form = document.getElementById('form')
			form.UNQ_ID.value = chkParam;
			form.action = "Outcome_ItemFME_Ozd_Input.do";
			form.submit()
		}		
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}			
	</script>
	<body class="no-skin real-skin">
			<form id="form" name="form" method="post">
			<input type="hidden" name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" value="${TST_UNQ_KY_VAL}">
			<input type="hidden" name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" value="${FRM_UNQ_KY_VAL}">
			<input type="hidden" name="UNQ_ID" id="UNQ_ID" value="">
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
											<a href="#">결과관리</a>
										</li>
										<li class="">점검관리(붙임)</li>
										<li class="active">${examDetail.ATCT_NM}</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
							<a class="btn-m" href="javascript:fnInput();"><span class="Text">OZD 등록</span></a>
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
								</div><br>
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
													<col width="200px" />
													<col width="*" />
													<col width="100px" />
                                                    <col width="100px" />
                                                    <col width="200px" />
                                                    <col width="70px" />
												</colgroup>
												<tr class="Header">
                                                    <th>선택</th>
                                                    <th>관리번호</th>
                                                    <th>점검구역</th>
                                                    <th>점검유무</th>
                                                    <th>점검자</th>
                                                    <th>점검일시</th>
                                                    <th>OZD</th>
												</tr>
												<c:forEach var="OutcomeItemList" items="${OutcomeItemList}" begin="0" end="${OutcomeItemList.size()}" step="1" varStatus="loop">
													<tr class="Item">
														<td align="center">
															<input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${OutcomeItemList.UNQ_ID}">
														</td>
														<td align="center">${OutcomeItemList.UNQ_ID}</td>
														<td align="left">${OutcomeItemList.TH1_ITM_NM}</td>
														<td align="center">${OutcomeItemList.CHCK_YN_NM}</td>
														<td align="center">${OutcomeItemList.REGPR_NM}</td>
														<td align="center">${OutcomeItemList.FM_RG_DT}</td>
														<td align="center">
														<c:choose>
															<c:when test="${null eq OutcomeItemList.OZD_FNAME1 }">
															</c:when>
															<c:otherwise>
																<a href="javascript:MM_openBrWindow('OzdViewer.do?ATFL_PHCL_NM=${OutcomeItemList.OZD_FNAME1}','','width=1000,height=800');"><img src="/resources/themes/QuartzLight/Skins/Image/ozr.png" height="21px;"></a>
															</c:otherwise>
														</c:choose>
														</td>
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
			</form>	
	</body>
</html>