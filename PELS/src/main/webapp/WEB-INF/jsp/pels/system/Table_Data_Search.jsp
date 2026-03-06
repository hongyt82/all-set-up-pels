<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
	<script type="text/javascript">
	let tableName = "";
	let count = "";
	
		$(document).ready(function () {
			fnTableList();			
		})

		function fnTableList(tableName, tableDesc) {
			let params = { 'TABLE_NAME': tableName};
			
			$.ajax({
				type: 'POST',
				url: 'Table_List.do',
				data: '',
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (data) {
					const tableList = data.tableList;
					
					let html = '<option value="">선택	</option>'
					
					for (let i = 0; i < tableList.length; i++) {
						const TBL_NAME = tableList[i].TBL_NAME;
						const TBL_DESC = fnNull(tableList[i].TBL_DESC);
						const selected = TBL_NAME == '' ? 'selected' : '';
						html += '<option ' + selected + ' value="' + TBL_NAME + '">' + (TBL_DESC == '' ? TBL_NAME : (TBL_NAME + '(' + TBL_DESC + ')')) + '</option>';
					}
					
					$('#S_TABLE_LIST').html(html);				
				},
				error: function () {
					console.log('Error occured!!')
				}
			})
		}
		
		function fnColList() {			
			let tableName = $('#S_TABLE_LIST').val();
			
			let params = { 'TABLE_NAME': tableName};
			
			$('#S_COL_NAME').attr('required', true);
			
			
			$.ajax({
				type: 'POST',
				url: 'ColList.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (data) {
 					const colList = data.colList;
					
					let html = '<option value="">전체	</option>'
					
					for (let i = 0; i < colList.length; i++) {
						const COL_NAME = colList[i].COL_NAME;
						const COL_COMMENT = fnNull(colList[i].COL_COMMENT);
						const selected = (COL_NAME == '') ? 'selected' : '';
						html += '<option ' + selected + ' value="' + COL_NAME + '">' + (COL_COMMENT == '' ? COL_NAME : (COL_NAME + '(' + COL_COMMENT + ')')) + '</option>';
					}
					
					$('#S_COL_NAME').html(html);
				},
				error: function () {
					console.log('Error occured!!')
				}
			})
		}
		
		// 테이블 조회
 		function fnSearch (page) { 			 			
			let params = new Object()
			params.TABLE_NAME = $('#S_TABLE_LIST').val();
			params.PAGE = gfnIsNull(page) ? 1 : page;
			params.STARTPAGE = $('#STARTPAGE').val();
			params.ENDPAGE = $('#ENDPAGE').val();
					
			if (params.TABLE_NAME == null || params.TABLE_NAME == "") {
				alert("테이블 목록을 선택해주세요.");
				return;
			}
			
			$('#spinner').show();
			//$('#tblDataList').html(html);
			
			$.ajax({
				type: 'POST',
				url: 'Table_Data_Ajax.do',
				data: params,
				dataType: 'JSON',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function (resultData) {
					let html = '';
					let pagingHtml = '';
					let hdr = '';					
					let th = '';
					let col = '';
					
					const STARTPAGE = resultData.STARTPAGE
					const ENDPAGE = resultData.ENDPAGE
					const PAGE = resultData.PAGE
					const TOTALPAGE = resultData.TOTALPAGE					
					const TCNT = resultData.TCNT;
					
					const header = resultData.TableHeaderList;
					const headerCnt = header.length;
					const tableData = resultData.TableDataList;
					const dataCnt = tableData.length;
					
					if (TCNT == 0) {						
						html = '<tr><td colspan="10" style="text-align: center; height: 50px;">조회된 데이터가 없습니다.</td></tr>'
					} else {						
						for (let i = 0; i < headerCnt; i++) {
							col += '<col/>';
							
							//th += '<th style="white-space: pre;">';
							th += '<th>';
							th += header[i].COL_DESC;
							th += '</th>';
						}
						
						hdr += '<thead>';
						hdr += '<tr>';
						hdr += th;
						hdr += '</tr>';
						hdr += '</thead>';
						
						//html += '<colgroup>';
						//html += col;
						//html += '</colgroup>';
						//html += '<tr class="Header">';
						//html += th;
						//html += '</tr>';
						
						html += hdr;
						html += '<tbody>';
						
						for (let j = 0; j < dataCnt; j++) {
							html += '<tr class="Item">';
							
							for (let k = 0; k < headerCnt; k++) {
								let colName = header[k].COL_NAME;
								html += '<td style="text-align: center;">' + (fnNull(tableData[j][colName]) == '' ? "" : tableData[j][colName]) + '</td>';	
							}
							
							html += '</tr>';
						}
						
						html += '</tbody>';
						
						if (PAGE == 1) pagingHtml += '<a disabled="disabled" title="첫번째 페이지"><span class="ArrowFirst_disable"></span><span class="TextButton">≪</span></a>'
						else 		   pagingHtml += '<a href="javascript:fnSearch(1);" title="첫번째 페이지"><span class="ArrowFirst"></span><span class="TextButton">≪</span></a>'
						
						pagingHtml += '<span class="Space">&nbsp;</span>'
						
						if (STARTPAGE - 1 < 1) pagingHtml += '<a disabled="disabled" title="이전 20페이지"><span class="ArrowPrev_disable"></span><span class="TextButton">&lt;</span></a>'
						else 				   pagingHtml += '<a href="javascript:fnSearch(' + (STARTPAGE - 1) + ');" title="이전 20페이지"><span class="ArrowPrev"></span><span class="TextButton">&lt;</span></a>'
						
						pagingHtml += '<span class="Space">&nbsp;</span>'
						pagingHtml += '<span class="Number">'
						
						for (let i = STARTPAGE; i <= ENDPAGE; i++) {
							if (i == PAGE) pagingHtml += '<span class="Label" style="width:30px;">' + i + '</span>'	
							else 		   pagingHtml += '<a href="javascript:fnSearch(' + i + ');" class="link" style="width:30px;">' + i + '</a>'
							
							if (i != ENDPAGE) pagingHtml += '<span class="Space">&nbsp;</span>' 
						}
						
						pagingHtml += '</span>'
						pagingHtml += '<span class="Space">&nbsp;</span>'
						
						if (ENDPAGE + 1 > TOTALPAGE) pagingHtml += '<a disabled="disabled" title="다음 20 페이지"><span class="ArrowNext_disable"></span><span class="TextButton">&gt;</span></a>'
						else 					     pagingHtml += '<a href="javascript:fnSearch(' + (ENDPAGE + 1) + ');" title="다음 20 페이지"><span class="ArrowNext"></span><span class="TextButton">&gt;</span></a>'
						
						pagingHtml += '<span class="Space">&nbsp;</span>'
						
						if (PAGE == TOTALPAGE) pagingHtml += '<a disabled="disabled" title="마지막 페이지"><span class="ArrowLast_disable"></span><span class="TextButton">≫</span></a>' 
						else 				   pagingHtml += '<a href="javascript:fnSearch(' + TOTALPAGE + ');" title="마지막 페이지"><span class="ArrowLast"></span><span class="TextButton">≫</span></a>'						
						
					}
					
					$('#totalCnt').html('총 ' + TCNT + ' 건');
					//$('#tblHeader').html(hdr);
					$('#tblDataList').html(html);
					$('#pagingDiv').html(pagingHtml);
					$('#spinner').hide();
					//syncTable();
				},
				error: function () {
					console.log('Error occured!!');
					$('#spinner').hide();
				}
			})
		}

		function fnNull (data) {
			return data = data == null ? '' : data;				
		}
		
		function syncTable () {
			const header = document.querySelectorAll('#tblHeader th');
			const bodyFirstRow = document.querySelectorAll('#tblDataList tr');
			
			if (!bodyFirstRow) return;
			
			const bodyCells = bodyFirstRow.children;
			
			for(let i = 0; i < header.length; i++) {
				const width = bodyCells[i].offsetWidth;
				header[i].style.width = width + 'px';
			}			
		}
		
		function downloadExcelFile () {
			let listCnt = $('#totalCnt').text().length;
			
			if (listCnt <= 4) {
				alert("조회된 데이터가 없습니다.");
				return;
			}
			
			let form = document.getElementById('form');
			form.TABLE_NAME.value = $('#S_TABLE_LIST').val();
			form.TABLE_DESC.value = $('#S_TABLE_LIST option:selected').text();
			form.action = '/Table_Data_Excel.do';
			form.submit();
		}
		
	</script>
	
	<style>
		
	table.Outline th {
		padding: 6px 12px;
		border: 1px solid #ccc;
		white-space: pre;
	} 

	table.Outline td {
		padding: 6px 12px;
		border: 1px solid #ccc;
		white-space: nowrap;
	}
	
	</style>
	<body class="no-skin real-skin">
			<form id="form" name="form" method="post">
			<input type="hidden" name="PAGE" value="${PAGE}">
			<input type="hidden" name="STARTPAGE" value="${STARTPAGE}"> 
			<input type="hidden" name="ENDPAGE" value="${ENDPAGE}"> 
			<input type="hidden" id="LISTCNT" name="LISTCNT" value="${LISTCNT}"> 
			<input type="hidden" name="TOTALPAGE" value="${TOTALPAGE}">
			<input type="hidden" name="TABLE_NAME" value="">
			<input type="hidden" name="TABLE_DESC" value="">
			
			<div class="page-content">
				<div class="page-content-area">
					<!-- #ection:basics/page-header -->
					<div class="page-header">
						<h1>
							<span class="title">테이블별 데이터 조회</span>
							<span>
								<ul class="breadcrumb">
									<li class="active">시스템관리</li>
									<li>
										<a href="#">테이블 현황관리</a>
									</li>
									
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
								<div class="RealSearchBox">
									<div class="NormalSearch">
										<table border="0" cellpadding="0" cellspacing="0">
											<colgroup>
												<col width="120px" />
                                                <col width="*" />
                                                <!-- <col width="120px" />
                                                <col width="200px" />
                                                <col width="*" />   -->
                                                <!-- <col width="140px" /> -->
                                                                                
 											</colgroup>  <!-- value width 설정 -->       
											<tr>
												<td class="Title"><span class="Label">테이블 목록</span></td>
												<td class="Value">
													<select id="S_TABLE_LIST" name="TABLE_LIST" onchange="fnColList()" title="테이블"></select>
												</td>																				
<!-- 												<td class="Title"><span class="Label">조건검색</span></td>
												<td class="Value" >             
													<select id="S_COL_NAME" name="COL_NAME" title="조건검색">
														<option value="">선택</option>
													</select>
												</td> -->
<%-- 		                                        <td class="Value">
		                                            <input type="text" class="TextBox" name="SH_TITL_NM" id="SH_TITL_NM" value="${SH_TITL_NM}" style="width:150px;" />
		                                        </td> --%>												
											</tr>           
										</table> 
										<a class="SearchButton" href="javascript:fnSearch();"><span class='Text'>조회</span></a>
										
									</div>
								</div>
							
								<div class="Title">
	 								<div class="TitleArea">
										<span class="SubTitle">데이터 건수</span><span id="totalCnt" class="count">총 ${TCNT} 건</span>
									</div>
									<div class="ControlArea" style="overflow-x:auto;">
									<a class="InfoButton" href="javascript:downloadExcelFile();"><span class="Text">엑셀 다운로드</span></a>
									</div>									
								</div>															
								<div class="ContentPanel" style="width: 100%;">
									<div class="StatusGrid" style="width: 100%; overflow-x: auto; overflow-y: hidden; white-space: nowrap;">															
										<!-- <table id="tblDataList" cellspacing="0" cellpadding="0" border="0" class="Outline" style="table-layout:auto; width: 100%; overflow-x:auto; white-space: nowrap;"> -->
										<table id="tblDataList" cellspacing="0" cellpadding="0" border="0" class="Outline" style="width: 100%; table-layout:auto; width: auto; border-collapse: collapse;">
										</table>
	
										<div id="pagingDiv" class="Paging" style="text-align:center;">
																									
										</div>									
									</div>
								</div>							
							</div>
							<!-- PAGE CONTENT ENDS -->
							
							<div id="spinner" class="spinner" style="display:none;">
								<i class="fas fa-spinner fa-10x fa-spin"></i>
							</div>
						</div><!-- /.col -->
					</div><!-- /.row -->
				</div><!-- /.page-content-area -->
			</div><!-- /.page-content -->
		</form>
	</body>
</html>