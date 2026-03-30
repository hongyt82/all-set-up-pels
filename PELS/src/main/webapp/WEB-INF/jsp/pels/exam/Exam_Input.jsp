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
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let params = new Object()
			let formData = new FormData()
			
			formData.append('CHCK_STRT_DT', $('#CHCK_STRT_DT').val());		// 점검시작일자	
			formData.append('CHCK_END_DT', $('#CHCK_END_DT').val());		// 점검종료일자	
			formData.append('TITL_NM', $('#TITL_NM').val());				// 제목명	
			formData.append('CHKPR_ID', $('#CHKPR_ID').val());				// 점검자ID	
			formData.append('CHKPR_FNM', $('#CHKPR_FNM').val());			// 점검자성명	
			formData.append('WRKOR_NO', $('#WRKOR_NO').val());				// 작업오더번호	
			formData.append('PRSTS_CFY', $('#PRSTS_CFY').val());			// 진행상태구분	
			formData.append('CNMR_ID', $('#CNMR_ID').val());				// 확인자ID	
			formData.append('CNMR_FNM', $('#CNMR_FNM').val());				// 확인자명	
			formData.append('ATWT_EMP_ID', $('#ATWT_EMP_ID').val());		// 입회자ID	
			formData.append('ATWT_FNM', $('#ATWT_FNM').val());				// 입회자명	

			formData.append('DOC_TYP_CD', $('#DOC_TYP_CD').val());	
			formData.append('PRT_NO', $('#PRT_NO').val());	
			formData.append('PRCDOC_NO', $('#PRCDOC_NO').val());	
			formData.append('PRCDOC_TITL', $('#PRCDOC_TITL').val());	
			formData.append('PRCDOC_RVSN_NO', $('#PRCDOC_RVSN_NO').val());	
			formData.append('FILE_URL1', $('#FILE_URL1').val());	
			formData.append('FILE_URL2', $('#FILE_URL2').val());	
			formData.append('FILE_URL3', $('#FILE_URL3').val());	
			formData.append('FILE_URL4', $('#FILE_URL4').val());	
			formData.append('FILE_URL5', $('#FILE_URL5').val());	
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Exam_Insert_Ajax.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg + "," + resultData.TST_UNQ_KY_VAL);
						fnSearch();
					} else {
						alert('등록에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('등록에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
		
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Exam_Search.do"
			form.submit()
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features, flag) {
		  window.open(theURL,winName,features);
		}
		
		function MM_Click(DOC_TYP_CD, PRCDOC_NO, PRT_NO, PRCDOC_TITL, PRCDOC_RVSN_NO) {
			window.open('Exam_SapFileList.do?SE_DOC_TYP_CD=' + DOC_TYP_CD +'&SE_PRT_NO=' + PRT_NO +'&SE_PRCDOC_NO=' + PRCDOC_NO + '&SE_PRCDOC_TITL='+PRCDOC_TITL + '&SE_PRCDOC_RVSN_NO=09','','width=1000,height=600');
		}
		
		// 팝업 선택된 값 세팅
		function getReturnValue(DOC_TYP_CD, PRCDOC_NO, PRT_NO, PRCDOC_TITL, PRCDOC_RVSN_NO, FILE_URL1, FILE_URL2, FILE_URL3, FILE_URL4, FILE_URL5) {
			$('#DOC_TYP_CD').val(DOC_TYP_CD);
			$('#PRT_NO').val(PRT_NO);
			$('#PRCDOC_NO').val(PRCDOC_NO);
			$('#PRCDOC_TITL').val(PRCDOC_TITL);
			$('#PRCDOC_RVSN_NO').val(PRCDOC_RVSN_NO);
			$('#FILE_URL1').val(FILE_URL1);
			$('#FILE_URL2').val(FILE_URL2);
			$('#FILE_URL3').val(FILE_URL3);
			$('#FILE_URL4').val(FILE_URL4);
			$('#FILE_URL5').val(FILE_URL5);
			
			$('#TITL_NM').val(PRCDOC_TITL + "[${CHCK_STRT_DT}]");
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
	</style>
	
<body class="no-skin real-skin" onload="dateInit();">
	<form id="form" name="form" method="post" enctype="multipart/form-data">
   	<input name="PRSTS_CFY" id="PRSTS_CFY" type="hidden" value="R"/>
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">시험준비 등록</span>
					<span>
						<ul class="breadcrumb">
							<li>
								<a href="#">나의 시험</a>
							</li>
							<li class="active">시험준비 등록</li>
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
										<col style="width:15%" />
										<col class="Title" />
										<col style="width:15%" />
			                            <col class="Title" />
			                            <col style="width:15%" />
			                            <col class="Title" />
			                            <col style="width:45%" />
									</colgroup>
									<tr>
										<td class="Title"><span class="Label">문서유형</span></td>
										<td class="Value">
			                            <input type="text" class="TextBox" name="SH_DOC_TYP_CD" id="SH_DOC_TYP_CD" value="FP0" style="width:150px;" />
										</td>
										<td class="Title"><span class="Label">문서번호</span></td>
										<td class="Value">
			                            	<input type="text" class="TextBox" name="SH_PRCDOC_NO" id="SH_PRCDOC_NO" value="" style="width:150px;" />
										</td>
										<td class="Title"><span class="Label">문서부분</span></td>
										<td class="Value">
			                                <input type="text" class="TextBox" name="SH_PRT_NO" id="SH_PRT_NO" value="" style="width:150px;" />
										</td>
									</tr>
								</table>
								<a class="SearchButton" href="javascript:MM_openBrWindow('Exam_SapList.do','','width=1000,height=600','1');"><span class='Text'>SAP 조회</span></a>
							</div>
						</div>
					</div>				
					<div class="RealPanel">
						<div class="Title">
							<div class="TitleArea">
								<span class="SubTitle">나의 절차서</span><span class="count">총 ${PrcdocList.size()} 건</span>
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
										<tr class="Item" onclick="javascript:MM_Click('${form.DOC_TYP_CD}','${form.PRCDOC_NO}','${form.PRT_NO}','${form.PRCDOC_TITL}','${form.PRCDOC_RVSN_NO}');">
											<td align="center">${form.DOC_TYP_CD}</td>
											<td>${form.PRCDOC_NO}</td>
											<td align="left">${form.PRCDOC_TITL}</td>
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
					</div>
					
					<!-- PAGE CONTENT BEGINS -->	
					<div class="RealPanel">
							<div class="Title">
								<div class="TitleArea">
									<span class="SubTitle"></span>
								</div>
								<div class="ControlArea"><span class="Label Req">표시는 필수입력항목입니다.</span></div>
							</div>
							<div class="ContentPanel">
								<div class="GridWrite">       
									<table cellspacing="0" cellpadding="0" border="0" class="Outline">
                                                 <tr class="Row">
                                                     <th class="Title"><span class="Label Req">절차서번호</span></th>
                                                     <td class="Value">
                                                     	<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" style="width:200px;" readonly> 
                                                     	<input name="FILE_URL1" id="FILE_URL1" title="파일경로" type="hidden" class="TextBox" readonly>
                                                     	<input name="FILE_URL2" id="FILE_URL2" title="파일경로" type="hidden" class="TextBox" readonly>
                                                     	<input name="FILE_URL3" id="FILE_URL3" title="파일경로" type="hidden" class="TextBox" readonly>
                                                     	<input name="FILE_URL4" id="FILE_URL4" title="파일경로" type="hidden" class="TextBox" readonly>
                                                     	<input name="FILE_URL5" id="FILE_URL5" title="파일경로" type="hidden" class="TextBox" readonly>
                                                     	<!--  
                                                     	<a href="javascript:MM_openBrWindow('Exam_PrcdocList.do','','width=1000,height=600','1');" class="InfoButton">
                                                     		<span class='Wrap'>
                                                     			<span class="Text">절차서선택</span>
                                                     		</span>
                                                     	</a> 
                                                     	-->
                                                     </td>
                                                     <th class="Title"><span class="Label">절차서명</span></th>
                                                     <td class="Value"><input name="PRCDOC_TITL" id="PRCDOC_TITL" title="절차서명" type="text" class="TextBox" style="width:400px;" readonly ></td>
                                                 </tr>
                                                 <tr class="Row">
                                                     <th class="Title"><span class="Label">문서유형</span></th>
                                                     <td class="Value"><input name="DOC_TYP_CD" id="DOC_TYP_CD" title="문서유형" type="text" class="TextBox"  style="width:100px;" readonly>
											</td>
                                                     <th class="Title"><span class="Label">개정번호</span> </th>
                                                     <td class="Value"><input name="PRCDOC_RVSN_NO" id="PRCDOC_RVSN_NO" title="개정번호" type="text" class="TextBox" style="width:100px;" readonly>
                                                     <input name="PRT_NO" id="PRT_NO" title="개정번호" type="text" class="TextBox" style="width:100px;" readonly>
											</td>
                                                 </tr>
                                                 <tr class="Row">
                                                     <th class="Title"><span class="Label  Req">
                                                     시험기간
                                                     </span></th>
                                                     <td class="Value">
											<input name="CHCK_STRT_DT" id="CHCK_STRT_DT" title="점검시작일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
											<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_STRT_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
											~
											<input name="CHCK_END_DT" id="CHCK_END_DT" title="점검종료일자" type="text" style="width:80px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
											<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_END_DT')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
											</td>
                                                     <th class="Title"><span class="Label Req">시험명
                                                     </span></th>
                                                     <td class="Value"><input name="TITL_NM" id="TITL_NM" title="제목명" type="text" class="TextBox" style="width:400px;" required>
											</td>
                                                 </tr>
                                                 <tr class="Row">
                                                     <th class="Title"><span class="Label Req">점검자</span> </th>
                                                     <td class="Value">
                                                     	<input name="CHKPR_ID" id="CHKPR_ID" type="text" class="TextBox" style="width:100px;" value='${CHKPR_ID}' readonly>
                                                     	<input name="CHKPR_FNM" id="CHKPR_FNM" title="점검자" type="text" class="TextBox" style="width:100px;" value='${CHKPR_FNM}'  readonly required>
                                                    	</td>
                                                     <th class="Title"><span class="Label">오더번호</span> </th>
                                                     <td class="Value">
                                                          <input name="WRKOR_NO" id="WRKOR_NO" title="오더번호" type="text" class="TextBox" style="width:200px;">
                                                     </td>
                                                 </tr>
                                                 <tr class="Row">
                                                     <th class="Title"><span class="Label">확인자</span> </th>
                                                     <td class="Value">
                                                     	<input name="CNMR_ID" id="CNMR_ID" type="text" class="TextBox" style="width:100px;" value='' readonly>
                                                     	<input name="CNMR_FNM" id="CNMR_FNM" title="확인자" type="text" class="TextBox" style="width:100px;" value=''  readonly>
                                                     	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','3');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                                    	</td>
                                                     <th class="Title"><span class="Label">입회여부</span> </th>
                                                     <td class="Value">
                                                     	&nbsp; 입회자 <input name="ATWT_EMP_ID" id="ATWT_EMP_ID" type="text" class="TextBox" style="width:100px;" value='${ATWT_EMP_ID}' readonly>
                                                     	<input name="ATWT_FNM" id="ATWT_FNM" title="입회자" type="text" class="TextBox" style="width:100px;" value='${ATWT_FNM}'  readonly>
                                                     	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','4');"><span class='Wrap'><span class="Text">찾기</span></span></a>
                                                     </td>
                                                 </tr>
                                             </table>
								</div>			
                                         <div class="MainButtonGroup">
                                             <a class="btn-m" href="javascript:fncSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
							  		<a class="btn-m" href="javascript:history.back();"><span class="Wrap"><span class="Text">취소</span></span></a>
                                         </div>                                            						
							</div>
						</div> 										
					</div>							
					
						<!-- PAGE CONTENT ENDS -->
					</div><!-- /.col -->
				</div><!-- /.row -->
			</div><!-- /.page-content-area -->
	</form>
	</body>
</html>