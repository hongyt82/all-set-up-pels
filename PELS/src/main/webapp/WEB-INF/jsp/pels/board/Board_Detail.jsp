<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script>
		$(document).ready(function () {
		})
		
		function fnDownLoad(ATFL_PHCL_NM, ATFL_ORSRC_NM)
		{
			let form = document.getElementById('form')
			form.action = "FileDownload.do";
			form.ATFL_PHCL_NM.value = ATFL_PHCL_NM;
			form.ATFL_ORSRC_NM.value = ATFL_ORSRC_NM;
			form.submit()
		}		
	</script>
<body class="no-skin real-skin">
	<form id="form" name="form" method="post">
	<input name="GRUP_CFY_CD" id="GRUP_CFY_CD" type="hidden" class="TextBox" value="${GRUP_CFY_CD}" />
	<input name="BLBR_UNQ_KY_VAL" id="BLBR_UNQ_KY_VAL" type="hidden" class="TextBox" value="${BLBR_UNQ_KY_VAL}" />
    <input type="hidden" class="TextBox" name="ATFL_PHCL_NM" id="ATFL_PHCL_NM" value=""/>
    <input type="hidden" class="TextBox" name="ATFL_ORSRC_NM" id="ATFL_ORSRC_NM" value=""/>
	
		<div class="page-content">
			<div class="page-content-area">
				<!-- #ection:basics/page-header -->
				<div class="page-header">
					<h1>
						<c:if test="${GRUP_CFY_CD eq 'A'}">
						<span class="title">고장신고 및 개선의견 상세</span>
						</c:if>
						<c:if test="${GRUP_CFY_CD eq 'B'}">
						<span class="title">자료실 상세</span>
						</c:if>
						<c:if test="${GRUP_CFY_CD eq 'C'}">
						<span class="title">공지사항 상세</span>
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
								
                                      <li>
                                      </li>
									<c:if test="${GRUP_CFY_CD eq 'A'}">
										<li class="active">개선사항 및 고장신고 상세</li>
									</c:if>
									<c:if test="${GRUP_CFY_CD eq 'B'}">
										<li class="active">자료실 상세</li>
									</c:if>
									<c:if test="${GRUP_CFY_CD eq 'C'}">
										<li class="active">공지사항 상세</li>
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
												<input name="BLBR_TITL_NM" id="BLBR_TITL_NM" title="제목" type="text" class="TextBox" value="${boardDetail.BLBR_TITL_NM}" style="width:850px;" required readonly/>
											</td>
                                        </tr>
                                        <tr class="Row">
                                            <th class="Title"><span class="Label ">내용</span></th>
                                            <td class="Value"><textarea name="BLBR_CTT" id="BLBR_CTT" title="내용" rows="20" cols="150" required  readonly>${boardDetail.BLBR_CTT}</textarea>
											</td>
                                          </tr>
										<c:choose>
											<c:when test="${null ne boardDetail.FNAME1}">
		                                        <tr class="Row">
		                                            <th class="Title" row=2><span class="Label">첨부파일</span></th>
		                                            <td class="Value"><a href="javascript:fnDownLoad('${boardDetail.FNAME1}','${boardDetail.ONAME1}');">${boardDetail.ONAME1}</a></td>
		                                        </tr>
											</c:when>
										</c:choose>
										
                                        </table>
									</div>			
                                    <div class="MainButtonGroup">
								  		<a class="btn-m" href="javascript:history.back();"><span class="Wrap"><span class="Text">이전</span></span></a>
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