<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	let formList;
	$(document).ready(function () {
	})	

	function fnPage (page) {
		let form = document.getElementById('form')
		form.PAGE.value = page;
		form.action = "<%=request.getContextPath()%>/Form_Popup.do"
		form.submit()
	}	

	function fnSearch () {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_SapList.do"
		form.submit()
	}
	
	function fnFormBack () {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_Input_M.do"
		form.submit()
	}
	
	function MM_Click(DOC_TYP, PRCDOC_NO, DOC_PART_NO, PRCDOC_NM, PRCDOC_RVSN_NO) {
		let form = document.getElementById('form')
		form.action = "<%=request.getContextPath()%>/Exam_SapFileList.do"
		form.DOC_TYP_CD.value = DOC_TYP;
		form.PRCDOC_NO.value = PRCDOC_NO;
		form.PRCDOC_NM.value = PRCDOC_NM;
		form.PRT_NO.value = DOC_PART_NO;
		form.PRCDOC_RVSN_NO.value = PRCDOC_RVSN_NO;
		form.submit()
	}
</script>

<style>
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
	
	body.real-skin  {
		font-size: 14px;
	    min-width: 360px;
	}	
	
</style>


<body class="no-skin real-skin real-popup">
<form id="form" name="form" method="post">
<input type="hidden" name="DOC_TYP_CD" value="">
<input type="hidden" name="PRCDOC_NO" value="">
<input type="hidden" name="PRCDOC_NM" value="">
<input type="hidden" name="PRT_NO" value="">
<input type="hidden" name="PRCDOC_RVSN_NO" value="">

<div class="Header">  
	<div class="PageTitle">		
		<span class="Text">SAP 시험 목록</span>
	</div>      
	<span class="ButtonClose" onclick="javascript:top.window.close() ;">&nbsp;</span>         
</div>
<div class="Contents"> 			
	<div class="RealPanel">
		<div class="Title">
			<div class="TitleArea">
				<span class="SubTitle"></span>
			</div>
			<div class="ControlArea"></div>
		</div>
		<div class="RealSearchBox">
			<div class="NormalSearch">
				<div class="Default">
					<table border="0" cellpadding="0" cellspacing="0" class="Outline">
						<colgroup>
							<col class="Title" />
							<col style="width:15%" />
							<col class="Title" />
							<col style="width:25%" />
                            <col class="Title" />
                            <col style="width:25%" />
                            <col class="Title" />
                            <col style="width:25%" />
						</colgroup>
						<tr>
							<td class="Title"><span class="Label">문서유형</span></td>
							<td class="Value">
                            <input type="text" class="TextBox" name="SH_DOC_TYP_CD" id="SH_DOC_TYP_CD" value="${SH_DOC_TYP_CD}" style="width:60px;" />
							</td>
							<td class="Title"><span class="Label">문서번호</span></td>
							<td class="Value">
                            	<input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" value="${SH_PRCDOC_NO}" style="width:150px;" />
							</td>
							<td class="Title"><span class="Label">문서부분</span></td>
							<td class="Value">
                                <input type="text" class="TextBox" name="SH_PRT_NO" id="SH_PRT_NO" value="${SH_PRT_NO}" style="width:100px;" />
							</td>
						</tr>
					</table>
					<a class="SearchButton" href="javascript:fnSearch();"><span class='Text'>SAP 조회</span></a>
				</div>
			</div>
		</div>				
		<div class="ContentPanel">
			<div class="Grid">
				<table id="myTable" cellspacing="0" cellpadding="0" border="0" class="Outline">
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
					<c:forEach var="form" items="${SapList}" begin="0" end="${SapList.size()}" step="1">
						<tr class="Item" onclick="javascript:MM_Click('${form.DOC_TYP_CD}','${form.PRCDOC_NO}','${form.PRT_NO}','${form.PRCDOC_NM}','09');">
							<td align="center">${form.DOC_TYP_CD}</td>
							<td>${form.PRCDOC_NO}</td>
							<td align="left">${form.PRCDOC_NM}</td>
							<td align="center">${form.PRT_NO}</td>
						</tr>
					</c:forEach>
					<c:if test="${SapList.size() eq 0}">
						<tr class="Item">
							<td colspan="6" style="text-align: center;">조회된 자료가 없습니다.</td>
						</tr>
					</c:if>
				</table>
				<div class="PageButtonGroup">
					<a class="btn-m" href="javascript:fnFormBack();"><span class="Text">이전화변</span></a>
				</div>
			</div>
		</div>
	</div>
</div>
</form>
</body>
</html>

