<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.ArrayList"%>
<%@ include file="/WEB-INF/jsp/pels/include/common.jspf"%>
<body class="no-skin real-skin real-popup">
	<div class="Header">  
		<div class="PageTitle">				
			<span class="Text"></span> 	
		</div>      
		<div class="PageButtonGroup" style="text-align:right; top: 9px;">
		</div>
	</div>
	<div class="ContentPanel">
		<div class="StatusGrid">
			<table cellspacing="0" cellpadding="0" border="0" class="Outline">
				<colgroup>
					<col class="Title" />
					<col style="width:85%" />
				</colgroup>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">FRM_UNQ_KY_VAL</span> </th>
	                <td class="Value"> ${FRM_UNQ_KY_VAL}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">USER_ID</span> </th>
	                <td class="Value"> ${USER_ID}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">USER_NM</span> </th>
	                <td class="Value"> ${USER_NM}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">PPCD</span> </th>
	                <td class="Value"> ${PPCD}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">PRCDOC_NO</span> </th>
	                <td class="Value"> ${PRCDOC_NO}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">PRCDOC_NM</span> </th>
	                <td class="Value"> ${PRCDOC_NM}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">PRCDOC_RVSN_NO</span> </th>
	                <td class="Value"> ${PRCDOC_RVSN_NO}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">ATCT_NM</span> </th>
	                <td class="Value"> ${ATCT_NM}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">ATCT_CFY</span> </th>
	                <td class="Value"> ${ATCT_CFY}
					</td>
				</tr>				
				
                <tr class="Row">
	                <th class="Title"><span class="Label Req">PDF_PATH</span> </th>
	                <td class="Value"> ${PDF_PATH}
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">FRM_OVER_JSON</span> </th>
	                <td class="Value"><textarea name="FRM_OVER_JSON" id="FRM_OVER_JSON" rows=10 cols=200>${FRM_OVER_JSON}</textarea>
					</td>
				</tr>
                <tr class="Row">
	                <th class="Title"><span class="Label Req">FRM_CONS_JSON</span> </th>
	                <td class="Value"><textarea name="FRM_CONS_JSON" id="FRM_CONS_JSON" rows=10 cols=200>${FRM_CONS_JSON}</textarea>
					</td>
				</tr>
			</table>
		</div>
	</div>
</body>
</html>

