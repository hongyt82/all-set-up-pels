<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		function fncSave () {
			if (!gfnChkReqValidation()) return
			
			if (!confirm('등록하시겠습니까?')) return
			
			let formData = new FormData()
			formData.append('GRUP_CFY_CD', '${GRUP_CFY_CD}'); 
			formData.append('BLBR_TITL_NM',  $('#BLBR_TITL_NM').val()); 
			formData.append('BLBR_CTT', $('#BLBR_CTT').val()); 
			formData.append('ATFL_FILE1', $('#ATFL_FILE1')[0].files[0]);
			$.ajax({
				type: 'POST',
				enctype: 'multipart/form-data',
				url: 'Board_Insert_Ajax.do',
				data: formData,
				processData: false,
				contentType: false,
				success: function (resultData) {
					// 성공시 메세지 출력 및 화면 재조회
					if('true' == resultData.resultCd) {
						alert(resultData.resultMsg);
						let form = document.getElementById('form')
						form.BLBR_TITL_NM.value = "";
						form.action = "Board_Search.do"
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
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
	<input name="GRUP_CFY_CD" id="GRUP_CFY_CD" type="hidden" class="TextBox" value="${GRUP_CFY_CD}" />
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<c:if test="${GRUP_CFY_CD eq 'A'}">
						<span class="title">고장신고 및 개선의견 등록</span>
						</c:if>
						<c:if test="${GRUP_CFY_CD eq 'B'}">
						<span class="title">자료실 등록</span>
						</c:if>
						<c:if test="${GRUP_CFY_CD eq 'C'}">
						<span class="title">공지사항 등록</span>
						</c:if>
						<span>
							<ul class="breadcrumb">
								<li>
									<a href="#">HELP DESK</a>
								</li>
										<c:if test="${GRUP_CFY_CD eq 'A'}">
										<li class="active">고장신고 및 개선의견</li>
										</c:if>
										<c:if test="${GRUP_CFY_CD eq 'B'}">
										<li class="active">자료실</li>
										</c:if>
										<c:if test="${GRUP_CFY_CD eq 'C'}">
										<li class="active">공지사항</li>
										</c:if>
									<c:if test="${GRUP_CFY_CD eq 'A'}">
										<li class="active">개선사항 및 고장신고 등록</li>
									</c:if>
									<c:if test="${GRUP_CFY_CD eq 'B'}">
										<li class="active">자료실 등록</li>
									</c:if>
									<c:if test="${GRUP_CFY_CD eq 'C'}">
										<li class="active">공지사항 등록</li>
									</c:if>
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
											<col style="width:100%" />
										</colgroup>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label Req">제목</span></th>
                                            <td class="Value">
												<input name="BLBR_TITL_NM" id="BLBR_TITL_NM" title="제목" type="text" class="TextBox" value="" style="width:850px;" required />
											</td>
                                        </tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label ">내용</span></th>
                                            <td class="Value"><textarea name="BLBR_CTT" id="BLBR_CTT" title="내용" rows="20" cols="150" required></textarea>
											</td>
                                          </tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label Req">첨부파일</span></th>
                                            <td class="Value"><input name="ATFL_FILE1" id="ATFL_FILE1" title="첨부 파일" type="file"  /></td>
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