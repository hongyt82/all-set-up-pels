<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		var gflag = 1;
		
		$(document).ready(function () {
			// 초기값 세팅
			$('#CHCK_STRT_DT').val('${CHCK_STRT_DT}');
			$('#CHCK_END_DT').val('${CHCK_END_DT}');
			$('#REGPR_NM').val('${REGPR_NM}');
		})
		
		function fnSearch (resultData) {
			alert(resultData.TST_UNQ_KY_VAL);
			Android.onEvent(resultData.TST_UNQ_KY_VAL);
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features, flag) {
			let form = document.getElementById('form')
			form.action = "<%=request.getContextPath()%>/Exam_SapList.do"
			form.submit()
		}
		
		function MM_openBrWindow1(theURL,winName,features, flag) {
			  window.open(theURL,winName,features);
		}
		
		function MM_Click(DOC_TYP_CD, PRCDOC_NO, PRT_NO, PRCDOC_NM, PRCDOC_RVSN_NO) {
			let form = document.getElementById('form')
			form.DOC_TYP_CD.value = DOC_TYP_CD;
			form.PRT_NO.value = PRT_NO;
			form.PRCDOC_NO.value = PRCDOC_NO;
			form.PRCDOC_NM.value = PRCDOC_NM;
			form.PRCDOC_RVSN_NO.value = PRCDOC_RVSN_NO;
			
			form.action = "<%=request.getContextPath()%>/Exam_SapFileList.do"
			form.submit()
		}
		
		function MM1_Click(DOC_TYP_CD, PRCDOC_NO, PRT_NO, PRCDOC_NM, PRCDOC_RVSN_NO) {
			window.open('<%=request.getContextPath()%>/Exam_SapFileList.do?SE_DOC_TYP_CD=' + DOC_TYP_CD +'&SE_PRT_NO=' + PRT_NO +'&SE_PRCDOC_NO=' + PRCDOC_NO + '&SE_PRCDOC_NM='+PRCDOC_NM + '&SE_PRCDOC_RVSN_NO=09','','width=1000,height=600');
		}
	</script>
	<style>
		#myTable tbody tr td {
			line-height: 16px;
		}
		
		#myTable tbody tr {
		  transition: background-color 0.2s;
		  cursor: pointer;
		}
		
		#myTable tbody tr:hover {
		  background-color: #e9f3ff;
		}
		
		#myTable tbody tr.Header {
  			cursor: default;
		}
		
		#myTable tbody tr td {
			line-height: 24px;
		}
		
		.Grid th, .SubGrid th, .StatusGrid th, .Grid .Header td, .SubGrid .Header td, .StatusGrid .Header td {
			line-height: 30px;
		}

		body.real-skin  {
			font-size: 14px;
		    min-width: 360px;
		}

	</style>

	
<body class="no-skin real-skin" onload="dateInit();">
	<form id="form" name="form" method="post" enctype="multipart/form-data">
   	<input name="DOC_TYP_CD" id="DOC_TYP_CD" type="hidden" value=""/>
   	<input name="PRT_NO" id="PRT_NO" type="hidden" value=""/>
   	<input name="PRCDOC_NO" id="PRCDOC_NO" type="hidden" value=""/>
   	<input name="PRCDOC_NM" id="PRCDOC_NM" type="hidden" value=""/>
   	<input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" type="hidden" value=""/>
   	<input name="USER_ID" id="USER_ID" type="hidden" value="${USER_ID}"/>
   	
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">운영절차서(SAP) 문서검색</span>
					<span>
						<ul class="breadcrumb">
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>
			</div><!-- /page-header -->
			<!-- #section:basics/page-button -->
			
			<!-- /page-button-->
			<div class="row">
				<div class="col-xs-12">
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
			                            <col style="width:45%" />
									</colgroup>
									<tr>
										<td class="Title"><span class="Label">문서유형</span></td>
										<td class="Value">
			                            <input type="text" class="TextBox" name="SH_DOC_TYP_CD" id="SH_DOC_TYP_CD" value="${SH_DOC_TYP_CD}" style="width:100px;" />
										</td>
										<td class="Title"><span class="Label">문서번호</span></td>
										<td class="Value">
			                            	<input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" value="${SH_PRCDOC_NO}" style="width:100px;" />
										</td>
										<td class="Title"><span class="Label">문서부분</span></td>
										<td class="Value">
			                                <input type="text" class="TextBox" name="SH_PRT_NO" id="SH_PRT_NO" value="${SH_PRT_NO}" style="width:100px;" />
										</td>
									</tr>
								</table>
								<a class="SearchButton" href="javascript:MM_openBrWindow('<%=request.getContextPath()%>/Exam_SapList.do','','width=1000,height=600','1');"><span class='Text'>SAP 조회</span></a>
							</div>
						</div>
					</div>				
					<div class="RealPanel">
						<div class="Title">
							<div class="TitleArea">
								<span class="SubTitle">나의 운영절차서</span><span class="count">총 ${PrcdocList.size()} 건</span>
							</div>
							<div class="ControlArea">
							</div>
						</div>
						<div class="ContentPanel">
							<div class="StatusGrid">

								<table cellspacing="0" cellpadding="0" border="0" class="Outline"  id="myTable">
									<colgroup>
										<col width="80px" />
										<col width="150px" />
										<col width="*" />
										<col width="100px" />
									</colgroup>
									<tr class="Header">
										<th>문서유형</th>
										<th>문서번호</th>
										<th>문서명</th>
										<th>문서부분</th>
									</tr>
									<c:forEach var="form" items="${PrcdocList}" begin="0" end="${PrcdocList.size()}" step="1"  varStatus="status">
										<tr class="Item" onclick="javascript:MM_Click('${form.DOC_TYP_CD}','${form.PRCDOC_NO}','${form.PRT_NO}','${form.PRCDOC_NM}','09');">
											<td align="center">${form.DOC_TYP_CD}</td>
											<td>${form.PRCDOC_NO}</td>
											<td align="left">${form.PRCDOC_NM}</td>
											<td align="center">${form.PRT_NO}</td>
										</tr>
									</c:forEach>
									<c:if test="${formList.size() eq 0}">
										<tr class="Item">
											<td colspan="6" style="text-align: center;">조회된 자료가 없습니다.</td>
										</tr>
									</c:if>
								</table>
							</div>
						</div>
						<!-- PAGE CONTENT ENDS -->
					</div><!-- /.col -->
				</div><!-- /.row -->
			</div><!-- /.page-content-area -->
	</form>
	</body>
</html>