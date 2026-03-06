<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script type="text/javascript">
	let tableName = "";
		$(document).ready(function () {
		})
		
		// 테이블 조회
		function fnSearch () {
			let form = document.getElementById('form')
			form.action = "Table_Search.do"
			form.target = "_self";
			form.submit()
		}
		
		function fnPage (page) {
			let form = document.getElementById('form')
			form.PAGE.value = page;
			form.action = "Sign_Search.do"
			form.target = "_self";
			form.submit()
		}	

		function tableDetail(tableName, tableDesc) {
			let params = { 'TABLE_NAME': tableName }
			
			$.ajax({
				type: 'POST',
				url: 'Table_Detail_Search.do',
				data: params,
				dataType: 'json',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (data) {
					if (data.result == "success") {
						const listCnt = data.tableDetail.length;
						
						$("#detailTable").empty();
						
						let rows = "";
						
						
						for (let i = 0; i < listCnt; i++) {
							rows += '<tr class="Item">'
							rows += '<td>' + (data.tableDetail[i].LISTNUM == null ? "" : data.tableDetail[i].LISTNUM) + '</td>'
							rows += '<td>' + (data.tableDetail[i].COL_NAME == null ? "" : data.tableDetail[i].COL_NAME) + '</td>'
							rows += '<td>' + (data.tableDetail[i].COL_COMMENT == null ? "" : data.tableDetail[i].COL_COMMENT) + '</td>'
							rows += '<td>' + (data.tableDetail[i].DATA_TYPE == null ? "" : data.tableDetail[i].DATA_TYPE) + '</td>'
							rows += '<td>' + (data.tableDetail[i].COL_LEN == null ? "" : data.tableDetail[i].COL_LEN) + '</td>'
							rows += '<td>' + (data.tableDetail[i].NULL_YN == null ? "" : data.tableDetail[i].NULL_YN) + '</td>'
							rows += '<td>' + (data.tableDetail[i].ROW_CNT == null ? "" : data.tableDetail[i].ROW_CNT) + '</td>'
							rows += '<td>' + (data.tableDetail[i].CNT_PER == null ? "" : data.tableDetail[i].CNT_PER) + '</td>'
							rows += '</tr>'
						}
						
						/*
						$.each(data.tableDetail, function(index, item) {
								rows += `
										<tr>
										<td>${data.tableDetail.LISTNUM}</td>
										<td>${item.COL_NAME}</td>
										<td>${item.COL_COMMENT}</td>
										<td>${item.DATA_TYPE}</td>
										<td>${item.COL_LEN}</td>
										<td>${item.NULL_YN}</td>	
										<td>${item.ROW_CNT}</td>
										<td>${item.CNT_PER}</td>							
										</tr>
										`;	
										
							});
						*/
						$("#detailTable").append(rows);
					} else {
							
					}
				},
				error: function () {
					console.log('Error occured!!')
				}
			})
		}
		
	</script>
	
	<style>
	.container {
		display : flex;
		width: 100%;
		height:700px;
	}
	
	.left-panel {
		width: 30%;
		overflow-y: auto;
		padding: 10px;
		
	}
	
	.right-panel {
		width:  70%;
		//padding: 10px;
		overflow: auto;
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
	}
	
	th {
		border: 1px solid #ccc;
		padding:  8px;
		text-align: center;
		position: sticky;		
	}
	
	td {
		border: 1px solid #ccc;
		padding:  8px;
		text-align: center;		
	}
	
	tr:hover {
		background-color: #f2f2f2;
		cursor: pointer;
	}
	
	</style>
	<body class="no-skin real-skin">
			<form id="form" name="form" method="post">
			<input type="hidden" name="PAGE" value="${PAGE}">
			<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
			<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
			<input type="hidden" name="LISTCNT" value="${LISTCNT}"> 
			<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
				<div class="page-content">
					<div class="page-content-area">
						<!-- #ection:basics/page-header -->
						<div class="page-header">
							<h1>
								<span class="title">테이블 구조조회</span>
								<span>
									<ul class="breadcrumb">
										<li>
											<a href="#">시스템관리</a>
										</li>
										<li class="active">테이블 현황관리</li>
									</ul><!-- /.breadcrumb -->
								</span>
							</h1>
						</div><!-- /page-header -->
						<!-- #section:basics/page-button -->
						<div class="PageButtonGroup" style="text-align:right">
                            <!-- <a class="btn-m" href="javascript:fnDelete();"><span class="Text">삭제</span></a> -->                            
						</div>
						</div>
						<!-- /page-button-->
						<div class="Title">
							<div class="TitleArea" style="width: 30%; text-align: right; padding-bottom: 10px;">
								<span class="SubTitle"></span><span class="count">총 ${TCNT} 건</span>
							</div>
						</div>			
						<div class="container">
						<div class="left-panel">
							<div class="col-xs-12">					
 								<%-- <div style="text-align: right; padding-bottom: 8px;">
									<span ></span><span class="count">총 ${TCNT} 건</span>
								</div> --%>																					
							 	<table border="0" cellpadding="0" cellspacing="0">
								 	<tr valign="top">
									 	<td>
											<div class="RealPanel">												
												<div class="DualPanel">
													<div class="ContentPanel">
														<div class="StatusGrid">
															<table cellspacing="0" cellpadding="0" border="0" class="Outline">
																<colgroup>
																	<col width="50px" />
				                                                    <col width="150px" />
				                                                    <col width="150px" />
				                                                    <!-- <col width="*" /> -->
																</colgroup>
																<tr class="Header">
																	<th>No</th>
																	<th>테이블명</th>
																	<th>테이블 내용</th>
																</tr>
																<c:forEach var="table" items="${tableList}" begin="0" end="${tableList.size()}" step="1">
																	<tr class="Item" onclick="tableDetail('${table.TBL_NAME}', '${table.TBL_DESC}')">
																		<td align="center">${table.LISTNUM}</td>
																		<td align="center">${table.TBL_NAME}</td>
																		<td align="center">${table.TBL_DESC}</td>																											
																	</tr>
																</c:forEach>
																<c:if test="${tableList.size() eq 0}">
																	<tr class="Item">
																		<td colspan="3" style="text-align: center;">조회된 자료가 없습니다.</td>
																	</tr>
																</c:if>
															</table>
														</div>
													</div>
												</div>
											</div>
										</td>			
									</tr>
								</table>
								<!-- PAGE CONTENT ENDS -->
							</div><!-- /.col -->
						</div><!-- /.row -->
						
						<div class="right-panel">
							<div class="col-xs-12">
							 	<table border="0" cellpadding="0" cellspacing="0">
								 	<tr valign="top">									 	
										<td>
											<div class="RealPanel">
												<div class="DualPanel">
												<div class="ContentPanel">
													<div class="StatusGrid">
														<table cellspacing="0" cellpadding="0" border="0" class="Outline">
															<colgroup>
																<col width="50px" />
			                                                    <col width="200px" />
			                                                    <col width="200px" />
			                                                    <col width="150px" />
			                                                    <col width="100px" />
			                                                    <col width="50px" />
			                                                    <col width="100px" />
			                                                    <col width="70px" />
			                                                    <!-- <col width="*" /> -->
															</colgroup>
															<tr class="Header">
																<th>No</th>
																<th>필드명</th>
																<th>필드내용</th>
																<th>필드Type</th>
																<th>길이</th>
																<th>NULL</th>
																<th>Count</th>
																<th>%</th>
															</tr>
															<tbody id="detailTable"></tbody>
<%-- 															<c:forEach var="tableDetail" items="${TableDetail}" begin="0" end="${TableDetail.size()}" step="1">
																<tr class="Item">
																	<td align="center">${tableDetail.LISTNUM}</td>
																	<td align="center">${tableDetail.COL_NAME}</td>
																	<td align="center">${tableDetail.COL_COMMENT}</td>
																	<td align="center">${tableDetail.DATA_TYPE}</td>
																	<td align="center">${tableDetail.COL_LEN}</td>
																	<td align="center">${tableDetail.NULL_YN}</td>	
																	<td align="center">${tableDetail.ROW_CNT}</td>
																	<td align="center">${tableDetail.CNT_PER}</td>
																</tr>
															</c:forEach>
															<c:if test="${TableDetail.size() eq 0}">
																<tr class="Item">
																	<td colspan="3" style="text-align: center;">조회된 자료가 없습니다.</td>
																</tr>
															</c:if> --%>
														</table>
													</div>
												</div>
												</div>
											</div>
										</td>			
									</tr>
								</table>
								<!-- PAGE CONTENT ENDS -->
							</div><!-- /.col -->
						</div><!-- /.row -->	
						</div>					
					<!-- /.page-content-area -->
				</div><!-- /.page-content -->
			</form>
	</body>
</html>