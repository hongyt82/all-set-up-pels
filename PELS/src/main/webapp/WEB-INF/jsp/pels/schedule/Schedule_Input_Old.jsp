<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
			$('#CHCK_DY').val('${CHCK_DY}');
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (confirm('등록하시겠습니까?')) {
				let form = document.getElementById('form')
				
				form.action = 'Schedule_Insert.do'
				form.submit()				
			}
		}
	</script>
	<body class="no-skin real-skin" onload="dateInit();">
		<form id="form" name="form" method="post">
			<div class="page-content">
				<div class="page-content-area">
					<!-- #ection:basics/page-header -->
					<div class="page-header">
						<h1>
							<span class="title">정주기시험일정 등록</span>
							<span>
								<ul class="breadcrumb">
									<li>
										<a href="#">일정관리</a>
									</li>
                                    <li>
                                        <a href="Schedule_Search.do">정주기시험 일정</a>
                                    </li>
									<li class="active">정주기시험일정 등록</li>
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
                                                       <th class="Title"><span class="Label Req">시험일자</span> </th>
                                                       <td class="Value">
														<input name="CHCK_DY" id="CHCK_DY" title="시험일자" type="text" style="width:100px;" class="TextBox" value="" onkeypress="fnOnKeyPress();" required/>
														<a class="IconButton"><span class='Calendar' onclick="fncDatePicker('CHCK_DY')">&nbsp;</span><span class='Text'>&nbsp;</span></a>
													</td>
                                                       <th class="Title"><span class="Label Req">담당자</span></th>
                                                       <td class="Value">
														<input name="CHKPR_FNM" id="CHKPR_FNM" title="담당자" type="text" class="TextBox" value="" style="width:80px;" required/>
													</td>
                                                   </tr>
                                                   <tr class="Row">
                                                       <th class="Title"><span class="Label Req">절차서번호</span> </th>
                                                       <td class="Value">
														<input name="PRCDOC_NO" id="PRCDOC_NO" title="절차서번호" type="text" class="TextBox" value="" style="width:200px;" required/>
													</td>
                                                       <th class="Title"><span class="Label Req">절차서명</span></th>
                                                       <td class="Value">
														<input name="PRCDOC_TITL" id="PRCDOC_TITL" title="절차서명" type="text" class="TextBox" value="" style="width:90%;" required/>
													</td>
                                                   </tr>
                                                   <tr class="Row">
                                                       <th class="Title"><span class="Label Req">주기</span></th>
                                                       <td class="Value">
														<select name="RRD_CFY" id="RRD_CFY" title="주기" style="width:100px;" required>
															<option value="일">일</option>
															<option value="주">주</option>
															<option value="월">월</option>
															<option value="분기">분기</option>
															<option value="년">년</option>
															<option value="OH">OH</option>
															<option value="기타">기타</option>
														</select>															
													</td>
                                                       <th class="Title"><span class="Label Req">등록자</span> </th>
                                                       <td class="Value">
														<input name="REGPR_NM" id="REGPR_NM" title="등록자" type="text" class="TextBox" value="" style="width:80px;" required/>
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
			<!-- /.page-content -->
		</form>
	</body>
</html>