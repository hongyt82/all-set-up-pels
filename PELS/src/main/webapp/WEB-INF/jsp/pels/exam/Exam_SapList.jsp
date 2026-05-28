<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<script>
	let formList;
	// 필요한 화면에서만 라이브러리 호출로 활성화 (공통 JS => pels_webview_ime_helper.js)
    // /WEB-INF/jsp/pels/include/common.jspf 공통쪽에 선언되어 있음
	$(document).ready(function () {
		if (window.PelsImeHelper && typeof window.PelsImeHelper.bind === 'function') {
            // 각 input 입력 id 순서대로
			window.PelsImeHelper.bind({
				ids: ['SH_DOC_TYP_CD', 'SH_PRCDOC_NO', 'SH_PRT_NO'],
				// 키패드 이벤트 각 정의(focus/click/touchstart 시 focus/click 재시도)
				enableKeyboardRequest: true,
				// 완료(Enter) → blur → 다음 input focus
				enableEnterFlow: true,
				// 화면별 디버깅
				log: true,
				logPrefix: '[SapListIME]'
			});
		}
	});

	function fnPage (page) {
		let form = document.getElementById('form')
		form.PAGE.value = page;
		form.action = "<%=request.getContextPath()%>/Form_Popup.do"
		form.submit()
	}

    /**
     * SAP 조회 버튼
     */
    function fnSearch () {
		// 1> 현재 입력값 즉시 확보 (키보드/포커스 영향 없이)
        var SH_DOC_TYP_CD = $('#SH_DOC_TYP_CD').val();
		var SH_PRCDOC_NO = $('#SH_PRCDOC_NO').val();
		var SH_PRT_NO = $('#SH_PRT_NO').val();

        console.log('[SapListSearch] Before fnSearch clicked', {
            SH_DOC_TYP_CD: SH_DOC_TYP_CD,
            SH_PRCDOC_NO: SH_PRCDOC_NO,
            SH_PRT_NO: SH_PRT_NO
        });
        // 유의 사항 => 가져온 value 값에 대하여 모두 전달 받지 않으면 API 호출 직접 호출안되게 validation 부분은 전반 개발 상황에 따라 조절함
        if(!SH_DOC_TYP_CD || !SH_PRCDOC_NO || !SH_PRT_NO){
            alert("=============빈칸 허용 안함 Exam_SapList.jsp ===========");
            console.log('[Exam_Input_M] After MM_openBrWindow clicked', {
                SH_DOC_TYP_CD: SH_DOC_TYP_CD,
                SH_PRCDOC_NO: SH_PRCDOC_NO,
                SH_PRT_NO: SH_PRT_NO
            });
            return;
        }

        // 2> 키보드가 올라오지 않도록 현재 포커스 해제(blur) 현재의 사항 반드시 적용 필.
		try {
			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur();
			}
		} catch (e) {}

		// 3> 기존 패턴 유지: form submit으로 조회 (기존 히스토리 이렇게 되어 있었음)
		var form = document.getElementById('form');
		form.action = "<%=request.getContextPath()%>/Exam_SapList.do";
		form.submit();
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
                            <input type="text" class="TextBox" name="SH_DOC_TYP_CD" id="SH_DOC_TYP_CD" value="${SH_DOC_TYP_CD}" style="width:60px;" inputmode="text" enterkeyhint="next" autocomplete="off" autocapitalize="off" />
							</td>
							<td class="Title"><span class="Label">문서번호</span></td>
							<td class="Value">
                            	<input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" value="${SH_PRCDOC_NO}" style="width:150px;" inputmode="text" enterkeyhint="next" autocomplete="off" autocapitalize="off" />
							</td>
							<td class="Title"><span class="Label">문서부분</span></td>
							<td class="Value">
                                <input type="text" class="TextBox" name="SH_PRT_NO" id="SH_PRT_NO" value="${SH_PRT_NO}" style="width:100px;" inputmode="text" enterkeyhint="done" autocomplete="off" autocapitalize="off" />
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

