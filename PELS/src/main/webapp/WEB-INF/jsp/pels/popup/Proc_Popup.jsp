<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		let procedureList;
		$(document).ready(function () {
			procedureList = '${jsonArray}';
			procedureList = JSON.parse(procedureList.replaceAll('\t', ''));
		})	
	
		// 절차서관리 선택
		function fnProcedureSelect () {
			const chkElements = document.getElementsByName("CHK_ITEM");
			let chkCnt = 0;
			let returnValue = '';
			for (let i = 0; i < chkElements.length; i++) { 
				if ($(chkElements[i]).is(':checked')) {
					chkCnt++;
					returnValue = procedureList[i];
				}
			}
			
			if (chkCnt == 0) {
				alert('자료를 선택하여 주십시오.')
				return
			} else if (chkCnt > 1) {
				alert('자료를 하나만 선택하여 주십시오.')
				return
			}
			
			window.opener.getReturnValue(returnValue);
			window.close();
		}
		// 체크박스 한개만
		function checkOnlyOne(element) {
			const chkElements = document.getElementsByName("CHK_ITEM");
			const isChecked = element.checked;
			
			for (let i = 0; i < chkElements.length; i++) {
				chkElements[i].checked = false;
			}
			
			element.checked = isChecked;
		}
	</script>
	<body class="no-skin real-skin real-popup">
		<div class="Header">  
			<div class="PageTitle">				
				<span class="Text">절차서 선택</span>	
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
				<div class="ContentPanel">
					<div class="Grid">
						<table cellspacing="0" cellpadding="0" border="0" class="Outline">
							<colgroup>
								<col width="70px" />
								<col width="150px" />
								<col width="*" />
								<col width="80px" />
								<col width="100px" />
                                <col width="100px" />
                                <col width="100px" />
							</colgroup>
							<tr class="Header">
								<th>선택</th>
								<th>절차서번호</th>
								<th>절차서명</th>
								<th>문서유형</th>
								<th>문서부분번호</th>
								<th>등록자</th>
								<th>등록일자</th>
							</tr>
							<c:forEach var="procedure" items="${procedureList}" begin="0" end="${procedureList.size()}" step="1">
								<tr class="Item">
									<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${procedure.PRCDOC_UNQ_KY_VAL}" onclick="checkOnlyOne(this)"></td>
									<td>${procedure.PRCDOC_NO}</td>
									<td align="left">${procedure.PRCDOC_NM}</td>
									<td align="center">${procedure.DOC_TYP}</td>
									<td align="center">${procedure.DOC_PART_NO}</td>
									<td align="center">${procedure.REGPR_NM}</td>
									<td align="center">${procedure.FM_RG_DT}</td>
								</tr>
							</c:forEach>
							<c:if test="${procedureList.size() eq 0}">
								<tr class="Item">
									<td colspan="7" style="text-align: center;">조회된 자료가 없습니다.</td>
								</tr>
							</c:if>
							
						</table>
						<div class="Paging" style="text-align:center;">
							<c:choose>
								<c:when test="${1 eq PAGE}">
									<a disabled="disabled" title="첫번째 페이지"><span class="ArrowFirst_disable"></span><span class="TextButton">≪</span></a>
								</c:when>
								<c:otherwise>
									<a href="javascript:fnPage('1');" title="첫번째 페이지"><span class="ArrowFirst"></span><span class="TextButton">≪</span></a>
								</c:otherwise>
							</c:choose>
							<span class='Space'>&nbsp;</span>
							<c:choose>
								<c:when test="${STARTPAGE-1 < 1}">
									<a disabled="disabled" title="이전 20페이지"><span class="ArrowPrev_disable"></span><span class="TextButton">&lt;</span></a>
								</c:when>
								<c:otherwise>
									<a href="javascript:fnPage('${STARTPAGE-1}');" title="이전 20페이지"><span class="ArrowPrev"></span><span class="TextButton">&lt;</span></a>
								</c:otherwise>
							</c:choose>
							
							<span class='Space'>&nbsp;</span>
							<span class="Number">
								<c:forEach var="num" begin="${STARTPAGE}" end="${ENDPAGE}" step="1">
									
									<c:choose>
										<c:when test="${num == PAGE}">
											<span class="Label" style="width:30px;">${num}</span>
										</c:when>
										<c:otherwise>
											<a href="javascript:fnPage('${num}');" class="link" style="width:30px;">${num}</a>
										</c:otherwise>
									</c:choose>
									<c:if test="${num ne ENDPAGE}">
										<span class='Space'>&nbsp;</span>
									</c:if>
								</c:forEach>
							</span>
							<span class='Space'>&nbsp;</span>
							<c:choose>
								<c:when test="${ENDPAGE+1 > TOTALPAGE}">
									<a disabled="disabled" title="다음 20 페이지"><span class="ArrowNext_disable"></span><span class="TextButton">&gt;</span></a>
								</c:when>
								<c:otherwise>
									<a href="javascript:fnPage('${ENDPAGE + 1}');" title="다음 20 페이지"><span class="ArrowNext"></span><span class="TextButton">&gt;</span></a>
								</c:otherwise>
							</c:choose>
							<span class='Space'>&nbsp;</span>
							<c:choose>
								<c:when test="${PAGE eq TOTALPAGE}">
									<a disabled="disabled" title="마지막 페이지"><span class="ArrowLast_disable"></span><span class="TextButton">≫</span></a>
								</c:when>
								<c:otherwise>
									<a href="javascript:fnPage('${TOTALPAGE}');" title="마지막 페이지"><span class="ArrowLast"></span><span class="TextButton">≫</span></a>
								</c:otherwise>
							</c:choose>
						</div>
							<div class="PageButtonGroup">
							<a class="btn-m" href="javascript:fnProcedureSelect() ;"><span class="Text">선택</span></a>
							<a class="btn-m btn-ms" href="javascript:top.window.close() ;"><span class="Text">닫기</span></a> 
						</div>
					</div>
				</div>
			</div>
		</div>
	 

</body>

</html>

