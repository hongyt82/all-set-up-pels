<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	let formList;
	$(document).ready(function () {
		formList = '${jsonArray}';
		formList = JSON.parse(formList.replaceAll('\t', ''));
	})	

	// 절차서관리 선택
	function fnFormSelect () {
		const chkElements = document.getElementsByName("CHK_ITEM");
		let chkCnt = 0;
		let returnValue = '';
		for (let i = 0; i < chkElements.length; i++) { 
			if ($(chkElements[i]).is(':checked')) {
				chkCnt++;
				returnValue = formList[i];
			}
		}
		
		if (chkCnt == 0) {
			alert('자료를 선택하여 주십시오.')
			return
		} else if (chkCnt > 1) {
			alert('자료를 하나만 선택하여 주십시오.')
			return
		}
		
		window.opener.getUserReturnValue(returnValue);
		window.close();
	}
	
	function fnPage (page) {
		let form = document.getElementById('form')
		form.PAGE.value = page;
		form.action = "User_Popup.do"
		form.submit()
	}	

	function fnSearch () {
		let form = document.getElementById('form');
		var PPCD = $('#PPCD').val();
		
		if(PPCD == "" && form.SEARCH_TEXT.value == "") {
			alert("전체 검색시에는 검색 문자를 입력해주세요");
			return;
		}
		
		form.action = "User_Popup.do";
		form.submit();
	}	
</script>

<body class="no-skin real-skin real-popup">
<form id="form" name="form" method="post">
<input type="hidden" name="PAGE" value="${PAGE}">
<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
<div class="Header">  
	<div class="PageTitle">		
		<span class="Text">사용자 선택</span>
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
								<option value="">전체</option>
								<c:forEach var="plant" items="${plantList}" begin="0" end="${plantList.size()}" step="1">
									<option value="${plant.PPCD.substring(0,3)}" <c:if test="${plant.PPCD.substring(0,3) eq PPCD}">selected</c:if>> ${plant.PWPL_NM}</option>
								</c:forEach>
								</select>
							</td>
							<td class="Title"><span class="Label">사번/성명</span></td>
							<td class="Value">
                                  	<input type="text" class="TextBox" name="SEARCH_TEXT" id="SEARCH_TEXT" value="${SEARCH_TEXT}" style="width:120px;" />
							</td>
						</tr>
					</table>
					<a class="SearchButton" href="javascript:fnSearch();"><span class='Text'>조회</span></a>
				</div>
			</div>
		</div>				
		<div class="ContentPanel">
			<div class="Grid">
				<table cellspacing="0" cellpadding="0" border="0" class="Outline">
					<colgroup>
						<col width="70px" />
						<col width="100px" />
						<col width="100px" />
						<col width="150px" />
						<col width="*" />
					</colgroup>
					<tr class="Header">
						<th>선택</th>
						<th>사번</th>
						<th>성명</th>
						<th>발전소</th>
						<th>부서</th>
					</tr>
					<c:forEach var="userList" items="${userList}" begin="0" end="${userList.size()}" step="1">
						<tr class="Item">
							<td align="center" style="font-weight:bold"><input name="CHK_ITEM" id="CHK_ITEM" type="checkbox" value="${userList.LISTNUM}" onclick="checkOnlyOne(this)"></td>
							<td align="center">${userList.USER_ID}</td>
							<td align="center">${userList.USER_NAME}</td>
							<td align="left">${userList.PLANT_DESC}</td>
							<td align="left">${userList.DEPT_NM}</td>
						</tr>
					</c:forEach>
					<c:if test="${formList.size() eq 0}">
						<tr class="Item">
							<td colspan="6" style="text-align: center;">조회된 자료가 없습니다.</td>
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
					<a class="btn-m" href="javascript:fnFormSelect() ;"><span class="Text">선택</span></a>
					<a class="btn-m btn-ms" href="javascript:top.window.close() ;"><span class="Text">닫기</span></a> 
				</div>
			</div>
		</div>
	</div>
</div>
</form>
</body>
</html>

