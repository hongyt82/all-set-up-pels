<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>

<style>
</style>
<body class="no-skin real-skin" onload="">
	<div class="page-content">
		<div class="page-content-area">	
			<div class="page-header">
				<h1>
					<span class="title">원전 절차수행기록 디지털시스템(PELS)</span>
				</h1>
			</div><!-- /page-header -->
			<!-- /page-button-->
			<div class="row">
				<div class="col-xs-12">
					<div class="RealPanel" style="height:410px;">
						<div class="DualPanel">
							<div class="ContentPanel" style="background-color:#ffffff; border:0px;">
								<table border="0" cellpadding="0" cellspacing="0">
									<tr valign="top">
										<td style="width:48%;">
											<div class="RealPanel">
													<div class="Title" style="width:780px;">
														<div class="TitleArea">
														<span class="SubTitle"> ▷  정주시시험 준비/수행</span>
														</div>
														<div class="ControlArea">
															<a class="InfoButton" href="javascript:viewMore(21, 'Exam_Monitoring_P', 'Exam_Monitoring.do?PRCDOC_CFY=P','정주기시험 준비/수행 ');"><span class="Text">More >></span></a> </div>
													</div>
													<div class="ContentPanel" style="height:300px;width:780px;">				 
															<div class="StatusGrid" style="width:100%; border-top-color: rgb(53, 74, 95); border-top-width: 1px; border-top-style: solid;">
																<table cellspacing="0" cellpadding="0" border="0" class="Outline">
																	<colgroup>
																		<col width="200" />
																		<col width="150" />
																		<col width="*" />
																	</colgroup>
																	<tr class="Header">
																		<th>시험기간</th>
																		<th>절차서번호</th>
																		<th>시험명</th>
																	</tr>
																	<c:forEach var="examList" items="${examList1}" begin="0" end="${examList1.size()}" varStatus="status">
																		<tr class="Item">
																			<td style="text-align: center;">${examList.CHCK_DT}</td>
																			<td style="text-align: center;">${examList.PRCDOC_NO}</td>
																			<td style="text-align: left;">${examList.TITL_NM}</td>
																		</tr>
																	</c:forEach>
																	<c:if test="${examList1.size() eq 0}">
																		<tr class="Item"><td style="text-align: center;" colspan="4"><b>조회된 데이터가 없습니다.</b></td></tr>
																	</c:if>
																	
																	</table>
																</div>
															</div>
														</div>
												</div>
											</td>
										<td style="width:48%;">
											<div class="RealPanel">
													<div class="Title" style="width:780px;">
														<div class="TitleArea">
														<span class="SubTitle"> ▷  점검지A(DB화) 점검계획수립</span>
														</div>
														<div class="ControlArea"><a class="InfoButton" href="javascript:viewMore(31, 'Exam_Monitoring_M', 'Exam_Monitoring.do?PRCDOC_CFY=M','점검 계획 수립');"><span class="Text">More >></span></a></div>
													</div>
													<div class="ContentPanel" style="height:300px;width:780px;">				 
															<div class="StatusGrid" style="width:100%; border-top-color: rgb(53, 74, 95); border-top-width: 1px; border-top-style: solid;">
																<table cellspacing="0" cellpadding="0" border="0" class="Outline">
																	<colgroup>
																		<col width="200" />
																		<col width="150" />
																		<col width="*" />
																	</colgroup>
																	<tr class="Header">
																		<th>시험기간</th>
																		<th>절차서번호</th>
																		<th>점검명</th>
																	</tr>
																	<c:forEach var="examList" items="${examList2}" begin="0" end="${examList2.size()}" varStatus="status">
																		<tr class="Item">
																			<td style="text-align: center;">${examList.CHCK_DT}</td>
																			<td style="text-align: center;">${examList.PRCDOC_NO}</td>
																			<td style="text-align: left;">${examList.TITL_NM}</td>
																		</tr>
																	</c:forEach>
																	<c:if test="${examList2.size() eq 0}">
																		<tr class="Item"><td style="text-align: center;" colspan="4"><b>조회된 데이터가 없습니다.</b></td></tr>
																	</c:if>
																	</table>
																</div>
															</div>
														</div>
												</div>
											</td>
										</tr>
										<tr><td height="25px;"></td><td></td></tr>
									<tr valign="top">
										<td style="width:48%;">
											<div class="RealPanel">
													<div class="Title" style="width:780px;">
														<div class="TitleArea">
														<span class="SubTitle"> ▷  공지사항</span>
														</div>
														<div class="ControlArea"><a class="InfoButton" href="javascript:viewMore(53, 'Board_Search_C', 'Board_Search.do?GRUP_CFY_CD=C','공지사항');"><span class="Text">More >></span></a></div>
													</div>
													<div class="ContentPanel" style="height:300px;width:780px;">				 
															<div class="StatusGrid" style="width:100%; border-top-color: rgb(53, 74, 95); border-top-width: 1px; border-top-style: solid;">
																<table cellspacing="0" cellpadding="0" border="0" class="Outline">
																	<colgroup>
																		<col width="*" />
																		<col width="120" />
																		<col width="120" />
																	</colgroup>
																	<tr class="Header">
																		<th>제목</th>
																		<th>등록자</th>
																		<th>등록일</th>
																	</tr>
																	<c:forEach var="boardList" items="${boardList2}" begin="0" end="${boardList2.size()}" varStatus="status">
																		<tr class="Item">
																			<td style="text-align: left;">${boardList.BLBR_TITL_NM}</td>
																			<td style="text-align: center;">${boardList.UPDR_NM}</td>
																			<td style="text-align: center;">${boardList.FM_MDF_DT}</td>
																		</tr>
																	</c:forEach>
																	<c:if test="${boardList2.size() eq 0}">
																		<tr class="Item"><td style="text-align: center;" colspan="4"><b>조회된 데이터가 없습니다.</b></td></tr>
																	</c:if>
																	
																	</table>
																</div>
															</div>
														</div>
												</div>
											</td>
										<td style="width:48%;">
											<div class="RealPanel">
													<div class="Title" style="width:780px;">
														<div class="TitleArea">
														<span class="SubTitle"> ▷  고장신고 및 개선의견</span>
														</div>
														<div class="ControlArea"><a class="InfoButton" href="javascript:viewMore(51, 'Board_Search_A', 'Board_Search.do?GRUP_CFY_CD=A','고장신고 및 개선의견');"><span class="Text">More >></span></a></div>
													</div>
													<div class="ContentPanel" style="height:300px;width:780px;">				 
															<div class="StatusGrid" style="width:100%; border-top-color: rgb(53, 74, 95); border-top-width: 1px; border-top-style: solid;">
																<table cellspacing="0" cellpadding="0" border="0" class="Outline">
																	<colgroup>
																		<col width="*" />
																		<col width="120" />
																		<col width="120" />
																	</colgroup>
																	<tr class="Header">
																		<th>제목</th>
																		<th>등록자</th>
																		<th>등록일</th>
																	</tr>
																	<c:forEach var="boardList" items="${boardList1}" begin="0" end="${boardList1.size()}" varStatus="status">
																		<tr class="Item">
																			<td style="text-align: left;">${boardList.BLBR_TITL_NM}</td>
																			<td style="text-align: center;">${boardList.UPDR_NM}</td>
																			<td style="text-align: center;">${boardList.FM_MDF_DT}</td>
																		</tr>
																	</c:forEach>
																	<c:if test="${boardList1.size() eq 0}">
																		<tr class="Item"><td style="text-align: center;" colspan="4"><b>조회된 데이터가 없습니다.</b></td></tr>
																	</c:if>
																	</table>
																</div>
															</div>
														</div>
												</div>
											</td>
										</tr>
									</table>
								</div>
							</div>
						</div>
				</div><!-- /.col -->
			</div><!-- /.row -->
		</div><!-- /.page-content-area -->
	</div><!-- /.page-content -->	
	<script type="text/javascript">
		function openPop (target) {
			const pUrl = '/Photo_POP.do?PHTO_YN='+target.getAttribute('div')+'&PHTO_PTH_INFO='+target.src.replace('_thumbnail', '')
			const pName = '_blank'
			const pOption = 'top=200, left=400, width=1200, height=800, status=no, menubar=no, toolbar=no, resizable=no'
			window.open(pUrl, pName, pOption)
		}
		
		function viewMore (tabNo, viewNm, actionURL, viewNm_KR) {
			parent.tabClose(tabNo)
			parent.addTab(tabNo, viewNm, actionURL, viewNm_KR)
		}
		
		function notice(){
			const pUrl = '/Notice.do'
			const pName = '_blank'
			const pOption = 'top=200, left=400, width=800, height=600, status=no, menubar=no, toolbar=no, resizable=no'
			window.open(pUrl, pName, pOption)
		}
	</script>	
</body>
</html>
