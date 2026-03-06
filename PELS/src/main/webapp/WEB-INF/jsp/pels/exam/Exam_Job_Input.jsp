<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
    <style>
        .ui-widget {font-size: 1.2em;}
        .ui-state-active, .ui-widget-content .ui-state-active, .ui-widget-header .ui-state-active{
            border: 1px solid #aaa; background: #fff url("images/ui-bg_glass_65_ffffff_1x400.png") 50% 50% repeat-x;
            font-weight: normal;color: #212121;}
        .ui-state-highlight, .ui-widget-content .ui-state-highlight, .ui-widget-header .ui-state-highlight{
            border: 1px solid #fcefa1; background: #fbf9ee url("images/ui-bg_glass_55_fbf9ee_1x400.png") 50% 50% repeat-x;
            font-weight:600; color: #ff0000;
        }
        .ui-datepicker td>a.ui-state-active {background-color:#2283c5; color:#fff;}
    </style>
	<script>
		$(document).ready(function () {
			dateInit2();
			//$('#REGPR_NM').val('${REGPR_NM}');
		})
		
        function dateInit2() {
            $("#MTNG_DY"
                ).datepicker({
                onSelect: function (date, evt) {
                    if (evt.id == "incident_date") fncSetIncidentNo(3, date);
                },
                showAnimation: 'slideDown',
                showOtherMonths: true,
                selectOtherMonths: true,
                changeYear: true,
                changeMonth: true,
                /*yearSuffix: '년',*/
                dateFormat: 'yy-mm-dd', /* yy/mm/dd = 2014/12/23 */
                prevText: '이전 달',
                nextText: '다음 달',
                monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                dayNames: ['일', '월', '화', '수', '목', '금', '토'],
                dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
                dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
                showMonthAfterYear: true
            });
        }

        function fncDatePicker(id) {
            let obj = document.getElementById(id);
            if (obj != null && obj != "undefined") {
                $("#" + id).datepicker('show');
            }
        }		
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let formData = new FormData()
			formData.append('TST_UNQ_KY_VAL', $('#TST_UNQ_KY_VAL').val());
			formData.append('FORM_UNQ_KY_VAL', $('#FORM_UNQ_KY_VAL').val());
			formData.append('PRCDOC_UNQ_KY_VAL', $('#PRCDOC_UNQ_KY_VAL').val());
			formData.append('PRCDOC_NO', $('#PRCDOC_NO').val());
			formData.append('PRCDOC_NM', $('#PRCDOC_NM').val());
			formData.append('MTNG_DY', $('#MTNG_DY').val());
			formData.append('MTNG_TITL', $('#MTNG_TITL').val());
			formData.append('MTNG_HSMPR_ID', $('#MTNG_HSMPR_ID').val());
			formData.append('MTNG_PLC_NM', $('#MTNG_PLC_NM').val());
			formData.append('WRK_SCTN_NM', $('#WRK_SCTN_NM').val());
			formData.append('WRK_NM', $('#WRK_NM').val());
			formData.append('WRK_TRGT_NM', $('#WRK_TRGT_NM').val());
			formData.append('WRKOR_NO', $('#WRKOR_NO').val()); 
			formData.append('FRM_UNQ_KY_VAL', $('#FRM_UNQ_KY_VAL').val());
			formData.append('PRCDOC_VER_NO', $('#PRCDOC_VER_NO').val());
			formData.append('FRM_CFY', $('#FRM_CFY').val());

			formData.append('LOGIN_PWPL_CFY', $('#LOGIN_PWPL_CFY').val());
			formData.append('LOGIN_PPCD', $('#LOGIN_PPCD').val());
			formData.append('LOGIN_DIVS_CD', $('#LOGIN_DIVS_CD').val());
			formData.append('LOGIN_USER_ID', $('#LOGIN_USER_ID').val());
			formData.append('LOGIN_USER_NM', $('#LOGIN_USER_NM').val());
			
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Etc_Job_Insert_Ajax.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						fnSearch();
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
		
		// 결과관리 일반양식 조회
		function fnSearch() {
			let form = document.getElementById('form')
			form.action = "Exam_Monitoring.do"
			form.submit()
		}
		
		// 팝업 오픈
		function MM_openBrWindow(theURL,winName,features) { //v2.0
		  window.open(theURL,winName,features);
		}
		
		// 팝업 선택된 값 세팅
		function getReturnValue(returnValue) {
			$('#PRCDOC_UNQ_KY_VAL').val(returnValue.PRCDOC_UNQ_KY_VAL);
			$('#PRCDOC_NO').val(returnValue.PRCDOC_NO);
			$('#PRCDOC_NM').val(returnValue.PRCDOC_NM);
		}
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post" enctype="multipart/form-data">
	<input type="hidden" name="LOGIN_PWPL_CFY" id="LOGIN_PWPL_CFY" class="TextBox" value="${LOGIN_PWPL_CFY}"/>
	<input type="hidden" name="LOGIN_PPCD" id="LOGIN_PPCD" class="TextBox" value="${LOGIN_PPCD}"/>
	<input type="hidden" name="LOGIN_DIVS_CD" id="LOGIN_DIVS_CD" class="TextBox" value="${LOGIN_DIVS_CD}"/>
	<input type="hidden" name="LOGIN_USER_ID" id="LOGIN_USER_ID" class="TextBox" value="${LOGIN_USER_ID}"/>
	<input type="hidden" name="LOGIN_USER_NM" id="LOGIN_USER_NM" class="TextBox" value="${LOGIN_USER_NM}"/>
	<input type="hidden" name="FORM_UNQ_KY_VAL" id="FORM_UNQ_KY_VAL" class="TextBox" value="${FRM_UNQ_KY_VAL}"/>
	<input type="hidden" name="PRCDOC_CFY" id="PRCDOC_CFY" class="TextBox" value="${PRCDOC_CFY}"/>
	
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<span class="title">작업전회의 등록</span>
						<span>
							<ul class="breadcrumb">
								<li>
									<a href="#">작업전회의</a>
								</li>
								<li class="active">작업전회의 등록</li>
							</ul><!-- /.breadcrumb -->
						</span>
					</h1>
				</div><!-- /page-header -->
				<!-- #section:basics/page-button -->
				
				<!-- /page-button-->
				<div class="row">
					<div class="col-xs-12">
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
										<colgroup>
											<col class="Title" />
											<col style="width:30%" />
											<col class="Title" />
											<col style="width:70%" />
										</colgroup>
                                             <tr class="Row">
                                                <th class="Title"><span class="Label Req">절차서 번호</span> </th>
                                                <td class="Value">${PRCDOC_NO}
											  	</td>
                                                <th class="Title"><span class="Label Req">개정번호</span></th>
                                                <td class="Value">${PRCDOC_RVSN_NO}
											  	</td>
                                             </tr>
                                            <tr class="Row">
                                                <th class="Title"><span class="Label Req">작업부서</span></th>
                                                <td class="Value">
													<input name="WRK_SCTN_NM" id="WRK_SCTN_NM" title="작업부서" type="text" class="TextBox" value="" style="width:90%;" required />
											 	</td>
                                                 <th class="Title"><span class="Label Req">회의주관자</span></th>
                                                 <td class="Value">
													<input name="MTNG_HSMPR_ID" id="MTNG_HSMPR_ID" title="회의주관자" type="text" class="TextBox" value="" style="width:100px;"/>
											  	</td>
                                            </tr>
                                        	<tr class="Row">
		                                		<th class="Title"><span class="Label Req">작업호기</span></th>
		                                		<td class="Value">
													<input name="PRCDOC_VER_NO" id="PRCDOC_VER_NO" title="작업호기" type="text" class="TextBox" value="" style="width:10%;"/>
							  					</td>
                                                <th class="Title"><span class="Label Req">오더번호</span> </th>
                                                <td class="Value">
													<input name="WRKOR_NO" id="WRKOR_NO" type="text" title="오더번호" class="TextBox" value="" style="width:200px;" />
											  	</td>
                                            </tr>
                                             <tr class="Row">
	                                            <th class="Title"><span class="Label Req">회의날짜</span></th>
	                                            <td class="Value">
													<input name="MTNG_DY" id="MTNG_DY" title="회의날짜" type="text" class="TextBox" value="" style="width:100px;" required readonly/>
													<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('MTNG_DY')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
										  		</td>
                                                <th class="Title"><span class="Label Req">작업내용</span> </th>
                                                <td class="Value">
													<input name="WRK_NM" id="WRK_NM" type="text" title="작업내용" class="TextBox" value="" style="width:90%;" />
											  	</td>
                                             </tr>
                                             <tr class="Row">
                                                <th class="Title"><span class="Label Req">회의장소</span> </th>
                                                <td class="Value">
													<input name="MTNG_PLC_NM" id="MTNG_PLC_NM" title="회의장소" type="text" class="TextBox" value="" style="width:90%;" />
											  	</td>
                                                <th class="Title"><span class="Label Req">작업범위</span></th>
                                                <td class="Value">
													<input name="WRK_TRGT_NM" id="WRK_TRGT_NM" title="작업범위" type="text" class="TextBox" value="" style="width:90%;"/>
													<input name="TST_UNQ_KY_VAL" id="TST_UNQ_KY_VAL" type="hidden" class="TextBox" value="${TST_UNQ_KY_VAL}" />
													<input name="FRM_CFY" id="FRM_CFY" title="주기" type="hidden" class="TextBox" value="${FRM_CFY}" />
											  	</td>
                                             </tr>
                                             <tr class="Row">
                                                <th class="Title"><span class="Label Req">구분</span> </th>
                                                <td class="Value">
													<select name="FRM_UNQ_KY_VAL" id="FRM_UNQ_KY_VAL" title="작업전회의 구분" required>
															<option value="">== 선택 ==</option>
														<c:forEach var="etcFormList" items="${etcFormList}" begin="0" end="${etcFormList.size()}" step="1">
															<option value="${etcFormList.FRM_UNQ_KY_VAL}">${etcFormList.FRM_NM}</option>
														</c:forEach>
													</select>
											  	</td>
                                                <th class="Title"><span class="Label Req"></span></th>
                                                <td class="Value">
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