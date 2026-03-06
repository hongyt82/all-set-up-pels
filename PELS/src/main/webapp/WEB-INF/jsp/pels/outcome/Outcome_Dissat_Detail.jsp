<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		// 절차서관리 조회
		function fnSearch () {
			let form = document.getElementById('form')
			var PRCDOC_CFY = form.PRCDOC_CFY.value;
			if (PRCDOC_CFY == "")  
				form.action = "Outcome_Dissat_Search.do"
			else 
				form.action = "Outcome_Search.do"
			form.submit()
		}		
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('저장하시겠습니까?')) return
			
			let params = new Object()
			params.UNQ_KY_VAL = $('#UNQ_KY_VAL').val();
			params.TST_UNQ_KY_VAL = $('#TST_UNQ_KY_VAL').val();
			params.PPCD = $('#PPCD').val();
			params.SAP_SNO = $('#SAP_SNO').val();
			params.OCCR_DY = $('#OCCR_DY').val();
			params.PRCDOC_NO = $('#PRCDOC_NO').val();
			params.PRCDOC_NM = $('#PRCDOC_NM').val();
			params.TST_BSS_CTT = $('#TST_BSS_CTT').val();
			params.TST_HMDPT_NM = $('#TST_HMDPT_NM').val();
			params.CHKPR_ID = $('#CHKPR_ID').val();
			params.CHKPR_FNM = $('#CHKPR_FNM').val();
			params.TST_DSSTN_CTT = $('#TST_DSSTN_CTT').val();
			params.MNMT_CTT = $('#MNMT_CTT').val();
			params.NOTN_NO = $('#NOTN_NO').val();
			params.PBLSH_DY = $('#PBLSH_DY').val();
			params.WRK_SCTN_NM = $('#WRK_SCTN_NM').val();
			params.TSP_CTT = $('#TSP_CTT').val();
			
			$.ajax({
				type: 'POST',
				url: 'Outcome_Dissat_Update_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						var PRCDOC_CFY = form.PRCDOC_CFY.value;
						if (PRCDOC_CFY == "")  
							form.action = "Outcome_Dissat_Search.do"
						else 
							form.action = "Outcome_Search.do"
						form.submit()
					} else {
						alert('저장에 실패하였습니다.');
						console.log('Save Fail!!');
					}
				},
				error: function () {
					alert('저장에 실패하였습니다.');
					console.log('Error occured!!');
				}
			})
		}
		
		function MM_openBrWindow(theURL,winName,features, flag) {
			  gflag = flag;
			  window.open(theURL,winName,features);
			}
			
			// 팝업 선택된 값 세팅
			function getReturnValue(returnValue) {
				$('#FRM_UNQ_KY_VAL').val(returnValue.FRM_UNQ_KY_VAL);
				$('#PRCDOC_NO').val(returnValue.PRCDOC_NO);
				$('#PRCDOC_NM').val(returnValue.PRCDOC_NM);
				$('#DOC_TYP').val(returnValue.DOC_TYP);
				$('#PRCDOC_RVSN_NO').val(returnValue.PRCDOC_RVSN_NO);
			}
			
			function getUserReturnValue(returnValue) {
				if(gflag == 2) {
					$('#CHKPR_ID').val(returnValue.USER_ID);
					$('#CHKPR_FNM').val(returnValue.USER_NAME);
				} else if(gflag == 3) {
					$('#CNMR_ID').val(returnValue.USER_ID);
					$('#CNMR_FNM').val(returnValue.USER_NAME);
				} else if(gflag == 4) {
					$('#ATWT_ID').val(returnValue.USER_ID);
					$('#ATWT_FNM').val(returnValue.USER_NAME);
				}
				
			}
		
	</script>
<body class="no-skin real-skin"  onload="dateInit();">
	<form id="form" name="form" method="post">
	<input name="PRCDOC_CFY" id="PRCDOC_CFY" type="hidden" class="TextBox" value="${PRCDOC_CFY}" />
	<input name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" type="hidden" class="TextBox" value="${TST_UNQ_KY_VAL}" />
	<input name="PPCD" id="PPCD" type="hidden" class="TextBox" value="${PPCD}" />
	<input name="UNQ_KY_VAL" id="UNQ_KY_VAL" type="hidden" class="TextBox" value="${DissatDetail.UNQ_KY_VAL}" />
	<div class="page-content">
		<div class="page-content-area">
			<!-- #ection:basics/page-header -->
			<div class="page-header">
				<h1>
					<span class="title">불만족보고서 등록</span>
					<span>
						<ul class="breadcrumb">
							<li class="">정주기시험</li>
							<li class="">불만족보고서</li>
							<li class="active">불만족보고서 등록</li>
						</ul><!-- /.breadcrumb -->
					</span>
				</h1>

			</div><!-- /page-header -->
			<!-- #section:basics/page-button -->
			
			<!-- /page-button-->
			<div class="row">
				<div class="col-xs-12">
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
	                                     <td class="Value">
	                                     	${PRCDOC_NO}
	                                    	</td>
	                                     <th class="Title"><span class="Label">절차서명</span></th>
	                                     <td class="Value">
	                                     	${PRCDOC_NM}
	                                     </td>
	                                     <th class="Title"><span class="Label">시험명</span></th>
	                                     <td class="Value">
	                                     	${TITL_NM}
	                                     </td>
	                                 </tr>
	                                 </table>
						</div>	
					</div><br>				
					<!-- PAGE CONTENT BEGINS -->	
					<div class="RealPanel"  style="width:900px;">
					
							<div class="Title">
								<div class="TitleArea">
									<span class="SubTitle"></span>
								</div>
								<div class="ControlArea"><span class="Label Req">표시는 필수입력항목입니다.</span></div>
							</div>
							<div class="ContentPanel">
								<div class="GridWrite">       
									<table cellspacing="0" cellpadding="0" border="0" class="Outline">
									<colgroup>
										<col class="Title" />
										<col style="width:50%" />
										<col class="Title" />
										<col style="width:50%" />
									</colgroup>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">일련번호</span> </th>
                                           <td class="Value">
											<input name="SAP_SNO" id="SAP_SNO" title="일련번호" type="text" class="TextBox" value="${DissatDetail.SAP_SNO}" style="width:200px;" required />
										</td>
                                           <th class="Title"><span class="Label Req">발생일시</span> </th>
                                           <td class="Value">
                                           <input name="OCCR_DY" id="OCCR_DY" type="text" style="width:80px;" class="TextBox" value="${DissatDetail.OCCR_DY}" onkeypress="fnOnKeyPress();"/>
										   <a class="IconButton"><span class='Calendar' onclick="fncDatePicker('OCCR_DY')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
										</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">절차서번호</span></th>
                                           <td class="Value">
											<input name="PRCDOC_NO" id="PRCDOC_NO" title="식별자" type="text" class="TextBox" value="${DissatDetail.PRCDOC_NO}" style="width:200px;" required />
										</td>
                                           <th class="Title"><span class="Label Req">절차서제목</span></th>
                                           <td class="Value">
											<input name="PRCDOC_NM" id="PRCDOC_NM" title="식별자" type="text" class="TextBox" value="${DissatDetail.PRCDOC_NM}" style="width:100%;" required />
										</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">시험근거</span></th>
                                           <td class="Value" colspan="3">
											<input name="TST_BSS_CTT" id="TST_BSS_CTT" title="식별자" type="text" class="TextBox" value="${DissatDetail.TST_BSS_CTT}" style="width:100%;" required />
										</td>
                                       </tr>
                                       <tr class="Row">
                                           	<th class="Title"><span class="Label Req">시험주관부서</span></th>
                                           	<td class="Value">
											<input name="TST_HMDPT_NM" id="TST_HMDPT_NM" title="식별자" type="text" class="TextBox" value="${DissatDetail.TST_HMDPT_NM}" style="width:100%;" required />
											</td>
                                           	<th class="Title"><span class="Label Req">시험실시자</span></th>
                                           	<td class="Value">
                                             	<input name="CHKPR_ID" id="CHKPR_ID" type="text" class="TextBox" style="width:100px;" value='${DissatDetail.CHKPR_ID}' readonly>
                                             	<input name="CHKPR_FNM" id="CHKPR_FNM" title="점검자" type="text" class="TextBox" style="width:100px;" value='${DissatDetail.CHKPR_FNM}'  readonly required>
                                             	<a class="InfoButton" href="javascript:MM_openBrWindow('User_Popup.do?PPCD=233','UserPopup','width=1000,height=600','2');"><span class='Wrap'><span class="Text">찾기</span></span></a>
											</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">시험불만족<br>내용</span></th>
                                           <td class="Value" colspan="3">
											<textarea name="TST_DSSTN_CTT" id="TST_DSSTN_CTT" rows="5" cols="124">${DissatDetail.TST_DSSTN_CTT}</textarea>
										</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">시험주관부서<br>조치사항</span></th>
                                           <td class="Value" colspan="3">
											<textarea name="MNMT_CTT" id="MNMT_CTT" rows="5"  class="" cols="124">${DissatDetail.MNMT_CTT}</textarea>
										</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">통지번호</span></th>
                                           <td class="Value">
											<input name="NOTN_NO" id="NOTN_NO" title="식별자" type="text" class="TextBox" value="${DissatDetail.NOTN_NO}" style="width:90%;" required />
										</td>
                                           <th class="Title"><span class="Label Req">발행일</span></th>
                                           <td class="Value">
                                           <input name="PBLSH_DY" id="PBLSH_DY" type="text" style="width:80px;" class="TextBox" value="${DissatDetail.PBLSH_DY}" onkeypress="fnOnKeyPress();"/>
										   <a class="IconButton"><span class='Calendar' onclick="fncDatePicker('PBLSH_DY')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
										</td>
                                       </tr>
                                       <tr class="Row">
                                           <th class="Title"><span class="Label Req">운영<br>기술지침서<br>사항</span></th>
                                           <td class="Value" colspan="3">
											<textarea  name="TSP_CTT" id="TSP_CTT" rows="5" cols="124">${DissatDetail.TSP_CTT}</textarea>
										</td>
                                       </tr>
                                        </table>
									</div>			
                                    <div class="MainButtonGroup">
                                    	<a class="btn-m" href="javascript:fncSave();"><span class="Wrap"><span class="Text">저장</span></span></a>                        
									  	<a class="btn-m" href="javascript:fnSearch();"><span class="Wrap"><span class="Text">취소</span></span></a>
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