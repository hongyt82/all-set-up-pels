<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	function fnDocViewer(DOC_TYP,DOC_UNQ_ID,DOC_PART_CD, Cnt) {
		if(Cnt != '1') return;
		let form = document.getElementById('form')
		form.DOC_UNQ_ID.value = DOC_UNQ_ID;
		form.DOC_TYP.value = DOC_TYP;
		form.DOC_PART_CD.value = DOC_PART_CD;
		form.action = "http://10.53.0.21/DocViewer_PELS.do";
		form.submit()
	}
</script>
<body class="no-skin real-skin" style="width: 100%; height: 100%; position: fixed; overflow: hidden;" onLoad="fnDocViewer('${FormDrawList[0].DOC_TYP}','${FormDrawList[0].DOC_UNQ_ID}','${FormDrawList[0].DOC_PART_CD}','${FormDrawList.size()}');">
	<form id="form" name="form" method="post">
	    <input type="hidden" name="DOC_TYP" id="DOC_TYP" value=""/>
	    <input type="hidden" name="DOC_UNQ_ID" id="DOC_UNQ_ID" value=""/>
	    <input type="hidden" name="DOC_PART_CD" id="DOC_PART_CD" value=""/>
	</form>
		<div class="page-content" style="width: 100%; height: 100%; position: fixed; overflow: hidden; padding:0;">
			<div class="page-content-area">
				<div class="row">
					<div class="col-xs-12">
						<div class="RealPanel RP-position">
							<div class="RealSearchBox">
								<div class="StatusGrid">
							<table cellspacing="0" cellpadding="0" border="0" class="Outline" style="font-size: 16px;">
								<colgroup>
									<col width="300px" />
									<col width="150px" />
									<col width="150px" />
									<col width="*" />
								</colgroup>
								<tr class="Header">
									<th>절차서번호</th>
									<th>문서유형</th>
									<th>문서부분</th>
									<th>비고</th>
								</tr>
								<c:forEach var="form" items="${FormDrawList}" begin="0" end="${FormDrawList.size()}" step="1">
									<tr class="Item">
										<td align="center"><a href="javascript:fnDocViewer('${form.DOC_TYP}','${form.DOC_UNQ_ID}','${form.DOC_PART_CD}', '1');">${form.DOC_UNQ_ID}</a></td>
										<td align="center">${form.DOC_TYP}</td>
										<td align="center">${form.DOC_PART_CD}</td>
										<td align="center"></td>
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
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>

